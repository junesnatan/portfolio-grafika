/**
 * ATELIER GRAFRIKA - LOGIQUE D'ADMINISTRATION COMPLÈTE
 * Gestion du portfolio, des demandes de devis, des coordonnées et des statistiques
 * 0 émoji - 100% vectoriel SVG
 */

// =========================================================================
// 1. GESTION DES CLÉS & VALEURS PAR DÉFAUT (LOCALSTORAGE)
// =========================================================================
const KEYS = {
    PROJECTS: 'GRAFRIKA_PROJECTS',
    SETTINGS: 'GRAFRIKA_SETTINGS',
    LEADS: 'GRAFRIKA_LEADS',
    STATS: 'GRAFRIKA_STATS',
    AUTH: 'GRAFRIKA_AUTH',
    SESSION: 'GRAFRIKA_ADMIN_SESSION'
};

// 7 Projets officiels par défaut
const DEFAULT_PROJECTS = [
    {
        id: 1,
        title: "Villa Océane & Claustras",
        category: "Architecture",
        location: "Fidjrossè, Cotonou",
        surface: "360 m²",
        duration: "12 mois",
        photos: [
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=85"
        ],
        description: "Une villa claire et aérée face à la mer, pensée pour laisser circuler la brise naturelle avec piscine et claustras protecteurs."
    },
    {
        id: 2,
        title: "Résidence de Prestige & Iroko",
        category: "Design d'Espace",
        location: "Les Cocotiers, Cotonou",
        surface: "280 m²",
        duration: "5 mois",
        photos: [
            "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=1000&q=85"
        ],
        description: "Un intérieur sobre et chaleureux où le bois d'iroko local habille les espaces sur-mesure."
    },
    {
        id: 3,
        title: "Chantier BTP & Structure Béton",
        category: "BTP & Gros Œuvre",
        location: "Ganhi, Cotonou",
        surface: "650 m²",
        duration: "9 mois",
        photos: [
            "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1000&q=85"
        ],
        description: "Supervision complète du gros œuvre et coulage de la structure béton pour un bâtiment d'affaires."
    },
    {
        id: 4,
        title: "Villa Duplex Contemporaine",
        category: "Architecture & Permis",
        location: "Abomey-Calavi",
        surface: "320 m²",
        duration: "10 mois",
        photos: [
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1000&q=85"
        ],
        description: "Du premier coup de crayon en plan 3D jusqu'à la remise des clés de ce duplex contemporain."
    },
    {
        id: 5,
        title: "Penthouse & Rooftop Végétalisé",
        category: "Design d'Espace",
        location: "Haie Vive, Cotonou",
        surface: "220 m²",
        duration: "4 mois",
        photos: [
            "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1000&q=85"
        ],
        description: "Rénovation d'un dernier étage transformé en espace ouvert avec terrasse et pergola ombragée."
    },
    {
        id: 6,
        title: "Immeuble R+3 Résidentiel",
        category: "BTP & Chantier",
        location: "Porto-Novo",
        surface: "720 m²",
        duration: "14 mois",
        photos: [
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=85"
        ],
        description: "Chantier complet pour cet immeuble résidentiel, des fondations jusqu'aux finitions intérieures."
    },
    {
        id: 7,
        title: "Domaine & Résidence Tropicale",
        category: "Architecture & BTP",
        location: "Ouidah",
        surface: "450 m²",
        duration: "16 mois",
        photos: [
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1000&q=85",
            "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=85"
        ],
        description: "Grande maison ouverte sur le jardin, associant pierre locale et varangues fraîches."
    }
];

