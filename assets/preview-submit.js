/**
 * Preview & Submit Manager - Massacre Configurateur
 * Gère l'aperçu du design et la soumission finale
 */

(function() {
  'use strict';

  const PreviewSubmitManager = {
    
    previewImages: {}, // Images de preview pour chaque vue
    
    /**
     * Initialise le gestionnaire
     */
    init() {
      console.log('[PreviewSubmit] Initialisation...');
      this.setupEventListeners();
    },
    
    /**
     * Configure les event listeners
     */
    setupEventListeners() {
      // Bouton "Aperçu du Design"
      const btnPreview = document.getElementById('btn-preview-design');
      if (btnPreview) {
        btnPreview.addEventListener('click', () => this.openPreview());
      }
      
      // Bouton "Envoyer le Design" (direct)
      const btnSubmit = document.getElementById('btn-submit-design');
      if (btnSubmit) {
        btnSubmit.addEventListener('click', () => this.submitDesign());
      }
      
      // Bouton "Fermer" la modal
      const btnClosePreview = document.getElementById('btn-close-preview');
      if (btnClosePreview) {
        btnClosePreview.addEventListener('click', () => this.closePreview());
      }
      
      // Overlay (cliquer en dehors pour fermer)
      const overlay = document.getElementById('preview-modal-overlay');
      if (overlay) {
        overlay.addEventListener('click', () => this.closePreview());
      }
      
      // Bouton "Continuer l'édition"
      const btnContinue = document.getElementById('btn-continue-editing');
      if (btnContinue) {
        btnContinue.addEventListener('click', () => this.closePreview());
      }
      
      // Bouton "Confirmer et Envoyer" (depuis la modal)
      const btnConfirm = document.getElementById('btn-confirm-submit');
      if (btnConfirm) {
        btnConfirm.addEventListener('click', () => {
          this.closePreview();
          this.submitDesign();
        });
      }
      
      // Touche Escape pour fermer
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closePreview();
        }
      });
    },
    
    /**
     * Ouvre la modal de preview
     */
    async openPreview() {
      console.log('[PreviewSubmit] Ouverture de la preview...');
      
      if (typeof AppState === 'undefined' || typeof CanvasManager === 'undefined') {
        console.error('[PreviewSubmit] Dépendances non disponibles');
        alert('Erreur : Le configurateur n\'est pas prêt.');
        return;
      }
      
      // Générer les images de toutes les vues
      await this.generateAllViewsPreview();
      
      // Afficher la modal
      const modal = document.getElementById('preview-modal');
      if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Bloquer le scroll
      }
    },
    
    /**
     * Ferme la modal de preview
     */
    closePreview() {
      const modal = document.getElementById('preview-modal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Réactiver le scroll
      }
    },
    
    /**
     * Génère les images de preview pour toutes les vues
     */
    async generateAllViewsPreview() {
      const views = ['front', 'back', 'left', 'right'];
      const currentView = AppState.currentView;
      
      // Sauvegarder la vue actuelle
      const currentObjects = CanvasManager.saveCurrentView();
      
      for (const view of views) {
        // Charger temporairement chaque vue
        if (view !== currentView) {
          await this.loadViewTemporarily(view);
        }
        
        // Générer l'image
        const dataURL = this.exportCurrentView();
        this.previewImages[view] = dataURL;
        
        // Mettre à jour l'image dans la modal
        const imgElement = document.getElementById(`preview-img-${view}`);
        if (imgElement) {
          imgElement.src = dataURL;
        }
      }
      
      // Revenir à la vue originale
      if (currentView !== AppState.currentView) {
        await this.loadViewTemporarily(currentView);
      }
      
      console.log('[PreviewSubmit] Toutes les images de preview générées');
    },
    
    /**
     * Charge une vue temporairement (sans sauvegarde)
     */
    loadViewTemporarily(view) {
      return new Promise((resolve) => {
        if (typeof CanvasManager !== 'undefined') {
          CanvasManager.loadView(view);
          // Attendre que le canvas soit rendu
          setTimeout(resolve, 300);
        } else {
          resolve();
        }
      });
    },
    
    /**
     * Export la vue actuelle en Data URL
     */
    exportCurrentView() {
      if (!AppState.fabricCanvas) return '';
      
      const canvas = AppState.fabricCanvas;
      
      // Masquer temporairement les contrôles
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.discardActiveObject();
        canvas.renderAll();
      }
      
      // Exporter en PNG haute qualité
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1.0,
        multiplier: 2 // 2x pour meilleure qualité
      });
      
      return dataURL;
    },
    
    /**
     * Soumet le design final
     */
    async submitDesign() {
      console.log('[PreviewSubmit] Soumission du design...');
      
      // Afficher un loader
      const btnSubmit = document.getElementById('btn-submit-design');
      const btnConfirm = document.getElementById('btn-confirm-submit');
      
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span>Envoi en cours...</span>';
      }
      
      if (btnConfirm) {
        btnConfirm.disabled = true;
        btnConfirm.innerHTML = '<span>Envoi en cours...</span>';
      }
      
      try {
        // Générer toutes les images si pas encore fait
        if (Object.keys(this.previewImages).length === 0) {
          await this.generateAllViewsPreview();
        }
        
        // Préparer les données de soumission
        const submissionData = {
          productId: AppState.selectedProductId || '',
          productTitle: AppState.selectedProductTitle || '',
          views: {
            front: this.previewImages.front || '',
            back: this.previewImages.back || '',
            left: this.previewImages.left || '',
            right: this.previewImages.right || ''
          },
          metadata: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        };
        
        // Envoyer vers le microservice ou Shopify
        await this.sendToBackend(submissionData);
        
        // Succès !
        alert('✅ Votre design a été envoyé avec succès !');
        
      } catch (error) {
        console.error('[PreviewSubmit] Erreur lors de la soumission:', error);
        alert('❌ Erreur lors de l\'envoi. Veuillez réessayer.');
      } finally {
        // Réactiver les boutons
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Envoyer le Design
          `;
        }
        
        if (btnConfirm) {
          btnConfirm.disabled = false;
          btnConfirm.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Confirmer et Envoyer
          `;
        }
      }
    },
    
    /**
     * Envoie les données au backend (microservice ou Shopify)
     */
    async sendToBackend(data) {
      // Option 1 : Envoyer vers votre microservice
      const apiEndpoint = window.CONFIGURATEUR_CONFIG?.apiEndpoint;
      
      if (apiEndpoint) {
        const response = await fetch(`${apiEndpoint}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('[PreviewSubmit] Réponse du serveur:', result);
        return result;
      }
      
      // Option 2 : Sauvegarder localement (fallback)
      console.warn('[PreviewSubmit] Aucun endpoint configuré, sauvegarde locale');
      localStorage.setItem('massacre_design_' + Date.now(), JSON.stringify(data));
      
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    
    /**
     * Télécharge les images localement (backup)
     */
    downloadAllViews() {
      const views = ['front', 'back', 'left', 'right'];
      
      views.forEach(view => {
        const dataURL = this.previewImages[view];
        if (dataURL) {
          const link = document.createElement('a');
          link.download = `design_${view}_${Date.now()}.png`;
          link.href = dataURL;
          link.click();
        }
      });
    }
  };
  
  // Initialiser quand tout est prêt
  function waitForDependencies() {
    if (typeof AppState !== 'undefined' && typeof CanvasManager !== 'undefined') {
      PreviewSubmitManager.init();
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
  window.PreviewSubmitManager = PreviewSubmitManager;
  
})();
