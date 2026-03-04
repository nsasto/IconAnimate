
import React from 'react';
import { setStoredApiKey } from '../services/gemini';

interface ApiKeyNoticeProps {
  onKeySelected: () => void;
}

const ApiKeyNotice: React.FC<ApiKeyNoticeProps> = ({ onKeySelected }) => {
  const [apiKey, setApiKey] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      setError("Please enter a valid API key.");
      return;
    }
    setStoredApiKey(apiKey);
    onKeySelected();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 text-2xl">
          <i className="fas fa-key"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">API Key Required</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Enter your Gemini API key to generate premium icons and high-quality animations.
        </p>
        <div className="space-y-4">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              if (error) setError('');
            }}
            placeholder="Paste your Gemini API key"
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900"
          />
          {error && (
            <div className="text-sm text-red-600 font-medium">{error}</div>
          )}
          <button
            onClick={handleSaveKey}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-200"
          >
            Save API Key
          </button>
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Learn about API Key billing <i className="fas fa-external-link-alt ml-1"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyNotice;
