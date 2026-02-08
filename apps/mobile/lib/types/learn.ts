/**
 * Learn feature types - Collection, Article, and Section definitions
 */

/**
 * Difficulty level for articles
 */
export type ArticleDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Section within an article (premise, setup, punchline, example, etc.)
 */
export interface ArticleSection {
  id: string;
  title: string;
  content: string;
  isPremium: boolean;
  order: number;
}

/**
 * Article model representing a learning article
 */
export interface LearnArticle {
  id: string;
  collectionId: string;
  title: string;
  description: string;
  difficulty: ArticleDifficulty;
  author?: string;
  readingTime: number; // in minutes
  isPremium: boolean;
  coverImage?: string;
  sections: ArticleSection[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Collection model representing a group of related articles
 */
export interface LearnCollection {
  id: string;
  title: string;
  description: string;
  icon: string; // icon name for UI
  color: string; // color theme for the collection
  articleCount: number;
  totalReadingTime: number; // in minutes
  isPremium?: boolean;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Premium content access status
 */
export interface PremiumAccess {
  isUnlocked: boolean;
  unlockMethod?: 'subscription' | 'purchase' | 'free';
}
