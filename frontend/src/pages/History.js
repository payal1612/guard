import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History as HistoryIcon, Loader2, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/history');
      setHistory(response.data);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Real':
        return 'text-green-700 bg-green-500/20';
      case 'Fake':
        return 'text-red-700 bg-red-500/20';
      case 'Misleading':
        return 'text-orange-700 bg-orange-500/20';
      default:
        return 'text-gray-700 bg-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" data-testid="history-page">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <HistoryIcon className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
              Verification History
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Your past news verifications
          </p>
        </div>

        {history.length === 0 ? (
          <div className="text-center glass rounded-2xl p-12">
            <p className="text-gray-600 text-lg mb-4">No verification history yet</p>
            <a
              href="/verify"
              className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl"
            >
              Start Verifying
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="glass rounded-xl p-6 hover:shadow-xl transition-shadow"
                data-testid="history-item"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    {/* Status and Confidence */}
                    <div className="flex items-center space-x-3 mb-3">
                      <span
                        className={`px-4 py-1 rounded-full text-sm font-bold ${getStatusColor(
                          item.result
                        )}`}
                      >
                        {item.result}
                      </span>
                      <span className="text-sm font-bold text-gray-700">
                        Confidence: {item.confidence.toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(item.timestamp), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-gray-800 mb-3 line-clamp-2">{item.content}</p>

                    {/* URL if exists */}
                    {item.url && (
                      <div className="flex items-center text-sm text-blue-600 mb-2">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline truncate"
                        >
                          {item.url}
                        </a>
                      </div>
                    )}

                    {/* Evidence */}
                    <details className="mt-3">
                      <summary className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-blue-600">
                        View Evidence
                      </summary>
                      <p className="text-sm text-gray-600 mt-2 pl-4 border-l-2 border-gray-300">
                        {item.evidence}
                      </p>
                    </details>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;