// Leads de démonstration initiaux au style de la capture
const SAMPLE_LEADS = [
    {
        id: 101,
        date: new Date(Date.now() - 3600000 * 4).toISOString(),
        name: "Carlos Mendes",
        phone: "+229 01 45 88 12",
        city: "Calavi, Arconville",
        domain: "Plans 3D & Permis",
        message: "Villa R+1 moderne de 350 m² sur terrain sécurisé.",
        status: "En contact"
    },
    {
        id: 102,
        date: new Date(Date.now() - 3600000 * 12).toISOString(),
        name: "Liam Brooks",
        phone: "+229 01 77 23 90",
        city: "Cotonou, Haie Vive",
        domain: "Construction BTP",
        message: "Immeuble d'affaires, supervision de gros œuvre.",
        status: "Devis validé"
    },
    {
        id: 103,
        date: new Date(Date.now() - 3600000 * 28).toISOString(),
        name: "Diego Alvarez",
        phone: "+33 6 12 34 56 78",
        city: "Diaspora / Ouidah",
        domain: "Rénovation & Design",
        message: "Aménagement d'une maison de vacances familiale.",
        status: "En contact"
    },
    {
        id: 104,
        date: new Date(Date.now() - 3600000 * 48).toISOString(),
        name: "Tommy Clarke",
        phone: "+229 01 99 10 20",
        city: "Porto-Novo",
        domain: "Aménagement Pro",
        message: "Agencement de bureaux commerciaux de 220 m².",
        status: "Nouveau"
    }
];

// Coordonnées par défaut
const DEFAULT_SETTINGS = {
    whatsapp: "+229 01 00 00 00",
    phone: "+229 01 00 00 00",
    email: "contact@ateliergrafika.com",
    location: "Abomey-Calavi, Bénin",
    instagram: "https://instagram.com",
    tiktok: "https://tiktok.com",
    facebook: "https://facebook.com",
    linkedin: "https://linkedin.com",
    x: "https://x.com"
};

// Accès administrateur par défaut
const DEFAULT_AUTH = {
    email: "admin@ateliergrafika.com",
    password: "grafika2026"
};

// Fonctions d'accès au stockage
function getStoredProjects() {
    const raw = localStorage.getItem(KEYS.PROJECTS);
    if (!raw) {
        localStorage.setItem(KEYS.PROJECTS, JSON.stringify(DEFAULT_PROJECTS));
        return DEFAULT_PROJECTS;
    }
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PROJECTS;
    } catch (e) {
        return DEFAULT_PROJECTS;
    }
}

function saveStoredProjects(projects) {
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
}

function getStoredSettings() {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        return DEFAULT_SETTINGS;
    }
    try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (e) {
        return DEFAULT_SETTINGS;
    }
}

function saveStoredSettings(settings) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

function getStoredLeads() {
    const raw = localStorage.getItem(KEYS.LEADS);
    if (!raw) {
        localStorage.setItem(KEYS.LEADS, JSON.stringify(SAMPLE_LEADS));
        return SAMPLE_LEADS;
    }
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : SAMPLE_LEADS;
    } catch (e) {
        return SAMPLE_LEADS;
    }
}

function saveStoredLeads(leads) {
    localStorage.setItem(KEYS.LEADS, JSON.stringify(leads));
}

function getStoredStats() {
    const raw = localStorage.getItem(KEYS.STATS);
    if (!raw) return { views: 248, whatsapp: 39, leads: 12 };
    try {
        return JSON.parse(raw);
    } catch (e) {
        return { views: 248, whatsapp: 39, leads: 12 };
    }
}

function getStoredAuth() {
    const raw = localStorage.getItem(KEYS.AUTH);
    if (!raw) {
        localStorage.setItem(KEYS.AUTH, JSON.stringify(DEFAULT_AUTH));
        return DEFAULT_AUTH;
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        return DEFAULT_AUTH;
    }
}

function saveStoredAuth(auth) {
    localStorage.setItem(KEYS.AUTH, JSON.stringify(auth));
}


