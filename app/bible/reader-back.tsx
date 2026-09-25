'use client';
export default function ReaderBack({label='Retour'}:{label?:string}){
 function goBack(){
  let destination='/';
  try{const previous=new URL(document.referrer);if(previous.origin===window.location.origin&&previous.pathname!==window.location.pathname)destination=previous.pathname+previous.search+previous.hash}catch{}
  window.location.assign(destination);
 }
 return <button type="button" className="reader-back" onClick={goBack}>← {label}</button>;
}
