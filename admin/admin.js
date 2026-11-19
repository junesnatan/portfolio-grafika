/**
 * ATELIER GRAFRIKA - LOGIQUE D'ADMINISTRATION COMPLÈTE
 * Gestion du portfolio, des demandes de devis, des coordonnées et des statistiques
 * Architecture asynchrone connectée au backend Vercel Serverless / SQLite (@libsql)
 * 0 émoji - 100% vectoriel SVG
 */

import { apiClient } from '../api-client.js';
import { DEFAULT_PROJECTS, DEFAULT_SETTINGS, SAMPLE_LEADS } from '../data/initial-data.js';

// =========================================================================
// ÉTAT LOCAL EN MÉMOIRE
// =========================================================================
let currentProjects = [];
let currentLeads = [];
let currentSettings = { ...DEFAULT_SETTINGS };
let currentStats = { views: 248, whatsapp: 39, leads: 12 };

let currentEditingPhotos = [];
let activeLeadFilter = 'all';
let leadSearchQuery = '';

// =========================================================================
// 1. INITIALISATION & AUTHENTIFICATION
// =========================================================================
document.addEventListener('DOMContentLoaded', async () => {
    const loginScreen = document.getElementById('loginScreen');
    const adminApp = document.getElementById('adminApp');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const loginPassword = document.getElementById('loginPassword');
    const btnQuickFillDemo = document.getElementById('btnQuickFillDemo');

    async function checkAuth() {
        const isAuth = await apiClient.checkAuth();
        if (isAuth) {
            showAdminApp();
        } else {
            showLogin();
        }
    }

    function showLogin() {
        if (loginScreen) loginScreen.style.display = 'flex';
        if (adminApp) adminApp.style.display = 'none';
    }

    async function showAdminApp() {
        if (loginScreen) loginScreen.style.display = 'none';
        if (adminApp) adminApp.style.display = 'flex';
        await initAdminDashboard();
    }

    if (togglePasswordBtn && loginPassword) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPass = loginPassword.type === 'password';
            loginPassword.type = isPass ? 'text' : 'password';
        });
    }

    if (btnQuickFillDemo) {
        btnQuickFillDemo.addEventListener('click', () => {
            const emailInput = document.getElementById('loginEmail');
            const passwordInput = document.getElementById('loginPassword');
            if (emailInput) emailInput.value = 'admin@ateliergrafrika.com';
            if (passwordInput) passwordInput.value = 'grafrikaag';
            if (loginError) loginError.style.display = 'none';
            showToast("Identifiants de démonstration pré-remplis.");
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('loginEmail').value.trim();
            const passwordInput = document.getElementById('loginPassword').value.trim();
            const rememberMe = document.getElementById('rememberMe').checked;

            const submitBtn = loginForm.querySelector('.login-submit-btn');
            const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span>Connexion en cours...</span>`;
            }

            try {
                await apiClient.login(emailInput, passwordInput, rememberMe);
                if (loginError) loginError.style.display = 'none';
                await showAdminApp();
                showToast("Connexion réussie. Bienvenue sur votre dashboard.");
            } catch (err) {
                if (loginError) {
                    loginError.textContent = err.message || "Identifiants incorrects. Veuillez vérifier votre adresse e-mail et votre mot de passe.";
                    loginError.style.display = 'block';
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            apiClient.clearToken();
            showLogin();
            showToast("Vous êtes déconnecté.");
        });
    }

    await checkAuth();
});

// =========================================================================
// 2. LOGIQUE GLOBALE DU DASHBOARD (DONNÉES ASYNCHRONES)
// =========================================================================
async function initAdminDashboard() {
    setupNavigation();
    setupMobileDrawer();
    setupProjectModal();
    setupSettingsForms();
    setupLeadFilters();

    await refreshAllData();
}

async function refreshAllData() {
    try {
        const [projects, leads, settings, stats] = await Promise.all([
            apiClient.getProjects(),
            apiClient.getLeads(),
            apiClient.getSettings(),
            apiClient.getStats()
        ]);

        currentProjects = projects || [];
        currentLeads = leads || [];
        currentSettings = settings || { ...DEFAULT_SETTINGS };
        currentStats = stats || { views: 248, whatsapp: 39, leads: 12 };

        renderDashboardOverview();
        renderProjectsList();
        renderLeadsList();
        loadSettingsForm();
    } catch (err) {
        console.error("Erreur de chargement des données dashboard:", err);
        showToast("Impossible de synchroniser certaines données avec le serveur.", "alert");
    }
}

// =========================================================================
// 3. NAVIGATION ENTRE ONGLETS
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
        dashboard: { title: "Vue d'ensemble", sub: "Supervisez vos projets d'architecture, devis et contacts en temps réel." },
        settings: { title: "Infos du site visiteur", sub: "Modifiez vos coordonnées WhatsApp, téléphone, adresse et réseaux sociaux." },
        projects: { title: "Projets & Réalisations", sub: "Ajoutez et gérez vos projets visibles sur le portfolio public." },
        leads: { title: "Devis & Contacts", sub: "Suivi complet des demandes de devis et prospects." },
        stats: { title: "Analytics", sub: "Performances de votre portfolio et audience." }
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
    const backdrop = document.getElementById('sidebarBackdrop');
    const btnCloseSidebar = document.getElementById('btnCloseSidebar');

    function openDrawer() {
        if (sidebar) sidebar.classList.add('open');
        if (backdrop) backdrop.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        if (sidebar) sidebar.classList.remove('open');
        if (backdrop) backdrop.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (sidebar.classList.contains('open')) {
                closeDrawer();
            } else {
                openDrawer();
            }
        });

        if (btnCloseSidebar) {
            btnCloseSidebar.addEventListener('click', (e) => {
                e.stopPropagation();
                closeDrawer();
            });
        }

        if (backdrop) {
            backdrop.addEventListener('click', () => {
                closeDrawer();
            });
        }

        sidebar.querySelectorAll('.dash-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    closeDrawer();
                }
            });
        });
    }
}

// =========================================================================
// 4. RENDU DU DASHBOARD (100% SYNCHRONISÉ AVEC LA BASE DE DONNÉES TIDB)
// =========================================================================
function renderDashboardOverview() {
    // 1. Mise à jour des cartes KPI avec les vraies données de la BDD
    const statProjectsKpi = document.getElementById('statProjectsKpi') || document.getElementById('statProjects');
    const statTotalLeadsKpi = document.getElementById('statTotalLeadsKpi') || document.getElementById('statTotalTasks');
    const statNewLeadsKpi = document.getElementById('statNewLeadsKpi') || document.getElementById('statNotStarted');
    const statDoneLeadsKpi = document.getElementById('statDoneLeadsKpi') || document.getElementById('statLeadsDone');
    const statLeadsProgress = document.getElementById('statLeadsProgress');

    const totalProjects = currentProjects ? currentProjects.length : 0;
    const totalLeads = currentLeads ? currentLeads.length : 0;
    const newLeads = currentLeads ? currentLeads.filter(l => l.status === 'Nouveau' || !l.status).length : 0;
    const inProgressLeads = currentLeads ? currentLeads.filter(l => l.status === 'En contact' || l.status === 'En cours').length : 0;
    const doneLeads = currentLeads ? currentLeads.filter(l => l.status === 'Devis validé' || l.status === 'Terminé').length : 0;

    if (statProjectsKpi) statProjectsKpi.textContent = totalProjects;
    if (statTotalLeadsKpi) statTotalLeadsKpi.textContent = totalLeads;
    if (statNewLeadsKpi) statNewLeadsKpi.textContent = newLeads;
    if (statDoneLeadsKpi) statDoneLeadsKpi.textContent = doneLeads;
    if (statLeadsProgress) statLeadsProgress.textContent = inProgressLeads;

    // Badges barre d'outils et navigation
    const dashToolbarLeadsCount = document.getElementById('dashToolbarLeadsCount');
    const dashProjectsCountBadge = document.getElementById('dashProjectsCountBadge');
    const badgeProjectCount = document.getElementById('badgeProjectCount');
    const badgeLeadsCount = document.getElementById('badgeLeadsCount');

    if (dashToolbarLeadsCount) dashToolbarLeadsCount.textContent = totalLeads;
    if (dashProjectsCountBadge) dashProjectsCountBadge.textContent = totalProjects;
    if (badgeProjectCount) badgeProjectCount.textContent = totalProjects;
    if (badgeLeadsCount) badgeLeadsCount.textContent = newLeads;

    // 2. Rendu du grand tableau Elite : UNIQUEMENT LES VRAIS LEADS DE LA BASE DE DONNÉES
    const eliteTableBody = document.getElementById('eliteOverviewTableBody');
    if (eliteTableBody) {
        eliteTableBody.innerHTML = '';

        if (!currentLeads || currentLeads.length === 0) {
            eliteTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 3.5rem 1.5rem; background: #ffffff;">
                        <div style="max-width: 440px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; text-align: center;">
                            <div style="width: 52px; height: 52px; border-radius: 50%; background: #f0f7ff; color: #104c91; display: flex; align-items: center; justify-content: center;">
                                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                </svg>
                            </div>
                            <strong style="font-size: 1rem; color: #0f172a; font-family: var(--font-heading);">Aucune demande enregistrée dans la base de données</strong>
                            <p style="font-size: 0.82rem; color: #64748b; line-height: 1.5; margin: 0;">
                                Les demandes de devis et dossiers soumis par vos clients sur le site vitrine apparaîtront ici automatiquement avec leurs coordonnées réelles.
                            </p>
                            <a href="../" target="_blank" rel="noopener" class="btn-outline-pill-small" style="margin-top: 0.4rem;">
                                <span>Voir le site public</span>
                            </a>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            currentLeads.forEach((lead, idx) => {
                const tr = document.createElement('tr');
                const clientName = (lead.name || 'Client').trim();
                const domain = lead.domain || 'Architecture';
                const city = lead.city || 'Bénin';

                let statusLabel = 'Nouveau';
                let statusClass = 'status-slate';
                let progressVal = 20;
                let progressClass = '';

                if (lead.status === 'Devis validé' || lead.status === 'Completed' || lead.status === 'Terminé') {
                    statusLabel = 'Validé';
                    statusClass = 'status-green';
                    progressVal = 100;
                    progressClass = 'fill-green';
                } else if (lead.status === 'En contact' || lead.status === 'En cours') {
                    statusLabel = 'En cours';
                    statusClass = 'status-blue';
                    progressVal = 60;
                } else if (lead.status === 'Archivé') {
                    statusLabel = 'Archivé';
                    statusClass = 'status-slate';
                    progressVal = 100;
                }

                let priorityLabel = 'MOYENNE';
                let priorityClass = 'priority-medium';
                const lowerDomain = domain.toLowerCase();
                if (lowerDomain.includes('btp') || lowerDomain.includes('gros') || lowerDomain.includes('permis')) {
                    priorityLabel = 'URGENT';
                    priorityClass = 'priority-high';
                } else if (lowerDomain.includes('autre')) {
                    priorityLabel = 'NORMALE';
                    priorityClass = 'priority-low';
                }

                const dateDisplay = lead.date ? lead.date.split(',')[0] : 'Récent';
                const cleanPhone = (lead.phone || '').replace(/[^0-9+]/g, '');
                const safeName = encodeURIComponent(clientName);
                const waUrl = cleanPhone 
                    ? `https://wa.me/${cleanPhone}?text=Bonjour%20${safeName},%20Atelier%20Grafrika%20fait%20suite%20à%20votre%20demande...`
                    : `https://wa.me/2290197932325?text=Bonjour%20Atelier%20Grafrika...`;

                tr.innerHTML = `
                    <td>
                        <div class="elite-task-col">
                            <span class="elite-task-name">Dossier #${idx + 1 < 10 ? '0' + (idx + 1) : (idx + 1)} — ${escapeHtml(clientName)}</span>
                            <span class="elite-task-sub">${escapeHtml(domain)} • ${escapeHtml(city)}</span>
                        </div>
                    </td>
                    <td>
                        <div class="elite-status-text ${statusClass}">
                            <span>${escapeHtml(statusLabel)}</span>
                            <span class="elite-status-date-sub">${escapeHtml(dateDisplay)}</span>
                        </div>
                    </td>
                    <td>
                        <div class="elite-progress-wrap">
                            <div class="elite-progress-track">
                                <div class="elite-progress-fill ${progressClass}" style="width: ${progressVal}%;"></div>
                            </div>
                            <span class="elite-progress-val">${progressVal}%</span>
                        </div>
                    </td>
                    <td>
                        <span class="elite-priority-pill ${priorityClass}">${priorityLabel}</span>
                    </td>
                    <td>
                        <span style="font-size: 0.82rem; color: #475569; font-weight: 500;">${escapeHtml(dateDisplay)}</span>
                    </td>
                    <td>
                        <div class="elite-actions-col">
                            <a href="${escapeHtml(waUrl)}" target="_blank" rel="noopener" class="elite-action-btn btn-wa" title="WhatsApp direct">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                </svg>
                            </a>
                            ${cleanPhone ? `
                            <a href="tel:${escapeHtml(cleanPhone)}" class="elite-action-btn btn-tel" title="Appeler">
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                            </a>` : ''}
                            <button class="elite-action-btn btn-status-toggle" data-lead-id="${escapeHtml(lead.id)}" title="Changer le statut en BDD">
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="9 11 12 14 22 4"></polyline>
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                </svg>
                            </button>
                        </div>
                    </td>
                `;

                const toggleBtn = tr.querySelector('.btn-status-toggle');
                if (toggleBtn) {
                    toggleBtn.addEventListener('click', async () => {
                        let nextStatus = 'En contact';
                        if (lead.status === 'En contact') nextStatus = 'Devis validé';
                        else if (lead.status === 'Devis validé') nextStatus = 'Archivé';
                        else if (lead.status === 'Archivé') nextStatus = 'Nouveau';

                        try {
                            await apiClient.updateLeadStatus(lead.id, nextStatus);
                            lead.status = nextStatus;
                            renderDashboardOverview();
                            renderLeadsList();
                            showToast(`Statut mis à jour : ${nextStatus}`);
                        } catch (e) {
                            showToast("Erreur lors de la mise à jour du statut.", "alert");
                        }
                    });
                }

                eliteTableBody.appendChild(tr);
            });
        }
    }

    // 3. Mini grille réalisations réelles sur le dashboard (Table projects)
    const miniGrid = document.getElementById('dashProjectsMiniGrid');
    if (miniGrid) {
        miniGrid.innerHTML = '';

        if (!currentProjects || currentProjects.length === 0) {
            miniGrid.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 2.2rem 1.2rem; text-align: center; color: var(--text-secondary); background: #ffffff; border-radius: 14px; border: 1.5px dashed var(--border-subtle);">
                    <p style="font-weight: 700; color: #0f172a; margin-bottom: 0.35rem; font-size: 0.95rem;">Aucune réalisation dans la base de données</p>
                    <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 1rem;">Votre portfolio est actuellement vierge. Ajoutez vos projets pour les afficher sur le site public.</p>
                    <button type="button" class="btn-primary-pill" onclick="document.querySelector('.dash-nav-btn[data-tab=\\'projects\\']')?.click(); setTimeout(() => openProjectModal(), 100);" style="display: inline-flex; margin: 0 auto;">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Ajouter un projet</span>
                    </button>
                </div>
            `;
        } else {
            const showcaseProjects = currentProjects.slice(0, 3);
            showcaseProjects.forEach(p => {
                const tile = document.createElement('div');
                tile.className = 'mini-project-tile';
                const firstPhoto = (p.photos && p.photos[0]) ? p.photos[0] : '';
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
}

// =========================================================================
// 5. GESTION DES PROJETS (CMS PORTFOLIO)
// =========================================================================

// Utilitaires de formatage automatique des unités (m², mois)
function formatSurface(surfaceVal) {
    if (!surfaceVal) return 'Sur-mesure';
    const s = String(surfaceVal).trim();
    if (!s || s.toLowerCase() === 'sur-mesure') return 'Sur-mesure';
    if (/m²|m2|m carré/i.test(s)) return s.replace(/m2/i, 'm²');
    const num = s.replace(/[^\d.,]/g, '');
    return num ? `${num} m²` : s;
}

function formatDuration(durationVal) {
    if (!durationVal) return 'Étude personnalisée';
    const d = String(durationVal).trim();
    if (!d || d.toLowerCase() === 'non spécifié' || d.toLowerCase() === 'durée') return 'Étude personnalisée';
    if (/mois|an|ans|semaine|semaines|jour|jours/i.test(d)) return d;
    const num = d.replace(/[^\d.,]/g, '');
    return num ? `${num} mois` : d;
}

function renderProjectsList() {
    const container = document.getElementById('projectsAdminGrid');
    if (!container) return;

    const searchVal = (document.getElementById('projectSearchInput')?.value || '').toLowerCase();
    const catVal = document.getElementById('projectCategoryFilter')?.value || 'all';

    const filtered = currentProjects.filter(p => {
        const matchesSearch = (p.title || '').toLowerCase().includes(searchVal) || (p.location || '').toLowerCase().includes(searchVal);
        const matchesCat = (catVal === 'all') || (p.category === catVal);
        return matchesSearch && matchesCat;
    });

    container.innerHTML = '';

    if (filtered.length === 0) {
        if (currentProjects.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.5rem; background: #ffffff; border-radius: 20px; border: 1.5px dashed var(--border-subtle); color: var(--text-secondary);">
                    <p style="font-weight: 700; font-size: 1.05rem; margin-bottom: 0.4rem; color: var(--navy);">Aucune réalisation publiée pour le moment</p>
                    <p style="font-size: 0.85rem; color: var(--text-subtle); margin-bottom: 1.2rem;">Votre portfolio est vierge. Cliquez sur le bouton ci-dessous pour ajouter votre premier projet d'architecture.</p>
                    <button type="button" class="btn-primary-pill" onclick="document.getElementById('btnAddNewProject')?.click()" style="display: inline-flex; margin: 0 auto;">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        <span>Ajouter mon premier projet</span>
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: #ffffff; border-radius: 20px; border: 1.5px dashed var(--border-subtle); color: var(--text-secondary);">
                    <p style="font-weight: 700; margin-bottom: 0.4rem;">Aucun projet correspondant</p>
                    <p style="font-size: 0.82rem; color: var(--text-subtle);">Modifiez vos filtres ou ajoutez une nouvelle réalisation.</p>
                </div>
            `;
        }
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
                    ${photoCount} photo${photoCount > 1 ? 's' : ''}
                </span>
            </div>
            <div class="proj-card-body">
                <h3 class="proj-card-title">${escapeHtml(proj.title)}</h3>
                <span class="proj-card-loc">${escapeHtml(proj.location)}</span>
                <div class="proj-card-meta-row">
                    <span>${escapeHtml(formatSurface(proj.surface))}</span>
                    <span>•</span>
                    <span>${escapeHtml(formatDuration(proj.duration))}</span>
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
            const id = btn.dataset.id;
            const proj = currentProjects.find(p => String(p.id) === String(id));
            if (proj) openProjectModal(proj);
        });
    });

    container.querySelectorAll('.btn-delete-proj').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            await deleteProject(id);
        });
    });
}

