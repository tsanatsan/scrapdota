import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Запуск...');
  
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });
    
    console.log('✅ Браузер запущен');
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    console.log('📄 Страница создана');
    
    await page.goto('https://dota2.ru/forum/forums/obmen-predmetami-dota-2.910/', {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });
    
    console.log('✅ Страница загружена');
    
    // Небольшая пауза для JS
    await new Promise(r => setTimeout(r, 3000));
    
    // Получаем заголовок
    const title = await page.title();
    console.log(`📌 Заголовок: ${title}`);
    
    // Пробуем найти элементы
    const topicCount = await page.evaluate(() => {
      return document.querySelectorAll('.forum__block-topic-title').length;
    });
    
    console.log(`📊 Найдено блоков .forum__block-topic-title: ${topicCount}`);
    
    // Пробуем кликнуть на блок и посмотреть, что произойдёт
    if (topicCount > 0) {
      const blockInfo = await page.evaluate(() => {
        const block = document.querySelector('.forum__block-topic-title');
        if (!block) return null;
        
        const parent = block.parentElement;
        return {
          text: block.textContent?.trim(),
          parentTag: parent?.tagName,
          parentClass: parent?.className,
          parentOnClick: parent?.getAttribute('onclick'),
          parentDataUrl: parent?.getAttribute('data-url'),
          hasClickHandler: !!parent?.onclick
        };
      });
      
      console.log('\n📦 Информация о первом блоке:');
      console.log(JSON.stringify(blockInfo, null, 2));
    }
    
    await browser.close();
    console.log('\n✅ Готово!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  }
})();
