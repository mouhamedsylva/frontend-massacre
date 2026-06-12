# 🧪 Guide de Test Local - Résolution des Problèmes

## 🚨 Problème : Les images ne s'affichent pas

### Solution 1 : Utiliser le fichier hors ligne (RECOMMANDÉ)

J'ai créé une version qui fonctionne **sans connexion internet** :

```bash
# Ouvrir ce fichier dans votre navigateur
theme-shopify/test-configurateur-offline.html
```

**Avantages** :
- ✅ Images SVG intégrées (fonctionnent toujours)
- ✅ Pas de dépendance externe
- ✅ Charge instantanément

---

### Solution 2 : Utiliser un serveur local

Les images externes peuvent être bloquées si vous ouvrez le fichier HTML directement (`file://`).

**Utilisez un serveur HTTP local** :

#### Option A : Python (le plus simple)

```bash
# Aller dans le dossier
cd theme-shopify

# Démarrer le serveur
python -m http.server 8080

# Ouvrir dans le navigateur
# http://localhost:8080/test-configurateur.html
```

#### Option B : Node.js

```bash
# Installer http-server globalement (une seule fois)
npm install -g http-server

# Démarrer le serveur
cd theme-shopify
http-server -p 8080

# Ouvrir dans le navigateur
# http://localhost:8080/test-configurateur.html
```

#### Option C : VSCode Live Server

1. Installer l'extension "Live Server" dans VSCode
2. Clic droit sur `test-configurateur.html`
3. Sélectionner "Open with Live Server"

---

### Solution 3 : Utiliser vos propres images

Remplacez les URLs placeholder par vos propres images :

```html
<!-- Dans test-configurateur.html, ligne ~44 -->
<div class="product-card" 
     data-view-front="CHEMIN_VERS_VOTRE_IMAGE_FACE.png"
     data-view-back="CHEMIN_VERS_VOTRE_IMAGE_DOS.png"
     ...>
```

---

## ✅ Méthode de Test Recommandée

### Étape 1 : Démarrer le Backend

```bash
# Terminal 1
cd microservice
npm run dev
# Doit afficher : ✅ Microservice Massacre démarré sur le port 3000
```

### Étape 2A : Test avec le fichier hors ligne (FACILE)

```bash
# Ouvrir directement dans le navigateur
# Windows
start theme-shopify/test-configurateur-offline.html

# macOS
open theme-shopify/test-configurateur-offline.html

# Linux
xdg-open theme-shopify/test-configurateur-offline.html
```

### Étape 2B : Test avec serveur local (RÉALISTE)

```bash
# Terminal 2
cd theme-shopify
python -m http.server 8080

# Puis ouvrir dans le navigateur
# http://localhost:8080/test-configurateur.html
```

---

## 🔍 Vérifier que tout fonctionne

### 1. Console du navigateur (F12)

**Pas d'erreurs attendues** :
```
[Init] Démarrage du configurateur Massacre Officiel...
[Init] ✅ Configurateur prêt.
```

**Si vous voyez ces erreurs** :

#### `fabric is not defined`
➡️ Fabric.js ne charge pas depuis le CDN
➡️ Vérifier votre connexion internet
➡️ Ou télécharger fabric.min.js et le placer dans assets/

#### `Failed to load resource: net::ERR_FAILED`
➡️ Images externes bloquées
➡️ Utiliser `test-configurateur-offline.html` à la place

#### `CORS policy: No 'Access-Control-Allow-Origin'`
➡️ Le backend n'est pas démarré
➡️ Ou vous n'utilisez pas un serveur HTTP local

---

### 2. Test Visuel

**Ce que vous devez voir** :

1. **Page d'accueil** :
   - 2 cartes de produits (T-Shirt + Badge)
   - Images ou emojis (👕 🎯)
   - Boutons "Personnaliser ce produit"

2. **Après clic sur "Personnaliser"** :
   - Canvas 800x600 avec fond noir (T-Shirt) ou blanc (Badge)
   - Zone d'upload visible
   - Onglets des 4 vues (Face, Dos, Gauche, Droite)

