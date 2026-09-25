import type { Metadata } from 'next';
import EditorForm from './editor-form';
export const metadata:Metadata={title:'Publier un article',description:'Rédiger et publier librement un article du blog.'};
export default function Editor(){
 return <><section className="page-hero container"><a className="text-link" href="/blog/">← Retour au blog</a><span className="eyebrow" style={{marginTop:30}}>LE BLOG</span><h1>Écrire un article</h1><p>Partagez votre texte avec les lecteurs. Vous pourrez répondre aux commentaires après la publication.</p></section><EditorForm/></>;
}
