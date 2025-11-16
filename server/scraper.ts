import { chromium, Browser, Page } from 'playwright';

interface TopicData {
  id: string;
  title: string;
  url: string;
  author: string;
  content: string;
  steamId: string | null;
  timestamp: Date;
  hasMatch: boolean;
  matchedKeywords: string[];
}

class ForumScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private forumUrl = 'https://dota2.ru/forum/forums/obmen-vnutriigrovymi-predmetami-dota-2.86/';
  private scrapedTopics = new Set<string>();
  private shouldStop = false; // Флаг для остановки парсинга
  
  async initialize() {
    console.log('🚀 Инициализация браузера...');
    this.browser = await chromium.launch({
      headless: true, // Включаем headless для продакшена
      args: ['--no-sandbox']
    });
    this.page = await this.browser.newPage();
    console.log('✅ Браузер готов\n');
  }
  
  async scrapeTopics(keywords: string[], fullScan = false): Promise<TopicData[]> {
    if (!this.page) throw new Error('Браузер не инициализирован');
    
    this.shouldStop = false; // Сбрасываем флаг при старте
    const allTopics: TopicData[] = [];
    let currentPage = 1;
    const MAX_PAGES = fullScan ? 3590 : 5; // Полное сканирование или только первые 5 страниц
    
    console.log(`📚 Режим: ${fullScan ? 'ПОЛНОЕ СКАНИРОВАНИЕ (все 3590 страниц)' : 'БЫСТРАЯ ПРОВЕРКА (первые 5 страниц)'}`);
    console.log(`🔑 Ключевые слова: ${keywords.join(', ')}\n`);
    
    // Проходим по страницам пагинации
    while (currentPage <= MAX_PAGES && !this.shouldStop) {
      const pageUrl = currentPage === 1 
        ? this.forumUrl 
        : `${this.forumUrl}page-${currentPage}`;
      
      console.log(`📄 Страница ${currentPage}/${MAX_PAGES}: ${pageUrl}`);
      
      try {
        await this.page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await this.page.waitForTimeout(1500);
        
        // Собираем топики со страницы и сразу проверяем по ключевым словам
        const pageTopics = await this.page.evaluate((kws) => {
          const links = Array.from(document.querySelectorAll('a[href*="/threads/"]'));
          const seen = new Set<string>();
          const results: Array<{title: string, url: string, matched: string[]}> = [];
          
          links.forEach(link => {
            const href = (link as HTMLAnchorElement).href;
            const title = link.textContent?.trim() || '';
            
            // Игнорируем пустые, дубликаты и ссылки на профили
            if (!title || !href || seen.has(href) || href.includes('/members/')) {
              return;
            }
            
            seen.add(href);
            
            // Проверяем совпадения с ключевыми словами в названии
            const titleLower = title.toLowerCase();
            const matchedKeywords = kws.filter(kw => titleLower.includes(kw.toLowerCase()));
            
            if (matchedKeywords.length > 0) {
              results.push({ 
                title, 
                url: href,
                matched: matchedKeywords
              });
            }
          });
          
          return results;
        }, keywords);
        
        // Добавляем найденные топики
        pageTopics.forEach(topic => {
          if (!this.scrapedTopics.has(topic.url)) {
            const topicData: TopicData = {
              id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
              title: topic.title,
              url: topic.url,
              author: 'Неизвестно', // Не парсим автора для скорости
              content: '', // Не парсим содержимое - только название
              steamId: null,
              timestamp: new Date(),
              hasMatch: true,
              matchedKeywords: topic.matched
            };
            
            allTopics.push(topicData);
            this.scrapedTopics.add(topic.url);
            
            console.log(`  ✅ "${topic.title.substring(0, 60)}..." → [${topic.matched.join(', ')}]`);
          }
        });
        
        console.log(`  → Найдено совпадений: ${pageTopics.length}\n`);
        
        // Проверяем, есть ли кнопка "вперёд" для следующей страницы
        const hasNextPage = await this.page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('[class*="pagination"] a'));
          return links.some(link => link.textContent?.trim().toLowerCase() === 'вперёд');
        });
        
        if (!hasNextPage) {
          console.log('🏁 Достигнута последняя страница\n');
          break;
        }
        
        // Проверяем, не остановлен ли парсинг
        if (this.shouldStop) {
          console.log('⏸️ Парсинг остановлен\n');
          break;
        }
        
        currentPage++;
        
      } catch (error: any) {
        console.error(`❌ Ошибка на странице ${currentPage}: ${error.message}`);
        break;
      }
    }
    
    console.log(`\n✅ Всего найдено топиков с совпадениями: ${allTopics.length}\n`);
    return allTopics;
  }
  
  // Получить все топики со страницы (без фильтрации)
  async getAllTopicsFromPages(maxPages: number): Promise<Array<{topicId: string, title: string, url: string}>> {
    if (!this.page) throw new Error('Браузер не инициализирован');
    
    this.shouldStop = false;
    const allTopics: Array<{topicId: string, title: string, url: string}> = [];
    let currentPage = 1;
    
    console.log(`📚 Сбор всех топиков (макс ${maxPages} страниц)...\n`);
    
    while (currentPage <= maxPages && !this.shouldStop) {
      const pageUrl = currentPage === 1 
        ? this.forumUrl 
        : `${this.forumUrl}page-${currentPage}`;
      
      if (currentPage % 50 === 0) {
        console.log(`📄 Прогресс: ${currentPage}/${maxPages} страниц...`);
      }
      
      try {
        await this.page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await this.page.waitForTimeout(1000);
        
        const pageTopics = await this.page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="/threads/"]'));
          const seen = new Set<string>();
          const results: Array<{topicId: string, title: string, url: string}> = [];
          
          links.forEach(link => {
            const href = (link as HTMLAnchorElement).href;
            const title = link.textContent?.trim() || '';
            
            if (!title || !href || seen.has(href) || href.includes('/members/')) {
              return;
            }
            
            seen.add(href);
            
            // Извлекаем ID из URL
            const match = href.match(/\/threads\/([^/]+)/);
            const topicId = match ? match[1] : href;
            
            results.push({ topicId, title, url: href });
          });
          
          return results;
        });
        
        allTopics.push(...pageTopics);
        
        const hasNextPage = await this.page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('[class*="pagination"] a'));
          return links.some(link => link.textContent?.trim().toLowerCase() === 'вперёд');
        });
        
        if (!hasNextPage) {
          console.log(`🏁 Достигнута последняя страница (${currentPage})\n`);
          break;
        }
        
        if (this.shouldStop) {
          console.log('⏸️ Сбор остановлен\n');
          break;
        }
        
        currentPage++;
        
      } catch (error: any) {
        console.error(`❌ Ошибка на странице ${currentPage}: ${error.message}`);
        break;
      }
    }
    
    console.log(`✅ Собрано топиков: ${allTopics.length}\n`);
    return allTopics;
  }
  
  private async parseTopicContent(): Promise<string> {
    try {
      // Ищем содержимое ПЕРВОГО поста (описание топика автором)
      // Пробуем разные селекторы для XenForo форумов
      const selectors = [
        '.message:first-of-type',  // Первое сообщение
        'article:first-of-type',
        '.post:first-of-type',
        '[data-content="message-body"]',
      ];
      
      for (const selector of selectors) {
        const element = await this.page?.$(selector);
        if (element) {
          const text = await element.textContent();
          if (text && text.trim().length > 0) {
            return text.trim();
          }
        }
      }
      
      return '';
    } catch {
      return '';
    }
  }
  
  private async parseAuthor(): Promise<string> {
    try {
      const authorElement = await this.page?.$('.username, .author, [data-author]');
      return await authorElement?.textContent() || 'Неизвестно';
    } catch {
      return 'Неизвестно';
    }
  }
  
  private extractSteamId(content: string): string | null {
    // Ищем Steam ID в разных форматах
    const patterns = [
      /steamcommunity\.com\/id\/([a-zA-Z0-9_-]+)/,
      /steamcommunity\.com\/profiles\/(\d+)/,
      /steam_id[:\s]*([a-zA-Z0-9_-]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }
  
  private findMatches(title: string, content: string, keywords: string[]): string[] {
    const text = `${title} ${content}`.toLowerCase();
    return keywords.filter(keyword => text.includes(keyword.toLowerCase()));
  }
  
  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔚 Браузер закрыт');
    }
  }
  
  stop() {
    this.shouldStop = true;
    console.log('🛑 Запрос на остановку парсинга...');
  }
}

export { ForumScraper };
export type { TopicData };
