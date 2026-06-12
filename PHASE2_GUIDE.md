# 🚀 Phase 2 : Formes, Calques, Alignement & Undo/Redo

## ✅ Fonctionnalités Ajoutées

### 1. 🔷 Formes Géométriques (5 formes)
- **Rectangle** (▭)
- **Cercle** (●)
- **Triangle** (▲)
- **Étoile** (⭐)
- **Ligne** (─)

#### Options de personnalisation
- **Contour** : Couleur et épaisseur (1-10px)
- **Remplissage** : Couleur ou transparent
- Taille par défaut : 100px
- Entièrement redimensionnable

### 2. 📚 Gestion des Calques
- **Premier plan** (⬆⬆) : Amène l'objet tout devant
- **Monter** (⬆) : Monte d'un niveau
- **Descendre** (⬇) : Descend d'un niveau
- **Arrière-plan** (⬇⬇) : Envoie l'objet tout derrière
- **Dupliquer** (📄) : Crée une copie de l'objet

### 3. 📐 Outils d'Alignement (7 options)
- **Gauche** (⊣) : Aligne à gauche de la zone
- **Centre H** (⊢⊣) : Centre horizontalement
- **Droite** (⊢) : Aligne à droite
- **Haut** (⊤) : Aligne en haut
- **Centre V** (⊥⊤) : Centre verticalement
- **Bas** (⊥) : Aligne en bas
- **Centrer** (⊕) : Centre horizontal + vertical

### 4. ⏮️ Historique (Undo/Redo)
- **Annuler** (↶) : Annule la dernière action
- **Refaire** (↷) : Refait l'action annulée
- **Raccourcis clavier** : 
  - `Ctrl+Z` ou `Cmd+Z` : Annuler
  - `Ctrl+Y` ou `Cmd+Y` : Refaire
- **Historique** : 20 actions mémorisées

---

## 🎯 Comment Utiliser

### Ajouter une Forme

1. Cliquer sur l'**icône de la forme** souhaitée (▭ ● ▲ ⭐ ─)
2. La forme apparaît au centre du canvas
3. **Personnaliser** :
   - **Contour** : Choisir la couleur du trait
   - **Remplissage** : Choisir la couleur de fond (ou cliquer sur ∅ pour transparent)
   - **Épaisseur** : Ajuster avec le slider (1-10px)
4. **Manipuler** :
   - Déplacer, redimensionner, pivoter comme n'importe quel objet

### Gérer les Calques

**Scénario** : Vous avez un texte et voulez mettre un rectangle derrière

1. Ajouter le texte
2. Ajouter un rectangle
3. Le rectangle est au-dessus (masque le texte)
4. Sélectionner le rectangle
5. Cliquer sur **⬇⬇ Arrière-plan**
6. ✅ Le texte est maintenant visible au-dessus du rectangle

**Dupliquer un élément** :
1. Sélectionner l'objet
2. Cliquer sur **📄 Dupliquer**
3. Une copie apparaît légèrement décalée

### Aligner des Éléments

**Scénario** : Centrer un texte

1. Sélectionner le texte
2. Cliquer sur **⊕ Centrer**
3. ✅ Le texte est maintenant parfaitement centré

**Scénario** : Aligner plusieurs éléments à gauche

1. Créer plusieurs éléments
2. Les sélectionner un par un et cliquer sur **⊣ Gauche**
3. ✅ Tous les éléments sont alignés

### Utiliser l'Historique

**Annuler une erreur** :
- Clic sur **↶ Annuler** ou `Ctrl+Z`
- L'action précédente est annulée

**Refaire** :
- Clic sur **↷ Refaire** ou `Ctrl+Y`
- L'action annulée est rétablie

**Naviguer dans l'historique** :
- Annuler plusieurs fois pour revenir en arrière
- Refaire pour avancer
- Maximum 20 étapes sauvegardées

---

## 📸 Aperçu de l'Interface

