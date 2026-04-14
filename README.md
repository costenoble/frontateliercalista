# Front Atelier Calista

Frontend React/Vite pour Atelier Calista.

Le backend de production existe deja et reste la source de verite pour Stripe et le checkout:

- API backend: `https://ateliercalista.store/api`

## Stack

- React 18
- Vite
- Supabase JS
- Tailwind CSS

## Variables d'environnement

Copier `.env.example` en `.env` puis renseigner:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_BACKEND_API_URL=https://ateliercalista.store/api
```

`VITE_BACKEND_API_URL` a deja un fallback vers `https://ateliercalista.store/api`.

## Developpement

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploiement Hostinger

1. Brancher les variables front Supabase au moment du build.
2. Lancer le build Vite.
3. Publier le contenu de `dist/`.
4. Tester:
   - `/alterations`
   - `/cart`
   - `/success`
   - `/admin/login`
   - `/admin/dashboard`

## Notes

- Le frontend actif est recable sur le backend Express existant pour:
  - `/create-product`
  - `/update-product`
  - `/delete-product`
  - `/create-checkout-session`
- Les images actives initialement servies par Horizons ont ete rapatriees dans `public/assets`.