// =========================================================================
// 2. GESTION DE L'AUTHENTIFICATION (ADMIN UNIQUE)
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {

    const loginScreen = document.getElementById('loginScreen');
    const adminApp = document.getElementById('adminApp');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const loginPassword = document.getElementById('loginPassword');

    function checkAuth() {
        const isLoggedSession = sessionStorage.getItem(KEYS.SESSION);
        const isLoggedLocal = localStorage.getItem(KEYS.SESSION);

        if (isLoggedSession === 'true' || isLoggedLocal === 'true') {
            showAdminApp();
        } else {
            showLogin();
        }
    }

    function showLogin() {
        if (loginScreen) loginScreen.style.display = 'flex';
        if (adminApp) adminApp.style.display = 'none';
    }

    function showAdminApp() {
        if (loginScreen) loginScreen.style.display = 'none';
        if (adminApp) adminApp.style.display = 'flex';
        initAdminDashboard();
    }

    if (togglePasswordBtn && loginPassword) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPass = loginPassword.type === 'password';
            loginPassword.type = isPass ? 'text' : 'password';
        });
    }

    const btnQuickFillDemo = document.getElementById('btnQuickFillDemo');
    if (btnQuickFillDemo) {
        btnQuickFillDemo.addEventListener('click', () => {
            const emailInput = document.getElementById('loginEmail');
            const passwordInput = document.getElementById('loginPassword');
            const auth = getStoredAuth();
            if (emailInput) emailInput.value = auth.email;
            if (passwordInput) passwordInput.value = auth.password;
            if (loginError) loginError.style.display = 'none';
            showToast("Identifiants pré-remplis.");
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('loginEmail').value.trim();
            const passwordInput = document.getElementById('loginPassword').value.trim();
            const rememberMe = document.getElementById('rememberMe').checked;

            const auth = getStoredAuth();

            if (emailInput.toLowerCase() === auth.email.toLowerCase() && passwordInput === auth.password) {
                if (rememberMe) {
                    localStorage.setItem(KEYS.SESSION, 'true');
                } else {
                    sessionStorage.setItem(KEYS.SESSION, 'true');
                }
                if (loginError) loginError.style.display = 'none';
                showAdminApp();
                showToast("Connexion réussie. Bienvenue sur votre dashboard.");
            } else {
                if (loginError) {
                    loginError.textContent = "Identifiants incorrects. Veuillez vérifier votre adresse e-mail et votre mot de passe.";
                    loginError.style.display = 'block';
                }
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem(KEYS.SESSION);
            localStorage.removeItem(KEYS.SESSION);
            showLogin();
            showToast("Vous êtes déconnecté.");
        });
    }

    checkAuth();
});


// =========================================================================
// 3. LOGIQUE GLOBALE DU DASHBOARD (NOUVEAU DESIGN FLOATING CARD)
// =========================================================================
let currentEditingPhotos = [];
let activeLeadFilter = 'all';

function initAdminDashboard() {
    setupNavigation();
    setupMobileDrawer();
    renderDashboardOverview();
    renderProjectsList();
    renderLeadsList();
    loadSettingsForm();
    setupProjectModal();
    setupSettingsForms();
}

// =========================================================================
// 4. NAVIGATION ENTRE ONGLETS
// =========================================================================
function setupNavigation() {
    const navItems = document.querySelectorAll('.dash-nav-btn');
    const tabPanes = {
        dashboard: document.getElementById('tabDashboard'),
        projects: document.getElementById('tabProjects'),
        leads: document.getElementById('tabLeads'),
        stats: document.getElementById('tabStats'),
        settings: document.getElementById('tabSettings')
    };

    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');

    const titles = {
        dashboard: { title: "Dashboard", sub: "Supervisez vos projets d'architecture, devis et contacts en temps réel." },
        projects: { title: "Projets & Portfolio", sub: "Gestion des réalisations et galeries photos" },
        leads: { title: "Devis & Leads", sub: "Suivi des clients potentiels et prises de contact" },
        stats: { title: "Analytics", sub: "Performances de votre Link in Bio et audience" },
        settings: { title: "Réglages", sub: "Mise à jour des coordonnées et paramètres du site" }
    };

    function switchTab(tabKey) {
        if (!tabKey) return;

        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tabKey);
        });

        Object.keys(tabPanes).forEach(key => {
            if (tabPanes[key]) {
                tabPanes[key].classList.toggle('active', key === tabKey);
            }
        });

        if (titles[tabKey]) {
            if (pageTitle) pageTitle.textContent = titles[tabKey].title;
            if (pageSubtitle) pageSubtitle.textContent = titles[tabKey].sub;
        }

        const sidebar = document.getElementById('adminSidebar');
        if (sidebar) sidebar.classList.remove('open');
    }

    navItems.forEach(item => {
        if (item.dataset.tab) {
            item.addEventListener('click', () => {
                switchTab(item.dataset.tab);
            });
        }
    });

    document.querySelectorAll('[data-tab-switch]').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tabSwitch);
        });
    });

    const btnDashNewProj = document.getElementById('btnDashNewProj');
    if (btnDashNewProj) {
        btnDashNewProj.addEventListener('click', () => {
            switchTab('projects');
            openProjectModal();
        });
    }
}

function setupMobileDrawer() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('adminSidebar');

    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }
}