### Panneau "Ajouter une forme"
```
🔷 Ajouter une forme
┌─────┬─────┬─────┬─────┬─────┐
│ ▭   │ ●   │ ▲   │ ⭐  │ ─   │
└─────┴─────┴─────┴─────┴─────┘

Contour: [Sélecteur couleur]
Remplissage: [Sélecteur] [∅]
Épaisseur: [2] ━━━━━━━━━ [10px]
```

### Panneau "Gestion des calques"
```
📚 Gestion des calques
┌─────┬─────┬─────┬─────┬─────┐
│ ⬆⬆  │ ⬆   │ ⬇   │ ⬇⬇  │ 📄  │
└─────┴─────┴─────┴─────┴─────┘
```

### Panneau "Alignement"
```
📐 Alignement
┌─────┬─────┬─────┐
│ ⊣   │ ⊢⊣  │ ⊢   │
├─────┼─────┼─────┤
│ ⊤   │ ⊥⊤  │ ⊥   │
├─────┴─────┴─────┤
│       ⊕         │
└─────────────────┘
```

### Panneau "Historique"
```
⏮️ Historique
┌──────────┬──────────┐
│ ↶ Annuler│ ↷ Refaire│
└──────────┴──────────┘
Raccourcis: Ctrl+Z / Ctrl+Y
```

---

## 🎨 Exemples d'Utilisation

### Badge avec Forme

```
1. Ajouter un cercle (●)
2. Remplissage : Rouge
3. Contour : Transparent (∅)
4. Ajouter un texte "VIP"
5. Centrer le texte (⊕)
6. Texte au premier plan (⬆⬆)
```

### Logo avec Formes

```
1. Ajouter une étoile (⭐)
2. Remplissage : Jaune
3. Contour : Noir, 3px
4. Ajouter un rectangle
5. Arrière-plan (⬇⬇)
6. Aligner l'étoile au centre (⊕)
```

### Design Symétrique

```
1. Ajouter un triangle (▲)
2. Dupliquer (📄)
3. Faire pivoter la copie à 180°
4. Aligner les deux triangles
5. Créer un motif symétrique
```

---

## 🔧 Technique

### Architecture

```
configurateur.js         ← Module principal
configurateur-phase1.js  ← Texte + Cliparts
configurateur-phase2.js  ← Formes + Calques + Alignement + Historique
```

### Modules JavaScript

```javascript
// ShapeManager : Gestion des formes
ShapeManager.addShape(type)
ShapeManager.changeStrokeColor(color)
ShapeManager.changeFillColor(color)
ShapeManager.changeStrokeWidth(width)

// LayerManager : Gestion des calques
LayerManager.bringToFront()
LayerManager.sendToBack()
LayerManager.bringForward()
LayerManager.sendBackward()
LayerManager.duplicate()

// AlignmentManager : Alignement
AlignmentManager.alignLeft()
AlignmentManager.alignCenterH()
AlignmentManager.alignRight()
AlignmentManager.alignTop()
AlignmentManager.alignCenterV()
AlignmentManager.alignBottom()
AlignmentManager.alignCenter()

// HistoryManager : Historique
HistoryManager.undo()
HistoryManager.redo()
HistoryManager.saveState()
```

### Intégration Fabric.js

- **Rectangle** : `fabric.Rect`
- **Cercle** : `fabric.Circle`
- **Triangle** : `fabric.Triangle`
- **Étoile** : `fabric.Polygon` (5 branches)
- **Ligne** : `fabric.Line`

### Sauvegarde Automatique

L'historique se sauvegarde automatiquement :
- Après ajout d'un objet
- Après modification (déplacement, redimensionnement)
- Après action de calque
- Après alignement

---

## 🧪 Tests

### Test 1 : Ajout de Forme
1. Cliquer sur Rectangle (▭)
2. ✅ Un rectangle apparaît centré
3. ✅ Il est sélectionné et manipulable

### Test 2 : Personnalisation
1. Ajouter un cercle
2. Changer la couleur de remplissage en rouge
3. ✅ Le cercle devient rouge
4. Changer l'épaisseur à 5px
5. ✅ Le contour s'épaissit

