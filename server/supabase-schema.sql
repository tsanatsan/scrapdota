-- Создайте эти таблицы в Supabase SQL Editor

-- Таблица для всех топиков форума (первичное сканирование)
CREATE TABLE IF NOT EXISTS forum_topics (
  id BIGSERIAL PRIMARY KEY,
  topic_id TEXT UNIQUE NOT NULL,  -- ID из URL (например threads/123456)
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_forum_topics_topic_id ON forum_topics(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_updated_at ON forum_topics(updated_at DESC);

-- Таблица для топиков с совпадениями (результаты поиска)
CREATE TABLE IF NOT EXISTS matched_topics (
  id BIGSERIAL PRIMARY KEY,
  topic_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  matched_keyword TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(topic_id, matched_keyword)  -- Один топик может совпадать с разными словами
);

-- Индексы для быстрой выборки
CREATE INDEX IF NOT EXISTS idx_matched_topics_keyword ON matched_topics(matched_keyword);
CREATE INDEX IF NOT EXISTS idx_matched_topics_created_at ON matched_topics(created_at DESC);

-- Комментарии к таблицам
COMMENT ON TABLE forum_topics IS 'Все топики форума (для отслеживания новых)';
COMMENT ON TABLE matched_topics IS 'Топики с совпадениями по ключевым словам';
