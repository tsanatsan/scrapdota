
import React from 'react';
import type { Post } from '../types';
import { PostCard } from './PostCard';

interface ResultsFeedProps {
  posts: Post[];
}

export const ResultsFeed: React.FC<ResultsFeedProps> = ({ posts }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-200 mb-4 border-b border-gray-700 pb-3">Лента результатов</h2>
      {posts.length > 0 ? (
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500">Посты пока не найдены. Запустите скрапер, чтобы увидеть результаты.</p>
        </div>
      )}
    </div>
  );
};