document.getElementById('projectSearchInput')?.addEventListener('input', renderProjectsList);
document.getElementById('projectCategoryFilter')?.addEventListener('change', renderProjectsList);

// =========================================================================
// 6. MODAL DE PROJET & GESTION DES PHOTOS
// =========================================================================
// CONSTANTES & UTILITAIRES MULTIMÉDIA (FORMAT PANORAMIQUE & MAXI 8 PHOTOS)
// =========================================================================
const MAX_PROJECT_PHOTOS = 8;
const YOUTUBE_ASPECT_RATIO = 16 / 9;

// Cache en mémoire du filigrane importé par l'utilisateur
let cachedUserWatermarkImg = null;
let cachedUserWatermarkSrc = '';

async function getUserWatermarkImage() {
    const wmUrl = currentSettings?.watermarkUrl;
    const isEnabled = currentSettings?.autoWatermark !== false;
    if (!isEnabled || !wmUrl) return null;

    if (cachedUserWatermarkImg && cachedUserWatermarkSrc === wmUrl) {
        return cachedUserWatermarkImg;
    }

    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            cachedUserWatermarkImg = img;
            cachedUserWatermarkSrc = wmUrl;
            resolve(img);
        };
        img.onerror = () => resolve(null);
        img.src = wmUrl;
    });
}

