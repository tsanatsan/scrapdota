import { chromium } from 'playwright';

async function checkPagination() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const url = 'https://dota2.ru/forum/forums/obmen-vnutriigrovymi-predmetami-dota-2.86/';
  console.log(`Проверка пагинации: ${url}\n`);
  
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  // Проверяем разные селекторы пагинации
  const paginationInfo = await page.evaluate(() => {
    const selectors = [
      '.pageNav-jump--next',
      '.pageNav-jump--last',
      'a[rel="next"]',
      '.pageNav a:last-child',
      '[class*="pageNav"]',
      '[class*="pagination"]',
    ];
    
    const results: any = {};
    
    selectors.forEach(sel => {
      const elements = document.querySelectorAll(sel);
      results[sel] = {
        count: elements.length,
        text: elements.length > 0 ? Array.from(elements).map(el => el.textContent?.trim()) : []
      };
    });
    
    // Проверяем общую пагинацию
    const pageNavElements = document.querySelectorAll('.pageNav');
    results['pageNav_html'] = pageNavElements.length > 0 ? pageNavElements[0].innerHTML : 'not found';
    
    return results;
  });
  
  console.log('Результаты проверки селекторов пагинации:\n');
  console.log(JSON.stringify(paginationInfo, null, 2));
  
  console.log('\n\nБраузер останется открытым на 30 секунд...');
  await page.waitForTimeout(30000);
  
  await browser.close();
}

checkPagination();
