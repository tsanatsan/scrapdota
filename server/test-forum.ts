import { ForumScraper } from './scraper';

async function test() {
  console.log('🧪 Тест парсинга форума\n');
  
  const scraper = new ForumScraper();
  
  try {
    await scraper.initialize();
    
    const keywords = ['продам', 'куплю', 'обмен', 'arcana', 'cache'];
    console.log(`🔑 Ключевые слова: ${keywords.join(', ')}\n`);
    
    const topics = await scraper.scrapeTopics(keywords);
    
    console.log('\n📋 Результаты:');
    console.log(`Всего топиков: ${topics.length}`);
    console.log(`С совпадениями: ${topics.filter(t => t.hasMatch).length}`);
    console.log(`Без совпадений: ${topics.filter(t => !t.hasMatch).length}\n`);
    
    if (topics.length > 0) {
      console.log('Примеры топиков:');
      topics.slice(0, 3).forEach((topic, i) => {
        console.log(`\n${i + 1}. ${topic.title}`);
        console.log(`   URL: ${topic.url}`);
        console.log(`   Автор: ${topic.author}`);
        console.log(`   Steam ID: ${topic.steamId || 'не найден'}`);
        console.log(`   Совпадения: ${topic.matchedKeywords.join(', ') || 'нет'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await scraper.close();
  }
}

test();
