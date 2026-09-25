import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
 title: { default: 'La Sagesse et le Zeste', template: '%s | La Sagesse et le Zeste' },
 description: 'Lecture biblique, blog et boutique de Sœur Raphaël.',
 icons: { icon: '/favicon.svg' },
};
const links=[['Accueil','/'],['Bible','/bible/'],['Blog','/blog/'],['Boutique','https://soeurraphael-citron.com/#boutique']];
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){
 return <html lang="fr"><body><a className="skip" href="#main">Aller au contenu</a><header className="site-header"><div className="topbar container"><a className="brand" href="/" aria-label="La Sagesse et le Zeste, accueil"><span className="brandmark" aria-hidden="true">✳</span><span>La Sagesse <em>&</em> le Zeste</span></a><nav aria-label="Navigation principale">{links.map(([label,url])=><a href={url} key={label}>{label}</a>)}</nav></div></header><main id="main">{children}</main><footer className="footer"><div className="container footer-grid"><a className="brand" href="/">La Sagesse <em>&</em> le Zeste</a><p>Une place pour lire, partager et prendre le temps.</p><div>{links.slice(1).map(([label,url])=><a href={url} key={label}>{label}</a>)}</div></div><div className="container footer-bottom">© 2026 La Sagesse et le Zeste · Lecture Louis Segond 1910.</div></footer></body></html>
}
