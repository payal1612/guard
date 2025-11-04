from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from openai import AsyncOpenAI
import asyncio
import requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VerifyRequest(BaseModel):
    content: str
    url: Optional[str] = None

class VerificationResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    content: str
    url: Optional[str] = None
    result: str  # "Real", "Fake", "Misleading"
    confidence: float
    evidence: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TrendingNews(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    source: str
    status: str
    confidence: float
    verified_at: datetime

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"email": email}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def analyze_news_with_ai(content: str, url: Optional[str] = None) -> dict:
    """Analyze news content using OpenAI GPT-4o-mini for fake news detection"""
    try:
        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            raise Exception("OpenAI API key not configured")
        
        client = AsyncOpenAI(api_key=api_key)
        
        system_message = """You are an expert fact-checker and fake news detector. Analyze the given news content and provide:
1. Classification: Real, Fake, or Misleading
2. Confidence score (0-100)
3. Evidence and reasoning for your classification

Provide your response in this exact format:
CLASSIFICATION: [Real/Fake/Misleading]
CONFIDENCE: [0-100]
EVIDENCE: [Your detailed reasoning and evidence]"""
        
        prompt = f"Analyze this news content for authenticity:\n\n{content}"
        if url:
            prompt += f"\n\nSource URL: {url}"
        
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        response_text = response.choices[0].message.content.strip()
        
        # Parse the response
        lines = response_text.split('\n')
        classification = "Misleading"
        confidence = 50.0
        evidence = "Unable to fully analyze the content."
        
        for line in lines:
            if line.startswith("CLASSIFICATION:"):
                classification = line.split(":", 1)[1].strip()
            elif line.startswith("CONFIDENCE:"):
                try:
                    confidence = float(line.split(":", 1)[1].strip())
                except:
                    confidence = 50.0
            elif line.startswith("EVIDENCE:"):
                evidence = line.split(":", 1)[1].strip()
        
        # If evidence wasn't parsed correctly, use the whole response
        if evidence == "Unable to fully analyze the content." and len(response_text) > 50:
            parts = response_text.split("EVIDENCE:", 1)
            if len(parts) > 1:
                evidence = parts[1].strip()
            else:
                evidence = response_text
        
        return {
            "result": classification,
            "confidence": confidence,
            "evidence": evidence
        }
    except Exception as e:
        logging.error(f"AI analysis error: {str(e)}")
        return {
            "result": "Misleading",
            "confidence": 0.0,
            "evidence": f"Analysis failed: {str(e)}"
        }

# Routes
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user = User(
        email=user_data.email,
        name=user_data.name
    )
    user_dict = user.model_dump()
    user_dict['password_hash'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Create token
    token = create_access_token({"sub": user.email})
    
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name
        }
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": credentials.email})
    
    return {
        "token": token,
        "user": {
            "id": user['id'],
            "email": user['email'],
            "name": user['name']
        }
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user['id'],
        "email": current_user['email'],
        "name": current_user['name']
    }

@api_router.post("/verify")
async def verify_news(request: VerifyRequest, current_user: dict = Depends(get_current_user)):
    # Analyze with AI
    analysis = await analyze_news_with_ai(request.content, request.url)
    
    # Create verification result
    result = VerificationResult(
        user_id=current_user['id'],
        content=request.content,
        url=request.url,
        result=analysis['result'],
        confidence=analysis['confidence'],
        evidence=analysis['evidence']
    )
    
    result_dict = result.model_dump()
    result_dict['timestamp'] = result_dict['timestamp'].isoformat()
    
    await db.verifications.insert_one(result_dict)
    
    return result

@api_router.get("/history", response_model=List[VerificationResult])
async def get_history(current_user: dict = Depends(get_current_user)):
    verifications = await db.verifications.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(100)
    
    for verification in verifications:
        if isinstance(verification['timestamp'], str):
            verification['timestamp'] = datetime.fromisoformat(verification['timestamp'])
    
    return verifications

@api_router.get("/trending", response_model=List[TrendingNews])
async def get_trending():
    # Get recent verifications from all users
    verifications = await db.verifications.find(
        {},
        {"_id": 0}
    ).sort("timestamp", -1).limit(20).to_list(20)
    
    trending = []
    for v in verifications:
        # Extract title from content (first 100 chars)
        title = v['content'][:100] + "..." if len(v['content']) > 100 else v['content']
        source = v.get('url') or 'User Submission'
        
        trending_item = TrendingNews(
            title=title,
            source=source,
            status=v['result'],
            confidence=v['confidence'],
            verified_at=datetime.fromisoformat(v['timestamp']) if isinstance(v['timestamp'], str) else v['timestamp']
        )
        trending.append(trending_item)
    
    return trending

