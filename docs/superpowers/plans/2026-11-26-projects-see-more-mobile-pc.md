# Section Projets : Affichage 3 (Mobile) / 5 (PC) & Bouton « Voir plus » - Plan d'Implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harmoniser la section Projets sur mobile avec le même design que sur PC, afficher 3 projets au départ sur smartphone et 5 sur PC, et ajouter un bouton interactif « Voir plus » pour révéler le reste des réalisations.

**Architecture:** Mettre à jour `index.html` avec le conteneur du bouton « Voir plus ». Adapter `style.css` pour transformer le carrousel horizontal mobile en un flux vertical épuré de cartes pleine largeur, styliser le bouton « Voir plus » avec rotation du chevron et animation d'apparition des cartes. Mettre à jour `app.js` pour gérer l'état d'expansion (`isProjectsExpanded`), le calcul réactif des limites (3 sur mobile, 5 sur PC), et l'arche courbée.

**Tech Stack:** Vanilla JavaScript (ES Modules), CSS3 (Flexbox, transitions, media queries), HTML5, Vite 5.

**Spec:** Validation utilisateur du 2026-11-26 : Mobile = 3 projets visibles au départ en flux vertical avec design PC ; PC = 5 projets visibles au départ ; bouton « Voir plus » interactif pour dévoiler le reste.

## Global Constraints

- Design cohérent avec la charte Atelier Grafrika (Bleu `#003B73`, Rouge `#850C14`, fond `#FAF8F5`).
- Les cartes conservent toutes leurs fonctionnalités : clic ouvrant le modal avec la galerie complète 7 photos, bouton WhatsApp, etc.
- Responsive fluide : passage de desktop à mobile géré proprement lors du redimensionnement.
- Compilation de production : `npm run build` doit réussir avec code 0.

## Review Focus

- Comportement avec moins de 3 projets (aucun bouton « Voir plus » affiché, pas d'erreur).
- Comportement avec exactement 3 ou 5 projets (bouton masqué si rien à afficher).
- Comportement avec plus de 5 projets (ex. 6, 7 ou 8 projets) : 3 visibles sur mobile, 5 sur PC, bouton actif avec compteur.
- Bascule « Voir plus » -> « Voir moins » avec rotation du chevron et retour doux si replié.
- Disparition propre des points de pagination mobiles devenus obsolètes au profit du flux vertical.

---

### Task 1: Ajout de la structure HTML du bouton « Voir plus » dans `index.html`

**Files:**
- Modify: `index.html:258-266`

**Interfaces:**
- Consumes: Conteneur de galerie `#archGallery`.
- Produces: Bouton `#btnToggleMoreProjects` avec `#seeMoreBtnText` et icône chevron SVG.

- [ ] **Step 1: Ajouter le bouton dans `index.html`**
  - Insérer `#projectsSeeMoreWrap` directement sous `#archGallery`.
  - Masquer par défaut (`style="display: none;"`) pour éviter tout flash avant chargement des projets.

---

### Task 2: Adaptation des styles dans `style.css` (Mobile vertical & Bouton Voir plus)

**Files:**
- Modify: `style.css` (section mobile `arch-gallery-container` et nouvelle classe `.btn-see-more-projects`)

**Interfaces:**
- Consumes: `#projectsSeeMoreWrap`, `.btn-see-more-projects`, `.arch-card`.
- Produces: Styles mobiles (flux vertical de cartes), styles du bouton « Voir plus », animations d'apparition.

- [ ] **Step 1: Ajouter les styles du bouton « Voir plus »**
  - Bouton pilule centré avec bordure `var(--brand-blue)`, couleur bleue, survol avec remplissage bleu et texte blanc.
  - Rotation de 180° de l'icône chevron en mode `.expanded`.
  - Animation `fadeInProjectCard` pour les cartes révélées.

- [ ] **Step 2: Adapter la vue mobile `@media (max-width: 768px)`**
  - Transformer `.arch-gallery-container` en conteneur vertical centré sans scroll horizontal forcé.
  - Fixer la largeur des cartes à 100% (max 480px) et hauteur 360-380px.
  - Désactiver les points de pagination `#mobileCarouselDots` (`display: none !important;`).

---

### Task 3: Logique JavaScript dans `app.js` (Affichage 3/5 et Toggle Voir plus)

**Files:**
- Modify: `app.js:129-265`

**Interfaces:**
- Consumes: `apiClient.getProjects()`, DOM `#archTrack`, `#btnToggleMoreProjects`.
- Produces: Rendu dynamique des cartes selon le mode (3 sur mobile, 5 sur PC ou totalité si étendu), gestionnaire de clic avec bascule Voir plus / Voir moins.

- [ ] **Step 1: Définir la logique d'état et de découpage**
  - Variable `isProjectsExpanded = false`.
  - Fonction helper pour obtenir la limite active : `window.innerWidth <= 768 ? 3 : 5`.
  - Dans `renderCards(projectList)` :
    - Si `total <= limit` : masquer `#projectsSeeMoreWrap`.
    - Si `total > limit` : afficher le bouton avec le texte adéquat.
    - Si non étendu : afficher `projectList.slice(0, limit)`.
    - Si étendu : afficher `projectList` complet.

- [ ] **Step 2: Attacher les écouteurs d'événements**
  - Clic sur `#btnToggleMoreProjects` : inverser `isProjectsExpanded`, rafraîchir les cartes.
  - Si l'utilisateur clique sur « Voir moins », repositionner en douceur vers `#projets`.
  - Écouter `resize` pour recalculer si nécessaire.

---

### Task 4: Tests, Build Vite et Validation

**Files:**
- Test: Compilation avec `npm run build`

**Interfaces:**
- Consumes: Tous les fichiers modifiés.
- Produces: Bundle de production dans `dist/`.

- [ ] **Step 1: Lancer le build Vite**
  - Exécuter `npm run build` et vérifier le code de sortie 0.

- [ ] **Step 2: Déployer et vérifier le fonctionnement**
  - Tester le rendu et commiter/pusher les modifications.
