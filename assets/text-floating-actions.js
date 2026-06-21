/**
 * Object Floating Actions — DÉSACTIVÉ
 *
 * Les 4 boutons d'action aux coins (Supprimer / Rotation / Dupliquer /
 * Redimensionner) sont désormais entièrement gérés par CustomControls,
 * défini dans configurateur.js. CustomControls utilise les contrôles
 * natifs de Fabric.js (tl/tr/bl/br) avec un positionHandler dédié qui
 * suit correctement le zoom (CSS transform sur .canvas-container) et la
 * rotation de l'objet — sans avoir besoin de recalculer manuellement des
 * coordonnées DOM.
 *
 * Ce fichier ne crée plus de second système de boutons en DOM (qui faisait
 * doublon avec CustomControls et provoquait un décalage visuel, car
 * positionné indépendamment). Il expose uniquement des méthodes "stub"
 * (no-op) sous window.ObjectFloatingActions / window.TextFloatingActions,
 * car d'autres fichiers (configurateur.js, configurateur-phase1.js,
 * configurateur-phase2.js) appellent ces méthodes de façon conditionnelle
 * (if (window.ObjectFloatingActions) { ... }). Garder ces stubs évite
 * d'avoir à toucher à ces fichiers : les appels existants ne font
 * simplement plus rien.
 *
 * Si ce fichier n'est plus chargé du tout par configurateur.liquid,
 * il peut être supprimé sans danger — ces appels sont déjà protégés par
 * des vérifications "if (window.ObjectFloatingActions)".
 */

(function() {
  'use strict';

  const NoopFloatingActions = {
    applyObjectDefaults() {},
    applyTextDefaults() {},
    show() {},
    hide() {},
    updatePosition() {},
  };

  window.ObjectFloatingActions = NoopFloatingActions;
  window.TextFloatingActions = NoopFloatingActions;

})();