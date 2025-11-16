import React, { useMemo } from 'react';
import type { Post } from '../types';
import { PostCard } from './PostCard';

interface ResultsFeedProps {
  posts: Post[];
  filterKeyword: string;
  sortBy: 'date' | 'keyword';
  onFilterChange: (filter: string) => void;
  onSortChange: (sort: 'date' | 'keyword') => void;
  onDeletePost: (id: string) => void;
}

export const ResultsFeed: React.FC<ResultsFeedProps> = ({ 
  posts, 
  filterKeyword, 
  sortBy, 
  onFilterChange, 
  onSortChange,
  onDeletePost 
}) => {
  // Фильтрация и сортировка постов
  const processedPosts = useMemo(() => {
    let filtered = posts;
    
    // Фильтрация
    if (filterKeyword !== 'all') {
      filtered = posts.filter(post => 
        post.matchedKeyword.toLowerCase() === filterKeyword.toLowerCase()
      );
    }
    
    // Сортировка
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else {
        return a.matchedKeyword.localeCompare(b.matchedKeyword);
      }
    });
    
    return sorted;
  }, [posts, filterKeyword, sortBy]);
  
  // Получаем уникальные ключевые слова для фильтра
  const uniqueKeywords = useMemo(() => {
    const keywords = new Set(posts.map(p => p.matchedKeyword).filter(k => k));
    return Array.from(keywords);
  }, [posts]);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold text-gray-200">
          Лента результатов ({processedPosts.length})
        </h2>
        
        <div className="flex gap-3 w-full sm:w-auto">
          {/* Фильтр */}
          <select 
            value={filterKeyword}
            onChange={(e) => onFilterChange(e.target.value)}
            className="bg-gray-700 text-gray-200 px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex-1 sm:flex-none"
          >
            <option value="all">Все ключевые слова</option>
            {uniqueKeywords.map(keyword => (
              <option key={keyword} value={keyword}>{keyword}</option>
            ))}
          </select>
          
          {/* Сортировка */}
          <select 
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'date' | 'keyword')}
            className="bg-gray-700 text-gray-200 px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex-1 sm:flex-none"
          >
            <option value="date">По дате</option>
            <option value="keyword">По ключ. слову</option>
          </select>
        </div>
      </div>
      
      <div className="border-b border-gray-700 mb-4"></div>
      
      {processedPosts.length > 0 ? (
        <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
          {processedPosts.map(post => (
            <PostCard key={post.id} post={post} onDelete={onDeletePost} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500">
            {posts.length === 0 
              ? 'Посты пока не найдены. Запустите скрапер, чтобы увидеть результаты.'
              : 'Нет постов, соответствующих фильтру.'
            }
          </p>
        </div>
      )}
    </div>
  );
};