import requests
import json
from datetime import datetime

class OpenAIIntegrationTester:
    def __init__(self, base_url="https://dev-workflow-9.preview.emergentagent.com/api"):
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

    def setup_user_auth(self):
        """Create a test user and get authentication token"""
        print("🔐 Setting up test user authentication...")
        
        # Register a test user
        test_user_data = {
            "email": f"openai_test_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!",
            "name": "OpenAI Test User"
        }
        
        url = f"{self.base_url}/auth/register"
        headers = {'Content-Type': 'application/json'}
        
        try:
            response = requests.post(url, json=test_user_data, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('token')
                self.user_id = data.get('user', {}).get('id')
                print(f"✅ Test user created and authenticated")
                return True
            else:
                print(f"❌ Failed to create test user: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Exception during user setup: {str(e)}")
            return False

    def test_news_verification_with_openai(self):
        """Test news verification with OpenAI using the sample from review request"""
        print("\n🔍 Testing News Verification with OpenAI...")
        
        # Sample news from the review request
        verification_data = {
            "content": "Scientists discover water on Mars. NASA confirms liquid water found in underground lakes.",
            "url": None
        }
        
        url = f"{self.base_url}/verify"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.token}'
        }
        
        try:
            response = requests.post(url, json=verification_data, headers=headers, timeout=60)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields
                required_fields = ['result', 'confidence', 'evidence']
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("OpenAI News Verification - Response Structure", False, 
                                f"Missing fields: {missing_fields}")
                    return False
                
                # Validate field types and values
                result = data.get('result', '')
                confidence = data.get('confidence', 0)
                evidence = data.get('evidence', '')
                
                # Check if result is one of expected classifications
                valid_results = ['Real', 'Fake', 'Misleading']
                if result not in valid_results:
                    self.log_test("OpenAI News Verification - Classification", False, 
                                f"Invalid result '{result}', expected one of {valid_results}")
                    return False
                
                # Check confidence score range
                if not isinstance(confidence, (int, float)) or confidence < 0 or confidence > 100:
                    self.log_test("OpenAI News Verification - Confidence Score", False, 
                                f"Invalid confidence score: {confidence} (should be 0-100)")
                    return False
                
                # Check evidence is not empty
                if not evidence or len(evidence.strip()) < 10:
                    self.log_test("OpenAI News Verification - Evidence", False, 
                                f"Evidence too short or empty: '{evidence[:50]}...'")
                    return False
                
                self.log_test("OpenAI News Verification", True, 
                            f"Classification: {result}, Confidence: {confidence}%, Evidence length: {len(evidence)}")
                
                # Log the actual response for verification
                print(f"   📊 OpenAI Analysis Result:")
                print(f"      Classification: {result}")
                print(f"      Confidence: {confidence}%")
                print(f"      Evidence: {evidence[:100]}...")
                
                return True
            else:
                self.log_test("OpenAI News Verification", False, 
                            f"HTTP {response.status_code}: {response.text[:200]}")
                return False
                
        except Exception as e:
            self.log_test("OpenAI News Verification", False, f"Exception: {str(e)}")
            return False

    def test_chatbot_with_openai(self):
        """Test chatbot with OpenAI using the sample question from review request"""
        print("\n🔍 Testing Chatbot with OpenAI...")
        
        # Sample question from the review request
        chatbot_data = {
            "message": "How does TruthGuard verify news?",
            "history": []
        }
        
        url = f"{self.base_url}/chatbot"
        headers = {'Content-Type': 'application/json'}
        
        try:
            response = requests.post(url, json=chatbot_data, headers=headers, timeout=60)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                if 'response' not in data:
                    self.log_test("OpenAI Chatbot - Response Structure", False, 
                                "Missing 'response' field")
                    return False
                
                chatbot_response = data.get('response', '')
                
                # Check response is not empty and meaningful
                if not chatbot_response or len(chatbot_response.strip()) < 20:
                    self.log_test("OpenAI Chatbot - Response Quality", False, 
                                f"Response too short: '{chatbot_response}'")
                    return False
                
                # Check if response mentions TruthGuard (should be knowledgeable about the platform)
                if 'truthguard' not in chatbot_response.lower():
                    self.log_test("OpenAI Chatbot - Platform Knowledge", False, 
                                "Response doesn't mention TruthGuard platform")
                    return False
                
                self.log_test("OpenAI Chatbot", True, 
                            f"Response length: {len(chatbot_response)} characters")
                
                # Log the actual response for verification
                print(f"   🤖 Chatbot Response:")
                print(f"      {chatbot_response[:200]}...")
                
                return True
            else:
                self.log_test("OpenAI Chatbot", False, 
                            f"HTTP {response.status_code}: {response.text[:200]}")
                return False
                
        except Exception as e:
            self.log_test("OpenAI Chatbot", False, f"Exception: {str(e)}")
            return False

    def test_error_handling(self):
        """Test error handling for OpenAI integration"""
        print("\n🔍 Testing Error Handling...")
        
        # Test verification with empty content
        verification_data = {
            "content": "",
            "url": None
        }
        
        url = f"{self.base_url}/verify"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.token}'
        }
        
        try:
            response = requests.post(url, json=verification_data, headers=headers, timeout=30)
            
            # Should either handle gracefully or return appropriate error
            if response.status_code in [200, 400, 422]:
                if response.status_code == 200:
                    data = response.json()
                    # Should still have required fields even for empty content
                    if 'result' in data and 'confidence' in data and 'evidence' in data:
                        self.log_test("Error Handling - Empty Content", True, 
                                    "Handled empty content gracefully")
                        return True
                else:
                    self.log_test("Error Handling - Empty Content", True, 
                                f"Properly rejected empty content with status {response.status_code}")
                    return True
            else:
                self.log_test("Error Handling - Empty Content", False, 
                            f"Unexpected status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Error Handling - Empty Content", False, f"Exception: {str(e)}")
            return False

    def run_openai_integration_tests(self):
        """Run all OpenAI integration tests"""
        print("🚀 Starting OpenAI Integration Tests for TruthGuard")
        print("=" * 60)
        
        # Setup authentication
        if not self.setup_user_auth():
            print("❌ Failed to setup authentication, stopping tests")
            return False
        
        # Run OpenAI-specific tests
        success1 = self.test_news_verification_with_openai()
        success2 = self.test_chatbot_with_openai()
        success3 = self.test_error_handling()
        
        # Print final results
        print("\n" + "=" * 60)
        print(f"📊 OpenAI Integration Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All OpenAI integration tests passed!")
            print("✅ OpenAI GPT-4o-mini integration is working correctly")
            return True
        else:
            print("⚠️  Some OpenAI integration tests failed")
            failed_tests = [test for test in self.test_results if not test['success']]
            print("\nFailed tests:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
            return False

def main():
    tester = OpenAIIntegrationTester()
    success = tester.run_openai_integration_tests()
    
    # Save detailed results
    with open('/app/openai_integration_test_results.json', 'w') as f:
        json.dump({
            'summary': {
                'total_tests': tester.tests_run,
                'passed_tests': tester.tests_passed,
                'success_rate': (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
                'timestamp': datetime.now().isoformat(),
                'focus': 'OpenAI GPT-4o-mini Integration Testing'
            },
            'detailed_results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    import sys
    sys.exit(main())