/**
 * Applique fidèlement le filigrane officiel importé par l'utilisateur.
 * Si aucun filigrane n'a été téléversé, aucune modification n'est appliquée.
 */
async function applyUserWatermark(ctx, targetWidth, targetHeight) {
    const wmImg = await getUserWatermarkImage();
    if (!wmImg || !wmImg.width || !wmImg.height) return;

    ctx.save();
    const wmAspect = wmImg.width / wmImg.height;

    // Si le filigrane est au ratio panoramique 16:9 (overlay complet transparent)
    if (Math.abs(wmAspect - YOUTUBE_ASPECT_RATIO) < 0.25 || (wmImg.width >= 1000 && wmImg.height >= 500)) {
        ctx.drawImage(wmImg, 0, 0, targetWidth, targetHeight);
    } else {
        // Si c'est un badge, signature ou logo isolé, on le positionne centré au bas
        const wmWidth = Math.min(Math.round(targetWidth * 0.22), Math.max(120, wmImg.width));
        const wmHeight = Math.round(wmWidth / wmAspect);
        const posX = Math.round((targetWidth - wmWidth) / 2);
        const posY = targetHeight - wmHeight - Math.round(targetHeight * 0.04);
        ctx.drawImage(wmImg, posX, posY, wmWidth, wmHeight);
    }
    ctx.restore();
}

