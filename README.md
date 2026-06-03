# RTV — Radio & TV en Direct v3

PWA déployée sur **https://BernardHoyez.github.io/rtv**

---

## Déploiement GitHub Pages

Le contenu de ce dossier va directement à la racine du dépôt `rtv`.

```bash
git init
git add .
git commit -m "RTV v3"
git remote add origin https://github.com/BernardHoyez/rtv.git
git branch -M main
git push -u origin main
```

Settings → Pages → Branch: main / / (root) → Save

---

## Proxy Cloudflare Worker (OBLIGATOIRE pour les TV)

Les chaînes TV françaises (BFM TV, CNews, LCI…) bloquent les requêtes
depuis github.io par vérification du Referer HTTP. Le proxy Cloudflare
Worker corrige cela gratuitement (100 000 req/jour).

### Étape 1 — Créer le Worker

1. Aller sur https://dash.cloudflare.com
2. Créer un compte gratuit si besoin
3. Menu gauche : Workers & Pages → Create → Create Worker
4. Nommer le worker : rtv-proxy
5. Cliquer "Deploy", puis "Edit code"
6. Remplacer tout le code par le contenu du fichier :
   cloudflare-worker/worker.js
7. Cliquer "Deploy"

Votre URL sera : https://rtv-proxy.VOTRENOM.workers.dev

### Étape 2 — Configurer l'URL dans app.js

Ouvrir public/app.js, ligne 12, remplacer :

  const CF_PROXY = '';

par :

  const CF_PROXY = 'https://rtv-proxy.VOTRENOM.workers.dev';

### Étape 3 — Pousser la mise à jour

```bash
git add public/app.js
git commit -m "Ajout proxy Cloudflare"
git push
```

---

## Nouveautés v3

- Qualité vidéo maximale forcée (fini le flou sur BFM TV)
- Proxy Cloudflare Worker avec réécriture des segments HLS et Referer correct
- Chaînes de secours automatiques (fallback)
- Retry intelligent : fallback direct → proxy → erreur
- TSF Jazz ajoutée
- URLs NRJ/Nostalgie corrigées (sans SSAI)

---

## Ajouter une chaîne dans app.js

```js
{
  id: 'ma-chaine',
  name: 'Ma Chaîne',
  emoji: '📺',
  type: 'tv',               // 'tv' ou 'radio'
  category: 'Info TV',
  url: 'https://stream.example.com/live.m3u8',
  fallbackUrl: 'https://backup.example.com/live.m3u8',  // optionnel
  useProxy: true,           // true pour TV avec CORS
  hlsQuality: 'max',        // 'max' = meilleure qualité
  adSkip: true,             // détection silence pub (radios)
}
```
