import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('page.html', 'utf-8');
const $ = cheerio.load(html);

console.log('🔍 Детальный анализ элементов .forum__block-topic-title:\n');

const titles = $('.forum__block-topic-title');
console.log(`Всего элементов: ${titles.length}\n`);

if (titles.length > 0) {
  console.log('Первые 3 элемента:\n');
  titles.slice(0, 3).each((i, el) => {
    console.log(`=== Элемент ${i + 1} ===`);
    console.log('HTML:', $(el).html()?.substring(0, 200));
    console.log('Текст:', $(el).text().trim());
    
    // Проверяем родительский элемент
    const parent = $(el).parent();
    console.log('Родитель:', parent.prop('tagName'), parent.attr('class'));
    
    // Ищем ссылки рядом
    const siblingLinks = parent.find('a');
    console.log('Ссылок в родителе:', siblingLinks.length);
    if (siblingLinks.length > 0) {
      siblingLinks.each((j, link) => {
        console.log(`  Ссылка ${j + 1}: "${$(link).text().trim()}"  URL: ${$(link).attr('href')}`);
      });
    }
    console.log('\n');
  });
}

// Попробуем найти все топики другим способом
console.log('\n📌 Поиск топиков через div.forum__block:\n');
const blocks = $('div.forum__block');
console.log(`Найдено блоков: ${blocks.length}\n`);

if (blocks.length > 0) {
  blocks.slice(0, 2).each((i, block) => {
    console.log(`=== Блок ${i + 1} ===`);
    const blockLinks = $(block).find('a');
    console.log(`Ссылок в блоке: ${blockLinks.length}`);
    blockLinks.slice(0, 3).each((j, link) => {
      const title = $(link).text().trim();
      const href = $(link).attr('href');
      if (title && href) {
        console.log(`  "${title.substring(0, 50)}..." → ${href}`);
      }
    });
    console.log('\n');
  });
}
