import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

(async () => {
  console.log('🚀 Запуск Selenium...\n');
  
  const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--window-size=1920,1080');
  options.addArguments('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  let driver;
  
  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    console.log('✅ Браузер запущен\n');
    
    const url = 'https://dota2.ru/forum/forums/obmen-predmetami-dota-2.910/';
    console.log(`📥 Загрузка: ${url}\n`);
    
    await driver.get(url);
    console.log('✅ Страница загружена\n');
    
    // Ждём 3 секунды для загрузки JS
    await driver.sleep(3000);
    
    // Получаем заголовок
    const title = await driver.getTitle();
    console.log(`📌 Заголовок: ${title}\n`);
    
    // Ищем элементы
    const blocks = await driver.findElements(By.css('.forum__block-topic-title'));
    console.log(`📊 Найдено блоков .forum__block-topic-title: ${blocks.length}\n`);
    
    if (blocks.length > 0) {
      console.log('📋 Первые 5 топиков:\n');
      
      for (let i = 0; i < Math.min(5, blocks.length); i++) {
        const block = blocks[i];
        const text = await block.getText();
        
        // Ищем родительский элемент
        const parent = await block.findElement(By.xpath('..'));
        const parentTag = await parent.getTagName();
        const parentClass = await parent.getAttribute('class');
        
        console.log(`${i + 1}. "${text}"`);
        console.log(`   Родитель: <${parentTag}> class="${parentClass}"`);
        
        // Проверяем, кликабельный ли элемент
        try {
          const clickable = await parent.getAttribute('onclick');
          if (clickable) {
            console.log(`   onclick: ${clickable}`);
          }
        } catch (e) {
          // игнорируем
        }
        
        // Проверяем data-url
        try {
          const dataUrl = await parent.getAttribute('data-url');
          if (dataUrl) {
            console.log(`   data-url: ${dataUrl}`);
          }
        } catch (e) {
          // игнорируем
        }
        
        console.log();
      }
      
      // Пробуем кликнуть на первый элемент и посмотреть, что произойдёт
      console.log('🖱️ Пробую кликнуть на первый блок...\n');
      const firstParent = await blocks[0].findElement(By.xpath('..'));
      
      try {
        await firstParent.click();
        await driver.sleep(1000);
        
        // Проверяем, изменился ли URL
        const newUrl = await driver.getCurrentUrl();
        console.log(`📍 URL после клика: ${newUrl}\n`);
        
        if (newUrl !== url) {
          console.log('✅ Клик сработал! Открылась страница топика\n');
        } else {
          console.log('⚠️ URL не изменился после клика\n');
        }
      } catch (e) {
        console.log(`❌ Ошибка при клике: ${e}\n`);
      }
    }
    
    // Проверка с ключевыми словами
    console.log('\n🔑 Поиск совпадений с ключевыми словами:\n');
    const keywords = ['продам', 'куплю', 'обмен', 'cache'];
    let matches = 0;
    
    for (const block of blocks) {
      const text = await block.getText();
      const textLower = text.toLowerCase();
      
      for (const keyword of keywords) {
        if (textLower.includes(keyword.toLowerCase())) {
          matches++;
          console.log(`✅ "${text}"`);
          console.log(`   Ключевое слово: "${keyword}"\n`);
          break;
        }
      }
    }
    
    console.log(`\n📊 Всего совпадений: ${matches}\n`);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    if (driver) {
      await driver.quit();
      console.log('🔚 Браузер закрыт');
    }
  }
})();
