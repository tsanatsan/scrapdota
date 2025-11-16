import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('page.html', 'utf-8');
const $ = cheerio.load(html);

console.log('🔍 Анализ структуры форума:\n');

// Проверяем разные селекторы
const selectors = [
  '.forum__block-topic-title a',
  '.forum__block-topic-title',
  'div[class*="forum__block"] a',
  '.forum__block a'
];

for (const selector of selectors) {
  const elements = $(selector);
  console.log(`Селектор: "${selector}"`);
  console.log(`Найдено: ${elements.length} элементов\n`);
  
  if (elements.length > 0 && selector.includes('a')) {
    console.log('Первые 5 элементов:');
    elements.slice(0, 5).each((i, el) => {
      const title = $(el).text().trim();
      const href = $(el).attr('href');
      if (title && href) {
        console.log(`  ${i + 1}. "${title}"`);
        console.log(`     ${href}\n`);
      }
    });
  }
}

// Проверка совпадений с ключевыми словами
const keywords = ['продам', 'куплю', 'обмен', 'cache'];
console.log('\n🔑 Проверка с ключевыми словами:\n');

const topicLinks = $('.forum__block-topic-title a');
let matches = 0;

topicLinks.each((i, el) => {
  const title = $(el).text().trim();
  const titleLower = title.toLowerCase();
  const href = $(el).attr('href');
  
  for (const keyword of keywords) {
    if (titleLower.includes(keyword.toLowerCase())) {
      matches++;
      console.log(`✅ "${title}"`);
      console.log(`   Ключевое слово: "${keyword}"`);
      console.log(`   URL: ${href}\n`);
      break;
    }
  }
});

console.log(`\n📊 Всего совпадений: ${matches}`);
