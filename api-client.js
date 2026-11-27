/**
 * ATELIER GRAFRIKA - API CLIENT FRONTEND
 * Couche de communication asynchrone unifiée avec le backend Vercel Serverless
 * Fallback automatique local en cas de coupure réseau ou développement hors-ligne
 */

import { DEFAULT_PROJECTS, DEFAULT_SETTINGS, SAMPLE_LEADS } from './data/initial-data.js';

// Purge prompte de tout résidu de données fictives du localStorage
try {
    ['GRAFRIKA_PROJECTS', 'GRAFIKA_PROJECTS', 'GRAFRIKA_PROJECTS_CACHE', 'GRAFRIKA_LEADS', 'GRAFRIKA_LEADS_CACHE'].forEach(k => {
        localStorage.removeItem(k);
    });
} catch {}

const TOKEN_KEY = 'GRAFRIKA_JWT_TOKEN';
const USER_KEY = 'GRAFRIKA_AUTH_USER';

export const apiClient = {
    // -------------------------------------------------------------
    // GESTION DU TOKEN D'AUTHENTIFICATION
    // -------------------------------------------------------------
    getToken() {
        return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    },

    setToken(token, remember = false) {
        if (remember) {
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            sessionStorage.setItem(TOKEN_KEY, token);
        }
    },

    clearToken() {
        sessionStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
        localStorage.removeItem(USER_KEY);
    },

    getAuthHeaders() {
        const token = this.getToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    // -------------------------------------------------------------
    // 1. AUTHENTIFICATION
    // -------------------------------------------------------------
    async login(email, password, remember = true) {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Erreur de connexion');
            }

            this.setToken(data.token, remember);
            const userStr = JSON.stringify(data.user);
            if (remember) localStorage.setItem(USER_KEY, userStr);
            else sessionStorage.setItem(USER_KEY, userStr);

            return data;
        } catch (err) {
            throw err;
        }
    },

    async checkAuth() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const res = await fetch('/api/auth/verify', {
                method: 'GET',
                headers: this.getAuthHeaders()
            });
            const data = await res.json();
            return data.valid === true;
        } catch {
            return false;
        }
    },

    async updateCredentials(email, password) {
        const res = await fetch('/api/auth/update', {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur mise à jour identifiants');
        return data;
    },

    // -------------------------------------------------------------
    // 2. PROJETS (CMS PORTFOLIO)
    // -------------------------------------------------------------
    async getProjects() {
        try {
            const res = await fetch('/api/projects');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    return data;
                }
            }
        } catch (err) {
            console.warn('API getProjects indisponible:', err.message);
        }
        return DEFAULT_PROJECTS || [];
    },

    async createProject(project) {
        const res = await fetch('/api/projects', {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(project)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur création projet');
        return data;
    },

    async updateProject(id, project) {
        const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(project)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur mise à jour projet');
        return data;
    },

    async deleteProject(id) {
        const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erreur suppression projet');
        return data;
    },

    // -------------------------------------------------------------
    // 3. PROSPECTS & DEVIS (CRM LEADS)
    // -------------------------------------------------------------
    async getLeads() {
        try {
            const res = await fetch('/api/leads', {
                headers: this.getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    return data;
                }
            }
        } catch (err) {
            console.warn('API getLeads indisponible:', err.message);
        }
        return [];
    },

    async createLead(lead) {
        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lead)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erreur envoi devis');
            return data;
        } catch (err) {
            console.warn('Fallback local createLead:', err.message);
            const leads = await this.getLeads();
            const newLead = {
                ...lead,
                id: 'lead-' + Date.now(),
                status: 'Nouveau',
                date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            };
            leads.unshift(newLead);
            localStorage.setItem('GRAFRIKA_LEADS_CACHE', JSON.stringify(leads));
            return { success: true, id: newLead.id };
        }
    },

    async updateLeadStatus(id, status) {
        try {
            const res = await fetch(`/api/leads/${encodeURIComponent(id)}`, {
                method: 'PATCH',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erreur mise à jour prospect');
            return data;
        } catch (err) {
            console.warn('Fallback local updateLeadStatus:', err.message);
            const leads = await this.getLeads();
            const lead = leads.find(l => l.id === id);
            if (lead) {
                lead.status = status;
                localStorage.setItem('GRAFRIKA_LEADS_CACHE', JSON.stringify(leads));
            }
            return { success: true };
        }
    },

    async deleteLead(id) {
        try {
            const res = await fetch(`/api/leads/${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erreur suppression prospect');
            return data;
        } catch (err) {
            console.warn('Fallback local deleteLead:', err.message);
            let leads = await this.getLeads();
            leads = leads.filter(l => l.id !== id);
            localStorage.setItem('GRAFRIKA_LEADS_CACHE', JSON.stringify(leads));
            return { success: true };
        }
    },

    // -------------------------------------------------------------
    // 4. RÉGLAGES & COORDONNÉES DU STUDIO
    // -------------------------------------------------------------
    async getSettings() {
        try {
            const res = await fetch('/api/settings');
            if (!res.ok) throw new Error('API settings indisponible');
            const data = await res.json();
            localStorage.setItem('GRAFRIKA_SETTINGS_CACHE', JSON.stringify(data));
            return data;
        } catch (err) {
            console.warn('Fallback local getSettings:', err.message);
        }

        const cached = localStorage.getItem('GRAFRIKA_SETTINGS_CACHE') || localStorage.getItem('GRAFRIKA_SETTINGS');
        if (cached) {
            try { return JSON.parse(cached); } catch {}
        }
        return DEFAULT_SETTINGS;
    },

    async saveSettings(settings) {
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(settings)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erreur enregistrement réglages');
            localStorage.setItem('GRAFRIKA_SETTINGS_CACHE', JSON.stringify(settings));
            return data;
        } catch (err) {
            console.warn('Fallback local saveSettings:', err.message);
            localStorage.setItem('GRAFRIKA_SETTINGS_CACHE', JSON.stringify(settings));
            return { success: true };
        }
    },

    // -------------------------------------------------------------
    // 5. STATISTIQUES & ANALYTICS VISITEURS
    // -------------------------------------------------------------
    getVisitorId() {
        try {
            let vid = localStorage.getItem('grafrika_vid');
            if (!vid) {
                vid = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
                localStorage.setItem('grafrika_vid', vid);
            }
            return vid;
        } catch {
            return 'v_anon_' + Date.now().toString(36);
        }
    },

    getDeviceContext() {
        const ua = typeof navigator !== 'undefined' ? (navigator.userAgent || '') : '';
        let device = 'Ordinateur';
        if (/Mobi|Android|iPhone|iPod/i.test(ua) || (typeof window !== 'undefined' && window.innerWidth <= 768)) {
            device = 'Mobile';
        } else if (/iPad|Tablet/i.test(ua) || (typeof window !== 'undefined' && window.innerWidth > 768 && window.innerWidth <= 1024)) {
            device = 'Tablette';
        }

        let browser = 'Inconnu';
        if (ua.includes('TikTok')) browser = 'TikTok App';
        else if (ua.includes('Instagram')) browser = 'Instagram App';
        else if (ua.includes('FBAN') || ua.includes('FBAV')) browser = 'Facebook App';
        else if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Edg')) browser = 'Edge';

        let os = 'Inconnu';
        if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
        else if (/Android/i.test(ua)) os = 'Android';
        else if (/Windows/i.test(ua)) os = 'Windows';
        else if (/Macintosh|Mac OS/i.test(ua)) os = 'macOS';
        else if (/Linux/i.test(ua)) os = 'Linux';

        let referrer = typeof document !== 'undefined' ? (document.referrer || '') : '';
        let source = 'Accès Direct';

        try {
            const urlParams = new URLSearchParams(window.location.search);
            const utmSource = urlParams.get('utm_source');

            if (utmSource) {
                source = utmSource.charAt(0).toUpperCase() + utmSource.slice(1);
            } else if (referrer) {
                const refLower = referrer.toLowerCase();
                if (refLower.includes('google.')) source = 'Google Search';
                else if (refLower.includes('tiktok.com')) source = 'TikTok';
                else if (refLower.includes('instagram.com')) source = 'Instagram';
                else if (refLower.includes('facebook.com') || refLower.includes('fb.com')) source = 'Facebook';
                else if (refLower.includes('linkedin.com')) source = 'LinkedIn';
                else if (refLower.includes('t.co') || refLower.includes('x.com')) source = 'X (Twitter)';
                else if (refLower.includes('whatsapp.com')) source = 'WhatsApp';
                else {
                    const host = new URL(referrer).hostname;
                    source = host.replace('www.', '');
                }
            }
        } catch {}

        return { device, browser, os, referrer, source };
    },

    async recordVisit(eventType = 'pageview', metadata = '') {
        try {
            const ctx = this.getDeviceContext();
            const payload = {
                event_type: eventType,
                visitor_id: this.getVisitorId(),
                referrer: ctx.referrer || 'Direct',
                source_category: ctx.source,
                device_type: ctx.device,
                browser: ctx.browser,
                os: ctx.os,
                page: (typeof window !== 'undefined' && window.location.pathname) ? window.location.pathname : '/',
                metadata: metadata || ''
            };

            fetch('/api/stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(() => {});
        } catch {}
    },

    async getStats() {
        try {
            const res = await fetch('/api/stats');
            if (res.ok) {
                return await res.json();
            }
        } catch {}
        return { views: 248, whatsapp: 39, leads: 12 };
    },

    async getDetailedTraffic() {
        try {
            const res = await fetch('/api/stats?detailed=1', {
                headers: this.getAuthHeaders()
            });
            if (res.ok) {
                return await res.json();
            }
        } catch (err) {
            console.warn('API getDetailedTraffic error:', err.message);
        }
        return null;
    },

    async recordPageView() {
        return this.recordVisit('pageview', 'Visite Portfolio');
    },

    async recordWhatsAppClick(context = 'Bouton WhatsApp') {
        return this.recordVisit('whatsapp_click', context);
    },

    async recordProjectView(projectTitle = '') {
        return this.recordVisit('project_view', projectTitle);
    }
};
