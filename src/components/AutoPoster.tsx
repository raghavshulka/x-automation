import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, Zap, AlertTriangle } from 'lucide-react';

declare global {
  interface Window {
    chrome?: any;
  }
}

const chrome = window.chrome;

// Helper function to calculate session duration
const getSessionDuration = (startTime: number) => {
  const duration = Date.now() - startTime;
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
};

interface AutoPosterProps {
  apiKey: string;
}

interface PostingStatus {
  isRunning: boolean;
  currentPost: number;
  totalPosts: number;
  message: string;
  type: 'info' | 'success' | 'error';
  sessionStartTime?: number;
  errors?: Array<{message: string; timestamp: number}>;
}

const AutoPoster: React.FC<AutoPosterProps> = ({ apiKey }) => {
  const [postCount, setPostCount] = useState(5);
  const [intervalMin, setIntervalMin] = useState(30);
  const [intervalMax, setIntervalMax] = useState(60);
  const [status, setStatus] = useState<PostingStatus>({
    isRunning: false,
    currentPost: 0,
    totalPosts: 0,
    message: '',
    type: 'info'
  });

  useEffect(() => {
    // Listen for messages from content script if running as extension
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      const messageListener = (request: any) => {
        if (request.action === 'updateStatus') {
          setStatus(prev => ({
            ...prev,
            message: request.message,
            type: request.type,
            isRunning: !request.finished,
            currentPost: request.state?.currentPostCount || prev.currentPost,
            totalPosts: request.state?.totalPosts || prev.totalPosts,
            sessionStartTime: request.state?.sessionStartTime || prev.sessionStartTime,
            errors: request.state?.errors || prev.errors
          }));
        }
      };

      chrome.runtime.onMessage.addListener(messageListener);
      return () => chrome.runtime.onMessage.removeListener(messageListener);
    }
  }, []);

  const startAutoPosting = async () => {
    if (!apiKey) {
      setStatus({
        isRunning: false,
        currentPost: 0,
        totalPosts: 0,
        message: 'Please set your Groq API key first',
        type: 'error'
      });
      return;
    }

    // Check if we're running as Chrome extension
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      // Chrome extension mode
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];
        
        if (!tab.url?.includes('twitter.com') && !tab.url?.includes('x.com')) {
          setStatus({
            isRunning: false,
            currentPost: 0,
            totalPosts: 0,
            message: 'Please navigate to Twitter/X first',
            type: 'error'
          });
          return;
        }

        const response = await chrome.tabs.sendMessage(tab.id!, {
          action: 'startAutoPosting',
          config: {
            apiKey,
            postCount,
            intervalMin,
            intervalMax
          }
        });

        if (response?.success) {
          setStatus({
            isRunning: true,
            currentPost: 0,
            totalPosts: postCount,
            message: `Starting auto posting (${postCount} posts)...`,
            type: 'success'
          });
        } else {
          setStatus({
            isRunning: false,
            currentPost: 0,
            totalPosts: 0,
            message: 'Failed to start auto posting',
            type: 'error'
          });
        }
      } catch (error) {
        setStatus({
          isRunning: false,
          currentPost: 0,
          totalPosts: 0,
          message: 'Error: Please refresh the Twitter page and try again',
          type: 'error'
        });
      }
    } else {
      // Web app mode - show instructions
      setStatus({
        isRunning: false,
        currentPost: 0,
        totalPosts: 0,
        message: 'Auto posting requires Chrome extension. Please build and install the extension.',
        type: 'error'
      });
    }
  };

  const stopAutoPosting = async () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        await chrome.tabs.sendMessage(tabs[0].id!, { action: 'stopAutoPosting' });
        
        setStatus({
          isRunning: false,
          currentPost: 0,
          totalPosts: 0,
          message: 'Auto posting stopped',
          type: 'info'
        });
      } catch (error) {
        console.error('Error stopping auto posting:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Auto Poster</h2>
            <p className="text-gray-600">Automated Twitter posting</p>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>Educational purposes only.</strong> Use responsibly and comply with Twitter's Terms of Service.
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Posts
            </label>
            <select
              value={postCount}
              onChange={(e) => setPostCount(parseInt(e.target.value))}
              disabled={status.isRunning}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
            >
              <option value={1}>1 Post</option>
              <option value={3}>3 Posts</option>
              <option value={5}>5 Posts</option>
              <option value={10}>10 Posts</option>
              <option value={15}>15 Posts</option>
              <option value={20}>20 Posts</option>
              <option value={25}>25 Posts</option>
              <option value={30}>30 Posts</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Interval (seconds)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={intervalMin}
                onChange={(e) => setIntervalMin(parseInt(e.target.value))}
                disabled={status.isRunning}
                min={30}
                max={120}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                value={intervalMax}
                onChange={(e) => setIntervalMax(parseInt(e.target.value))}
                disabled={status.isRunning}
                min={30}
                max={120}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex space-x-3">
          <button
            onClick={startAutoPosting}
            disabled={status.isRunning || !apiKey}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            <Play className="w-4 h-4" />
            <span>Start Auto Posting</span>
          </button>
          
          <button
            onClick={stopAutoPosting}
            disabled={!status.isRunning}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            <Square className="w-4 h-4" />
            <span>Stop Posting</span>
          </button>
        </div>

        {/* Status */}
        {status.message && (
          <div className={`p-4 rounded-xl border ${
            status.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            status.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm font-medium">{status.message}</p>
            </div>
            
            {status.isRunning && status.totalPosts > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{status.currentPost}/{status.totalPosts}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(status.currentPost / status.totalPosts) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Session Info */}
        {status.sessionStartTime && (
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Session Information</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>Session Duration: {getSessionDuration(status.sessionStartTime)}</p>
              {status.errors && status.errors.length > 0 && (
                <p className="text-red-600">Errors encountered: {status.errors.length}</p>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">How to use Auto Poster:</h3>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>Build the Chrome extension using <code className="bg-gray-200 px-1 rounded">npm run build:extension</code></li>
            <li>Load the extension in Chrome from the <code className="bg-gray-200 px-1 rounded">dist</code> folder</li>
            <li>Navigate to Twitter/X and login</li>
            <li>Configure your settings and click "Start Auto Posting"</li>
          </ol>
          <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Enhanced Features:</strong> 
              • Supports up to 30 posts
              • 200 character limit per post
              • Human-like cursor movements (left-right)
              • 1-2 minute breaks after every 10 posts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoPoster;