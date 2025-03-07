// Type definitions for BookStack API

export interface BookStackConfig {
  baseURL: string;
  tokenId: string;
  tokenSecret: string;
}

export interface Book {
  id: number;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
  created_by: {
    id: number;
    name: string;
    slug: string;
  };
  updated_by: {
    id: number;
    name: string;
    slug: string;
  };
  contents: Array<{
    id: number;
    type: string;
    name: string;
    slug: string;
    book_id: number;
    chapter_id?: number;
    pages?: Array<{
      id: number;
      name: string;
      slug: string;
    }>;
  }>;
  tags: Array<{
    name: string;
    value: string;
    order: number;
  }>;
}

export interface Chapter {
  id: number;
  book_id: number;
  name: string;
  slug: string;
  description: string;
  priority: number;
  created_at: string;
  updated_at: string;
  created_by: {
    id: number;
    name: string;
    slug: string;
  };
  updated_by: {
    id: number;
    name: string;
    slug: string;
  };
  pages: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags: Array<{
    name: string;
    value: string;
    order: number;
  }>;
}

export interface Page {
  id: number;
  book_id: number;
  chapter_id?: number;
  name: string;
  slug: string;
  html: string;
  markdown: string;
  priority: number;
  draft: boolean;
  template: boolean;
  created_at: string;
  updated_at: string;
  created_by: {
    id: number;
    name: string;
    slug: string;
  };
  updated_by: {
    id: number;
    name: string;
    slug: string;
  };
  tags: Array<{
    name: string;
    value: string;
    order: number;
  }>;
} 