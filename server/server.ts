import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';
import type { Post, Keyword, Forum } from '../types';

const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 8080;

// --- State Management ---
let keywords: Keyword[] = [
  { id: '1', text: 'продам' },
  { id: '2', text: 'куплю' },
  { id: '3', text: 'обмен' },
  { id: '4', text: 'cache' },
];
let forums: Forum[] = [
  { id: '1', url: 'https://dota2.ru/forum/forums/obmen-predmetami-dota-2.910/' },
];
let isRunning: boolean = true;
// Fix: Use ReturnType<typeof setInterval> for better type safety with setInterval's return value.
let scrapingInterval: ReturnType<typeof setInterval> | null = null;
const scrapedPostUrls = new Set<string>();

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

// --- Scraping Logic ---
const scrapeForums = async () => {
  console.log('Запуск цикла скрапинга...');
  for (const forum of forums) {
    try {
      const { data: html } = await axios.get(forum.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
      });
      const $ = cheerio.load(html);

      // ПРИМЕЧАНИЕ: Эти селекторы настроены для dota2.ru/forum. Для других форумов их, возможно, придется настроить.
      const selectors = 'div.structItem-title > a';

      $(selectors).each((_i, element) => {
        const title = $(element).text().trim();
        let postUrl = $(element).attr('href');
        
        if (!title || !postUrl) return;

        // Нормализация URL
        if (postUrl.startsWith('/')) {
            const forumUrl = new URL(forum.url);
            postUrl = `${forumUrl.protocol}//${forumUrl.hostname}${postUrl}`;
        }

        for (const keyword of keywords) {
          if (title.toLowerCase().includes(keyword.text.toLowerCase()) && !scrapedPostUrls.has(postUrl)) {
            console.log(`Найдено совпадение: "${title}" по ключевому слову "${keyword.text}"`);
            
            scrapedPostUrls.add(postUrl);

            const newPost: Post = {
              id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
              title,
              url: postUrl,
              sourceForum: new URL(forum.url).hostname,
              matchedKeyword: keyword.text,
              timestamp: new Date(),
              author: 'Неизвестен', // Автор извлекается сложнее, оставим пока так
            };

            broadcast({ type: 'NEW_POST', payload: newPost });
            break; 
          }
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Ошибка при скрапинге ${forum.url}: ${error.message}`);
      } else {
        console.error(`Неизвестная ошибка при скрапинге ${forum.url}:`, error);
      }
    }
  }
};


const startScraping = () => {
  if (isRunning && !scrapingInterval) {
    console.log('Запуск скрапера...');
    scrapeForums(); // Запустить немедленно один раз
    scrapingInterval = setInterval(scrapeForums, 30000); // Повторять каждые 30 секунд
  }
};

const stopScraping = () => {
  if (scrapingInterval) {
    console.log('Остановка скрапера...');
    clearInterval(scrapingInterval);
    scrapingInterval = null;
  }
};


// --- WebSocket Server Logic ---
wss.on('connection', ws => {
  console.log('Клиент подключен');

  // Отправляем начальное состояние новому клиенту
  ws.send(JSON.stringify({
    type: 'INIT_STATE',
    payload: { keywords, forums, isRunning },
  }));

  ws.on('message', message => {
    const data = JSON.parse(message.toString());
    
    switch (data.type) {
      case 'START_SCRAPING':
        isRunning = true;
        startScraping();
        break;
      case 'STOP_SCRAPING':
        isRunning = false;
        stopScraping();
        break;
      case 'ADD_KEYWORD':
        keywords.push({ id: Date.now().toString(), text: data.payload.text });
        break;
      case 'REMOVE_KEYWORD':
        keywords = keywords.filter(kw => kw.id !== data.payload.id);
        break;
      case 'ADD_FORUM':
        forums.push({ id: Date.now().toString(), url: data.payload.url });
        break;
      case 'REMOVE_FORUM':
        forums = forums.filter(f => f.id !== data.payload.id);
        break;
    }
    
    broadcastState();
  });

  ws.on('close', () => {
    console.log('Клиент отключен');
  });
});

// --- Start Server ---
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  startScraping();
});