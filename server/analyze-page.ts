import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

const analyzePage = async () => {
  const forumUrl = 'https://dota2.ru/forum/forums/obmen-predmetami-dota-2.910/';
  
  try {
    console.log(`📥 Загружаю страницу: ${forumUrl}\n`);
    
    const { data: html } = await axios.get(forumUrl, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
      }
    });
    
    // Сохраним HTML для анализа
    fs.writeFileSync('page.html', html);
    console.log('✅ HTML сохранён в page.html\n');
    
    const $ = cheerio.load(html);
    
    // Ищем все возможные ссылки на посты
    console.log('🔍 Анализ структуры страницы:\n');
    
    // Проверяем разные варианты
    const allLinks = $('a');
    console.log(`📌 Всего ссылок на странице: ${allLinks.length}\n`);
    
    // Ищем ссылки на темы (threads)
    const threadLinks = $('a[href*="/threads/"]');
    console.log(`📌 Ссылок на темы (/threads/): ${threadLinks.length}`);
    if (threadLinks.length > 0) {
      console.log('   Первые 5 тем:');
      threadLinks.slice(0, 5).each((i, el) => {
        const title = $(el).text().trim();
        const href = $(el).attr('href');
        if (title) {
          console.log(`   ${i + 1}. "${title.substring(0, 60)}${title.length > 60 ? '...' : ''}"`);
          console.log(`      ${href}\n`);
        }
      });
    }
    
    // Попробуем найти заголовки постов другими способами
    console.log('\n🔎 Поиск других возможных селекторов:\n');
    
    const possibleSelectors = [
      'h3.structItem-title a',
      '.structItem--thread .structItem-title a',
      'div[class*="structItem"] a[href*="/threads/"]',
      'a[data-tp-primary]',
      '.listBlock a[href*="/threads/"]'
    ];
    
    for (const selector of possibleSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`✅ Селектор работает: "${selector}"`);
        console.log(`   Найдено: ${elements.length} элементов`);
        console.log(`   Пример: "${$(elements[0]).text().trim().substring(0, 50)}..."\n`);
      }
    }
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`❌ Ошибка: ${error.message}`);
    } else {
      console.error('❌ Ошибка:', error);
    }
  }
};

analyzePage();
