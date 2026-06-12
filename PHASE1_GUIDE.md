# 🎨 Phase 1 : Texte, Polices, Couleurs & Cliparts

## ✅ Fonctionnalités Ajoutées

### 1. ✍️ Ajout de Texte Personnalisé
- Bouton "Ajouter un texte"
- Texte éditable directement sur le canvas (double-clic)
- Texte par défaut : "Votre texte ici"

### 2. 🔤 Polices (13 polices disponibles)
- Arial
- Helvetica
- Times New Roman
- Georgia
- Verdana
- Courier New
- Impact
- Comic Sans MS
- Trebuchet MS
- Arial Black
- Palatino
- Garamond
- Brush Script MT

### 3. 🎨 Couleurs
**12 couleurs prédéfinies pour flocage** :
- Noir, Blanc, Rouge, Bleu, Vert
- Jaune, Orange, Violet, Rose
- Gris, Marron, Or

**+ Sélecteur de couleur personnalisé** pour couleurs illimitées

### 4. 📏 Tailles de Texte
10 tailles disponibles : 12px, 16px, 20px, 24px, 32px, 48px, 64px, 72px, 96px, 128px

### 5. 🎭 Styles de Texte
- **Gras** (Bold)
- *Italique* (Italic)
- <u>Souligné</u> (Underline)

### 6. 🎨 Cliparts (20 motifs organisés en 6 catégories)

#### Formes
- ⭐ Étoile
- ❤️ Cœur
- 🌟 Étoile brillante
- 💎 Diamant

#### Symboles
- 🔥 Flamme
- ⚡ Éclair
- 👑 Couronne
- 💀 Crâne
- ☠️ Tête de mort
- 🔱 Trident
- ✨ Étincelles
- 🚀 Fusée

#### Musique
- 🎵 Note
- 🎸 Guitare
- 🎤 Micro
- 🎧 Casque

#### Sport
- ⚽ Foot
- 🏀 Basket
- 🎯 Cible
- 🏆 Trophée

#### Gaming
- 🎮 Manette
- 👾 Alien
- 🕹️ Joystick

#### Animaux
- 🦅 Aigle
- 🦁 Lion
- 🐺 Loup
- 🦋 Papillon

---

## 🚀 Comment Utiliser

### Ajouter du Texte

1. Cliquer sur **"➕ Ajouter un texte"**
2. Un texte apparaît au centre du canvas
3. Double-cliquer pour éditer le texte
4. Utiliser les contrôles pour personnaliser :
   - **Police** : Sélectionner dans la liste déroulante
   - **Taille** : Choisir de 12px à 128px
   - **Couleur** : Cliquer sur une couleur prédéfinie ou utiliser le sélecteur
   - **Style** : Boutons B (gras), I (italique), U (souligné)

### Ajouter un Clipart

1. Sélectionner une **catégorie** dans la liste déroulante
2. Cliquer sur le **motif souhaité**
3. Le clipart apparaît au centre du canvas
4. **Déplacer**, **redimensionner**, **pivoter** comme une image

### Manipuler un Élément

**Texte ou Clipart** :
- **Déplacer** : Cliquer et glisser
- **Redimensionner** : Utiliser les poignées d'angle
- **Pivoter** : Utiliser la poignée du haut
- **Supprimer** : Sélectionner puis cliquer "🗑️ Supprimer la sélection"

### Éditer un Texte Existant

1. **Double-cliquer** sur le texte
2. Modifier le contenu
3. Les options de style s'appliquent au texte sélectionné

---

## 🎯 Workflow Typique de Flocage

```
1. Sélectionner le produit (T-shirt)
2. Ajouter un texte principal (ex: "MASSACRE")
   - Police : Impact
   - Taille : 72px
   - Couleur : Blanc
3. Ajouter un clipart (ex: 🔥 Flamme)
4. Positionner les éléments
5. Basculer sur la vue "DOS"
6. Ajouter un autre texte ou motif
7. Valider et envoyer le devis
```

---

## 📸 Aperçu de l'Interface

### Panneau "Ajouter du texte"
```
✍️ Ajouter du texte
┌────────────────────────────┐
│ ➕ Ajouter un texte        │
└────────────────────────────┘

Police: [Arial ▼]
Taille: [48px ▼]
Couleur: [Grille de 12 couleurs]
        [Sélecteur personnalisé]
Style:  [B] [I] [U]
```

### Panneau "Ajouter un motif"
```
🎨 Ajouter un motif
Catégorie: [Symboles ▼]

┌─────┬─────┬─────┬─────┐
│ 🔥  │ ⚡  │ 👑  │ 💀  │
├─────┼─────┼─────┼─────┤
│ ☠️  │ 🔱  │ ✨  │ 🚀  │
└─────┴─────┴─────┴─────┘
```