// =========================================================================
// 5. RENDU DU DASHBOARD (STYLE CAPTURE AVEC STATUS PILLS & INITIALES)
// =========================================================================
function renderDashboardOverview() {
    const projects = getStoredProjects();
    const leads = getStoredLeads();
    const stats = getStoredStats();

    // KPIs
    const statViews = document.getElementById('statViews');
    const statWhatsapp = document.getElementById('statWhatsapp');
    const statLeads = document.getElementById('statLeads');
    const statProjects = document.getElementById('statProjects');

    if (statViews) statViews.textContent = stats.views || 248;
    if (statWhatsapp) statWhatsapp.textContent = stats.whatsapp || 39;
    if (statLeads) statLeads.textContent = leads.length;
    if (statProjects) statProjects.textContent = projects.length;

    // Badges sidebar
    const badgeProjectCount = document.getElementById('badgeProjectCount');
    const badgeLeadsCount = document.getElementById('badgeLeadsCount');

    if (badgeProjectCount) badgeProjectCount.textContent = projects.length;
    if (badgeLeadsCount) badgeLeadsCount.textContent = leads.filter(l => l.status === 'Nouveau').length;

    // Liste des leads récents (Team Collaboration style)
    const recentLeadsContainer = document.getElementById('dashRecentLeadsList');
    if (recentLeadsContainer) {
        recentLeadsContainer.innerHTML = '';
        const recentLeads = [...leads].slice(0, 4);

        recentLeads.forEach(lead => {
            const item = document.createElement('div');
            item.className = 'lead-row-card';
            const cleanPhone = (lead.phone || '').replace(/\s+/g, '');
            const waUrl = `https://wa.me/${cleanPhone}?text=Bonjour%20${encodeURIComponent(lead.name)},%20Atelier%20Grafika%20fait%20suite%20à%20votre%20demande...`;

            // Initiales pour le badge avatar
            const names = (lead.name || 'Client').trim().split(' ');
            const initials = (names[0][0] + (names[1] ? names[1][0] : '')).toUpperCase();

            // Classes status
            let statusClass = 'orange';
            let statusText = 'In progress';
            if (lead.status === 'Devis validé' || lead.status === 'Completed') {
                statusClass = 'green';
                statusText = 'Completed';
            } else if (lead.status === 'Nouveau' || lead.status === 'In pending') {
                statusClass = 'red';
                statusText = 'In pending';
            }

            item.innerHTML = `
                <div class="lead-avatar-meta">
                    <div class="lead-circle-avatar">${initials}</div>
                    <div class="lead-names-col">
                        <span class="lead-name-bold">${escapeHtml(lead.name)}</span>
                        <span class="lead-sub-text">${escapeHtml(lead.domain || 'Projet')} — ${escapeHtml(lead.city || 'Bénin')}</span>
                    </div>
                </div>
                <div class="lead-actions-cell">
                    <span class="pill-status-badge ${statusClass}">${statusText}</span>
                    <a href="${waUrl}" target="_blank" rel="noopener" class="btn-wa-round" title="Contacter sur WhatsApp">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                    </a>
                </div>
            `;
            recentLeadsContainer.appendChild(item);
        });
    }

    // Aperçu du portfolio en ligne sur le dashboard
    const miniGrid = document.getElementById('dashProjectsMiniGrid');
    if (miniGrid) {
        miniGrid.innerHTML = '';
        const showcaseProjects = projects.slice(0, 3);
        showcaseProjects.forEach(p => {
            const tile = document.createElement('div');
            tile.className = 'mini-project-tile';
            const firstPhoto = (p.photos && p.photos[0]) ? p.photos[0] : '../assets/logo.png';
            tile.innerHTML = `
                <img src="${escapeHtml(firstPhoto)}" alt="${escapeHtml(p.title)}" class="mini-project-thumb">
                <div class="mini-project-meta">
                    <span class="mini-project-title">${escapeHtml(p.title)}</span>
                    <span class="mini-project-sub">${escapeHtml(p.category || 'Architecture')} • ${escapeHtml(p.location || 'Bénin')}</span>
                </div>
            `;
            tile.addEventListener('click', () => {
                const projectsTabBtn = document.querySelector('.dash-nav-btn[data-tab="projects"]');
                if (projectsTabBtn) projectsTabBtn.click();
            });
            miniGrid.appendChild(tile);
        });
    }
}


