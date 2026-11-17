# Refonte du Dashboard Atelier Grafrika - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre l'interface du tableau de bord d'administration d'Atelier Grafrika pour reproduire fidèlement l'esthétique du template de référence (sidebar bleu roi avec onglet découpé incurvé, bandeau supérieur bleu avec 4 cartes KPI blanches, grand tableau structuré avec barres de progression et badges de priorité), tout en articulant le dashboard autour des 3 besoins majeurs : Vue d'ensemble, Gestion des infos du site visiteur, et Gestion des projets.

**Architecture:** Refonte du DOM dans `admin/index.html` et des styles dans `admin/admin.css` sans casser la logique API existante. Adaptation du contrôleur dans `admin/admin.js` pour alimenter le nouveau tableau de bord, les 4 cartes métriques, la progression dynamique (%) et la priorité des demandes clients.

**Tech Stack:** HTML5, CSS3 (Modern Flexbox, CSS Grid, SVG vectoriels), Vanilla JavaScript ES Modules, API REST Vercel / MySQL 8.0 TiDB Cloud.

**Spec:** Image de référence fournie par l'utilisateur + 3 modules fonctionnels convenus (Vue d'ensemble, Infos site visiteur, Projets du studio).

## Global Constraints

- Respect strict de la charte de l'agence : Bleu roi architectural (`#104c91` / `#0d3d73`), accents dorés/ocres légers, typographie Poppins & Montserrat.
- 100% vectoriel SVG (zéro émoji dans l'interface professionnelle).
- Zéro dépendance CSS externe superflue (CSS pur, rapide, responsive mobile et desktop).
- Compatibilité totale avec l'API MySQL existante (`api/_db.js`, `api/settings`, `api/projects`, `api/leads`).

## Review Focus

- Rendu fidèle de l'onglet actif incurvé (effet de découpe pill blanche fluide).
- Lisibilité et responsive du bandeau supérieur bleu avec les 4 cartes blanches sur écran mobile et desktop.
- Rendu des barres de progression et badges de priorité dans le tableau des devis.
- Persistance de la modification des coordonnées du site visiteur dans MySQL.
- Ajout, affichage et suppression de réalisations dans la gestion des projets.

---

### Task 1: Restructuration du Layout HTML (`admin/index.html`)

**Files:**
- Modify: `admin/index.html`

- [ ] Structurer la sidebar latérale : Logo Atelier Grafrika, titre du studio, boutons de navigation (`VUE D'ENSEMBLE`, `INFOS DU SITE`, `PROJETS RÉALISÉS`, `DEVIS & LEADS`, `SITE PUBLIC`, `DÉCONNEXION`).
- [ ] Construire le bandeau supérieur bleu (`dash-hero-banner`) avec le titre centré `« TABLEAU DE BORD • ATELIER GRAFRIKA »` et les 4 conteneurs de cartes KPI blanches.
- [ ] Intégrer le conteneur du tableau central inspiré de la capture avec les en-têtes : `DEVIS / CLIENT`, `STATUT`, `% PROGRESSION`, `PRIORITÉ`, `DATE`, `ACTIONS`.
- [ ] Organiser les panneaux d'onglets : `#tabDashboard` (Vue d'ensemble), `#tabSettings` (Modifier les infos du site visiteur), `#tabProjects` (Mettre des projets), `#tabLeads` (Tous les devis).

### Task 2: Conception CSS Fidèle au Template (`admin/admin.css`)

**Files:**
- Modify: `admin/admin.css`

- [ ] Styliser la sidebar en bleu roi profond (`#104c91`) avec typographie blanche.
- [ ] Coder l'effet d'onglet actif en pilule blanche incurvée (`border-radius: 30px 0 0 30px` avec raccord fluide vers le fond blanc du contenu).
- [ ] Styliser le grand bandeau supérieur bleu arrondi et les 4 cartes KPI blanches intérieures (chiffre en grand, label en majuscules, icône SVG clipboard/check).
- [ ] Styliser le tableau central :
  - En-têtes discrets en majuscules grisées.
  - Lignes de tableau espacées et élégantes.
  - Barre de progression horizontale sleek avec remplissage bleu et texte pourcentage.
  - Badges de priorité arrondis (`HAUTE` en rouge corail, `MOYENNE` en ocre/jaune, `BASSE` en vert).
  - Puces et statuts colorés.
- [ ] Assurer la responsivité mobile (menu burger rétractable, adaptation des 4 cartes KPI en grille 2x2 ou défilement, tableau scrollable horizontalement).

### Task 3: Logique Dynamique JavaScript & Liaison Données (`admin/admin.js`)

**Files:**
- Modify: `admin/admin.js`

- [ ] Adapter la fonction `renderDashboardOverview()` pour injecter les données réelles dans les 4 cartes KPI du bandeau bleu.
- [ ] Injecter la liste des devis récents dans le nouveau tableau avec calcul de la barre de progression (ex: Nouveau = 25%, En cours = 65%, Traité = 100%) et attribution de la priorité.
- [ ] Garantir le bon fonctionnement des actions rapides (clic WhatsApp direct vers le client, appel, changement de statut).
- [ ] Lier les onglets `INFOS DU SITE` (sauvegarde des coordonnées du site dans MySQL) et `PROJETS` (création/suppression de projets dans MySQL).

### Task 4: Tests, Vérification Visuelle et Déploiement

**Files:**
- Test: Local build & live server testing
- Commit & push to main

- [ ] Lancer la compilation de production (`npm run build`) et vérifier l'absence d'erreurs de syntaxe ou de bundling.
- [ ] Vérifier la cohérence visuelle sur grand écran et mobile.
- [ ] Commiter les modifications et pousser sur GitHub pour déclencher le déploiement Vercel.
- [ ] Confirmer le bon rendu sur `https://atelier-grafrika.vercel.app/admin/`.