---

## 🔧 Technique

### Architecture

Le module Phase 1 est un **fichier séparé** qui s'ajoute au configurateur de base :

```
configurateur.js         ← Module principal (déjà existant)
configurateur-phase1.js  ← Extension Phase 1 (nouveau)
```

**Avantages** :
- ✅ Ne modifie pas le code existant
- ✅ Peut être activé/désactivé facilement
- ✅ Facilite les mises à jour futures

### Modules JavaScript

```javascript
// TextManager : Gestion du texte
TextManager.addText()
TextManager.changeFont(fontName)
TextManager.changeSize(size)
TextManager.changeColor(color)
TextManager.toggleBold()
TextManager.toggleItalic()
TextManager.toggleUnderline()

// ClipartManager : Gestion des motifs
ClipartManager.addClipart(emoji, name)
ClipartManager.changeColor(color)

// UIManager : Interface utilisateur
UIManager.init()
UIManager.injectTextControls()
UIManager.injectClipartPanel()
```

### Intégration Fabric.js

Les textes utilisent **`fabric.IText`** (texte éditable interactif) :
- Double-clic pour éditer
- Sélection du texte avec la souris
- Styles appliqués en temps réel

Les cliparts utilisent **`fabric.Text`** avec des emojis Unicode :
- Haute qualité (vectoriel)
- Aucune dépendance externe
- Compatible tous navigateurs

---

## 🧪 Tests

### Test 1 : Ajout de Texte
1. Cliquer "Ajouter un texte"
2. Vérifier qu'un texte apparaît centré
3. Double-cliquer et taper "TEST"
4. ✅ Le texte doit se mettre à jour

### Test 2 : Changement de Police
1. Ajouter un texte
2. Sélectionner "Impact" dans la liste
3. ✅ Le texte doit changer de police

### Test 3 : Changement de Couleur
1. Ajouter un texte
2. Cliquer sur la couleur "Rouge"
3. ✅ Le texte doit devenir rouge

### Test 4 : Styles (Gras, Italique, Souligné)
1. Ajouter un texte
2. Cliquer sur [B], [I], [U]
3. ✅ Les styles doivent s'appliquer

### Test 5 : Ajout de Clipart
1. Sélectionner "Symboles"
2. Cliquer sur 🔥
3. ✅ Le clipart apparaît centré
4. ✅ Il peut être déplacé et redimensionné

### Test 6 : Multi-vues
1. Ajouter un texte sur "Face"
2. Basculer sur "Dos"
3. Ajouter un clipart
4. Revenir sur "Face"
5. ✅ Le texte doit être toujours présent

### Test 7 : Export
1. Créer un design avec texte + clipart
2. Envoyer le devis
3. ✅ Le Draft Order doit contenir les images avec texte + clipart

---

## 🐛 Dépannage

### Le panneau de texte ne s'affiche pas
➡️ Vérifier que `configurateur-phase1.js` est bien chargé après `configurateur.js`

### Les cliparts ne s'affichent pas
➡️ Vérifier que le navigateur supporte les emojis Unicode (tous les navigateurs modernes)

### Le texte ne peut pas être édité
➡️ Double-cliquer sur le texte pour entrer en mode édition

### Les polices ne s'affichent pas
➡️ Certaines polices peuvent ne pas être installées sur tous les systèmes. Les polices web sont recommandées pour la Phase 2.

---

## 📈 Prochaines Étapes (Phase 2)

Pour aller plus loin :
- Formes géométriques (rectangle, cercle, triangle)
- Gestion des calques avancée
- Alignement automatique avec guides
- Undo/Redo (historique)
- Polices Google Fonts
- Plus de cliparts (50+)

---

## 💡 Conseils pour le Flocage

### Couleurs
- **Flocage classique** : Maximum 2-3 couleurs par face
- **Plus de couleurs** = Prix plus élevé
- Privilégier les couleurs contrastées avec le tissu

### Texte
- **Taille minimum** : 24px pour lisibilité
- **Polices simples** : Meilleures pour le flocage
- Éviter les polices trop fines ou complexes

### Cliparts
- Les emojis sont parfaits pour le flocage
- Formes simples = Meilleur rendu
- Éviter les détails trop fins

---

**Version** : Phase 1 - v1.0  
**Date** : Juin 2026  
**Fichier** : `configurateur-phase1.js`  
**Taille** : ~15 Ko  
**Compatibilité** : Tous navigateurs modernes
