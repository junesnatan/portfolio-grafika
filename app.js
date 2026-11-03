/**
 * ATELIER GRAFRIKA - GALERIE EN ARCHE PANORAMIQUE (MODÈLE BRANDLYFT)
 * Chaque projet dispose d'une galerie de 7 photos 100% uniques et dédiées (0 doublon)
 * Ton naturel et chaleureux
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 0. GESTION DU SPLASH SCREEN (STYLE APPLICATION MOBILE)
    // =========================================================================
    const splashScreen = document.getElementById('appSplashScreen');
    if (splashScreen) {
        // Disparition automatique après 1.2s (comme sur une vraie app mobile)
        setTimeout(() => {
            splashScreen.classList.add('hide');
        }, 1200);

        // Possibilité d'accélérer en cliquant sur l'écran
        splashScreen.addEventListener('click', () => {
            splashScreen.classList.add('hide');
        });
    }

    // =========================================================================
    // 1. DONNÉES DES 7 PROJETS AVEC 7 PHOTOS UNIQUES PAR PROJET (49 PHOTOS AU TOTAL)
    // =========================================================================
    const projects = [
        {
            id: 1,
            title: "Villa Océane & Claustras",
            category: "Architecture",
            location: "Fidjrossè, Cotonou",
            surface: "360 m²",
            duration: "12 mois",
            // 7 photos exclusives : Façade, piscine, varangue, salon, cuisine, suite, salle d'eau
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
            // 7 photos exclusives : Salon moderne, boiseries iroko, salle à manger, escalier, chambre, dressing, lounge
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
            // 7 photos exclusives : Ingénieurs de chantier, coffrage, ferraillage, coulage béton, structure, échafaudage, coordination
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
            // 7 photos exclusives : Façade moderne, salon lumineux, cuisine ouverte, mezzanine, chambre d'ami, terrasse, jardin
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
            // 7 photos exclusives : Terrasse rooftop, salon épuré, cuisine îlot central, séjour, suite, salle de bain, vue extérieure
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
            // 7 photos exclusives : Façade achevée, hall d'accueil, appartements témoins, coursives, cages d'escalier, balcons, perspective
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
            // 7 photos exclusives : Portail d'entrée, varangue extérieure, cour arborée, salon voûté, chambre d'hôtes, cour d'eau, patio nuit
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

    // =========================================================================
    // 2. DISPOSITION EN ARCHE (PC) / CAROUSEL TOUCH SNAP AVEC POINTS (MOBILE)
    // =========================================================================
    const archTrack = document.getElementById('archTrack');
    const archGallery = document.getElementById('archGallery');
    const mobileDotsContainer = document.getElementById('mobileCarouselDots');
    const total = projects.length;
    const centerIdx = Math.floor(total / 2); // Projet au centre (idx = 3)

    // Générer les points de pagination mobile
    if (mobileDotsContainer) {
        mobileDotsContainer.innerHTML = '';
        projects.forEach((_, idx) => {
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
    projects.forEach((proj, idx) => {
        const card = document.createElement('div');
        card.className = 'arch-card';
        card.dataset.id = proj.id;
        card.dataset.index = idx;

        const dist = idx - centerIdx;
        const absDist = Math.abs(dist);
        const side = dist >= 0 ? 1 : -1;

        // Courbure en arche uniquement calculée pour PC
        const yOffset = Math.pow(absDist, 1.65) * 12;
        const rotZ = side * (absDist * 2.2);

        // Sur PC uniquement (> 768px), on applique l'arche
        if (window.innerWidth > 768) {
            card.style.transform = `translateY(${yOffset}px) rotate(${rotZ}deg)`;
        }

        // Carte visuelle avec uniquement le titre et la localisation (Zéro bouton)
        card.innerHTML = `
            <img src="${proj.photos[0]}" alt="${proj.title}" loading="lazy">
            <div class="card-title-scrim">
                <h3 class="card-project-title">${proj.title}</h3>
                <span class="card-project-loc">${proj.location}</span>
            </div>
        `;

        // Événements de survol PC (élargissement et redressement fluide)
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

    // Fonction de défilement vers un projet précis
    function scrollToProject(index) {
        const cards = archTrack.querySelectorAll('.arch-card');
        if (cards[index] && archGallery) {
            const cardLeft = cards[index].offsetLeft;
            const cardWidth = cards[index].offsetWidth;
            const containerWidth = archGallery.offsetWidth;
            archGallery.scrollTo({
                left: cardLeft - (containerWidth / 2) + (cardWidth / 2),
                behavior: 'smooth'
            });
        }
    }

    // Mise à jour de l'indicateur de points pendant le défilement mobile
    if (archGallery) {
        archGallery.addEventListener('scroll', () => {
            if (window.innerWidth <= 768) {
                const scrollPos = archGallery.scrollLeft + (archGallery.offsetWidth / 2);
                const cards = archTrack.querySelectorAll('.arch-card');
                let closestIdx = 0;
                let minDiff = Infinity;

                cards.forEach((c, i) => {
                    const cardCenter = c.offsetLeft + (c.offsetWidth / 2);
                    const diff = Math.abs(scrollPos - cardCenter);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestIdx = i;
                    }
                });

                const dots = mobileDotsContainer.querySelectorAll('.dot-indicator');
                dots.forEach((d, i) => {
                    d.classList.toggle('active', i === closestIdx);
                });
            }
        }, { passive: true });
    }

    // Recalcul en cas de redimensionnement d'écran (Passage PC <-> Mobile)
    window.addEventListener('resize', () => {
        const cards = archTrack.querySelectorAll('.arch-card');
        const isDesktop = window.innerWidth > 768;

        cards.forEach((card, idx) => {
            const dist = idx - centerIdx;
            const absDist = Math.abs(dist);
            const side = dist >= 0 ? 1 : -1;
            const yOffset = Math.pow(absDist, 1.65) * 12;
            const rotZ = side * (absDist * 2.2);

            if (isDesktop) {
                card.style.transform = `translateY(${yOffset}px) rotate(${rotZ}deg)`;
            } else {
                card.style.transform = 'none';
            }
        });
    });

    // =========================================================================
    // 3. GESTION DE LA GALERIE DE 7 PHOTOS DANS LE MODAL
    // =========================================================================
    const quoteModal = document.getElementById('quoteModal');
    const detailModal = document.getElementById('detailModal');
    const btnOpenModal = document.getElementById('btnOpenModal');
    const btnMainQuote = document.getElementById('btnMainQuote');
    const btnCloseQuote = document.getElementById('btnCloseQuote');
    const btnCloseDetail = document.getElementById('btnCloseDetail');
    const quoteForm = document.getElementById('quoteForm');

    // Éléments du visualiseur de galerie
    const detailImg = document.getElementById('detailImg');
    const thumbnailsStrip = document.getElementById('thumbnailsStrip');

    let currentProjectPhotos = [];
    let currentPhotoIndex = 0;

    function renderPhoto(index) {
        if (!currentProjectPhotos.length) return;
        currentPhotoIndex = (index + currentProjectPhotos.length) % currentProjectPhotos.length;
        
        detailImg.src = currentProjectPhotos[currentPhotoIndex];

        // Mettre à jour la miniature active
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

    function openDetailModal(proj) {
        currentProjectPhotos = proj.photos;
        currentPhotoIndex = 0;

        document.getElementById('detailCategory').textContent = proj.category;
        document.getElementById('detailTitle').textContent = proj.title;
        document.getElementById('detailLoc').textContent = proj.location;
        document.getElementById('detailArea').textContent = proj.surface;
        document.getElementById('detailDur').textContent = proj.duration;
        document.getElementById('detailDesc').textContent = proj.description;

        // Générer les 7 miniatures
        thumbnailsStrip.innerHTML = '';
        proj.photos.forEach((photoUrl, pIdx) => {
            const thumb = document.createElement('div');
            thumb.className = `thumb-item ${pIdx === 0 ? 'active' : ''}`;
            thumb.innerHTML = `<img src="${photoUrl}" alt="Photo ${pIdx + 1}" loading="lazy">`;
            thumb.addEventListener('click', () => {
                renderPhoto(pIdx);
            });
            thumbnailsStrip.appendChild(thumb);
        });

        // Afficher la première photo
        renderPhoto(0);

        // Lien WhatsApp personnalisé au ton naturel
        const whatsappMsg = encodeURIComponent(`Bonjour l'équipe Atelier Grafika ! J'ai vu votre réalisation "${proj.title}" à ${proj.location} et j'aimerais échanger avec vous pour un projet similaire.`);
        document.getElementById('detailWhatsAppBtn').href = `https://wa.me/22900000000?text=${whatsappMsg}`;

        detailModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeDetail() {
        detailModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (btnCloseDetail) btnCloseDetail.addEventListener('click', closeDetail);

    // =========================================================================
    // 4. MODAL DEVIS & FORMULAIRE
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
            closeCustomSelect();
        }
    }

    if (btnOpenModal) btnOpenModal.addEventListener('click', openQuote);
    if (btnMainQuote) btnMainQuote.addEventListener('click', openQuote);
    if (btnCloseQuote) btnCloseQuote.addEventListener('click', closeQuote);

    window.addEventListener('click', (e) => {
        if (e.target === quoteModal) closeQuote();
        if (e.target === detailModal) closeDetail();
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCustomSelect();
            closeQuote();
            closeDetail();
        }
        // Flèches gauche/droite pour naviguer dans les photos du modal
        if (detailModal && detailModal.classList.contains('active')) {
            if (e.key === 'ArrowLeft') renderPhoto(currentPhotoIndex - 1);
            if (e.key === 'ArrowRight') renderPhoto(currentPhotoIndex + 1);
        }
    });

    // =========================================================================
    // 5. SELECT ARCHITECTURAL SUR-MESURE (DROPDOWN TYPE DE PROJET)
    // =========================================================================
    const customSelect = document.getElementById('customSelect');
    const customSelectTrigger = document.getElementById('customSelectTrigger');
    const customSelectLabel = document.getElementById('customSelectLabel');
    const customSelectDropdown = document.getElementById('customSelectDropdown');
    const hiddenDomainInput = document.getElementById('cDomain');
    const customOptions = customSelect ? customSelect.querySelectorAll('.custom-option') : [];

    function toggleCustomSelect() {
        if (!customSelect) return;
        const isOpen = customSelect.classList.toggle('open');
        if (customSelectTrigger) {
            customSelectTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            customSelectTrigger.classList.remove('field-error');
        }
    }

    function closeCustomSelect() {
        if (!customSelect) return;
        customSelect.classList.remove('open');
        if (customSelectTrigger) {
            customSelectTrigger.setAttribute('aria-expanded', 'false');
        }
    }

    function selectCustomOption(optionEl) {
        if (!optionEl || !hiddenDomainInput || !customSelectLabel) return;
        const val = optionEl.dataset.value;
        const titleEl = optionEl.querySelector('.option-title');
        const titleText = titleEl ? titleEl.textContent : val;

        hiddenDomainInput.value = val;
        customSelectLabel.textContent = titleText;
        customSelectLabel.classList.add('has-value');

        customOptions.forEach(opt => opt.classList.remove('selected'));
        optionEl.classList.add('selected');

        if (customSelectTrigger) {
            customSelectTrigger.classList.remove('field-error');
        }

        closeCustomSelect();
    }

    if (customSelectTrigger) {
        customSelectTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCustomSelect();
        });

        customSelectTrigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCustomSelect();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!customSelect.classList.contains('open')) {
                    toggleCustomSelect();
                } else if (customOptions.length > 0) {
                    customOptions[0].focus();
                }
            }
        });
    }

    customOptions.forEach((optionEl, idx) => {
        optionEl.setAttribute('tabindex', '0');
        optionEl.addEventListener('click', (e) => {
            e.stopPropagation();
            selectCustomOption(optionEl);
        });

        optionEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectCustomOption(optionEl);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = customOptions[idx + 1] || customOptions[0];
                next.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = customOptions[idx - 1] || customOptions[customOptions.length - 1];
                prev.focus();
            } else if (e.key === 'Escape') {
                closeCustomSelect();
                if (customSelectTrigger) customSelectTrigger.focus();
            }
        });
    });

    // Fermer le dropdown en cliquant à l'extérieur
    document.addEventListener('click', (e) => {
        if (customSelect && !customSelect.contains(e.target)) {
            closeCustomSelect();
        }
    });

    // Envoi WhatsApp au ton naturel
    if (quoteForm) {
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('cName').value.trim();
            const phone = document.getElementById('cPhone').value.trim();
            const city = document.getElementById('cCity').value.trim();
            const domain = document.getElementById('cDomain').value;
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

            const text = `Bonjour Atelier Grafika !%0A%0AJe souhaite demander un devis pour un projet :%0A- *Nom :* ${encodeURIComponent(name)}%0A- *Téléphone :* ${encodeURIComponent(phone)}%0A- *Localisation :* ${encodeURIComponent(city || 'À préciser')}%0A- *Prestation :* ${encodeURIComponent(domain)}%0A- *Détails :* ${encodeURIComponent(message || 'À définir ensemble')}`;

            window.open(`https://wa.me/22900000000?text=${text}`, '_blank');
            closeQuote();
        });
    }

    const yr = document.getElementById('currentYear');
    if (yr) yr.textContent = new Date().getFullYear();

});