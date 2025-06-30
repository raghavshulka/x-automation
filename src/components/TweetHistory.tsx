import React from 'react';
import { Copy, Clock, Check, Trash2 } from 'lucide-react';

interface Tweet {
  id: string;
  content: string;
  timestamp: Date;
  copied: boolean;
}

interface TweetHistoryProps {
  tweets: Tweet[];
  onMarkAsCopied: (id: string) => void;
  onClearHistory: () => void;
}

const TweetHistory: React.FC<TweetHistoryProps> = ({ tweets, onMarkAsCopied, onClearHistory }) => {
  const copyToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      onMarkAsCopied(id);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Tweet History</h2>
            <p className="text-sm text-gray-600">{tweets.length} generated tweets</p>
          </div>
          {tweets.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {tweets.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">No tweets generated yet</p>
            <p className="text-sm text-gray-400">Start generating content to see your history here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tweets.map((tweet) => (
              <div key={tweet.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="space-y-3">
                  <p className="text-gray-900 leading-relaxed text-sm">{tweet.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(tweet.timestamp)} at {formatTime(tweet.timestamp)}</span>
                    </div>
                    
                    <button
                      onClick={() => copyToClipboard(tweet.content, tweet.id)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs transition-colors ${
                        tweet.copied
                          ? 'text-green-600 bg-green-50'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {tweet.copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    {tweet.content.length}/280 characters
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TweetHistory;