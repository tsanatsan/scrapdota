import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { SettingsPanel } from './components/SettingsPanel';
import { ResultsFeed } from './components/ResultsFeed';
import type { Post, Keyword, Forum } from './types';

const WEBSOCKET_URL = 'ws://localhost:8080';

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([
    { id: '1', text: 'продам' },
    { id: '2', text: 'куплю' },
    { id: '3', text: 'обмен' },
    { id: '4', text: 'cache' },
  ]);
  const [forums, setForums] = useState<Forum[]>([
    { id: '1', url: 'https://dota2.ru/forum/forums/obmen-predmetami-dota-2.910/' },
  ]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [filterKeyword, setFilterKeyword] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'keyword'>('date');

  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket(WEBSOCKET_URL);

      ws.current.onopen = () => {
        console.log('WebSocket подключен');
        setIsConnected(true);
      };

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'INIT_STATE':
            setKeywords(message.payload.keywords);
            setForums(message.payload.forums);
            setIsRunning(message.payload.isRunning);
            if (message.payload.posts) {
              setPosts(message.payload.posts.map((p: any) => ({
                ...p,
                timestamp: new Date(p.timestamp)
              })));
            }
            break;
          case 'STATE_UPDATE':
            setKeywords(message.payload.keywords);
            setForums(message.payload.forums);
            setIsRunning(message.payload.isRunning);
            break;
          case 'NEW_POST':
            const newPost: Post = {
              ...message.payload,
              timestamp: new Date(message.payload.timestamp),
            };
            setPosts(prevPosts => [newPost, ...prevPosts.slice(0, 99)]);
            break;
          case 'POST_DELETED':
            setPosts(prevPosts => prevPosts.filter(p => p.id !== message.payload.id));
            break;
          case 'POSTS_CLEARED':
            setPosts([]);
            break;
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket отключен. Попытка переподключения...');
        setIsConnected(false);
        setTimeout(connect, 3000); // Попробовать переподключиться через 3 секунды
      };
      
      ws.current.onerror = (error) => {
        console.error('WebSocket ошибка. Не удалось подключиться к', WEBSOCKET_URL, 'Детали:', error);
        ws.current?.close();
      };
    };

    connect();

    return () => {
      ws.current?.close();
    };
  }, []);

  const sendMessage = (type: string, payload?: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, payload }));
    } else {
      console.error('WebSocket не подключен.');
    }
  };

  const addKeyword = (text: string) => {
    if (text && !keywords.some(kw => kw.text.toLowerCase() === text.toLowerCase())) {
      sendMessage('ADD_KEYWORD', { text });
    }
  };

  const removeKeyword = (id: string) => {
    sendMessage('REMOVE_KEYWORD', { id });
  };

  const addForum = (url: string) => {
    try {
      new URL(url); // Валидация URL на клиенте
      if (url && !forums.some(f => f.url.toLowerCase() === url.toLowerCase())) {
        sendMessage('ADD_FORUM', { url });
      }
    } catch (error) {
      alert('Пожалуйста, введите корректный URL.');
    }
  };

  const removeForum = (id: string) => {
    sendMessage('REMOVE_FORUM', { id });
  };
  
  const clearPosts = () => {
    setPosts([]);
    sendMessage('CLEAR_POSTS');
  };
  
  const deletePost = (id: string) => {
    sendMessage('DELETE_POST', { id });
  };
  
  const toggleRunning = () => {
    sendMessage(isRunning ? 'STOP_SCRAPING' : 'START_SCRAPING');
  };
  
  const refreshNow = () => {
    sendMessage('REFRESH_NOW');
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        {!isConnected && (
           <div className="fixed top-16 left-0 right-0 bg-red-800 text-white text-center p-3 z-20 shadow-lg border-b border-red-600">
             <p className="font-bold">Не удается подключиться к серверу.</p>
             <p className="text-sm mt-1">
               Убедитесь, что сервер запущен (команда <code className="bg-gray-700 p-1 rounded-sm">npm start</code> в папке <code className="bg-gray-700 p-1 rounded-sm">server</code>) и что брандмауэр или антивирус не блокируют соединение с <code className="bg-gray-700 p-1 rounded-sm">localhost:8080</code>.
             </p>
           </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <SettingsPanel
              keywords={keywords}
              forums={forums}
              isRunning={isRunning}
              onToggleRunning={toggleRunning}
              onAddKeyword={addKeyword}
              onRemoveKeyword={removeKeyword}
              onAddForum={addForum}
              onRemoveForum={removeForum}
              onClearPosts={clearPosts}
              onRefreshNow={refreshNow}
            />
          </div>
          <div className="lg:col-span-2">
            <ResultsFeed 
              posts={posts}
              filterKeyword={filterKeyword}
              sortBy={sortBy}
              onFilterChange={setFilterKeyword}
              onSortChange={setSortBy}
              onDeletePost={deletePost}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;