/**
 * Recadre, optimise et signe automatiquement une image au format 16:9
 * avec centrage cover intelligent, filigrane utilisateur et compression propre.
 */
async function processImageToYouTubeFormat(fileOrBlobOrUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = async () => {
            try {
                // Dimensions cibles au format panoramique (max 1600x900)
                const targetWidth = Math.min(1600, Math.max(960, img.naturalWidth || 1280));
                const targetHeight = Math.round(targetWidth / YOUTUBE_ASPECT_RATIO);

                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');

                // Calcul du centrage cover pour remplir le 16:9
                const imgAspect = img.naturalWidth / img.naturalHeight;
                let sx = 0, sy = 0, sWidth = img.naturalWidth, sHeight = img.naturalHeight;

                if (imgAspect > YOUTUBE_ASPECT_RATIO) {
                    sHeight = img.naturalHeight;
                    sWidth = sHeight * YOUTUBE_ASPECT_RATIO;
                    sx = (img.naturalWidth - sWidth) / 2;
                    sy = 0;
                } else {
                    sWidth = img.naturalWidth;
                    sHeight = sWidth / YOUTUBE_ASPECT_RATIO;
                    sx = 0;
                    sy = (img.naturalHeight - sHeight) / 2;
                }

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

                // Application du filigrane importé par l'utilisateur (si présent)
                try {
                    await applyUserWatermark(ctx, targetWidth, targetHeight);
                } catch (wmErr) {
                    console.warn("Filigrane utilisateur omis pour cette image:", wmErr);
                }

                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                resolve(dataUrl);
            } catch (err) {
                if (typeof fileOrBlobOrUrl === 'string') resolve(fileOrBlobOrUrl);
                else reject(err);
            }
        };

        img.onerror = () => reject(new Error("Impossible de décoder l'image."));

        if (typeof fileOrBlobOrUrl === 'string') {
            img.src = fileOrBlobOrUrl;
        } else {
            const reader = new FileReader();
            reader.onload = (e) => { img.src = e.target.result; };
            reader.onerror = reject;
            reader.readAsDataURL(fileOrBlobOrUrl);
        }
    });
}

/**
 * Extraction universelle d'archive ZIP dans le navigateur (API native DecompressionStream)
 * Filtre les images, les classe dans l'ordre alphabétique/numérique naturel (01, 02...)
 * et les formate au ratio 16:9 YouTube (maxi 8 photos).
 */
async function extractImagesFromZip(zipFile) {
    const arrayBuffer = await zipFile.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const view = new DataView(arrayBuffer);
    const entries = [];

    let eocdOffset = -1;
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
        if (view.getUint32(i, true) === 0x06054b50) {
            eocdOffset = i;
            break;
        }
    }

    if (eocdOffset !== -1) {
        const totalEntries = view.getUint16(eocdOffset + 10, true);
        const cdOffset = view.getUint32(eocdOffset + 16, true);
        let pos = cdOffset;

        for (let i = 0; i < totalEntries && pos + 46 <= eocdOffset; i++) {
            if (view.getUint32(pos, true) !== 0x02014b50) break;
            const compression = view.getUint16(pos + 10, true);
            const compSize = view.getUint32(pos + 20, true);
            const uncompSize = view.getUint32(pos + 24, true);
            const nameLen = view.getUint16(pos + 28, true);
            const extraLen = view.getUint16(pos + 30, true);
            const commentLen = view.getUint16(pos + 32, true);
            const localOffset = view.getUint32(pos + 42, true);

            const nameBytes = bytes.subarray(pos + 46, pos + 46 + nameLen);
            const name = new TextDecoder('utf-8').decode(nameBytes);

            if (localOffset + 30 <= bytes.length && view.getUint32(localOffset, true) === 0x04034b50) {
                const localNameLen = view.getUint16(localOffset + 26, true);
                const localExtraLen = view.getUint16(localOffset + 28, true);
                const dataStart = localOffset + 30 + localNameLen + localExtraLen;
                const compressedData = bytes.subarray(dataStart, dataStart + compSize);
                entries.push({ name, compression, compSize, uncompSize, compressedData });
            }

            pos += 46 + nameLen + extraLen + commentLen;
        }
    } else {
        let pos = 0;
        while (pos + 30 <= bytes.length) {
            if (view.getUint32(pos, true) !== 0x04034b50) break;
            const compression = view.getUint16(pos + 8, true);
            const compSize = view.getUint32(pos + 18, true);
            const uncompSize = view.getUint32(pos + 22, true);
            const nameLen = view.getUint16(pos + 26, true);
            const extraLen = view.getUint16(pos + 28, true);
            const nameBytes = bytes.subarray(pos + 30, pos + 30 + nameLen);
            const name = new TextDecoder('utf-8').decode(nameBytes);
            const dataStart = pos + 30 + nameLen + extraLen;
            const compressedData = bytes.subarray(dataStart, dataStart + compSize);

            entries.push({ name, compression, compSize, uncompSize, compressedData });
            pos = dataStart + compSize;
        }
    }

    const isImageFile = (n) => {
        if (!n || n.endsWith('/') || n.includes('__MACOSX') || n.startsWith('.') || n.includes('/.')) return false;
        return /\.(jpe?g|png|webp|avif)$/i.test(n);
    };

    const imageEntries = entries.filter(e => isImageFile(e.name));
    if (imageEntries.length === 0) {
        throw new Error("Aucune image valide (JPG, PNG, WEBP) trouvée dans l'archive ZIP.");
    }

    // CLASSEMENT NATUREL DANS L'ORDRE (01, 02, 03... 08)
    imageEntries.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    const toProcess = imageEntries.slice(0, MAX_PROJECT_PHOTOS);
    const processedPhotos = [];

    for (const entry of toProcess) {
        let uncompressedBytes;
        if (entry.compression === 0) {
            uncompressedBytes = entry.compressedData;
        } else if (entry.compression === 8) {
            const stream = new Response(new Blob([entry.compressedData]).stream().pipeThrough(new DecompressionStream('deflate-raw')));
            const buf = await stream.arrayBuffer();
            uncompressedBytes = new Uint8Array(buf);
        }

        if (uncompressedBytes) {
            let mime = 'image/jpeg';
            if (/\.png$/i.test(entry.name)) mime = 'image/png';
            else if (/\.webp$/i.test(entry.name)) mime = 'image/webp';
            else if (/\.avif$/i.test(entry.name)) mime = 'image/avif';

            const blob = new Blob([uncompressedBytes], { type: mime });
            const youTube169Url = await processImageToYouTubeFormat(blob);
            processedPhotos.push(youTube169Url);
        }
    }

    return {
        photos: processedPhotos,
        totalFound: imageEntries.length,
        wasTruncated: imageEntries.length > MAX_PROJECT_PHOTOS
    };
}

