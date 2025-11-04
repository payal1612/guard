import requests
import sys
import json
from datetime import datetime

class TruthGuardAPITester:
    def __init__(self, base_url="https://newshub-67.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{status} - {name}")
        if details:
            print(f"   Details: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True, f"Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                error_detail = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_response = response.json()
                    error_detail += f" - {error_response}"
                except:
                    error_detail += f" - {response.text[:200]}"
                
                self.log_test(name, False, error_detail)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        test_user_data = {
            "email": f"test_user_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!",
            "name": "Test User"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response.get('user', {}).get('id')
            return True, test_user_data
        return False, {}

    def test_user_login(self, user_data):
        """Test user login"""
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response.get('user', {}).get('id')
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_news_verification_text(self):
        """Test news verification with text input"""
        verification_data = {
            "content": "Breaking: Scientists discover new planet in our solar system with signs of life.",
            "url": None
        }
        
        success, response = self.run_test(
            "News Verification (Text)",
            "POST",
            "verify",
            200,
            data=verification_data
        )
        
        if success:
            # Check if response has required fields
            required_fields = ['result', 'confidence', 'evidence']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                self.log_test("Verification Response Structure", False, f"Missing fields: {missing_fields}")
                return False
            else:
                self.log_test("Verification Response Structure", True, f"All required fields present")
                return True
        return False

    def test_news_verification_url(self):
        """Test news verification with URL input"""
        verification_data = {
            "content": "This is a news article about recent developments in AI technology.",
            "url": "https://example.com/ai-news"
        }
        
        success, response = self.run_test(
            "News Verification (URL)",
            "POST",
            "verify",
            200,
            data=verification_data
        )
        return success

    def test_verification_history(self):
        """Test getting verification history"""
        success, response = self.run_test(
            "Verification History",
            "GET",
            "history",
            200
        )
        
        if success and isinstance(response, list):
            self.log_test("History Response Format", True, f"Returned {len(response)} items")
            return True
        elif success:
            self.log_test("History Response Format", False, "Response is not a list")
            return False
        return False

    def test_trending_news(self):
        """Test getting trending news (public endpoint)"""
        # Remove token for public endpoint test
        temp_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Trending News (Public)",
            "GET",
            "trending",
            200
        )
        
        # Restore token
        self.token = temp_token
        
        if success and isinstance(response, list):
            self.log_test("Trending Response Format", True, f"Returned {len(response)} items")
            return True
        elif success:
            self.log_test("Trending Response Format", False, "Response is not a list")
            return False
        return False

    def test_protected_routes_without_auth(self):
        """Test that protected routes require authentication"""
        temp_token = self.token
        self.token = None
        
        # Test verify endpoint without auth
        success, _ = self.run_test(
            "Verify Without Auth (Should Fail)",
            "POST",
            "verify",
            401,
            data={"content": "test"}
        )
        
        # Test history endpoint without auth
        success2, _ = self.run_test(
            "History Without Auth (Should Fail)",
            "GET",
            "history",
            401
        )
        
        # Test me endpoint without auth
        success3, _ = self.run_test(
            "Me Without Auth (Should Fail)",
            "GET",
            "auth/me",
            401
        )
        
        # Restore token
        self.token = temp_token
        
        return success and success2 and success3

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        temp_token = self.token
        self.token = None
        
        invalid_data = {
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        }
        
        success, _ = self.run_test(
            "Invalid Login (Should Fail)",
            "POST",
            "auth/login",
            401,
            data=invalid_data
        )
        
        # Restore token
        self.token = temp_token
        return success

    def test_news_api_default(self):
        """Test /api/news with default parameters (general news)"""
        # Remove token for public endpoint test
        temp_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "NewsAPI Default (General News)",
            "GET",
            "news",
            200
        )
        
        # Restore token
        self.token = temp_token
        
        if success:
            # Check response structure
            if 'articles' not in response:
                self.log_test("NewsAPI Response Structure", False, "Missing 'articles' field")
                return False
            
            if 'totalResults' not in response:
                self.log_test("NewsAPI Response Structure", False, "Missing 'totalResults' field")
                return False
            
            articles = response.get('articles', [])
            if not isinstance(articles, list):
                self.log_test("NewsAPI Articles Format", False, "Articles is not a list")
                return False
            
            # Check article structure if articles exist
            if articles:
                article = articles[0]
                required_fields = ['title', 'description', 'url', 'urlToImage', 'publishedAt', 'source']
                missing_fields = [field for field in required_fields if field not in article]
                if missing_fields:
                    self.log_test("NewsAPI Article Structure", False, f"Missing fields: {missing_fields}")
                    return False
                else:
                    self.log_test("NewsAPI Article Structure", True, f"All required fields present in {len(articles)} articles")
            
            self.log_test("NewsAPI Response Structure", True, f"Valid structure with {len(articles)} articles")
            return True
        
        return False

    def test_news_api_categories(self):
        """Test /api/news with different category filters"""
        # Remove token for public endpoint test
        temp_token = self.token
        self.token = None
        
        categories = ['technology', 'sports', 'business', 'health']
        all_success = True
        
        for category in categories:
            success, response = self.run_test(
                f"NewsAPI Category: {category}",
                "GET",
                f"news?category={category}",
                200
            )
            
            if success:
                articles = response.get('articles', [])
                if isinstance(articles, list):
                    self.log_test(f"NewsAPI {category} Format", True, f"Returned {len(articles)} articles")
                else:
                    self.log_test(f"NewsAPI {category} Format", False, "Articles is not a list")
                    all_success = False
            else:
                all_success = False
        
        # Restore token
        self.token = temp_token
        return all_success

    def test_news_api_all_category(self):
        """Test /api/news with 'all' category"""
        # Remove token for public endpoint test
        temp_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "NewsAPI Category: all",
            "GET",
            "news?category=all",
            200
        )
        
        # Restore token
        self.token = temp_token
        
        if success:
            articles = response.get('articles', [])
            if isinstance(articles, list):
                self.log_test("NewsAPI 'all' Category Format", True, f"Returned {len(articles)} articles")
                return True
            else:
                self.log_test("NewsAPI 'all' Category Format", False, "Articles is not a list")
                return False
        
        return False

    def test_chatbot_endpoint(self):
        """Test chatbot endpoint"""
        chatbot_data = {
            "message": "What is TruthGuard?",
            "history": []
        }
        
        success, response = self.run_test(
            "Chatbot Endpoint",
            "POST",
            "chatbot",
            200,
            data=chatbot_data
        )
        
        if success:
            if 'response' in response and isinstance(response['response'], str):
                self.log_test("Chatbot Response Format", True, f"Response length: {len(response['response'])}")
                return True
            else:
                self.log_test("Chatbot Response Format", False, "Missing or invalid 'response' field")
                return False
        
        return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting TruthGuard API Tests")
        print("=" * 50)
        
        # Test user registration
        reg_success, user_data = self.test_user_registration()
        if not reg_success:
            print("❌ Registration failed, stopping tests")
            return False
        
        # Test user login
        if not self.test_user_login(user_data):
            print("❌ Login failed, stopping tests")
            return False
        
        # Test getting current user
        self.test_get_current_user()
        
        # Test news verification
        self.test_news_verification_text()
        self.test_news_verification_url()
        
        # Test history
        self.test_verification_history()
        
        # Test trending (public)
        self.test_trending_news()
        
        # Test NewsAPI endpoints (NEW TESTS)
        print("\n🔍 Testing NewsAPI Integration...")
        self.test_news_api_default()
        self.test_news_api_categories()
        self.test_news_api_all_category()
        
        # Test chatbot endpoint
        self.test_chatbot_endpoint()
        
        # Test protected routes without auth
        self.test_protected_routes_without_auth()
        
        # Test invalid login
        self.test_invalid_login()
        
        # Print final results
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed")
            failed_tests = [test for test in self.test_results if not test['success']]
            print("\nFailed tests:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
            return False

def main():
    tester = TruthGuardAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'summary': {
                'total_tests': tester.tests_run,
                'passed_tests': tester.tests_passed,
                'success_rate': (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
                'timestamp': datetime.now().isoformat()
            },
            'detailed_results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())