import React from 'react';
import { X, Settings, Shield, Info } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Settings & Guidelines</h2>
              <p className="text-sm text-gray-600">Best practices and usage guidelines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Usage Guidelines */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Info className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Usage Guidelines</h3>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 space-y-3">
              <p className="text-sm text-blue-800">
                This tool generates content suggestions that you should review and manually post to Twitter. 
                Always ensure content aligns with your voice and Twitter's community guidelines.
              </p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Review all generated content before posting</li>
                <li>Customize content to match your personal style</li>
                <li>Respect Twitter's posting frequency limits</li>
                <li>Engage authentically with your audience</li>
              </ul>
            </div>
          </div>

          {/* Content Strategy */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Content Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4">
                <h4 className="font-semibold text-green-900 mb-2">✅ Do</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>Share authentic experiences</li>
                  <li>Provide actionable insights</li>
                  <li>Ask engaging questions</li>
                  <li>Support fellow founders</li>
                  <li>Be humble about your journey</li>
                </ul>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <h4 className="font-semibold text-red-900 mb-2">❌ Don't</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>Use emojis (strictly forbidden)</li>
                  <li>Sound robotic or corporate</li>
                  <li>Brag about massive success</li>
                  <li>Make pushy sales pitches</li>
                  <li>Copy other accounts directly</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Privacy & Security</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <p className="text-sm text-gray-700">
                Your API key is stored locally in your browser and never sent to our servers. 
                All content generation happens directly between your browser and the Grok API.
              </p>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>API keys are stored in browser localStorage</li>
                <li>Generated content is saved locally</li>
                <li>No data is sent to third-party servers</li>
                <li>Clear browser data to remove all stored information</li>
              </ul>
            </div>
          </div>

          {/* Inspiration Accounts */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Inspiration Accounts</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">MB</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">@MVP_Builder</p>
                  <p className="text-sm text-gray-600">Practical advice and authentic founder stories</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-green-600">AH</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">@Anubhavhing</p>
                  <p className="text-sm text-gray-600">Engaging questions and community building</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">WK</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">@askwhykartik</p>
                  <p className="text-sm text-gray-600">Direct insights and personal experiences</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;