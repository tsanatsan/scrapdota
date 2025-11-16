
import React, { useState } from 'react';
import type { Keyword, Forum } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';

interface SettingsPanelProps {
  keywords: Keyword[];
  forums: Forum[];
  isRunning: boolean;
  onToggleRunning: () => void;
  onAddKeyword: (text: string) => void;
  onRemoveKeyword: (id: string) => void;
  onAddForum: (url: string) => void;
  onRemoveForum: (id: string) => void;
  onClearPosts: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  keywords,
  forums,
  isRunning,
  onToggleRunning,
  onAddKeyword,
  onRemoveKeyword,
  onAddForum,
  onRemoveForum,
  onClearPosts,
}) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [newForum, setNewForum] = useState('');

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    onAddKeyword(newKeyword.trim());
    setNewKeyword('');
  };

  const handleAddForum = (e: React.FormEvent) => {
    e.preventDefault();
    onAddForum(newForum.trim());
    setNewForum('');
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 space-y-8 sticky top-24">
      <div>
        <h2 className="text-xl font-semibold text-gray-200 mb-4">Управление</h2>
        <div className="flex space-x-4">
          <button
            onClick={onToggleRunning}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${
              isRunning
                ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isRunning ? <PauseIcon /> : <PlayIcon />}
            <span className="ml-2">{isRunning ? 'Приостановить' : 'Запустить'}</span>
          </button>
           <button
            onClick={onClearPosts}
            className="w-full flex items-center justify-center px-4 py-2 rounded-md font-semibold transition-colors duration-200 bg-red-600 hover:bg-red-700 text-white"
          >
            <TrashIcon />
            <span className="ml-2">Очистить ленту</span>
          </button>
        </div>
      </div>
      
      {/* Keywords Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-3">Ключевые слова ({keywords.length})</h3>
        <form onSubmit={handleAddKeyword} className="flex mb-4">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Добавить слово..."
            className="flex-grow bg-gray-700 text-gray-200 border border-gray-600 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-r-md">
            <PlusIcon />
          </button>
        </form>
        <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
          {keywords.map(kw => (
            <li key={kw.id} className="flex items-center justify-between bg-gray-700/50 rounded-md p-2">
              <span className="text-gray-300">{kw.text}</span>
              <button onClick={() => onRemoveKeyword(kw.id)} className="text-gray-500 hover:text-red-500">
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Forums Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-3">Целевые форумы ({forums.length})</h3>
        <form onSubmit={handleAddForum} className="flex mb-4">
          <input
            type="text"
            value={newForum}
            onChange={(e) => setNewForum(e.target.value)}
            placeholder="https://forum.example.com"
            className="flex-grow bg-gray-700 text-gray-200 border border-gray-600 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-r-md">
            <PlusIcon />
          </button>
        </form>
        <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
          {forums.map(f => (
            <li key={f.id} className="flex items-center justify-between bg-gray-700/50 rounded-md p-2">
              <span className="text-gray-400 text-sm truncate" title={f.url}>{f.url}</span>
              <button onClick={() => onRemoveForum(f.id)} className="text-gray-500 hover:text-red-500 ml-2 flex-shrink-0">
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};