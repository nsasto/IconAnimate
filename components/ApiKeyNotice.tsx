
import React from 'react';
import { requestApiKey } from '../services/gemini';

interface ApiKeyNoticeProps {
  onKeySelected: () => void;
}

const ApiKeyNotice: React.FC<ApiKeyNoticeProps> = ({ onKeySelected }) => {
  const handleSelectKey = async () => {
    try {
      await requestApiKey();
      // Assume success as per instructions to avoid race condition
      onKeySelected();
    } catch (error) {
      console.error("Failed to open key selection", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 text-2xl">
          <i className="fas fa-key"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">API Key Required</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          To generate premium icons and high-quality animations, you need to select a valid API key from a paid GCP project.
        </p>
        <div className="space-y-4">
          <button
            onClick={handleSelectKey}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-200"
          >
            Select API Key
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
