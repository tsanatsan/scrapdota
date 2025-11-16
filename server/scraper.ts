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
  
  async initialize() {
    console.log('🚀 Инициализация браузера...');
    this.browser = await chromium.launch({
      headless: true, // Включаем headless для продакшена
      args: ['--no-sandbox']
    });
    this.page = await this.browser.newPage();
    console.log('✅ Браузер готов\n');
  }
  
  async scrapeTopics(keywords: string[]): Promise<TopicData[]> {
    if (!this.page) throw new Error('Браузер не инициализирован');
    
    console.log(`📥 Загрузка форума: ${this.forumUrl}`);
    await this.page.goto(this.forumUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Ждём загрузки контента
    await this.page.waitForTimeout(3000);
    
    console.log('🔍 Поиск топиков...');
    
    // Собираем информацию о топиках (ссылки на threads)
    const topicLinks = await this.page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/threads/"]'));
      const seen = new Set<string>();
      const result: Array<{title: string, url: string}> = [];
      
      links.forEach(link => {
        const href = (link as HTMLAnchorElement).href;
        const title = link.textContent?.trim() || '';
        
        // Игнорируем пустые и дубликаты
        if (title && href && !seen.has(href) && !href.includes('/members/')) {
          seen.add(href);
          result.push({ title, url: href });
        }
      });
      
      return result;
    });
    
    console.log(`📊 Найдено топиков: ${topicLinks.length}\n`);
    
    // Ограничиваем количество парсимых топиков (10 за раз)
    const MAX_TOPICS_PER_RUN = 10;
    const topicsToProcess = topicLinks.slice(0, MAX_TOPICS_PER_RUN);
    
    if (topicsToProcess.length < topicLinks.length) {
      console.log(`⚠️ Ограничение: будет обработано ${MAX_TOPICS_PER_RUN} из ${topicLinks.length}\n`);
    }
    
    const topics: TopicData[] = [];
    
    // Переходим по каждому топику
    for (const {title, url} of topicsToProcess) {
      try {
        // Пропускаем уже обработанные
        if (this.scrapedTopics.has(url)) continue;
        
        console.log(`📌 Парсинг: "${title.substring(0, 50)}..."`);
        
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await this.page.waitForTimeout(2000);
        
        // Парсим содержимое топика
        const content = await this.parseTopicContent();
        const author = await this.parseAuthor();
        const steamId = this.extractSteamId(content);
        
        // Проверяем совпадения с ключевыми словами
        const matchedKeywords = this.findMatches(title, content, keywords);
        
        const topic: TopicData = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          title: title.trim(),
          url,
          author,
          content: content.substring(0, 500), // Ограничиваем размер
          steamId,
          timestamp: new Date(),
          hasMatch: matchedKeywords.length > 0,
          matchedKeywords
        };
        
        topics.push(topic);
        this.scrapedTopics.add(url);
        
        if (matchedKeywords.length > 0) {
          console.log(`  ✅ Совпадения: ${matchedKeywords.join(', ')}`);
        } else {
          console.log(`  📄 Без совпадений`);
        }
        
      } catch (error: any) {
        console.error(`❌ Ошибка при парсинге топика "${title.substring(0, 30)}...": ${error.message}`);
      }
    }
    
    console.log(`\n✅ Обработано топиков: ${topics.length}\n`);
    return topics;
  }
  
  private async parseTopicContent(): Promise<string> {
    try {
      // Ищем содержимое топика (первый пост)
      const contentElement = await this.page?.$('.message-body, .bbWrapper, article');
      return await contentElement?.textContent() || '';
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
}

export { ForumScraper };
export type { TopicData };