@api_router.get("/news")
async def get_real_news(category: Optional[str] = "general", page: int = 1):
    """Fetch real-time news from NewsAPI"""
    try:
        news_api_key = os.environ.get('NEWS_API_KEY')
        if not news_api_key:
            raise HTTPException(status_code=500, detail="News API key not configured")
        
        # NewsAPI endpoint for top headlines
        url = "https://newsapi.org/v2/top-headlines"
        
        params = {
            "apiKey": news_api_key,
            "country": "us",
            "pageSize": 20,
            "page": page
        }
        
        # Add category filter if not "all"
        if category and category != "all":
            params["category"] = category
        
        response = requests.get(url, params=params)
        
        if response.status_code != 200:
            logging.error(f"NewsAPI error: {response.text}")
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch news")
        
        data = response.json()
        
        if data.get("status") != "ok":
            raise HTTPException(status_code=500, detail="NewsAPI returned error")
        
        articles = data.get("articles", [])
        
        # Format articles
        formatted_articles = []
        for article in articles:
            formatted_articles.append({
                "title": article.get("title", "No title"),
                "description": article.get("description", ""),
                "url": article.get("url", ""),
                "urlToImage": article.get("urlToImage", ""),
                "publishedAt": article.get("publishedAt", ""),
                "source": article.get("source", {}),
                "category": category if category != "all" else "general"
            })
        
        return {
            "articles": formatted_articles,
            "totalResults": data.get("totalResults", 0)
        }
        
    except requests.RequestException as e:
        logging.error(f"News API request error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch news from external API")
    except Exception as e:
        logging.error(f"News fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

class ChatbotRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

class NewsArticle(BaseModel):
    title: str
    description: Optional[str]
    url: str
    urlToImage: Optional[str]
    publishedAt: str
    source: dict
    category: Optional[str] = "general"

@api_router.post("/chatbot")
async def chatbot(request: ChatbotRequest):
    """Chatbot endpoint trained on TruthGuard platform knowledge"""
    try:
        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            raise Exception("OpenAI API key not configured")
        
        client = AsyncOpenAI(api_key=api_key)
        
        system_message = """You are TruthGuard Assistant, a helpful AI chatbot for the TruthGuard fake news detection platform.

ABOUT TRUTHGUARD:
- TruthGuard is an AI-powered fake news detection system
- Users can verify news headlines, articles, or URLs for authenticity
- Classification system: Real (verified), Misleading (partially true), or Fake (false)
- Each verification includes confidence scores (0-100%) and detailed evidence

KEY FEATURES:
1. Real-Time Detection: Instant AI-powered news verification
2. AI Fact Verification: Uses OpenAI GPT-4o-mini for advanced analysis
3. Confidence Scoring: Detailed scores with evidence-based reasoning
4. History Tracking: Users can view past verifications
5. Trending News: Real-time news from around the world with category filters
6. Trending Verifications: Community-wide recent verifications with filters

HOW IT WORKS:
1. User inputs news content or URL
2. AI analyzes content and cross-references information
3. NLP model classifies as Real/Misleading/Fake
4. System displays result with confidence score and evidence

TECHNOLOGY:
- Powered by OpenAI's GPT-4o-mini
- FastAPI backend with MongoDB database
- React frontend with modern UI
- JWT authentication for secure access
- NewsAPI integration for real-time news

AUTHENTICATION:
- Users can sign up with email and password
- Login required for verification and history features
- Trending and About pages are public

Your role is to:
- Answer questions about the platform
- Help users understand how to use TruthGuard
- Explain the verification process
- Provide information about fake news detection
- Be friendly, helpful, and concise

Keep responses clear and under 150 words unless detailed explanation is needed."""
        
        # Build messages with history
        messages = [{"role": "system", "content": system_message}]
        
        # Add conversation history if provided
        if request.history:
            for msg in request.history[-5:]:  # Keep last 5 messages for context
                messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", "")
                })
        
        # Add current message
        messages.append({"role": "user", "content": request.message})
        
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=300
        )
        
        response_text = response.choices[0].message.content.strip()
        
        return {"response": response_text}
    except Exception as e:
        logging.error(f"Chatbot error: {str(e)}")
        return {"response": "I apologize, but I'm having trouble processing your request right now. Please try again in a moment."}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()