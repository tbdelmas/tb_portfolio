/* ============================================================
   PORTFOLIO — BERNARD TABIO  |  script.js
   Interactions (JavaScript natif, sans dépendance) :
     1. Réglages généraux
     2. Menu mobile (burger)
     3. Lien actif au scroll (scrollspy)
     4. Apparition des blocs au scroll (fade-in)
     5. Barres de compétences animées
     6. Compteurs de statistiques
     7. Aperçu du projet (iframe chargée à la demande)
     8. Formulaire de contact (mailto)
     9. Retour en haut + année du pied de page
   ============================================================ */

'use strict';

/* ---------- 1. Réglages généraux (modifiables) ---------- */
const CONFIG = {
  email: 'tbdelmas@gmail.com',           // destinataire du formulaire
  dureeCompteur: 1400                    // durée d'animation des chiffres (ms)
};

/* Raccourcis */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const reduitAnimations = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initMenuMobile();
  initScrollspy();
  initRevelation();
  initBarres();
  initCompteurs();
  initApercuProjet();
  initFormulaire();
  initRetourHaut();
  $('#annee').textContent = new Date().getFullYear();
});

/* ---------- 2. Menu mobile ---------- */
function initMenuMobile() {
  const burger = $('#btn-burger');
  const menu   = $('#menu-principal');
  if (!burger || !menu) return;

  const basculer = (ouvrir) => {
    menu.classList.toggle('ouvert', ouvrir);
    burger.classList.toggle('ouvert', ouvrir);
    burger.setAttribute('aria-expanded', String(ouvrir));
    burger.setAttribute('aria-label', ouvrir ? 'Fermer le menu' : 'Ouvrir le menu');
  };

  burger.addEventListener('click', () => basculer(!menu.classList.contains('ouvert')));
  // Refermer le menu après un clic sur un lien
  $$('.nav__lien', menu).forEach(lien => lien.addEventListener('click', () => basculer(false)));
  // Refermer avec la touche Échap
  document.addEventListener('keydown', e => { if (e.key === 'Escape') basculer(false); });
}

