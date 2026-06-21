/**
 * text-shape-warp.js
 * Module de déformation de texte — 12 formes (Normal, Curve, Arch, Bridge, Valley,
 * Pinch, Bulge, Perspective, Pointed, Downward, Upward, Cone)
 * Fonctionne avec Fabric.js via canvas 2D path rendering.
 * À charger APRÈS configurateur.js et configurateur-phase1.js
 */

(function () {
  'use strict';

  // ─── Attendre que le configurateur principal soit prêt ───────────────────────
  function waitForConfigurator(cb) {
    if (typeof AppState === 'undefined' || typeof fabric === 'undefined') {
      setTimeout(() => waitForConfigurator(cb), 100);
      return;
    }
    cb();
  }

  // ─── Définition des 12 formes ────────────────────────────────────────────────

  const SHAPES = [
    { id: 'normal',      label: 'NORMAL',      preview: 'NORMAL' },
    { id: 'curve',       label: 'CURVE',        preview: 'CURVE' },
    { id: 'arch',        label: 'ARCH',         preview: 'ARCH' },
    { id: 'bridge',      label: 'BRIDGE',       preview: 'BRIDGE' },
    { id: 'valley',      label: 'VALLEY',       preview: 'VALLEY' },
    { id: 'pinch',       label: 'PINCH',        preview: 'PINCH' },
    { id: 'bulge',       label: 'BULGE',        preview: 'BULGE' },
    { id: 'perspective', label: 'PERSPECTIVE',  preview: 'PERSPECTIVE' },
    { id: 'pointed',     label: 'POINTED',      preview: 'POINTED' },
    { id: 'downward',    label: 'DOWNWARD',     preview: 'DOWNWARD' },
    { id: 'upward',      label: 'UPWARD',       preview: 'UPWARD' },
    { id: 'cone',        label: 'CONE',         preview: 'CONE' },
  ];

  // ─── Moteur de déformation : rendu sur canvas offscreen ─────────────────────

  const WarpEngine = {

    /**
     * Applique une forme de déformation sur un objet i-text Fabric.js
     * en le convertissant en fabric.Image (rendu offscreen).
     *
     * @param {fabric.IText} textObj  L'objet texte Fabric.js
     * @param {string}        shapeId  L'identifiant de la forme
     */
    apply(textObj, shapeId) {
      if (!textObj) return;

      // Sauvegarder les infos originales sur l'objet pour pouvoir revenir à Normal
      if (!textObj._warpOriginal) {
        textObj._warpOriginal = {
          text:       textObj.text,
          fontFamily: textObj.fontFamily,
          fontSize:   textObj.fontSize,
          fill:       textObj.fill,
          fontWeight: textObj.fontWeight,
          fontStyle:  textObj.fontStyle,
          stroke:     textObj.stroke,
          strokeWidth:textObj.strokeWidth,
          left:       textObj.left,
          top:        textObj.top,
          angle:      textObj.angle,
          originX:    textObj.originX,
          originY:    textObj.originY,
        };
      }

      textObj._warpShape = shapeId;

      if (shapeId === 'normal') {
        this._removeWarp(textObj);
        return;
      }

      this._renderWarp(textObj, shapeId);
    },

    // Supprime le warp et restaure l'objet texte original
    _removeWarp(textObj) {
      const canvas = AppState.fabricCanvas;
      if (!canvas) return;

      // Si un objet warpé existe déjà, supprimer l'image warpée liée
      if (textObj._warpImageRef) {
        canvas.remove(textObj._warpImageRef);
        textObj._warpImageRef = null;
      }

      // Remettre l'objet texte visible
      textObj.set('opacity', 1);
      textObj.selectable = true;
      textObj.evented    = true;
      canvas.setActiveObject(textObj);
      canvas.renderAll();
    },

    // Rendu offscreen et création d'un fabric.Image déformé
    _renderWarp(textObj, shapeId) {
      const canvas = AppState.fabricCanvas;
      if (!canvas) return;

      // 1. Rendre le texte sur un canvas offscreen
      const fontSize   = textObj.fontSize   || 48;
      const text       = textObj.text       || '';
      const fontFamily = textObj.fontFamily || 'Arial';
      const fill       = textObj.fill       || '#000000';
      const fontWeight = textObj.fontWeight || 'normal';
      const fontStyle  = textObj.fontStyle  || 'normal';

      const offW = 600;
      const offH = 200;

      const off = document.createElement('canvas');
      off.width  = offW;
      off.height = offH;
      const ctx  = off.getContext('2d');

      ctx.font      = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}"`;
      ctx.fillStyle = fill;
      if (textObj.stroke && textObj.strokeWidth > 0) {
        ctx.strokeStyle = textObj.stroke;
        ctx.lineWidth   = textObj.strokeWidth;
      }
      ctx.textBaseline = 'middle';
      ctx.textAlign    = 'center';

      // Mesurer le texte pour centrer
      const tm  = ctx.measureText(text);
      const tw  = tm.width;
      const th  = fontSize * 1.2;

      // Créer un canvas src de taille exacte du texte
      const srcW = Math.ceil(tw) + 40;
      const srcH = Math.ceil(th) + 20;
      const src  = document.createElement('canvas');
      src.width  = srcW;
      src.height = srcH;
      const sc   = src.getContext('2d');
      sc.font      = ctx.font;
      sc.fillStyle = fill;
      sc.textBaseline = 'middle';
      sc.textAlign    = 'center';
      if (textObj.stroke && textObj.strokeWidth > 0) {
        sc.strokeStyle = textObj.stroke;
        sc.lineWidth   = textObj.strokeWidth;
        sc.strokeText(text, srcW / 2, srcH / 2);
      }
      sc.fillText(text, srcW / 2, srcH / 2);

      // 2. Déformer pixel par pixel
      const dest   = document.createElement('canvas');
      const dW     = srcW;
      const dH     = srcH + 80;  // hauteur augmentée pour les déformations verticales
      dest.width   = dW;
      dest.height  = dH;
      const dc     = dest.getContext('2d');

      const srcData  = sc.getImageData(0, 0, srcW, srcH);
      const destData = dc.createImageData(dW, dH);

      this._warpPixels(srcData, destData, srcW, srcH, dW, dH, shapeId);
      dc.putImageData(destData, 0, 0);

      // 3. Remplacer ou créer le fabric.Image
      const dataURL = dest.toDataURL('image/png');

      const savedLeft  = textObj.left;
      const savedTop   = textObj.top;
      const savedAngle = textObj.angle || 0;

      // Masquer l'objet texte original (on garde sa référence)
      textObj.set('opacity', 0);
      textObj.selectable = false;
      textObj.evented    = false;

      // Supprimer l'ancienne image warpée si elle existe
      if (textObj._warpImageRef) {
        canvas.remove(textObj._warpImageRef);
        textObj._warpImageRef = null;
      }

      fabric.Image.fromURL(dataURL, (img) => {
        img.set({
          left:    savedLeft,
          top:     savedTop,
          angle:   savedAngle,
          originX: 'center',
          originY: 'center',
          scaleX:  1,
          scaleY:  1,
          isWarpImage: true,
        });

        // Lier l'image au texte original
        img._linkedTextObj = textObj;
        textObj._warpImageRef = img;

        // Quand on clique sur l'image warpée → resélectionner le texte
        img.on('mousedown', () => {
          textObj.set('opacity', 0);
          canvas.setActiveObject(textObj);
          // Le panneau d'édition montrera le texte original
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    },

    // Déformation pixel par pixel selon la forme
    _warpPixels(srcData, destData, sW, sH, dW, dH, shape) {
      const src  = srcData.data;
      const dest = destData.data;
      const cx   = dW / 2;
      const cy   = dH / 2;

      for (let dy = 0; dy < dH; dy++) {
        for (let dx = 0; dx < dW; dx++) {

          // Coordonnées normalisées [-1, 1]
          const nx = (dx / dW) * 2 - 1;  // -1 à 1 horizontal
          const ny = (dy / dH) * 2 - 1;  // -1 à 1 vertical

          let sx = nx;
          let sy = ny;

          switch (shape) {

            // ── Curve : déformation horizontale légère en arc ──────────────
            case 'curve': {
              const bend = 0.35;
              sy = ny + bend * nx * nx;
              break;
            }

            // ── Arch : arc vers le haut ────────────────────────────────────
            case 'arch': {
              const bend = 0.45;
              sy = ny + bend * (1 - nx * nx);
              break;
            }

            // ── Bridge : arc vers le bas (pont) ───────────────────────────
            case 'bridge': {
              const bend = -0.45;
              sy = ny + bend * (1 - nx * nx);
              break;
            }

            // ── Valley : vallée (bas du milieu, hauts sur les côtés) ───────
            case 'valley': {
              const bend = 0.45;
              sy = ny - bend * (1 - nx * nx);
              break;
            }

            // ── Pinch : pincement au centre ────────────────────────────────
            case 'pinch': {
              const factor = 1 - 0.5 * Math.exp(-nx * nx * 4);
              sy = (ny - 0) * factor + 0;
              // Pincement vertical au centre horizontal
              const pinchY = 0.4 * (1 - Math.exp(-nx * nx * 6));
              sy = ny * (1 - pinchY) + ny > 0 ? ny * pinchY : 0;
              // Approche plus simple et visible
              const squeeze = Math.abs(nx) < 0.3 ? 0.6 : 1;
              sy = ny * squeeze;
              break;
            }

            // ── Bulge : gonflement au centre ───────────────────────────────
            case 'bulge': {
              const bulge = 1 + 0.5 * (1 - nx * nx) * (1 - ny * ny);
              sx = nx / bulge;
              sy = ny / bulge;
              break;
            }

            // ── Perspective : effet perspective (plus large en bas) ────────
            case 'perspective': {
              const perspFactor = 1 + 0.5 * ny;
              sx = nx / perspFactor;
              break;
            }

            // ── Pointed : pointe au centre haut ───────────────────────────
            case 'pointed': {
              const peak = 0.6 * (1 - nx * nx);
              sy = ny + peak;
              break;
            }

            // ── Downward : arc vers le bas accentué ───────────────────────
            case 'downward': {
              const bend = -0.6;
              sy = ny + bend * (1 - nx * nx);
              sx = nx * (1 - 0.15 * Math.abs(ny));
              break;
            }

            // ── Upward : arc vers le haut accentué ────────────────────────
            case 'upward': {
              const bend = 0.6;
              sy = ny + bend * (1 - nx * nx);
              sx = nx * (1 - 0.15 * Math.abs(ny));
              break;
            }

            // ── Cone : effet cône (s'élargit vers le bas) ─────────────────
            case 'cone': {
              const coneFactor = 0.3 + 0.7 * ((ny + 1) / 2);
              sx = nx / coneFactor;
              break;
            }
          }

          // Convertir back en coordonnées source
          const srcX = Math.round((sx + 1) / 2 * sW);
          const srcY = Math.round((sy + 1) / 2 * sH);

          const di = (dy * dW + dx) * 4;

          if (srcX >= 0 && srcX < sW && srcY >= 0 && srcY < sH) {
            const si = (srcY * sW + srcX) * 4;
            dest[di]     = src[si];
            dest[di + 1] = src[si + 1];
            dest[di + 2] = src[si + 2];
            dest[di + 3] = src[si + 3];
          } else {
            dest[di]     = 0;
            dest[di + 1] = 0;
            dest[di + 2] = 0;
            dest[di + 3] = 0;
          }
        }
      }
    },
  };

  // ─── Injection du HTML de la grille dans le DOM ──────────────────────────────

  const TextShapeUI = {

    init() {
      this._injectGrid();
      this._injectStyles();
      this._bindEvents();
    },

    _injectGrid() {
      const panel = document.getElementById('text-shape-options');
      if (!panel) return;

      const gridHTML = `
        <div class="warp-shape-grid" id="warp-shape-grid">
          ${SHAPES.map(s => `
            <button
              class="warp-shape-btn${s.id === 'normal' ? ' active' : ''}"
              data-shape="${s.id}"
              type="button"
              title="${s.label}"
            >
              <canvas class="warp-preview-canvas" width="90" height="50" data-shape="${s.id}"></canvas>
            </button>
          `).join('')}
        </div>
      `;

      panel.innerHTML = gridHTML;

      // Dessiner les previews après injection
      requestAnimationFrame(() => this._drawPreviews());
    },

    // Dessine un petit aperçu de la déformation dans chaque bouton
    _drawPreviews() {
      document.querySelectorAll('.warp-preview-canvas').forEach(cv => {
        const shape = cv.dataset.shape;
        const ctx   = cv.getContext('2d');
        const w     = cv.width;
        const h     = cv.height;

        ctx.clearRect(0, 0, w, h);
        ctx.font      = 'bold 13px Arial Black, Arial, sans-serif';
        ctx.fillStyle = '#111';
        ctx.textAlign = 'center';

        const label = SHAPES.find(s => s.id === shape)?.preview || shape.toUpperCase();

        if (shape === 'normal') {
          ctx.textBaseline = 'middle';
          ctx.fillText(label, w / 2, h / 2);
          return;
        }

        // Dessiner lettre par lettre sur une courbe
        this._drawWarpedText(ctx, label, shape, w, h);
      });
    },

    _drawWarpedText(ctx, text, shape, w, h) {
      const letters  = text.split('');
      const n        = letters.length;
      const fontSize = 12;
      ctx.font       = `bold ${fontSize}px Arial Black, Arial, sans-serif`;
      ctx.fillStyle  = '#111';

      const letterW  = (w * 0.85) / n;
      const startX   = w * 0.075 + letterW / 2;

      letters.forEach((ch, i) => {
        const t  = n === 1 ? 0.5 : i / (n - 1);   // 0 → 1
        const nx = t * 2 - 1;                        // -1 → 1

        let offsetY = 0;
        let angle   = 0;

        switch (shape) {
          case 'curve':
            offsetY = -8 * (1 - nx * nx);
            angle   = Math.atan2(-8 * 2 * nx / w * 2, 1) * 0.5;
            break;
          case 'arch':
            offsetY = -12 * (1 - nx * nx);
            angle   = Math.atan2(-12 * (-2 * nx) / w * 2, 1) * 0.5;
            break;
          case 'bridge':
            offsetY = 10 * (1 - nx * nx);
            break;
          case 'valley':
            offsetY = -10 * (1 - nx * nx);
            angle   = Math.atan2(-10 * (-2 * nx) / w * 2, 1) * 0.5;
            break;
          case 'pinch': {
            const scale = 0.5 + 0.5 * Math.abs(nx);
            ctx.save();
            ctx.translate(startX + i * letterW, h / 2 + offsetY);
            ctx.scale(1, scale);
            ctx.fillText(ch, 0, 0);
            ctx.restore();
            return;
          }
          case 'bulge': {
            const bulge = 1 + 0.5 * (1 - nx * nx);
            ctx.save();
            ctx.translate(startX + i * letterW, h / 2);
            ctx.scale(1, bulge);
            ctx.fillText(ch, 0, 0);
            ctx.restore();
            return;
          }
          case 'perspective': {
            const scale = 0.5 + 0.5 * t;
            ctx.save();
            ctx.translate(startX + i * letterW, h / 2);
            ctx.scale(scale, scale);
            ctx.fillText(ch, 0, 0);
            ctx.restore();
            return;
          }
          case 'pointed':
            offsetY = -10 * (1 - nx * nx);
            break;
          case 'downward':
            offsetY = 12 * (1 - nx * nx);
            angle   = Math.atan2(12 * (-2 * nx) / w * 2, 1) * 0.4;
            break;
          case 'upward':
            offsetY = -12 * (1 - nx * nx);
            angle   = Math.atan2(-12 * (-2 * nx) / w * 2, 1) * 0.4;
            break;
          case 'cone': {
            const scale = 0.4 + 0.6 * t;
            ctx.save();
            ctx.translate(startX + i * letterW, h / 2);
            ctx.scale(scale, scale);
            ctx.fillText(ch, 0, 0);
            ctx.restore();
            return;
          }
        }

        ctx.save();
        ctx.translate(startX + i * letterW, h / 2 + offsetY);
        if (angle) ctx.rotate(angle);
        ctx.textBaseline = 'middle';
        ctx.fillText(ch, 0, 0);
        ctx.restore();
      });
    },

    _bindEvents() {
      // Délégation d'événement sur le panel (pour supporter le rechargement)
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('.warp-shape-btn');
        if (!btn) return;

        // Mise à jour de l'état actif des boutons
        document.querySelectorAll('.warp-shape-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const shapeId = btn.dataset.shape;
        const obj     = AppState.fabricCanvas?.getActiveObject();

        if (obj?.type === 'i-text') {
          WarpEngine.apply(obj, shapeId);
        } else if (obj?._linkedTextObj) {
          // L'utilisateur a cliqué sur une image warpée → appliquer sur le texte lié
          WarpEngine.apply(obj._linkedTextObj, shapeId);
        } else {
          console.warn('[TextShapeWarp] Aucun texte sélectionné pour appliquer la forme.');
        }
      });

      // Sync : quand on sélectionne un texte, afficher sa forme actuelle
      document.addEventListener('configurator:canvas-ready', () => {
        const canvas = AppState.fabricCanvas;
        if (!canvas) return;
        canvas.on('selection:created', (e) => this._syncActiveShape(e.selected?.[0]));
        canvas.on('selection:updated', (e) => this._syncActiveShape(e.selected?.[0]));
      });
    },

    _syncActiveShape(obj) {
      if (!obj) return;
      const shape = obj._warpShape || (obj._linkedTextObj && obj._linkedTextObj._warpShape) || 'normal';
      document.querySelectorAll('.warp-shape-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.shape === shape);
      });
    },

    _injectStyles() {
      const style = document.createElement('style');
      style.textContent = `
        /* ── Grille de formes de texte ── */
        .warp-shape-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          padding: 8px 0;
        }

        .warp-shape-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          background: #fff;
          cursor: pointer;
          padding: 4px;
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
          aspect-ratio: 1.8 / 1;
          overflow: hidden;
        }

        .warp-shape-btn:hover {
          border-color: #aaa;
          background: #f8f8f8;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        .warp-shape-btn.active {
          border-color: #e05a2b;
          background: #fff8f5;
          box-shadow: 0 0 0 2px rgba(224,90,43,0.25);
        }

        .warp-preview-canvas {
          width: 100%;
          height: 100%;
          display: block;
          pointer-events: none;
        }
      `;
      document.head.appendChild(style);
    },
  };

  // ─── Initialisation ──────────────────────────────────────────────────────────

  waitForConfigurator(() => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => TextShapeUI.init());
    } else {
      TextShapeUI.init();
    }
  });

  // Exposition globale pour debug
  window.TextShapeWarp = { WarpEngine, TextShapeUI, SHAPES };

})();