# 📥 Télécharger Fabric.js

Fabric.js est une bibliothèque JavaScript obligatoire pour le fonctionnement du configurateur. Voici comment l'obtenir.

## 🎯 Méthode Recommandée (GitHub Releases)

### Étape 1 : Accéder aux Releases

Aller sur : [https://github.com/fabricjs/fabric.js/releases](https://github.com/fabricjs/fabric.js/releases)

### Étape 2 : Choisir la Version

- **Recommandé** : Version stable la plus récente (ex: 6.0.0 ou 5.3.0)
- Éviter les versions beta ou RC

### Étape 3 : Télécharger

Dans la section "Assets" de la release, télécharger :
- `fabric.min.js` (version minifiée pour production)

### Étape 4 : Placer le Fichier

```bash
# Déplacer le fichier téléchargé
mv ~/Downloads/fabric.min.js theme-shopify/assets/fabric.min.js
```

---

## 🌐 Méthode Alternative (CDN)

Si vous préférez ne pas héberger le fichier sur Shopify, vous pouvez utiliser un CDN.

### Modifier `sections/configurateur.liquid`

Remplacer :
```liquid
<script src="{{ 'fabric.min.js' | asset_url }}" defer></script>
```

Par :
```liquid
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js" defer></script>
```

⚠️ **Inconvénients du CDN** :
- Dépendance à un service tiers
- Peut être bloqué par certains navigateurs
- Pas de contrôle de version local

---

## ✅ Vérifier l'Installation

### Test 1 : Fichier Présent

```bash
# Vérifier que le fichier existe
ls -lh theme-shopify/assets/fabric.min.js

# Doit afficher quelque chose comme :
# -rw-r--r--  1 user  staff   350K  fabric.min.js
```

### Test 2 : Chargement dans le Navigateur

1. Démarrer le serveur Shopify :
   ```bash
   cd theme-shopify
   shopify theme dev
   ```

2. Ouvrir la page du configurateur

3. Ouvrir la console (F12)

4. Taper :
   ```javascript
   typeof fabric
   ```

   ✅ **Résultat attendu** : `"object"`
   
   ❌ **Si `undefined`** : Fabric.js n'est pas chargé

---

## 🔧 Résolution de Problèmes

### Erreur : "fabric is not defined"

**Cause** : Le fichier n'est pas chargé correctement

**Solutions** :

1. Vérifier que `fabric.min.js` est bien dans `assets/`
2. Vider le cache Shopify :
   ```bash
   shopify theme push
   ```
3. Vérifier dans DevTools > Network que `fabric.min.js` est bien téléchargé (status 200)

### Erreur : "Cannot read property 'Canvas' of undefined"

**Cause** : Le script `configurateur.js` s'exécute avant le chargement de Fabric.js

**Solution** : Vérifier l'ordre des scripts dans `configurateur.liquid` :

```liquid
<!-- Fabric.js DOIT être chargé AVANT configurateur.js -->
<script src="{{ 'fabric.min.js' | asset_url }}" defer></script>
<script src="{{ 'configurateur.js' | asset_url }}" defer></script>
```

### Fichier trop volumineux pour Shopify

**Cause** : Shopify a une limite de taille pour les assets (~10 Mo)

**Solution** : Utiliser la version minifiée (`fabric.min.js`, ~350 Ko) et non la version complète (`fabric.js`, ~1.5 Mo)

---

## 📦 Versions Testées et Compatibles

| Version Fabric.js | Compatible | Notes |
|-------------------|------------|-------|
| 6.0.0 | ✅ | Version la plus récente (juin 2024) |
| 5.3.0 | ✅ | Version stable recommandée |
| 5.2.4 | ✅ | Ancienne version stable |
| 4.x | ⚠️ | Non testée, peut nécessiter des ajustements |
| 3.x | ❌ | API trop ancienne |

**Recommandation** : Utiliser Fabric.js 5.3.0 ou 6.0.0

---

## 🔗 Liens Utiles

- **GitHub Releases** : https://github.com/fabricjs/fabric.js/releases
- **Documentation** : http://fabricjs.com/docs/
- **CDN (cdnjs)** : https://cdnjs.com/libraries/fabric.js
- **CDN (jsDelivr)** : https://www.jsdelivr.com/package/npm/fabric

---

## 🆘 Besoin d'Aide ?

Si vous rencontrez des problèmes pour télécharger ou installer Fabric.js :

1. Vérifier les logs Shopify CLI :
   ```bash
   shopify theme dev --verbose
   ```

2. Consulter la console du navigateur (F12)

3. Contacter le support : support@massacre-officiel.com

---

**Note** : Ce fichier peut être supprimé une fois Fabric.js correctement installé.
