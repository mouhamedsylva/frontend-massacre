/**
 * configurateur.js
 * Module de customisation multi-vues avec Fabric.js
 * Vanilla JavaScript - Compatible avec tous les navigateurs modernes
 *
 * CORRECTIONS APPORTÉES :
 * - CanvasManager : clipping mask appliqué au canvas entier (pas objet par objet)
 * - CanvasManager : export HD séquentiel et sécurisé (await par vue)
 * - CanvasManager : re-application du clipPath à chaque changement de vue
 * - CONFIG : URL microservice lue depuis window.CONFIGURATEUR_CONFIG (injecté par Liquid)
 * - CanvasManager.loadView : loader désactivé APRÈS rendu complet (fix race condition)
 */

(function () {
  'use strict';

  console.log('🚀 Configurateur Massacre V3.1 - Correctif Interactivité et Scaling Actif');

  // ══════════════════════════════════════════════════════════════════════════════
  // CONFIGURATION GLOBALE
  // Lue depuis window.CONFIGURATEUR_CONFIG injecté par configurateur.liquid
  // ══════════════════════════════════════════════════════════════════════════════

  const CONFIG = {
    // URL du microservice — injectée par Liquid via window.CONFIGURATEUR_CONFIG
    API_ENDPOINT: (window.CONFIGURATEUR_CONFIG && window.CONFIGURATEUR_CONFIG.apiEndpoint)
      ? window.CONFIGURATEUR_CONFIG.apiEndpoint
      : (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
          ? 'http://localhost:3000/submit-devis'
          : ''),

    // Dimensions du canvas (ratio 4:3)
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,

    // Taille maximale du fichier uploadé (5 Mo)
    MAX_FILE_SIZE: 5 * 1024 * 1024,

    // Extensions acceptées
    ACCEPTED_TYPES: ['image/png', 'image/jpeg', 'image/jpg'],

    // Mode debug (console logs détaillés)
    DEBUG: window.CONFIGURATEUR_CONFIG && window.CONFIGURATEUR_CONFIG.debugMode,
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // ÉTAT GLOBAL DE L'APPLICATION
  // ══════════════════════════════════════════════════════════════════════════════

  const AppState = {
    // Produit actuellement sélectionné
    selectedProduct: null,

    // Vue active ('front', 'back', 'left', 'right')
    currentView: 'front',

    // Canvas Fabric.js
    fabricCanvas: null,
    

    // Stockage des designs par vue (JSON sérialisé Fabric.js)
    viewsData: {
      front: { objects: [] },
      back:  { objects: [] },
      left:  { objects: [] },
      right: { objects: [] },
    },


    // Zones éditables par vue (depuis les metafields Shopify)
    editableZones: {
      front: [
        { id: 'front-main',  label: 'Devant',          x: 180, y: 120, w: 440, h: 380 },
        { id: 'front-chest', label: 'Poitrine Gauche',  x: 180, y: 120, w: 130, h: 110 },
      ],
      back:  [
        { id: 'back-main',   label: 'Dos',              x: 180, y: 110, w: 440, h: 390 },
      ],
      left:  [
        { id: 'left-sleeve', label: 'Manche Gauche',    x: 220, y: 160, w: 350, h: 280 },
      ],
      right: [
        { id: 'right-sleeve',label: 'Manche Droite',    x: 220, y: 160, w: 350, h: 280 },
      ],
    },

    // Zone active sélectionnée par l'utilisateur
    activeZone: 'front-main',

    // URLs des images de fond par vue
    viewImages: {
      front: null,
      back:  null,
      left:  null,
      right: null,
    },

    // Flag de soumission en cours
    isSubmitting: false,
    
    // 🔥 Flag pour éviter les sauvegardes pendant le chargement de vue
    _isLoadingView: false,

    // ✅ on ajoute directement les propriétés de zoom ici comme propriétés normales
    userZoom: 1,
    baseScale: 1,
  };

  // ✅ et les constantes en dehors, au niveau du module
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 2.5;
  const ZOOM_STEP = 0.1;

  // ══════════════════════════════════════════════════════════════════════════════
  // UTILITAIRES
  // ══════════════════════════════════════════════════════════════════════════════

  const Utils = {
    log(...args) {
      if (CONFIG.DEBUG) console.log('[Configurateur]', ...args);
    },

    toggleCanvasLoader(show) {
      const loader = document.getElementById('canvas-loader');
      if (loader) loader.style.display = show ? 'flex' : 'none';
    },

    showFeedback(type, title, message, errors = []) {
      const feedbackEl = document.getElementById('submission-feedback');
      if (!feedbackEl) return;

      feedbackEl.className = `submission-feedback ${type}`;

      let html = `<h4>${title}</h4><p>${message}</p>`;
      if (errors.length > 0) {
        html += '<ul>';
        errors.forEach(err => { html += `<li>${err}</li>`; });
        html += '</ul>';
      }

      feedbackEl.innerHTML = html;
      feedbackEl.style.display = 'block';
      feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      if (type === 'success') {
        setTimeout(() => { feedbackEl.style.display = 'none'; }, 10000);
      }
    },

    validateImageFile(file) {
      if (!file) return { valid: false, error: 'Aucun fichier sélectionné.' };
      if (!CONFIG.ACCEPTED_TYPES.includes(file.type))
        return { valid: false, error: 'Format non accepté. Utilisez PNG ou JPEG.' };
      if (file.size > CONFIG.MAX_FILE_SIZE)
        return { valid: false, error: 'Fichier trop volumineux. Maximum 5 Mo.' };
      return { valid: true };
    },

    parseEditableZones(jsonString) {
      try {
        if (!jsonString) return null;
        const decoded = jsonString
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, '&');
        return JSON.parse(decoded);
      } catch (e) {
        console.error('[Config] Erreur parsing zones éditables :', e);
        return null;
      }
    },
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // CUSTOM CONTROLS — Icônes rondes aux 4 coins (supprimer / dupliquer / rotation / resize)
  // ══════════════════════════════════════════════════════════════════════════════

  const CustomControls = {

    // Cache des icônes pré-rendues (Image DOM) pour éviter de les recréer à chaque frame
    _icons: {},

    // Définition des icônes en SVG (data URI). Style cercles blancs avec bordure.
    _svgIcons: {
      delete: `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" fill="#fff" stroke="#cccccc" stroke-width="2"/>
          <circle cx="24" cy="24" r="18" fill="#ff3b30"/>
          <path d="M17 17 L31 31 M31 17 L17 31" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
        </svg>`,
      rotate: `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" fill="#fff" stroke="#cccccc" stroke-width="2"/>
          <circle cx="24" cy="24" r="18" fill="#4A90E2"/>
          <path d="M17 19 a 9 9 0 1 1 0 10" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M17 14 L17 21 L24 21 Z" fill="#fff"/>
        </svg>`,
      clone: `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" fill="#fff" stroke="#cccccc" stroke-width="2"/>
          <circle cx="24" cy="24" r="18" fill="#4A90E2"/>
          <rect x="16" y="20" width="11" height="11" rx="2" fill="none" stroke="#fff" stroke-width="2.5"/>
          <rect x="21" y="15" width="11" height="11" rx="2" fill="#4A90E2" stroke="#fff" stroke-width="2.5"/>
        </svg>`,
      resize: `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" fill="#fff" stroke="#cccccc" stroke-width="2"/>
          <circle cx="24" cy="24" r="18" fill="#4A90E2"/>
          <path d="M18 30 L30 18 M30 18 L23 18 M30 18 L30 25 M18 30 L25 30 M18 30 L18 23"
                stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>`,
    },

    // Précharge toutes les icônes en mémoire (Image objects) avant utilisation
    preloadIcons() {
      Object.keys(this._svgIcons).forEach((key) => {
        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(this._svgIcons[key]);
        this._icons[key] = img;
      });
    },

    // Fonction générique de rendu d'un contrôle "icône ronde"
    renderIcon(iconKey) {
      const icons = this._icons;
      return function (ctx, left, top, styleOverride, fabricObject) {
        const img = icons[iconKey];
        const size = 32; // taille d'affichage augmentée pour plus de visibilité
        ctx.save();
        ctx.translate(left, top);
        // Les contrôles resize/rotate suivent l'angle de l'objet ; delete/clone restent droits
        if (iconKey === 'resize') {
          ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
        }
        if (img && img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, -size / 2, -size / 2, size, size);
        } else {
          // Fallback si l'image n'est pas encore chargée : petit cercle gris
          ctx.beginPath();
          ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
          ctx.fillStyle = '#ccc';
          ctx.fill();
        }
        ctx.restore();
      };
    },

    // Action : supprime l'objet du canvas (délègue à CanvasManager pour rester cohérent
    // avec le bouton "btn-delete-selected" déjà existant)
    deleteObjectHandler(eventData, transform) {
      console.log('[CustomControls] deleteObjectHandler appelé', transform.target);
      const target = transform.target;
      const canvas = target.canvas;
      canvas.setActiveObject(target);
      CanvasManager.deleteSelected();
      return true;
    },

    // Action : duplique l'objet et sélectionne le clone
    cloneObjectHandler(eventData, transform) {
      console.log('[CustomControls] cloneObjectHandler appelé', transform.target);
      CanvasManager.duplicateSelected(transform.target);
      return true;
    },

    // Place les 4 contrôles aux coins. À appeler une seule fois, globalement.
    install() {
      if (!window.fabric) {
        console.error('[CustomControls] fabric.js non chargé.');
        return;
      }

      this.preloadIcons();

      const Control = fabric.Control;

      // Sécurité : si fabric.controlsUtils n'est pas disponible dans la version
      // chargée, on retombe sur les actionHandlers natifs de Fabric.Object pour
      // éviter qu'une référence undefined ne fasse planter install() avant la fin
      // (ce qui empêcherait bl/br d'être créés et le style final d'être appliqué).
      const rotationHandler = (fabric.controlsUtils && fabric.controlsUtils.rotationWithSnapping)
        || fabric.controlsActions?.rotationWithSnapping
        || function (eventData, transform, x, y) {
          return fabric.controlsUtils
            ? fabric.controlsUtils.rotationWithSnapping(eventData, transform, x, y)
            : false;
        };
      const scalingHandler = (fabric.controlsUtils && fabric.controlsUtils.scalingEqually)
        || fabric.controlsActions?.scalingEqually
        || function (eventData, transform, x, y) {
          return fabric.controlsUtils
            ? fabric.controlsUtils.scalingEqually(eventData, transform, x, y)
            : false;
        };

      // Décalage en pixels appliqué à chaque icône, vers l'extérieur du coin,
      // pour qu'elle soit nettement détachée du cadre de sélection.
      // Valeur réduite de 60 à 40 pour rapprocher les icônes du cadre
      const OFFSET = 0;

      // IMPORTANT : offsetX/offsetY ne déplacent QUE le rendu visuel de l'icône
      // (utilisé par render() via ctx.translate). Ils n'affectent PAS la zone de
      // détection de clic (hit-test), qui reste calculée par défaut sur le coin
      // réel de l'objet. Sans positionHandler custom, la zone cliquable de chaque
      // contrôle reste donc superposée au coin de l'objet, en plein milieu de la
      // zone qu'on essaie de "drag" → Fabric intercepte le mousedown comme une
      // action de contrôle (delete/rotate/clone/scale) au lieu de déplacer l'objet.
      // On fournit donc un positionHandler qui reproduit le même décalage que le
      // rendu, dans l'espace écran, pour que la zone cliquable suive l'icône.
      const makeOffsetPositionHandler = (offsetX, offsetY) => {
        return function (dim, finalMatrix, fabricObject, currentControl) {
          const basePoint = fabric.Control.prototype.positionHandler.call(
            this, dim, finalMatrix, fabricObject, currentControl
          );
          const angleRad = fabric.util.degreesToRadians(fabricObject.angle || 0);
          const cos = Math.cos(angleRad);
          const sin = Math.sin(angleRad);
          const zoom = fabricObject.canvas ? fabricObject.canvas.getZoom() : 1;
          // Applique le décalage dans le repère local de l'objet (tourne avec lui),
          // exactement comme le ferait ctx.translate après ctx.rotate dans render().
          const dx = (offsetX * cos - offsetY * sin) * zoom;
          const dy = (offsetX * sin + offsetY * cos) * zoom;
          return new fabric.Point(basePoint.x + dx, basePoint.y + dy);
        };
      };

      fabric.Object.prototype.controls.tl = new Control({
        x: -0.5,
        y: -0.5,
        offsetX: -OFFSET,
        offsetY: -OFFSET,
        cursorStyle: 'pointer',
        mouseUpHandler: this.deleteObjectHandler,
        render: this.renderIcon('delete'),
        positionHandler: makeOffsetPositionHandler(-OFFSET, -OFFSET),
        sizeX: 32,
        sizeY: 32,
        cornerSize: 32,
        touchSizeX: 40,
        touchSizeY: 40,
      });

      fabric.Object.prototype.controls.tr = new Control({
        x: 0.5,
        y: -0.5,
        offsetX: OFFSET,
        offsetY: -OFFSET,
        cursorStyle: 'pointer',
        actionHandler: rotationHandler,
        actionName: 'rotate',
        render: this.renderIcon('rotate'),
        positionHandler: makeOffsetPositionHandler(OFFSET, -OFFSET),
        sizeX: 32,
        sizeY: 32,
        cornerSize: 32,
        touchSizeX: 40,
        touchSizeY: 40,
      });

      fabric.Object.prototype.controls.bl = new Control({
        x: -0.5,
        y: 0.5,
        offsetX: -OFFSET,
        offsetY: OFFSET,
        cursorStyle: 'pointer',
        mouseUpHandler: this.cloneObjectHandler,
        render: this.renderIcon('clone'),
        positionHandler: makeOffsetPositionHandler(-OFFSET, OFFSET),
        sizeX: 32,
        sizeY: 32,
        cornerSize: 32,
        touchSizeX: 40,
        touchSizeY: 40,
      });

      fabric.Object.prototype.controls.br = new Control({
        x: 0.5,
        y: 0.5,
        offsetX: OFFSET,
        offsetY: OFFSET,
        cursorStyle: 'nwse-resize',
        actionHandler: scalingHandler,
        actionName: 'scale',
        render: this.renderIcon('resize'),
        positionHandler: makeOffsetPositionHandler(OFFSET, OFFSET),
        sizeX: 32,
        sizeY: 32,
        cornerSize: 32,
        touchSizeX: 40,
        touchSizeY: 40,
      });

      // Sécurité supplémentaire : certaines versions de fabric.js basent encore
      // la détection de clic sur la propriété d'instance `cornerSize` (et non
      // sizeX/sizeY définis sur le Control). On l'aligne explicitement pour que
      // la zone cliquable corresponde toujours à la taille visuelle des icônes.
      fabric.Object.prototype.cornerSize = 32;
      fabric.Object.prototype.touchCornerSize = 40;

      // On masque les contrôles milieux (mt, mb, ml, mr) et mtr (poignée de rotation par défaut)
      // pour ne garder que les 4 coins, comme dans l'exemple visuel.
      fabric.Object.prototype.setControlsVisibility({
        mt: false,
        mb: false,
        ml: false,
        mr: false,
        mtr: false,
      });

      // Style de la bounding box (ligne bleue fine, pas de coins carrés par défaut)
      // Padding et borderScaleFactor réduits pour un cadre plus proche de l'objet
      fabric.Object.prototype.set({
        transparentCorners: true,
        borderColor: '#2f6fed',
        cornerColor: 'rgba(0,0,0,0)', // invisible, on dessine nos propres icônes
        borderScaleFactor: 1,          // Réduit de 1.5 à 1 pour une ligne plus fine
        padding: 0,                    // Padding réduit pour cadre plus serré
      });

      Utils.log('[CustomControls] Contrôles 4-coins installés.');
    },
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // CANVAS MANAGER — VERSION CORRIGÉE ET COMPLÈTE
  // ══════════════════════════════════════════════════════════════════════════════

  const CanvasManager = {

    // ─────────────────────────────────────────────────────────────────────────
    // INITIALISATION
    // ─────────────────────────────────────────────────────────────────────────

    init() {
      const canvasEl = document.getElementById('customization-canvas');
      if (!canvasEl) {
        console.error('[Canvas] Élément canvas introuvable.');
        return;
      }

      // Installer les contrôles custom (icônes rondes aux 4 coins) avant tout objet
      CustomControls.install();

      // Créer l'instance Fabric.js
      AppState.fabricCanvas = new fabric.Canvas('customization-canvas', {
        width: CONFIG.CANVAS_WIDTH,
        height: CONFIG.CANVAS_HEIGHT,
        backgroundColor: 'transparent',
        preserveObjectStacking: true,
        selection: true,
        interactive: true,
        centeredScaling: false,
      });

      Utils.log('Canvas Fabric.js initialisé');

      // Redimensionner le canvas pour occuper toute la hauteur du workspace
      this.resizeCanvasToWorkspace();
      window.addEventListener('resize', () => this.resizeCanvasToWorkspace());

      // Configurer les événements
      this.setupCanvasEvents();
      this.setupViewTabs();

      this.setupZoomControls();
      this.setupScrollOffsetFix();

      // Charger la vue initiale (Front)
      this.loadView('front');

      window.dispatchEvent(new CustomEvent('configurator:canvas-ready'));
    },

    // ─────────────────────────────────────────────────────────────────────────
    // REDIMENSIONNEMENT : remplit la hauteur disponible du workspace
    // Le ratio 4:3 (800×600) est préservé.
    //
    // ⚠️ CORRECTIF : on utilise désormais le zoom NATIF de Fabric.js
    // (canvas.setZoom + canvas.setDimensions) au lieu d'un transform:scale()
    // CSS. Le scale CSS déforme uniquement le RENDU visuel mais Fabric.js
    // continue de croire qu'il occupe sa taille interne d'origine (800×600) —
    // tout son mapping clic → coordonnées (y compris le hit-test des contrôles
    // aux 4 coins) reste donc calculé sur la mauvaise échelle, d'où le
    // décalage systématique entre l'icône affichée et sa zone cliquable
    // réelle. Le zoom natif fait gérer ce mapping par Fabric lui-même, de
    // façon cohérente entre rendu, clic et hit-test des contrôles.
    // ─────────────────────────────────────────────────────────────────────────

    resizeCanvasToWorkspace() {
      const workspace = document.querySelector('.canvas-workspace');
      const wrapper   = document.querySelector('.canvas-workspace .canvas-wrapper');
      if (!workspace || !wrapper || !AppState.fabricCanvas) return;

      const padding = 48;
      const availH  = workspace.clientHeight - padding;
      const availW  = workspace.clientWidth  - padding - 90;
      if (availH <= 0 || availW <= 0) return;

      const ratio = CONFIG.CANVAS_WIDTH / CONFIG.CANVAS_HEIGHT;
      let dispH = availH;
      let dispW = dispH * ratio;
      if (dispW > availW) {
        dispW = availW;
        dispH = dispW / ratio;
      }

      const baseScale = dispW / CONFIG.CANVAS_WIDTH;
      AppState.baseScale = baseScale; // ← on garde le scale "fit" en mémoire

      this.applyZoom(); // ← applique baseScale * userZoom via le zoom natif Fabric

      Utils.log(`Canvas redimensionné : base=${baseScale.toFixed(3)} userZoom=${AppState.userZoom}`);
    },

    // Applique le scale final (base × zoom utilisateur) via le zoom natif Fabric.js
    applyZoom() {
      const canvas = AppState.fabricCanvas;
      if (!canvas) return;

      const finalScale = AppState.baseScale * AppState.userZoom;

      // setZoom() ajuste le viewportTransform : tout le rendu ET le hit-test
      // (objets + contrôles) restent calculés dans le même référentiel cohérent.
      canvas.setZoom(finalScale);

      // setDimensions ajuste la taille RÉELLE des éléments <canvas> (et donc
      // leur getBoundingClientRect), pour que la position du clic à l'écran
      // corresponde exactement à la taille affichée — plus de mapping CSS
      // séparé à gérer.
      canvas.setDimensions({
        width:  CONFIG.CANVAS_WIDTH  * finalScale,
        height: CONFIG.CANVAS_HEIGHT * finalScale,
      });

      canvas.calcOffset();
      canvas.requestRenderAll();

      const label = document.getElementById('zoom-level-label');
      if (label) label.textContent = `${Math.round(AppState.userZoom * 100)}%`;
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ÉVÉNEMENTS CANVAS
    // ─────────────────────────────────────────────────────────────────────────

    setupCanvasEvents() {
      const canvas = AppState.fabricCanvas;

      // Activer/désactiver le bouton "Supprimer"
      canvas.on('selection:created', (e) => {
        const btn = document.getElementById('btn-delete-selected');
        if (btn) btn.disabled = false;
        
        // Ouvrir automatiquement la section correspondante dans l'accordéon
        if (window.AccordionManager && typeof window.AccordionManager.handleAutoOpenOnSelection === 'function') {
          window.AccordionManager.handleAutoOpenOnSelection(e);
        }
      });

      canvas.on('selection:updated', (e) => {
        const btn = document.getElementById('btn-delete-selected');
        if (btn) btn.disabled = false;
        
        // Ouvrir automatiquement la section correspondante dans l'accordéon
        if (window.AccordionManager && typeof window.AccordionManager.handleAutoOpenOnSelection === 'function') {
          window.AccordionManager.handleAutoOpenOnSelection(e);
        }
      });

      canvas.on('selection:cleared', () => {
        const btn = document.getElementById('btn-delete-selected');
        if (btn) btn.disabled = true;
      });

      // Sauvegarder automatiquement à chaque modification
      canvas.on('object:modified', () => this.saveCurrentView());
      canvas.on('object:added',    () => this.saveCurrentView());
      canvas.on('object:removed',  () => this.saveCurrentView());

      // ─────────────────────────────────────────────────────────────────────
      // CONTRAINTE DE DÉPLACEMENT + ZONES POINTILLÉES (style Custom Ink)
      // Les zones n'apparaissent que pendant le déplacement/redimensionnement
      // ─────────────────────────────────────────────────────────────────────
      canvas.on('object:moving', (e) => {
        if (e.target && !e.target.isZoneIndicator) {
          this.showZoneGuides();
          this.constrainObjectToZone(e.target);
        }
      });

      canvas.on('object:scaling', (e) => {
        if (e.target && !e.target.isZoneIndicator) {
          this.showZoneGuides();
          this.constrainObjectToZone(e.target);

          // Pendant le redimensionnement : masquer les 4 icônes et n'afficher
          // que le cadre, en pointillé, pour ne pas surcharger visuellement
          // l'action en cours.
          if (e.target.hasControls !== false) {
            e.target.set({
              hasControls: false,
              borderDashArray: [6, 6],
            });
            e.target.canvas.requestRenderAll();
          }
        }
      });

      canvas.on('object:rotating', (e) => {
        if (e.target && !e.target.isZoneIndicator) {
          this.showZoneGuides();

          // Même comportement pendant la rotation, pour rester cohérent
          if (e.target.hasControls !== false) {
            e.target.set({
              hasControls: false,
              borderDashArray: [6, 6],
            });
            e.target.canvas.requestRenderAll();
          }
        }
      });

      // Restaure les icônes + le cadre plein dès le relâchement de la souris,
      // que l'action ait été un redimensionnement, une rotation ou un simple
      // déplacement.
      canvas.on('mouse:up', () => {
        this.hideZoneGuides();
        this.restoreObjectControls();
      });

      canvas.on('object:modified', (e) => {
        if (e.target && !e.target.isZoneIndicator) {
          this.hideZoneGuides();
        }
        this.restoreObjectControls(e.target);
      });
    },

    // Réaffiche les 4 icônes de contrôle et repasse le cadre de sélection en
    // trait plein (appelé au relâchement de la souris, après un redimensionnement
    // ou une rotation qui les avaient temporairement masquées).
    restoreObjectControls(target) {
      const canvas = AppState.fabricCanvas;
      if (!canvas) return;

      const objects = target ? [target] : canvas.getActiveObjects();
      let needsRender = false;

      objects.forEach((obj) => {
        if (obj && !obj.isZoneIndicator && (obj.hasControls === false || obj.borderDashArray)) {
          obj.set({
            hasControls: true,
            borderDashArray: null,
          });
          needsRender = true;
        }
      });

      if (needsRender) {
        canvas.requestRenderAll();
      }
    },


    setupZoomControls() {
      const btnIn    = document.getElementById('btn-zoom-in');
      const btnOut   = document.getElementById('btn-zoom-out');
      const btnReset = document.getElementById('btn-zoom-reset');
      const wrapper  = document.querySelector('.canvas-workspace .canvas-wrapper');

      const setZoom = (value) => {
        AppState.userZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));
        this.resizeCanvasToWorkspace();
      };

      btnIn?.addEventListener('click', () => setZoom(AppState.userZoom + ZOOM_STEP));
      btnOut?.addEventListener('click', () => setZoom(AppState.userZoom - ZOOM_STEP));
      btnReset?.addEventListener('click', () => setZoom(1));

      // Zoom à la molette (Ctrl/Cmd + scroll), pour rester cohérent avec le comportement navigateur
      wrapper?.addEventListener('wheel', (e) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
        setZoom(AppState.userZoom + delta);
      }, { passive: false });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // CORRECTION DU CACHE DE POSITION FABRIC AU SCROLL
    // Le canvas est affiché via transform:scale() CSS (voir applyZoom()).
    // Fabric.js calcule la position des clics à partir de son offset interne
    // (canvas._offset), recalculé uniquement au zoom ou au resize. Si la PAGE
    // défile (scroll), cet offset devient obsolète : les clics absolus (sur
    // les icônes de contrôle aux coins, ou pour sélectionner un objet) tombent
    // alors à côté de leur cible réelle, ce qui peut désélectionner l'objet
    // au lieu de déclencher l'action attendue. Le drag/déplacement n'est lui
    // pas affecté car Fabric raisonne en delta relatif, pas en position absolue.
    // On force donc un recalcul à chaque scroll (page + tout ancêtre scrollable).
    // ─────────────────────────────────────────────────────────────────────────

    setupScrollOffsetFix() {
      const recalcOffset = () => {
        if (AppState.fabricCanvas) {
          AppState.fabricCanvas.calcOffset();
        }
      };

      // Scroll de la fenêtre globale
      window.addEventListener('scroll', recalcOffset, { passive: true });

      // Scroll de tout conteneur parent scrollable (ex: panneau latéral, workspace)
      let el = document.querySelector('.canvas-workspace');
      while (el && el !== document.body) {
        el.addEventListener('scroll', recalcOffset, { passive: true });
        el = el.parentElement;
      }

      // Sécurité supplémentaire : recalcul juste avant chaque interaction souris
      // sur le canvas, au cas où un scroll aurait eu lieu sans déclencher l'event
      // (ex: scroll programmatique, changement d'accordéon ouvrant/fermant une section)
      const upperCanvasEl = AppState.fabricCanvas?.upperCanvasEl;
      upperCanvasEl?.addEventListener('mousedown', recalcOffset, { capture: true });
      upperCanvasEl?.addEventListener('touchstart', recalcOffset, { capture: true, passive: true });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // CONTRAINTE DE ZONE
    // Empêche l'objet de sortir totalement de la zone éditable
    // Note : le clipping mask cache visuellement le débordement,
    //        mais cette contrainte améliore l'UX en guidant l'utilisateur.
    // ─────────────────────────────────────────────────────────────────────────

    constrainObjectToZone(obj) {
      const zone = this.getActiveZone(AppState.currentView);
      if (!zone || !obj) return;

      obj.setCoords();
      const bound = obj.getBoundingRect(true, true);

      let dx = 0;
      let dy = 0;

      if (bound.left < zone.x) {
        dx = zone.x - bound.left;
      } else if (bound.left + bound.width > zone.x + zone.w) {
        dx = (zone.x + zone.w) - (bound.left + bound.width);
      }

      if (bound.top < zone.y) {
        dy = zone.y - bound.top;
      } else if (bound.top + bound.height > zone.y + zone.h) {
        dy = (zone.y + zone.h) - (bound.top + bound.height);
      }

      if (dx !== 0 || dy !== 0) {
        obj.left += dx;
        obj.top += dy;
        obj.setCoords();
      }
    },

    getZonesList(view) {
      const raw = AppState.editableZones[view || AppState.currentView];
      if (!raw) return [];
      if (Array.isArray(raw)) return raw;
      return [{ ...raw, id: raw.id || 'main', label: raw.label || 'Zone' }];
    },

    clearZoneIndicators() {
      const canvas = AppState.fabricCanvas;
      if (!canvas) return;
      canvas.getObjects()
        .filter(o => o.isZoneIndicator)
        .forEach(o => canvas.remove(o));
    },

    showZoneGuides() {
      if (AppState._zoneGuidesVisible) return;
      AppState._zoneGuidesVisible = true;
      this.drawEditableZoneIndicator(AppState.currentView);
      AppState.fabricCanvas.requestRenderAll();
    },

    hideZoneGuides() {
      if (!AppState._zoneGuidesVisible) return;
      AppState._zoneGuidesVisible = false;
      this.clearZoneIndicators();
      if (AppState.fabricCanvas) {
        AppState.fabricCanvas.requestRenderAll();
      }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ONGLETS DE VUES
    // ─────────────────────────────────────────────────────────────────────────

    setupViewTabs() {
      document.querySelectorAll('.view-thumbnail-btn').forEach(tab => {
        tab.addEventListener('click', () => {
          const view = tab.dataset.view;
          if (view) this.switchView(view);
        });
      });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // CHARGEMENT D'UNE VUE
    // ─────────────────────────────────────────────────────────────────────────

    loadView(view) {
      // 🔥 Activer le flag de chargement pour bloquer les sauvegardes automatiques
      AppState._isLoadingView = true;
      
      Utils.toggleCanvasLoader(true);
      AppState._zoneGuidesVisible = false;
      Utils.log(`[CanvasManager] Début loadView pour "${view}"`);

      const canvas = AppState.fabricCanvas;
      if (!canvas) {
        console.error('[CanvasManager] Erreur : Canvas non initialisé');
        Utils.toggleCanvasLoader(false);
        AppState._isLoadingView = false; // 🔥 Réactiver les sauvegardes
        return;
      }

      try {
        canvas.clear();
        canvas.backgroundColor = 'transparent';

        let backgroundUrl = AppState.viewImages[view];
        
        // Nettoyage de l'URL
        if (backgroundUrl && backgroundUrl.startsWith('//')) {
          backgroundUrl = 'https:' + backgroundUrl;
        }

        const isUrlValid = backgroundUrl && 
                         backgroundUrl !== '' && 
                         backgroundUrl !== 'undefined' && 
                         backgroundUrl !== 'null' &&
                         backgroundUrl.length > 5;

        if (isUrlValid) {
          Utils.log(`[CanvasManager] Chargement image de fond : ${backgroundUrl}`);
          
          const tryLoad = (withCors) => {
            const opts = withCors ? { crossOrigin: 'anonymous' } : {};
            
            // Timeout de sécurité pour le chargement de l'image (10s)
            const imageLoadTimeout = setTimeout(() => {
              console.warn(`[CanvasManager] Timeout chargement image pour "${view}" (cors=${withCors})`);
              if (withCors) {
                tryLoad(false);
              } else {
                this.loadViewWithoutBackground(view);
              }
            }, 10000);

            fabric.Image.fromURL(
              backgroundUrl,
              (img) => {
                clearTimeout(imageLoadTimeout);

                if (!img || !img.width) {
                  if (withCors) {
                    Utils.log(`[CanvasManager] Échec CORS ou image invalide, essai sans CORS...`);
                    tryLoad(false);
                  } else {
                    console.error(`[CanvasManager] Impossible de charger l'image : ${backgroundUrl}`);
                    this.loadViewWithoutBackground(view);
                  }
                  return;
                }

                // Calcul du scale avec sécurité
                const scaleX = CONFIG.CANVAS_WIDTH  / img.width;
                const scaleY = CONFIG.CANVAS_HEIGHT / img.height;
                const scale = Math.min(scaleX, scaleY);

                if (isNaN(scale) || !isFinite(scale)) {
                  console.error('[CanvasManager] Erreur de calcul du scale (image corrompue ?)');
                  this.loadViewWithoutBackground(view);
                  return;
                }

                img.set({
                  scaleX: scale,
                  scaleY: scale,
                  originX: 'center',
                  originY: 'center',
                  left: CONFIG.CANVAS_WIDTH / 2,
                  top:  CONFIG.CANVAS_HEIGHT / 2,
                  selectable: false,
                  evented:    false,
                  lockMovementX: true,
                  lockMovementY: true,
                });

                canvas.setBackgroundImage(img, () => {
                  this.restoreViewObjects(view, () => {
                    canvas.renderAll();
                    Utils.toggleCanvasLoader(false);
                    AppState._isLoadingView = false; // 🔥 Réactiver les sauvegardes
                    Utils.log(`[CanvasManager] Vue "${view}" chargée avec succès`);
                    window.dispatchEvent(new CustomEvent('configurator:view-loaded', { detail: { view } }));
                  });
                });
              },
              opts
            );
          };
          tryLoad(true);
        } else {
          Utils.log(`[CanvasManager] Aucune image de fond valide pour "${view}", chargement vide.`);
          this.loadViewWithoutBackground(view);
        }
      } catch (err) {
        console.error(`[CanvasManager] Erreur critique dans loadView :`, err);
        Utils.toggleCanvasLoader(false);
        AppState._isLoadingView = false; // 🔥 Réactiver les sauvegardes même en cas d'erreur
      }
    },

    /**
     * Fallback quand il n'y a pas d'image de fond
     */
    loadViewWithoutBackground(view) {
      const canvas = AppState.fabricCanvas;
      if (!canvas) return;
      
      this.restoreViewObjects(view, () => {
        canvas.renderAll();
        Utils.toggleCanvasLoader(false);
        AppState._isLoadingView = false; // 🔥 Réactiver les sauvegardes
        Utils.log(`[CanvasManager] Vue "${view}" chargée (sans fond)`);
        window.dispatchEvent(new CustomEvent('configurator:view-loaded', { detail: { view } }));
      });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // CLIPPING MASK — APPROCHE PAR OBJET
    //
    // IMPORTANT : Le clipPath au niveau du canvas (canvas.clipPath) bloque
    // les événements de souris sur les objets Fabric.js (sélection, déplacement).
    // On applique donc le clip SUR CHAQUE OBJET individuellement à l'ajout.
    //
    // applyCanvasClipPath() : ne fait plus rien (conservé pour compatibilité)
    // applyClipPathToObject() : applique le clip sur un objet donné
    // applyClipPathToAllObjects() : re-applique sur tous les objets (changement de vue)
    // ─────────────────────────────────────────────────────────────────────────

    applyCanvasClipPath(view) {
      // Ne plus appliquer de clipPath au niveau du canvas —
      // cela cassait la sélection et le déplacement des objets.
      // Le clip est maintenant appliqué objet par objet via applyClipPathToObject().
      Utils.log(`applyCanvasClipPath ignoré pour vue "${view}" (clip géré par objet)`);
    },

    // Crée un rect de clip pour la zone éditable de la vue courante
   _makeClipRect(view) {
      const zone = this._getActiveZone(view || AppState.currentView);
      if (!zone) return null;
      const resolvedZone = this.resolveZone(zone, view);
      return new fabric.Rect({
        left: resolvedZone.x,
        top: resolvedZone.y,
        width: resolvedZone.w,
        height: resolvedZone.h,
        absolutePositioned: true, // coordonnées absolues dans le canvas
      });
    },

    // Applique le clipPath sur un objet donné (appelé après chaque add)
    applyClipPathToObject(obj, view) {
      const clip = this._makeClipRect(view || AppState.currentView);
      if (clip) obj.clipPath = clip;
    },

    // Re-applique le clipPath sur tous les objets éditables du canvas
    applyClipPathToAllObjects(view) {
      const canvas = AppState.fabricCanvas;
      if (!canvas) return;
      canvas.getObjects().forEach(obj => {
        if (obj.selectable !== false && !obj.isZoneIndicator) {
          this.applyClipPathToObject(obj, view);
        }
      });
      canvas.requestRenderAll();
      Utils.log(`ClipPath re-appliqué sur tous les objets de la vue "${view}"`);
    },

    // Alias pour compatibilité avec phase1.js / phase2.js
    // qui appellent CanvasManager.applyClipPath(obj)
    applyClipPath(obj) {
      this.applyClipPathToObject(obj, AppState.currentView);
    },

    // ─────────────────────────────────────────────────────────────────────────
    // INDICATEUR VISUEL DE ZONE ÉDITABLE (rectangle pointillé)
    // Ce rectangle est non-interactif et sert de guide visuel pour l'utilisateur
    // ─────────────────────────────────────────────────────────────────────────

    drawEditableZoneIndicator(view) {
      const canvas = AppState.fabricCanvas;
      const zones = this.getZonesList(view);
      if (!zones.length) return;

      zones.forEach(zone => {
        const isActive = zone.id === AppState.activeZone;

        const resolvedZone = this.resolveZone(zone, view);

        const rect = new fabric.Rect({
          left: resolvedZone.x,
          top: resolvedZone.y,
          width: resolvedZone.w,
          height: resolvedZone.h,
          fill: 'transparent',
          stroke: '#000000',
          strokeWidth: isActive ? 1.5 : 1,
          selectable: false,
          evented: false,
          isZoneIndicator: true,
          zoneId: zone.id,
          excludeFromExport: true,
        });

        const label = new fabric.Text(zone.label || 'Zone', {
          left: resolvedZone.x + 8,
          top: resolvedZone.y + 6,
          fontSize: 13,
          fontFamily: 'Arial, sans-serif',
          fontWeight: '600',
          fill: isActive ? '#4A90E2' : '#666666',
          selectable: false,
          evented: false,
          isZoneIndicator: true,
          zoneId: zone.id,
          excludeFromExport: true,
        });

        canvas.add(rect);
        canvas.add(label);
        if (canvas.sendObjectToBack) {
          canvas.sendObjectToBack(rect);
        }
      });
    },

    setActiveZone(zoneId, view) {
      AppState.activeZone = zoneId;
      if (AppState._zoneGuidesVisible) {
        this.clearZoneIndicators();
        this.drawEditableZoneIndicator(view);
        AppState.fabricCanvas.renderAll();
      }
    },

    _getActiveZone(view) {
      const zones = AppState.editableZones[view];
      if (!zones) return null;
      if (Array.isArray(zones)) {
        return zones.find(z => z.id === AppState.activeZone) || zones[0];
      }
      return zones;
    },

    getActiveZone(view) {
      const v = view || AppState.currentView;
      const zone = this._getActiveZone(v);
      if (!zone) return null;
      // ⚠️ Toujours renvoyer la zone résolue (coordonnées absolues canvas),
      // pour que tout positionnement d'objet corresponde exactement
      // au rectangle pointillé affiché à l'utilisateur.
      return this.resolveZone(zone, v);
    },

    // _makeClipRect(view) {
    //   const zone = this._getActiveZone(view || AppState.currentView);
    //   if (!zone) return null;
    //   const resolvedZone = this.resolveZone(zone, view);
    //   return new fabric.Rect({
    //     left: resolvedZone.x,
    //     top: resolvedZone.y,
    //     width: resolvedZone.w,
    //     height: resolvedZone.h,
    //     absolutePositioned: true, // coordonnées absolues dans le canvas
    //   });
    // },

    // ─────────────────────────────────────────────────────────────────────────
    // SAUVEGARDE DE LA VUE COURANTE
    // Filtre les objets non-interactifs (indicateur de zone, etc.)
    // ─────────────────────────────────────────────────────────────────────────

    saveCurrentView() {
      // 🔥 Ne pas sauvegarder si on est en train de charger une vue
      if (AppState._isLoadingView) {
        console.log(`⏸️ [SAVE] Sauvegarde bloquée : chargement de vue en cours`);
        return;
      }
      
      const view   = AppState.currentView;
      const canvas = AppState.fabricCanvas;
      
      if (!canvas) {
        console.error(`❌ [SAVE] Canvas non disponible !`);
        return;
      }

      // Garder uniquement les objets "utilisateur" (selectable et pas l'indicateur)
      const objects = canvas.getObjects().filter(obj =>
        obj.selectable !== false && !obj.isZoneIndicator
      );
      
      console.log(`💾 [SAVE] Sauvegarde de "${view}" : ${objects.length} objets sur le canvas`);
      objects.forEach((obj, index) => {
        console.log(`   Objet ${index + 1}:`, obj.type, obj.text || obj.src?.substring(0, 30) || '');
      });

      // Sérialiser en JSON Fabric.js (inclut toutes les propriétés)
      AppState.viewsData[view].objects = objects.map(obj => obj.toJSON([
        'selectable', 'evented', 'isZoneIndicator', 'clipPath',
      ]));

      console.log(`✅ [SAVE] Vue "${view}" sauvegardée — ${AppState.viewsData[view].objects.length} objet(s) en mémoire`);
      Utils.log(`Vue "${view}" sauvegardée — ${objects.length} objet(s)`);
    },

    // ─────────────────────────────────────────────────────────────────────────
    // RESTAURATION DES OBJETS D'UNE VUE
    // CORRECTION : callback appelé même si la vue est vide
    // ─────────────────────────────────────────────────────────────────────────

    restoreViewObjects(view, callback) {
      const viewData = AppState.viewsData[view];

      console.log(`📥 [RESTORE] Tentative de restauration vue "${view}"`);
      console.log(`📥 [RESTORE] Données disponibles:`, viewData);
      console.log(`📥 [RESTORE] Nombre d'objets à restaurer:`, viewData?.objects?.length || 0);

      if (!viewData || !viewData.objects || viewData.objects.length === 0) {
        console.log(`📥 [RESTORE] Vue "${view}" vide, rien à restaurer`);
        if (callback) callback();
        return;
      }

      const canvas = AppState.fabricCanvas;
      if (!canvas) {
        console.error(`❌ [RESTORE] Canvas non disponible !`);
        if (callback) callback();
        return;
      }

      try {
        console.log(`📥 [RESTORE] Appel à fabric.util.enlivenObjects avec ${viewData.objects.length} objets...`);
        
        fabric.util.enlivenObjects(viewData.objects, (enlivenedObjects) => {
          console.log(`📥 [RESTORE] ${enlivenedObjects.length} objets "enlivened" pour vue "${view}"`);
          
          enlivenedObjects.forEach((obj, index) => {
            console.log(`📥 [RESTORE] Ajout objet ${index + 1}:`, obj.type, obj.text || '');
            this.applyClipPathToObject(obj, view);
            canvas.add(obj);
          });
          
          canvas.renderAll();
          console.log(`✅ [RESTORE] Vue "${view}" restaurée avec succès - ${enlivenedObjects.length} objets ajoutés`);
          Utils.log(`[CanvasManager] ${enlivenedObjects.length} objet(s) restauré(s) sur vue "${view}"`);
          
          if (callback) callback();
        }, 'fabric');
      } catch (err) {
        console.error(`❌ [RESTORE] Erreur lors de la restauration des objets :`, err);
        if (callback) callback();
      }
    },

    reloadCurrentViewObjects(callback) {
      const view   = AppState.currentView;
      const canvas = AppState.fabricCanvas;
      if (!canvas) return;

      canvas.getObjects()
        .filter(obj => obj.selectable !== false && !obj.isZoneIndicator)
        .forEach(obj => canvas.remove(obj));

      canvas.discardActiveObject();

      this.restoreViewObjects(view, () => {
        canvas.requestRenderAll();
        if (callback) callback();
      });
    },

    getDisplayScale() {
      // Le canvas est désormais dimensionné via le zoom natif Fabric
      // (setZoom + setDimensions) : son échelle d'affichage réelle est
      // directement canvas.getZoom(), plus fiable que de mesurer le wrapper.
      const canvas = AppState.fabricCanvas;
      if (canvas) return canvas.getZoom();

      const wrapper = document.querySelector('.canvas-workspace .canvas-wrapper');
      if (!wrapper || !wrapper.clientWidth) return 1;
      return wrapper.clientWidth / CONFIG.CANVAS_WIDTH;
    },

    // ─────────────────────────────────────────────────────────────────────────
    // CHANGEMENT DE VUE
    // ─────────────────────────────────────────────────────────────────────────

    switchView(view) {
      if (view === AppState.currentView) {
        console.log(`🔄 [SWITCH] Déjà sur la vue "${view}", rien à faire`);
        return;
      }

      const previousView = AppState.currentView;
      console.log(`🔄 [SWITCH] Changement de vue : "${previousView}" → "${view}"`);

      // 1. Sauvegarder la vue actuelle avant de changer
      console.log(`🔄 [SWITCH] Étape 1 : Sauvegarde de la vue "${previousView}"`);
      this.saveCurrentView();
      
      // Vérifier que la sauvegarde a bien fonctionné
      const savedObjects = AppState.viewsData[previousView]?.objects || [];
      console.log(`🔄 [SWITCH] Étape 1 DONE : ${savedObjects.length} objets sauvegardés pour "${previousView}"`);

      // 2. Mettre à jour l'état
      console.log(`🔄 [SWITCH] Étape 2 : Mise à jour de l'état global`);
      AppState.currentView = view;

      // 3. Mettre à jour l'UI des onglets
      console.log(`🔄 [SWITCH] Étape 3 : Mise à jour UI des onglets`);
      document.querySelectorAll('.view-thumbnail-btn').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.view === view);
      });

      // 4. Charger la nouvelle vue (avec son clipPath propre)
      console.log(`🔄 [SWITCH] Étape 4 : Chargement de la vue "${view}"`);
      this.loadView(view);

      console.log(`✅ [SWITCH] Basculement de "${previousView}" vers "${view}" terminé`);
      Utils.log(`Basculement vers vue "${view}"`);
    },

    // ─────────────────────────────────────────────────────────────────────────
    // AJOUT D'UNE IMAGE UPLOADÉE AU CANVAS
    // ─────────────────────────────────────────────────────────────────────────

    addImageToCanvas(imageDataUrl) {
      Utils.toggleCanvasLoader(true);

      fabric.Image.fromURL(imageDataUrl, (img) => {
        if (!img) {
          console.error('[Canvas] Échec du chargement de l\'image uploadée.');
          alert('Impossible de charger cette image. Essayez un autre format ou fichier.');
          Utils.toggleCanvasLoader(false);
          return;
        }

        const zone = CanvasManager.getActiveZone(AppState.currentView);
        if (!zone) {
          Utils.toggleCanvasLoader(false);
          return;
        }

        // Calculer la taille max (100 % de la zone éditable pour la hauteur)
        const maxWidth  = zone.w;
        const maxHeight = zone.h;

        // Redimensionner proportionnellement
        const scaleX = maxWidth  / img.width;
        const scaleY = maxHeight / img.height;
        const scale  = Math.min(scaleX, scaleY); // Prend toute la hauteur disponible (ou largeur si plus contraignante)

        img.set({
          scaleX:  scale,
          scaleY:  scale,
          // Centrer dans la zone éditable
          left:    zone.x + (zone.w / 2),
          top:     zone.y + (zone.h / 2),
          originX: 'center',
          originY: 'center',
        });

        // Appliquer le clip sur l'image (pas au niveau canvas)
        this.applyClipPathToObject(img, AppState.currentView);

        AppState.fabricCanvas.add(img);
        AppState.fabricCanvas.setActiveObject(img);
        AppState.fabricCanvas.requestRenderAll();

        // Activer les contrôles personnalisés
        img.set({
          hasControls: true,
          hasBorders: true,
          lockScalingFlip: true
        });

        Utils.toggleCanvasLoader(false);
        Utils.log('Image ajoutée au canvas');
      }, { crossOrigin: 'anonymous' });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SUPPRESSION DE L'OBJET SÉLECTIONNÉ
    // ─────────────────────────────────────────────────────────────────────────

    deleteSelected() {
      const canvas        = AppState.fabricCanvas;
      const activeObjects = canvas.getActiveObjects();

      if (activeObjects.length === 0) return;

      activeObjects.forEach(obj => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.requestRenderAll();

      Utils.log(`${activeObjects.length} objet(s) supprimé(s)`);
    },

    // ─────────────────────────────────────────────────────────────────────────
    // DUPLICATION DE L'OBJET SÉLECTIONNÉ
    // ─────────────────────────────────────────────────────────────────────────

    duplicateSelected(target) {
      const canvas = AppState.fabricCanvas;
      const source = target || canvas.getActiveObject();
      if (!source) return;

      const placeClone = (cloned) => {
        cloned.set({
          left: source.left + 20,
          top: source.top + 20,
          evented: true,
          hasControls: true,
          hasBorders: true,
          lockScalingFlip: true
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.requestRenderAll();
        Utils.log('Objet dupliqué');
      };

      // Fabric v5 : clone(callback) — Fabric v6 : clone() retourne une Promise
      const result = source.clone(placeClone);
      if (result && typeof result.then === 'function') {
        result.then(placeClone);
      }
    },

    // ─────────────────────────────────────────────────────────────────────────
    // EFFACEMENT DE LA VUE COURANTE
    // ─────────────────────────────────────────────────────────────────────────

    clearCurrentView() {
      const view = AppState.currentView;
      const ok   = window.confirm(
        `Effacer tous les designs de la vue ${view.toUpperCase()} ?`
      );
      if (!ok) return;

      const canvas  = AppState.fabricCanvas;
      const objects = canvas.getObjects().filter(obj =>
        obj.selectable !== false && !obj.isZoneIndicator
      );

      objects.forEach(obj => canvas.remove(obj));
      canvas.requestRenderAll();

      // Vider le stockage de cette vue
      AppState.viewsData[view].objects = [];

      Utils.log(`Vue "${view}" effacée`);
    },

    // ─────────────────────────────────────────────────────────────────────────
    // EXPORT HD DE TOUTES LES VUES MODIFIÉES
    //
    // CORRECTION MAJEURE :
    // L'export est séquentiel et entièrement basé sur Promises.
    // Pour chaque vue, on :
    //   1. Vide le canvas
    //   2. Charge le background en attendant la callback
    //   3. Restaure les objets en attendant enlivenObjects
    //   4. Appelle requestRenderAll() et attend le prochain frame
    //   5. ALORS seulement on appelle toDataURL()
    // Cela évite la race condition où toDataURL() s'exécutait avant le rendu.
    // ─────────────────────────────────────────────────────────────────────────

    async exportAllViews() {
      const images = {};
      const views  = ['front', 'back', 'left', 'right'];

      // Sauvegarder la vue actuelle pour la restaurer après l'export
      const originalView = AppState.currentView;
      this.saveCurrentView();

      for (const view of views) {
        const viewData = AppState.viewsData[view];

        // Ignorer les vues sans objets utilisateur
        if (!viewData.objects || viewData.objects.length === 0) {
          Utils.log(`Vue "${view}" vide — ignorée à l'export`);
          continue;
        }

        // Exporter cette vue
        const dataUrl = await this.exportSingleView(view);
        if (dataUrl) {
          images[view] = dataUrl;
          Utils.log(`Vue "${view}" exportée (${Math.round(dataUrl.length / 1024)} Ko)`);
        }
      }

      // Restaurer la vue originale
      this.loadView(originalView);

      return images;
    },

    // ─────────────────────────────────────────────────────────────────────────
    // EXPORT D'UNE VUE UNIQUE (Promise)
    // ─────────────────────────────────────────────────────────────────────────

    exportSingleView(view) {
      return new Promise((resolve) => {
        const canvas     = AppState.fabricCanvas;
        const viewData   = AppState.viewsData[view];
        const bgUrl      = AppState.viewImages[view];

        // Vider le canvas silencieusement
        canvas.clear();
        canvas.backgroundColor = '#ffffff';

        // Supprimer le clipPath pour l'export (on veut le produit complet)
        canvas.clipPath = null;

        const finishExport = () => {
          // Restaurer les objets de cette vue
          if (!viewData.objects || viewData.objects.length === 0) {
            resolve(null);
            return;
          }

          fabric.util.enlivenObjects(viewData.objects, (objects) => {
            objects.forEach(obj => canvas.add(obj));

            // Attendre le prochain frame pour s'assurer que tout est rendu
            canvas.requestRenderAll();

            requestAnimationFrame(() => {
              const dataUrl = canvas.toDataURL({
                format:     'png',
                quality:    1,
                multiplier: 2, // 2x pour la qualité d'impression
              });
              resolve(dataUrl);
            });
          });
        };

        // Charger le background si disponible
        if (bgUrl && bgUrl !== '' && bgUrl !== 'undefined' && bgUrl !== 'null') {
          // Fix pour les URLs Shopify sans protocole
          const fullBgUrl = bgUrl.startsWith('//') ? 'https:' + bgUrl : bgUrl;
          
          fabric.Image.fromURL(
            fullBgUrl,
            (img) => {
              if (!img) {
                console.warn(`[Export] Impossible de charger le background pour l'export "${view}" :`, fullBgUrl);
                finishExport();
                return;
              }
              // Mode CONTAIN pour l'export aussi (toute l'image visible)
              const scaleX = CONFIG.CANVAS_WIDTH  / img.width;
              const scaleY = CONFIG.CANVAS_HEIGHT / img.height;
              const scale = Math.min(scaleX, scaleY);
              
              img.set({
                scaleX: scale,
                scaleY: scale,
                originX: 'center',
                originY: 'center',
                left: CONFIG.CANVAS_WIDTH / 2,
                top:  CONFIG.CANVAS_HEIGHT / 2,
                selectable: false,
                evented:    false,
              });
              canvas.setBackgroundImage(img, finishExport);
            },
            { crossOrigin: 'anonymous' }
          );
        } else {
          finishExport();
        }
      });
    },
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // GESTION DES PRODUITS
  // ══════════════════════════════════════════════════════════════════════════════

  const ProductManager = {
    init() {
      document.querySelectorAll('.product-card').forEach(card => {
        const btn = card.querySelector('.btn-select-product');
        if (btn) btn.addEventListener('click', () => this.selectProduct(card));
      });
    },

    selectProduct(cardElement) {
      const productData = {
        id:    cardElement.dataset.productId,
        title: cardElement.dataset.productTitle,
        price: cardElement.dataset.productPrice || "0.00",
        viewImages: {
          front: cardElement.dataset.viewFront,
          back:  cardElement.dataset.viewBack,
          left:  cardElement.dataset.viewLeft,
          right: cardElement.dataset.viewRight,
        },
        editableZones: Utils.parseEditableZones(cardElement.dataset.editableZones),
      };

      // 🔍 Debug : Afficher les données produit récupérées
      console.log('[ProductManager] 🔍 Produit sélectionné :');
      console.log('   id:', productData.id);
      console.log('   title:', productData.title);
      console.log('   price:', productData.price, '(type:', typeof productData.price + ')');
      console.log('   dataset brut:', {
        productId: cardElement.dataset.productId,
        productTitle: cardElement.dataset.productTitle,
        productPrice: cardElement.dataset.productPrice,
      });

      // Validation minimum : l'image Front est obligatoire
      if (!productData.viewImages.front || productData.viewImages.front === '') {
        alert('Ce produit n\'est pas encore configuré. Image de la vue Face manquante.');
        return;
      }

      // Réinitialiser l'état des vues
      AppState.viewsData = {
        front: { objects: [] },
        back:  { objects: [] },
        left:  { objects: [] },
        right: { objects: [] },
      };
      AppState.currentView = 'front';
      AppState._zoneGuidesVisible = false;

      // Mettre à jour l'état global
      AppState.selectedProduct = productData;
      AppState.viewImages      = productData.viewImages;

      Utils.log('Produit sélectionné avec images :', AppState.viewImages);

      // Charger les zones éditables depuis les metafields (ou garder les défauts)
      if (productData.editableZones) {
        AppState.editableZones = {
          ...AppState.editableZones,
          ...productData.editableZones,
        };
      }

      // Afficher l'interface d'édition
      this.showEditor();

      // Initialiser ou réinitialiser le canvas
      if (AppState.fabricCanvas) {
        AppState.fabricCanvas.dispose();
        AppState.fabricCanvas = null;
      }
      CanvasManager.init();
    },

    showEditor() {
      document.querySelector('.configurateur-product-selector').style.display = 'none';
      document.getElementById('editor-section').style.display = 'block';

      const titleEl = document.getElementById('selected-product-title');
      if (titleEl && AppState.selectedProduct) {
        titleEl.textContent = AppState.selectedProduct.title;
      }

      // Mettre à jour les miniatures des vignettes de vues
      const views = ['front', 'back', 'left', 'right'];
      views.forEach(view => {
        const btn = document.getElementById(`btn-view-${view}`);
        const img = document.getElementById(`view-thumbnail-${view}`);
        const url = AppState.viewImages[view];
        
        if (btn && img) {
          if (url && url !== 'undefined' && url !== 'null' && url !== '') {
            img.src = url.startsWith('//') ? 'https:' + url : url;
            btn.style.display = 'flex';
          } else {
            btn.style.display = 'none';
          }
        }
      });

      // Réinitialiser les onglets
      document.querySelectorAll('.view-thumbnail-btn').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.view === 'front');
      });
    },

    backToSelector() {
      const hasDesigns = Object.values(AppState.viewsData).some(
        view => view.objects.length > 0
      );

      if (hasDesigns) {
        const ok = window.confirm('Quitter ? Vos modifications seront perdues.');
        if (!ok) return;
      }

      // Réinitialiser
      AppState.selectedProduct = null;
      AppState.viewsData = {
        front: { objects: [] },
        back:  { objects: [] },
        left:  { objects: [] },
        right: { objects: [] },
      };
      AppState.currentView = 'front';
      AppState._zoneGuidesVisible = false;

      if (AppState.fabricCanvas) {
        AppState.fabricCanvas.dispose();
        AppState.fabricCanvas = null;
      }

      document.getElementById('editor-section').style.display = 'none';
      document.querySelector('.configurateur-product-selector').style.display = 'block';

      const feedbackEl = document.getElementById('submission-feedback');
      if (feedbackEl) feedbackEl.style.display = 'none';
    },
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // GESTION DE L'UPLOAD D'IMAGES
  // ══════════════════════════════════════════════════════════════════════════════

  const UploadManager = {
    init() {
      const input      = document.getElementById('image-upload-input');
      const uploadZone = document.getElementById('upload-zone');

      if (input) {
        input.addEventListener('change', (e) => {
          this.handleFileSelect(e.target.files[0]);
          // Reset l'input pour permettre de re-sélectionner le même fichier
          e.target.value = '';
        });
      }

      if (uploadZone) {
        uploadZone.addEventListener('dragover', (e) => {
          e.preventDefault();
          uploadZone.classList.add('drag-over');
        });

        uploadZone.addEventListener('dragleave', () => {
          uploadZone.classList.remove('drag-over');
        });

        uploadZone.addEventListener('drop', (e) => {
          e.preventDefault();
          uploadZone.classList.remove('drag-over');
          this.handleFileSelect(e.dataTransfer.files[0]);
        });
      }
    },

    handleFileSelect(file) {
      const validation = Utils.validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        CanvasManager.addImageToCanvas(e.target.result);
      };

      reader.onerror = () => {
        alert('Erreur lors de la lecture du fichier. Veuillez réessayer.');
      };

      reader.readAsDataURL(file);
    },
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // GESTION DE LA SOUMISSION DU DEVIS
  // ══════════════════════════════════════════════════════════════════════════════

  const SubmissionManager = {
    init() {
      const form = document.getElementById('devis-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleSubmit(form);
        });
      }
    },

    async handleSubmit(form) {
      if (AppState.isSubmitting) return;

      // Vérifier qu'au moins une vue a des objets
      const hasDesigns = Object.values(AppState.viewsData).some(
        view => view.objects.length > 0
      );

      if (!hasDesigns) {
        Utils.showFeedback(
          'error',
          'Aucun design détecté',
          'Ajoutez au moins un logo ou design sur une vue avant de demander un devis.'
        );
        return;
      }

      // Récupérer et valider les données du formulaire
      const formData = new FormData(form);
      const customer = {
        first_name: formData.get('first_name').trim(),
        last_name:  formData.get('last_name').trim(),
        email:      formData.get('email').trim(),
      };

      if (!customer.first_name || !customer.last_name || !customer.email) {
        Utils.showFeedback('error', 'Formulaire incomplet', 'Remplissez tous les champs obligatoires.');
        return;
      }

      // Vérifier que l'URL du microservice est configurée
      if (!CONFIG.API_ENDPOINT) {
        Utils.showFeedback(
          'error',
          'Erreur de configuration',
          'L\'URL du microservice n\'est pas configurée. Contactez l\'administrateur du site.'
        );
        console.error('[Submission] API_ENDPOINT manquant. Configurez microservice_api_url dans les settings du thème Shopify.');
        return;
      }

      AppState.isSubmitting = true;

      const submitBtn  = document.getElementById('btn-submit-devis');
      const originalTxt = submitBtn.textContent;
      submitBtn.textContent = '⏳ Export des designs...';
      submitBtn.disabled    = true;

      try {
        // 1. Sauvegarder la vue courante
        CanvasManager.saveCurrentView();

        // 2. Exporter toutes les vues modifiées en HD
        submitBtn.textContent = '⏳ Génération des maquettes...';
        const images = await CanvasManager.exportAllViews();

        if (Object.keys(images).length === 0) {
          Utils.showFeedback(
            'error',
            'Erreur d\'export',
            'Impossible d\'exporter vos designs. Veuillez réessayer.'
          );
          return;
        }

        // 3. Envoyer au microservice
        submitBtn.textContent = '⏳ Envoi en cours...';

        const payload = {
          customer,
          product_title: AppState.selectedProduct.title,
          product_id:    AppState.selectedProduct.id,
          product_price: AppState.selectedProduct.price || "0.00",
          images,
        };

        // 🔍 Debug : Afficher les données produit envoyées
        console.log('[Submission] 🔍 Données produit envoyées :');
        console.log('   product_title:', payload.product_title);
        console.log('   product_price:', payload.product_price, '(type:', typeof payload.product_price + ')');
        console.log('   product_id:', payload.product_id);
        console.log('   AppState.selectedProduct:', AppState.selectedProduct);

        await this.sendToBackend(payload, form, submitBtn, originalTxt);

      } catch (error) {
        console.error('[Submission] Erreur inattendue :', error);
        Utils.showFeedback(
          'error',
          '❌ Erreur inattendue',
          'Une erreur s\'est produite. Veuillez réessayer.'
        );
      } finally {
        // Toujours réactiver le bouton si on n'est pas en succès
        if (AppState.isSubmitting) {
          submitBtn.textContent = originalTxt;
          submitBtn.disabled    = false;
          AppState.isSubmitting = false;
        }
      }
    },

    async sendToBackend(payload, form, submitBtn, originalTxt) {
      try {
        const response = await fetch(CONFIG.API_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          Utils.showFeedback(
            'success',
            '✅ Demande envoyée !',
            data.message || 'Votre demande a bien été reçue. Notre équipe vous contactera sous 24–48h.'
          );

          form.reset();
          submitBtn.textContent = originalTxt;
          submitBtn.disabled    = false;
          AppState.isSubmitting = false;

        } else {
          Utils.showFeedback(
            'error',
            '❌ Erreur lors de l\'envoi',
            data.error || 'Une erreur est survenue. Veuillez réessayer.',
            data.errors || []
          );
        }

      } catch (error) {
        console.error('[Submission] Erreur réseau :', error);
        Utils.showFeedback(
          'error',
          '❌ Erreur de connexion',
          'Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.'
        );
      }
    },
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // CONTRÔLES DE L'ÉDITEUR
  // ══════════════════════════════════════════════════════════════════════════════

  const EditorControls = {
    init() {
      const btnBack = document.getElementById('btn-back-to-products');
      if (btnBack) btnBack.addEventListener('click', () => ProductManager.backToSelector());

      const btnDelete = document.getElementById('btn-delete-selected');
      if (btnDelete) btnDelete.addEventListener('click', () => CanvasManager.deleteSelected());

      const btnClear = document.getElementById('btn-clear-view');
      if (btnClear) btnClear.addEventListener('click', () => CanvasManager.clearCurrentView());
    },
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // GESTIONNAIRE D'ONGLETS (SIDEBAR GAUCHE)
  // ══════════════════════════════════════════════════════════════════════════════

  const TabManager = {
    init() {
      document.querySelectorAll('.nav-icon-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tabId = btn.dataset.tab;
          if (tabId) this.switchTab(tabId);
        });
      });
    },

    switchTab(tabId) {
      // Désactiver tous les boutons et panels
      document.querySelectorAll('.nav-icon-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
      });

      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === tabId);
      });

      Utils.log(`Changement d'onglet : ${tabId}`);
    }
  };


  // ══════════════════════════════════════════════════════════════════════════════
  // Calcule le rectangle réel de l'image dans le canvas (letterboxing inclus)
  // ══════════════════════════════════════════════════════════════════════════════
  CanvasManager.getImageBBoxInCanvas = function(view) {
    const canvas = AppState.fabricCanvas;
    const bg = canvas.backgroundImage;
    if (!bg) {
      // Pas d'image : on suppose qu'elle occupe tout le canvas
      return { left: 0, top: 0, width: CONFIG.CANVAS_WIDTH, height: CONFIG.CANVAS_HEIGHT };
    }
    const dispW = bg.width * bg.scaleX;
    const dispH = bg.height * bg.scaleY;
    return {
      left: (CONFIG.CANVAS_WIDTH - dispW) / 2,
      top: (CONFIG.CANVAS_HEIGHT - dispH) / 2,
      width: dispW,
      height: dispH
    };
  };

  // Convertit une zone en % vers des coordonnées canvas absolues
  // Si la zone fournit déjà x/y/w/h absolus (et pas de *Pct), on la renvoie telle quelle.
  CanvasManager.resolveZone = function(zone, view) {
    const hasPct = zone.xPct !== undefined && zone.yPct !== undefined &&
                   zone.wPct !== undefined && zone.hPct !== undefined;

    if (!hasPct) {
      // Zone déjà en coordonnées absolues (ex. zones par défaut codées en dur)
      return { ...zone };
    }

    const bbox = CanvasManager.getImageBBoxInCanvas(view);
    return {
      ...zone,
      x: bbox.left + zone.xPct * bbox.width,
      y: bbox.top  + zone.yPct * bbox.height,
      w: zone.wPct * bbox.width,
      h: zone.hPct * bbox.height
    };
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // ACCORDION MANAGER (Mappé sur les onglets pour la rétrocompatibilité)
  // ══════════════════════════════════════════════════════════════════════════════

  const AccordionManager = {
    init() {
      this.setupUploadHook();
    },

    openSection(groupId) {
      const groupToTabMap = {
        'group-upload': 'tab-upload',
        'group-text': 'tab-text',
        'group-cliparts': 'tab-cliparts',
        'group-layers': 'tab-layers',
        'group-devis': 'tab-devis',
        'group-help': 'tab-help'
      };
      
      const tabId = groupToTabMap[groupId];
      if (tabId && TabManager) {
        TabManager.switchTab(tabId);
      }
    },

    setupUploadHook() {
      const fileInput = document.getElementById('image-upload-input');
      if (fileInput) {
        fileInput.addEventListener('change', () => this.openSection('group-upload'));
      }
    },

    handleAutoOpenOnSelection(e) {
      if (!e.selected || !e.selected[0]) return;
      const obj = e.selected[0];

      if (obj.type === 'i-text' || obj.isWarpImage) {
        this.openSection('group-text');
      } else if (['rect', 'circle', 'triangle', 'polygon', 'line'].includes(obj.type)) {
        this.openSection('group-layers');
      } else if (obj.type === 'image' && !obj.isWarpImage) {
        this.openSection('group-upload');
      } else if (obj.type === 'text') { // Pour les cliparts (emojis)
        this.openSection('group-cliparts');
      }
    }
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // INITIALISATION GLOBALE
  // ══════════════════════════════════════════════════════════════════════════════

  function init() {
    if (typeof fabric === 'undefined') {
      console.error('[Init] Fabric.js non chargé. Vérifiez que fabric.min.js est bien inclus dans les assets.');
      return;
    }

    Utils.log('Démarrage du configurateur Massacre Officiel...');

    ProductManager.init();
    EditorControls.init();
    UploadManager.init();
    SubmissionManager.init();
    AccordionManager.init();
    TabManager.init();

    Utils.log('✅ Configurateur prêt.');
  }

  // Lancer quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // EXPOSITION GLOBALE POUR LES EXTENSIONS (Phase 1, Phase 2, etc.)
  // ══════════════════════════════════════════════════════════════════════════════
  
  window.AppState = AppState;
  window.CanvasManager = CanvasManager;
  window.ProductManager = ProductManager;
  window.UploadManager = UploadManager;
  window.AccordionManager = AccordionManager;
  window.TabManager = TabManager;

})();