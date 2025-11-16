
export interface Post {
  id: string;
  title: string;
  url: string;
  sourceForum: string;
  matchedKeyword: string;
  timestamp: Date;
  author: string;
}

export interface Keyword {
  id: string;
  text: string;
}

export interface Forum {
  id: string;
  url: string;
}
