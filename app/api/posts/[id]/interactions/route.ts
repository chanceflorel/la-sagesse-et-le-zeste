import { getPost } from '@/db/posts';
import { addComment, listComments, reactionState, toggleReaction, type ReactionKind } from '@/db/interactions';
import { visitorFrom, cookieFor, rateKey } from '@/app/visitor';
export const runtime='edge';
function idFrom(params:{id:string}){const id=Number(params.id);return Number.isSafeInteger(id)&&id>0?id:null}
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 const postId=idFrom(await params);if(!postId)return Response.json({error:'Article invalide.'},{status:400});
 try{const post=await getPost(postId);if(!post)return Response.json({error:'Article introuvable.'},{status:404});
 const [comments,reactions]=await Promise.all([listComments(postId),reactionState(postId,visitorFrom(request))]);return Response.json({comments,reactions},{headers:{'Cache-Control':'no-store'}})}
 catch{return Response.json({error:'Échanges momentanément indisponibles.'},{status:503})}
}
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const postId=idFrom(await params);if(!postId)return Response.json({error:'Article invalide.'},{status:400});
 let body:unknown;try{body=await request.json()}catch{return Response.json({error:'Données invalides.'},{status:400})}
 const obj=body&&typeof body==='object'?body as Record<string,unknown>:{};const visitor=visitorFrom(request)??crypto.randomUUID();
 try{const post=await getPost(postId);if(!post)return Response.json({error:'Article introuvable.'},{status:404});
  if(obj.action==='reaction'){
   const kind=obj.kind;if(kind!=='like'&&kind!=='love'&&kind!=='amen')return Response.json({error:'Réaction invalide.'},{status:400});
   await toggleReaction(postId,visitor,kind as ReactionKind);return Response.json({reactions:await reactionState(postId,visitor)},{headers:{'Set-Cookie':cookieFor(request,visitor),'Cache-Control':'no-store'}});
  }
  if(obj.action==='comment'){
   const author=Boolean(post.publisher_visitor_id&&post.publisher_visitor_id===visitor);const rawName=typeof obj.name==='string'?obj.name.trim():'';
   const name=author?post.author_name:rawName.toLowerCase()==='auteur'?'Lecteur':rawName;
   const text=typeof obj.text==='string'?obj.text.trim():'';
   const parentId=obj.parentId===null||obj.parentId===undefined?null:Number(obj.parentId);
   if((!author&&(name.length<2||name.length>32))||text.length<3||text.length>1500||parentId!==null&&(!Number.isSafeInteger(parentId)||parentId<1))return Response.json({error:'Nom : 2 à 32 caractères. Commentaire : 3 à 1 500 caractères.'},{status:400});
   const id=await addComment(postId,parentId,name,text,visitor,await rateKey(request,visitor),author);
   return Response.json({id,comments:await listComments(postId)},{status:201,headers:{'Set-Cookie':cookieFor(request,visitor),'Cache-Control':'no-store'}});
  }
  return Response.json({error:'Action invalide.'},{status:400});
 }catch(e){if(e instanceof Error&&e.message==='COMMENT_MISSING')return Response.json({error:'Le commentaire auquel vous répondez n’existe plus.'},{status:404});
  if(e instanceof Error&&e.message==='COMMENT_LIMIT')return Response.json({error:'Vous avez publié plusieurs commentaires récemment. Revenez un peu plus tard.'},{status:429});
  return Response.json({error:'Enregistrement indisponible. Réessayez.'},{status:503})}
}
