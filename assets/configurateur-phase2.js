
/**
 * configurateur-phase2.js
 * Extension Phase 2 : Formes Géométriques, Gestion des Calques, Alignement & Undo/Redo
 * À charger APRÈS configurateur.js et configurateur-phase1.js
 */

(function() {
  'use strict';

  // Fonction d'attente de disponibilité du configurateur
  function waitForConfigurator(callback) {
    if (typeof AppState === 'undefined' || typeof CanvasManager === 'undefined') {
      console.warn('[Phase2] En attente du configurateur principal...');
      setTimeout(() => waitForConfigurator(callback), 100);
      return;
    }
    callback();
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // CONFIGURATION PHASE 2
  // ══════════════════════════════════════════════════════════════════════════════

  const PHASE2_CONFIG = {
    // Formes disponibles
    SHAPES: [
      { type: 'rect', name: 'Rectangle', icon: '▭' },
      { type: 'circle', name: 'Cercle', icon: '●' },
      { type: 'triangle', name: 'Triangle', icon: '▲' },
      { type: 'star', name: 'Étoile', icon: '⭐' },
      { type: 'line', name: 'Ligne', icon: '─' }
    ],

    // Taille par défaut des formes
    DEFAULT_SHAPE_SIZE: 100,

    // Historique : nombre maximum d'actions
    MAX_HISTORY: 20
  };

  // État global Phase 2
  const Phase2State = {
    history: [],
    historyStep: -1,
    currentColor: '#000000',
    currentFillColor: 'transparent',
    currentStrokeWidth: 2
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // MODULE FORMES GÉOMÉTRIQUES
  // ══════════════════════════════════════════════════════════════════════════════

  const ShapeManager = {
    /**
     * Ajoute une forme au canvas
     */
    addShape(shapeType) {
      if (!AppState.fabricCanvas) return;

      const zone = CanvasManager.getActiveZone(AppState.currentView);
      if (!zone) return;

      const centerX = zone.x + (zone.w / 2);
      const centerY = zone.y + (zone.h / 2);
      const size = PHASE2_CONFIG.DEFAULT_SHAPE_SIZE;

      let shape;

      switch(shapeType) {
        case 'rect':
          shape = new fabric.Rect({
            left: centerX,
            top: centerY,
            width: size,
            height: size,
            fill: Phase2State.currentFillColor,
            stroke: Phase2State.currentColor,
            strokeWidth: Phase2State.currentStrokeWidth,
            originX: 'center',
            originY: 'center'
          });
          break;

        case 'circle':
          shape = new fabric.Circle({
            left: centerX,
            top: centerY,
            radius: size / 2,
            fill: Phase2State.currentFillColor,
            stroke: Phase2State.currentColor,
            strokeWidth: Phase2State.currentStrokeWidth,
            originX: 'center',
            originY: 'center'
          });
          break;

        case 'triangle':
          shape = new fabric.Triangle({
            left: centerX,
            top: centerY,
            width: size,
            height: size,
            fill: Phase2State.currentFillColor,
            stroke: Phase2State.currentColor,
            strokeWidth: Phase2State.currentStrokeWidth,
            originX: 'center',
            originY: 'center'
          });
          break;

        case 'star':
          const points = this.createStarPoints(5, size/2, size/4);
          shape = new fabric.Polygon(points, {
            left: centerX,
            top: centerY,
            fill: Phase2State.currentFillColor,
            stroke: Phase2State.currentColor,
            strokeWidth: Phase2State.currentStrokeWidth,
            originX: 'center',
            originY: 'center'
          });
          break;

        case 'line':
          shape = new fabric.Line([0, 0, size, 0], {
            left: centerX,
            top: centerY,
            stroke: Phase2State.currentColor,
            strokeWidth: Phase2State.currentStrokeWidth,
            originX: 'center',
            originY: 'center'
          });
          break;
      }

      if (shape) {
        if (typeof CanvasManager !== 'undefined' && CanvasManager.applyClipPath) {
          CanvasManager.applyClipPath(shape);
        }

        if (window.ObjectFloatingActions) {
          window.ObjectFloatingActions.applyObjectDefaults(shape);
        }

        AppState.fabricCanvas.add(shape);
        AppState.fabricCanvas.setActiveObject(shape);
        AppState.fabricCanvas.renderAll();

        if (window.ObjectFloatingActions) {
          window.ObjectFloatingActions.show(shape);
        }

        // Sauvegarder dans l'historique
        if (window.HistoryManager) window.HistoryManager.saveState();

        console.log(`[ShapeManager] Forme ajoutée : ${shapeType}`);
      }
    },

    /**
     * Créer les points d'une étoile
     */
    createStarPoints(points, outerRadius, innerRadius) {
      const step = (Math.PI * 2) / points;
      const halfStep = step / 2;
      const quarterStep = step / 4;
      const coords = [];

      for (let i = 0; i < points; i++) {
        const angle = i * step - quarterStep;
        coords.push({
          x: Math.cos(angle) * outerRadius,
          y: Math.sin(angle) * outerRadius
        });
        coords.push({
          x: Math.cos(angle + halfStep) * innerRadius,
          y: Math.sin(angle + halfStep) * innerRadius
        });
      }

      return coords;
    },

    /**
     * Change la couleur de contour
     */
    changeStrokeColor(color) {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      
      if (activeObject && activeObject.stroke !== undefined) {
        activeObject.set('stroke', color);
        Phase2State.currentColor = color;
        AppState.fabricCanvas.renderAll();
      } else {
        Phase2State.currentColor = color;
      }
    },

    /**
     * Change la couleur de remplissage
     */
    changeFillColor(color) {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      
      if (activeObject && activeObject.fill !== undefined) {
        activeObject.set('fill', color);
        Phase2State.currentFillColor = color;
        AppState.fabricCanvas.renderAll();
      } else {
        Phase2State.currentFillColor = color;
      }
    },

    /**
     * Change l'épaisseur du contour
     */
    changeStrokeWidth(width) {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      
      if (activeObject && activeObject.strokeWidth !== undefined) {
        activeObject.set('strokeWidth', width);
        Phase2State.currentStrokeWidth = width;
        AppState.fabricCanvas.renderAll();
      } else {
        Phase2State.currentStrokeWidth = width;
      }
    }
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // MODULE GESTION DES CALQUES
  // ══════════════════════════════════════════════════════════════════════════════

  const LayerManager = {
    /**
     * Amène l'objet sélectionné au premier plan
     */
    bringToFront() {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      if (activeObject) {
        AppState.fabricCanvas.bringToFront(activeObject);
        AppState.fabricCanvas.renderAll();
        if (window.HistoryManager) window.HistoryManager.saveState();
        console.log('[LayerManager] Objet amené au premier plan');
      }
    },

    /**
     * Envoie l'objet sélectionné à l'arrière-plan
     */
    sendToBack() {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      if (activeObject) {
        AppState.fabricCanvas.sendToBack(activeObject);
        AppState.fabricCanvas.renderAll();
        if (window.HistoryManager) window.HistoryManager.saveState();
        console.log('[LayerManager] Objet envoyé à l\'arrière-plan');
      }
    },

    /**
     * Monte l'objet d'un niveau
     */
    bringForward() {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      if (activeObject) {
        AppState.fabricCanvas.bringForward(activeObject);
        AppState.fabricCanvas.renderAll();
        if (window.HistoryManager) window.HistoryManager.saveState();
        console.log('[LayerManager] Objet monté d\'un niveau');
      }
    },

    /**
     * Descend l'objet d'un niveau
     */
    sendBackward() {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      if (activeObject) {
        AppState.fabricCanvas.sendBackward(activeObject);
        AppState.fabricCanvas.renderAll();
        if (window.HistoryManager) window.HistoryManager.saveState();
        console.log('[LayerManager] Objet descendu d\'un niveau');
      }
    },

    /**
     * Duplique l'objet sélectionné
     */
    duplicate() {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      if (activeObject) {
        activeObject.clone((cloned) => {
          cloned.set({
            left: activeObject.left + 20,
            top: activeObject.top + 20
          });

          // Appliquer le clipping mask
          if (typeof CanvasManager !== 'undefined' && CanvasManager.applyClipPath) {
            CanvasManager.applyClipPath(cloned);
          }

          AppState.fabricCanvas.add(cloned);
          AppState.fabricCanvas.setActiveObject(cloned);
          AppState.fabricCanvas.renderAll();
          if (window.HistoryManager) window.HistoryManager.saveState();
          console.log('[LayerManager] Objet dupliqué');
        });
      }
    }
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // MODULE ALIGNEMENT
  // ══════════════════════════════════════════════════════════════════════════════

  const AlignmentManager = {
    /**
     * Aligne l'objet à gauche de la zone éditable
     */
    alignLeft() {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      if (activeObject) {
        const zone = CanvasManager.getActiveZone(AppState.currentView);
        if (!zone) return;
        activeObject.set({
          left: zone.x + (activeObject.width * activeObject.scaleX) / 2
        });
        AppState.fabricCanvas.renderAll();
        if (window.HistoryManager) window.HistoryManager.saveState();
      }
    },

    /**
     * Centre l'objet horizontalement
     */
    alignCenterH() {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      if (activeObject) {
        const zone = CanvasManager.getActiveZone(AppState.currentView);
        if (!zone) return;
        activeObject.set({
          left: zone.x + zone.w / 2
        });
        activeObject.setCoords();
        AppState.fabricCanvas.renderAll();
        if (window.HistoryManager) window.HistoryManager.saveState();
      }
    },

    /**
     * Aligne l'objet à droite de la zone éditable
     */
    alignRight() {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      if (activeObject) {
        const zone = CanvasManager.getActiveZone(AppState.currentView);
        if (!zone) return;
        activeObject.set({
          left: zone.x + zone.w - (activeObject.width * activeObject.scaleX) / 2
        });
        AppState.fabricCanvas.renderAll();
        if (window.HistoryManager) window.HistoryManager.saveState();
      }
    },

    /**
     * Aligne l'objet en haut de la zone éditable
     */
    alignTop() {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      if (activeObject) {
        const zone = CanvasManager.getActiveZone(AppState.currentView);
        if (!zone) return;
        activeObject.set({
          top: zone.y + (activeObject.height * activeObject.scaleY) / 2
        });
        AppState.fabricCanvas.renderAll();
        if (window.HistoryManager) window.HistoryManager.saveState();
      }
    },

    /**
     * Centre l'objet verticalement
     */
    alignCenterV() {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      if (activeObject) {
        const zone = CanvasManager.getActiveZone(AppState.currentView);
        if (!zone) return;
        activeObject.set({
          top: zone.y + zone.h / 2
        });
        activeObject.setCoords();
        AppState.fabricCanvas.renderAll();
        if (window.HistoryManager) window.HistoryManager.saveState();
      }
    },

    /**
     * Aligne l'objet en bas de la zone éditable
     */
    alignBottom() {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      if (activeObject) {
        const zone = CanvasManager.getActiveZone(AppState.currentView);
        if (!zone) return;
        activeObject.set({
          top: zone.y + zone.h - (activeObject.height * activeObject.scaleY) / 2
        });
        AppState.fabricCanvas.renderAll();
        if (window.HistoryManager) window.HistoryManager.saveState();
      }
    },

    /**
     * Centre l'objet (horizontal + vertical)
     */
    alignCenter() {
      this.alignCenterH();
      this.alignCenterV();
    }
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // INTERFACE UTILISATEUR - INJECTION HTML PHASE 2
  // ══════════════════════════════════════════════════════════════════════════════

  const UI2Manager = {
    /**
     * Initialise l'interface Phase 2
     */
    init() {
      this.injectShapeControls();
      this.injectLayerControls();
      this.injectAlignmentControls();
      this.injectHistoryControls();
      this.setupEventListeners();
      console.log('[Phase2] Interface initialisée');
    },

    /**
     * Injecte les contrôles de formes
     */
    injectShapeControls() {
      // Les contrôles sont déclarés statiquement dans le template configurateur.liquid
    },

    /**
     * Injecte les contrôles de calques
     */
    injectLayerControls() {
      // Les contrôles sont déclarés statiquement dans le template configurateur.liquid
    },

    /**
     * Injecte les contrôles d'alignement
     */
    injectAlignmentControls() {
      // Les contrôles sont déclarés statiquement dans le template configurateur.liquid
    },

    /**
     * Injecte les contrôles d'historique
     */
    injectHistoryControls() {
      // Les contrôles sont déclarés statiquement dans le template configurateur.liquid
    },

    /**
     * Configure les event listeners
     */
    setupEventListeners() {
      // Boutons de formes
      document.querySelectorAll('.btn-shape').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const shapeType = e.currentTarget.dataset.shape;
          if (!shapeType) return;
          ShapeManager.addShape(shapeType);
          this.showShapeOptions();
        });
      });

      // Contrôles de forme
      const strokeColor = document.getElementById('shape-stroke-color');
      if (strokeColor) {
        strokeColor.addEventListener('input', (e) => ShapeManager.changeStrokeColor(e.target.value));
      }

      const fillColor = document.getElementById('shape-fill-color');
      if (fillColor) {
        fillColor.addEventListener('input', (e) => ShapeManager.changeFillColor(e.target.value));
      }

      const noFillBtn = document.getElementById('btn-no-fill');
      if (noFillBtn) {
        noFillBtn.addEventListener('click', () => ShapeManager.changeFillColor('transparent'));
      }

      const strokeWidth = document.getElementById('shape-stroke-width');
      if (strokeWidth) {
        strokeWidth.addEventListener('input', (e) => {
          const value = e.target.value;
          document.getElementById('stroke-width-value').textContent = value;
          ShapeManager.changeStrokeWidth(parseInt(value));
        });
      }

      // Boutons de calques
      document.getElementById('btn-bring-front')?.addEventListener('click', () => LayerManager.bringToFront());
      document.getElementById('btn-bring-forward')?.addEventListener('click', () => LayerManager.bringForward());
      document.getElementById('btn-send-backward')?.addEventListener('click', () => LayerManager.sendBackward());
      document.getElementById('btn-send-back')?.addEventListener('click', () => LayerManager.sendToBack());
      document.getElementById('btn-duplicate')?.addEventListener('click', () => LayerManager.duplicate());

      // Boutons d'alignement
      document.getElementById('btn-align-left')?.addEventListener('click', () => AlignmentManager.alignLeft());
      document.getElementById('btn-align-center-h')?.addEventListener('click', () => AlignmentManager.alignCenterH());
      document.getElementById('btn-align-right')?.addEventListener('click', () => AlignmentManager.alignRight());
      document.getElementById('btn-align-top')?.addEventListener('click', () => AlignmentManager.alignTop());
      document.getElementById('btn-align-center-v')?.addEventListener('click', () => AlignmentManager.alignCenterV());
      document.getElementById('btn-align-bottom')?.addEventListener('click', () => AlignmentManager.alignBottom());
      document.getElementById('btn-align-center')?.addEventListener('click', () => AlignmentManager.alignCenter());

      this.setupCanvasEventListeners();
    },

    setupCanvasEventListeners() {
      if (!AppState.fabricCanvas) return;

      AppState.fabricCanvas.on('selection:created', (e) => {
        const obj = e.selected[0];
        if (obj && (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'triangle' || obj.type === 'polygon' || obj.type === 'line')) {
          this.showShapeOptions();
        }
      });

      AppState.fabricCanvas.on('selection:updated', (e) => {
        const obj = e.selected[0];
        if (obj && (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'triangle' || obj.type === 'polygon' || obj.type === 'line')) {
          this.showShapeOptions();
        }
      });
    },

    /**
     * Affiche les options de forme
     */
    showShapeOptions() {
      const options = document.getElementById('shape-options');
      if (options) {
        options.style.display = 'block';
      }
    }
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // STYLES CSS POUR PHASE 2
  // ══════════════════════════════════════════════════════════════════════════════

  const styles = `
    <style>
      /* Boutons de formes */
      .shape-buttons {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 0.5rem;
      }

      .btn-shape {
        width: 100%;
        height: 50px;
        font-size: 1.5rem;
        background: #f8f8f8;
        border: 2px solid #e0e0e0;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .btn-shape:hover {
        background: #fff;
        transform: scale(1.05);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }

      /* Grille de calques */
      .layer-buttons-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 0.5rem;
      }

      .btn-icon-small {
        padding: 0.5rem;
        font-size: 1rem;
        background: #f8f8f8;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 40px;
      }

      .btn-icon-small:hover:not(:disabled) {
        background: #e0e0e0;
        transform: translateY(-2px);
      }

      .btn-icon-small:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Grille d'alignement */
      .align-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
      }

      .align-grid .btn-icon-small:last-child {
        grid-column: 1 / -1;
      }

      /* Range input */
      .form-range {
        width: 100%;
        height: 30px;
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
      }

      .form-range::-webkit-slider-track {
        width: 100%;
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
      }

      .form-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        background: var(--color-primary);
        border-radius: 50%;
        cursor: pointer;
        margin-top: -6px;
      }

      .form-range::-moz-range-track {
        width: 100%;
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
      }

      .form-range::-moz-range-thumb {
        width: 20px;
        height: 20px;
        background: var(--color-primary);
        border-radius: 50%;
        cursor: pointer;
        border: none;
      }

      /* Form groups Phase 2 */
      .phase2-shape-controls .form-group,
      .phase2-layer-controls .form-group,
      .phase2-align-controls .form-group,
      .phase2-history-controls .form-group {
        margin-bottom: 1rem;
      }

      .phase2-shape-controls .form-label,
      .phase2-layer-controls .form-label,
      .phase2-align-controls .form-label,
      .phase2-history-controls .form-label {
        display: block;
        font-size: 0.875rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: var(--color-text);
      }

      .phase2-shape-controls .form-input,
      .phase2-layer-controls .form-input,
      .phase2-align-controls .form-input,
      .phase2-history-controls .form-input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid var(--color-border);
        border-radius: 4px;
        font-size: 0.875rem;
      }
    </style>
  `;

  // Injecter les styles
  document.head.insertAdjacentHTML('beforeend', styles);

  // ══════════════════════════════════════════════════════════════════════════════
  // INITIALISATION
  // ══════════════════════════════════════════════════════════════════════════════

  let phase2Initialized = false;

  function initPhase2() {
    if (!AppState.fabricCanvas) return;

    if (!phase2Initialized) {
      UI2Manager.init();
      phase2Initialized = true;
    } else {
      UI2Manager.setupCanvasEventListeners();
    }

    console.log('[Phase2] ✅ Fonctionnalités Formes + Calques + Alignement activées');
  }

  waitForConfigurator(() => {
    console.log('[Phase2] Configurateur principal détecté, initialisation...');
    window.addEventListener('configurator:canvas-ready', initPhase2);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initPhase2);
    } else {
      initPhase2();
    }
  });

  // Exposer les modules pour debug
  window.PHASE2 = {
    ShapeManager,
    LayerManager,
    AlignmentManager,
    CONFIG: PHASE2_CONFIG,
    State: Phase2State
  };

})();
