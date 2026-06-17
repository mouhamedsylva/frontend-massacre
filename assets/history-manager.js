/**
 * History Manager - Massacre Configurateur
 * Undo/Redo basé sur les snapshots de AppState.viewsData
 */

(function() {
  'use strict';

  const HistoryManager = {
    history: [],
    currentIndex: -1,
    maxHistory: 50,
    isLocked: false,
    saveTimer: null,
    listenersBound: false,

    init() {
      if (this.listenersBound) return;
      this.listenersBound = true;
      this.setupEventListeners();
      console.log('[HistoryManager] Initialisation...');
    },

    setupEventListeners() {
      const btnUndo = document.getElementById('btn-undo');
      const btnRedo = document.getElementById('btn-redo');

      if (btnUndo) {
        btnUndo.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.undo();
        });
      }

      if (btnRedo) {
        btnRedo.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.redo();
        });
      }

      document.addEventListener('keydown', (e) => {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          this.undo();
        } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
          e.preventDefault();
          this.redo();
        }
      });
    },

    resetForNewCanvas() {
      this.history = [];
      this.currentIndex = -1;
      this.isLocked = false;
      clearTimeout(this.saveTimer);

      if (typeof AppState !== 'undefined' && AppState.fabricCanvas) {
        delete AppState.fabricCanvas._historyManagerSync;
      }

      this.setupCanvasListeners();
    },

    setupCanvasListeners() {
      if (typeof AppState === 'undefined' || !AppState.fabricCanvas) return;
      if (AppState.fabricCanvas._historyManagerSync) return;

      AppState.fabricCanvas._historyManagerSync = true;
      const canvas = AppState.fabricCanvas;

      canvas.on('object:added', (e) => {
        if (this.isLocked || e.target?.isZoneIndicator) return;
        this.scheduleSave();
      });

      canvas.on('object:modified', () => {
        if (this.isLocked) return;
        this.scheduleSave();
      });

      canvas.on('object:removed', (e) => {
        if (this.isLocked || e.target?.isZoneIndicator) return;
        this.scheduleSave();
      });

      console.log('[HistoryManager] Listeners canvas configurés');
    },

    scheduleSave() {
      clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(() => this.saveState(), 120);
    },

    saveState() {
      if (this.isLocked) return;
      if (typeof AppState === 'undefined' || !AppState.fabricCanvas) return;
      if (typeof CanvasManager !== 'undefined' && CanvasManager.saveCurrentView) {
        CanvasManager.saveCurrentView();
      }

      const snapshot = JSON.parse(JSON.stringify(AppState.viewsData));
      const serialized = JSON.stringify(snapshot);

      if (this.currentIndex >= 0 && this.history[this.currentIndex] === serialized) {
        this.updateButtons();
        return;
      }

      if (this.currentIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.currentIndex + 1);
      }

      this.history.push(serialized);
      this.currentIndex++;

      if (this.history.length > this.maxHistory) {
        this.history.shift();
        this.currentIndex--;
      }

      this.updateButtons();
    },

    undo() {
      if (this.currentIndex <= 0) return;
      this.currentIndex--;
      this.restoreState(this.currentIndex);
    },

    redo() {
      if (this.currentIndex >= this.history.length - 1) return;
      this.currentIndex++;
      this.restoreState(this.currentIndex);
    },

    restoreState(index) {
      const serialized = this.history[index];
      if (!serialized || typeof CanvasManager === 'undefined') return;

      this.isLocked = true;
      AppState.viewsData = JSON.parse(serialized);

      CanvasManager.reloadCurrentViewObjects(() => {
        this.isLocked = false;
        this.updateButtons();
        window.dispatchEvent(new CustomEvent('configurator:history-restored'));
      });
    },

    updateButtons() {
      const btnUndo = document.getElementById('btn-undo');
      const btnRedo = document.getElementById('btn-redo');

      if (btnUndo) btnUndo.disabled = this.currentIndex <= 0;
      if (btnRedo) btnRedo.disabled = this.currentIndex >= this.history.length - 1;
    }
  };

  function waitForDependencies() {
    if (typeof AppState !== 'undefined' && typeof CanvasManager !== 'undefined') {
      HistoryManager.init();
    } else {
      setTimeout(waitForDependencies, 100);
    }
  }

  window.addEventListener('configurator:canvas-ready', () => {
    HistoryManager.resetForNewCanvas();
  });

  window.addEventListener('configurator:view-loaded', () => {
    if (HistoryManager.history.length === 0) {
      HistoryManager.saveState();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForDependencies);
  } else {
    waitForDependencies();
  }

  window.HistoryManager = HistoryManager;
})();
