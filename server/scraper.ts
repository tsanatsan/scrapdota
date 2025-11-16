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
  private forumUrl = 'https://dota2.ru/forum/forums/obmen-predmetami-dota-2.910/';
  private scrapedTopics = new Set<string>();
  
  async initialize() {
    console.log('🚀 Инициализация браузера...');
    this.browser = await chromium.launch({
      headless: true,
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
    
    // Сначала собираем информацию о всех топиках на странице
    const topicListData = await this.page.evaluate(() => {
      const blocks = document.querySelectorAll('.forum__block-topic-title');
      const result: Array<{title: string, index: number}> = [];
      
      blocks.forEach((block, index) => {
        const title = block.textContent?.trim() || '';
        if (title) {
          result.push({ title, index });
        }
      });
      
      return result;
    });
    
    console.log(`📊 Найдено топиков: ${topicListData.length}\n`);
    
    const topics: TopicData[] = [];
    
    // Теперь переходим по каждому топику
    for (const {title, index} of topicListData) {
      try {
        // Перезагружаем страницу форума перед каждым кликом
        await this.page.goto(this.forumUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await this.page.waitForTimeout(2000);
        
        // Находим нужный блок и кликаем
        const blocks = await this.page.$$('.forum__block-topic-title');
        if (index >= blocks.length) continue;
        
        const parent = await blocks[index].evaluateHandle(el => el.parentElement);
        
        console.log(`📌 Парсинг ${index + 1}/${topicListData.length}: "${title.substring(0, 50)}..."`);
        
        const currentUrl = this.page.url();
        await parent.asElement()?.click();
        await this.page.waitForTimeout(3000); // Ждём загрузки
        
        const topicUrl = this.page.url();
        
        if (topicUrl !== currentUrl && !this.scrapedTopics.has(topicUrl)) {
          // Парсим содержимое топика
          const content = await this.parseTopicContent();
          const author = await this.parseAuthor();
          const steamId = this.extractSteamId(content);
          
          // Проверяем совпадения с ключевыми словами
          const matchedKeywords = this.findMatches(title, content, keywords);
          
          const topic: TopicData = {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            title: title.trim(),
            url: topicUrl,
            author,
            content: content.substring(0, 500), // Ограничиваем размер
            steamId,
            timestamp: new Date(),
            hasMatch: matchedKeywords.length > 0,
            matchedKeywords
          };
          
          topics.push(topic);
          this.scrapedTopics.add(topicUrl);
          
          if (matchedKeywords.length > 0) {
            console.log(`  ✅ Совпадения: ${matchedKeywords.join(', ')}`);
          } else {
            console.log(`  📄 Без совпадений`);
          }
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
