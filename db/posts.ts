import { env } from 'cloudflare:workers';
export type Post = { id:number; title:string; content:string; author_name:string; created_at:string };
export type PostWithPublisher = Post & {publisher_visitor_id:string|null};
function database(){if(!env.DB) throw new Error('Base de données indisponible');return env.DB}
export async function listPosts():Promise<Post[]>{
 const result=await database().prepare('SELECT id, title, content, author_name, created_at FROM posts ORDER BY id DESC LIMIT 100').all<Post>();
 return result.results;
}
export async function getPost(id:number):Promise<PostWithPublisher|null>{
 return database().prepare('SELECT id, title, content, author_name, publisher_visitor_id, created_at FROM posts WHERE id = ?').bind(id).first<PostWithPublisher>();
}
export async function publishPost(title:string,content:string,authorName:string,visitorId:string,rateKey:string):Promise<number>{
 const db=database();
 const recent=await db.prepare('SELECT COUNT(*) AS count, MAX(created_at) AS last FROM posts WHERE rate_key = ? AND created_at > ?').bind(rateKey,new Date(Date.now()-86400000).toISOString()).first<{count:number;last:string|null}>();
 if((recent?.count??0)>=5||recent?.last&&Date.now()-Date.parse(recent.last)<90000)throw new Error('POST_LIMIT');
 const result=await db.prepare('INSERT INTO posts (title, content, author_name, publisher_visitor_id, rate_key, created_at) VALUES (?, ?, ?, ?, ?, ?)').bind(title,content,authorName,visitorId,rateKey,new Date().toISOString()).run();
 return Number(result.meta.last_row_id);
}