// =========================================================================
// 6. MODAL PROJET & GESTION DES PHOTOS
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
    const projZipFileInput = document.getElementById('projZipFileInput');
    const projPhotosDropzone = document.getElementById('projPhotosDropzone');

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
        btnAddPhotoUrl.addEventListener('click', async () => {
            const url = projPhotoUrlInput.value.trim();
            if (!url) return;

            if (currentEditingPhotos.length >= MAX_PROJECT_PHOTOS) {
                showToast(`Limite atteinte : maximum ${MAX_PROJECT_PHOTOS} photos par projet.`, 'alert');
                return;
            }

            try {
                showToast("Optimisation de l'image...", "info");
                const processed = await processImageToYouTubeFormat(url);
                currentEditingPhotos.push(processed);
            } catch {
                currentEditingPhotos.push(url);
            }
            projPhotoUrlInput.value = '';
            renderEditingPhotosThumbnails();
        });
    }

    // Gestionnaire d'extraction de fichier ZIP
    async function handleZipUpload(zipFile) {
        try {
            showToast("Importation et classement des photos de l'archive ZIP...", "info");
            const result = await extractImagesFromZip(zipFile);

            currentEditingPhotos = result.photos;
            renderEditingPhotosThumbnails();

            if (result.wasTruncated) {
                showToast(`Archive importée : les 8 premières photos ordonnées ont été ajoutées.`, 'info');
            } else {
                showToast(`Succès : ${result.photos.length} photo${result.photos.length > 1 ? 's' : ''} extraites et classées dans l'ordre !`);
            }
        } catch (err) {
            console.error("Erreur extraction ZIP:", err);
            showToast(err.message || "Erreur lors de l'extraction de l'archive ZIP.", "alert");
        }
    }

    // Gestionnaire d'upload d'images standard
    async function handleImageFiles(files) {
        if (!files || files.length === 0) return;

        const fileList = Array.from(files);
        fileList.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

        const remainingSlots = MAX_PROJECT_PHOTOS - currentEditingPhotos.length;
        if (remainingSlots <= 0) {
            showToast(`Limite atteinte : maximum ${MAX_PROJECT_PHOTOS} photos par projet.`, 'alert');
            return;
        }

        const filesToProcess = fileList.slice(0, remainingSlots);
        if (fileList.length > remainingSlots) {
            showToast(`Note : seules les ${remainingSlots} premières photos ont été ajoutées pour respecter la limite de ${MAX_PROJECT_PHOTOS}.`, 'info');
        }

        showToast("Traitement des photos...", "info");
        for (const file of filesToProcess) {
            try {
                const formatted = await processImageToYouTubeFormat(file);
                currentEditingPhotos.push(formatted);
            } catch (err) {
                console.warn("Échec traitement image:", err);
            }
        }
        renderEditingPhotosThumbnails();
    }

    if (projZipFileInput) {
        projZipFileInput.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (file) {
                await handleZipUpload(file);
            }
            projZipFileInput.value = '';
        });
    }

    if (projPhotosFileInput) {
        projPhotosFileInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            const zip = files.find(f => f.name.endsWith('.zip') || f.type.includes('zip'));
            if (zip) {
                await handleZipUpload(zip);
            } else {
                await handleImageFiles(files);
            }
            projPhotosFileInput.value = '';
        });
    }

    if (projPhotosDropzone) {
        projPhotosDropzone.addEventListener('click', () => {
            projPhotosFileInput?.click();
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            projPhotosDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                projPhotosDropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            projPhotosDropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                projPhotosDropzone.classList.remove('dragover');
            });
        });

        projPhotosDropzone.addEventListener('drop', async (e) => {
            const files = Array.from(e.dataTransfer?.files || []);
            const zip = files.find(f => f.name.endsWith('.zip') || f.type.includes('zip'));
            if (zip) {
                await handleZipUpload(zip);
            } else if (files.length > 0) {
                await handleImageFiles(files);
            }
        });
    }

    if (projectForm) {
        projectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const idInput = document.getElementById('projId').value;
            const title = document.getElementById('projTitle').value.trim();
            const category = document.getElementById('projCategory').value;
            const location = document.getElementById('projLocation').value.trim();
            const rawSurface = document.getElementById('projSurface').value.trim();
            const rawDuration = document.getElementById('projDuration').value.trim();
            const description = document.getElementById('projDescription').value.trim();

            if (currentEditingPhotos.length === 0) {
                showToast("Veuillez ajouter au moins une photo pour cette réalisation.", 'alert');
                return;
            }

            if (currentEditingPhotos.length > MAX_PROJECT_PHOTOS) {
                currentEditingPhotos = currentEditingPhotos.slice(0, MAX_PROJECT_PHOTOS);
            }

            // Gestion automatique des unités (m², mois)
            let surface = 'Sur-mesure';
            if (rawSurface) {
                const sNum = rawSurface.replace(/[^\d.,]/g, '');
                surface = sNum ? `${sNum} m²` : rawSurface;
            }

            let duration = 'Étude personnalisée';
            if (rawDuration) {
                const dNum = rawDuration.replace(/[^\d.,]/g, '');
                duration = dNum ? `${dNum} mois` : rawDuration;
            }

            const projectData = {
                title,
                category,
                location: location || "Cotonou",
                surface,
                duration,
                description,
                photos: [...currentEditingPhotos]
            };

            const submitBtn = projectForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span>Enregistrement...</span>`;
            }

            try {
                if (idInput) {
                    await apiClient.updateProject(idInput, projectData);
                    showToast("Projet mis à jour avec succès !");
                } else {
                    await apiClient.createProject(projectData);
                    showToast("Nouveau projet publié avec succès !");
                }

                currentProjects = await apiClient.getProjects();
                closeProjectModal();
                renderProjectsList();
                renderDashboardOverview();
            } catch (err) {
                console.error("Erreur enregistrement projet:", err);
                showToast(err.message || "Erreur lors de l'enregistrement du projet.", "alert");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            }
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

        // Typologie / Catégorie avec fallback custom
        const catSelect = document.getElementById('projCategory');
        if (catSelect && project.category) {
            let matched = false;
            for (let opt of catSelect.options) {
                if (opt.value.toLowerCase() === project.category.toLowerCase()) {
                    catSelect.value = opt.value;
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                const customOpt = new Option(project.category, project.category, true, true);
                catSelect.add(customOpt);
                catSelect.value = project.category;
            }
        }

        // Sélection de la ville béninoise dans le select
        const locSelect = document.getElementById('projLocation');
        if (locSelect) {
            let matched = false;
            const targetLoc = (project.location || '').trim();
            for (let opt of locSelect.options) {
                if (opt.value.toLowerCase() === targetLoc.toLowerCase()) {
                    locSelect.value = opt.value;
                    matched = true;
                    break;
                }
            }
            if (!matched && targetLoc) {
                const customOpt = new Option(targetLoc, targetLoc, true, true);
                locSelect.add(customOpt);
                locSelect.value = targetLoc;
            }
        }

        // Unité automatique : on extrait uniquement le nombre
        const surfVal = (project.surface || '').replace(/[^\d.,]/g, '');
        document.getElementById('projSurface').value = surfVal;

        const durVal = (project.duration || '').replace(/[^\d.,]/g, '');
        document.getElementById('projDuration').value = durVal;

        document.getElementById('projDescription').value = project.description || '';

        currentEditingPhotos = [...(project.photos || [])];
    } else {
        modalAction.textContent = "Nouveau projet";
        modalTitle.textContent = "Ajouter une réalisation";
        btnSaveText.textContent = "Publier le projet";

        document.getElementById('projectForm').reset();
        document.getElementById('projId').value = '';
        const catSelect = document.getElementById('projCategory');
        if (catSelect) catSelect.value = 'Villa Duplex (R+1)';
        const locSelect = document.getElementById('projLocation');
        if (locSelect) locSelect.value = 'Cotonou';
        document.getElementById('projSurface').value = '';
        document.getElementById('projDuration').value = '';
        currentEditingPhotos = [];
    }

    const wmNotice = document.getElementById('projWatermarkNotice');
    if (wmNotice) {
        if (currentSettings.watermarkUrl && currentSettings.autoWatermark !== false) {
            wmNotice.style.display = 'flex';
            wmNotice.innerHTML = `
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>Filigrane actif : chaque photo ajoutée recevra votre filigrane officiel</span>
            `;
        } else {
            wmNotice.style.display = 'none';
        }
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
    const countText = document.getElementById('projPhotoCountText');
    const countHint = document.getElementById('projPhotoCountHint');

    if (countText) {
        countText.textContent = `${currentEditingPhotos.length} / ${MAX_PROJECT_PHOTOS}`;
    }

    if (countHint) {
        if (currentEditingPhotos.length === 0) {
            countHint.textContent = "La première photo servira de couverture";
        } else {
            countHint.textContent = `Première photo = Couverture • ${currentEditingPhotos.length} photo${currentEditingPhotos.length > 1 ? 's' : ''}`;
        }
    }

    if (!container) return;
    container.innerHTML = '';

    currentEditingPhotos.forEach((photoUrl, idx) => {
        const item = document.createElement('div');
        item.className = `admin-thumb-item ${idx === 0 ? 'is-cover' : ''}`;
        item.title = idx === 0 ? "Photo #01 : Couverture principale" : `Photo #${idx + 1} (Cliquer pour définir en couverture)`;

        item.innerHTML = `
            <img src="${photoUrl}" alt="Photo ${idx + 1}">
            <span class="thumb-order-badge">#0${idx + 1}</span>
            ${idx === 0 ? '<span class="thumb-cover-tag">Couverture</span>' : ''}
            <div class="thumb-controls">
                ${idx > 0 ? `
                <button type="button" class="thumb-move-btn" data-move-left="${idx}" title="Déplacer vers la gauche">
                    ◀
                </button>` : ''}
                ${idx < currentEditingPhotos.length - 1 ? `
                <button type="button" class="thumb-move-btn" data-move-right="${idx}" title="Déplacer vers la droite">
                    ▶
                </button>` : ''}
                <button type="button" class="admin-thumb-del" data-idx="${idx}" title="Supprimer la photo">
                    ✕
                </button>
            </div>
        `;

        item.addEventListener('click', (e) => {
            if (e.target.closest('.thumb-controls')) return;
            if (idx !== 0) {
                const clicked = currentEditingPhotos.splice(idx, 1)[0];
                currentEditingPhotos.unshift(clicked);
                renderEditingPhotosThumbnails();
                showToast(`La photo #${idx + 1} est maintenant la couverture principale.`);
            }
        });

        container.appendChild(item);
    });

    // Écouteurs de réorganisation d'ordre
    container.querySelectorAll('[data-move-left]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const i = parseInt(btn.dataset.moveLeft, 10);
            if (i > 0) {
                const temp = currentEditingPhotos[i];
                currentEditingPhotos[i] = currentEditingPhotos[i - 1];
                currentEditingPhotos[i - 1] = temp;
                renderEditingPhotosThumbnails();
            }
        });
    });

    container.querySelectorAll('[data-move-right]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const i = parseInt(btn.dataset.moveRight, 10);
            if (i < currentEditingPhotos.length - 1) {
                const temp = currentEditingPhotos[i];
                currentEditingPhotos[i] = currentEditingPhotos[i + 1];
                currentEditingPhotos[i + 1] = temp;
                renderEditingPhotosThumbnails();
            }
        });
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

