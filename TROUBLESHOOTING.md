# 🔧 Dépannage - Phase 1 & Phase 2 Non Visibles

## ✅ PROBLÈME RÉSOLU (Mise à jour du 10 juin 2026)

**Le problème d'affichage des phases 1 et 2 a été corrigé.**

### Correction apportée

Les modules Phase 1 et Phase 2 attendaient que `AppState` soit disponible, mais s'exécutaient trop tôt. Les fichiers ont été modifiés pour implémenter une **fonction d'attente active** :

```javascript
function waitForConfigurator(callback) {
  if (typeof AppState === 'undefined' || typeof CanvasManager === 'undefined') {
    console.warn('[PhaseX] En attente du configurateur principal...');
    setTimeout(() => waitForConfigurator(callback), 100);
    return;
  }
  callback();
}
```

Cette fonction réessaye toutes les 100ms jusqu'à ce que le configurateur principal soit prêt.

---

## 🔍 Comment vérifier que tout fonctionne

### 1. Vider le cache du navigateur

**Windows/Linux** : `Ctrl + Shift + R` ou `Ctrl + F5`  
**macOS** : `Cmd + Shift + R`

### 2. Ouvrir la Console (F12)

Vous devriez voir ces messages dans l'ordre :

```
[Init] Démarrage du configurateur Massacre Officiel...
✅ Configurateur prêt.
[Phase1] Configurateur principal détecté, initialisation...
[Phase1] ✅ Fonctionnalités Texte + Cliparts activées
[Phase2] Configurateur principal détecté, initialisation...
[Phase2] ✅ Fonctionnalités Formes + Calques + Alignement + Historique activées
```

### 3. Vérifier les objets globaux

Dans la console, tapez :

```javascript
typeof AppState        // doit retourner "object"
typeof window.PHASE1   // doit retourner "object"  
typeof window.PHASE2   // doit retourner "object"
```

### 4. Vérifier visuellement

Après avoir sélectionné un produit, vous devriez voir **4 nouveaux panneaux** :

- 📝 **Ajouter du Texte** (Phase 1)
- 🎨 **Cliparts** (Phase 1)
- ⬜ **Formes Géométriques** (Phase 2)
- 📋 **Gestion des Calques** (Phase 2)

---

## 🚨 Si le problème persiste

### Étape 1 : Vérifier l'ordre des scripts

Dans `test-configurateur-offline.html`, les scripts doivent être chargés dans cet ordre :

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
<script src="assets/configurateur.js"></script>
<script src="assets/configurateur-phase1.js"></script>
<script src="assets/configurateur-phase2.js"></script>
```

### Étape 2 : Vérifier que les fichiers existent

```bash
ls -la theme-shopify/assets/
```

Vous devriez voir :
- `configurateur.js`
- `configurateur-phase1.js`
- `configurateur-phase2.js`
- `configurateur.css`

### Étape 3 : Utiliser un serveur HTTP local

Les fichiers JavaScript peuvent être bloqués si ouverts directement avec `file://`

**Solution** : Utiliser un serveur HTTP local

```bash
cd theme-shopify
python -m http.server 8080
```

Puis ouvrir : `http://localhost:8080/test-configurateur-offline.html`

---

## 🐛 Anciennes Erreurs (Historique)

### ❌ Erreur : `AppState is not defined`

**Cause** : Le fichier `configurateur.js` n'exposait pas `AppState`

**Solution** : Déjà corrigée dans `configurateur.js` (lignes 1026-1033)

#### Erreur : `fabric is not defined`

**Cause** : Fabric.js ne charge pas

**Solution** :
1. Vérifier votre connexion internet (le CDN doit être accessible)
2. Ou télécharger `fabric.min.js` et le placer dans `assets/`

#### Erreur : `Cannot read property 'fabricCanvas' of undefined`

**Cause** : Le canvas n'est pas encore initialisé

**Solution** : Attendre quelques secondes et rafraîchir

---

## ✅ Solution 3 : Vérifier les Fichiers

### Vérifier que les fichiers existent

```bash
# Dans le terminal
ls -la theme-shopify/assets/
```

**Vous devez voir** :
- `configurateur.js` ✅
- `configurateur-phase1.js` ✅
- `configurateur-phase2.js` ✅
- `configurateur.css` ✅

