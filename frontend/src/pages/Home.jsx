import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Search, CheckCircle, Brain, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthContext } from '../App';
import AuthModal from '../components/AuthModal';
import Footer from '../components/Footer';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleVerifyNow = () => {
    if (user) {
      navigate('/verify');
    } else {
      setShowAuthModal(true);
    }
  };

  const detectionSteps = [
    {
      number: '1',
      icon: <Search className="w-12 h-12 text-blue-500" />,
      title: 'Input the news URL or text',
      description: 'Submit any news article, headline, or claim you want to verify'
    },
    {
      number: '2',
      icon: <Brain className="w-12 h-12 text-blue-500" />,
      title: 'AI analyzes the source, content, and credibility',
      description: 'Advanced AI examines multiple factors including source reliability and content patterns'
    },
    {
      number: '3',
      icon: <CheckCircle className="w-12 h-12 text-blue-500" />,
      title: 'Get instant verdict with proof',
      description: 'Receive a clear classification with confidence score and detailed evidence'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah T.',
      text: 'Terrific website! I\'ve been able to verify numerous news stories with confidence.',
      avatar: 'ST'
    },
    {
      name: 'Michael R.',
      text: 'TruthGuard helped me identify misleading articles that I almost shared. Essential tool!',
      avatar: 'MR'
    },
    {
      name: 'Emily Chen',
      text: 'The AI-powered analysis is incredibly detailed. Finally, a reliable way to fact-check news.',
      avatar: 'EC'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Uncover the Truth Behind Every Headline
              </h1>
              
              <p className="text-xl text-gray-700 mb-8">
                TruthGuard uses AI to verify the authenticity of online news, ensuring you never fall for misinformation again.
              </p>

              <button
                onClick={handleVerifyNow}
                className="px-8 py-4 rounded-lg bg-blue-600 text-white font-semibold text-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all"
              >
                Verify News Now
              </button>
            </motion.div>

            {/* Right Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-blue-100">
                {/* Browser window mockup */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-white/80"></div>
                  <div className="w-3 h-3 rounded-full bg-white/80"></div>
                  <div className="w-3 h-3 rounded-full bg-white/80"></div>
                  <div className="flex-1 bg-blue-400/30 rounded px-3 py-1 text-white text-sm">
                    truthguard.com/verify
                  </div>
                </div>
                
                {/* Content area with illustration */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 relative">
                  {/* NEWS label */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl font-bold text-blue-600">NEWS</span>
                  </div>
                  
                  {/* News content mockup */}
                  <div className="bg-white rounded-lg p-4 mb-6 shadow-md">
                    <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                  
                  {/* Woman with magnifying glass illustration */}
                  <div className="flex justify-center items-center">
                    <div className="relative">
                      <img
                        src="https://customer-assets.emergentagent.com/job_newshub-67/artifacts/t61ii6c5_image.png"
                        alt="Woman examining news with magnifying glass"
                        className="w-64 h-64 object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How TruthGuard Detects Fake News */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            How TruthGuard Detects Fake News
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {detectionSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                {/* Icon Container */}
                <div className="relative mb-6 flex justify-center">
                  <div className="w-32 h-32 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                    {step.number}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Fake News Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-gray-900">
              Trending Fake News
            </h2>
            <button
              onClick={() => navigate('/trending')}
              className="text-blue-600 hover:text-blue-700 font-semibold text-lg hover:underline"
            >
              View More
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Example Fake News Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Celebrity Believes Earth Is Flat
              </h3>
              <p className="text-gray-600 mb-4">
                The celebrity shared a post on social media claiming the Earth is flat...
              </p>
              <span className="inline-block px-4 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700 border border-green-300">
                TRUE
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Vaccine Causes Autism
              </h3>
              <p className="text-gray-600 mb-4">
                An article is circulating false claims that vaccines cause autism...
              </p>
              <span className="inline-block px-4 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700 border border-red-300">
                FAKE
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What People Are Saying */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            What People Are Saying
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-xl p-6 shadow-md"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ask TruthBot Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center mb-8"
          >
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/50 flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <h2 className="text-4xl font-bold mb-6">Ask TruthBot:</h2>
          <p className="text-2xl mb-8">Is this news fake?</p>
          
          <button
            onClick={handleVerifyNow}
            className="px-8 py-4 rounded-lg bg-white text-blue-600 font-semibold text-lg shadow-lg hover:bg-gray-100 hover:shadow-xl transition-all"
          >
            Start Verification
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};

export default Home;