async function deleteProject(id) {
    if (confirm("Êtes-vous certain de vouloir supprimer cette réalisation du portfolio ?")) {
        try {
            await apiClient.deleteProject(id);
            currentProjects = await apiClient.getProjects();
            renderProjectsList();
            renderDashboardOverview();
            showToast("Projet supprimé du portfolio.");
        } catch (err) {
            console.error("Erreur suppression projet:", err);
            showToast(err.message || "Erreur lors de la suppression.", "alert");
        }
    }
}

// =========================================================================
// 7. GESTION DES LEADS (CRM)
// =========================================================================
function setupLeadFilters() {
    const searchInput = document.getElementById('leadSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            leadSearchQuery = e.target.value.toLowerCase().trim();
            renderLeadsList();
        });
    }

    document.querySelectorAll('[data-lead-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-lead-filter]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeLeadFilter = btn.dataset.leadFilter;
            renderLeadsList();
        });
    });

    document.getElementById('btnExportLeadsCsv')?.addEventListener('click', () => {
        if (currentLeads.length === 0) {
            showToast("Aucun lead à exporter.", 'alert');
            return;
        }

        function sanitizeCsvField(str) {
            let clean = (str || '').toString().replace(/"/g, '""');
            if (/^[=+\-@\t\r]/.test(clean)) {
                clean = "'" + clean;
            }
            return `"${clean}"`;
        }

        let csvContent = "\uFEFFDate;Nom;Telephone;Prestation;Ville;Message;Statut\n";
        currentLeads.forEach(l => {
            const row = [
                sanitizeCsvField(formatDate(l.date)),
                sanitizeCsvField(l.name),
                sanitizeCsvField(l.phone),
                sanitizeCsvField(l.domain),
                sanitizeCsvField(l.city),
                sanitizeCsvField(l.message),
                sanitizeCsvField(l.status || 'Nouveau')
            ];
            csvContent += row.join(';') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `leads_atelier_grafrika_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        showToast("Fichier CSV téléchargé.");
    });
}

function renderLeadsList() {
    const tbody = document.getElementById('leadsTableBody');
    if (!tbody) return;

    const filtered = currentLeads.filter(l => {
        // Filtre par onglet
        const matchesTab = (activeLeadFilter === 'all') || (l.status === activeLeadFilter);

        // Filtre par recherche texte
        const nameMatch = (l.name || '').toLowerCase().includes(leadSearchQuery);
        const cityMatch = (l.city || '').toLowerCase().includes(leadSearchQuery);
        const phoneMatch = (l.phone || '').toLowerCase().includes(leadSearchQuery);
        const domainMatch = (l.domain || '').toLowerCase().includes(leadSearchQuery);
        const matchesSearch = !leadSearchQuery || (nameMatch || cityMatch || phoneMatch || domainMatch);

        return matchesTab && matchesSearch;
    });

    // Compteurs de statut
    const countAll = document.getElementById('countLeadsAll');
    const countNew = document.getElementById('countLeadsNew');
    const countContact = document.getElementById('countLeadsContact');
    const countDone = document.getElementById('countLeadsDone');
    const countArchived = document.getElementById('countLeadsArchived');

    if (countAll) countAll.textContent = currentLeads.length;
    if (countNew) countNew.textContent = currentLeads.filter(l => l.status === 'Nouveau').length;
    if (countContact) countContact.textContent = currentLeads.filter(l => l.status === 'En contact').length;
    if (countDone) countDone.textContent = currentLeads.filter(l => l.status === 'Devis validé').length;
    if (countArchived) countArchived.textContent = currentLeads.filter(l => l.status === 'Archivé').length;

    tbody.innerHTML = '';

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-subtle);">
                    Aucune demande de devis correspondante.
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(lead => {
        const tr = document.createElement('tr');
        const cleanPhone = (lead.phone || '').replace(/[^0-9+]/g, '');
        const waMsg = encodeURIComponent(`Bonjour ${lead.name || 'Client'} ! Atelier Grafrika fait suite à votre demande de devis.`);
        const waUrl = `https://wa.me/${cleanPhone}?text=${waMsg}`;

        tr.innerHTML = `
            <td style="font-size: 0.78rem; color: var(--text-subtle);">${formatDate(lead.date)}</td>
            <td>
                <strong>${escapeHtml(lead.name)}</strong>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">${escapeHtml(lead.phone)}${lead.email ? ` • <a href="mailto:${escapeHtml(lead.email)}" style="color: var(--brand-blue); text-decoration: underline;">${escapeHtml(lead.email)}</a>` : ''}</div>
            </td>
            <td><strong>${escapeHtml(lead.domain || 'Sur-mesure')}</strong></td>
            <td>${escapeHtml(lead.city || 'Bénin')}</td>
            <td>
                <select class="status-select-pill" data-id="${escapeHtml(lead.id)}">
                    <option value="Nouveau" ${lead.status === 'Nouveau' ? 'selected' : ''}>Nouveau</option>
                    <option value="En contact" ${lead.status === 'En contact' ? 'selected' : ''}>En cours</option>
                    <option value="Devis validé" ${lead.status === 'Devis validé' ? 'selected' : ''}>Validé</option>
                    <option value="Archivé" ${lead.status === 'Archivé' ? 'selected' : ''}>Archivé</option>
                </select>
            </td>
            <td style="text-align: right;">
                <a href="${escapeHtml(waUrl)}" target="_blank" rel="noopener" class="btn-wa-round" style="display: inline-flex;" title="Ouvrir WhatsApp">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                </a>
            </td>
        `;

        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.status-select-pill').forEach(sel => {
        sel.addEventListener('change', async (e) => {
            const leadId = e.target.dataset.id;
            const newStatus = e.target.value;
            await updateLeadStatus(leadId, newStatus);
        });
    });
}

async function updateLeadStatus(id, newStatus) {
    try {
        await apiClient.updateLeadStatus(id, newStatus);
        const lead = currentLeads.find(l => String(l.id) === String(id));
        if (lead) lead.status = newStatus;
        renderLeadsList();
        renderDashboardOverview();
        showToast(`Statut mis à jour : ${newStatus}`);
    } catch (err) {
        console.error("Erreur mise à jour prospect:", err);
        showToast(err.message || "Erreur mise à jour statut", "alert");
    }
}

// =========================================================================
// 8. COORDONNÉES & RÉGLAGES
// =========================================================================
function loadSettingsForm() {
    const authUser = JSON.parse(localStorage.getItem('GRAFRIKA_AUTH_USER') || sessionStorage.getItem('GRAFRIKA_AUTH_USER') || '{"email":"admin@ateliergrafrika.com"}');

    const topProfileEmail = document.getElementById('topProfileEmail');
    if (topProfileEmail && authUser.email) topProfileEmail.textContent = authUser.email;

    if (document.getElementById('setWhatsapp')) document.getElementById('setWhatsapp').value = currentSettings.whatsapp || '';
    if (document.getElementById('setPhone')) document.getElementById('setPhone').value = currentSettings.phone || '';
    if (document.getElementById('setEmail')) document.getElementById('setEmail').value = currentSettings.email || '';
    if (document.getElementById('setLocation')) document.getElementById('setLocation').value = currentSettings.location || '';
    if (document.getElementById('setInstagram')) document.getElementById('setInstagram').value = currentSettings.instagram || '';
    if (document.getElementById('setTiktok')) document.getElementById('setTiktok').value = currentSettings.tiktok || '';
    if (document.getElementById('setFacebook')) document.getElementById('setFacebook').value = currentSettings.facebook || '';
    if (document.getElementById('setLinkedin')) document.getElementById('setLinkedin').value = currentSettings.linkedin || '';
    if (document.getElementById('setX')) document.getElementById('setX').value = currentSettings.x || '';

    if (document.getElementById('setAdminEmail')) document.getElementById('setAdminEmail').value = authUser.email || '';

    // Filigrane des photos importé par l'utilisateur
    const previewImg = document.getElementById('watermarkPreviewImg');
    const emptyNotice = document.getElementById('watermarkEmptyNotice');
    const btnClear = document.getElementById('btnClearWatermark');

    if (currentSettings.watermarkUrl) {
        if (previewImg) {
            previewImg.src = currentSettings.watermarkUrl;
            previewImg.style.display = 'block';
        }
        if (emptyNotice) emptyNotice.style.display = 'none';
        if (btnClear) btnClear.style.display = 'inline-flex';
    } else {
        if (previewImg) {
            previewImg.src = '';
            previewImg.style.display = 'none';
        }
        if (emptyNotice) emptyNotice.style.display = 'block';
        if (btnClear) btnClear.style.display = 'none';
    }

    const checkAuto = document.getElementById('checkAutoWatermark');
    if (checkAuto) {
        checkAuto.checked = currentSettings.autoWatermark !== false;
    }
}

function setupSettingsForms() {
    const contactForm = document.getElementById('settingsContactForm');
    const securityForm = document.getElementById('settingsSecurityForm');

    // Gestion de l'import du filigrane officiel par l'utilisateur
    const watermarkInput = document.getElementById('watermarkFileInput');
    if (watermarkInput) {
        watermarkInput.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            showToast("Importation et enregistrement de votre filigrane...", "info");
            const reader = new FileReader();
            reader.onload = async (ev) => {
                try {
                    const dataUrl = ev.target.result;
                    currentSettings.watermarkUrl = dataUrl;
                    cachedUserWatermarkImg = null;
                    cachedUserWatermarkSrc = '';

                    const preview = document.getElementById('watermarkPreviewImg');
                    if (preview) {
                        preview.src = dataUrl;
                        preview.style.display = 'block';
                    }
                    const emptyNotice = document.getElementById('watermarkEmptyNotice');
                    if (emptyNotice) emptyNotice.style.display = 'none';
                    const btnClear = document.getElementById('btnClearWatermark');
                    if (btnClear) btnClear.style.display = 'inline-flex';

                    await apiClient.saveSettings(currentSettings);
                    const notice = document.getElementById('projWatermarkNotice');
                    if (notice) notice.style.display = 'flex';
                    showToast("Votre filigrane a été enregistré ! Il signera vos prochaines photos.");
                } catch (err) {
                    console.error("Erreur enregistrement filigrane:", err);
                    showToast("Impossible d'enregistrer le filigrane.", "alert");
                }
            };
            reader.readAsDataURL(file);
        });
    }

    const checkAuto = document.getElementById('checkAutoWatermark');
    if (checkAuto) {
        checkAuto.addEventListener('change', async () => {
            currentSettings.autoWatermark = checkAuto.checked;
            await apiClient.saveSettings(currentSettings);
            const notice = document.getElementById('projWatermarkNotice');
            if (notice) {
                notice.style.display = (currentSettings.watermarkUrl && checkAuto.checked) ? 'flex' : 'none';
            }
            showToast(checkAuto.checked ? "Signature automatique activée." : "Signature automatique désactivée.");
        });
    }

    const btnClearWatermark = document.getElementById('btnClearWatermark');
    if (btnClearWatermark) {
        btnClearWatermark.addEventListener('click', async () => {
            currentSettings.watermarkUrl = '';
            cachedUserWatermarkImg = null;
            cachedUserWatermarkSrc = '';
            const preview = document.getElementById('watermarkPreviewImg');
            if (preview) {
                preview.src = '';
                preview.style.display = 'none';
            }
            const emptyNotice = document.getElementById('watermarkEmptyNotice');
            if (emptyNotice) emptyNotice.style.display = 'block';
            btnClearWatermark.style.display = 'none';

            await apiClient.saveSettings(currentSettings);
            const notice = document.getElementById('projWatermarkNotice');
            if (notice) notice.style.display = 'none';
            showToast("Filigrane retiré. Les photos seront importées sans filigrane.");
        });
    }



    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const updated = {
                ...currentSettings,
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

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const orig = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span>Sauvegarde en cours...</span>`;
            }

            try {
                await apiClient.saveSettings(updated);
                currentSettings = updated;
                showToast("Coordonnées de l'Atelier sauvegardées avec succès !");
            } catch (err) {
                console.error("Erreur enregistrement réglages:", err);
                showToast(err.message || "Erreur de sauvegarde.", "alert");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = orig;
                }
            }
        });
    }

    if (securityForm) {
        securityForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('setAdminEmail').value.trim();
            const newPass = document.getElementById('setAdminNewPass').value.trim();
            const confirmPass = document.getElementById('setAdminConfirmPass').value.trim();

            if (newPass && newPass !== confirmPass) {
                showToast("Les deux mots de passe ne correspondent pas.", 'alert');
                return;
            }

            const submitBtn = securityForm.querySelector('button[type="submit"]');
            const orig = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span>Mise à jour...</span>`;
            }

            try {
                await apiClient.updateCredentials(email, newPass || undefined);
                const topProfileEmail = document.getElementById('topProfileEmail');
                if (topProfileEmail) topProfileEmail.textContent = email;

                document.getElementById('setAdminNewPass').value = '';
                document.getElementById('setAdminConfirmPass').value = '';
                showToast("Identifiants de sécurité mis à jour !");
            } catch (err) {
                console.error("Erreur mise à jour identifiants:", err);
                showToast(err.message || "Erreur mise à jour de sécurité.", "alert");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = orig;
                }
            }
        });
    }
}

// =========================================================================
// 9. UTILITAIRES
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
