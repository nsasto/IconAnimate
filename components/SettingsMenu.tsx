
import React from 'react';
import { requestApiKey } from '../services/gemini';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onClearGallery: () => void;
  hasIcons: boolean;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ isOpen, onClose, onClearGallery, hasIcons }) => {
  if (!isOpen) return null;

  const handleUpdateKey = async () => {
    try {
      await requestApiKey();
      onClose();
    } catch (error) {
      console.error("Failed to open key selection", error);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <i className="fas fa-cog text-indigo-500"></i>
            Application Settings
          </h3>
        </div>
        
        <div className="p-2">
          <button
            onClick={handleUpdateKey}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <i className="fas fa-key text-sm"></i>
            </div>
            <div>
              <p className="text-sm font-bold">Manage API Key</p>
              <p className="text-[10px] text-gray-400">Add or change your active key</p>
            </div>
          </button>

          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <i className="fas fa-credit-card text-sm"></i>
            </div>
            <div>
              <p className="text-sm font-bold">Billing Docs</p>
              <p className="text-[10px] text-gray-400">Setup paid usage for Veo</p>
            </div>
          </a>

          <div className="my-2 border-t border-gray-50"></div>

          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear your entire gallery?")) {
                onClearGallery();
                onClose();
              }
            }}
            disabled={!hasIcons}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors text-left group disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <i className="fas fa-trash-alt text-sm"></i>
            </div>
            <div>
              <p className="text-sm font-bold">Clear Gallery</p>
              <p className="text-[10px] text-gray-400">Remove all generated items</p>
            </div>
          </button>
        </div>
        
        <div className="p-3 bg-gray-50 text-center">
          <p className="text-[10px] text-gray-400 font-medium tracking-tight">IconoAnimate v1.2.0 • Paid Key Required</p>
        </div>
      </div>
    </>
  );
};

export default SettingsMenu;
