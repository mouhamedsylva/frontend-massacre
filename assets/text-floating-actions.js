/**
 * Object Floating Actions - Style Custom Ink
 * Boutons aux 4 coins : Supprimer, Rotation, Dupliquer, Redimensionner
 * Applicable au texte, formes, images et cliparts
 */

(function() {
  'use strict';

  const EDITABLE_TYPES = ['i-text', 'text', 'rect', 'circle', 'triangle', 'polygon', 'line', 'image'];

  const ObjectFloatingActions = {
    overlay: null,
    activeObject: null,
    dragMode: null,

    init() {
      this.createOverlay();
      this.setupGlobalListeners();
      console.log('[ObjectFloatingActions] Initialisé');
    },

    isEditableObject(obj) {
      return obj && !obj.isZoneIndicator && EDITABLE_TYPES.includes(obj.type);
    },

    getOverlayContainer() {
      const wrapper = document.querySelector('.canvas-workspace .canvas-wrapper');
      if (!wrapper) return null;
      return wrapper.querySelector('.canvas-container') || wrapper;
    },

    createOverlay() {
      const container = this.getOverlayContainer();
      if (!container || document.getElementById('object-floating-actions')) return;

      if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
      }

      this.overlay = document.createElement('div');
      this.overlay.id = 'object-floating-actions';
      this.overlay.className = 'object-floating-actions';
      this.overlay.innerHTML = `
        <button type="button" class="ofa-btn ofa-delete" data-action="delete" title="Supprimer">×</button>
        <button type="button" class="ofa-btn ofa-rotate" data-action="rotate" title="Rotation">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 2v6h-6"></path>
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
          </svg>
        </button>
        <button type="button" class="ofa-btn ofa-duplicate" data-action="duplicate" title="Dupliquer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <button type="button" class="ofa-btn ofa-scale" data-action="scale" title="Redimensionner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </button>
      `;

      container.appendChild(this.overlay);

      this.overlay.querySelectorAll('.ofa-btn').forEach(btn => {
        btn.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.handleAction(btn.dataset.action);
        });
      });
    },

    setupGlobalListeners() {
      window.addEventListener('configurator:canvas-ready', () => {
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.parentNode.removeChild(this.overlay);
          this.overlay = null;
        }
        if (typeof AppState !== 'undefined' && AppState.fabricCanvas) {
          delete AppState.fabricCanvas._objectFloatingActionsSync;
        }
        this.createOverlay();
        this.bindCanvasEvents();
      });

      window.addEventListener('configurator:history-restored', () => this.hide());
      window.addEventListener('resize', () => this.updatePosition());

      if (typeof AppState !== 'undefined' && AppState.fabricCanvas) {
        this.bindCanvasEvents();
      }
    },

    bindCanvasEvents() {
      if (typeof AppState === 'undefined' || !AppState.fabricCanvas) return;
      if (AppState.fabricCanvas._objectFloatingActionsSync) return;

      AppState.fabricCanvas._objectFloatingActionsSync = true;
      const canvas = AppState.fabricCanvas;

      const refresh = (e) => {
        const obj = e?.selected?.[0] || canvas.getActiveObject();
        if (this.isEditableObject(obj)) {
          this.show(obj);
        } else {
          this.hide();
        }
      };

      canvas.on('selection:created', refresh);
      canvas.on('selection:updated', refresh);
      canvas.on('selection:cleared', () => this.hide());
      canvas.on('object:moving', () => this.updatePosition());
      canvas.on('object:scaling', () => this.updatePosition());
      canvas.on('object:rotating', () => this.updatePosition());
      canvas.on('object:modified', () => this.updatePosition());
      canvas.on('after:render', () => {
        if (this.activeObject && canvas.getActiveObject() === this.activeObject) {
          this.updatePosition();
        }
      });
    },

    applyObjectDefaults(obj) {
      obj.set({
        hasControls: false,
        hasBorders: true,
        borderColor: '#4A90E2',
        borderScaleFactor: 1.5,
        cornerColor: '#4A90E2',
        transparentCorners: false,
        padding: obj.type === 'i-text' ? 8 : 4,
      });
    },

    applyTextDefaults(obj) {
      this.applyObjectDefaults(obj);
    },

    show(obj) {
      if (!this.overlay) this.createOverlay();
      if (!this.overlay) return;

      this.applyObjectDefaults(obj);
      this.activeObject = obj;
      this.overlay.style.display = 'block';
      this.updatePosition();
    },

    hide() {
      this.activeObject = null;
      this.dragMode = null;
      if (this.overlay) this.overlay.style.display = 'none';
    },

    updatePosition() {
      if (!this.overlay || !this.activeObject || !AppState.fabricCanvas) return;

      const canvas = AppState.fabricCanvas;
      if (canvas.getActiveObject() !== this.activeObject) {
        this.hide();
        return;
      }

      this.activeObject.setCoords();
      const bound = this.activeObject.getBoundingRect(true, true);

      this.overlay.style.left = `${bound.left}px`;
      this.overlay.style.top = `${bound.top}px`;
      this.overlay.style.width = `${Math.max(bound.width, 1)}px`;
      this.overlay.style.height = `${Math.max(bound.height, 1)}px`;
    },

    handleAction(action) {
      const obj = this.activeObject;
      if (!obj || !AppState.fabricCanvas) return;

      const canvas = AppState.fabricCanvas;

      if (action === 'delete') {
        canvas.remove(obj);
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        this.hide();
        return;
      }

      if (action === 'duplicate') {
        obj.clone((cloned) => {
          cloned.set({ left: obj.left + 20, top: obj.top + 20 });
          if (typeof CanvasManager !== 'undefined' && CanvasManager.applyClipPath) {
            CanvasManager.applyClipPath(cloned);
          }
          this.applyObjectDefaults(cloned);
          canvas.add(cloned);
          canvas.setActiveObject(cloned);
          canvas.requestRenderAll();
          this.show(cloned);
        });
        return;
      }

      if (action === 'rotate') {
        this.startRotateDrag();
        return;
      }

      if (action === 'scale') {
        this.startScaleDrag();
      }
    },

    startRotateDrag() {
      const obj = this.activeObject;
      const canvas = AppState.fabricCanvas;
      if (!obj || !canvas) return;

      const center = obj.getCenterPoint();
      let startAngle = 0;
      let initialRotation = obj.angle || 0;
      let started = false;

      if (typeof CanvasManager !== 'undefined' && CanvasManager.showZoneGuides) {
        CanvasManager.showZoneGuides();
      }

      const onMove = (ev) => {
        const pointer = canvas.getPointer(ev);
        if (!started) {
          startAngle = Math.atan2(pointer.y - center.y, pointer.x - center.x);
          initialRotation = obj.angle || 0;
          started = true;
          return;
        }

        const angle = Math.atan2(pointer.y - center.y, pointer.x - center.x);
        const deg = initialRotation + (angle - startAngle) * (180 / Math.PI);
        obj.set('angle', deg);
        obj.setCoords();
        canvas.requestRenderAll();
        this.updatePosition();

        if (obj.type === 'i-text') {
          const rotInput = document.getElementById('text-rotation-value');
          if (rotInput) rotInput.value = Math.round(deg);
        }
      };

      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        if (typeof CanvasManager !== 'undefined' && CanvasManager.hideZoneGuides) {
          CanvasManager.hideZoneGuides();
        }
        if (started) canvas.fire('object:modified', { target: obj });
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },

    startScaleDrag() {
      const obj = this.activeObject;
      const canvas = AppState.fabricCanvas;
      if (!obj || !canvas) return;

      const center = obj.getCenterPoint();
      let startDist = 0;
      let initialScale = obj.scaleX || 1;
      let started = false;

      if (typeof CanvasManager !== 'undefined' && CanvasManager.showZoneGuides) {
        CanvasManager.showZoneGuides();
      }

      const onMove = (ev) => {
        const pointer = canvas.getPointer(ev);
        if (!started) {
          startDist = Math.hypot(pointer.x - center.x, pointer.y - center.y);
          initialScale = obj.scaleX || 1;
          started = startDist > 0;
          return;
        }

        const dist = Math.hypot(pointer.x - center.x, pointer.y - center.y);
        const ratio = Math.max(0.2, Math.min(5, (dist / startDist) * initialScale));
        obj.set({ scaleX: ratio, scaleY: ratio });
        obj.setCoords();

        if (typeof CanvasManager !== 'undefined' && CanvasManager.constrainObjectToZone) {
          CanvasManager.constrainObjectToZone(obj);
        }

        canvas.requestRenderAll();
        this.updatePosition();

        if (obj.type === 'i-text') {
          const sizeInput = document.getElementById('text-size-value');
          if (sizeInput && obj.fontSize) {
            sizeInput.value = Math.round(obj.fontSize * ratio);
          }
        }
      };

      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        if (typeof CanvasManager !== 'undefined' && CanvasManager.hideZoneGuides) {
          CanvasManager.hideZoneGuides();
        }
        if (started) canvas.fire('object:modified', { target: obj });
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    }
  };

  function waitForDependencies() {
    if (typeof AppState !== 'undefined' && typeof CanvasManager !== 'undefined') {
      ObjectFloatingActions.init();
    } else {
      setTimeout(waitForDependencies, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForDependencies);
  } else {
    waitForDependencies();
  }

  window.ObjectFloatingActions = ObjectFloatingActions;
  window.TextFloatingActions = ObjectFloatingActions;
})();
