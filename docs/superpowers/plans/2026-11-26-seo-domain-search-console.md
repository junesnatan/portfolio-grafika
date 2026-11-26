# SEO, Domaine Officiel & Google Search Console - Plan d'Implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configurer le domaine officiel `https://ateliergrafrika.bj`, intégrer la vérification Google Search Console, et optimiser le référencement naturel on-page et local (Schema.org riche, balises méta, sitemap, robots.txt) pour hisser Atelier Grafrika en haut des résultats de recherche Google au Bénin et pour la diaspora.

**Architecture:** Remplacer les URLs de test Vercel par le domaine canonique officiel `https://ateliergrafrika.bj` sur l'ensemble des fichiers publics (HTML, robots.txt, sitemap.xml, métadonnées OpenGraph et Twitter). Injecter la balise de vérification Google Search Console. Enrichir les métadonnées SEO avec des données géographiques précises et un balisage Schema.org JSON-LD `@graph` (`ArchitecturalFirm` + `FAQPage`) pour déclencher les rich snippets Google.

**Tech Stack:** HTML5, Schema.org JSON-LD, XML Sitemap, Robots.txt, Vite 5.

**Spec:** Requête utilisateur du 2026-11-26 : Domaine `https://ateliergrafrika.bj`, balise Google Search Console `<meta name="google-site-verification" content="zbvqzhgMc2gu-p8Azhwh84kGdU0b2GUWFp8MUhMbhrg" />` et objectif Top 1 moteur de recherche.

## Global Constraints

- Domaine officiel absolu : `https://ateliergrafrika.bj` (avec HTTPS sans redirection parasite).
- Balise de vérification Google : `<meta name="google-site-verification" content="zbvqzhgMc2gu-p8Azhwh84kGdU0b2GUWFp8MUhMbhrg" />`.
- Sécurité : Respecter la CSP définie dans `vercel.json` (aucun script ou ressource tierce non autorisée).
- Build : `npm run build` doit compiler sans avertissement ni régression.

## Review Focus

- Canonical URL exacte sans double slash ni omission du protocole HTTPS.
- Sitemap accessible et valide XML avec date `lastmod` à jour (`2026-11-26`).
- Robots.txt pointant vers le nouveau sitemap sur `ateliergrafrika.bj`.
- Validité syntaxique du JSON-LD Schema.org (sans erreur d'échappement).
- Préservation de toutes les fonctionnalités interactives (modal devis, carrousel, splash screen).

---

### Task 1: Configuration du Domaine Officiel & Google Search Console dans `index.html`

**Files:**
- Modify: `index.html:8-58`

**Interfaces:**
- Consumes: Domaine `https://ateliergrafrika.bj`, code Google Search Console.
- Produces: Balises Canonical, OpenGraph, Twitter Cards, Geo tags, Google Search Console meta tag.

- [ ] **Step 1: Mettre à jour les balises de base et insérer la balise Google Search Console**
  - Insérer `<meta name="google-site-verification" content="zbvqzhgMc2gu-p8Azhwh84kGdU0b2GUWFp8MUhMbhrg">`
  - Mettre à jour le Canonical : `<link rel="canonical" href="https://ateliergrafrika.bj/">`
  - Optimiser le `<title>` : `Atelier Grafrika | Cabinet d'Architecture, Plans 3D & BTP au Bénin (Cotonou, Calavi)`
  - Mettre à jour les balises OpenGraph (`og:url` -> `https://ateliergrafrika.bj/`, `og:image` -> `https://ateliergrafrika.bj/assets/cover.jpg`)
  - Mettre à jour les Twitter Cards (`twitter:image` -> `https://ateliergrafrika.bj/assets/cover.jpg`)
  - Ajouter les métadonnées géolocalisées pour le SEO local Bénin (`geo.region`, `geo.placename`, `geo.position`, `ICBM`).

- [ ] **Step 2: Vérifier la conformité du code HTML**
  - Vérifier que les balises sont bien fermées et positionnées dans le `<head>`.

---

### Task 2: Déploiement des Données Structurées Avancées (Schema.org `@graph` & FAQ)

**Files:**
- Modify: `index.html:25-56` (section JSON-LD)

**Interfaces:**
- Consumes: Coordonnées officielles de l'agence, services (Architecture, Design d'Espace, BTP, Suivi de chantier, Permis de construire).
- Produces: Schema JSON-LD structuré combinant `ArchitecturalFirm`, `GeneralContractor` et `FAQPage` pour les Rich Snippets Google.

- [ ] **Step 1: Rédiger le bloc JSON-LD `@graph` ultra-complet**
  - `ArchitecturalFirm` + `GeneralContractor` avec nom, URL `https://ateliergrafrika.bj/`, logo, cover, téléphone `+2290197932325`, adresse à Abomey-Calavi/Cotonou, zone desservie (Bénin, Afrique de l'Ouest, International / Diaspora).
  - Catalogue d'offres `hasOfferCatalog` avec les prestations phares (Conception architecturale, Plans 3D & Réalité virtuelle, Demande de Permis de construire, Suivi et exécution de chantiers BTP, Design d'espace et rénovation).
  - `FAQPage` avec 3 questions/réponses clés à forte valeur SEO pour capturer le haut de la première page sur Google.

- [ ] **Step 2: Valider la structure JSON**
  - Vérifier que le JSON est strictement valide (pas de virgule traînante, guillemets échappés).

---

### Task 3: Mise à jour du `sitemap.xml` et de `robots.txt`

**Files:**
- Modify: `public/sitemap.xml`
- Modify: `public/robots.txt`

**Interfaces:**
- Consumes: Domaine `https://ateliergrafrika.bj/`.
- Produces: Fichiers de découverte et d'indexation pour les robots d'exploration Googlebot.

- [ ] **Step 1: Mettre à jour `public/sitemap.xml`**
  - Modifier `<loc>` vers `https://ateliergrafrika.bj/`
  - Mettre `<lastmod>2026-11-26</lastmod>`
  - Maintenir `<changefreq>weekly</changefreq>` et `<priority>1.0</priority>`

- [ ] **Step 2: Mettre à jour `public/robots.txt`**
  - Modifier la directive `Sitemap:` vers `https://ateliergrafrika.bj/sitemap.xml`
  - Maintenir la protection de `/admin/` et `/api/`.

---

### Task 4: Compilation Vite et Validation Finale

**Files:**
- Test: Exécution de `npm run build`

**Interfaces:**
- Consumes: Tous les fichiers modifiés.
- Produces: Build de production dans `dist/`.

- [ ] **Step 1: Lancer le build Vite**
  - Exécuter `npm run build` et vérifier le code de sortie 0.

- [ ] **Step 2: Vérifier le fichier compilé `dist/index.html`**
  - Confirmer la présence de la balise de vérification Google et du domaine officiel `https://ateliergrafrika.bj`.

- [ ] **Step 3: Rédiger le guide d'action immédiate Google Search Console pour l'utilisateur**
  - Instructions pas à pas pour finaliser l'indexation sur search.google.com et soumettre le sitemap.
