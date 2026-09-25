'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function EditorForm(){
 const router=useRouter();const [authorName,setAuthorName]=useState(''),[title,setTitle]=useState(''),[content,setContent]=useState(''),[message,setMessage]=useState(''),[saving,setSaving]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();setMessage('');setSaving(true);
  try{const r=await fetch('/api/posts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({authorName,title,content})});const data=await r.json() as {error?:string;id?:number};if(!r.ok)throw new Error(data.error||'Erreur');if(!data.id)throw new Error('Réponse de publication invalide.');router.push('/blog/'+data.id+'/');router.refresh()}
  catch(e){setMessage(e instanceof Error?e.message:'Publication impossible. Le texte est conservé ici.')}finally{setSaving(false)}
 }
 return <form className="editor container" onSubmit={submit}><label htmlFor="author-name">Votre nom affiché</label><input id="author-name" required minLength={2} maxLength={40} value={authorName} onChange={e=>setAuthorName(e.target.value)} placeholder="Votre prénom ou pseudo"/><label htmlFor="title">Titre</label><input id="title" required minLength={3} maxLength={160} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Le titre de votre article"/><label htmlFor="body">Article</label><textarea id="body" required minLength={20} maxLength={30000} value={content} onChange={e=>setContent(e.target.value)} placeholder="Écrivez votre article ici…"/><p>Votre nom et votre article seront visibles par tous. Après publication, ce navigateur sera reconnu pour vos réponses.</p><button className="button primary" type="submit" disabled={saving}>{saving?'Publication…':'Publier l’article ↗'}</button>{message&&<p role="alert" className="form-message error-text">{message}</p>}</form>
}
