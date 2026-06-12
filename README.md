# 👕 Configurateur Multi-Vues Massacre Officiel

Module de customisation de produits interactif avec gestion multi-vues (Face, Dos, Gauche, Droite) intégré directement dans Shopify, avec un éditeur enrichi (Texte, Motif, Formes, Calques, Alignement et Historique).

---

## 🎯 Fonctionnalités

- **Sélection de produit** : Interface fluide pour choisir un produit personnalisable.
- **Éditeur graphique enrichi** :
  - **Médias** : Importation de designs (PNG/JPEG, max 5 Mo) avec glisser-déposer.
  - **Texte (Phase 1)** : Ajout de textes personnalisés avec choix de polices (13 polices standard), couleurs (palette de flocage et sélecteur libre), tailles et styles (gras, italique, souligné).
  - **Motifs / Cliparts (Phase 1)** : Bibliothèque d'émojis classés par catégories (Formes, Symboles, Musique, Sport, Gaming, Animaux).
  - **Formes (Phase 2)** : Ajout de rectangles, cercles, triangles, étoiles et lignes, avec gestion du contour (couleur, épaisseur) et du remplissage.
  - **Calques (Phase 2)** : Gestion de la superposition (mettre en premier plan, reculer d'un plan, dupliquer, supprimer).
  - **Alignement (Phase 2)** : Alignement précis des éléments (gauche, droite, haut, bas, centré verticalement/horizontalement) dans la zone.
  - **Historique (Phase 2)** : Fonctions d'annulation/rétablissement (Undo/Redo) avec raccourcis clavier standard (`Ctrl+Z` / `Ctrl+Y`).
- **Zones éditables** : Définition de coordonnées de délimitation de la zone de personnalisation pour chaque face de produit. Tout débordement d'élément est masqué visuellement par un masque d'écrêtage (clipping mask) de Fabric.js.
- **Demande de devis** : Formulaire client générant automatiquement une demande de devis transmise à un microservice pour créer une commande brouillon (*Draft Order*) dans le back-office Shopify avec les maquettes HD jointes.

---

## 📁 Structure du Projet

```text
theme-shopify/
├── templates/
│   └── page.configurateur.json         # Modèle JSON de la page Shopify
├── sections/
│   └── configurateur.liquid            # Section principale du configurateur (Liquid)
├── assets/
│   ├── fabric.min.js                   # Bibliothèque Fabric.js (v5.3.0)
│   ├── configurateur.js                # Noyau du configurateur (initialisation, canvas)
│   ├── configurateur-phase1.js         # Module de texte et cliparts
│   ├── configurateur-phase2.js         # Module de formes, calques, alignement et historique
│   └── configurateur.css               # Styles et animations de l'interface
├── locales/
│   ├── fr.default.json                 # Traductions par défaut (Français)
│   └── en.json                         # Traductions (Anglais)
├── config/
│   └── settings_schema.json            # Configuration globale des paramètres du thème
├── push.bat                            # Script d'envoi rapide et sécurisé vers Shopify
└── README.md                           # Documentation du thème (ce fichier)
```

---

## 🚀 Installation & Déploiement

### 1. Prérequis
- **Shopify CLI** installé ([documentation officielle](https://shopify.dev/docs/themes/tools/cli))
- **Microservice de transit** configuré et déployé (voir le dossier `/microservice`).

### 2. Configuration locale
Assurez-vous que le fichier `assets/fabric.min.js` est présent.

### 3. Connexion à votre boutique
```bash
shopify login --store massacre-bxh1wqn9.myshopify.com
```

### 4. Commande de push (Mise en ligne)
Pour envoyer les fichiers locaux vers le thème actif Shopify, utilisez la commande suivante pour **éviter les erreurs de suppression sur les fichiers protégés** (comme `theme.liquid`) :

```bash
shopify theme push --store massacre-bxh1wqn9.myshopify.com --theme 159068291317 --allow-live --nodelete
```

> [!TIP]
> **Script rapide** : Vous pouvez simplement double-cliquer sur le fichier [`push.bat`](file:///c:/Users/simplon/Documents/Amadou/projet-massacre/theme-shopify/push.bat) pour effectuer le push automatiquement avec les bons paramètres de sécurité.

---

## ⚙️ Configuration des Metafields Shopify

Pour que les images des produits et les zones éditables soient chargées dans le configurateur, vous devez créer des metafields dans votre panneau d'administration Shopify (**Paramètres > Données personnalisées > Produits**).

### 1. Déclarations requises

| Nom du champ | Clé (Namespace & Key) | Type de contenu |
| :--- | :--- | :--- |
| **Image Face** | `custom.image_front` | Single line text (ou Fichier/Image) |
| **Image Dos** | `custom.image_back` | Single line text (ou Fichier/Image) |
| **Image Gauche** | `custom.image_left` | Single line text (ou Fichier/Image) |
| **Image Droite** | `custom.image_right` | Single line text (ou Fichier/Image) |
| **Zone Éditable** | `custom.editable_zones` | JSON |

### 2. Exemple de JSON pour la zone éditable (`custom.editable_zones`)
Saisissez ce format JSON dans la fiche produit de Shopify pour définir les cadres de personnalisation (coordonnées en pixels sur le canvas de référence 800x600) :

```json
{
  "front": {"x": 200, "y": 150, "w": 400, "h": 400},
  "back": {"x": 200, "y": 150, "w": 400, "h": 400},
  "left": {"x": 250, "y": 200, "w": 300, "h": 300},
  "right": {"x": 250, "y": 200, "w": 300, "h": 300}
}
```

---

## 🔧 Personnalisation

### Paramètres de la section
Vous pouvez modifier les titres et descriptions directement depuis l'éditeur de thème Shopify en ligne (Customizer) ou via les réglages de bloc.

### Couleurs et Styles CSS
Modifiez le fichier [`assets/configurateur.css`](file:///c:/Users/simplon/Documents/Amadou/projet-massacre/theme-shopify/assets/configurateur.css) :
- Le canvas a une hauteur visuelle limitée à **400px** sur ordinateur et **300px** sur mobile pour une interface élégante, tout en conservant sa résolution logique interne de 800x600px.
- La palette de couleurs se personnalise via les variables du `:root` :
```css
:root {
  --color-primary: #000000;
  --color-secondary: #333333;
  --color-border: #e0e0e0;
}
```

---

## 🐛 Diagnostic et débogage

Pour tester localement sans boutique Shopify active, vous pouvez ouvrir les fichiers HTML de test dans votre navigateur (ex : en utilisant un serveur HTTP simple comme `python -m http.server 8080`) :
1. [`test-configurateur-offline.html`](file:///c:/Users/simplon/Documents/Amadou/projet-massacre/theme-shopify/test-configurateur-offline.html) (utilise le serveur mock local).
2. [`test-page-configurateur.html`](file:///c:/Users/simplon/Documents/Amadou/projet-massacre/theme-shopify/test-page-configurateur.html).

Consultez `window.AppState` ou `window.CanvasManager` dans la console de développement (F12) pour suivre l'état de l'application en temps réel.
