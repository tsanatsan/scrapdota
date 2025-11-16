import { chromium } from 'playwright';

async function analyzeStructure() {
  console.log('🔍 Анализ структуры страницы форума\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    const url = 'https://dota2.ru/forum/forums/obmen-vnutriigrovymi-predmetami-dota-2.86/';
    console.log(`📥 Загрузка: ${url}\n`);
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    // Ищем различные селекторы для топиков
    const selectors = [
      '.structItem-title',
      '.discussionListItem',
      '[data-topic]',
      '.forum__block-topic-title',
      'a[href*="/threads/"]',
      '.structItem',
      '[class*="topic"]',
      '[class*="thread"]',
      'article',
    ];
    
    console.log('Проверка селекторов:\n');
    
    for (const selector of selectors) {
      const count = await page.$$eval(selector, els => els.length).catch(() => 0);
      console.log(`${selector.padEnd(35)} → ${count} элементов`);
    }
    
    // Получим HTML первых структурных элементов
    console.log('\n📄 Первые 3 элемента .structItem:\n');
    const items = await page.$$('.structItem');
    
    if (items.length > 0) {
      for (let i = 0; i < Math.min(3, items.length); i++) {
        const html = await items[i].innerHTML();
        console.log(`\n--- Элемент ${i + 1} ---`);
        console.log(html.substring(0, 500));
      }
    }
    
    // Попытка найти заголовки топиков
    console.log('\n\n🔎 Поиск заголовков топиков:\n');
    const titles = await page.evaluate(() => {
      const possibleSelectors = [
        '.structItem-title a',
        'a[data-preview-url]',
        '.discussionListItem-title',
        '[class*="title"] a',
      ];
      
      const results: any[] = [];
      
      possibleSelectors.forEach(sel => {
        const elements = document.querySelectorAll(sel);
        if (elements.length > 0) {
          results.push({
            selector: sel,
            count: elements.length,
            examples: Array.from(elements).slice(0, 3).map(el => ({
              text: el.textContent?.trim().substring(0, 50),
              href: (el as HTMLAnchorElement).href
            }))
          });
        }
      });
      
      return results;
    });
    
    titles.forEach(result => {
      console.log(`\nСелектор: ${result.selector} (${result.count} элементов)`);
      result.examples.forEach((ex: any, i: number) => {
        console.log(`  ${i + 1}. "${ex.text}"`);
        console.log(`     ${ex.href}`);
      });
    });
    
    console.log('\n\n✅ Анализ завершён. Оставляю браузер открытым на 30 секунд для визуального осмотра...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await browser.close();
  }
}

analyzeStructure();