// =========================================================================
// 6. GESTION DES PROJETS (CMS PORTFOLIO)
// =========================================================================
function renderProjectsList() {
    const container = document.getElementById('projectsAdminGrid');
    if (!container) return;

    const projects = getStoredProjects();
    const searchVal = (document.getElementById('projectSearchInput')?.value || '').toLowerCase();
    const catVal = document.getElementById('projectCategoryFilter')?.value || 'all';

    const filtered = projects.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchVal) || p.location.toLowerCase().includes(searchVal);
        const matchesCat = (catVal === 'all') || (p.category === catVal);
        return matchesSearch && matchesCat;
    });

    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: #ffffff; border-radius: 20px; border: 1.5px dashed var(--border-subtle); color: var(--text-secondary);">
                <p style="font-weight: 700; margin-bottom: 0.4rem;">Aucun projet correspondant</p>
                <p style="font-size: 0.82rem; color: var(--text-subtle);">Modifiez vos filtres ou ajoutez une nouvelle réalisation.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(proj => {
        const card = document.createElement('div');
        card.className = 'proj-admin-card';
        const cover = (proj.photos && proj.photos.length > 0) ? proj.photos[0] : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
        const photoCount = proj.photos ? proj.photos.length : 0;

        card.innerHTML = `
            <div class="proj-card-media">
                <img src="${cover}" alt="${escapeHtml(proj.title)}" loading="lazy">
                <span class="proj-card-badge">${escapeHtml(proj.category)}</span>
                <span class="proj-photos-count">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    ${photoCount}
                </span>
            </div>
            <div class="proj-card-body">
                <h3 class="proj-card-title">${escapeHtml(proj.title)}</h3>
                <span class="proj-card-loc">${escapeHtml(proj.location)}</span>
                <div class="proj-card-meta-row">
                    <span>${escapeHtml(proj.surface || 'Sur-mesure')}</span>
                    <span>•</span>
                    <span>${escapeHtml(proj.duration || 'Durée')}</span>
                </div>
                <p class="proj-card-desc">${escapeHtml(proj.description || '')}</p>
                <div class="proj-card-actions">
                    <button class="btn-outline-pill-small btn-edit-proj" data-id="${proj.id}">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        <span>Modifier</span>
                    </button>
                    <button class="btn-outline-pill-small btn-delete-proj" data-id="${proj.id}" style="color: var(--brand-red); border-color: #fecaca;">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        <span>Supprimer</span>
                    </button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    container.querySelectorAll('.btn-edit-proj').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id, 10);
            const proj = projects.find(p => p.id === id);
            if (proj) openProjectModal(proj);
        });
    });

    container.querySelectorAll('.btn-delete-proj').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id, 10);
            deleteProject(id);
        });
    });
}

document.getElementById('projectSearchInput')?.addEventListener('input', renderProjectsList);
document.getElementById('projectCategoryFilter')?.addEventListener('change', renderProjectsList);


// =========================================================================
// 7. MODAL DE PROJET & GESTION DES PHOTOS
// =========================================================================
function setupProjectModal() {
    const projectModal = document.getElementById('projectModal');
    const btnAddNewProject = document.getElementById('btnAddNewProject');
    const btnCloseProjectModal = document.getElementById('btnCloseProjectModal');
    const btnCancelProject = document.getElementById('btnCancelProject');
    const projectForm = document.getElementById('projectForm');
    const btnAddPhotoUrl = document.getElementById('btnAddPhotoUrl');
    const projPhotoUrlInput = document.getElementById('projPhotoUrlInput');
    const projPhotosFileInput = document.getElementById('projPhotosFileInput');

    if (btnAddNewProject) {
        btnAddNewProject.addEventListener('click', () => openProjectModal());
    }

    if (btnCloseProjectModal) {
        btnCloseProjectModal.addEventListener('click', () => closeProjectModal());
    }

    if (btnCancelProject) {
        btnCancelProject.addEventListener('click', () => closeProjectModal());
    }

    window.addEventListener('click', (e) => {
        if (e.target === projectModal) closeProjectModal();
    });

    if (btnAddPhotoUrl && projPhotoUrlInput) {
        btnAddPhotoUrl.addEventListener('click', () => {
            const url = projPhotoUrlInput.value.trim();
            if (url) {
                currentEditingPhotos.push(url);
                projPhotoUrlInput.value = '';
                renderEditingPhotosThumbnails();
            }
        });
    }

    if (projPhotosFileInput) {
        projPhotosFileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    currentEditingPhotos.push(event.target.result);
                    renderEditingPhotosThumbnails();
                };
                reader.readAsDataURL(file);
            });
            projPhotosFileInput.value = '';
        });
    }

    if (projectForm) {
        projectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const idInput = document.getElementById('projId').value;
            const title = document.getElementById('projTitle').value.trim();
            const category = document.getElementById('projCategory').value;
            const location = document.getElementById('projLocation').value.trim();
            const surface = document.getElementById('projSurface').value.trim();
            const duration = document.getElementById('projDuration').value.trim();
            const description = document.getElementById('projDescription').value.trim();

            if (currentEditingPhotos.length === 0) {
                showToast("Veuillez ajouter au moins une photo pour cette réalisation.", 'alert');
                return;
            }

            const projects = getStoredProjects();

            if (idInput) {
                const id = parseInt(idInput, 10);
                const index = projects.findIndex(p => p.id === id);
                if (index !== -1) {
                    projects[index] = {
                        ...projects[index],
                        title,
                        category,
                        location,
                        surface: surface || "Sur-mesure",
                        duration: duration || "Non spécifié",
                        description,
                        photos: [...currentEditingPhotos]
                    };
                    showToast("Projet mis à jour avec succès !");
                }
            } else {
                const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
                const newProject = {
                    id: newId,
                    title,
                    category,
                    location,
                    surface: surface || "Sur-mesure",
                    duration: duration || "Non spécifié",
                    description,
                    photos: [...currentEditingPhotos]
                };
                projects.unshift(newProject);
                showToast("Nouveau projet ajouté avec succès !");
            }

            saveStoredProjects(projects);
            closeProjectModal();
            renderProjectsList();
            renderDashboardOverview();
        });
    }
}

function openProjectModal(project = null) {
    const modal = document.getElementById('projectModal');
    const modalAction = document.getElementById('projectModalAction');
    const modalTitle = document.getElementById('projectModalTitle');
    const btnSaveText = document.getElementById('btnSaveProjectText');

    if (!modal) return;

    if (project) {
        modalAction.textContent = "Modification";
        modalTitle.textContent = "Modifier la réalisation";
        btnSaveText.textContent = "Enregistrer les modifications";

        document.getElementById('projId').value = project.id;
        document.getElementById('projTitle').value = project.title;
        document.getElementById('projCategory').value = project.category;
        document.getElementById('projLocation').value = project.location;
        document.getElementById('projSurface').value = project.surface || '';
        document.getElementById('projDuration').value = project.duration || '';
        document.getElementById('projDescription').value = project.description || '';

        currentEditingPhotos = [...(project.photos || [])];
    } else {
        modalAction.textContent = "Nouveau projet";
        modalTitle.textContent = "Ajouter une réalisation";
        btnSaveText.textContent = "Publier le projet";

        document.getElementById('projectForm').reset();
        document.getElementById('projId').value = '';
        currentEditingPhotos = [];
    }

    renderEditingPhotosThumbnails();
    modal.style.display = 'flex';
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    if (modal) modal.style.display = 'none';
}

function renderEditingPhotosThumbnails() {
    const container = document.getElementById('projPhotosContainer');
    if (!container) return;

    container.innerHTML = '';
    currentEditingPhotos.forEach((photoUrl, idx) => {
        const item = document.createElement('div');
        item.className = `admin-thumb-item ${idx === 0 ? 'is-cover' : ''}`;
        item.title = idx === 0 ? "Photo de couverture" : "Cliquer pour définir en couverture";

        item.innerHTML = `
            <img src="${photoUrl}" alt="Photo ${idx + 1}">
            <button type="button" class="admin-thumb-del" data-idx="${idx}" title="Supprimer la photo">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        item.addEventListener('click', (e) => {
            if (e.target.closest('.admin-thumb-del')) return;
            if (idx !== 0) {
                const clicked = currentEditingPhotos.splice(idx, 1)[0];
                currentEditingPhotos.unshift(clicked);
                renderEditingPhotosThumbnails();
            }
        });

        container.appendChild(item);
    });

    container.querySelectorAll('.admin-thumb-del').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const delIdx = parseInt(btn.dataset.idx, 10);
            currentEditingPhotos.splice(delIdx, 1);
            renderEditingPhotosThumbnails();
        });
    });
}

