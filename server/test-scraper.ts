import axios from 'axios';
import * as cheerio from 'cheerio';

const testScraping = async () => {
  const forumUrl = 'https://dota2.ru/forum/forums/obmen-predmetami-dota-2.910/';
  
  try {
    console.log(`\n🔍 Тестирую парсинг форума: ${forumUrl}\n`);
    
    const { data: html } = await axios.get(forumUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
      }
    });
    
    const $ = cheerio.load(html);
    
    // Тестируем разные селекторы
    console.log('📋 Тестирую селекторы:\n');
    
    // Текущий селектор
    const selector1 = 'div.structItem-title > a';
    console.log(`1️⃣  Селектор: "${selector1}"`);
    const elements1 = $(selector1);
    console.log(`   Найдено элементов: ${elements1.length}`);
    if (elements1.length > 0) {
      console.log(`   Первые 3 заголовка:`);
      elements1.slice(0, 3).each((i, el) => {
        const title = $(el).text().trim();
        const href = $(el).attr('href');
        console.log(`   ${i + 1}. "${title}"`);
        console.log(`      URL: ${href}\n`);
      });
    }
    
    // Альтернативные селекторы
    const selector2 = 'div.structItem-title a';
    const elements2 = $(selector2);
    console.log(`\n2️⃣  Альтернативный селектор: "${selector2}"`);
    console.log(`   Найдено элементов: ${elements2.length}\n`);
    
    const selector3 = '.structItem-title';
    const elements3 = $(selector3);
    console.log(`3️⃣  Селектор контейнера: "${selector3}"`);
    console.log(`   Найдено элементов: ${elements3.length}\n`);
    
    // Проверка ключевых слов
    const keywords = ['продам', 'куплю', 'обмен', 'cache'];
    console.log('🔑 Проверка совпадений с ключевыми словами:\n');
    
    let matchCount = 0;
    elements1.each((i, el) => {
      const title = $(el).text().trim().toLowerCase();
      for (const keyword of keywords) {
        if (title.includes(keyword.toLowerCase())) {
          matchCount++;
          const href = $(el).attr('href');
          console.log(`   ✅ Найдено: "${$(el).text().trim()}"`);
          console.log(`      Ключевое слово: "${keyword}"`);
          console.log(`      URL: ${href}\n`);
        }
      }
    });
    
    console.log(`\n📊 Итого найдено совпадений: ${matchCount}`);
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ Ошибка при запросе: ${error.message}`);
      if (error.response) {
        console.error(`   Статус: ${error.response.status}`);
      }
    } else {
      console.error('❌ Неизвестная ошибка:', error);
    }
  }
};

testScraping();