3. **Après upload d'une image** :
   - Image apparaît sur le canvas
   - Poignées de redimensionnement visibles
   - Image déplaçable

---

## 🐛 Problèmes Courants

### Problème : Rien ne se passe au clic sur "Personnaliser"

**Cause** : JavaScript bloqué ou erreur

**Solution** :
1. Ouvrir la console (F12)
2. Vérifier les erreurs en rouge
3. Vérifier que Fabric.js est chargé :
   ```javascript
   typeof fabric
   // Doit retourner "object"
   ```

---

### Problème : "Failed to execute 'toDataURL' on 'HTMLCanvasElement'"

**Cause** : CORS - Images externes chargées sur le canvas

**Solution** : Les images de test utilisent maintenant des SVG inline (pas de CORS)

---

### Problème : Backend ne reçoit pas la requête

**Vérifier** :
1. Backend tourne sur `localhost:3000`
2. URL dans `configurateur.js` est correcte (ligne 15)
3. Pas d'erreur CORS dans la console

**Test manuel** :
```bash
curl http://localhost:3000/health
# Doit retourner : {"status":"ok","service":"massacre-microservice"}
```

---

## 📋 Checklist de Test Complet

### ✅ Préparation
- [ ] Backend démarré (`npm run dev` dans microservice/)
- [ ] Fichier HTML ouvert (offline ou via serveur local)
- [ ] Console du navigateur ouverte (F12)

### ✅ Test Interface
- [ ] Les 2 produits s'affichent
- [ ] Images ou emojis visibles
- [ ] Clic sur "Personnaliser" ouvre l'éditeur
- [ ] Canvas affiche le fond noir ou blanc
- [ ] Les 4 onglets de vues sont visibles

### ✅ Test Upload
- [ ] Zone d'upload visible
- [ ] Clic ouvre la sélection de fichier
- [ ] Drag & Drop fonctionne
- [ ] Image apparaît sur le canvas

### ✅ Test Manipulation
- [ ] Image déplaçable (drag)
- [ ] Redimensionnable (poignées)
- [ ] Rotable (poignée du haut)
- [ ] Bouton "Supprimer" fonctionne

### ✅ Test Multi-vues
- [ ] Clic sur "Dos" bascule la vue
- [ ] Canvas change de fond
- [ ] Retour sur "Face" conserve le design

### ✅ Test Soumission
- [ ] Formulaire pré-rempli
- [ ] Bouton "Envoyer" cliquable
- [ ] Message de succès ou erreur s'affiche
- [ ] Logs backend affichent la requête

---

## 🎯 Résultat Attendu

Après un test réussi, vous devriez :

1. ✅ Voir les produits et pouvoir les sélectionner
2. ✅ Uploader et manipuler des images sur le canvas
3. ✅ Basculer entre les vues sans perdre les designs
4. ✅ Soumettre le formulaire et recevoir une confirmation
5. ✅ Voir la commande provisoire dans Shopify Admin (si backend connecté)

---

## 💡 Conseil Final

**Pour un test rapide et sans prise de tête** :

```bash
# Terminal 1 : Backend
cd microservice && npm run dev

# Terminal 2 : Ouvrir le fichier hors ligne
start test-configurateur-offline.html
# (ou open sur macOS, xdg-open sur Linux)
```

Cette méthode fonctionne **100% du temps** car elle n'a aucune dépendance externe.

---

## 🆘 Toujours des problèmes ?

1. Vérifier que Fabric.js charge : `console.log(typeof fabric)` doit retourner `"object"`
2. Vérifier que le backend répond : `curl http://localhost:3000/health`
3. Consulter les logs backend pour voir les erreurs
4. Consulter la console navigateur (F12) pour les erreurs JavaScript

---

**Dernière mise à jour** : Juin 2026  
**Fichiers de test** :
- `test-configurateur.html` - Avec images externes (nécessite serveur local)
- `test-configurateur-offline.html` - Avec SVG intégrés (fonctionne partout) ⭐ RECOMMANDÉ
