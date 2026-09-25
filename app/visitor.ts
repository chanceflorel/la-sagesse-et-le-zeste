import { env } from 'cloudflare:workers';

export function visitorFrom(request:Request){
 return request.headers.get('cookie')?.match(/(?:^|;\s*)sagesse_visitor=([0-9a-f-]{36})(?:;|$)/i)?.[1]??null;
}

export function cookieFor(request:Request,id:string){
 const secure=new URL(request.url).protocol==='https:'?'; Secure':'';
 return `sagesse_visitor=${id}; Max-Age=31536000; Path=/; HttpOnly; SameSite=Lax${secure}`;
}

export async function rateKey(request:Request,visitor:string){
 const ip=request.headers.get('cf-connecting-ip');
 const source=ip&&env.COMMENT_RATE_SALT?env.COMMENT_RATE_SALT+':'+ip:'visitor:'+visitor;
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(source));
 return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