/* ---------- 3. Lien actif au scroll (scrollspy) ---------- */
function initScrollspy() {
  const sections = $$('main section[id]');
  const liens    = $$('.nav__lien');
  if (!sections.length) return;

  const observateur = new IntersectionObserver(entrees => {
    entrees.forEach(entree => {
      if (!entree.isIntersecting) return;
      const id = entree.target.id;
      liens.forEach(l => l.classList.toggle('actif', l.getAttribute('href') === `#${id}`));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });   /* zone de détection au milieu de l'écran */

  sections.forEach(s => observateur.observe(s));
}

/* ---------- 4. Apparition des blocs au scroll ---------- */
function initRevelation() {
  const blocs = $$('.reveal');
  if (reduitAnimations || !('IntersectionObserver' in window)) {
    blocs.forEach(b => b.classList.add('visible'));
    return;
  }
  const observateur = new IntersectionObserver(entrees => {
    entrees.forEach(entree => {
      if (entree.isIntersecting) {
        entree.target.classList.add('visible');
        observateur.unobserve(entree.target);
      }
    });
  }, { threshold: 0.12 });
  blocs.forEach(b => observateur.observe(b));
}

/* ---------- 5. Barres de compétences ---------- */
function initBarres() {
  const barres = $$('.barre__remplissage');
  if (!barres.length) return;

  const remplir = barre => { barre.style.width = `${barre.dataset.niveau || 0}%`; };

  if (reduitAnimations || !('IntersectionObserver' in window)) {
    barres.forEach(remplir);
    return;
  }
  const observateur = new IntersectionObserver(entrees => {
    entrees.forEach(entree => {
      if (entree.isIntersecting) {
        remplir(entree.target);
        observateur.unobserve(entree.target);
      }
    });
  }, { threshold: 0.4 });
  barres.forEach(b => observateur.observe(b));
}

/* ---------- 6. Compteurs de statistiques ---------- */
function initCompteurs() {
  const compteurs = $$('.stat__chiffre');
  if (!compteurs.length) return;
  const formatFR = n => n.toLocaleString('fr-FR');   // 5000 → « 5 000 »

  const animer = el => {
    const cible   = parseInt(el.dataset.cible, 10) || 0;
    const suffixe = el.dataset.suffixe || '';
    if (reduitAnimations) { el.textContent = formatFR(cible) + suffixe; return; }

    const debut = performance.now();
    const etape = maintenant => {
      const t = Math.min((maintenant - debut) / CONFIG.dureeCompteur, 1);
      const valeur = Math.round(cible * (1 - Math.pow(1 - t, 3)));   // easing « easeOutCubic »
      el.textContent = formatFR(valeur) + (t === 1 ? suffixe : '');
      if (t < 1) requestAnimationFrame(etape);
    };
    requestAnimationFrame(etape);
  };

  if (!('IntersectionObserver' in window)) { compteurs.forEach(animer); return; }
  const observateur = new IntersectionObserver(entrees => {
    entrees.forEach(entree => {
      if (entree.isIntersecting) { animer(entree.target); observateur.unobserve(entree.target); }
    });
  }, { threshold: 0.6 });
  compteurs.forEach(c => observateur.observe(c));
}

/* ---------- 7. Aperçu du projet : iframe à la demande ---------- */
function initApercuProjet() {
  const conteneur = $('#apercu-projet');
  const bouton    = $('#btn-charger-carte');
  if (!conteneur || !bouton) return;

  bouton.addEventListener('click', () => {
    if (conteneur.querySelector('iframe')) return;   // déjà chargée
    const iframe = document.createElement('iframe');
    iframe.src = conteneur.dataset.url;
    iframe.title = 'Carte interactive — Aménagement hydroélectrique de Gribo-Popoli';
    iframe.loading = 'lazy';
    iframe.setAttribute('allowfullscreen', '');

    // Au chargement : on masque l'image + le bouton pour laisser place à la carte
    iframe.addEventListener('load', () => {
      const overlay = $('.ecran__overlay', conteneur);
      const image   = $('img', conteneur);
      if (overlay) overlay.style.opacity = '0';
      if (overlay) overlay.style.pointerEvents = 'none';
      if (image)   image.remove();
    });
    conteneur.appendChild(iframe);
  });
}

/* ---------- 8. Formulaire de contact (mailto, sans backend) ---------- */
function initFormulaire() {
  const form = $('#form-contact');
  const note = $('#form-note');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const nom     = $('#f-nom').value.trim();
    const email   = $('#f-email').value.trim();
    const message = $('#f-message').value.trim();

    // Vérification minimale côté client
    if (!nom || !email || !message) {
      note.textContent = '⚠ Merci de remplir tous les champs avant l’envoi.';
      note.className = 'formulaire__note erreur';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      note.textContent = '⚠ L’adresse email semble invalide.';
      note.className = 'formulaire__note erreur';
      return;
    }

    const sujet = `[Portfolio] Message de ${nom}`;
    const corps = `Bonjour Bernard,\n\n${message}\n\n—\n${nom}\n${email}`;
    window.location.href =
      `mailto:${CONFIG.email}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;

    note.textContent = '✓ Votre messagerie va s’ouvrir avec le message pré-rempli.';
    note.className = 'formulaire__note succes';
    form.reset();
  });
}

/* ---------- 9. Bouton « retour en haut » ---------- */
function initRetourHaut() {
  const bouton = $('#btn-retour-haut');
  if (!bouton) return;

  const auScroll = () => bouton.classList.toggle('visible', window.scrollY > 600);
  window.addEventListener('scroll', auScroll, { passive: true });
  auScroll();

  bouton.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: reduitAnimations ? 'auto' : 'smooth' }));
}

  /* Galerie / Lightbox */
  const lightbox = document.getElementById("lightbox");
  const lightboxTitle = document.getElementById("lightbox-title");
  const closeLightbox = document.querySelector(".lightbox-close");
  const lightboxVisual = document.querySelector(".lightbox-visual");
  const galleryItems = document.querySelectorAll(".gallery-item");

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      const imgSrc = item.dataset.image;

      // clear previous visual content
      lightboxVisual.innerHTML = "";

      if (imgSrc) {
        const img = document.createElement("img");
        img.src = imgSrc;
        img.alt = item.dataset.title || "";
        lightboxVisual.appendChild(img);
      }

      lightboxTitle.textContent = item.dataset.title;
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
    });
  });

  function closeGallery() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    const lightboxVisual = document.querySelector(".lightbox-visual");
    if (lightboxVisual) lightboxVisual.innerHTML = "";
  }

  closeLightbox.addEventListener("click", closeGallery);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeGallery();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeGallery();
    }
  });
