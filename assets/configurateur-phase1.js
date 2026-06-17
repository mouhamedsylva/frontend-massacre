/**
 * configurateur-phase1.js
 * Extension Phase 1 : Texte, Polices, Couleurs, Cliparts
 * À charger APRÈS configurateur.js
 */

(function() {
  'use strict';

  // Fonction d'attente de disponibilité du configurateur
  function waitForConfigurator(callback) {
    if (typeof AppState === 'undefined' || typeof CanvasManager === 'undefined') {
      console.warn('[Phase1] En attente du configurateur principal...');
      setTimeout(() => waitForConfigurator(callback), 100);
      return;
    }
    callback();
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // CONFIGURATION PHASE 1
  // ══════════════════════════════════════════════════════════════════════════════

  const PHASE1_CONFIG = {
    // Polices disponibles
    FONTS: [
      'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
      'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS',
      'Arial Black', 'Palatino', 'Garamond', 'Brush Script MT'
    ],

    // Couleurs prédéfinies pour flocage
    PRESET_COLORS: [
      { name: 'Noir', value: '#000000' },
      { name: 'Blanc', value: '#FFFFFF' },
      { name: 'Rouge', value: '#FF0000' },
      { name: 'Bleu', value: '#0000FF' },
      { name: 'Vert', value: '#00FF00' },
      { name: 'Jaune', value: '#FFFF00' },
      { name: 'Orange', value: '#FFA500' },
      { name: 'Violet', value: '#800080' },
      { name: 'Rose', value: '#FFC0CB' },
      { name: 'Gris', value: '#808080' },
      { name: 'Marron', value: '#A52A2A' },
      { name: 'Or', value: '#FFD700' }
    ],

    // Cliparts organisés par catégorie
    CLIPARTS: {
      'Formes': [
        { emoji: '⭐', name: 'Étoile' },
        { emoji: '❤️', name: 'Cœur' },
        { emoji: '🌟', name: 'Étoile brillante' },
        { emoji: '💎', name: 'Diamant' }
      ],
      'Symboles': [
        { emoji: '🔥', name: 'Flamme' },
        { emoji: '⚡', name: 'Éclair' },
        { emoji: '👑', name: 'Couronne' },
        { emoji: '💀', name: 'Crâne' },
        { emoji: '☠️', name: 'Tête de mort' },
        { emoji: '🔱', name: 'Trident' },
        { emoji: '✨', name: 'Étincelles' },
        { emoji: '🚀', name: 'Fusée' }
      ],
      'Musique': [
        { emoji: '🎵', name: 'Note' },
        { emoji: '🎸', name: 'Guitare' },
        { emoji: '🎤', name: 'Micro' },
        { emoji: '🎧', name: 'Casque' }
      ],
      'Sport': [
        { emoji: '⚽', name: 'Foot' },
        { emoji: '🏀', name: 'Basket' },
        { emoji: '🎯', name: 'Cible' },
        { emoji: '🏆', name: 'Trophée' }
      ],
      'Gaming': [
        { emoji: '🎮', name: 'Manette' },
        { emoji: '👾', name: 'Alien' },
        { emoji: '🕹️', name: 'Joystick' }
      ],
      'Animaux': [
        { emoji: '🦅', name: 'Aigle' },
        { emoji: '🦁', name: 'Lion' },
        { emoji: '🐺', name: 'Loup' },
        { emoji: '🦋', name: 'Papillon' }
      ]
    },

    // Tailles de texte par défaut
    TEXT_SIZES: [12, 16, 20, 24, 32, 48, 64, 72, 96, 128],

    // Texte par défaut
    DEFAULT_TEXT: 'Votre texte ici'
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // MODULE TEXTE
  // ══════════════════════════════════════════════════════════════════════════════

  const TextManager = {
    currentFont: 'Arial',
    currentSize: 48,
    currentColor: '#000000',

    /**
     * Ajoute un texte au canvas
     */
    addText() {
      if (!AppState.fabricCanvas) return;

      // Récupérer le texte saisi dans le textarea CustomInk
      const textInputField = document.getElementById('text-input');
      const userText = textInputField && textInputField.value.trim() !== '' 
        ? textInputField.value.trim() 
        : PHASE1_CONFIG.DEFAULT_TEXT;

      // Position par défaut au centre du canvas (800x600)
      let posX = 400;
      let posY = 300;

      // Centrer dans la zone éditable active
      const zone = CanvasManager.getActiveZone(AppState.currentView);
      if (zone) {
        posX = zone.x + (zone.w / 2);
        posY = zone.y + (zone.h / 2);
      }
      
      // Récupérer la couleur active
      const activeColorBtn = document.querySelector('.palette-color.active');
      const color = activeColorBtn ? activeColorBtn.dataset.color : this.currentColor;

      const text = new fabric.IText(userText, {
        left: posX,
        top: posY,
        fontFamily: this.currentFont,
        fontSize: this.currentSize,
        fill: color,
        originX: 'center',
        originY: 'center',
        editable: true,
        hasControls: true,
        hasBorders: true,
        borderColor: '#4A90E2',
        borderScaleFactor: 1.5,
        padding: 8,
      });

      if (window.TextFloatingActions) {
        window.TextFloatingActions.applyTextDefaults(text);
      }

      // Appliquer le clipping mask
      if (typeof CanvasManager !== 'undefined' && CanvasManager.applyClipPath) {
        CanvasManager.applyClipPath(text);
      }

      AppState.fabricCanvas.add(text);
      AppState.fabricCanvas.setActiveObject(text);
      AppState.fabricCanvas.renderAll();

      if (window.TextFloatingActions) {
        window.TextFloatingActions.show(text);
      }

      console.log('[TextManager] Texte ajouté avec succès:', userText);
    },

    /**
     * Change la police du texte sélectionné
     */
    changeFont(fontName) {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      
      if (activeObject && activeObject.type === 'i-text') {
        activeObject.set('fontFamily', fontName);
        this.currentFont = fontName;
        AppState.fabricCanvas.renderAll();
      } else {
        this.currentFont = fontName;
      }
    },

    /**
     * Change la taille du texte sélectionné
     */
    changeSize(size) {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      
      if (activeObject && activeObject.type === 'i-text') {
        activeObject.set('fontSize', size);
        this.currentSize = size;
        AppState.fabricCanvas.renderAll();
      } else {
        this.currentSize = size;
      }
    },

    /**
     * Change la couleur du texte sélectionné
     */
    changeColor(color) {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      
      if (activeObject && activeObject.type === 'i-text') {
        activeObject.set('fill', color);
        this.currentColor = color;
        AppState.fabricCanvas.renderAll();
      } else {
        this.currentColor = color;
      }
    },

    /**
     * Met le texte en gras
     */
    toggleBold() {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      
      if (activeObject && activeObject.type === 'i-text') {
        const currentWeight = activeObject.fontWeight;
        activeObject.set('fontWeight', currentWeight === 'bold' ? 'normal' : 'bold');
        AppState.fabricCanvas.renderAll();
      }
    },

    /**
     * Met le texte en italique
     */
    toggleItalic() {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      
      if (activeObject && activeObject.type === 'i-text') {
        const currentStyle = activeObject.fontStyle;
        activeObject.set('fontStyle', currentStyle === 'italic' ? 'normal' : 'italic');
        AppState.fabricCanvas.renderAll();
      }
    },

    /**
     * Souligne le texte
     */
    toggleUnderline() {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      
      if (activeObject && activeObject.type === 'i-text') {
        activeObject.set('underline', !activeObject.underline);
        AppState.fabricCanvas.renderAll();
      }
    }
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // MODULE CLIPARTS
  // ══════════════════════════════════════════════════════════════════════════════

  const ClipartManager = {
    /**
     * Ajoute un clipart au canvas
     */
    addClipart(emoji, name) {
      if (!AppState.fabricCanvas) return;

      const zone = CanvasManager.getActiveZone(AppState.currentView);
      if (!zone) return;

      // Créer un texte Fabric avec l'emoji (taille XXL pour bonne qualité)
      const clipart = new fabric.Text(emoji, {
        left: zone.x + (zone.w / 2),
        top: zone.y + (zone.h / 2),
        fontSize: 80,
        originX: 'center',
        originY: 'center',
        selectable: true,
        hasControls: true
      });

      // Appliquer le clipping mask
      if (typeof CanvasManager !== 'undefined' && CanvasManager.applyClipPath) {
        CanvasManager.applyClipPath(clipart);
      }

      if (window.ObjectFloatingActions) {
        window.ObjectFloatingActions.applyObjectDefaults(clipart);
      }

      AppState.fabricCanvas.add(clipart);
      AppState.fabricCanvas.setActiveObject(clipart);
      AppState.fabricCanvas.renderAll();

      if (window.ObjectFloatingActions) {
        window.ObjectFloatingActions.show(clipart);
      }

      console.log(`[ClipartManager] Clipart ajouté : ${name} (${emoji})`);
    },

    /**
     * Change la couleur du clipart sélectionné (si possible)
     */
    changeColor(color) {
      const activeObject = AppState.fabricCanvas.getActiveObject();
      
      if (activeObject && activeObject.type === 'text') {
        activeObject.set('fill', color);
        AppState.fabricCanvas.renderAll();
      }
    }
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // INTERFACE UTILISATEUR - INJECTION HTML
  // ══════════════════════════════════════════════════════════════════════════════

  const UIManager = {
    /**
     * Initialise l'interface Phase 1
     */
    init() {
      this.injectTextControls();
      this.injectClipartPanel();
      this.setupEventListeners();
      console.log('[Phase1] Interface initialisée');
    },

    /**
     * Injecte les contrôles de texte
     */
    injectTextControls() {
      // Les contrôles sont déclarés statiquement dans le template configurateur.liquid
    },

    /**
     * Injecte le panneau de cliparts
     */
    injectClipartPanel() {
      // Les contrôles sont déclarés statiquement dans le template configurateur.liquid
    },

    /**
     * Génère le HTML pour une catégorie de cliparts
     */
    renderClipartCategory(category) {
      const cliparts = PHASE1_CONFIG.CLIPARTS[category] || [];
      
      return cliparts.map(clipart => `
        <button class="clipart-item" 
                data-emoji="${clipart.emoji}" 
                data-name="${clipart.name}"
                title="${clipart.name}"
                type="button">
          ${clipart.emoji}
        </button>
      `).join('');
    },

    /**
     * Configure les event listeners
     */
    setupEventListeners() {
      // Bouton ajouter texte
      const btnAddText = document.getElementById('btn-add-text');
      if (btnAddText) {
        btnAddText.addEventListener('click', () => {
          TextManager.addText();
        });
      }

      // Sélecteurs texte
      const fontSelect = document.getElementById('text-font');
      if (fontSelect) {
        fontSelect.addEventListener('change', (e) => TextManager.changeFont(e.target.value));
      }

      // Palette de couleurs compacte (CustomInk style)
      document.querySelectorAll('.palette-color').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const color = e.currentTarget.dataset.color;
          TextManager.changeColor(color);
          
          // Marquer comme actif
          document.querySelectorAll('.palette-color').forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');
        });
      });

      // Boutons de style
      const btnBold = document.getElementById('btn-text-bold');
      if (btnBold) btnBold.addEventListener('click', () => TextManager.toggleBold());

      const btnItalic = document.getElementById('btn-text-italic');
      if (btnItalic) btnItalic.addEventListener('click', () => TextManager.toggleItalic());

      // Boutons d'alignement (liés via Advanced Controls mais ajoutés ici pour sécurité)
      const aligns = ['left', 'center', 'right'];
      aligns.forEach(align => {
        const btn = document.getElementById(`btn-text-align-${align}`);
        if (btn && window.TextAdvancedControls) {
          btn.addEventListener('click', () => window.TextAdvancedControls.alignText(align));
        }
      });

      // Sélecteur de catégorie clipart
      const categorySelect = document.getElementById('clipart-category');
      if (categorySelect) {
        categorySelect.addEventListener('change', (e) => {
          const grid = document.getElementById('clipart-grid');
          if (grid) {
            grid.innerHTML = this.renderClipartCategory(e.target.value);
            this.setupClipartButtons();
          }
        });
      }

      // Boutons clipart
      this.setupClipartButtons();
    },

    /**
     * Configure les boutons de clipart
     */
    setupClipartButtons() {
      document.querySelectorAll('.clipart-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const emoji = e.currentTarget.dataset.emoji;
          const name = e.currentTarget.dataset.name;
          ClipartManager.addClipart(emoji, name);
        });
      });
    }
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // STYLES CSS POUR PHASE 1
  // ══════════════════════════════════════════════════════════════════════════════

  const styles = `
    <style>
      /* Grille de sélection de couleur */
      .color-picker-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 0.5rem;
      }

      .color-swatch {
        width: 100%;
        height: 40px;
        border: 2px solid #e0e0e0;
        border-radius: 4px;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .color-swatch:hover {
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }

      /* Boutons de style texte */
      .text-style-buttons {
        display: flex;
        gap: 0.5rem;
      }

      .btn-icon {
        width: 50px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8f8f8;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1.2rem;
        transition: all 0.2s;
      }

      .btn-icon:hover {
        background: #e0e0e0;
      }

      .btn-icon:active,
      .btn-icon.active {
        background: #000;
        color: #fff;
        border-color: #000;
      }

      /* Grille de cliparts */
      .clipart-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.5rem;
      }

      .clipart-item {
        width: 100%;
        height: 60px;
        font-size: 2rem;
        background: #f8f8f8;
        border: 2px solid #e0e0e0;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .clipart-item:hover {
        background: #fff;
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }

      /* Form groups */
      .phase1-text-controls .form-group,
      .phase1-clipart-controls .form-group {
        margin-bottom: 1rem;
      }

      .phase1-text-controls .form-label,
      .phase1-clipart-controls .form-label {
        display: block;
        font-size: 0.875rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: var(--color-text);
      }

      .phase1-text-controls .form-input,
      .phase1-clipart-controls .form-input {
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

  let phase1Initialized = false;

  function initPhase1() {
    if (!AppState.fabricCanvas) return;

    if (!phase1Initialized) {
      UIManager.init();
      phase1Initialized = true;
    }

    setupCanvasSelectionSync();
    console.log('[Phase1] ✅ Fonctionnalités Texte + Cliparts activées');
  }

  function setupCanvasSelectionSync() {
    if (!AppState.fabricCanvas || AppState.fabricCanvas._phase1SelectionSync) return;
    AppState.fabricCanvas._phase1SelectionSync = true;

    AppState.fabricCanvas.on('selection:created', (e) => {
      const obj = e.selected[0];
      if (obj && obj.type === 'i-text') {
        const input = document.getElementById('text-input');
        if (input) input.value = obj.text;
      }
    });

    AppState.fabricCanvas.on('selection:updated', (e) => {
      const obj = e.selected[0];
      if (obj && obj.type === 'i-text') {
        const input = document.getElementById('text-input');
        if (input) input.value = obj.text;
      }
    });
  }

  waitForConfigurator(() => {
    console.log('[Phase1] Configurateur principal détecté, initialisation...');
    window.addEventListener('configurator:canvas-ready', initPhase1);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initPhase1);
    } else {
      initPhase1();
    }
  });

  // Exposer les modules pour debug
  window.PHASE1 = {
    TextManager,
    ClipartManager,
    UIManager,
    CONFIG: PHASE1_CONFIG
  };


})();