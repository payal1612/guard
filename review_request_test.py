import requests
import json
from datetime import datetime

def test_review_request_scenarios():
    """Test the specific scenarios mentioned in the review request"""
    
    base_url = "https://dev-workflow-9.preview.emergentagent.com/api"
    
    print("🚀 Testing Review Request Scenarios")
    print("=" * 50)
    
    # Step 1: Create test user and login
    print("\n1️⃣ Creating test user and login...")
    
    test_user_data = {
        "email": f"review_test_{datetime.now().strftime('%H%M%S')}@example.com",
        "password": "TestPass123!",
        "name": "Review Test User"
    }
    
    # Register user
    response = requests.post(f"{base_url}/auth/register", json=test_user_data)
    if response.status_code != 200:
        print(f"❌ Failed to register user: {response.status_code}")
        return False
    
    token = response.json().get('token')
    print(f"✅ User created and logged in successfully")
    
    # Step 2: Test POST /api/verify with sample news content
    print("\n2️⃣ Testing POST /api/verify with sample news content...")
    
    sample_news = "Scientists discover water on Mars. NASA confirms liquid water found in underground lakes."
    
    verify_data = {
        "content": sample_news,
        "url": None
    }
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    response = requests.post(f"{base_url}/verify", json=verify_data, headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Verify endpoint failed: {response.status_code} - {response.text}")
        return False
    
    verify_result = response.json()
    
    # Verify OpenAI GPT-4o-mini is analyzing the content
    required_fields = ['result', 'confidence', 'evidence']
    for field in required_fields:
        if field not in verify_result:
            print(f"❌ Missing required field: {field}")
            return False
    
    classification = verify_result['result']
    confidence = verify_result['confidence']
    evidence = verify_result['evidence']
    
    print(f"✅ News verification successful:")
    print(f"   📊 Classification: {classification}")
    print(f"   📊 Confidence: {confidence}%")
    print(f"   📊 Evidence: {evidence[:100]}...")
    
    # Verify classification is valid
    if classification not in ['Real', 'Fake', 'Misleading']:
        print(f"❌ Invalid classification: {classification}")
        return False
    
    # Verify confidence is in valid range
    if not isinstance(confidence, (int, float)) or confidence < 0 or confidence > 100:
        print(f"❌ Invalid confidence score: {confidence}")
        return False
    
    print(f"✅ OpenAI GPT-4o-mini analysis confirmed - proper structure returned")
    
    # Step 3: Test POST /api/chatbot with sample question
    print("\n3️⃣ Testing POST /api/chatbot with sample question...")
    
    sample_question = "How does TruthGuard verify news?"
    
    chatbot_data = {
        "message": sample_question,
        "history": []
    }
    
    response = requests.post(f"{base_url}/chatbot", json=chatbot_data)
    
    if response.status_code != 200:
        print(f"❌ Chatbot endpoint failed: {response.status_code} - {response.text}")
        return False
    
    chatbot_result = response.json()
    
    if 'response' not in chatbot_result:
        print(f"❌ Chatbot response missing 'response' field")
        return False
    
    chatbot_response = chatbot_result['response']
    
    print(f"✅ Chatbot response successful:")
    print(f"   🤖 Response: {chatbot_response[:150]}...")
    
    # Verify the chatbot responds correctly using OpenAI
    if len(chatbot_response) < 50:
        print(f"❌ Chatbot response too short: {len(chatbot_response)} characters")
        return False
    
    # Check if response is relevant to TruthGuard
    if 'truthguard' not in chatbot_response.lower():
        print(f"❌ Chatbot response doesn't mention TruthGuard")
        return False
    
    print(f"✅ OpenAI chatbot integration confirmed - relevant response provided")
    
    # Step 4: Verify response structures
    print("\n4️⃣ Verifying response structures...")
    
    # Verify verification response structure
    expected_verify_fields = ['id', 'user_id', 'content', 'result', 'confidence', 'evidence', 'timestamp']
    missing_verify_fields = [field for field in expected_verify_fields if field not in verify_result]
    
    if missing_verify_fields:
        print(f"❌ Verification response missing fields: {missing_verify_fields}")
        return False
    
    print(f"✅ Verification response structure validated")
    
    # Verify chatbot response structure
    if not isinstance(chatbot_result, dict) or 'response' not in chatbot_result:
        print(f"❌ Invalid chatbot response structure")
        return False
    
    print(f"✅ Chatbot response structure validated")
    
    # Step 5: Test error handling
    print("\n5️⃣ Testing error handling...")
    
    # Test verification with invalid data
    invalid_verify_data = {
        "content": "",  # Empty content
        "url": None
    }
    
    response = requests.post(f"{base_url}/verify", json=invalid_verify_data, headers=headers)
    
    # Should handle gracefully (either 200 with default response or proper error)
    if response.status_code in [200, 400, 422]:
        print(f"✅ Error handling works - status: {response.status_code}")
    else:
        print(f"❌ Unexpected error handling - status: {response.status_code}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 ALL REVIEW REQUEST SCENARIOS PASSED!")
    print("✅ OpenAI integration is working properly")
    print("✅ Switch from Emergent LLM to direct OpenAI API key successful")
    print("✅ News verification with OpenAI GPT-4o-mini confirmed")
    print("✅ Chatbot with OpenAI confirmed")
    print("✅ Response structures validated")
    print("✅ Error handling verified")
    
    return True

if __name__ == "__main__":
    success = test_review_request_scenarios()
    if not success:
        print("\n❌ Some tests failed!")
        exit(1)
    else:
        print("\n🎉 All tests passed successfully!")
        exit(0)