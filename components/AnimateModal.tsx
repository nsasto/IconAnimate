
import React, { useState } from 'react';

interface AnimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: string) => void;
  iconName: string;
}

const AnimateModal: React.FC<AnimateModalProps> = ({ isOpen, onClose, onConfirm, iconName }) => {
  const [action, setAction] = useState('gentle rotation');

  if (!isOpen) return null;

  const suggestions = [
    'gentle rotation',
    'slow bounce',
    'pulsing glow',
    'subtle floating',
    'smooth side-to-side tilt',
    'light breathing effect'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Animate your "{iconName}"</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <p className="text-gray-600 mb-4">How would you like your icon to move? Keep it simple for best results.</p>
          
          <textarea
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 resize-none mb-4"
            placeholder="e.g. gentle rotation, slow bounce..."
          />
          
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Suggestions</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setAction(s)}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(action)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-200"
            >
              Start Animation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimateModal;
