# La Sagesse et le Zeste

Site en français : lecture de la Bible, blog avec publication d'articles, lien vers la boutique de Sœur Raphaël.

## Ouvrir dans VS Code

1. Décompresser le dossier et l'ouvrir dans VS Code.
2. Installer Node.js 22 ou plus récent.
3. Dans le terminal du dossier : `npm.cmd install`, puis `npm.cmd run build` dans PowerShell (ou `npm install` dans un autre terminal).
4. Initialiser la base locale une fois :
   `node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_blushing_smasher.sql`
   Répéter avec `drizzle/0001_thick_mordo.sql` puis `drizzle/0002_fearless_silver_sable.sql` pour les commentaires, réactions et articles publics.
5. Pour essayer les publications et commentaires sur votre ordinateur, créer un fichier `.dev.vars` avec `COMMENT_RATE_SALT=une-valeur-aleatoire`.
6. Lancer `npm.cmd run dev` dans PowerShell et ouvrir l'adresse indiquée.

La page `/blog/ecrire/` permet à tout visiteur de publier un article sous son nom ou pseudo, sans compte ni code. Les visiteurs peuvent aussi lire, commenter, répondre et réagir. Le navigateur qui publie un article est reconnu pour afficher le badge Auteur quand il répond à ses commentaires. Les publications sont limitées en fréquence pour éviter les envois répétitifs.

La page Bible contient localement les 66 livres et 1 189 chapitres de la traduction Louis Segond 1910 dans le domaine public, sans iframe, liens de téléchargement ni texte technique. Choisissez un livre, puis un chapitre ; les boutons Retour ramènent aux chapitres ou à la liste des livres. Le menu Boutique ouvre directement `soeurraphael-citron.com/#boutique`.

Source du texte biblique : [eBible.org, Louis Segond 1910](https://ebible.org/fraLSG/copyright.htm), domaine public. Les fichiers JSON sont déjà fournis dans `public/bible-text/` : aucun téléchargement n'est nécessaire pour démarrer le site. Pour régénérer les données depuis l'archive `fraLSG_html.zip` d'eBible.org, installer `lxml` pour Python et lancer `python scripts/import-bible.py chemin/vers/fraLSG_html.zip`.

Les articles, commentaires et réactions du blog sont enregistrés dans la base D1. Modifier le schéma de `db/schema.ts` nécessite une nouvelle migration avec `npm run db:generate` avant la publication.
