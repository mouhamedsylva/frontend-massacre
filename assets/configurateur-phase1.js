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
      // Sans-Serif
      'Arial','Arial Black','Arial Narrow','Helvetica','Verdana','Tahoma',
      'Trebuchet MS','Gill Sans','Impact','Century Gothic','Franklin Gothic Medium',
      'Candara','Calibri','Segoe UI',
      // Serif
      'Times New Roman','Georgia','Garamond','Palatino','Cambria','Baskerville',
      'Bodoni MT','Constantia',
      // Monospace
      'Courier New','Courier','Lucida Console','Monaco','Consolas',
      // Script
      'Brush Script MT','Comic Sans MS','Lucida Handwriting','Papyrus','Bradley Hand',
      // Décoratif
      'Copperplate','Rockwell','Marker Felt','Chalkduster','Haettenschweiler'
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

    // Cliparts organisés par catégories (onglet "Arts").
    // Chaque catégorie a soit "items" (grille directe), soit "subcategories"
    // (ex. Emojis -> Smileys, Animaux, Nourriture, Mains...). Pour ajouter une
    // sous-catégorie à n'importe quelle catégorie, il suffit de remplacer son
    // "items" par un tableau "subcategories" suivant le même modèle qu'Emojis.
    CLIPART_CATEGORIES: [
    {
      id: 'populaire',
      label: 'Tendances',
      icon: '❤️',
      items: [
        { emoji: '⭐', name: 'Étoile' },
        { emoji: '❤️', name: 'Cœur' },
        { emoji: '🔥', name: 'Flamme' },
        { emoji: '✨', name: 'Étincelles' },
        { emoji: '👑', name: 'Couronne' },
        { emoji: '🏆', name: 'Trophée' },
        { emoji: '🎉', name: 'Confettis' },
        { emoji: '💯', name: 'Cent pour cent' }
      ]
    },
    {
      id: 'emojis',
      label: 'Emojis',
      icon: '😎',
      subcategories: [
        {
          id: 'emojis-smileys',
          label: 'Smileys & Personnes',
          items: [
            { emoji: '😀', name: 'Sourire' },
            { emoji: '😂', name: 'Rire aux larmes' },
            { emoji: '😍', name: 'Yeux en cœur' },
            { emoji: '😎', name: 'Lunettes de soleil' },
            { emoji: '🥳', name: 'Fête' },
            { emoji: '😴', name: 'Endormi' },
            { emoji: '🤔', name: 'Pensif' },
            { emoji: '😭', name: 'Pleurs' }
          ]
        },
        {
          id: 'emojis-animaux',
          label: 'Animaux & Nature',
          items: [
            { emoji: '🐶', name: 'Chien' },
            { emoji: '🐱', name: 'Chat' },
            { emoji: '🦁', name: 'Lion' },
            { emoji: '🐻', name: 'Ours' },
            { emoji: '🦋', name: 'Papillon' },
            { emoji: '🌸', name: 'Fleur de cerisier' },
            { emoji: '🌵', name: 'Cactus' },
            { emoji: '🌈', name: 'Arc-en-ciel' }
          ]
        },
        {
          id: 'emojis-nourriture',
          label: 'Nourriture & Boissons',
          items: [
            { emoji: '🍕', name: 'Pizza' },
            { emoji: '🍔', name: 'Burger' },
            { emoji: '🍩', name: 'Donut' },
            { emoji: '🍦', name: 'Glace' },
            { emoji: '☕', name: 'Café' },
            { emoji: '🍺', name: 'Bière' },
            { emoji: '🍓', name: 'Fraise' },
            { emoji: '🥑', name: 'Avocat' }
          ]
        },
        {
          id: 'emojis-activites',
          label: 'Activités',
          items: [
            { emoji: '⚽', name: 'Football' },
            { emoji: '🏀', name: 'Basketball' },
            { emoji: '🎮', name: 'Manette' },
            { emoji: '🎸', name: 'Guitare' },
            { emoji: '🎨', name: 'Palette' },
            { emoji: '🎬', name: 'Cinéma' }
          ]
        },
        {
          id: 'emojis-voyage',
          label: 'Voyages & Lieux',
          items: [
            { emoji: '✈️', name: 'Avion' },
            { emoji: '🚗', name: 'Voiture' },
            { emoji: '🏖️', name: 'Plage' },
            { emoji: '🏔️', name: 'Montagne' },
            { emoji: '🗽', name: 'Statue de la Liberté' },
            { emoji: '🌍', name: 'Globe' }
          ]
        },
        {
          id: 'emojis-objets',
          label: 'Objets',
          items: [
            { emoji: '💡', name: 'Ampoule' },
            { emoji: '📱', name: 'Téléphone' },
            { emoji: '🎁', name: 'Cadeau' },
            { emoji: '🔑', name: 'Clé' },
            { emoji: '⏰', name: 'Réveil' },
            { emoji: '📚', name: 'Livres' }
          ]
        },
        {
          id: 'emojis-symboles',
          label: 'Symboles',
          items: [
            { emoji: '❤️', name: 'Cœur' },
            { emoji: '💯', name: 'Cent pour cent' },
            { emoji: '⚡', name: 'Éclair' },
            { emoji: '♻️', name: 'Recyclage' },
            { emoji: '☮️', name: 'Paix' },
            { emoji: '✔️', name: 'Coche' }
          ]
        },
        {
          id: 'emojis-mains',
          label: 'Mains',
          items: [
            { emoji: '👍', name: 'Pouce levé' },
            { emoji: '👎', name: 'Pouce baissé' },
            { emoji: '👋', name: 'Coucou' },
            { emoji: '✌️', name: 'Victoire' },
            { emoji: '🤝', name: 'Poignée de main' },
            { emoji: '🙏', name: 'Prière' },
            { emoji: '💪', name: 'Biceps' },
            { emoji: '👏', name: 'Applaudissements' }
          ]
        },
        {
          id: 'emojis-drapeaux',
          label: 'Drapeaux',
          items: [
            { emoji: '🏳️', name: 'Drapeau blanc' },
            { emoji: '🏁', name: 'Damier' },
            { emoji: '🇫🇷', name: 'France' },
            { emoji: '🇺🇸', name: 'États-Unis' },
            { emoji: '🇸🇳', name: 'Sénégal' }
          ]
        }
      ]
    },
    {
      id: 'formes-symboles',
      label: 'Formes & Symboles',
      icon: '⭐',
      items: [
        { emoji: '⭐', name: 'Étoile' },
        { emoji: '🌟', name: 'Étoile brillante' },
        { emoji: '💎', name: 'Diamant' },
        { emoji: '🔺', name: 'Triangle' },
        { emoji: '⬛', name: 'Carré' },
        { emoji: '🔱', name: 'Trident' },
        { emoji: '☠️', name: 'Tête de mort' },
        { emoji: '💀', name: 'Crâne' },
        { emoji: '⚡', name: 'Éclair' },
        { emoji: '🔥', name: 'Flamme' }
      ]
    },
    {
      id: 'sport-jeux',
      label: 'Sport & Jeux',
      icon: '🏀',
      items: [
        { emoji: '⚽', name: 'Football' },
        { emoji: '🏀', name: 'Basketball' },
        { emoji: '🏈', name: 'Football américain' },
        { emoji: '⚾', name: 'Baseball' },
        { emoji: '🎾', name: 'Tennis' },
        { emoji: '🏐', name: 'Volleyball' },
        { emoji: '🎯', name: 'Cible' },
        { emoji: '🏆', name: 'Trophée' },
        { emoji: '🎮', name: 'Manette' },
        { emoji: '👾', name: 'Alien' },
        { emoji: '🕹️', name: 'Joystick' }
      ]
    },
    {
      id: 'lettres-chiffres',
      label: 'Lettres & Chiffres',
      icon: '🔤',
      items: [
        { emoji: '0️⃣', name: 'Zéro' },
        { emoji: '1️⃣', name: 'Un' },
        { emoji: '2️⃣', name: 'Deux' },
        { emoji: '3️⃣', name: 'Trois' },
        { emoji: '4️⃣', name: 'Quatre' },
        { emoji: '5️⃣', name: 'Cinq' },
        { emoji: '#️⃣', name: 'Dièse' },
        { emoji: '🔠', name: 'Majuscules' },
        { emoji: '🔡', name: 'Minuscules' },
        { emoji: '🔢', name: 'Chiffres' }
      ]
    },
    {
      id: 'animaux',
      label: 'Animaux',
      icon: '🦁',
      items: [
        { emoji: '🦅', name: 'Aigle' },
        { emoji: '🦁', name: 'Lion' },
        { emoji: '🐺', name: 'Loup' },
        { emoji: '🦋', name: 'Papillon' },
        { emoji: '🐻', name: 'Ours' },
        { emoji: '🐯', name: 'Tigre' },
        { emoji: '🦈', name: 'Requin' },
        { emoji: '🐴', name: 'Cheval' },
        { emoji: '🐍', name: 'Serpent' },
        { emoji: '🦂', name: 'Scorpion' }
      ]
    },
    {
      id: 'mascottes',
      label: 'Mascottes',
      icon: '🐾',
      items: [
        { emoji: '🐾', name: 'Empreintes' },
        { emoji: '🦅', name: 'Mascotte Aigle' },
        { emoji: '🐯', name: 'Mascotte Tigre' },
        { emoji: '🦁', name: 'Mascotte Lion' },
        { emoji: '🐻', name: 'Mascotte Ours' },
        { emoji: '🐺', name: 'Mascotte Loup' },
        { emoji: '🦊', name: 'Mascotte Renard' },
        { emoji: '🐗', name: 'Mascotte Sanglier' }
      ]
    },
    {
      id: 'nature',
      label: 'Nature',
      icon: '🏔️',
      items: [
        { emoji: '🏔️', name: 'Montagne' },
        { emoji: '🌲', name: 'Sapin' },
        { emoji: '🌊', name: 'Vague' },
        { emoji: '☀️', name: 'Soleil' },
        { emoji: '🌙', name: 'Lune' },
        { emoji: '🌸', name: 'Fleur' },
        { emoji: '🍃', name: 'Feuilles' },
        { emoji: '🌵', name: 'Cactus' },
        { emoji: '🌈', name: 'Arc-en-ciel' }
      ]
    },
    {
      id: 'amerique',
      label: 'Amérique',
      icon: '🦅',
      items: [
        { emoji: '🇺🇸', name: 'Drapeau USA' },
        { emoji: '🦅', name: 'Aigle' },
        { emoji: '🗽', name: 'Statue de la Liberté' },
        { emoji: '⭐', name: 'Étoile' },
        { emoji: '🎆', name: 'Feu d\'artifice' }
      ]
    },
    {
      id: 'fetes-evenements',
      label: 'Fêtes & Événements',
      icon: '🎉',
      items: [
        { emoji: '🎉', name: 'Confettis' },
        { emoji: '🎊', name: 'Cotillons' },
        { emoji: '🎈', name: 'Ballon' },
        { emoji: '🎂', name: 'Gâteau' },
        { emoji: '🕯️', name: 'Bougie' },
        { emoji: '🎆', name: 'Feu d\'artifice' },
        { emoji: '🧨', name: 'Pétard' },
        { emoji: '🎃', name: 'Citrouille' }
      ]
    },
    {
      id: 'militaire',
      label: 'Militaire',
      icon: '🎖️',
      items: [
        { emoji: '🎖️', name: 'Médaille' },
        { emoji: '🏅', name: 'Médaille sportive' },
        { emoji: '⚔️', name: 'Épée' },
        { emoji: '🛡️', name: 'Bouclier' },
        { emoji: '🔫', name: 'Pistolet' },
        { emoji: '✈️', name: 'Avion militaire' },
        { emoji: '🚁', name: 'Hélicoptère' }
      ]
    },
    {
      id: 'professions',
      label: 'Professions',
      icon: '👔',
      items: [
        { emoji: '👔', name: 'Cravate' },
        { emoji: '👩‍⚕️', name: 'Médecin' },
        { emoji: '👨‍🏫', name: 'Enseignant' },
        { emoji: '👨‍🚒', name: 'Pompier' },
        { emoji: '👨‍✈️', name: 'Pilote' },
        { emoji: '👨‍🍳', name: 'Chef cuisinier' },
        { emoji: '👨‍🔧', name: 'Mécanicien' },
        { emoji: '👩‍💼', name: 'Femme d\'affaires' }
      ]
    },
    {
      id: 'colleges',
      label: 'Universités',
      icon: '🎓',
      items: [
        { emoji: '🎓', name: 'Diplômé' },
        { emoji: '📚', name: 'Livres' },
        { emoji: '📝', name: 'Devoir' },
        { emoji: '✏️', name: 'Crayon' },
        { emoji: '🏫', name: 'École' },
        { emoji: '📖', name: 'Livre ouvert' },
        { emoji: '🔬', name: 'Laboratoire' }
      ]
    },
    {
      id: 'musique',
      label: 'Musique',
      icon: '🎵',
      items: [
        { emoji: '🎵', name: 'Note de musique' },
        { emoji: '🎶', name: 'Notes de musique' },
        { emoji: '🎸', name: 'Guitare' },
        { emoji: '🎹', name: 'Piano' },
        { emoji: '🎺', name: 'Trompette' },
        { emoji: '🎻', name: 'Violon' },
        { emoji: '🥁', name: 'Batterie' },
        { emoji: '🎧', name: 'Casque audio' }
      ]
    },
    {
      id: 'transport',
      label: 'Transport',
      icon: '🚗',
      items: [
        { emoji: '🚗', name: 'Voiture' },
        { emoji: '🚌', name: 'Bus' },
        { emoji: '✈️', name: 'Avion' },
        { emoji: '🚢', name: 'Bateau' },
        { emoji: '🚲', name: 'Vélo' },
        { emoji: '🏍️', name: 'Moto' },
        { emoji: '🚆', name: 'Train' },
        { emoji: '🚀', name: 'Fusée' }
      ]
    },
    {
      id: 'vie-grecque',
      label: 'Vie Greque',
      icon: '🏛️',
      items: [
        { emoji: '🏛️', name: 'Parthénon' },
        { emoji: '🍷', name: 'Vin' },
        { emoji: '⚱️', name: 'Urne' },
        { emoji: '📜', name: 'Parchemin' },
        { emoji: '💛', name: 'Cœur jaune' },
        { emoji: '🤝', name: 'Fraternité' }
      ]
    },
    {
      id: 'ecole',
      label: 'École',
      icon: '📚',
      items: [
        { emoji: '📚', name: 'Livres' },
        { emoji: '🎒', name: 'Cartable' },
        { emoji: '📝', name: 'Devoir' },
        { emoji: '✏️', name: 'Crayon' },
        { emoji: '🖍️', name: 'Crayon de couleur' },
        { emoji: '📏', name: 'Règle' },
        { emoji: '🔬', name: 'Microscope' },
        { emoji: '🌎', name: 'Globe' }
      ]
    },
    {
      id: 'charite',
      label: 'Charité',
      icon: '🤝',
      items: [
        { emoji: '🤝', name: 'Poignée de main' },
        { emoji: '❤️', name: 'Cœur' },
        { emoji: '🎗️', name: 'Ruban' },
        { emoji: '🕊️', name: 'Colombe' },
        { emoji: '🙏', name: 'Prière' },
        { emoji: '💰', name: 'Argent' },
        { emoji: '🤲', name: 'Mains tendues' }
      ]
    },
    {
      id: 'personnes',
      label: 'Personnes',
      icon: '👤',
      items: [
        { emoji: '👤', name: 'Profil' },
        { emoji: '👥', name: 'Groupes' },
        { emoji: '🧑', name: 'Personne' },
        { emoji: '👩', name: 'Femme' },
        { emoji: '👨', name: 'Homme' },
        { emoji: '🧒', name: 'Enfant' },
        { emoji: '👴', name: 'Senior' },
        { emoji: '👶', name: 'Bébé' }
      ]
    },
    {
      id: 'religion',
      label: 'Religion',
      icon: '⛪',
      items: [
        { emoji: '⛪', name: 'Église' },
        { emoji: '🕌', name: 'Mosquée' },
        { emoji: '🕍', name: 'Synagogue' },
        { emoji: '🙏', name: 'Prière' },
        { emoji: '✝️', name: 'Croix chrétienne' },
        { emoji: '☸️', name: 'Roue de Dharma' },
        { emoji: '🕉️', name: 'Om' }
      ]
    },
    {
      id: 'nourriture-boissons',
      label: 'Nourriture & Boissons',
      icon: '🍽️',
      items: [
        { emoji: '🍽️', name: 'Couvert' },
        { emoji: '🍕', name: 'Pizza' },
        { emoji: '🍔', name: 'Burger' },
        { emoji: '🍣', name: 'Sushi' },
        { emoji: '🍩', name: 'Donut' },
        { emoji: '🍦', name: 'Glace' },
        { emoji: '☕', name: 'Café' },
        { emoji: '🍷', name: 'Vin' },
        { emoji: '🍺', name: 'Bière' },
        { emoji: '🥂', name: 'Champagne' }
      ]
    },
    {
      id: 'saisons-fetes',
      label: 'Saisons & Fêtes',
      icon: '❄️',
      items: [
        { emoji: '❄️', name: 'Flocon' },
        { emoji: '☀️', name: 'Soleil' },
        { emoji: '🍂', name: 'Feuille automne' },
        { emoji: '🌷', name: 'Tulipe' },
        { emoji: '🎄', name: 'Sapin de Noël' },
        { emoji: '🎃', name: 'Citrouille' },
        { emoji: '🦃', name: 'Dinde' },
        { emoji: '🐰', name: 'Lapin' }
      ]
    },
    {
      id: 'phrases-citations',
      label: 'Phrases & Citations',
      icon: '💬',
      items: [
        { emoji: '💬', name: 'Bulles' },
        { emoji: '💭', name: 'Pensée' },
        { emoji: '✍️', name: 'Écrire' },
        { emoji: '📝', name: 'Note' },
        { emoji: '📢', name: 'Haute-parleur' },
        { emoji: '📣', name: 'Mégaphone' }
      ]
    },
    {
      id: 'voyage',
      label: 'Voyage',
      icon: '🌍',
      items: [
        { emoji: '🌍', name: 'Globe' },
        { emoji: '✈️', name: 'Avion' },
        { emoji: '🚗', name: 'Voiture' },
        { emoji: '🏖️', name: 'Plage' },
        { emoji: '🏔️', name: 'Montagne' },
        { emoji: '🗽', name: 'Statue de la Liberté' },
        { emoji: '🗼', name: 'Tour Eiffel' },
        { emoji: '🏯', name: 'Château' }
      ]
    }
  ],

    // Tailles de texte par défaut
    TEXT_SIZES: [12, 16, 20, 24, 32, 48, 64, 72, 96, 128],

    // Texte par défaut
    DEFAULT_TEXT: 'Votre texte ici'
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // MODULE TEXTE
  // ══════════════════════════════════════════════════════════════════════════════

  const TextManager = {
    currentFont: 'Roboto',
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

      // Activer les contrôles personnalisés
      text.set({
        hasControls: true,
        hasBorders: true,
        lockScalingFlip: true
      });

      // Appliquer le clipping mask
      if (typeof CanvasManager !== 'undefined' && CanvasManager.applyClipPath) {
        CanvasManager.applyClipPath(text);
      }

      AppState.fabricCanvas.add(text);
      AppState.fabricCanvas.setActiveObject(text);
      AppState.fabricCanvas.renderAll();

      // ✅ Ouvrir automatiquement le panneau d'édition
      UIManager.showEditSection(text);

      console.log('[TextManager] Texte ajouté avec succès:', userText);
    },

    /**
     * Change la police du texte sélectionné
     */
    changeFont(fontName) {
      this.currentFont = fontName;
      const activeObject = AppState.fabricCanvas.getActiveObject();
      // Cas warp : l'objet actif est une image, le texte source est dans _linkedTextObj
      const textObj = (activeObject && activeObject.isWarpImage && activeObject._linkedTextObj)
        ? activeObject._linkedTextObj
        : (activeObject && activeObject.type === 'i-text' ? activeObject : null);
      if (textObj) {
        textObj.set('fontFamily', fontName);
        // Forcer re-rendu warp si disponible
        if (activeObject && activeObject.isWarpImage && window.TextShapeWarp) {
          window.TextShapeWarp.rerender && window.TextShapeWarp.rerender(textObj);
        }
        AppState.fabricCanvas.renderAll();
      }
    },

    /**
     * Change la taille du texte sélectionné
     */
    changeSize(size) {
      this.currentSize = size;
      const activeObject = AppState.fabricCanvas.getActiveObject();
      const textObj = (activeObject && activeObject.isWarpImage && activeObject._linkedTextObj)
        ? activeObject._linkedTextObj
        : (activeObject && activeObject.type === 'i-text' ? activeObject : null);
      if (textObj) {
        textObj.set('fontSize', size);
        if (activeObject && activeObject.isWarpImage && window.TextShapeWarp) {
          window.TextShapeWarp.rerender && window.TextShapeWarp.rerender(textObj);
        }
        AppState.fabricCanvas.renderAll();
      }
    },

    /**
     * Change la couleur du texte sélectionné
     */
    changeColor(color) {
      this.currentColor = color;
      const activeObject = AppState.fabricCanvas.getActiveObject();
      const textObj = (activeObject && activeObject.isWarpImage && activeObject._linkedTextObj)
        ? activeObject._linkedTextObj
        : (activeObject && activeObject.type === 'i-text' ? activeObject : null);
      if (textObj) {
        textObj.set('fill', color);
        if (activeObject && activeObject.isWarpImage && window.TextShapeWarp) {
          window.TextShapeWarp.rerender && window.TextShapeWarp.rerender(textObj);
        }
        AppState.fabricCanvas.renderAll();
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

      // Activer les contrôles personnalisés
      clipart.set({
        hasControls: true,
        hasBorders: true,
        lockScalingFlip: true
      });

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
// FONT PICKER — Sélecteur visuel de polices avec aperçu et recherche
// ══════════════════════════════════════════════════════════════════════════════

const FontPicker = {

  // Liste exhaustive groupée
  FONTS: [
    // Sans-Serif
    'Arial','Arial Black','Arial Narrow','Helvetica','Verdana','Tahoma',
    'Trebuchet MS','Impact','Century Gothic','Franklin Gothic Medium',
    'Candara','Calibri','Segoe UI','Gill Sans','Optima',
    // Serif
    'Times New Roman','Georgia','Garamond','Palatino','Cambria',
    'Baskerville','Bodoni MT','Constantia','Book Antiqua','Hoefler Text',
    'Big Caslon','Didot',
    // Monospace
    'Courier New','Courier','Lucida Console','Monaco','Consolas',
    'Lucida Sans Typewriter','Andale Mono',
    // Script / Cursive
    'Brush Script MT','Comic Sans MS','Lucida Handwriting','Papyrus',
    'Bradley Hand','Segoe Script','Snell Roundhand','Apple Chancery',
    // Décoratif
    'Copperplate','Copperplate Gothic Light','Rockwell','Rockwell Extra Bold',
    'Marker Felt','Chalkduster','Haettenschweiler','Luminari','Trattatello',
    'Herculanum','Jazz LET','Stencil Std',
  ],

  currentFont: 'Arial',
  _filtered: [],

  init() {
    const btn    = document.getElementById('btn-open-font-picker');
    const panel  = document.getElementById('font-picker-panel');
    const closeBtn = document.getElementById('btn-font-close');
    const backBtn  = document.getElementById('btn-font-back');
    const search   = document.getElementById('font-search-input');

    if (!btn || !panel) return;

    // Pré-remplir la liste
    this._filtered = [...this.FONTS];
    this._renderList(this._filtered);

    // Ouvrir / fermer le panneau
    btn.addEventListener('click', () => {
      const isOpen = panel.style.display === 'block';
      panel.style.display = isOpen ? 'none' : 'block';
      if (!isOpen) {
        search.value = '';
        this._filtered = [...this.FONTS];
        this._renderList(this._filtered);
        search.focus();
      }
    });

    closeBtn?.addEventListener('click', () => { panel.style.display = 'none'; });
    backBtn?.addEventListener('click',  () => { panel.style.display = 'none'; });

    // Recherche en temps réel
    search?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      this._filtered = q
        ? this.FONTS.filter(f => f.toLowerCase().includes(q))
        : [...this.FONTS];
      this._renderList(this._filtered);
    });

    // Fermer si clic en dehors
    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !panel.contains(e.target)) {
        panel.style.display = 'none';
      }
    });
  },

  _renderList(fonts) {
    const list = document.getElementById('font-picker-list');
    if (!list) return;

    if (fonts.length === 0) {
      list.innerHTML = '<div style="padding: 1rem; text-align: center; color: #888; font-size: 0.85rem;">Aucune police trouvée</div>';
      return;
    }

    list.innerHTML = fonts.map(font => `
      <button
        type="button"
        class="font-picker-item${font === this.currentFont ? ' selected' : ''}"
        data-font="${font}"
        style="
          display: block;
          width: 100%;
          padding: 0.6rem 1rem;
          border: none;
          border-bottom: 1px solid #f0f0f0;
          background: ${font === this.currentFont ? '#f0f4ff' : '#fff'};
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        "
      >
        <span style="
          font-family: '${font}', sans-serif;
          font-size: 1.4rem;
          display: block;
          color: #1a1a1a;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        ">${this._getPreviewText()}</span>
        <span style="
          font-size: 0.75rem;
          color: #666;
          display: block;
          margin-top: 0.1rem;
        ">${font}</span>
      </button>
    `).join('');

    // Events sur chaque item
    list.querySelectorAll('.font-picker-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        if (!item.classList.contains('selected')) item.style.background = '#f8f8f8';
      });
      item.addEventListener('mouseleave', () => {
        if (!item.classList.contains('selected')) item.style.background = '#fff';
      });
      item.addEventListener('click', () => {
        const font = item.dataset.font;
        this.selectFont(font);
      });
    });
  },

  selectFont(font) {
    this.currentFont = font;

    // Mettre à jour le label du bouton déclencheur
    const label = document.getElementById('font-picker-label');
    if (label) {
      label.textContent = font;
      label.style.fontFamily = `'${font}', sans-serif`;
    }

    // Appliquer au canvas
    TextManager.changeFont(font);

    // Fermer le panneau
    const panel = document.getElementById('font-picker-panel');
    if (panel) panel.style.display = 'none';

    // Re-rendre pour mettre à jour la sélection active
    this._renderList(this._filtered);
  },

  // Appelé par showEditSection pour synchroniser le label quand on sélectionne un objet
  syncFromObject(obj) {
    if (!obj) return;
    const font = obj.fontFamily || 'Arial';
    this.currentFont = font;
    const label = document.getElementById('font-picker-label');
    if (label) {
      label.textContent = font;
      label.style.fontFamily = `'${font}', sans-serif`;
    }
  },

  _getPreviewText() {
    // Essayer de lire le texte de l'objet actif sur le canvas
    const canvas = window.AppState && AppState.fabricCanvas;
    if (canvas) {
      const obj = canvas.getActiveObject();
      if (obj && obj.type === 'i-text' && obj.text && obj.text.trim() !== '') {
        // Limiter à 12 caractères pour ne pas déborder
        const t = obj.text.trim();
        return t.length > 12 ? t.substring(0, 12) + '…' : t;
      }
    }
    // Fallback : lire le champ texte si rien n'est sélectionné
    const input = document.getElementById('text-input') || document.getElementById('text-input-edit');
    if (input && input.value.trim() !== '') {
      const t = input.value.trim();
      return t.length > 12 ? t.substring(0, 12) + '…' : t;
    }
    return 'Aa';
  },
};