### Vérifier que les scripts sont chargés

Dans la console (F12), taper :

```javascript
typeof AppState
// Doit retourner "object"

typeof window.PHASE1
// Doit retourner "object"

typeof window.PHASE2
// Doit retourner "object"
```

Si l'un retourne `"undefined"`, le fichier correspondant n'est pas chargé.

---

## ✅ Solution 4 : Utiliser un Serveur HTTP Local

Le problème peut venir du fait que vous ouvrez le fichier en `file://`

### Démarrer un serveur local

```bash
# Option 1 : Python
cd theme-shopify
python -m http.server 8080

# Option 2 : Node.js
npx http-server -p 8080

# Option 3 : PHP
php -S localhost:8080
```

Puis ouvrir : `http://localhost:8080/test-configurateur-offline.html`

---

## ✅ Solution 5 : Vérifier l'Ordre des Scripts

Dans `test-configurateur-offline.html`, les scripts doivent être dans **cet ordre exact** :

```html
<!-- 1. Fabric.js (obligatoire en premier) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>

<!-- 2. Configurateur de base -->
<script src="assets/configurateur.js"></script>

<!-- 3. Phase 1 (dépend de configurateur.js) -->
<script src="assets/configurateur-phase1.js"></script>

<!-- 4. Phase 2 (dépend de configurateur.js et phase1.js) -->
<script src="assets/configurateur-phase2.js"></script>
```

---

## ✅ Solution 6 : Réinstaller les Fichiers

Si rien ne fonctionne, re-télécharger les fichiers :

```bash
# Sauvegarder les anciens fichiers
mv theme-shopify/assets theme-shopify/assets.backup

# Copier les nouveaux fichiers
# (replacer depuis votre source)
```

---

## 📊 Checklist de Diagnostic

### Phase 1

Console F12, taper :
```javascript
window.PHASE1
```

**Résultat attendu** :
```javascript
{
  TextManager: {...},
  ClipartManager: {...},
  UIManager: {...},
  CONFIG: {...}
}
```

**Si `undefined`** : `configurateur-phase1.js` n'est pas chargé

### Phase 2

Console F12, taper :
```javascript
window.PHASE2
```

**Résultat attendu** :
```javascript
{
  ShapeManager: {...},
  LayerManager: {...},
  AlignmentManager: {...},
  HistoryManager: {...},
  CONFIG: {...},
  State: {...}
}
```

**Si `undefined`** : `configurateur-phase2.js` n'est pas chargé

---

## 🎯 Test Rapide

Après avoir appliqué les solutions, tester :

```javascript
// Console F12
console.log('AppState:', typeof AppState);
console.log('PHASE1:', typeof window.PHASE1);
console.log('PHASE2:', typeof window.PHASE2);
console.log('Fabric:', typeof fabric);
```

**Résultat attendu** :
```
AppState: object
PHASE1: object
PHASE2: object
Fabric: object
```

Si tout est `object`, **ça devrait fonctionner** ! ✅

---

## 🆘 Toujours Bloqué ?

### Méthode de dernier recours

1. **Fermer complètement le navigateur** (toutes les fenêtres)
2. **Supprimer le cache du navigateur** :
   - Chrome : `Ctrl+Shift+Delete` > Cocher "Images et fichiers en cache" > Effacer
   - Firefox : `Ctrl+Shift+Delete` > Cocher "Cache" > Effacer
3. **Redémarrer le navigateur**
4. **Ouvrir le fichier avec un serveur HTTP** (pas en `file://`)

```bash
cd theme-shopify
python -m http.server 8080
# Ouvrir http://localhost:8080/test-configurateur-offline.html
```

5. **Ouvrir la console (F12)**
6. **Vérifier qu'il n'y a aucune erreur rouge**

---

## 💡 Astuce

Pour éviter ces problèmes à l'avenir :

1. Toujours utiliser un **serveur HTTP local** pour les tests
2. Toujours ouvrir les **DevTools** (F12) pour voir les erreurs
3. Toujours faire un **rechargement forcé** (`Ctrl+Shift+R`)

---

**Si le problème persiste, consultez les logs dans la console F12 et partagez-les pour obtenir de l'aide.**
