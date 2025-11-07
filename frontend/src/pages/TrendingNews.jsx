import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Loader2, ExternalLink, Calendar, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Footer from '../components/Footer';

const TrendingNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All News' },
    { value: 'business', label: 'Business' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'general', label: 'General' },
    { value: 'health', label: 'Health' },
    { value: 'science', label: 'Science' },
    { value: 'sports', label: 'Sports' },
    { value: 'technology', label: 'Technology' }
  ];

  useEffect(() => {
    fetchNews();
  }, [category]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/news', {
        params: { category }
      });
      setNews(response.data.articles || []);
    } catch (error) {
      console.error('Failed to load news:', error);
      toast.error('Failed to load trending news');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (cat) => {
    const colors = {
      business: 'bg-blue-500',
      entertainment: 'bg-purple-500',
      general: 'bg-gray-500',
      health: 'bg-green-500',
      science: 'bg-teal-500',
      sports: 'bg-orange-500',
      technology: 'bg-indigo-500'
    };
    return colors[cat] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading latest news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <TrendingUp className="w-10 h-10 text-blue-600" />
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
                Trending News
              </h1>
            </div>
            <p className="text-lg text-gray-600">
              Stay updated with the latest headlines from around the world
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  category === cat.value
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* News Grid */}
          {news.length === 0 ? (
            <div className="text-center bg-white rounded-2xl p-12 shadow-md">
              <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No news articles found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((article, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
                >
                  {/* Image */}
                  {article.urlToImage && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white ${getCategoryColor(article.category)}`}>
                        {article.category}
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-3 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>

                    {/* Description */}
                    {article.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {article.description}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="space-y-2 mb-4">
                      {article.source?.name && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe className="w-4 h-4 mr-2" />
                          <span className="font-medium">{article.source.name}</span>
                        </div>
                      )}
                      
                      {article.publishedAt && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>
                            {format(new Date(article.publishedAt), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Read More Link */}
                    {article.url && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm group-hover:underline"
                      >
                        Read Full Article
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Info Banner */}
          <div className="mt-12 bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
            <div className="flex items-start">
              <TrendingUp className="w-6 h-6 text-blue-600 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Real-Time News Updates</h3>
                <p className="text-gray-700">
                  These are the latest headlines from trusted news sources around the world. 
                  News is updated daily to keep you informed. Want to verify if a news article is fake? 
                  Use our <a href="/verify" className="text-blue-600 hover:underline font-semibold">verification tool</a>!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TrendingNews;
