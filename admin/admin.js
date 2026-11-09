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
            if (passwordInput) passwordInput.value = 'grafrika2026';
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
// 4. RENDU DU DASHBOARD
// =========================================================================
function renderDashboardOverview() {
    const statViews = document.getElementById('statViews');
    const statWhatsapp = document.getElementById('statWhatsapp');
    const statLeads = document.getElementById('statLeads');
    const statProjects = document.getElementById('statProjects');

    if (statViews) statViews.textContent = currentStats.views || 248;
    if (statWhatsapp) statWhatsapp.textContent = currentStats.whatsapp || 39;
    if (statLeads) statLeads.textContent = currentLeads.length;
    if (statProjects) statProjects.textContent = currentProjects.length;

    const badgeProjectCount = document.getElementById('badgeProjectCount');
    const badgeLeadsCount = document.getElementById('badgeLeadsCount');

    if (badgeProjectCount) badgeProjectCount.textContent = currentProjects.length;
    if (badgeLeadsCount) badgeLeadsCount.textContent = currentLeads.filter(l => l.status === 'Nouveau').length;

    // Récents leads
    const recentLeadsContainer = document.getElementById('dashRecentLeadsList');
    if (recentLeadsContainer) {
        recentLeadsContainer.innerHTML = '';
        const recentLeads = [...currentLeads].slice(0, 4);

        recentLeads.forEach(lead => {
            const item = document.createElement('div');
            item.className = 'lead-row-card';
            const cleanPhone = (lead.phone || '').replace(/\s+/g, '');
            const waUrl = `https://wa.me/${cleanPhone}?text=Bonjour%20${encodeURIComponent(lead.name)},%20Atelier%20Grafrika%20fait%20suite%20à%20votre%20demande...`;

            const names = (lead.name || 'Client').trim().split(' ');
            const initials = (names[0][0] + (names[1] ? names[1][0] : '')).toUpperCase();

            let statusClass = 'orange';
            let statusText = 'En cours';
            if (lead.status === 'Devis validé' || lead.status === 'Completed') {
                statusClass = 'green';
                statusText = 'Validé';
            } else if (lead.status === 'Nouveau' || lead.status === 'In pending') {
                statusClass = 'red';
                statusText = 'Nouveau';
            } else if (lead.status === 'Archivé') {
                statusClass = 'gray';
                statusText = 'Archivé';
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

    // Mini grille réalisations sur dashboard
    const miniGrid = document.getElementById('dashProjectsMiniGrid');
    if (miniGrid) {
        miniGrid.innerHTML = '';
        const showcaseProjects = currentProjects.slice(0, 3);
        showcaseProjects.forEach(p => {
            const tile = document.createElement('div');
            tile.className = 'mini-project-tile';
            const firstPhoto = (p.photos && p.photos[0]) ? p.photos[0] : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
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
// 5. GESTION DES PROJETS (CMS PORTFOLIO)
// =========================================================================
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
                    ${photoCount} photo${photoCount > 1 ? 's' : ''}
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
        projectForm.addEventListener('submit', async (e) => {
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

            if (currentEditingPhotos.length < 7) {
                showToast(`Note : ${currentEditingPhotos.length}/7 photos ajoutées. Pour une expérience optimale type galerie de prestige, 7 photos sont recommandées.`, 'info');
            }

            const projectData = {
                title,
                category,
                location,
                surface: surface || "Sur-mesure",
                duration: duration || "Non spécifié",
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

        let csvContent = "\uFEFFDate;Nom;Telephone;Prestation;Ville;Message;Statut\n";
        currentLeads.forEach(l => {
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
        const cleanPhone = (lead.phone || '').replace(/\s+/g, '');
        const waMsg = encodeURIComponent(`Bonjour ${lead.name} ! Atelier Grafrika fait suite à votre demande de devis.`);
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
}

function setupSettingsForms() {
    const contactForm = document.getElementById('settingsContactForm');
    const securityForm = document.getElementById('settingsSecurityForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
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
