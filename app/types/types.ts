/** microCMS リスト API（nekokan）の1件と同じ形 */
type BookType = {
  id: string;
  title: string;
  price: number;
  content: string;
  image?: { url: string; height?: number; width?: number };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  revisedAt?: string;
};

type Purchase = {
  id: string;
  userId: string;
  bookId: string;
  sessionId: string;
  createdAt: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  image: string;
};

export type { BookType, Purchase, User };
