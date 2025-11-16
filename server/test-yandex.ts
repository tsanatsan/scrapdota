import { Builder, By } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import * as fs from 'fs';
import * as path from 'path';

(async () => {
  console.log('🚀 Поиск Яндекс браузера...\n');
  
  // Возможные пути к Яндекс браузеру
  const possiblePaths = [
    'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Yandex\\YandexBrowser\\Application\\browser.exe',
    'C:\\Program Files\\Yandex\\YandexBrowser\\browser.exe',
    'C:\\Program Files (x86)\\Yandex\\YandexBrowser\\browser.exe',
  ];
  
  let yandexPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      yandexPath = p;
      console.log(`✅ Найден Яндекс браузер: ${p}\n`);
      break;
    }
  }
  
  if (!yandexPath) {
    console.log('❌ Яндекс браузер не найден в стандартных путях');
    console.log('Проверенные пути:');
    possiblePaths.forEach(p => console.log(`  - ${p}`));
    console.log('\nПопробуйте указать путь вручную в коде');
    return;
  }
  
  const options = new chrome.Options();
  options.setChromeBinaryPath(yandexPath);
  // options.addArguments('--headless'); // Отключаем headless для отладки
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--window-size=1920,1080');
  options.addArguments('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 YaBrowser/24.1.0.0 Safari/537.36');
  
  let driver;
  
  try {
    console.log('🔧 Запуск браузера...\n');
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    console.log('✅ Браузер запущен\n');
    
    const url = 'https://dota2.ru/forum/forums/obmen-predmetami-dota-2.910/';
    console.log(`📥 Загрузка: ${url}\n`);
    
    await driver.get(url);
    console.log('✅ Страница загружена\n');
    
    // Ждём загрузки JS
    await driver.sleep(3000);
    
    const title = await driver.getTitle();
    console.log(`📌 Заголовок: ${title}\n`);
    
    // Ищем блоки
    const blocks = await driver.findElements(By.css('.forum__block-topic-title'));
    console.log(`📊 Найдено блоков: ${blocks.length}\n`);
    
    if (blocks.length > 0) {
      console.log('📋 Первые 5 топиков:\n');
      
      for (let i = 0; i < Math.min(5, blocks.length); i++) {
        const text = await blocks[i].getText();
        console.log(`${i + 1}. "${text}"`);
      }
      
      // Проверка с ключевыми словами
      console.log('\n\n🔑 Поиск совпадений:\n');
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
      
      // Пробуем получить URL топика
      console.log('🔗 Попытка получить URL первого топика:\n');
      const firstParent = await blocks[0].findElement(By.xpath('..'));
      
      // Пробуем кликнуть
      try {
        await firstParent.click();
        await driver.sleep(2000);
        
        const newUrl = await driver.getCurrentUrl();
        if (newUrl !== url) {
          console.log(`✅ Получен URL топика: ${newUrl}\n`);
        } else {
          console.log('⚠️ URL не изменился\n');
        }
      } catch (e) {
        console.log(`❌ Ошибка: ${e.message}\n`);
      }
    } else {
      console.log('❌ Топики не найдены\n');
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    if (driver) {
      await driver.quit();
      console.log('🔚 Браузер закрыт');
    }
  }
})();
