import { listPosts, publishPost } from '@/db/posts';
import { visitorFrom, cookieFor, rateKey } from '@/app/visitor';
export const runtime='edge';
export async function GET(){
 try{return Response.json({posts:await listPosts()},{headers:{'Cache-Control':'no-store'}})}
 catch{return Response.json({error:'Articles temporairement indisponibles.'},{status:503})}
}
export async function POST(request:Request){
 if(Number(request.headers.get('content-length'))>100000)return Response.json({error:'L’article est trop long.'},{status:413});
 let body:unknown;try{body=await request.json()}catch{return Response.json({error:'Données invalides.'},{status:400})}
 const obj=body&&typeof body==='object'?body as Record<string,unknown>:{};
 const authorName=typeof obj.authorName==='string'?obj.authorName.trim():'';
 const title=typeof obj.title==='string'?obj.title.trim():'';
 const content=typeof obj.content==='string'?obj.content.trim():'';
 if(authorName.length<2||authorName.length>40||title.length<3||title.length>160||content.length<20||content.length>30000)return Response.json({error:'Nom : 2 à 40 caractères. Titre : 3 à 160 caractères. Article : 20 à 30 000 caractères.'},{status:400});
 const visitor=visitorFrom(request)??crypto.randomUUID();
 try{const id=await publishPost(title,content,authorName,visitor,await rateKey(request,visitor));return Response.json({id},{status:201,headers:{'Set-Cookie':cookieFor(request,visitor),'Cache-Control':'no-store'}})}
 catch(e){if(e instanceof Error&&e.message==='POST_LIMIT')return Response.json({error:'Vous avez publié plusieurs articles récemment. Revenez un peu plus tard.'},{status:429});return Response.json({error:'Impossible de publier pour le moment. Votre texte reste dans le formulaire.'},{status:503})}
}
