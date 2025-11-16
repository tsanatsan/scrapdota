
import React from 'react';
import type { Post } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface PostCardProps {
  post: Post;
  onDelete?: (id: string) => void;
}

const getPlural = (number: number, one: string, two: string, five: string): string => {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) {
        return five;
    }
    n %= 10;
    if (n === 1) {
        return one;
    }
    if (n >= 2 && n <= 4) {
        return two;
    }
    return five;
};

const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) {
        const years = Math.floor(interval);
        return `${years} ${getPlural(years, 'год', 'года', 'лет')} назад`;
    }
    
    interval = seconds / 2592000;
    if (interval > 1) {
        const months = Math.floor(interval);
        return `${months} ${getPlural(months, 'месяц', 'месяца', 'месяцев')} назад`;
    }
    
    interval = seconds / 86400;
    if (interval > 1) {
        const days = Math.floor(interval);
        return `${days} ${getPlural(days, 'день', 'дня', 'дней')} назад`;
    }
    
    interval = seconds / 3600;
    if (interval > 1) {
        const hours = Math.floor(interval);
        return `${hours} ${getPlural(hours, 'час', 'часа', 'часов')} назад`;
    }
    
    interval = seconds / 60;
    if (interval > 1) {
        const minutes = Math.floor(interval);
        return `${minutes} ${getPlural(minutes, 'минуту', 'минуты', 'минут')} назад`;
    }
    
    return "только что";
}


export const PostCard: React.FC<PostCardProps> = ({ post, onDelete }) => {
  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-cyan-500 transition-colors duration-300 transform hover:scale-[1.01]">
      <div className="flex justify-between items-start gap-3">
        <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-gray-200 hover:text-cyan-400 transition-colors duration-200 flex-1">
          {post.title}
        </a>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="bg-cyan-800/50 text-cyan-300 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
            {post.matchedKeyword}
          </span>
          {onDelete && (
            <button
              onClick={() => onDelete(post.id)}
              className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded hover:bg-gray-800"
              title="Удалить"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center space-x-4">
           <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
            {post.author}
          </span>
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            {post.sourceForum}
          </span>
        </div>
        <span className="text-gray-500">{timeAgo(post.timestamp)}</span>
      </div>
    </div>
  );
};