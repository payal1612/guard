import React, { useState } from 'react';
import axios from 'axios';
import { Link2, FileText, Loader2, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Progress } from '../components/ui/progress';

const Verify = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleVerify = async () => {
    if (!content.trim()) {
      toast.error('Please enter some content to verify');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post('/verify', {
        content: content.trim(),
        url: activeTab === 'url' ? url.trim() || null : null,
      });
      setResult(response.data);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Real':
        return <CheckCircle2 className="w-16 h-16 text-green-600" />;
      case 'Fake':
        return <AlertCircle className="w-16 h-16 text-red-600" />;
      case 'Misleading':
        return <AlertTriangle className="w-16 h-16 text-orange-600" />;
      default:
        return <AlertCircle className="w-16 h-16 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Real':
        return 'text-green-600';
      case 'Fake':
        return 'text-red-600';
      case 'Misleading':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen py-12 px-4" data-testid="verify-page">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
            Verify News Authenticity
          </h1>
          <p className="text-lg text-gray-600">
            Paste news content or URL to analyze with AI
          </p>
        </div>

        {/* Input Section */}
        <div className="glass rounded-2xl p-6 mb-8">
          {/* Tabs */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setActiveTab('text')}
              data-testid="tab-text"
              className={`flex-1 py-3 rounded-lg font-semibold ${
                activeTab === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/50 text-gray-700 hover:bg-white/70'
              }`}
            >
              <FileText className="w-5 h-5 inline-block mr-2" />
              Text / Headline
            </button>
            <button
              onClick={() => setActiveTab('url')}
              data-testid="tab-url"
              className={`flex-1 py-3 rounded-lg font-semibold ${
                activeTab === 'url'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/50 text-gray-700 hover:bg-white/70'
              }`}
            >
              <Link2 className="w-5 h-5 inline-block mr-2" />
              URL
            </button>
          </div>

          {/* Input Area */}
          {activeTab === 'url' && (
            <input
              type="url"
              data-testid="url-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/news-article"
              className="w-full px-4 py-3 rounded-lg bg-white/50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
          )}

          <textarea
            data-testid="content-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste news headline, article text, or claim here..."
            className="w-full h-40 px-4 py-3 rounded-lg bg-white/50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          <button
            onClick={handleVerify}
            data-testid="analyze-button"
            disabled={loading}
            className="w-full py-4 rounded-lg bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 inline-block mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Now'
            )}
          </button>
        </div>

        {/* Result Section */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-2xl p-8"
            data-testid="result-section"
          >
            <div className="text-center mb-6">
              {getStatusIcon(result.result)}
              <h2 className={`text-3xl font-bold mt-4 ${getStatusColor(result.result)}`}>
                {result.result}
              </h2>
            </div>

            {/* Confidence Score */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Confidence Score</span>
                <span className="text-lg font-bold text-gray-800" data-testid="confidence-score">
                  {result.confidence.toFixed(1)}%
                </span>
              </div>
              <Progress value={result.confidence} className="h-3" />
            </div>

            {/* Evidence */}
            <div className="bg-white/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Evidence & Reasoning</h3>
              <p className="text-gray-700 leading-relaxed" data-testid="evidence-text">
                {result.evidence}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setContent('');
                  setUrl('');
                  setResult(null);
                }}
                data-testid="verify-another-button"
                className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                Verify Another
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Verify;