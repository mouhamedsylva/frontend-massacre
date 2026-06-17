/**
 * Text Advanced Controls - Massacre Configurateur
 * Gère les contrôles avancés pour l'édition de texte :
 * - Rotation
 * - Contour (Outline)
 * - Taille avec slider
 * - Alignement
 * - Centrage
 * - Duplication
 */

(function() {
  'use strict';

  const TextAdvancedControls = {
    
    /**
     * Initialise les contrôles avancés
     */
    init() {
      console.log('[TextAdvancedControls] Initialisation...');
      this.setupEventListeners();
    },
    
    /**
     * Configure les event listeners
     */
    setupEventListeners() {
      // Taille (Input Direct)
      const sizeValue = document.getElementById('text-size-value');
      if (sizeValue) {
        sizeValue.addEventListener('input', (e) => {
          const size = parseInt(e.target.value);
          if (size >= 10) this.changeTextSize(size);
        });
      }
      
      // Rotation (Input Direct)
      const rotationValue = document.getElementById('text-rotation-value');
      if (rotationValue) {
        rotationValue.addEventListener('input', (e) => {
          const angle = parseInt(e.target.value);
          this.rotateText(angle);
        });
      }
      
      // Contour (Outline)
      const outlineColor = document.getElementById('text-outline-color');
      const outlineWidth = document.getElementById('text-outline-width');
      
      if (outlineColor) {
        outlineColor.addEventListener('change', (e) => {
          const width = outlineWidth ? parseInt(outlineWidth.value) || 0 : 0;
          this.applyOutline(e.target.value, width);
        });
      }
      
      if (outlineWidth) {
        outlineWidth.addEventListener('input', (e) => {
          const color = outlineColor ? outlineColor.value : '#000000';
          this.applyOutline(color, parseInt(e.target.value) || 0);
        });
      }
      
      // Boutons d'alignement
      const alignLeft = document.getElementById('btn-text-align-left');
      const alignCenter = document.getElementById('btn-text-align-center');
      const alignRight = document.getElementById('btn-text-align-right');
      
      if (alignLeft) alignLeft.addEventListener('click', () => this.alignText('left'));
      if (alignCenter) alignCenter.addEventListener('click', () => this.alignText('center'));
      if (alignRight) alignRight.addEventListener('click', () => this.alignText('right'));
      
      // Centrer le texte
      const centerBtn = document.getElementById('btn-text-center');
      if (centerBtn) {
        centerBtn.addEventListener('click', () => this.centerText());
      }
      
      // Dupliquer le texte
      const duplicateBtn = document.getElementById('btn-text-duplicate');
      if (duplicateBtn) {
        duplicateBtn.addEventListener('click', () => this.duplicateText());
      }
    },
    
    /**
     * Change la taille du texte sélectionné
     */
    changeTextSize(size) {
      if (typeof AppState === 'undefined' || !AppState.fabricCanvas) return;
      
      const activeObject = AppState.fabricCanvas.getActiveObject();
      if (activeObject && activeObject.type === 'i-text') {
        activeObject.set('fontSize', size);
        AppState.fabricCanvas.renderAll();
      }
    },
    
    /**
     * Fait pivoter le texte sélectionné
     */
    rotateText(angle) {
      if (typeof AppState === 'undefined' || !AppState.fabricCanvas) return;
      
      const activeObject = AppState.fabricCanvas.getActiveObject();
      if (activeObject && activeObject.type === 'i-text') {
        activeObject.set('angle', angle);
        AppState.fabricCanvas.renderAll();
      }
    },
    
    /**
     * Applique un contour au texte
     */
    applyOutline(color, width) {
      if (typeof AppState === 'undefined' || !AppState.fabricCanvas) return;
      
      const activeObject = AppState.fabricCanvas.getActiveObject();
      if (activeObject && activeObject.type === 'i-text') {
        if (width > 0) {
          activeObject.set({
            stroke: color,
            strokeWidth: width
          });
        } else {
          activeObject.set({
            stroke: null,
            strokeWidth: 0
          });
        }
        AppState.fabricCanvas.renderAll();
      }
    },
    
    /**
     * Change l'alignement du texte
     */
    alignText(alignment) {
      if (typeof AppState === 'undefined' || !AppState.fabricCanvas) return;
      
      const activeObject = AppState.fabricCanvas.getActiveObject();
      if (activeObject && activeObject.type === 'i-text') {
        activeObject.set('textAlign', alignment);
        AppState.fabricCanvas.renderAll();
      }
    },
    
    /**
     * Centre le texte sur le canvas
     */
    centerText() {
      if (typeof AppState === 'undefined' || !AppState.fabricCanvas) return;
      
      const canvas = AppState.fabricCanvas;
      const activeObject = canvas.getActiveObject();
      
      if (activeObject && activeObject.type === 'i-text') {
        const zone = AppState.editableZones[AppState.currentView];
        
        activeObject.set({
          left: zone.x + (zone.w / 2),
          top: zone.y + (zone.h / 2),
          originX: 'center',
          originY: 'center'
        });
        
        canvas.renderAll();
        console.log('[TextAdvancedControls] Texte centré');
      }
    },
    
    /**
     * Duplique le texte sélectionné
     */
    duplicateText() {
      if (typeof AppState === 'undefined' || !AppState.fabricCanvas) return;
      
      const canvas = AppState.fabricCanvas;
      const activeObject = canvas.getActiveObject();
      
      if (activeObject && activeObject.type === 'i-text') {
        activeObject.clone((cloned) => {
          cloned.set({
            left: cloned.left + 20,
            top: cloned.top + 20
          });
          
          // Appliquer le clipping mask
          if (typeof CanvasManager !== 'undefined' && CanvasManager.applyClipPath) {
            CanvasManager.applyClipPath(cloned);
          }
          
          canvas.add(cloned);
          canvas.setActiveObject(cloned);
          canvas.renderAll();
          
          console.log('[TextAdvancedControls] Texte dupliqué');
        });
      }
    },
    
    /**
     * Met à jour les sliders avec les valeurs du texte sélectionné
     */
    updateControlsFromSelection(textObject) {
      // Taille
      const sizeSlider = document.getElementById('text-size-slider');
      const sizeValue = document.getElementById('text-size-value');
      if (sizeSlider && textObject.fontSize) {
        sizeSlider.value = textObject.fontSize;
        if (sizeValue) sizeValue.value = textObject.fontSize;
      }
      
      // Rotation
      const rotationSlider = document.getElementById('text-rotation-slider');
      const rotationValue = document.getElementById('text-rotation-value');
      if (rotationSlider && textObject.angle !== undefined) {
        rotationSlider.value = Math.round(textObject.angle);
        if (rotationValue) rotationValue.value = Math.round(textObject.angle);
      }
      
      // Contour
      const outlineColor = document.getElementById('text-outline-color');
      const outlineWidth = document.getElementById('text-outline-width');
      if (outlineColor && textObject.stroke) {
        outlineColor.value = textObject.stroke;
      }
      if (outlineWidth && textObject.strokeWidth) {
        outlineWidth.value = textObject.strokeWidth;
      }
    }
  };
  
  // Initialiser quand tout est prêt
  function bindCanvasSelectionListeners() {
    if (typeof AppState === 'undefined' || !AppState.fabricCanvas) return;
    if (AppState.fabricCanvas._textAdvancedSelectionSync) return;
    AppState.fabricCanvas._textAdvancedSelectionSync = true;

    AppState.fabricCanvas.on('selection:created', (e) => {
      if (e.selected[0] && e.selected[0].type === 'i-text') {
        TextAdvancedControls.updateControlsFromSelection(e.selected[0]);
      }
    });

    AppState.fabricCanvas.on('selection:updated', (e) => {
      if (e.selected[0] && e.selected[0].type === 'i-text') {
        TextAdvancedControls.updateControlsFromSelection(e.selected[0]);
      }
    });
  }

  function waitForDependencies() {
    if (typeof AppState !== 'undefined' && typeof CanvasManager !== 'undefined') {
      TextAdvancedControls.init();
      bindCanvasSelectionListeners();
    } else {
      setTimeout(waitForDependencies, 100);
    }
  }

  window.addEventListener('configurator:canvas-ready', bindCanvasSelectionListeners);
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForDependencies);
  } else {
    waitForDependencies();
  }
  
  // Exposer globalement
  window.TextAdvancedControls = TextAdvancedControls;
  
})();
