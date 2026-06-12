# 🚀 Test Rapide - Phase 1 & Phase 2

## Étapes de Test (5 minutes)

### 1. Vider le Cache 🔄

**Windows/Linux** : `Ctrl + Shift + R`  
**macOS** : `Cmd + Shift + R`

---

### 2. Ouvrir le Fichier de Test 📄

**Option A : Double-clic** (peut ne pas fonctionner si restrictions CORS)
```
📂 theme-shopify/test-configurateur-offline.html
```

**Option B : Serveur HTTP local** (recommandé ✅)
```bash
cd theme-shopify
python -m http.server 8080
```
Puis ouvrir : `http://localhost:8080/test-configurateur-offline.html`

---

### 3. Ouvrir la Console F12 🔍

**Appuyer sur** : `F12` ou `Ctrl+Shift+I`

**Messages attendus** (en vert) :

```
✅ [Init] Démarrage du configurateur Massacre Officiel...
✅ Configurateur prêt.
✅ [Phase1] Configurateur principal détecté, initialisation...
✅ [Phase1] ✅ Fonctionnalités Texte + Cliparts activées
✅ [Phase2] Configurateur principal détecté, initialisation...
✅ [Phase2] ✅ Fonctionnalités Formes + Calques + Alignement + Historique activées
```

**❌ Si vous voyez des erreurs rouges** :
- Vérifier que les 3 fichiers existent dans `assets/`
- Vider le cache à nouveau
- Utiliser un serveur HTTP local (Option B)

---

### 4. Tester l'Interface 🎨

#### Étape 1 : Sélectionner un produit
- Cliquer sur **"Personnaliser ce produit"** (T-Shirt ou Badge)
- L'interface du configurateur doit s'afficher

#### Étape 2 : Vérifier les panneaux Phase 1 & 2
Vous devez voir **4 nouveaux panneaux** :

```
✅ 📝 Ajouter du Texte
   ├─ Champ de texte
   ├─ Sélecteur de police (13 polices)
   ├─ Couleurs (12 prédéfinies + picker)
   ├─ Taille (12px - 128px)
   └─ Styles (Gras, Italique, Souligné)

✅ 🎨 Cliparts
   ├─ Formes (⭐❤️🌟💎)
   ├─ Symboles (🔥⚡👑💀)
   ├─ Musique (🎵🎸🎤🎧)
   ├─ Sport (⚽🏀🎯🏆)
   ├─ Gaming (🎮👾🕹️)
   └─ Animaux (🦅🐺🦁)

✅ ⬜ Formes Géométriques
   ├─ 5 formes (Rectangle, Cercle, Triangle, Étoile, Ligne)
   ├─ Couleur de contour
   ├─ Couleur de remplissage
   └─ Épaisseur du contour (1-10px)

✅ 📋 Gestion des Calques
   ├─ Ordre (Premier plan, Arrière-plan, Monter, Descendre)
   ├─ Duplication
   ├─ Alignement (Gauche, Centre, Droite, Haut, Bas)
   └─ Historique (Undo/Redo avec Ctrl+Z/Ctrl+Y)
```

---

### 5. Tests Fonctionnels ✨

#### Test 1 : Ajouter du texte
1. Dans le panneau **"📝 Ajouter du Texte"**
2. Taper **"MASSACRE"**
3. Cliquer sur **"+ Ajouter le Texte"**
4. ✅ Le texte doit apparaître sur le canvas

#### Test 2 : Modifier le texte
1. **Double-cliquer** sur le texte dans le canvas
2. Changer la police → **Impact**
3. Changer la couleur → **Rouge**
4. Changer la taille → **72px**
5. ✅ Les changements doivent s'appliquer immédiatement

#### Test 3 : Ajouter un clipart
1. Dans **"🎨 Cliparts"**, onglet **"Symboles"**
2. Cliquer sur **🔥 Flamme**
3. ✅ L'emoji doit apparaître sur le canvas
4. ✅ Vous pouvez le déplacer, redimensionner, tourner

#### Test 4 : Ajouter une forme
1. Dans **"⬜ Formes Géométriques"**
2. Cliquer sur **⭐ Étoile**
3. ✅ Une étoile noire doit apparaître
4. Changer la **couleur de remplissage** → Jaune
5. ✅ L'étoile doit devenir jaune

#### Test 5 : Gestion des calques
1. Sélectionner un élément (texte, clipart, forme)
2. Dans **"📋 Gestion des Calques"**
3. Cliquer sur **"↑ Premier plan"**
4. ✅ L'élément doit passer devant tous les autres

#### Test 6 : Undo/Redo
1. Ajouter plusieurs éléments
2. Appuyer sur **Ctrl+Z** (Undo)
3. ✅ Le dernier élément ajouté doit disparaître
4. Appuyer sur **Ctrl+Y** (Redo)
5. ✅ L'élément doit réapparaître

#### Test 7 : Multi-vues
1. Cliquer sur l'onglet **"DOS"**
2. ✅ La vue doit changer
3. Ajouter un texte sur la vue DOS
4. Revenir à **"FACE"**
5. ✅ Le texte de la FACE doit toujours être là
6. ✅ Le texte du DOS ne doit pas être visible

#### Test 8 : Export (optionnel)
1. Remplir le formulaire (nom, prénom, email)
2. Cliquer sur **"✉️ Envoyer ma demande de devis"**
3. ✅ Une confirmation doit apparaître
4. ✅ En mode test, les données s'affichent dans la console

---

## 📊 Résultat Attendu

Si **tous les tests passent** ✅ :
- ✅ Phase 1 fonctionne (Texte + Cliparts)
- ✅ Phase 2 fonctionne (Formes + Calques)
- ✅ Multi-vues fonctionne
- ✅ Export fonctionne
- ✅ **Le configurateur est prêt pour la production**

---

## 🐛 En Cas de Problème

1. **Vider le cache à nouveau** (Ctrl+Shift+R)
2. **Vérifier la console F12** pour les erreurs
3. **Utiliser un serveur HTTP local** (python -m http.server 8080)
4. **Consulter** : `theme-shopify/TROUBLESHOOTING.md`

---

## 📞 Debug Avancé

Si les panneaux ne s'affichent toujours pas, ouvrir la console F12 et taper :

```javascript
// Vérifier les objets globaux
console.log('AppState:', typeof AppState);           // doit retourner "object"
console.log('CanvasManager:', typeof CanvasManager); // doit retourner "object"
console.log('PHASE1:', typeof window.PHASE1);        // doit retourner "object"
console.log('PHASE2:', typeof window.PHASE2);        // doit retourner "object"

// Vérifier le canvas
console.log('Canvas:', AppState.fabricCanvas);       // doit retourner un objet Fabric.Canvas

// Lister les objets sur le canvas
console.log('Objets:', AppState.fabricCanvas.getObjects());
```

Si **tout retourne "object"** → C'est bon ✅  
Si **"undefined"** → Il y a un problème de chargement des scripts ❌

---

**Dernière mise à jour** : 10 juin 2026  
**Statut** : ✅ Corrections appliquées
