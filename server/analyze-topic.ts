import { chromium } from 'playwright';

async function analyzeTopic() {
  console.log('🔍 Анализ структуры страницы топика\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Берём любой топик с форума
    const url = 'https://dota2.ru/forum/threads/kollektors-kesh-2015-16.1619382/';
    console.log(`📥 Загрузка: ${url}\n`);
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Ищем различные селекторы для постов
    const selectors = [
      'article',
      '.message',
      '.message-body',
      '.bbWrapper',
      '[class*="message"]',
      '[data-content="message-body"]',
      '.message-userContent',
      '.message-content',
    ];
    
    console.log('Проверка селекторов для постов:\n');
    
    for (const selector of selectors) {
      const count = await page.$$eval(selector, els => els.length).catch(() => 0);
      console.log(`${selector.padEnd(35)} → ${count} элементов`);
    }
    
    // Пробуем найти первый пост (пост автора топика)
    console.log('\n🔎 Поиск первого поста:\n');
    
    const firstPostData = await page.evaluate(() => {
      // Пробуем разные варианты
      const variants = [
        { selector: 'article.message:first-of-type .bbWrapper', name: 'article.message:first-of-type .bbWrapper' },
        { selector: '.message:first-of-type .message-body', name: '.message:first-of-type .message-body' },
        { selector: '[data-content="message-body"]:first-of-type', name: '[data-content="message-body"]:first-of-type' },
        { selector: 'article:first-of-type', name: 'article:first-of-type' },
      ];
      
      const results: any[] = [];
      
      variants.forEach(({ selector, name }) => {
        const element = document.querySelector(selector);
        if (element) {
          const text = element.textContent?.trim().substring(0, 200);
          results.push({ selector: name, found: true, preview: text });
        } else {
          results.push({ selector: name, found: false });
        }
      });
      
      return results;
    });
    
    firstPostData.forEach(result => {
      console.log(`Селектор: ${result.selector}`);
      console.log(`  Найден: ${result.found ? '✅' : '❌'}`);
      if (result.preview) {
        console.log(`  Превью: "${result.preview}..."`);
      }
      console.log();
    });
    
    // Получим HTML первого article
    console.log('📄 HTML структура первого article:\n');
    const firstArticle = await page.$('article');
    if (firstArticle) {
      const html = await firstArticle.innerHTML();
      console.log(html.substring(0, 1000));
    }
    
    console.log('\n\n✅ Анализ завершён. Оставляю браузер открытым на 30 секунд...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await browser.close();
  }
}

analyzeTopic();
