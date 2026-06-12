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
      front: { x: 150, y: 100, w: 500, h: 400 },
      back:  { x: 150, y: 100, w: 500, h: 400 },
      left:  { x: 150, y: 100, w: 500, h: 400 },
      right: { x: 150, y: 100, w: 500, h: 400 },
    },

    // URLs des images de fond par vue
    viewImages: {
      front: null,
      back:  null,
      left:  null,
      right: null,
    },

    // Flag de soumission en cours
    isSubmitting: false,
  };

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

      // Créer l'instance Fabric.js
      AppState.fabricCanvas = new fabric.Canvas('customization-canvas', {
        width: CONFIG.CANVAS_WIDTH,
        height: CONFIG.CANVAS_HEIGHT,
        backgroundColor: '#f8f8f8',
        preserveObjectStacking: true,
        selection: true,
        // Garder les objets dans les limites du canvas
        centeredScaling: false,
      });

      Utils.log('Canvas Fabric.js initialisé');

      // Configurer les événements
      this.setupCanvasEvents();
      this.setupViewTabs();

      // Charger la vue initiale (Front)
      this.loadView('front');
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
      // CONTRAINTE DE DÉPLACEMENT DANS LA ZONE ÉDITABLE
      // Empêche l'utilisateur de sortir complètement de la zone
      // ─────────────────────────────────────────────────────────────────────
      canvas.on('object:moving', (e) => {
        this.constrainObjectToZone(e.target);
      });

      canvas.on('object:scaling', (e) => {
        this.constrainObjectToZone(e.target);
      });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // CONTRAINTE DE ZONE
    // Empêche l'objet de sortir totalement de la zone éditable
    // Note : le clipping mask cache visuellement le débordement,
    //        mais cette contrainte améliore l'UX en guidant l'utilisateur.
    // ─────────────────────────────────────────────────────────────────────────

    constrainObjectToZone(obj) {
      const zone = AppState.editableZones[AppState.currentView];
      if (!zone) return;

      const objBounds = obj.getBoundingRect();

      // Limites de la zone
      const zoneRight  = zone.x + zone.w;
      const zoneBottom = zone.y + zone.h;

      // Si l'objet sort complètement à droite
      if (objBounds.left > zoneRight - 20) {
        obj.left = zoneRight - 20;
      }
      // Si l'objet sort complètement à gauche
      if (objBounds.left + objBounds.width < zone.x + 20) {
        obj.left = zone.x + 20 - objBounds.width;
      }
      // Si l'objet sort complètement en bas
      if (objBounds.top > zoneBottom - 20) {
        obj.top = zoneBottom - 20;
      }
      // Si l'objet sort complètement en haut
      if (objBounds.top + objBounds.height < zone.y + 20) {
        obj.top = zone.y + 20 - objBounds.height;
      }

      obj.setCoords();
    },

    // ─────────────────────────────────────────────────────────────────────────
    // ONGLETS DE VUES
    // ─────────────────────────────────────────────────────────────────────────

    setupViewTabs() {
      document.querySelectorAll('.view-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const view = tab.dataset.view;
          if (view) this.switchView(view);
        });
      });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // CHARGEMENT D'UNE VUE
    // CORRECTION : loader désactivé APRÈS renderAll complet (fin de callback)
    // ─────────────────────────────────────────────────────────────────────────

    loadView(view) {
      Utils.toggleCanvasLoader(true);

      const canvas = AppState.fabricCanvas;
      if (!canvas) {
        console.error('[Canvas] Canvas non initialisé dans loadView');
        Utils.toggleCanvasLoader(false);
        return;
      }

      canvas.clear();
      canvas.backgroundColor = '#f8f8f8';

      let backgroundUrl = AppState.viewImages[view];
      
      // Fix pour les URLs Shopify sans protocole (//cdn.shopify.com/...)
      if (backgroundUrl && backgroundUrl.startsWith('//')) {
        backgroundUrl = 'https:' + backgroundUrl;
      }

      Utils.log(`Chargement de la vue "${view}" :`, backgroundUrl);

      if (backgroundUrl && backgroundUrl !== '' && backgroundUrl !== 'undefined' && backgroundUrl !== 'null') {
        // Tentative 1 : avec crossOrigin (requis pour l'export canvas)
        // Tentative 2 : sans crossOrigin (fallback pour les URLs externes sans CORS)
        const tryLoad = (withCors) => {
          const opts = withCors ? { crossOrigin: 'anonymous' } : {};
          fabric.Image.fromURL(
            backgroundUrl,
            (img) => {
              if (!img) {
                if (withCors) {
                  console.warn(`[Canvas] Échec CORS pour "${view}", retry sans crossOrigin...`);
                  tryLoad(false);
                } else {
                  console.error(`[Canvas] Échec du chargement de l'image de fond pour la vue "${view}" :`, backgroundUrl);
                  this.loadViewWithoutBackground(view);
                }
                return;
              }

              // Adapter l'image au canvas en couvrant toute la surface
              const scaleX = CONFIG.CANVAS_WIDTH  / img.width;
              const scaleY = CONFIG.CANVAS_HEIGHT / img.height;

              img.set({
                scaleX,
                scaleY,
                originX: 'left',
                originY: 'top',
                left: 0,
                top:  0,
                selectable: false,
                evented:    false,
                lockMovementX: true,
                lockMovementY: true,
              });

              canvas.setBackgroundImage(img, () => {
                // Appliquer le clipping mask de la zone éditable
                this.applyCanvasClipPath(view);

                // Dessiner le rectangle indicateur de zone
                this.drawEditableZoneIndicator(view);

                // Restaurer les objets de cette vue
                this.restoreViewObjects(view, () => {
                  canvas.renderAll();
                  Utils.toggleCanvasLoader(false);
                  Utils.log(`Vue "${view}" chargée avec background (cors=${withCors})`);
                });
              });
            },
            opts
          );
        };
        tryLoad(true);
      } else {
        this.loadViewWithoutBackground(view);
      }
    },

    /**
     * Fallback quand il n'y a pas d'image de fond
     */
    loadViewWithoutBackground(view) {
      const canvas = AppState.fabricCanvas;
      this.applyCanvasClipPath(view);
      this.drawEditableZoneIndicator(view);
      this.restoreViewObjects(view, () => {
        canvas.renderAll();
        Utils.toggleCanvasLoader(false);
        Utils.log(`Vue "${view}" chargée sans background`);
      });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // CLIPPING MASK — CORRECTION PRINCIPALE
    //
    // Le clipPath est appliqué sur canvas.clipPath (niveau canvas entier),
    // pas sur chaque objet individuellement.
    //
    // absolutePositioned: true → les coordonnées sont relatives au canvas,
    // pas à l'objet. C'est obligatoire pour un clip au niveau du canvas.
    //
    // Ce clipPath est RE-APPLIQUÉ à chaque changement de vue car les
    // coordonnées de zone peuvent différer entre Front/Back/Left/Right.
    // ─────────────────────────────────────────────────────────────────────────

    applyCanvasClipPath(view) {
      const zone = AppState.editableZones[view];
      if (!zone) return;

      const canvas = AppState.fabricCanvas;

      // Créer le rectangle de clip avec les coordonnées de la zone éditable
      const clipPath = new fabric.Rect({
        left:   zone.x,
        top:    zone.y,
        width:  zone.w,
        height: zone.h,
        // absolutePositioned = true : coordonnées absolues dans le canvas,
        // indépendantes de la position de l'objet. OBLIGATOIRE ici.
        absolutePositioned: true,
      });

      // Appliquer au canvas entier — tous les objets seront écrêtés
      canvas.clipPath = clipPath;

      Utils.log(`ClipPath appliqué sur vue "${view}" :`, zone);
    },

    // ─────────────────────────────────────────────────────────────────────────
    // INDICATEUR VISUEL DE ZONE ÉDITABLE (rectangle pointillé)
    // Ce rectangle est non-interactif et sert de guide visuel pour l'utilisateur
    // ─────────────────────────────────────────────────────────────────────────

    drawEditableZoneIndicator(view) {
      const zone = AppState.editableZones[view];
      if (!zone) return;

      const indicator = new fabric.Rect({
        left:            zone.x,
        top:             zone.y,
        width:           zone.w,
        height:          zone.h,
        fill:            'transparent',
        stroke:          '#ff0000',
        strokeWidth:     1.5,
        strokeDashArray: [8, 4],
        selectable:      false,
        evented:         false,
        // Tag custom pour l'identifier et l'exclure de la sauvegarde
        isZoneIndicator: true,
        opacity:         0.6,
      });

      AppState.fabricCanvas.add(indicator);
      // Mettre l'indicateur en arrière-plan (derrière les images uploadées)
      AppState.fabricCanvas.sendToBack(indicator);
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SAUVEGARDE DE LA VUE COURANTE
    // Filtre les objets non-interactifs (indicateur de zone, etc.)
    // ─────────────────────────────────────────────────────────────────────────

    saveCurrentView() {
      const view   = AppState.currentView;
      const canvas = AppState.fabricCanvas;

      // Garder uniquement les objets "utilisateur" (selectable et pas l'indicateur)
      const objects = canvas.getObjects().filter(obj =>
        obj.selectable !== false && !obj.isZoneIndicator
      );

      // Sérialiser en JSON Fabric.js (inclut toutes les propriétés)
      AppState.viewsData[view].objects = objects.map(obj => obj.toJSON([
        'selectable', 'evented', 'isZoneIndicator',
      ]));

      Utils.log(`Vue "${view}" sauvegardée — ${objects.length} objet(s)`);
    },

    // ─────────────────────────────────────────────────────────────────────────
    // RESTAURATION DES OBJETS D'UNE VUE
    // CORRECTION : callback appelé même si la vue est vide
    // ─────────────────────────────────────────────────────────────────────────

    restoreViewObjects(view, callback) {
      const viewData = AppState.viewsData[view];

      if (!viewData.objects || viewData.objects.length === 0) {
        // Aucun objet à restaurer — appeler quand même le callback
        if (callback) callback();
        return;
      }

      fabric.util.enlivenObjects(viewData.objects, (objects) => {
        objects.forEach(obj => AppState.fabricCanvas.add(obj));
        Utils.log(`${objects.length} objet(s) restauré(s) sur vue "${view}"`);
        if (callback) callback();
      });
    },

    // ─────────────────────────────────────────────────────────────────────────
    // CHANGEMENT DE VUE
    // ─────────────────────────────────────────────────────────────────────────

    switchView(view) {
      if (view === AppState.currentView) return;

      // Sauvegarder la vue actuelle avant de changer
      this.saveCurrentView();

      // Mettre à jour l'état
      AppState.currentView = view;

      // Mettre à jour l'UI des onglets
      document.querySelectorAll('.view-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.view === view);
      });

      // Charger la nouvelle vue (avec son clipPath propre)
      this.loadView(view);

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

        const zone = AppState.editableZones[AppState.currentView];

        // Calculer la taille max (80 % de la zone éditable)
        const maxWidth  = zone.w * 0.8;
        const maxHeight = zone.h * 0.8;

        // Redimensionner proportionnellement
        const scaleX = maxWidth  / img.width;
        const scaleY = maxHeight / img.height;
        const scale  = Math.min(scaleX, scaleY, 1); // Ne pas agrandir si déjà petite

        img.set({
          scaleX:  scale,
          scaleY:  scale,
          // Centrer dans la zone éditable
          left:    zone.x + (zone.w / 2),
          top:     zone.y + (zone.h / 2),
          originX: 'center',
          originY: 'center',
        });

        AppState.fabricCanvas.add(img);
        AppState.fabricCanvas.setActiveObject(img);
        AppState.fabricCanvas.requestRenderAll();

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
              img.set({
                scaleX: CONFIG.CANVAS_WIDTH  / img.width,
                scaleY: CONFIG.CANVAS_HEIGHT / img.height,
                left:   0,
                top:    0,
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
        viewImages: {
          front: cardElement.dataset.viewFront,
          back:  cardElement.dataset.viewBack,
          left:  cardElement.dataset.viewLeft,
          right: cardElement.dataset.viewRight,
        },
        editableZones: Utils.parseEditableZones(cardElement.dataset.editableZones),
      };

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

      // Mettre à jour l'état global
      AppState.selectedProduct = productData;
      AppState.viewImages      = productData.viewImages;

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

      // Réinitialiser les onglets
      document.querySelectorAll('.view-tab').forEach(tab => {
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
          images,
        };

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
  // GESTIONNAIRE DES ACCORDÉONS (COLLAPSES)
  // ══════════════════════════════════════════════════════════════════════════════

  const AccordionManager = {
    init() {
      this.setupEventListeners();
      this.setupUploadHook();
    },

    /**
     * Gère les clics sur les titres pour ouvrir/fermer
     */
    setupEventListeners() {
      document.addEventListener('click', (e) => {
        const title = e.target.closest('.control-title');
        if (title) {
          const group = title.closest('.control-group');
          if (group) {
            // Fermer tous les autres groupes sauf celui cliqué
            document.querySelectorAll('.control-group').forEach(g => {
              if (g !== group) {
                g.classList.add('is-collapsed');
              }
            });

            // Basculer l'état du groupe cliqué
            group.classList.toggle('is-collapsed');
          }
        }
      });
    },

    /**
     * Ouvre une section spécifique par son ID
     */
    openSection(groupId) {
      const group = document.getElementById(groupId);
      if (group) {
        // Fermer les autres
        document.querySelectorAll('.control-group').forEach(g => {
          if (g !== group) {
            g.classList.add('is-collapsed');
          }
        });
        // Ouvrir celle-ci
        group.classList.remove('is-collapsed');
        
        // Scroll fluide vers la section si nécessaire
        group.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    },

    /**
     * Hook pour ouvrir automatiquement lors du choix de fichier
     */
    setupUploadHook() {
      const fileInput = document.getElementById('image-upload-input');
      if (fileInput) {
        fileInput.addEventListener('change', () => this.openSection('group-upload'));
      }
    },

    /**
     * Détermine quelle section ouvrir selon l'objet sélectionné
     */
    handleAutoOpenOnSelection(e) {
      if (!e.selected || !e.selected[0]) return;
      const obj = e.selected[0];

      if (obj.type === 'i-text') {
        this.openSection('group-text');
      } else if (['rect', 'circle', 'triangle', 'polygon', 'line'].includes(obj.type)) {
        this.openSection('group-shapes');
      } else if (obj.type === 'image') {
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

})();