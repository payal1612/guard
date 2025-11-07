import React from 'react';
import { Shield, Search, Brain, Database, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
  const steps = [
    {
      icon: <Search className="w-12 h-12 text-blue-600" />,
      title: 'Step 1: Input Your News',
      description: 'Paste a news headline, article text, or URL into our verification tool.',
    },
    {
      icon: <Database className="w-12 h-12 text-green-600" />,
      title: 'Step 2: AI Fetches Context',
      description: 'Our AI system analyzes the content and cross-references with reliable sources.',
    },
    {
      icon: <Brain className="w-12 h-12 text-purple-600" />,
      title: 'Step 3: NLP Model Classification',
      description: 'Advanced machine learning models detect patterns of misinformation.',
    },
    {
      icon: <CheckCircle className="w-12 h-12 text-orange-600" />,
      title: 'Step 4: Get Results',
      description: 'Receive a classification with confidence score and evidence-based reasoning.',
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4" data-testid="about-page">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
              About TruthGuard
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              TruthGuard is an AI-powered fake news detection system designed to help you verify the
              authenticity of news articles, headlines, and claims in real-time.
            </p>
          </motion.div>
        </div>

        {/* Mission Section */}
        <section className="glass rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            In an era of widespread misinformation, TruthGuard empowers users to make informed
            decisions by providing instant, AI-driven fact-checking. We leverage cutting-edge
            natural language processing and machine learning to analyze news content and detect
            patterns of misinformation, helping you distinguish truth from deception.
          </p>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-xl p-6"
              >
                <div className="mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Technology Section */}
        <section className="glass rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Technology</h2>
          <div className="space-y-4 text-lg text-gray-700">
            <div>
              <h3 className="font-bold text-gray-800 mb-2">AI Model</h3>
              <p>
                Powered by OpenAI's GPT-5, our system uses advanced natural language understanding
                to analyze news content with high accuracy.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Classification System</h3>
              <p>
                News is classified into three categories:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li><span className="text-green-600 font-semibold">Real</span> - Verified and authentic information</li>
                <li><span className="text-orange-600 font-semibold">Misleading</span> - Partially true but lacks context</li>
                <li><span className="text-red-600 font-semibold">Fake</span> - False or fabricated information</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">Confidence Scoring</h3>
              <p>
                Each verification includes a confidence score (0-100%) and detailed evidence to
                support the classification.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center glass rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Join the Fight Against Misinformation
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Start verifying news today and contribute to a more informed society.
          </p>
          <a
            href="/verify"
            className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold text-lg shadow-2xl hover:shadow-3xl"
          >
            Get Started
          </a>
        </section>
      </div>
    </div>
  );
};

export default About;