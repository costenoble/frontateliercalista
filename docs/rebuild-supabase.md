# Rebuild Supabase

Ordre recommandé pour repartir sur une base propre :

1. Créer un nouveau projet Supabase.
2. Appliquer `supabase/migrations/20260414_000001_initial_rebuild.sql`.
3. Déployer les fonctions :
   - `create-product`
   - `create-checkout-session`
4. Définir les secrets Supabase Functions :
   - `STRIPE_SECRET_KEY`
5. Renseigner le front avec :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Créer ton utilisateur admin dans `auth.users`, puis passer `profiles.is_admin` à `true`.

La nouvelle base ne dépend plus de tables legacy comme `alteration_services`, `alteration_prices` ni d'un endpoint checkout externe Hostinger.
