import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getPost } from '@/db/posts';
import PostInteractions from './post-interactions';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
 const {id}=await params;const post=Number.isSafeInteger(Number(id))?await getPost(Number(id)).catch(()=>null):null;
 return {title:post?.title??'Article',description:post?.content.slice(0,150)??'Article du blog'};
}
export default async function Article({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const n=Number(id);if(!Number.isSafeInteger(n)||n<1)notFound();
 let post;try{post=await getPost(n)}catch{return <section className="page-hero container"><h1>Article indisponible</h1><p>Réessayez dans quelques instants.</p></section>}
 if(!post)notFound();const visitor=(await cookies()).get('sagesse_visitor')?.value;
 const isAuthor=Boolean(post.publisher_visitor_id&&visitor===post.publisher_visitor_id);
 return <><section className="article-hero"><div className="container article-hero-inner"><a className="article-back" href="/blog/">← Retour au blog</a><span className="eyebrow">LE JOURNAL · {new Date(post.created_at).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</span><h1>{post.title}</h1><p>Publié par {post.author_name} · Lecture · échanges · réactions</p></div></section><div className="article-layout container"><article className="article-body">{post.content.split(/\n\s*\n/).map((paragraph,i)=><p key={i}>{paragraph}</p>)}<div className="article-end">✳</div></article><aside className="article-aside"><span className="eyebrow">APRÈS LA LECTURE</span><p>Un passage vous a marqué ? Prolongez la conversation avec les autres lecteurs.</p><a href="#echanges">Aller aux échanges ↓</a></aside></div><PostInteractions postId={n} isAuthor={isAuthor}/></>
}
