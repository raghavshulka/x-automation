import React, { useState, useEffect } from 'react';
import { Settings, Zap, Copy, RefreshCw, Clock, User, Key } from 'lucide-react';
import ContentGenerator from './components/ContentGenerator';
import ApiKeyModal from './components/ApiKeyModal';
import SettingsModal from './components/SettingsModal';
import TweetHistory from './components/TweetHistory';
import AutoPoster from './components/AutoPoster';

interface Tweet {
  id: string;
  content: string;
  timestamp: Date;
  copied: boolean;
}

function App() {
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiModal, setShowApiModal] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'generator' | 'autoposter'>('generator');

  useEffect(() => {
    // Load saved API key and tweets from localStorage
    const savedApiKey = localStorage.getItem('groq_api_key');
    const savedTweets = localStorage.getItem('generated_tweets');
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      setShowApiModal(true);
    }
    
    if (savedTweets) {
      setTweets(JSON.parse(savedTweets).map((tweet: any) => ({
        ...tweet,
        timestamp: new Date(tweet.timestamp)
      })));
    }
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('groq_api_key', key);
    setShowApiModal(false);
  };

  const addTweet = (content: string) => {
    const newTweet: Tweet = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      copied: false
    };
    
    const updatedTweets = [newTweet, ...tweets];
    setTweets(updatedTweets);
    localStorage.setItem('generated_tweets', JSON.stringify(updatedTweets));
  };

  const markAsCopied = (id: string) => {
    const updatedTweets = tweets.map(tweet => 
      tweet.id === id ? { ...tweet, copied: true } : tweet
    );
    setTweets(updatedTweets);
    localStorage.setItem('generated_tweets', JSON.stringify(updatedTweets));
  };

  const clearHistory = () => {
    setTweets([]);
    localStorage.removeItem('generated_tweets');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Twitter Content Assistant</h1>
                <p className="text-sm text-gray-600">Generate authentic founder content</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowApiModal(true)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Key className="w-4 h-4" />
                <span className="text-sm font-medium">API Key</span>
              </button>
              
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Settings</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mt-4 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'generator'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Content Generator
            </button>
            <button
              onClick={() => setActiveTab('autoposter')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'autoposter'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Auto Poster
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeTab === 'generator' ? (
              <ContentGenerator
                apiKey={apiKey}
                onTweetGenerated={addTweet}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
              />
            ) : (
              <AutoPoster apiKey={apiKey} />
            )}
          </div>
          
          {/* Tweet History */}
          <div className="lg:col-span-1">
            <TweetHistory
              tweets={tweets}
              onMarkAsCopied={markAsCopied}
              onClearHistory={clearHistory}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      {showApiModal && (
        <ApiKeyModal
          onSave={saveApiKey}
          onClose={() => setShowApiModal(false)}
          currentKey={apiKey}
        />
      )}
      
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;