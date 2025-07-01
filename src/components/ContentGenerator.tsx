import React, { useState } from 'react';
import { RefreshCw, Wand2, Copy, Check } from 'lucide-react';

interface ContentGeneratorProps {
  apiKey: string;
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ apiKey }) => {
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const generateContent = async () => {
    if (!apiKey) {
      setError('Please set your Groq API key first');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      const systemPrompt = `Generate a short, engaging tweet about startup building, MVP development, or entrepreneurship. 
STRICT RULES:
- Maximum 200 characters (this is mandatory)
- No emojis
- Sound authentic and conversational
- Share practical insights or ask engaging questions
- Write like a real founder sharing their journey`;

      const prompts = [
        "Share a practical insight about MVP development",
        "Share an actionable tip for early-stage startup founders",
        "Ask an engaging question to help fellow founders",
        "Share a lesson learned from building products"
      ];
      
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: randomPrompt }
          ],
          max_tokens: 200,
          temperature: 0.85,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      let content = data.choices[0]?.message?.content?.trim() || '';
      
      // Remove emojis and enforce character limit
      content = content.replace(
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
        ""
      );
      
      if (content.length > 200) {
        content = content.substring(0, 197) + "...";
      }
      
      setGeneratedContent(content);
    } catch (error) {
      console.error('Content generation failed:', error);
      setError('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Content Generator</h2>
            <p className="text-gray-600">Generate tweet ideas (200 char limit)</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Generated Content Display */}
        {generatedContent && (
          <div className="bg-gray-50 rounded-xl p-4 relative">
            <p className="text-gray-800 pr-10">{generatedContent}</p>
            <div className="absolute top-3 right-3 flex items-center space-x-2">
              <span className="text-xs text-gray-500">{generatedContent.length}/200</span>
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={generateContent}
          disabled={isGenerating || !apiKey}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Generating...' : 'Generate Content'}</span>
        </button>

        {/* Info */}
        <div className="bg-blue-50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Content Guidelines:</h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Maximum 200 characters per tweet</li>
            <li>Authentic, conversational tone</li>
            <li>No emojis or special characters</li>
            <li>Focus on value and engagement</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContentGenerator; 