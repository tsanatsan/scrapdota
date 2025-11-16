import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { ForumScraper, TopicData } from './scraper';
import type { Post, Keyword, Forum } from './types';

const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 8080;
const USE_MOCK_DATA = true; // Пока используем мок-данные
const SCRAPE_INTERVAL = 5 * 60 * 1000; // 5 минут

// --- State Management ---
let keywords: Keyword[] = [
  { id: '1', text: 'продам' },
  { id: '2', text: 'куплю' },
  { id: '3', text: 'обмен' },
  { id: '4', text: 'cache' },
  { id: '5', text: 'arcana' },
];

let forums: Forum[] = [
  { id: '1', url: 'https://dota2.ru/forum/forums/obmen-predmetami-dota-2.910/' },
];

let isRunning: boolean = true;
let scrapingInterval: ReturnType<typeof setInterval> | null = null;
const posts: Post[] = [];
let scraper: ForumScraper | null = null;

// --- Helper Functions ---
const broadcast = (message: object) => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

const broadcastState = () => {
  broadcast({
    type: 'STATE_UPDATE',
    payload: { keywords, forums, isRunning },
  });
};

// --- Mock Data Generator ---
const generateMockPost = (hasMatch: boolean): Post => {
  const mockTitles = [
    'Продам Arcana на Juggernaut',
    'Куплю любые Cache-наборы 2024',
    'Обмен immortal на arcana',
    'Продаю набор Dota Plus',
    'Кто продаст ultra rare из кеша?',
    'Обсуждение патча 7.35',
    'Вопрос по механике героя',
  ];
  
  const title = hasMatch 
    ? mockTitles[Math.floor(Math.random() * 5)] 
    : mockTitles[5 + Math.floor(Math.random() * 2)];
  
  const matchedKeyword = hasMatch 
    ? keywords[Math.floor(Math.random() * keywords.length)].text 
    : '';
  
  return {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    title,
    url: `https://dota2.ru/forum/topic/${Math.floor(Math.random() * 100000)}/`,
    sourceForum: 'dota2.ru',
    matchedKeyword,
    timestamp: new Date(),
    author: `User${Math.floor(Math.random() * 1000)}`,
  };
};

// --- Real Scraping Logic ---
const scrapeForums = async () => {
  if (USE_MOCK_DATA) {
    console.log('🎭 Генерация мок-данных...');
    
    // Генерируем 1-3 новых поста
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      const hasMatch = Math.random() > 0.4; // 60% с совпадениями
      const newPost = generateMockPost(hasMatch);
      posts.unshift(newPost);
      
      broadcast({ type: 'NEW_POST', payload: newPost });
      console.log(`  ${hasMatch ? '✅' : '📄'} ${newPost.title}`);
    }
    
    // Ограничиваем количество постов
    if (posts.length > 50) {
      posts.splice(50);
    }
    
  } else {
    // Реальный парсинг
    console.log('🔍 Запуск реального парсинга...');
    
    try {
      if (!scraper) {
        scraper = new ForumScraper();
        await scraper.initialize();
      }
      
      const keywordTexts = keywords.map(k => k.text);
      const topics = await scraper.scrapeTopics(keywordTexts);
      
      topics.forEach(topic => {
        const newPost: Post = {
          id: topic.id,
          title: topic.title,
          url: topic.url,
          sourceForum: 'dota2.ru',
          matchedKeyword: topic.matchedKeywords[0] || '',
          timestamp: topic.timestamp,
          author: topic.author,
        };
        
        posts.unshift(newPost);
        broadcast({ type: 'NEW_POST', payload: newPost });
      });
      
      console.log(`✅ Найдено: ${topics.length} топиков`);
      
    } catch (error) {
      console.error('❌ Ошибка парсинга:', error);
    }
  }
};

const startScraping = () => {
  if (isRunning && !scrapingInterval) {
    console.log('▶️ Запуск скрапера...');
    scrapeForums(); // Запустить немедленно
    scrapingInterval = setInterval(scrapeForums, SCRAPE_INTERVAL);
  }
};

const stopScraping = () => {
  if (scrapingInterval) {
    console.log('⏸️ Остановка скрапера...');
    clearInterval(scrapingInterval);
    scrapingInterval = null;
  }
};

// --- WebSocket Server Logic ---
wss.on('connection', ws => {
  console.log('🔗 Клиент подключен');

  // Отправляем начальное состояние
  ws.send(JSON.stringify({
    type: 'INIT_STATE',
    payload: { keywords, forums, isRunning, posts },
  }));

  ws.on('message', message => {
    const data = JSON.parse(message.toString());
    
    switch (data.type) {
      case 'START_SCRAPING':
        isRunning = true;
        startScraping();
        broadcastState();
        break;
        
      case 'STOP_SCRAPING':
        isRunning = false;
        stopScraping();
        broadcastState();
        break;
        
      case 'ADD_KEYWORD':
        keywords.push({ id: Date.now().toString(), text: data.payload.text });
        broadcastState();
        break;
        
      case 'REMOVE_KEYWORD':
        keywords = keywords.filter(kw => kw.id !== data.payload.id);
        broadcastState();
        break;
        
      case 'ADD_FORUM':
        forums.push({ id: Date.now().toString(), url: data.payload.url });
        broadcastState();
        break;
        
      case 'REMOVE_FORUM':
        forums = forums.filter(f => f.id !== data.payload.id);
        broadcastState();
        break;
        
      case 'DELETE_POST':
        const postIndex = posts.findIndex(p => p.id === data.payload.id);
        if (postIndex !== -1) {
          posts.splice(postIndex, 1);
          broadcast({ type: 'POST_DELETED', payload: { id: data.payload.id } });
        }
        break;
        
      case 'CLEAR_POSTS':
        posts.length = 0;
        broadcast({ type: 'POSTS_CLEARED' });
        break;
        
      case 'REFRESH_NOW':
        console.log('🔄 Запрос немедленного обновления...');
        if (isRunning) {
          scrapeForums();
        }
        break;
    }
  });

  ws.on('close', () => {
    console.log('🔗 Клиент отключен');
  });
});

// --- Start Server ---
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`🎭 Режим: ${USE_MOCK_DATA ? 'Mock-данные' : 'Реальный парсинг'}`);
  console.log(`⏱️  Интервал: ${SCRAPE_INTERVAL / 1000 / 60} мин\n`);
  
  startScraping();
});