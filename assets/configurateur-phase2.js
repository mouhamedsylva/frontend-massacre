
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

      const zone = AppState.editableZones[AppState.currentView];
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
        // Appliquer le clipping mask
        if (typeof CanvasManager !== 'undefined' && CanvasManager.applyClipPath) {
          CanvasManager.applyClipPath(shape);
        }

        AppState.fabricCanvas.add(shape);
        AppState.fabricCanvas.setActiveObject(shape);
        AppState.fabricCanvas.renderAll();

        // Sauvegarder dans l'historique
        HistoryManager.saveState();

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
        HistoryManager.saveState();
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
        HistoryManager.saveState();
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
        HistoryManager.saveState();
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
        HistoryManager.saveState();
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
          HistoryManager.saveState();
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
        const zone = AppState.editableZones[AppState.currentView];
        activeObject.set({
          left: zone.x + (activeObject.width * activeObject.scaleX) / 2
        });
        AppState.fabricCanvas.renderAll();
        HistoryManager.saveState();
      }
    },

    /**
     * Centre l'objet horizontalement
     */
    alignCenterH() {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      if (activeObject) {
        const zone = AppState.editableZones[AppState.currentView];
        activeObject.set({
          left: zone.x + zone.w / 2
        });
        activeObject.setCoords();
        AppState.fabricCanvas.renderAll();
        HistoryManager.saveState();
      }
    },

    /**
     * Aligne l'objet à droite de la zone éditable
     */
    alignRight() {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      if (activeObject) {
        const zone = AppState.editableZones[AppState.currentView];
        activeObject.set({
          left: zone.x + zone.w - (activeObject.width * activeObject.scaleX) / 2
        });
        AppState.fabricCanvas.renderAll();
        HistoryManager.saveState();
      }
    },

    /**
     * Aligne l'objet en haut de la zone éditable
     */
    alignTop() {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      if (activeObject) {
        const zone = AppState.editableZones[AppState.currentView];
        activeObject.set({
          top: zone.y + (activeObject.height * activeObject.scaleY) / 2
        });
        AppState.fabricCanvas.renderAll();
        HistoryManager.saveState();
      }
    },

    /**
     * Centre l'objet verticalement
     */
    alignCenterV() {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      if (activeObject) {
        const zone = AppState.editableZones[AppState.currentView];
        activeObject.set({
          top: zone.y + zone.h / 2
        });
        activeObject.setCoords();
        AppState.fabricCanvas.renderAll();
        HistoryManager.saveState();
      }
    },

    /**
     * Aligne l'objet en bas de la zone éditable
     */
    alignBottom() {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      if (activeObject) {
        const zone = AppState.editableZones[AppState.currentView];
        activeObject.set({
          top: zone.y + zone.h - (activeObject.height * activeObject.scaleY) / 2
        });
        AppState.fabricCanvas.renderAll();
        HistoryManager.saveState();
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
  // MODULE HISTORIQUE (UNDO/REDO)
  // ══════════════════════════════════════════════════════════════════════════════

  const HistoryManager = {
    isProcessing: false,

    /**
     * Sauvegarde l'état actuel du canvas
     */
    saveState() {
      if (this.isProcessing || !AppState.fabricCanvas) return;

      const json = AppState.fabricCanvas.toJSON();
      
      // Supprimer les états "futur" si on fait une nouvelle action après un undo
      if (Phase2State.historyStep < Phase2State.history.length - 1) {
        Phase2State.history = Phase2State.history.slice(0, Phase2State.historyStep + 1);
      }

      // Ajouter le nouvel état
      Phase2State.history.push(json);

      // Limiter la taille de l'historique
      if (Phase2State.history.length > PHASE2_CONFIG.MAX_HISTORY) {
        Phase2State.history.shift();
      } else {
        Phase2State.historyStep++;
      }

      this.updateButtons();
    },

    /**
     * Annule la dernière action (Undo)
     */
    undo() {
      if (Phase2State.historyStep > 0) {
        this.isProcessing = true;
        Phase2State.historyStep--;
        
        const state = Phase2State.history[Phase2State.historyStep];
        AppState.fabricCanvas.loadFromJSON(state, () => {
          AppState.fabricCanvas.renderAll();
          this.isProcessing = false;
          this.updateButtons();
          console.log('[HistoryManager] Undo');
        });
      }
    },

    /**
     * Refait l'action annulée (Redo)
     */
    redo() {
      if (Phase2State.historyStep < Phase2State.history.length - 1) {
        this.isProcessing = true;
        Phase2State.historyStep++;
        
        const state = Phase2State.history[Phase2State.historyStep];
        AppState.fabricCanvas.loadFromJSON(state, () => {
          AppState.fabricCanvas.renderAll();
          this.isProcessing = false;
          this.updateButtons();
          console.log('[HistoryManager] Redo');
        });
      }
    },

    /**
     * Met à jour l'état des boutons undo/redo
     */
    updateButtons() {
      const undoBtn = document.getElementById('btn-undo');
      const redoBtn = document.getElementById('btn-redo');

      if (undoBtn) {
        undoBtn.disabled = Phase2State.historyStep <= 0;
      }
      if (redoBtn) {
        redoBtn.disabled = Phase2State.historyStep >= Phase2State.history.length - 1;
      }
    },

    /**
     * Initialise l'historique avec l'état actuel
     */
    init() {
      if (AppState.fabricCanvas) {
        this.saveState();
      }
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
      const controlsPanel = document.querySelector('.controls-panel');
      if (!controlsPanel) return;

      const shapeHTML = `
        <div class="control-group is-collapsed phase2-shape-controls" id="group-shapes">
          <h3 class="control-title">🔷 Ajouter une forme</h3>
          
          <div class="control-content">
            <div class="shape-buttons">
              ${PHASE2_CONFIG.SHAPES.map(shape => `
                <button class="btn-shape" 
                        data-shape="${shape.type}" 
                        title="${shape.name}"
                        type="button">
                  ${shape.icon}
                </button>
              `).join('')}
            </div>

            <div class="shape-options" id="shape-options" style="display: none; margin-top: 1rem;">
              
              <!-- Couleur contour -->
              <div class="form-group">
                <label class="form-label">Contour</label>
                <input type="color" id="shape-stroke-color" class="form-input" value="#000000">
              </div>

              <!-- Couleur remplissage -->
              <div class="form-group">
                <label class="form-label">Remplissage</label>
                <div style="display: flex; gap: 0.5rem;">
                  <input type="color" id="shape-fill-color" class="form-input" value="#000000" style="flex: 1;">
                  <button class="btn btn-secondary" id="btn-no-fill" title="Pas de remplissage" type="button">
                    ∅
                  </button>
                </div>
              </div>

              <!-- Épaisseur -->
              <div class="form-group">
                <label class="form-label">Épaisseur: <span id="stroke-width-value">2</span>px</label>
                <input type="range" id="shape-stroke-width" class="form-range" min="1" max="10" value="2">
              </div>

            </div>
          </div>
        </div>
      `;

      const actionsGroup = document.getElementById('group-actions');
      if (actionsGroup) {
        actionsGroup.insertAdjacentHTML('beforebegin', shapeHTML);
      }
    },

    /**
     * Injecte les contrôles de calques
     */
    injectLayerControls() {
      const controlsPanel = document.querySelector('.controls-panel');
      if (!controlsPanel) return;

      const layerHTML = `
        <div class="control-group is-collapsed phase2-layer-controls" id="group-layers">
          <h3 class="control-title">📚 Gestion des calques</h3>
          
          <div class="control-content">
            <div class="layer-buttons-grid">
              <button class="btn btn-icon-small" id="btn-bring-front" title="Premier plan" type="button">
                ⬆⬆
              </button>
              <button class="btn btn-icon-small" id="btn-bring-forward" title="Monter" type="button">
                ⬆
              </button>
              <button class="btn btn-icon-small" id="btn-send-backward" title="Descendre" type="button">
                ⬇
              </button>
              <button class="btn btn-icon-small" id="btn-send-back" title="Arrière-plan" type="button">
                ⬇⬇
              </button>
              <button class="btn btn-icon-small" id="btn-duplicate" title="Dupliquer" type="button">
                📄
              </button>
            </div>
          </div>
        </div>
      `;

      const actionsGroup = document.getElementById('group-actions');
      if (actionsGroup) {
        actionsGroup.insertAdjacentHTML('beforebegin', layerHTML);
      }
    },

    /**
     * Injecte les contrôles d'alignement
     */
    injectAlignmentControls() {
      const controlsPanel = document.querySelector('.controls-panel');
      if (!controlsPanel) return;

      const alignHTML = `
        <div class="control-group is-collapsed phase2-align-controls" id="group-align">
          <h3 class="control-title">📐 Alignement</h3>
          
          <div class="control-content">
            <div class="align-grid">
              <button class="btn btn-icon-small" id="btn-align-left" title="Gauche" type="button">
                ⊣
              </button>
              <button class="btn btn-icon-small" id="btn-align-center-h" title="Centre H" type="button">
                ⊢⊣
              </button>
              <button class="btn btn-icon-small" id="btn-align-right" title="Droite" type="button">
                ⊢
              </button>
              <button class="btn btn-icon-small" id="btn-align-top" title="Haut" type="button">
                ⊤
              </button>
              <button class="btn btn-icon-small" id="btn-align-center-v" title="Centre V" type="button">
                ⊥⊤
              </button>
              <button class="btn btn-icon-small" id="btn-align-bottom" title="Bas" type="button">
                ⊥
              </button>
              <button class="btn btn-icon-small" id="btn-align-center" title="Centrer" type="button">
                ⊕
              </button>
            </div>
          </div>
        </div>
      `;

      const actionsGroup = document.getElementById('group-actions');
      if (actionsGroup) {
        actionsGroup.insertAdjacentHTML('beforebegin', alignHTML);
      }
    },

    /**
     * Injecte les contrôles d'historique
     */
    injectHistoryControls() {
      const controlsPanel = document.querySelector('.controls-panel');
      if (!controlsPanel) return;

      const historyHTML = `
        <div class="control-group is-collapsed phase2-history-controls" id="group-history">
          <h3 class="control-title">⏮️ Historique</h3>
          
          <div class="control-content">
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-secondary" id="btn-undo" title="Annuler (Ctrl+Z)" type="button" disabled style="flex: 1;">
                ↶ Annuler
              </button>
              <button class="btn btn-secondary" id="btn-redo" title="Refaire (Ctrl+Y)" type="button" disabled style="flex: 1;">
                ↷ Refaire
              </button>
            </div>

            <p style="font-size: 0.75rem; color: #666; margin-top: 0.5rem; margin-bottom: 0;">
              Raccourcis : Ctrl+Z / Ctrl+Y
            </p>
          </div>
        </div>
      `;

      const actionsGroup = document.getElementById('group-actions');
      if (actionsGroup) {
        actionsGroup.insertAdjacentHTML('beforebegin', historyHTML);
      }
    },

    /**
     * Configure les event listeners
     */
    setupEventListeners() {
      // Boutons de formes
      document.querySelectorAll('.btn-shape').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const shapeType = e.target.dataset.shape;
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

      // Boutons d'historique
      document.getElementById('btn-undo')?.addEventListener('click', () => HistoryManager.undo());
      document.getElementById('btn-redo')?.addEventListener('click', () => HistoryManager.redo());

      // Raccourcis clavier
      document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
          if (e.key === 'z' || e.key === 'Z') {
            e.preventDefault();
            HistoryManager.undo();
          } else if (e.key === 'y' || e.key === 'Y') {
            e.preventDefault();
            HistoryManager.redo();
          }
        }
      });

      // Afficher les options quand une forme est sélectionnée
      if (AppState.fabricCanvas) {
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

        // Sauvegarder dans l'historique après modification
        AppState.fabricCanvas.on('object:modified', () => {
          HistoryManager.saveState();
        });
      }
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

  // Attendre que le DOM soit prêt et que le canvas soit initialisé
  function initPhase2() {
    // Vérifier que le canvas existe
    if (!AppState.fabricCanvas) {
      console.log('[Phase2] Canvas pas encore initialisé, attente...');
      setTimeout(initPhase2, 500);
      return;
    }

    UI2Manager.init();
    HistoryManager.init();
    console.log('[Phase2] ✅ Fonctionnalités Formes + Calques + Alignement + Historique activées');
  }

  // Lancer l'initialisation - attendre d'abord que AppState soit disponible
  waitForConfigurator(() => {
    console.log('[Phase2] Configurateur principal détecté, initialisation...');
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
    HistoryManager,
    CONFIG: PHASE2_CONFIG,
    State: Phase2State
  };

})();
