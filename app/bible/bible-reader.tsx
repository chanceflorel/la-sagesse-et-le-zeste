'use client';
import { useEffect, useRef, useState } from 'react';
import { bibleBooks } from './books';

type Selection={code:string|null;chapter:number|null};
type Chapters=string[][];
const testamentNames=['Ancien Testament','Nouveau Testament'] as const;

export default function BibleReader(){
 const [selection,setSelection]=useState<Selection>({code:null,chapter:null});
 const [loaded,setLoaded]=useState<{code:string;chapters:Chapters}|null>(null);
 const [error,setError]=useState(false);
 const [retry,setRetry]=useState(0);
 const cache=useRef(new Map<string,Chapters>());
 const book=bibleBooks.find(item=>item.code===selection.code);
 const bookIndex=book?bibleBooks.findIndex(item=>item.code===book.code):-1;

 useEffect(()=>{
  function restore(){
   const query=new URLSearchParams(window.location.search);
   const found=bibleBooks.find(item=>item.code===query.get('livre'));
   const number=Number(query.get('chapitre'));
   setSelection({code:found?.code??null,chapter:found&&Number.isInteger(number)&&number>=1&&number<=found.chapters?number:null});
  }
  restore();window.addEventListener('popstate',restore);
  return ()=>window.removeEventListener('popstate',restore);
 },[]);

 useEffect(()=>{
  if(!book||selection.chapter===null)return;
  let active=true;
  const saved=cache.current.get(book.code);
  if(saved){setLoaded({code:book.code,chapters:saved});setError(false);return}
  setError(false);
  fetch(`/bible-text/${book.code}.json`).then(response=>{
   if(!response.ok)throw new Error('Lecture indisponible');
   return response.json() as Promise<Chapters>;
  }).then(data=>{if(active){cache.current.set(book.code,data);setLoaded({code:book.code,chapters:data})}}).catch(()=>{if(active)setError(true)});
  return ()=>{active=false};
 },[book,selection.chapter,retry]);

 function navigate(code:string|null,chapter:number|null){
  const url=new URL(window.location.href);
  if(code)url.searchParams.set('livre',code);else url.searchParams.delete('livre');
 if(chapter!==null)url.searchParams.set('chapitre',String(chapter));else url.searchParams.delete('chapitre');
  url.hash=code?'':'livres';
  window.history.pushState(null,'',url);
  setSelection({code,chapter});
  if(code)window.scrollTo({top:0,behavior:'smooth'});
  else window.setTimeout(()=>document.getElementById('livres')?.scrollIntoView({behavior:'smooth'}),0);
 }

 if(!book)return <div className="bible-landing"><section className="bible-cover"><div className="bible-wide"><span className="bible-kicker">LA SAGESSE ET LE ZESTE</span><h1>La Sainte Bible</h1><p>Prenez un moment pour lire, méditer et grandir dans la Parole.</p><a className="bible-start" href="#livres">Commencer à lire</a></div></section>
  <section className="bible-library bible-wide" id="livres"><div className="bible-library-heading"><span>66 LIVRES</span><h2>Choisissez un livre</h2><p>Louis Segond 1910</p></div>{testamentNames.map(group=>{const books=bibleBooks.filter(item=>item.testament===group);const offset=group==='Ancien Testament'?0:39;return <div className="bible-testament" key={group}><div className="bible-testament-heading"><div><span>{books.length} LIVRES</span><h3>{group}</h3></div><span className="bible-star" aria-hidden="true">✦</span></div><div className="bible-book-grid">{books.map((item,index)=><button type="button" key={item.code} onClick={()=>navigate(item.code,null)}><small>{String(offset+index+1).padStart(2,'0')}</small><span>{item.title}</span></button>)}</div></div>})}</section></div>;

 if(selection.chapter===null)return <div className="bible-subpage bible-wide"><button type="button" className="bible-text-back" onClick={()=>navigate(null,null)}>← Retour aux livres</button><div className="bible-subheading"><span className="bible-kicker">{book.testament.toUpperCase()} · {book.chapters} CHAPITRES</span><h1>{book.title}</h1><p>Choisissez un chapitre pour commencer la lecture.</p></div><div className="bible-chapters"><h2>Chapitres</h2><div className="bible-chapter-grid">{Array.from({length:book.chapters},(_,index)=><button type="button" key={index+1} onClick={()=>navigate(book.code,index+1)} aria-label={`${book.title}, chapitre ${index+1}`}>{index+1}</button>)}</div></div></div>;

 const chapter=selection.chapter;
 const verses=loaded?.code===book.code?loaded.chapters[chapter-1]:null;
 const previous=chapter>1?{code:book.code,chapter:chapter-1}:bookIndex>0?{code:bibleBooks[bookIndex-1].code,chapter:bibleBooks[bookIndex-1].chapters}:null;
 const next=chapter<book.chapters?{code:book.code,chapter:chapter+1}:bookIndex<bibleBooks.length-1?{code:bibleBooks[bookIndex+1].code,chapter:1}:null;
 return <div className="bible-subpage bible-wide"><button type="button" className="bible-text-back" onClick={()=>navigate(book.code,null)}>← Retour aux chapitres</button><div className="bible-subheading"><span className="bible-kicker">{book.testament.toUpperCase()}</span><h1>{book.title}</h1><p>Chapitre {chapter}</p></div><article className="bible-text-card"><div className="bible-text-card-head"><div><span>CHAPITRE</span><h2>{chapter}</h2></div><label>Choisir un chapitre<select aria-label="Choisir un chapitre" value={chapter} onChange={event=>navigate(book.code,Number(event.target.value))}>{Array.from({length:book.chapters},(_,index)=><option key={index+1} value={index+1}>{index+1}</option>)}</select></label></div>{error?<div className="bible-loading" role="alert">Ce chapitre ne s’affiche pas. <button type="button" onClick={()=>setRetry(value=>value+1)}>Réessayer</button></div>:!verses?<p className="bible-loading" role="status">Chargement du texte…</p>:<div className="bible-verses">{verses.map((verse,index)=><p key={index}><sup>{index+1}</sup>{verse}</p>)}</div>}
  <div className="bible-navigation"><button type="button" disabled={!previous} onClick={()=>previous&&navigate(previous.code,previous.chapter)}>← Chapitre précédent</button><button type="button" disabled={!next} onClick={()=>next&&navigate(next.code,next.chapter)}>Chapitre suivant →</button></div><div className="bible-finish"><button type="button" className="bible-text-back" onClick={()=>navigate(book.code,null)}>← Retour aux chapitres</button></div></article></div>;
}
