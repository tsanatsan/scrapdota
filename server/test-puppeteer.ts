import puppeteer from 'puppeteer';

const testPuppeteerScraping = async () => {
  console.log('🚀 Запуск браузера...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    const forumUrl = 'https://dota2.ru/forum/forums/obmen-predmetami-dota-2.910/';
    console.log(`📥 Загрузка страницы: ${forumUrl}\n`);
    
    await page.goto(forumUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('✅ Страница загружена\n');
    
    // Ждём загрузки контента
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Извлекаем топики
    const topics = await page.evaluate(() => {
      const results: Array<{title: string, url: string}> = [];
      
      // Пробуем разные селекторы
      const selectors = [
        '.forum__block-topic-title',
        'div[class*="forum__block"]',
        'a[href*="topic"]',
        '.component-block__block'
      ];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          console.log(`Найдено ${elements.length} элементов с селектором: ${selector}`);
          
          elements.forEach(el => {
            // Ищем ссылку внутри или рядом
            const link = el.querySelector('a') || el.closest('a');
            const title = el.textContent?.trim() || '';
            const href = link?.getAttribute('href') || el.getAttribute('data-url');
            
            if (title && href && !results.find(r => r.url === href)) {
              results.push({ title, url: href });
            }
          });
          
          if (results.length > 0) break;
        }
      }
      
      return results;
    });
    
    console.log(`\n📋 Найдено топиков: ${topics.length}\n`);
    
    if (topics.length > 0) {
      console.log('Первые 10 топиков:\n');
      topics.slice(0, 10).forEach((topic, i) => {
        console.log(`${i + 1}. "${topic.title.substring(0, 60)}${topic.title.length > 60 ? '...' : ''}"`);
        console.log(`   URL: ${topic.url}\n`);
      });
      
      // Проверка с ключевыми словами
      const keywords = ['продам', 'куплю', 'обмен', 'cache'];
      console.log('\n🔑 Поиск совпадений с ключевыми словами:\n');
      
      let matches = 0;
      topics.forEach(topic => {
        const titleLower = topic.title.toLowerCase();
        for (const keyword of keywords) {
          if (titleLower.includes(keyword.toLowerCase())) {
            matches++;
            console.log(`✅ "${topic.title}"`);
            console.log(`   Ключевое слово: "${keyword}"`);
            console.log(`   URL: ${topic.url}\n`);
            break;
          }
        }
      });
      
      console.log(`\n📊 Всего совпадений: ${matches}`);
    } else {
      console.log('❌ Топики не найдены. Сохраняю скриншот и HTML...\n');
      
      await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
      const html = await page.content();
      const fs = await import('fs');
      fs.writeFileSync('debug-page.html', html);
      
      console.log('✅ Сохранены: debug-screenshot.png, debug-page.html');
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await browser.close();
    console.log('\n🔚 Браузер закрыт');
  }
};

testPuppeteerScraping();
