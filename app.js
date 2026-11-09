/**
 * ATELIER GRAFRIKA - GALERIE EN ARCHE PANORAMIQUE & FRONTEND
 * Connecté au backend Vercel Serverless via apiClient
 * Ton naturel et chaleureux
 */

import { apiClient } from './api-client.js';

document.addEventListener('DOMContentLoaded', async () => {

    // =========================================================================
    // 0. GESTION DU SPLASH SCREEN (STYLE APPLICATION MOBILE)
    // =========================================================================
    const splashScreen = document.getElementById('appSplashScreen');
    if (splashScreen) {
        setTimeout(() => {
            splashScreen.classList.add('hide');
        }, 1200);

        splashScreen.addEventListener('click', () => {
            splashScreen.classList.add('hide');
        });
    }

    // =========================================================================
    // 1. CHARGEMENT ASYNCHRONE DES PROJETS & COORDONNÉES DEPUIS L'API
    // =========================================================================
    const archTrack = document.getElementById('archTrack');
    const archGallery = document.getElementById('archGallery');
    const mobileDotsContainer = document.getElementById('mobileCarouselDots');

    // Récupérer les projets
    let projects = await apiClient.getProjects();
    renderCards(projects);

    // Synchroniser dynamiquement les coordonnées avec les réglages de l'admin
    async function syncSettingsWithUI() {
        try {
            const settings = await apiClient.getSettings();
            if (!settings) return;

            // Boutons d'appel direct
            if (settings.phone) {
                const phoneDigits = settings.phone.replace(/[^0-9+]/g, '');
                document.querySelectorAll('a[href^="tel:"]').forEach(a => {
                    a.href = `tel:${phoneDigits}`;
                });
            }

            // Boutons d'e-mail
            if (settings.email) {
                document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
                    a.href = `mailto:${settings.email}`;
                });
            }

            // Liens réseaux sociaux
            if (settings.instagram) {
                const ig = document.querySelector('a[aria-label="Instagram"]');
                if (ig) ig.href = settings.instagram;
            }
            if (settings.tiktok) {
                const tt = document.querySelector('a[aria-label="TikTok"]');
                if (tt) tt.href = settings.tiktok;
            }
            if (settings.facebook) {
                const fb = document.querySelector('a[aria-label="Facebook"]');
                if (fb) fb.href = settings.facebook;
            }
            if (settings.linkedin) {
                const li = document.querySelector('a[aria-label="LinkedIn"]');
                if (li) li.href = settings.linkedin;
            }
            if (settings.x) {
                const x = document.querySelector('a[aria-label="X (Twitter)"]');
                if (x) x.href = settings.x;
            }
        } catch (e) {
            console.warn('Erreur syncSettingsWithUI:', e);
        }
    }
    syncSettingsWithUI();

    // =========================================================================
    // 2. DISPOSITION EN ARCHE (PC) / CAROUSEL TOUCH SNAP AVEC POINTS (MOBILE)
    // =========================================================================
    function renderCards(projectList) {
        if (!archTrack) return;
        archTrack.innerHTML = '';

        const projectsSubtext = document.querySelector('.projects-subtext');

        if (!projectList || projectList.length === 0) {
            if (archGallery) archGallery.classList.add('is-empty');
            if (projectsSubtext) {
                projectsSubtext.textContent = "Atelier d'Architecture, Design d'Espace et Direction de Chantier.";
            }

            archTrack.innerHTML = `
                <div class="empty-showcase-box">
                    <div class="empty-icon-circle">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                    </div>
                    <div>
                        <h3 class="empty-box-title">Portfolio en cours d'actualisation</h3>
                        <p class="empty-box-desc">Nos réalisations sélectionnées (plans 3D, villas et chantiers BTP) sont en cours d'intégration par l'Atelier.</p>
                    </div>

                    <div class="empty-pillars-list">
                        <div class="pillar-chip">
                            <span class="pillar-bullet"></span>
                            <span>Conception 3D & Permis</span>
                        </div>
                        <div class="pillar-chip">
                            <span class="pillar-bullet"></span>
                            <span>Design d'Espace & Intérieur</span>
                        </div>
                        <div class="pillar-chip">
                            <span class="pillar-bullet"></span>
                            <span>Suivi & Direction BTP</span>
                        </div>
                    </div>
                </div>
            `;
            if (mobileDotsContainer) {
                mobileDotsContainer.innerHTML = '';
                mobileDotsContainer.style.display = 'none';
            }
            return;
        }

        if (archGallery) archGallery.classList.remove('is-empty');
        if (projectsSubtext) {
            projectsSubtext.textContent = "Découvrez nos réalisations récentes sélectionnées.";
        }
        if (mobileDotsContainer) {
            mobileDotsContainer.style.display = 'flex';
        }

        const total = projectList.length;
        const centerIdx = Math.floor(total / 2);

        // Points de pagination mobile
        if (mobileDotsContainer) {
            mobileDotsContainer.innerHTML = '';
            projectList.forEach((_, idx) => {
                const dot = document.createElement('div');
                dot.className = `dot-indicator ${idx === 0 ? 'active' : ''}`;
                dot.dataset.index = idx;
                dot.addEventListener('click', () => {
                    scrollToProject(idx);
                });
                mobileDotsContainer.appendChild(dot);
            });
        }

        // Générer les cartes
        projectList.forEach((proj, idx) => {
            const card = document.createElement('div');
            card.className = 'arch-card';
            card.dataset.id = proj.id;
            card.dataset.index = idx;

            const dist = idx - centerIdx;
            const absDist = Math.abs(dist);
            const side = dist >= 0 ? 1 : -1;

            // Courbure en arche sur PC uniquement
            const yOffset = Math.pow(absDist, 1.65) * 12;
            const rotZ = side * (absDist * 2.2);

            if (window.innerWidth > 768) {
                card.style.transform = `translateY(${yOffset}px) rotate(${rotZ}deg)`;
            }

            card.innerHTML = `
                <span class="card-arch-chip">${escapeHtml(proj.category)}</span>
                <img src="${escapeHtml(proj.photos[0])}" alt="${escapeHtml(proj.title)}" loading="lazy">
                <div class="card-title-scrim">
                    <div class="card-meta-line">
                        <span class="card-spec-surface">${escapeHtml(proj.surface || "Sur-mesure")}</span>
                        <span class="card-spec-sep">•</span>
                        <span class="card-spec-dur">${escapeHtml(proj.duration || "Étude personnalisée")}</span>
                    </div>
                    <h3 class="card-project-title">${escapeHtml(proj.title)}</h3>
                    <span class="card-project-loc">${escapeHtml(proj.location)}</span>
                </div>
            `;

            card.addEventListener('mouseenter', () => {
                if (window.innerWidth > 768) {
                    card.style.transform = `translateY(${yOffset - 12}px) rotate(0deg) scale(1.05)`;
                }
            });

            card.addEventListener('mouseleave', () => {
                if (window.innerWidth > 768) {
                    card.style.transform = `translateY(${yOffset}px) rotate(${rotZ}deg) scale(1)`;
                }
            });

            card.addEventListener('click', () => {
                openDetailModal(proj);
            });

            archTrack.appendChild(card);
        });
    }

    function scrollToProject(index) {
        if (!archTrack || !archGallery) return;
        const cards = archTrack.querySelectorAll('.arch-card');
        if (cards[index]) {
            const cardLeft = cards[index].offsetLeft;
            const cardWidth = cards[index].offsetWidth;
            const containerWidth = archGallery.offsetWidth;
            archGallery.scrollTo({
                left: cardLeft - (containerWidth / 2) + (cardWidth / 2),
                behavior: 'smooth'
            });
        }
    }

    if (archGallery) {
        archGallery.addEventListener('scroll', () => {
            const cards = archTrack.querySelectorAll('.arch-card');
            const centerPoint = archGallery.scrollLeft + (archGallery.offsetWidth / 2);
            let closestIdx = 0;
            let minDistance = Infinity;

            cards.forEach((card, idx) => {
                const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
                const distance = Math.abs(centerPoint - cardCenter);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestIdx = idx;
                }
            });

            if (mobileDotsContainer) {
                const dots = mobileDotsContainer.querySelectorAll('.dot-indicator');
                dots.forEach((dot, idx) => {
                    dot.classList.toggle('active', idx === closestIdx);
                });
            }
        });
    }

    window.addEventListener('resize', () => {
        const total = projects.length;
        const centerIdx = Math.floor(total / 2);
        const cards = archTrack.querySelectorAll('.arch-card');
        
        cards.forEach((card, idx) => {
            if (window.innerWidth > 768) {
                const dist = idx - centerIdx;
                const absDist = Math.abs(dist);
                const side = dist >= 0 ? 1 : -1;
                const yOffset = Math.pow(absDist, 1.65) * 12;
                const rotZ = side * (absDist * 2.2);
                card.style.transform = `translateY(${yOffset}px) rotate(${rotZ}deg)`;
            } else {
                card.style.transform = 'none';
            }
        });
    });

    // =========================================================================
    // 3. GESTION DU MODAL DE DÉTAIL DU PROJET (GALERIE 7 PHOTOS)
    // =========================================================================
    const quoteModal = document.getElementById('quoteModal');
    const detailModal = document.getElementById('detailModal');
    const btnOpenModal = document.getElementById('btnOpenModal');
    const btnMainQuote = document.getElementById('btnMainQuote');
    const btnCloseQuote = document.getElementById('btnCloseQuote');
    const btnCloseDetail = document.getElementById('btnCloseDetail');
    const quoteForm = document.getElementById('quoteForm');

    const detailImg = document.getElementById('detailImg');
    const thumbnailsStrip = document.getElementById('thumbnailsStrip');

    let currentProjectPhotos = [];
    let currentPhotoIndex = 0;

    function renderPhoto(index) {
        if (!currentProjectPhotos.length) return;
        currentPhotoIndex = (index + currentProjectPhotos.length) % currentProjectPhotos.length;
        
        detailImg.src = currentProjectPhotos[currentPhotoIndex];

        const thumbItems = thumbnailsStrip.querySelectorAll('.thumb-item');
        thumbItems.forEach((t, i) => {
            if (i === currentPhotoIndex) {
                t.classList.add('active');
                t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            } else {
                t.classList.remove('active');
            }
        });
    }

    async function openDetailModal(proj) {
        currentProjectPhotos = proj.photos || [];
        currentPhotoIndex = 0;

        document.getElementById('detailCategory').textContent = proj.category;
        document.getElementById('detailTitle').textContent = proj.title;
        document.getElementById('detailLoc').textContent = proj.location;
        document.getElementById('detailArea').textContent = proj.surface || 'Sur-mesure';
        document.getElementById('detailDur').textContent = proj.duration || 'Étude personnalisée';
        document.getElementById('detailDesc').textContent = proj.description || '';

        thumbnailsStrip.innerHTML = '';
        currentProjectPhotos.forEach((photoUrl, pIdx) => {
            const thumb = document.createElement('div');
            thumb.className = `thumb-item ${pIdx === 0 ? 'active' : ''}`;
            thumb.innerHTML = `<img src="${escapeHtml(photoUrl)}" alt="Photo ${pIdx + 1}" loading="lazy">`;
            thumb.addEventListener('click', () => {
                renderPhoto(pIdx);
            });
            thumbnailsStrip.appendChild(thumb);
        });

        renderPhoto(0);

        // Lien WhatsApp personnalisé
        const settings = await apiClient.getSettings();
        let targetWa = '22900000000';
        if (settings && settings.whatsapp) {
            targetWa = settings.whatsapp.replace(/[^0-9]/g, '');
        }

        const whatsappMsg = encodeURIComponent(`Bonjour l'équipe Atelier Grafrika ! J'ai vu votre réalisation "${proj.title}" à ${proj.location} et j'aimerais échanger avec vous pour un projet similaire.`);
        const waBtn = document.getElementById('detailWhatsAppBtn');
        if (waBtn) {
            waBtn.href = `https://wa.me/${targetWa}?text=${whatsappMsg}`;
            waBtn.onclick = () => {
                apiClient.recordWhatsAppClick();
            };
        }

        detailModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeDetail() {
        detailModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (btnCloseDetail) btnCloseDetail.addEventListener('click', closeDetail);

    // =========================================================================
    // 4. MODAL DEVIS & FORMULAIRE DE PROSPECTS (CONNECTÉ À /api/leads)
    // =========================================================================
    function openQuote() {
        if (quoteModal) {
            quoteModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeQuote() {
        if (quoteModal) {
            quoteModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (btnOpenModal) btnOpenModal.addEventListener('click', openQuote);
    if (btnMainQuote) btnMainQuote.addEventListener('click', openQuote);
    if (btnCloseQuote) btnCloseQuote.addEventListener('click', closeQuote);

    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeQuote();
            closeDetail();
        }
        if (detailModal && detailModal.classList.contains('active')) {
            if (e.key === 'ArrowLeft') renderPhoto(currentPhotoIndex - 1);
            if (e.key === 'ArrowRight') renderPhoto(currentPhotoIndex + 1);
        }
    });

    // =========================================================================
    // 5. SELECT ARCHITECTURAL SUR-MESURE (DROPDOWN TYPE DE PROJET)
    // =========================================================================
    const customSelect = document.getElementById('customSelectDomain');
    const customSelectTrigger = document.getElementById('customSelectTrigger');
    const customSelectOptions = document.getElementById('customSelectOptions');
    const realDomainInput = document.getElementById('cDomain');

    if (customSelect && customSelectTrigger && customSelectOptions) {
        customSelectTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            customSelect.classList.toggle('open');
            customSelectTrigger.setAttribute('aria-expanded', customSelect.classList.contains('open'));
        });

        const options = customSelectOptions.querySelectorAll('.custom-option');
        options.forEach(opt => {
            opt.addEventListener('click', () => {
                const val = opt.getAttribute('data-value');
                const title = opt.querySelector('.option-title').textContent.trim();

                realDomainInput.value = val;
                const valueDisplay = customSelectTrigger.querySelector('.custom-select-value');
                valueDisplay.textContent = title;
                valueDisplay.classList.add('has-value');

                options.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');

                customSelect.classList.remove('open');
                customSelectTrigger.setAttribute('aria-expanded', 'false');
                customSelectTrigger.classList.remove('field-error');
            });
        });

        document.addEventListener('click', (e) => {
            if (!customSelect.contains(e.target)) {
                customSelect.classList.remove('open');
                customSelectTrigger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Envoi de la demande de devis : Enregistrement API Backend + Redirection WhatsApp
    if (quoteForm) {
        quoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('cName').value.trim();
            const phone = document.getElementById('cPhone').value.trim();
            const city = document.getElementById('cCity').value.trim();
            const domain = realDomainInput ? realDomainInput.value : '';
            const message = document.getElementById('cMessage').value.trim();

            if (!domain) {
                if (customSelectTrigger) {
                    customSelectTrigger.classList.add('field-error');
                    customSelectTrigger.focus();
                }
                if (customSelect) {
                    customSelect.classList.add('open');
                }
                return;
            }

            // 1. Enregistrement asynchrone direct dans l'API Serverless Vercel (/api/leads)
            try {
                await apiClient.createLead({
                    name,
                    phone,
                    city: city || 'Non renseignée',
                    domain,
                    message: message || 'À définir ensemble'
                });
            } catch (err) {
                console.warn('Envoi lead backend:', err);
            }

            // 2. Redirection WhatsApp fluide vers le numéro configuré dans les réglages
            let targetWa = '22900000000';
            try {
                const settings = await apiClient.getSettings();
                if (settings && settings.whatsapp) {
                    targetWa = settings.whatsapp.replace(/[^0-9]/g, '');
                }
            } catch (e) {}

            const text = `Bonjour Atelier Grafrika !%0A%0AJe souhaite demander un devis pour un projet :%0A- *Nom :* ${encodeURIComponent(name)}%0A- *Téléphone :* ${encodeURIComponent(phone)}%0A- *Localisation :* ${encodeURIComponent(city || 'À préciser')}%0A- *Prestation :* ${encodeURIComponent(domain)}%0A- *Détails :* ${encodeURIComponent(message || 'À définir ensemble')}`;

            window.open(`https://wa.me/${targetWa}?text=${text}`, '_blank');
            closeQuote();
            quoteForm.reset();
            if (customSelectTrigger) {
                const valDisplay = customSelectTrigger.querySelector('.custom-select-value');
                if (valDisplay) {
                    valDisplay.textContent = 'Sélectionnez le type de projet...';
                    valDisplay.classList.remove('has-value');
                }
            }
        });
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
});