### Test 3 : Gestion Calques
1. Ajouter un rectangle
2. Ajouter un cercle (par-dessus)
3. Sélectionner le cercle
4. Cliquer "Arrière-plan"
5. ✅ Le cercle passe derrière le rectangle

### Test 4 : Alignement
1. Ajouter un texte
2. Cliquer "Centrer"
3. ✅ Le texte est au centre de la zone

### Test 5 : Undo/Redo
1. Ajouter plusieurs éléments
2. Cliquer "Annuler" plusieurs fois
3. ✅ Les éléments disparaissent dans l'ordre inverse
4. Cliquer "Refaire"
5. ✅ Les éléments réapparaissent

### Test 6 : Multi-vues
1. Ajouter des formes sur "Face"
2. Basculer sur "Dos"
3. Revenir sur "Face"
4. ✅ Les formes sont toujours présentes

### Test 7 : Export
1. Créer un design avec formes + texte
2. Envoyer le devis
3. ✅ Le Draft Order contient les images avec formes

---

## 💡 Astuces

### Créer un Badge Cercle

```
1. Cercle (remplissage rouge, pas de contour)
2. Texte "SALE" (blanc, centré)
3. Centrer le texte sur le cercle
```

### Créer un Encadré

```
1. Rectangle (pas de remplissage, contour noir 3px)
2. Texte à l'intérieur
3. Aligner le texte au centre
```

### Créer un Motif Géométrique

```
1. Ajouter une forme
2. Dupliquer plusieurs fois
3. Positionner en grille
4. Utiliser l'alignement pour la précision
```

### Raccourcis Efficaces

- Formes rapides : Cliquer sur l'icône
- Dupliquer : Bouton 📄 (plus rapide que copier-coller)
- Centrer : Bouton ⊕ (économie de clics)
- Undo : `Ctrl+Z` (plus rapide que le bouton)

---

## 🎯 Cas d'Usage

### T-Shirt avec Badge

```
Face :
  - Rectangle (remplissage rouge)
  - Texte "LIMITED" (blanc, centré)
  - Positionner en haut à gauche
```

### Logo Géométrique

```
Face :
  - Triangle (remplissage noir)
  - Cercle (remplissage blanc, plus petit)
  - Centrer le cercle sur le triangle
  - Texte dans le cercle
```

### Design Minimaliste

```
Face :
  - 3 Lignes parallèles (noires, 2px)
  - Texte au centre
  - Tout aligné horizontalement
```

---

## 🐛 Dépannage

### Les boutons sont grisés

➡️ Sélectionner un objet d'abord (les actions s'appliquent à l'objet sélectionné)

### L'historique ne fonctionne pas

➡️ Vérifier que `configurateur-phase2.js` est bien chargé après les autres fichiers

### Les formes ne s'affichent pas

➡️ Vérifier la console (F12) pour les erreurs JavaScript

### Ctrl+Z annule toute la page

➡️ C'est normal si le canvas n'a pas le focus. Cliquer sur le canvas d'abord.

---

## 📈 Statistiques

- **Lignes de code** : ~800
- **Taille fichier** : 18 Ko
- **Formes** : 5
- **Actions calques** : 5
- **Actions alignement** : 7
- **Historique** : 20 actions
- **Raccourcis** : 2 (Ctrl+Z, Ctrl+Y)

---

## 🚀 Prochaines Étapes (Phase 3)

Fonctionnalités Premium potentielles :
- Plus de formes (pentagone, hexagone, flèche)
- Contour de texte (stroke)
- Ombre portée
- Dégradés de couleur
- Effets 3D
- Templates pré-conçus
- Import SVG
- Grille magnétique (snap to grid)

---

**Version** : Phase 2 - v1.0  
**Date** : Juin 2026  
**Fichier** : `configurateur-phase2.js`  
**Taille** : ~18 Ko  
**Dépendances** : configurateur.js, configurateur-phase1.js  
**Compatibilité** : Tous navigateurs modernes
