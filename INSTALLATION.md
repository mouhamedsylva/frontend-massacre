# Guide d'Installation Complet - Configurateur Massacre Officiel

Ce guide détaille toutes les étapes pour installer et configurer le configurateur multi-vues sur votre boutique Shopify.

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Installation du Microservice Backend](#installation-du-microservice-backend)
3. [Installation du Thème Shopify](#installation-du-thème-shopify)
4. [Configuration des Metafields](#configuration-des-metafields)
5. [Configuration des Produits](#configuration-des-produits)
6. [Tests de Validation](#tests-de-validation)
7. [Mise en Production](#mise-en-production)

---

## 🔧 Prérequis

### 1. Compte Shopify
- Boutique Shopify active (plan Basic ou supérieur)
- Accès administrateur complet

### 2. Outils de Développement

#### Shopify CLI
```bash
# Installation via Homebrew (macOS/Linux)
brew install shopify-cli

# Installation via npm (Windows/macOS/Linux)
npm install -g @shopify/cli @shopify/theme

# Vérifier l'installation
shopify version
```

#### Node.js (pour le microservice)
```bash
# Télécharger depuis https://nodejs.org/ (version 18+)
node --version  # Doit afficher v18.0.0 ou supérieur
npm --version
```

#### Git
```bash
git --version
```

### 3. Comptes Tiers

- **Railway** : Créer un compte sur [railway.app](https://railway.app) (gratuit)
- **Cloudinary** : Créer un compte sur [cloudinary.com](https://cloudinary.com) (plan gratuit suffisant)

---

## 🚀 Installation du Microservice Backend

### Étape 1 : Préparer les Credentials

#### 1.1 Cloudinary

1. Se connecter sur [console.cloudinary.com](https://console.cloudinary.com/)
2. Aller dans **Dashboard**
3. Noter les informations suivantes :
   - `Cloud Name`
   - `API Key`
   - `API Secret`

#### 1.2 Shopify Admin API

1. Se connecter à l'admin Shopify
2. Aller dans **Paramètres > Applications et canaux de vente**
3. Cliquer sur **Développer des applications**
4. Si demandé, activer le développement d'applications
5. Cliquer sur **Créer une application**
6. Nom : "Configurateur Massacre"
7. Aller dans **Configuration de l'API**
8. Cliquer sur **Configurer** dans la section "Admin API"
9. Activer les permissions suivantes :
   - `write_draft_orders`
   - `read_draft_orders`
10. Cliquer sur **Enregistrer**
11. Aller dans l'onglet **Identifiants de l'API**
12. Cliquer sur **Installer l'application**
13. Noter le **Jeton d'accès Admin API** (commence par `shpat_`)

⚠️ **Important** : Ce jeton ne sera affiché qu'une seule fois. Sauvegardez-le en lieu sûr.

### Étape 2 : Déployer sur Railway

#### Option A : Déploiement via GitHub (Recommandé)

1. **Créer un repository GitHub** :
   ```bash
   cd microservice
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/votre-username/massacre-microservice.git
   git push -u origin main
   ```

2. **Déployer sur Railway** :
   - Se connecter sur [railway.app](https://railway.app)
   - Cliquer sur **New Project**
   - Sélectionner **Deploy from GitHub repo**
   - Autoriser Railway à accéder à vos repos
   - Sélectionner le repository `massacre-microservice`
   - Railway détecte automatiquement Node.js et lance le déploiement

3. **Configurer les variables d'environnement** :
   - Cliquer sur votre projet
   - Onglet **Variables**
   - Ajouter les variables suivantes :

   ```env
   NODE_ENV=production
   PORT=3000
   CLOUDINARY_CLOUD_NAME=votre_cloud_name
   CLOUDINARY_API_KEY=votre_api_key
   CLOUDINARY_API_SECRET=votre_api_secret
   SHOPIFY_STORE_DOMAIN=massacre-officiel.myshopify.com
   SHOPIFY_ADMIN_API_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. **Générer un domaine public** :
   - Onglet **Settings**
   - Section **Networking**
   - Cliquer sur **Generate Domain**
   - Noter l'URL générée (ex: `https://massacre-microservice-production.up.railway.app`)

#### Option B : Déploiement direct depuis Railway

1. Zipper le dossier `microservice/`
2. Se connecter sur Railway
3. **New Project > Empty Project**
4. Cliquer sur **+ New**
5. Drag & drop le fichier ZIP
6. Configurer les variables comme ci-dessus

### Étape 3 : Tester le Microservice

```bash
# Test de santé
curl https://votre-url.railway.app/health

# Réponse attendue :
# {"status":"ok","service":"massacre-microservice"}
```

---

## 🎨 Installation du Thème Shopify

### Étape 1 : Télécharger Fabric.js

1. Aller sur [GitHub Fabric.js Releases](https://github.com/fabricjs/fabric.js/releases)
2. Télécharger la dernière version stable (ex: `fabric-6.0.0.min.js`)
3. Renommer le fichier en `fabric.min.js`
4. Placer dans `theme-shopify/assets/fabric.min.js`

### Étape 2 : Configurer l'URL de l'API

1. Ouvrir `theme-shopify/assets/configurateur.js`
2. Trouver la ligne suivante (vers la ligne 16) :

   ```javascript
   API_ENDPOINT: window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
     ? 'http://localhost:3000/submit-devis'
     : 'https://votre-microservice.railway.app/submit-devis',
   ```

3. Remplacer `https://votre-microservice.railway.app/submit-devis` par votre URL Railway

### Étape 3 : Se Connecter à Shopify

```bash
cd theme-shopify
shopify login
```

### Étape 4 : Mode Développement

```bash
shopify theme dev
```

Cette commande :
- Synchronise votre thème local avec Shopify
- Ouvre un aperçu dans votre navigateur
- Active le rechargement automatique lors des modifications

### Étape 5 : Pusher le Thème

```bash
# Option 1 : Push vers un nouveau thème (recommandé pour les tests)
shopify theme push --unpublished --theme="Configurateur v1"

# Option 2 : Push vers le thème en cours de développement
shopify theme push --development

# Option 3 : Push vers le thème actif (ATTENTION !)
shopify theme push --live
```

⚠️ **Attention** : Ne jamais pusher directement en `--live` sans tests préalables.

---

## 📝 Configuration des Metafields

### Étape 1 : Créer les Définitions

1. Aller dans **Paramètres > Métaobjet**
2. Cliquer sur **Produits**
3. Descendre jusqu'à **Définitions de métaobjet**
4. Cliquer sur **Ajouter une définition**

Créer les 5 définitions suivantes :

#### Metafield 1 : Vue Face
- **Nom** : `Vue Face`
- **Namespace et clé** : `custom.view_front_image`
- **Type** : Fichier - Sélectionner "Image"
- **Description** : Image de la vue de face du produit (800x600 recommandé)

#### Metafield 2 : Vue Dos
- **Nom** : `Vue Dos`
- **Namespace et clé** : `custom.view_back_image`
- **Type** : Fichier - Image

#### Metafield 3 : Vue Gauche
- **Nom** : `Vue Gauche`
- **Namespace et clé** : `custom.view_left_image`
- **Type** : Fichier - Image

#### Metafield 4 : Vue Droite
- **Nom** : `Vue Droite`
- **Namespace et clé** : `custom.view_right_image`
- **Type** : Fichier - Image

#### Metafield 5 : Zones Éditables
- **Nom** : `Zones Éditables`
- **Namespace et clé** : `custom.editable_zones`
- **Type** : Texte - Une seule ligne
- **Description** : JSON définissant les zones éditables par vue
- **Validation** : Aucune (ou Regex JSON si disponible)

---

## 🛍️ Configuration des Produits

### Étape 1 : Préparer les Images

Pour chaque produit, préparer 4 images :
- **Dimensions recommandées** : 800x600 pixels (ratio 4:3)
- **Format** : PNG avec transparence ou JPEG
- **Poids** : < 500 Ko par image
- **Contenu** : Le produit vu de face, dos, gauche, droite

### Étape 2 : Configurer un Produit

1. Aller dans **Produits**
2. Créer ou éditer un produit
3. Remplir les informations de base (titre, description, prix, etc.)
4. Descendre jusqu'à la section **Metafields**
5. Cliquer sur **Afficher tout** si les champs ne sont pas visibles

6. **Uploader les images** :
   - Vue Face : Upload obligatoire
   - Vue Dos : Upload optionnel
   - Vue Gauche : Upload optionnel
   - Vue Droite : Upload optionnel

7. **Configurer les zones éditables** :
   
   Coller ce JSON dans le champ "Zones Éditables" :

   ```json
   {
     "front": {"x": 200, "y": 150, "w": 400, "h": 500},
     "back": {"x": 200, "y": 150, "w": 400, "h": 500},
     "left": {"x": 100, "y": 200, "w": 150, "h": 150},
     "right": {"x": 100, "y": 200, "w": 150, "h": 150}
   }
   ```

   **Explication des coordonnées** :
   - Le canvas fait 800x600 pixels
   - `x`, `y` : Coin supérieur gauche de la zone éditable
   - `w`, `h` : Largeur et hauteur de la zone
   - Exemple pour Face : Zone de 400x500 commençant à (200, 150)

8. **Sauvegarder** le produit

### Étape 3 : Créer la Page du Configurateur

1. Aller dans **Pages**
2. Cliquer sur **Ajouter une page**
3. **Titre** : "Configurateur" (ou "Créez votre design")
4. **Contenu** : Laisser vide (géré par la section)
5. Dans la section **Modèle de thème**, sélectionner **configurateur**
6. Cliquer sur **Enregistrer**

### Étape 4 : Ajouter les Produits à la Section

1. Dans l'éditeur de pages, cliquer sur la section **Configurateur**
2. Modifier le titre et la description si nécessaire
3. Cliquer sur **Ajouter un bloc**
4. Sélectionner **Produit personnalisable**
5. Dans les paramètres du bloc, chercher et sélectionner votre produit
6. Répéter pour chaque produit à ajouter
7. Cliquer sur **Enregistrer**

---

## ✅ Tests de Validation

### Test 1 : Vérification de l'Interface

1. Accéder à la page du configurateur
2. Vérifier que tous les produits s'affichent
3. Cliquer sur "Personnaliser ce produit"
4. Vérifier que :
   - Le canvas charge l'image de fond
   - Les 4 onglets de vues sont présents
   - La zone d'upload est visible

### Test 2 : Upload et Manipulation

1. Uploader une image PNG ou JPEG
2. Vérifier que l'image apparaît sur le canvas
3. Tester les manipulations :
   - Déplacement (drag)
   - Redimensionnement (poignées)
   - Rotation (poignée du haut)
4. Basculer vers une autre vue
5. Revenir à la première vue
6. Vérifier que le design est toujours présent

### Test 3 : Basculement Multi-Vues

1. Ajouter un design sur Face
2. Basculer sur Dos
3. Ajouter un autre design
4. Basculer sur Gauche et Droite
5. Revenir sur chaque vue et vérifier la persistance

### Test 4 : Soumission de Devis

1. Ajouter un design sur au moins une vue
2. Remplir le formulaire (prénom, nom, email)
3. Cliquer sur "Envoyer ma demande de devis"
4. Vérifier le message de succès
5. **Vérifier dans Shopify Admin** :
   - Aller dans **Commandes > Commandes provisoires**
   - Trouver la nouvelle commande
   - Vérifier que les liens d'images sont présents
   - Cliquer sur chaque lien et vérifier les rendus

### Test 5 : Workflow Complet Admin

1. Ouvrir la commande provisoire
2. Cliquer sur les liens des maquettes
3. Vérifier la qualité des images
4. Modifier le prix de la ligne (ex: 25.00 €)
5. Cliquer sur **Envoyer la facture**
6. Vérifier que l'email est envoyé au client
7. Ouvrir l'email et cliquer sur le lien de paiement
8. Vérifier que la page de paiement Shopify s'affiche correctement

### Test 6 : Sécurité

1. Ouvrir les DevTools (F12)
2. Onglet **Network**
3. Soumettre un devis
4. Inspecter la requête `submit-devis`
5. **Vérifier que** :
   - Aucun token Shopify n'est visible
   - Aucune clé API Cloudinary n'est exposée
   - Les images sont en base64 dans le body

---

## 🚀 Mise en Production

### Checklist Avant la Mise en Ligne

- [ ] Tous les tests de validation passent
- [ ] Le microservice est déployé et accessible
- [ ] Les variables d'environnement sont correctes
- [ ] Les CORS sont configurés pour le domaine de production
- [ ] L'URL de l'API est correcte dans `configurateur.js`
- [ ] Au moins un produit est correctement configuré
- [ ] La page du configurateur est créée et publiée

### Étape 1 : Publier le Thème

```bash
# Option 1 : Push vers le thème actif
shopify theme push --live

# Option 2 : Publier depuis l'admin Shopify
# 1. Aller dans Boutique en ligne > Thèmes
# 2. Trouver "Configurateur v1"
# 3. Cliquer sur Actions > Publier
```

### Étape 2 : Ajouter au Menu de Navigation

1. Aller dans **Boutique en ligne > Navigation**
2. Éditer le menu principal
3. Cliquer sur **Ajouter un élément**
4. **Nom** : "Configurateur" ou "Créez votre design"
5. **Lien** : Sélectionner la page "Configurateur"
6. Cliquer sur **Enregistrer**

### Étape 3 : Configurer les Notifications Shopify

1. Aller dans **Paramètres > Notifications**
2. Chercher "Commandes provisoires"
3. Vérifier que les notifications email sont activées
4. Tester en créant une commande provisoire manuelle

### Étape 4 : Monitoring

1. **Logs Railway** :
   - Aller dans votre projet Railway
   - Onglet **Deployments > View Logs**
   - Surveiller les requêtes entrantes

2. **Cloudinary Usage** :
   - Console Cloudinary > Dashboard
   - Vérifier l'usage de stockage
   - Plan gratuit : 25 GB de stockage

3. **Shopify Analytics** :
   - Shopify Admin > Analytiques
   - Suivre les conversions de devis

---

## 🔧 Maintenance

### Mettre à Jour le Thème

```bash
cd theme-shopify
git pull origin main
shopify theme push
```

### Mettre à Jour le Microservice

```bash
cd microservice
git pull origin main
git push
# Railway redéploie automatiquement
```

### Purger les Images Cloudinary (Optionnel)

```bash
# Script Node.js pour purger les images de plus de 30 jours
# À créer dans microservice/scripts/cleanup-cloudinary.js
```

---

## 🆘 Support et Dépannage

### Problèmes Courants

#### Canvas ne charge pas
- Vérifier que `fabric.min.js` est bien dans `assets/`
- Vérifier la console du navigateur pour les erreurs
- Essayer de vider le cache (Ctrl+Shift+R)

#### Erreur CORS
- Vérifier que le domaine Shopify est dans la liste `allowedOrigins` du microservice
- Redéployer le microservice après modification

#### Images ne s'uploadent pas
- Vérifier la taille (max 5 Mo)
- Vérifier le format (PNG ou JPEG uniquement)
- Vérifier les logs Railway pour les erreurs Cloudinary

#### Draft Order non créé
- Vérifier les credentials Shopify dans Railway
- Vérifier que l'app a les permissions `write_draft_orders`
- Consulter les logs Railway

### Contact

- Email : support@massacre-officiel.com
- Documentation : Voir README.md

---

## 📄 Annexes

### Annexe A : Exemple de JSON Zones Éditables

```json
{
  "front": {
    "x": 250,
    "y": 200,
    "w": 300,
    "h": 400
  },
  "back": {
    "x": 250,
    "y": 200,
    "w": 300,
    "h": 400
  },
  "left": {
    "x": 100,
    "y": 250,
    "w": 100,
    "h": 200
  },
  "right": {
    "x": 600,
    "y": 250,
    "w": 100,
    "h": 200
  }
}
```

### Annexe B : Script de Test API

```bash
# test-api.sh
curl -X POST https://votre-url.railway.app/submit-devis \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "email": "test@example.com",
      "first_name": "Test",
      "last_name": "User"
    },
    "product_title": "T-Shirt Customisé",
    "images": {
      "front": "data:image/png;base64,iVBORw0KG..."
    }
  }'
```

---

**Version** : 1.0.0  
**Dernière mise à jour** : Juin 2026  
**Auteur** : SimplifyStack pour Massacre Officiel