function deleteProject(id) {
    if (confirm("Êtes-vous certain de vouloir supprimer cette réalisation du portfolio ?")) {
        let projects = getStoredProjects();
        projects = projects.filter(p => p.id !== id);
        saveStoredProjects(projects);
        renderProjectsList();
        renderDashboardOverview();
        showToast("Projet supprimé du portfolio.");
    }
}


// =========================================================================
// 8. GESTION DES LEADS (CRM)
// =========================================================================
function renderLeadsList() {
    const tbody = document.getElementById('leadsTableBody');
    if (!tbody) return;

    const leads = getStoredLeads();
    const filtered = leads.filter(l => {
        if (activeLeadFilter === 'all') return true;
        return l.status === activeLeadFilter;
    });

    const countAll = document.getElementById('countLeadsAll');
    const countNew = document.getElementById('countLeadsNew');
    const countContact = document.getElementById('countLeadsContact');
    const countDone = document.getElementById('countLeadsDone');

    if (countAll) countAll.textContent = leads.length;
    if (countNew) countNew.textContent = leads.filter(l => l.status === 'Nouveau').length;
    if (countContact) countContact.textContent = leads.filter(l => l.status === 'En contact').length;
    if (countDone) countDone.textContent = leads.filter(l => l.status === 'Devis validé').length;

    tbody.innerHTML = '';

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-subtle);">
                    Aucune demande de devis dans cette catégorie.
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(lead => {
        const tr = document.createElement('tr');
        const cleanPhone = (lead.phone || '').replace(/\s+/g, '');
        const waMsg = encodeURIComponent(`Bonjour ${lead.name} ! Atelier Grafika fait suite à votre demande de devis.`);
        const waUrl = `https://wa.me/${cleanPhone}?text=${waMsg}`;

        tr.innerHTML = `
            <td style="font-size: 0.78rem; color: var(--text-subtle);">${formatDate(lead.date)}</td>
            <td>
                <strong>${escapeHtml(lead.name)}</strong>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${escapeHtml(lead.phone)}</div>
            </td>
            <td><strong>${escapeHtml(lead.domain || 'Sur-mesure')}</strong></td>
            <td>${escapeHtml(lead.city || 'Bénin')}</td>
            <td>
                <select class="status-select-pill" data-id="${lead.id}">
                    <option value="Nouveau" ${lead.status === 'Nouveau' ? 'selected' : ''}>Nouveau</option>
                    <option value="En contact" ${lead.status === 'En contact' ? 'selected' : ''}>En cours</option>
                    <option value="Devis validé" ${lead.status === 'Devis validé' ? 'selected' : ''}>Validé</option>
                    <option value="Archivé" ${lead.status === 'Archivé' ? 'selected' : ''}>Archivé</option>
                </select>
            </td>
            <td style="text-align: right;">
                <a href="${waUrl}" target="_blank" rel="noopener" class="btn-wa-round" style="display: inline-flex;" title="Ouvrir WhatsApp">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                </a>
            </td>
        `;

        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.status-select-pill').forEach(sel => {
        sel.addEventListener('change', (e) => {
            const leadId = e.target.dataset.id;
            const newStatus = e.target.value;
            updateLeadStatus(leadId, newStatus);
        });
    });
}

