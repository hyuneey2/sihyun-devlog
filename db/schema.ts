import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable(
  "posts",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    content: text("content").notNull().default(""),
    category: text("category").notNull(),
    tags: text("tags").notNull().default("[]"),
    status: text("status").notNull().default("draft"),
    publishedAt: text("published_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    authorEmail: text("author_email").notNull(),
  },
  (table) => [
    index("posts_status_published_at_idx").on(
      table.status,
      table.publishedAt,
    ),
    index("posts_category_idx").on(table.category),
  ],
);

export const blogSettings = sqliteTable("blog_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull(),
});
