import { env } from 'cloudflare:workers';
export type CommentRecord={id:number;post_id:number;parent_id:number|null;author_name:string;body:string;is_author:number;created_at:string};
export type ReactionKind='like'|'love'|'amen';
function database(){if(!env.DB)throw new Error('Base de données indisponible');return env.DB}
export async function listComments(postId:number){
 const result=await database().prepare('SELECT id,post_id,parent_id,author_name,body,is_author,created_at FROM comments WHERE post_id = ? ORDER BY id ASC LIMIT 300').bind(postId).all<CommentRecord>();
 return result.results;
}
export async function reactionState(postId:number,visitorId:string|null){
 const result=await database().prepare('SELECT kind, COUNT(*) AS count FROM reactions WHERE post_id = ? GROUP BY kind').bind(postId).all<{kind:ReactionKind;count:number}>();
 const own=visitorId?await database().prepare('SELECT kind FROM reactions WHERE post_id = ? AND visitor_id = ?').bind(postId,visitorId).first<{kind:ReactionKind}>():null;
 return {counts:Object.fromEntries(result.results.map(r=>[r.kind,r.count])),mine:own?.kind??null};
}
export async function addComment(postId:number,parentId:number|null,name:string,body:string,visitorId:string,rateKey:string,isAuthor:boolean){
 const db=database();
 if(parentId){const parent=await db.prepare('SELECT id FROM comments WHERE id = ? AND post_id = ?').bind(parentId,postId).first();if(!parent)throw new Error('COMMENT_MISSING')}
 const now=new Date().toISOString();
 const recent=await db.prepare('SELECT COUNT(*) AS count, MAX(created_at) AS last FROM comments WHERE rate_key = ? AND created_at > ?').bind(rateKey,new Date(Date.now()-86400000).toISOString()).first<{count:number;last:string|null}>();
 if((recent?.count??0)>=15||recent?.last&&Date.now()-Date.parse(recent.last)<20000)throw new Error('COMMENT_LIMIT');
 const result=await db.prepare('INSERT INTO comments (post_id,parent_id,author_name,body,visitor_id,rate_key,is_author,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(postId,parentId,name,body,visitorId,rateKey,isAuthor?1:0,now).run();
 return Number(result.meta.last_row_id);
}
export async function toggleReaction(postId:number,visitorId:string,kind:ReactionKind){
 const db=database();const current=await db.prepare('SELECT kind FROM reactions WHERE post_id = ? AND visitor_id = ?').bind(postId,visitorId).first<{kind:string}>();
 if(current?.kind===kind){await db.prepare('DELETE FROM reactions WHERE post_id = ? AND visitor_id = ?').bind(postId,visitorId).run();return}
 await db.prepare('INSERT INTO reactions (post_id,visitor_id,kind,created_at) VALUES (?,?,?,?) ON CONFLICT(post_id,visitor_id) DO UPDATE SET kind=excluded.kind, created_at=excluded.created_at').bind(postId,visitorId,kind,new Date().toISOString()).run();
}