function updateLeadStatus(id, newStatus) {
    const leads = getStoredLeads();
    const lead = leads.find(l => l.id.toString() === id.toString());
    if (lead) {
        lead.status = newStatus;
        saveStoredLeads(leads);
        renderLeadsList();
        renderDashboardOverview();
        showToast(`Statut mis à jour : ${newStatus}`);
    }
}

document.querySelectorAll('.filter-pill-item').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeLeadFilter = btn.dataset.leadFilter;
        renderLeadsList();
    });
});

document.getElementById('btnExportLeadsCsv')?.addEventListener('click', () => {
    const leads = getStoredLeads();
    if (leads.length === 0) {
        showToast("Aucun lead à exporter.", 'alert');
        return;
    }

    let csvContent = "\uFEFFDate;Nom;Telephone;Prestation;Ville;Message;Statut\n";
    leads.forEach(l => {
        const row = [
            `"${formatDate(l.date)}"`,
            `"${(l.name || '').replace(/"/g, '""')}"`,
            `"${(l.phone || '').replace(/"/g, '""')}"`,
            `"${(l.domain || '').replace(/"/g, '""')}"`,
            `"${(l.city || '').replace(/"/g, '""')}"`,
            `"${(l.message || '').replace(/"/g, '""')}"`,
            `"${l.status || 'Nouveau'}"`
        ];
        csvContent += row.join(';') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_atelier_grafika_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Fichier CSV téléchargé.");
});


// =========================================================================
// 9. COORDONNÉES & RÉGLAGES
// =========================================================================
function loadSettingsForm() {
    const settings = getStoredSettings();
    const auth = getStoredAuth();

    const topProfileEmail = document.getElementById('topProfileEmail');
    if (topProfileEmail && auth.email) topProfileEmail.textContent = auth.email;

    if (document.getElementById('setWhatsapp')) document.getElementById('setWhatsapp').value = settings.whatsapp || '';
    if (document.getElementById('setPhone')) document.getElementById('setPhone').value = settings.phone || '';
    if (document.getElementById('setEmail')) document.getElementById('setEmail').value = settings.email || '';
    if (document.getElementById('setLocation')) document.getElementById('setLocation').value = settings.location || '';
    if (document.getElementById('setInstagram')) document.getElementById('setInstagram').value = settings.instagram || '';
    if (document.getElementById('setTiktok')) document.getElementById('setTiktok').value = settings.tiktok || '';
    if (document.getElementById('setFacebook')) document.getElementById('setFacebook').value = settings.facebook || '';
    if (document.getElementById('setLinkedin')) document.getElementById('setLinkedin').value = settings.linkedin || '';
    if (document.getElementById('setX')) document.getElementById('setX').value = settings.x || '';

    if (document.getElementById('setAdminEmail')) document.getElementById('setAdminEmail').value = auth.email || '';
}

function setupSettingsForms() {
    const contactForm = document.getElementById('settingsContactForm');
    const securityForm = document.getElementById('settingsSecurityForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const updated = {
                whatsapp: document.getElementById('setWhatsapp').value.trim(),
                phone: document.getElementById('setPhone').value.trim(),
                email: document.getElementById('setEmail').value.trim(),
                location: document.getElementById('setLocation').value.trim(),
                instagram: document.getElementById('setInstagram').value.trim(),
                tiktok: document.getElementById('setTiktok').value.trim(),
                facebook: document.getElementById('setFacebook').value.trim(),
                linkedin: document.getElementById('setLinkedin').value.trim(),
                x: document.getElementById('setX').value.trim()
            };

            saveStoredSettings(updated);
            showToast("Coordonnées sauvegardées avec succès !");
        });
    }

    if (securityForm) {
        securityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('setAdminEmail').value.trim();
            const newPass = document.getElementById('setAdminNewPass').value.trim();
            const confirmPass = document.getElementById('setAdminConfirmPass').value.trim();

            if (newPass && newPass !== confirmPass) {
                showToast("Les deux mots de passe ne correspondent pas.", 'alert');
                return;
            }

            const currentAuth = getStoredAuth();
            currentAuth.email = email;
            if (newPass) {
                currentAuth.password = newPass;
            }

            saveStoredAuth(currentAuth);
            const topProfileEmail = document.getElementById('topProfileEmail');
            if (topProfileEmail) topProfileEmail.textContent = email;

            document.getElementById('setAdminNewPass').value = '';
            document.getElementById('setAdminConfirmPass').value = '';
            showToast("Identifiants de sécurité mis à jour !");
        });
    }
}


// =========================================================================
// 10. UTILITAIRES
// =========================================================================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toastMessage');
    if (!toast) return;

    const iconSvg = (type === 'error' || type === 'alert')
        ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#f87171" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
        : `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

    toast.innerHTML = `<span style="display:inline-flex;align-items:center;gap:0.55rem;">${iconSvg}<span>${escapeHtml(message)}</span></span>`;
    toast.classList.add('show');

    if (toast._dismissTimer) clearTimeout(toast._dismissTimer);
    toast._dismissTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

function formatDate(isoStr) {
    if (!isoStr) return "Récent";
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
