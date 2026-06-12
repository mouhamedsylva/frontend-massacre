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

      const zone = AppState.editableZones[AppState.currentView];
      
      const text = new fabric.IText(PHASE1_CONFIG.DEFAULT_TEXT, {
        left: zone.x + (zone.w / 2),
        top: zone.y + (zone.h / 2),
        fontFamily: this.currentFont,
        fontSize: this.currentSize,
        fill: this.currentColor,
        originX: 'center',
        originY: 'center',
        editable: true
      });

      // Appliquer le clipping mask
      if (typeof CanvasManager !== 'undefined' && CanvasManager.applyClipPath) {
        CanvasManager.applyClipPath(text);
      }

      AppState.fabricCanvas.add(text);
      AppState.fabricCanvas.setActiveObject(text);
      AppState.fabricCanvas.renderAll();

      // Passer en mode édition
      text.enterEditing();
      text.selectAll();

      console.log('[TextManager] Texte ajouté');
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

      const zone = AppState.editableZones[AppState.currentView];

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

      AppState.fabricCanvas.add(clipart);
      AppState.fabricCanvas.setActiveObject(clipart);
      AppState.fabricCanvas.renderAll();

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
      const controlsPanel = document.querySelector('.controls-panel');
      if (!controlsPanel) return;

      const textControlsHTML = `
        <div class="control-group is-collapsed phase1-text-controls" id="group-text">
          <h3 class="control-title">✍️ Ajouter du texte</h3>
          
          <div class="control-content">
            <button class="btn btn-secondary btn-full" id="btn-add-text" type="button">
              ➕ Ajouter un texte
            </button>

            <div class="text-options" id="text-options" style="display: none; margin-top: 1rem;">
              
              <!-- Police -->
              <div class="form-group">
                <label class="form-label">Police</label>
                <select id="text-font" class="form-input">
                  ${PHASE1_CONFIG.FONTS.map(font => 
                    `<option value="${font}" ${font === 'Arial' ? 'selected' : ''}>${font}</option>`
                  ).join('')}
                </select>
              </div>

              <!-- Taille -->
              <div class="form-group">
                <label class="form-label">Taille</label>
                <select id="text-size" class="form-input">
                  ${PHASE1_CONFIG.TEXT_SIZES.map(size => 
                    `<option value="${size}" ${size === 48 ? 'selected' : ''}>${size}px</option>`
                  ).join('')}
                </select>
              </div>

              <!-- Couleur -->
              <div class="form-group">
                <label class="form-label">Couleur</label>
                <div class="color-picker-grid">
                  ${PHASE1_CONFIG.PRESET_COLORS.map(color => 
                    `<button class="color-swatch" 
                            data-color="${color.value}" 
                            style="background: ${color.value};"
                            title="${color.name}"
                            type="button"></button>`
                  ).join('')}
                </div>
                <input type="color" id="text-color-custom" class="form-input" value="#000000" style="margin-top: 0.5rem;">
              </div>

              <!-- Styles -->
              <div class="form-group">
                <label class="form-label">Style</label>
                <div class="text-style-buttons">
                  <button class="btn btn-icon" id="btn-text-bold" title="Gras" type="button">
                    <strong>B</strong>
                  </button>
                  <button class="btn btn-icon" id="btn-text-italic" title="Italique" type="button">
                    <em>I</em>
                  </button>
                  <button class="btn btn-icon" id="btn-text-underline" title="Souligné" type="button">
                    <u>U</u>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Insérer avant le groupe "Actions"
      const actionsGroup = document.getElementById('group-actions');
      if (actionsGroup) {
        actionsGroup.insertAdjacentHTML('beforebegin', textControlsHTML);
      }
    },

    /**
     * Injecte le panneau de cliparts
     */
    injectClipartPanel() {
      const controlsPanel = document.querySelector('.controls-panel');
      if (!controlsPanel) return;

      const categories = Object.keys(PHASE1_CONFIG.CLIPARTS);
      
      const clipartHTML = `
        <div class="control-group is-collapsed phase1-clipart-controls" id="group-cliparts">
          <h3 class="control-title">🎨 Ajouter un motif</h3>
          
          <div class="control-content">
            <!-- Sélecteur de catégorie -->
            <select id="clipart-category" class="form-input">
              ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
            </select>

            <!-- Grille de cliparts -->
            <div class="clipart-grid" id="clipart-grid" style="margin-top: 1rem;">
              ${this.renderClipartCategory(categories[0])}
            </div>
          </div>
        </div>
      `;

      // Insérer avant le groupe "Actions"
      const actionsGroup = document.getElementById('group-actions');
      if (actionsGroup) {
        actionsGroup.insertAdjacentHTML('beforebegin', clipartHTML);
      }
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
          this.showTextOptions();
        });
      }

      // Sélecteurs texte
      const fontSelect = document.getElementById('text-font');
      if (fontSelect) {
        fontSelect.addEventListener('change', (e) => TextManager.changeFont(e.target.value));
      }

      const sizeSelect = document.getElementById('text-size');
      if (sizeSelect) {
        sizeSelect.addEventListener('change', (e) => TextManager.changeSize(parseInt(e.target.value)));
      }

      // Boutons de couleur prédéfinie
      document.querySelectorAll('.color-swatch').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const color = e.target.dataset.color;
          TextManager.changeColor(color);
          document.getElementById('text-color-custom').value = color;
        });
      });

      // Sélecteur de couleur personnalisé
      const colorCustom = document.getElementById('text-color-custom');
      if (colorCustom) {
        colorCustom.addEventListener('input', (e) => TextManager.changeColor(e.target.value));
      }

      // Boutons de style
      const btnBold = document.getElementById('btn-text-bold');
      if (btnBold) btnBold.addEventListener('click', () => TextManager.toggleBold());

      const btnItalic = document.getElementById('btn-text-italic');
      if (btnItalic) btnItalic.addEventListener('click', () => TextManager.toggleItalic());

      const btnUnderline = document.getElementById('btn-text-underline');
      if (btnUnderline) btnUnderline.addEventListener('click', () => TextManager.toggleUnderline());

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

      // Afficher les options quand un texte est sélectionné
      if (AppState.fabricCanvas) {
        AppState.fabricCanvas.on('selection:created', (e) => {
          if (e.selected[0].type === 'i-text') {
            this.showTextOptions();
          }
        });

        AppState.fabricCanvas.on('selection:updated', (e) => {
          if (e.selected[0].type === 'i-text') {
            this.showTextOptions();
          }
        });
      }
    },

    /**
     * Configure les boutons de clipart
     */
    setupClipartButtons() {
      document.querySelectorAll('.clipart-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const emoji = e.target.dataset.emoji;
          const name = e.target.dataset.name;
          ClipartManager.addClipart(emoji, name);
        });
      });
    },

    /**
     * Affiche les options de texte
     */
    showTextOptions() {
      const options = document.getElementById('text-options');
      if (options) {
        options.style.display = 'block';
      }
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

  // Attendre que le DOM soit prêt et que le canvas soit initialisé
  function initPhase1() {
    // Vérifier que le canvas existe
    if (!AppState.fabricCanvas) {
      console.log('[Phase1] Canvas pas encore initialisé, attente...');
      setTimeout(initPhase1, 500);
      return;
    }

    UIManager.init();
    console.log('[Phase1] ✅ Fonctionnalités Texte + Cliparts activées');
  }

  // Lancer l'initialisation - attendre d'abord que AppState soit disponible
  waitForConfigurator(() => {
    console.log('[Phase1] Configurateur principal détecté, initialisation...');
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
