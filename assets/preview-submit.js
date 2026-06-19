/**
 * Preview & Submit Manager - Massacre Configurateur
 * Gère l'aperçu du design et la soumission finale
 */

(function() {
  'use strict';

  const PreviewSubmitManager = {
    
    previewImages: {}, // Images de preview pour chaque vue
    isSubmitting: false, // Flag pour éviter les doubles soumissions
    
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
      
      // Bouton "Envoyer le Design" - OUVRE LE FORMULAIRE CLIENT
      const btnSubmit = document.getElementById('btn-submit-design');
      if (btnSubmit) {
        btnSubmit.addEventListener('click', () => this.openCustomerForm());
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
      
      // Bouton "Confirmer et Envoyer" (depuis la modal) - OUVRE LE FORMULAIRE
      const btnConfirm = document.getElementById('btn-confirm-submit');
      if (btnConfirm) {
        btnConfirm.addEventListener('click', () => {
          this.closePreview();
          this.openCustomerForm();
        });
      }
      
      // Formulaire client - Bouton fermer
      const btnCloseForm = document.getElementById('btn-close-customer-form');
      if (btnCloseForm) {
        btnCloseForm.addEventListener('click', () => this.closeCustomerForm());
      }
      
      // Formulaire client - Overlay
      const formOverlay = document.getElementById('customer-form-overlay');
      if (formOverlay) {
        formOverlay.addEventListener('click', () => this.closeCustomerForm());
      }
      
      // Formulaire client - Soumission
      const customerForm = document.getElementById('customer-info-form');
      if (customerForm) {
        customerForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleFormSubmit(e);
        });
      }
      
      // Touche Escape pour fermer
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closePreview();
          this.closeCustomerForm();
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
     * Ouvre le formulaire client
     */
    async openCustomerForm() {
      console.log('[PreviewSubmit] Ouverture du formulaire client...');
      
      // Générer les images de toutes les vues si pas encore fait
      if (Object.keys(this.previewImages).length === 0) {
        await this.generateAllViewsPreview();
      }
      
      // Afficher la modal du formulaire
      const modal = document.getElementById('customer-form-modal');
      if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Focus sur le premier champ
        setTimeout(() => {
          const firstInput = document.getElementById('customer-first-name');
          if (firstInput) firstInput.focus();
        }, 300);
      }
    },
    
    /**
     * Ferme le formulaire client
     */
    closeCustomerForm() {
      const modal = document.getElementById('customer-form-modal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    },
    
    /**
     * Gère la soumission du formulaire client
     */
    async handleFormSubmit(event) {
      event.preventDefault();
      
      // ⭐ Protection contre les doubles soumissions
      if (this.isSubmitting) {
        console.log('[PreviewSubmit] ⚠️ Soumission déjà en cours, ignoré');
        return;
      }
      
      // Récupérer les données du formulaire
      const formData = new FormData(event.target);
      const customerData = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        email: formData.get('email'),
        phone: formData.get('phone') || '', // Optionnel
        message: formData.get('message') || '' // Optionnel
      };
      
      // Validation basique
      if (!customerData.first_name || !customerData.last_name || !customerData.email) {
        alert('⚠️ Veuillez remplir tous les champs obligatoires.');
        return;
      }
      
      // Validation email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerData.email)) {
        alert('⚠️ Veuillez entrer une adresse email valide.');
        return;
      }
      
      // Soumettre le design avec les infos client
      await this.submitDesign(customerData);
    },
    
    /**
     * Soumet le design final avec les informations client
     */
    async submitDesign(customerData) {
      console.log('[PreviewSubmit] Soumission du design...');
      
      // ⭐ Activer le flag de soumission
      this.isSubmitting = true;
      
      // Afficher un loader dans le bouton submit du formulaire
      const btnFormSubmit = document.querySelector('#customer-info-form button[type="submit"]');
      const originalButtonHTML = btnFormSubmit ? btnFormSubmit.innerHTML : '';
      
      if (btnFormSubmit) {
        btnFormSubmit.disabled = true;
        btnFormSubmit.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            <div style="width: 16px; height: 16px; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite;"></div>
            <span>Envoi en cours...</span>
          </div>
        `;
      }
      
      try {
        // Préparer les données de soumission
        const submissionData = {
          customer: customerData,
          product_title: AppState.selectedProductTitle || 'Produit Personnalisé',
          images: {
            front: this.previewImages.front || '',
            back: this.previewImages.back || '',
            left: this.previewImages.left || '',
            right: this.previewImages.right || ''
          }
        };
        
        // Envoyer vers le microservice
        const result = await this.sendToBackend(submissionData);
        
        // Fermer le formulaire
        this.closeCustomerForm();
        
        // Succès !
        this.showSuccessMessage(customerData);
        
      } catch (error) {
        console.error('[PreviewSubmit] Erreur lors de la soumission:', error);
        alert('❌ Erreur lors de l\'envoi. Veuillez réessayer ou nous contacter.');
        
        // Réactiver le bouton en cas d'erreur
        if (btnFormSubmit) {
          btnFormSubmit.disabled = false;
          btnFormSubmit.innerHTML = originalButtonHTML;
        }
      } finally {
        // ⭐ Toujours réinitialiser le flag
        this.isSubmitting = false;
      }
    },
    
    /**
     * Affiche un message de succès élégant
     */
    showSuccessMessage(customerData) {
      // Créer une modal de succès temporaire
      const successHTML = `
        <div id="success-overlay" style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100000;
          animation: fadeIn 0.3s ease;
        ">
          <div style="
            background: white;
            padding: 3rem;
            border-radius: 16px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: slideUp 0.4s ease;
          ">
            <div style="
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 1.5rem;
              font-size: 3rem;
            ">✓</div>
            <h2 style="
              font-size: 1.8rem;
              font-weight: 700;
              color: #1a202c;
              margin-bottom: 1rem;
            ">Design Envoyé avec Succès !</h2>
            <p style="
              color: #4a5568;
              font-size: 1.1rem;
              margin-bottom: 1.5rem;
              line-height: 1.6;
            ">
              Merci <strong>${customerData.first_name}</strong> !<br>
              Votre demande de personnalisation a bien été reçue.<br>
              Nous vous contacterons à <strong>${customerData.email}</strong><br>
              sous 24-48h pour finaliser votre commande.
            </p>
            <button onclick="document.getElementById('success-overlay').remove()" style="
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              padding: 0.875rem 2.5rem;
              font-size: 1rem;
              font-weight: 600;
              border-radius: 8px;
              cursor: pointer;
              transition: transform 0.2s;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
              Parfait !
            </button>
          </div>
        </div>
        <style>
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      `;
      
      document.body.insertAdjacentHTML('beforeend', successHTML);
      
      // Auto-fermer après 8 secondes
      setTimeout(() => {
        const overlay = document.getElementById('success-overlay');
        if (overlay) overlay.remove();
      }, 8000);
    },
    
    /**
     * Envoie les données au backend (microservice)
     */
    async sendToBackend(data) {
      const apiEndpoint = window.CONFIGURATEUR_CONFIG?.apiEndpoint;
      
      if (!apiEndpoint) {
        throw new Error('Endpoint API non configuré');
      }
      
      console.log('[PreviewSubmit] Envoi vers:', apiEndpoint);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('[PreviewSubmit] ✅ Réponse du serveur:', result);
      return result;
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
