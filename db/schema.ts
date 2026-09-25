import { integer, sqliteTable, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const posts = sqliteTable('posts', {
 id: integer('id').primaryKey({autoIncrement:true}),
 title: text('title').notNull(),
 content: text('content').notNull(),
 authorName: text('author_name').notNull().default('Rédaction'),
 publisherVisitorId: text('publisher_visitor_id'),
 rateKey: text('rate_key'),
 createdAt: text('created_at').notNull(),
}, t=>[index('idx_posts_rate_key_created').on(t.rateKey,t.createdAt)]);
export const comments = sqliteTable('comments', {
 id: integer('id').primaryKey({autoIncrement:true}),
 postId: integer('post_id').notNull().references(()=>posts.id),
 parentId: integer('parent_id'),
 authorName: text('author_name').notNull(),
 body: text('body').notNull(),
 visitorId: text('visitor_id').notNull(),
 rateKey: text('rate_key').notNull(),
 isAuthor: integer('is_author').notNull().default(0),
 createdAt: text('created_at').notNull(),
}, t=>[index('idx_comments_post_id').on(t.postId),index('idx_comments_rate_key_created').on(t.rateKey,t.createdAt)]);
export const reactions = sqliteTable('reactions', {
 id: integer('id').primaryKey({autoIncrement:true}),
 postId: integer('post_id').notNull().references(()=>posts.id),
 visitorId: text('visitor_id').notNull(),
 kind: text('kind').notNull(),
 createdAt: text('created_at').notNull(),
}, t=>[uniqueIndex('idx_reactions_post_visitor').on(t.postId,t.visitorId)]);
