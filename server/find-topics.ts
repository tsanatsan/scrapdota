import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('page.html', 'utf-8');
const $ = cheerio.load(html);

console.log('🔗 Анализ ВСЕХ ссылок на странице:\n');

const allLinks = $('a[href]');
console.log(`Всего ссылок: ${allLinks.length}\n`);

// Группируем ссылки по паттернам
const patterns: Record<string, number> = {};
const examples: Record<string, string[]> = {};

allLinks.each((i, el) => {
  const href = $(el).attr('href') || '';
  
  let pattern = 'other';
  if (href.includes('/forum/') && !href.includes('forums/')) pattern = 'forum-topics';
  else if (href.includes('forums/')) pattern = 'forums-list';
  else if (href.includes('/news/')) pattern = 'news';
  else if (href.includes('/user')) pattern = 'users';
  else if (href.includes('/esport')) pattern = 'esport';
  else if (href.startsWith('#')) pattern = 'anchors';
  else if (href.startsWith('/')) pattern = 'internal';
  
  patterns[pattern] = (patterns[pattern] || 0) + 1;
  
  if (!examples[pattern]) examples[pattern] = [];
  if (examples[pattern].length < 3) {
    const text = $(el).text().trim();
    if (text) {
      examples[pattern].push(`"${text.substring(0, 40)}..." → ${href}`);
    }
  }
});

console.log('📊 Группировка ссылок по типам:\n');
Object.entries(patterns).sort((a, b) => b[1] - a[1]).forEach(([pattern, count]) => {
  console.log(`${pattern}: ${count} ссылок`);
  if (examples[pattern]) {
    examples[pattern].forEach(ex => console.log(`  ${ex}`));
  }
  console.log();
});

// Специально ищем ссылки на топики форума
console.log('\n🎯 Ссылки на топики форума (/forum/ но не /forums/):\n');
const topicLinks = $('a[href*="/forum/"]').filter((i, el) => {
  const href = $(el).attr('href') || '';
  return href.includes('/forum/') && !href.includes('/forums/') && !href.includes('/forum/feed');
});

console.log(`Найдено: ${topicLinks.length}\n`);
topicLinks.slice(0, 10).each((i, el) => {
  const title = $(el).text().trim();
  const href = $(el).attr('href');
  if (title && href) {
    console.log(`${i + 1}. "${title}"`);
    console.log(`   ${href}\n`);
  }
});