// ══════════════════════════════════════════════════════════════════════════════
// OPACITY MANAGER — Transparence globale pour tout objet sélectionné
// ══════════════════════════════════════════════════════════════════════════════

const OpacityManager = {

  init() {
    const slider = document.getElementById('global-opacity-slider');
    const num    = document.getElementById('global-opacity-value');

    if (!slider || !num) {
      console.warn('[OpacityManager] Éléments HTML slider/num introuvables. Panneau non initialisé.');
      return;
    }

    const apply = (val) => {
      const obj = AppState.fabricCanvas?.getActiveObject();
      if (obj) {
        console.log('[OpacityManager] Application opacité:', val, '% à l\'objet', obj.type);
        obj.set('opacity', parseFloat(val) / 100);
        AppState.fabricCanvas.renderAll();
      }
    };

    slider.addEventListener('input', (e) => {
      if (num) num.value = e.target.value;
      apply(e.target.value);
    });

    num.addEventListener('input', (e) => {
      // Clamp entre 0 et 100
      let v = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
      e.target.value = v;
      if (slider) slider.value = v;
      apply(v);
    });

    // Écouter toute sélection sur le canvas
    const bindCanvas = () => {
      if (!AppState.fabricCanvas) {
        console.warn('[OpacityManager] Canvas non disponible pour binding');
        return;
      }

      console.log('[OpacityManager] Binding des événements de sélection au canvas');

      AppState.fabricCanvas.on('selection:created', (e) => {
        console.log('[OpacityManager] selection:created', e);
        const obj = e.selected && e.selected[0] ? e.selected[0] : e.target;
        this.onSelect(obj);
      });
      
      AppState.fabricCanvas.on('selection:updated', (e) => {
        console.log('[OpacityManager] selection:updated', e);
        const obj = e.selected && e.selected[0] ? e.selected[0] : e.target;
        this.onSelect(obj);
      });
      
      AppState.fabricCanvas.on('selection:cleared', () => {
        console.log('[OpacityManager] selection:cleared');
        this.hide();
      });
    };

    // Le canvas peut ne pas être prêt immédiatement
    if (AppState.fabricCanvas) {
      console.log('[OpacityManager] Canvas déjà prêt, binding immédiat');
      bindCanvas();
    } else {
      console.log('[OpacityManager] Attente événement configurator:canvas-ready');
      window.addEventListener('configurator:canvas-ready', bindCanvas);
    }
  },

  onSelect(obj) {
    if (!obj) {
      console.log('[OpacityManager] Aucun objet sélectionné');
      this.hide();
      return;
    }
    
    console.log('[OpacityManager] Objet sélectionné:', obj.type, 'opacity:', obj.opacity);
    this.show();
    const val = Math.round((obj.opacity !== undefined ? obj.opacity : 1) * 100);
    const slider = document.getElementById('global-opacity-slider');
    const num    = document.getElementById('global-opacity-value');
    if (slider) slider.value = val;
    if (num)    num.value    = val;
    console.log('[OpacityManager] Panneau mis à jour avec valeur:', val, '%');
  },

  show() {
    const panel = document.getElementById('panel-opacity');
    if (panel) {
      panel.style.display = 'block';
      console.log('[OpacityManager] Panneau affiché');
    } else {
      console.error('[OpacityManager] Élément #panel-opacity introuvable dans le DOM');
    }
  },

  hide() {
    const panel = document.getElementById('panel-opacity');
    if (panel) {
      panel.style.display = 'none';
      console.log('[OpacityManager] Panneau masqué');
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
      // this.setupTextPanelBehavior();
    },

    /**
     * Injecte les contrôles de texte
     */
    injectTextControls() {
      // Les contrôles sont déclarés statiquement dans le template configurateur.liquid
    },
    

    /**
     * Injecte le panneau de cliparts (affiche la grille de catégories)
     */
    injectClipartPanel() {
      this.renderCategoryGrid();
    },

    // État de navigation du panneau Arts
    clipartNav: {
      level: 'categories', // 'categories' | 'subcategories' | 'items'
      categoryId: null,
      subcategoryId: null
    },

    /**
     * Récupère une catégorie par son id
     */
    getCategory(categoryId) {
      return PHASE1_CONFIG.CLIPART_CATEGORIES.find(c => c.id === categoryId) || null;
    },

    /**
     * Affiche/masque les 3 blocs (catégories / sous-catégories / items)
     * et le fil d'Ariane, selon le niveau courant
     */
    setClipartLevel(level) {
      this.clipartNav.level = level;

      const categoryGrid = document.getElementById('clipart-category-grid');
      const subcategoryGrid = document.getElementById('clipart-subcategory-grid');
      const itemGrid = document.getElementById('clipart-grid');
      const breadcrumb = document.getElementById('clipart-breadcrumb');

      if (categoryGrid) categoryGrid.style.display = level === 'categories' ? 'grid' : 'none';
      if (subcategoryGrid) subcategoryGrid.style.display = level === 'subcategories' ? 'grid' : 'none';
      if (itemGrid) itemGrid.style.display = level === 'items' ? 'grid' : 'none';
      if (breadcrumb) breadcrumb.style.display = level === 'categories' ? 'none' : 'flex';
    },

    /**
     * Niveau 1 : génère les cartes de catégories (icône + libellé)
     */
    renderCategoryGrid() {
      const grid = document.getElementById('clipart-category-grid');
      if (!grid) return;

      grid.innerHTML = PHASE1_CONFIG.CLIPART_CATEGORIES.map(cat => `
        <button class="clipart-category-card" data-category-id="${cat.id}" type="button">
          <span class="clipart-category-icon">${cat.icon}</span>
          <span class="clipart-category-label">${cat.label}</span>
        </button>
      `).join('');

      grid.querySelectorAll('.clipart-category-card').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.openCategory(e.currentTarget.dataset.categoryId);
        });
      });

      this.setClipartLevel('categories');
    },

    /**
     * Ouvre une catégorie : sous-catégories si elle en a, sinon grille d'items directe
     */
    openCategory(categoryId) {
      const category = this.getCategory(categoryId);
      if (!category) return;

      this.clipartNav.categoryId = categoryId;
      this.clipartNav.subcategoryId = null;
      this.updateBreadcrumbTitle(category.label);

      if (category.subcategories && category.subcategories.length) {
        this.renderSubcategoryGrid(category);
      } else {
        this.renderItemGrid(category.items || []);
      }
    },

    /**
     * Niveau 2 : génère les cartes de sous-catégories (ex. dans Emojis)
     */
    renderSubcategoryGrid(category) {
      const grid = document.getElementById('clipart-subcategory-grid');
      if (!grid) return;

      grid.innerHTML = category.subcategories.map(sub => `
        <button class="clipart-category-card" data-subcategory-id="${sub.id}" type="button">
          <span class="clipart-category-icon">${sub.items[0] ? sub.items[0].emoji : '✨'}</span>
          <span class="clipart-category-label">${sub.label}</span>
        </button>
      `).join('');

      grid.querySelectorAll('.clipart-category-card').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const subId = e.currentTarget.dataset.subcategoryId;
          const sub = category.subcategories.find(s => s.id === subId);
          if (sub) {
            this.clipartNav.subcategoryId = subId;
            this.updateBreadcrumbTitle(`${category.label} ‹ ${sub.label}`);
            this.renderItemGrid(sub.items);
          }
        });
      });

      this.setClipartLevel('subcategories');
    },

    /**
     * Niveau 3 : génère la grille de cliparts cliquables de la (sous-)catégorie
     */
    renderItemGrid(items) {
      const grid = document.getElementById('clipart-grid');
      if (!grid) return;

      grid.innerHTML = (items || []).map(clipart => `
        <button class="clipart-item"
                data-emoji="${clipart.emoji}"
                data-name="${clipart.name}"
                title="${clipart.name}"
                type="button">
          ${clipart.emoji}
        </button>
      `).join('');

      this.setupClipartButtons();
      this.setClipartLevel('items');
    },

    /**
     * Met à jour le titre affiché dans le fil d'Ariane
     */
    updateBreadcrumbTitle(title) {
      const titleEl = document.getElementById('clipart-breadcrumb-title');
      if (titleEl) titleEl.textContent = title;
    },

    /**
     * Bouton "Retour" : items -> subcategories (ou categories) -> categories
     */
    handleClipartBack() {
      const { level, categoryId } = this.clipartNav;
      const category = categoryId ? this.getCategory(categoryId) : null;

      if (level === 'items' && category && category.subcategories) {
        // Retour à la liste des sous-catégories de la même catégorie
        this.updateBreadcrumbTitle(category.label);
        this.renderSubcategoryGrid(category);
      } else {
        // Retour à la racine
        this.clipartNav.categoryId = null;
        this.clipartNav.subcategoryId = null;
        this.setClipartLevel('categories');
      }
    },

    /**
     * Câble le bouton Retour (une seule fois)
     */
    setupClipartNavigation() {
      const backBtn = document.getElementById('clipart-back-btn');
      if (backBtn && !backBtn._wired) {
        backBtn.addEventListener('click', () => this.handleClipartBack());
        backBtn._wired = true;
      }
    },


    setupTextPanelBehavior() {
      // Toggle outline
      document.getElementById('text-outline-toggle')?.addEventListener('click', () => {
        const panel = document.getElementById('text-outline-options');
        if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      });

      // Toggle forme du texte
      document.getElementById('text-shape-toggle')?.addEventListener('click', () => {
        const panel = document.getElementById('text-shape-options');
        if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      });

      // Boutons forme du texte
      document.querySelectorAll('.text-shape-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          document.querySelectorAll('.text-shape-btn').forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');
          if (window.TextAdvancedControls?.applyShape) {
            window.TextAdvancedControls.applyShape(e.currentTarget.dataset.shape);
          }
        });
      });

      // Modification du texte en direct
      document.getElementById('text-input-edit')?.addEventListener('input', (e) => {
        const obj = AppState.fabricCanvas?.getActiveObject();
        if (obj?.type === 'i-text') {
          obj.set('text', e.target.value);
          AppState.fabricCanvas.renderAll();
        }
      });

      // Color picker
      document.getElementById('text-color-picker')?.addEventListener('input', (e) => {
        TextManager.changeColor(e.target.value);
        const label = document.getElementById('text-color-label');
        if (label) label.textContent = e.target.value;
      });

      // Rotation slider ↔ champ numérique
      const rotSlider = document.getElementById('text-rotation-slider');
      const rotNum    = document.getElementById('text-rotation-value');
      const applyRot = (val) => {
        const activeObj = AppState.fabricCanvas?.getActiveObject();
        // Warp image → on tourne l'image warp directement (pas le texte source)
        const target = (activeObj?.isWarpImage) ? activeObj : (activeObj?.type === 'i-text' ? activeObj : null);
        if (target) { target.set('angle', parseFloat(val)); AppState.fabricCanvas.renderAll(); }
      };
      rotSlider?.addEventListener('input', (e) => { if (rotNum) rotNum.value = e.target.value; applyRot(e.target.value); });
      rotNum?.addEventListener('input',    (e) => { if (rotSlider) rotSlider.value = e.target.value; applyRot(e.target.value); });

      // Outline couleur + épaisseur
      const applyOutline = () => {
        const obj   = AppState.fabricCanvas?.getActiveObject();
        const color = document.getElementById('text-outline-color')?.value;
        const width = parseFloat(document.getElementById('text-outline-width')?.value || 0);
        if (obj?.type === 'i-text') {
          obj.set({ stroke: color === 'none' || width === 0 ? null : color, strokeWidth: width });
          AppState.fabricCanvas.renderAll();
        }
      };
      document.getElementById('text-outline-color')?.addEventListener('change', applyOutline);
      document.getElementById('text-outline-width')?.addEventListener('input',  applyOutline);

      // Taille du texte
      document.getElementById('text-size-value')?.addEventListener('input', (e) => {
        TextManager.changeSize(parseInt(e.target.value));
      });

      // // Centrer
      // document.getElementById('btn-text-center')?.addEventListener('click', () => {
      //   const obj = AppState.fabricCanvas?.getActiveObject();
      //   if (obj) {
      //     obj.set({ left: 400, top: 300, originX: 'center', originY: 'center' });
      //     AppState.fabricCanvas.renderAll();
      //   }
      // });

      // Sync canvas → panneau
      if (AppState.fabricCanvas) {
        AppState.fabricCanvas.on('selection:created', (e) => {
          const o = e.selected?.[0];
          if (o?.type === 'i-text') this.showEditSection(o);
          else if (o?.isWarpImage) this.showEditSection(o._linkedTextObj);
        });
        AppState.fabricCanvas.on('selection:updated', (e) => {
          const o = e.selected?.[0];
          if (o?.type === 'i-text') this.showEditSection(o);
          else if (o?.isWarpImage) this.showEditSection(o._linkedTextObj);
        });
      }
    },

    showEditSection(obj) {
      document.getElementById('text-add-section').style.display  = 'none';
      document.getElementById('text-edit-section').style.display = 'block';
      const ei = document.getElementById('text-input-edit');       if (ei) ei.value = obj.text || '';
      const rs = document.getElementById('text-rotation-slider');  if (rs) rs.value = obj.angle || 0;
      const rn = document.getElementById('text-rotation-value');   if (rn) rn.value = Math.round(obj.angle || 0);
      const sv = document.getElementById('text-size-value');       if (sv) sv.value = obj.fontSize || 40;
      const cp = document.getElementById('text-color-picker');     if (cp) cp.value = obj.fill || '#000000';
      const cl = document.getElementById('text-color-label');      if (cl) cl.textContent = obj.fill || '#000000';
    },

    showAddSection() {
      document.getElementById('text-add-section').style.display  = 'block';
      document.getElementById('text-edit-section').style.display = 'none';
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

      // Sauvegarder le texte → désélectionner et réinitialiser
      document.getElementById('btn-save-text')?.addEventListener('click', () => {
        AppState.fabricCanvas?.discardActiveObject();
        AppState.fabricCanvas?.renderAll();
        const input = document.getElementById('text-input');
        if (input) input.value = '';
        UIManager.showAddSection();
      });

      // Sélecteurs texte
      FontPicker.init();

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

      // Navigation par catégories de l'onglet Arts (bouton Retour)
      this.setupClipartNavigation();
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

      /* Fil d'Ariane / bouton Retour de l'onglet Arts */
      .clipart-breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--color-border, #e0e0e0);
      }

      .clipart-back-btn {
        background: none;
        border: none;
        color: var(--color-primary, #000);
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        transition: background 0.2s;
        white-space: nowrap;
      }

      .clipart-back-btn:hover {
        background: #f0f0f0;
      }

      .clipart-breadcrumb-title {
        font-weight: 600;
        font-size: 0.9rem;
        color: var(--color-text, #1a1a1a);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Grille de catégories / sous-catégories (cartes icône + libellé) */
      .clipart-category-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }

      .clipart-category-card {
        background: #f8f8f8;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 1.25rem 0.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
        min-height: 100px;
      }

      .clipart-category-card:hover {
        background: #fff;
        border-color: #000;
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }

      .clipart-category-icon {
        font-size: 2rem;
        line-height: 1;
      }

      .clipart-category-label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--color-text, #1a1a1a);
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

      .clipart-breadcrumb { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #e0e0e0; }
      .clipart-back-btn { background: none; border: none; color: #000; font-weight: 600; font-size: 0.9rem; cursor: pointer; padding: 0.25rem 0.5rem; border-radius: 4px; white-space: nowrap; }
      .clipart-back-btn:hover { background: #f0f0f0; }
      .clipart-breadcrumb-title { font-weight: 600; font-size: 0.9rem; }
      .clipart-category-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
      .clipart-category-card { background: #f8f8f8; border: 1px solid #e0e0e0; border-radius: 8px; padding: 1.25rem 0.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.6rem; cursor: pointer; transition: all 0.2s; text-align: center; min-height: 100px; }
      .clipart-category-card:hover { background: #fff; border-color: #000; transform: translateY(-2px); }
      .clipart-category-icon { font-size: 2rem; line-height: 1; }
      .clipart-category-label { font-size: 0.85rem; font-weight: 600; }

      /* Bouton déclencheur font picker */
      .text-font-trigger {
        display: flex;
        align-items: center;
        padding: 0.4rem 0.6rem;
        min-width: 130px;
        cursor: pointer;
        font-size: 0.875rem;
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 4px;
        gap: 0.4rem;
      }
      .text-font-trigger:hover {
        border-color: #888;
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
      UIManager.setupTextPanelBehavior();
      OpacityManager.init();
      phase1Initialized = true;
    }

    // setupCanvasSelectionSync();
    // console.log('[Phase1] ✅ Fonctionnalités Texte + Cliparts activées');
  }

  // function setupCanvasSelectionSync() {
  //   if (!AppState.fabricCanvas || AppState.fabricCanvas._phase1SelectionSync) return;
  //   AppState.fabricCanvas._phase1SelectionSync = true;

  //   AppState.fabricCanvas.on('selection:created', (e) => {
  //     const obj = e.selected[0];
  //     if (obj && obj.type === 'i-text') {
  //       const input = document.getElementById('text-input');
  //       if (input) input.value = obj.text;
  //     }
  //   });

  //   AppState.fabricCanvas.on('selection:updated', (e) => {
  //     const obj = e.selected[0];
  //     if (obj && obj.type === 'i-text') {
  //       const input = document.getElementById('text-input');
  //       if (input) input.value = obj.text;
  //     }
  //   });
  // }

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
    FontPicker,
    OpacityManager,
    CONFIG: PHASE1_CONFIG
  };


})();