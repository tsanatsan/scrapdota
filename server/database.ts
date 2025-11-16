import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

interface ForumTopic {
  id?: number;
  topic_id: string;        // ID из URL топика
  title: string;
  url: string;
  created_at?: string;
  updated_at?: string;
}

interface MatchedTopic {
  id?: number;
  topic_id: string;
  title: string;
  url: string;
  matched_keyword: string;
  created_at?: string;
}

class DatabaseService {
  private supabase: SupabaseClient | null = null;
  private isInitialized = false;

  async initialize() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.log('⚠️  Supabase не настроен. Работаем без БД.');
      return false;
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.isInitialized = true;
      console.log('✅ Подключено к Supabase');
      return true;
    } catch (error) {
      console.error('❌ Ошибка подключения к Supabase:', error);
      return false;
    }
  }

  // Сохранить топик в общую таблицу (первичное сканирование)
  async saveTopic(topicId: string, title: string, url: string): Promise<boolean> {
    if (!this.isInitialized || !this.supabase) return false;

    try {
      const { error } = await this.supabase
        .from('forum_topics')
        .upsert({
          topic_id: topicId,
          title,
          url,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'topic_id'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Ошибка сохранения топика:', error);
      return false;
    }
  }

  // Массовое сохранение топиков
  async saveTopics(topics: Array<{topicId: string, title: string, url: string}>): Promise<number> {
    if (!this.isInitialized || !this.supabase) return 0;

    try {
      const data = topics.map(t => ({
        topic_id: t.topicId,
        title: t.title,
        url: t.url,
        updated_at: new Date().toISOString()
      }));

      const { error } = await this.supabase
        .from('forum_topics')
        .upsert(data, {
          onConflict: 'topic_id'
        });

      if (error) throw error;
      return topics.length;
    } catch (error) {
      console.error('Ошибка массового сохранения:', error);
      return 0;
    }
  }

  // Проверить, существует ли топик
  async topicExists(topicId: string): Promise<boolean> {
    if (!this.isInitialized || !this.supabase) return false;

    try {
      const { data, error } = await this.supabase
        .from('forum_topics')
        .select('topic_id')
        .eq('topic_id', topicId)
        .single();

      return !error && data !== null;
    } catch {
      return false;
    }
  }

  // Получить новые топики (которых нет в БД)
  async getNewTopics(topicIds: string[]): Promise<string[]> {
    if (!this.isInitialized || !this.supabase || topicIds.length === 0) return topicIds;

    try {
      const { data, error } = await this.supabase
        .from('forum_topics')
        .select('topic_id')
        .in('topic_id', topicIds);

      if (error) throw error;

      const existingIds = new Set(data?.map(t => t.topic_id) || []);
      return topicIds.filter(id => !existingIds.has(id));
    } catch (error) {
      console.error('Ошибка проверки новых топиков:', error);
      return topicIds;
    }
  }

  // Сохранить совпадение с ключевым словом
  async saveMatch(topicId: string, title: string, url: string, keyword: string): Promise<boolean> {
    if (!this.isInitialized || !this.supabase) return false;

    try {
      const { error } = await this.supabase
        .from('matched_topics')
        .insert({
          topic_id: topicId,
          title,
          url,
          matched_keyword: keyword
        });

      if (error) {
        // Игнорируем ошибку дубликата
        if (error.code === '23505') return true;
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Ошибка сохранения совпадения:', error);
      return false;
    }
  }

  // Получить все совпадения
  async getMatches(limit = 100): Promise<MatchedTopic[]> {
    if (!this.isInitialized || !this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('matched_topics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Ошибка получения совпадений:', error);
      return [];
    }
  }

  // Получить количество топиков в БД
  async getTopicsCount(): Promise<number> {
    if (!this.isInitialized || !this.supabase) return 0;

    try {
      const { count, error } = await this.supabase
        .from('forum_topics')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Ошибка подсчёта топиков:', error);
      return 0;
    }
  }

  // Проверить, завершено ли первичное сканирование
  async isInitialScanComplete(): Promise<boolean> {
    const count = await this.getTopicsCount();
    // Считаем сканирование завершённым если в БД больше 1000 топиков
    return count > 1000;
  }
}

export const db = new DatabaseService();
export type { ForumTopic, MatchedTopic };
