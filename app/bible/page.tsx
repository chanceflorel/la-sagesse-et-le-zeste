import type { Metadata } from 'next';
import BibleReader from './bible-reader';

export const metadata:Metadata={title:'Lire la Bible',description:'Lisez les 66 livres de la Bible Louis Segond 1910, chapitre par chapitre.'};

export default function Bible(){return <BibleReader/>}
