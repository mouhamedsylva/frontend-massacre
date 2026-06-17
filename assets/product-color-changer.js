/**
 * Product Color Changer - Massacre Configurateur
 * Permet de changer la couleur du produit (T-shirt) dans le canvas
 * 
 * Utilise les filtres Fabric.js pour teinter l'image de fond
 */

(function() {
  'use strict';

  const ProductColorChanger = {
    
    originalImages: {}, // Stocke les images originales par vue
    currentColor: null,
    
    /**
     * Initialise le changeur de couleur
     */
    init() {
      console.log('[ProductColorChanger] Initialisation...');
      this.setupEventListeners();
      this.saveOriginalImages();
    },
    
    /**
     * Sauvegarde les images originales pour pouvoir les restaurer
     */
    saveOriginalImages() {
      if (typeof AppState !== 'undefined' && AppState.viewImages) {
        this.originalImages = { ...AppState.viewImages };
        console.log('[ProductColorChanger] Images originales sauvegardées');
      }
    },
    
    /**
     * Configure les event listeners
     */
    setupEventListeners() {
      // Boutons de couleur
      const colorButtons = document.querySelectorAll('.color-btn');
      colorButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const color = e.currentTarget.dataset.color;
          this.applyColorToProduct(color);
          this.updateSelectedButton(e.currentTarget);
        });
      });
      
      // Bouton reset
      const resetBtn = document.getElementById('btn-reset-product-color');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.resetProductColor();
        });
      }
    },
    
    /**
     * Met à jour le bouton sélectionné visuellement
     */
    updateSelectedButton(selectedBtn) {
      document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('selected');
      });
      selectedBtn.classList.add('selected');
    },
    
    /**
     * Applique une couleur au produit (image de fond)
     */
    applyColorToProduct(hexColor) {
      if (typeof CanvasManager === 'undefined' || typeof AppState === 'undefined') {
        console.error('[ProductColorChanger] CanvasManager ou AppState non disponible');
        return;
      }
      
      const canvas = AppState.fabricCanvas;
      if (!canvas) return;
      
      this.currentColor = hexColor;
      console.log('[ProductColorChanger] Application de la couleur:', hexColor);
      
      // Appliquer le filtre de couleur sur l'image de fond
      this.applyColorFilter(canvas, hexColor);
    },
    
    /**
     * Applique un filtre de couleur sur l'image de fond du canvas
     * SOLUTION : Filtre personnalisé qui colore UNIQUEMENT les pixels blancs/clairs
     */
    applyColorFilter(canvas, hexColor) {
      const backgroundImage = canvas.backgroundImage;
      
      if (!backgroundImage) {
        console.warn('[ProductColorChanger] Pas d\'image de fond à colorer');
        return;
      }
      
      // Convertir hex en RGB
      const rgb = this.hexToRgb(hexColor);
      
      console.log('[ProductColorChanger] Application couleur RGB:', rgb);
      
      // SOLUTION FINALE : Créer un filtre personnalisé Fabric.js
      // qui ne colore QUE les pixels avec une luminosité élevée (blanc/gris clair)
      
      // Créer un filtre personnalisé avec fonction de filtrage pixel par pixel
      fabric.Image.filters.SelectiveColor = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
        type: 'SelectiveColor',
        
        targetColor: null, // Couleur cible en RGB
        threshold: 160,    // Seuil de luminosité (0-255) - seuls les pixels > threshold seront colorés
        
        applyTo2d: function(options) {
          const imageData = options.imageData;
          const data = imageData.data;
          const len = data.length;
          
          const targetR = this.targetColor.r;
          const targetG = this.targetColor.g;
          const targetB = this.targetColor.b;
          const threshold = this.threshold;
          
          for (let i = 0; i < len; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            // Calculer la luminosité du pixel (méthode perceptuelle)
            const luminosity = 0.299 * r + 0.587 * g + 0.114 * b;
            
            // Si le pixel est assez clair (t-shirt blanc/gris clair)
            if (luminosity > threshold) {
              // Appliquer la couleur avec un blend
              const blend = 0.5; // Intensité du mélange (0-1)
              data[i]     = r * (1 - blend) + targetR * blend;
              data[i + 1] = g * (1 - blend) + targetG * blend;
              data[i + 2] = b * (1 - blend) + targetB * blend;
              // Alpha reste inchangé
            }
            // Sinon, on ne touche pas au pixel (fond gris, peau, etc.)
          }
        }
      });
      
      // Créer et appliquer le filtre
      const selectiveFilter = new fabric.Image.filters.SelectiveColor();
      selectiveFilter.targetColor = rgb;
      selectiveFilter.threshold = 160; // Ajustable : 160 = gris clair et blanc, 180 = seulement blanc
      
      backgroundImage.filters = [selectiveFilter];
      backgroundImage.applyFilters();
      
      canvas.renderAll();
      console.log('[ProductColorChanger] Filtre sélectif par luminosité appliqué (seuil: 160)');
    },
    
    /**
     * Réinitialise la couleur du produit (retour à l'original)
     */
    resetProductColor() {
      if (typeof CanvasManager === 'undefined' || typeof AppState === 'undefined') return;
      
      const canvas = AppState.fabricCanvas;
      if (!canvas || !canvas.backgroundImage) return;
      
      // Supprimer tous les filtres
      canvas.backgroundImage.filters = [];
      canvas.backgroundImage.applyFilters();
      canvas.renderAll();
      
      // Désélectionner tous les boutons
      document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('selected');
      });
      
      this.currentColor = null;
      console.log('[ProductColorChanger] Couleur réinitialisée');
    },
    
    /**
     * Convertit une couleur hex en RGB
     */
    hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    },
    
    /**
     * Sauvegarde la couleur actuelle lors du changement de vue
     */
    saveCurrentColor() {
      return this.currentColor;
    },
    
    /**
     * Restaure la couleur après un changement de vue
     */
    restoreColor(color) {
      if (color) {
        setTimeout(() => {
          this.applyColorToProduct(color);
        }, 100);
      }
    }
  };
  
  // Initialiser quand tout est prêt
  function waitForDependencies() {
    if (typeof AppState !== 'undefined' && typeof CanvasManager !== 'undefined') {
      ProductColorChanger.init();
    } else {
      setTimeout(waitForDependencies, 100);
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForDependencies);
  } else {
    waitForDependencies();
  }
  
  // Exposer globalement
  window.ProductColorChanger = ProductColorChanger;
  
})();
