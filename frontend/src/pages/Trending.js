import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Loader2, ExternalLink, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const Trending = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const response = await axios.get('/trending');
      setTrending(response.data);
    } catch (error) {
      toast.error('Failed to load trending news');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Real':
        return 'bg-green-500/20 text-green-700 border-green-300';
      case 'Fake':
        return 'bg-red-500/20 text-red-700 border-red-300';
      case 'Misleading':
        return 'bg-orange-500/20 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-300';
    }
  };

  const filteredTrending = filter === 'All'
    ? trending
    : trending.filter((item) => item.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" data-testid="trending-page">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <TrendingUp className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
              Trending Verifications
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Recently verified news from the community
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {['All', 'Real', 'Misleading', 'Fake'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              data-testid={`filter-${status.toLowerCase()}`}
              className={`px-6 py-2 rounded-full font-semibold ${
                filter === status
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'glass text-gray-700 hover:bg-white/70'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Trending Grid */}
        {filteredTrending.length === 0 ? (
          <div className="text-center glass rounded-2xl p-12">
            <p className="text-gray-600 text-lg">No trending news found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrending.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="glass rounded-xl p-6 hover:shadow-xl transition-shadow"
                data-testid="trending-card"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-4 py-1 rounded-full text-sm font-bold border ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                  <span className="text-sm font-bold text-gray-700">
                    {item.confidence.toFixed(0)}%
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-3">
                  {item.title}
                </h3>

                {/* Source */}
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  <span className="truncate">{item.source}</span>
                </div>

                {/* Date */}
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{format(new Date(item.verified_at), 'MMM dd, yyyy')}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Trending;