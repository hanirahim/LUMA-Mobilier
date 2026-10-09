# LUMA

Maison française de mobilier contemporain. Le site et l'application partagent la même identité : ivoire, sable, noir, brun et or doux.

## Site

```bash
cd web
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

- Catalogue, fiche produit, achat, location, devis, compte et favoris
- Espace atelier : [http://localhost:3000/admin](http://localhost:3000/admin)
- Accès de démonstration : `luma-atelier`
- Code maison de démonstration : `MAISON10`

Les commandes, locations, devis et le catalogue modifié par l'atelier sont enregistrés dans `web/data/db.json`. Le panier, les favoris et le profil restent dans le navigateur.

## Application

```bash
cd mobile
npx expo start
```

Puis ouvrir le projet avec Expo Go sur iPhone ou Android, ou avec un émulateur. Navigation : Accueil, Catalogue, Favoris, Panier, Compte. L'application reprend le même catalogue et les mêmes parcours d'achat, de location et de devis. Les données du téléphone sont enregistrées sur l'appareil.
