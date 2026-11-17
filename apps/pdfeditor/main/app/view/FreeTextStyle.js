/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/**
 * Last-used formatting for PDF text comments and text callouts.
 * Stored with the same browser settings as pen and highlighter opacity.
 * Text, geometry, and annotation identity are never stored.
 */

(function (root, factory) {
    var api = factory();
    if (typeof define === 'function' && define.amd) {
        define([], function () { return api; });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = api;
    } else {
        root.FreeTextStyle = api;
    }
})(typeof window !== 'undefined' ? window : this, function () {
    'use strict';

    var INTENT_COMMENT = 0;
    var INTENT_CALLOUT = 1;
    var KEY_COMMENT = 'pdfe-annot-freetext-style-comment';
    var KEY_CALLOUT = 'pdfe-annot-freetext-style-callout';
    // AscCommon align_Right/Left/Center/Justify are 0/1/2/3. PDF Q is left/center/right/justify.
    var INTERNAL_TO_PDF_ALIGN = {0: 2, 1: 0, 2: 1, 3: 3};

    function storageKey(intent) {
        return intent === INTENT_CALLOUT ? KEY_CALLOUT : KEY_COMMENT;
    }

    function isByte(value) {
        return typeof value === 'number' && value >= 0 && value <= 255 && value === Math.round(value);
    }

    function normalizeColor(value, allowNull) {
        if (value == null)
            return allowNull && value === null ? null : undefined;
        if (typeof value !== 'object' || Array.isArray(value))
            return undefined;
        if (!isByte(value.r) || !isByte(value.g) || !isByte(value.b))
            return undefined;
        return {r: value.r, g: value.g, b: value.b};
    }

    function normalize(raw) {
        if (!raw || typeof raw !== 'object' || Array.isArray(raw))
            return null;

        var style = {};
        if (Object.prototype.hasOwnProperty.call(raw, 'fill')) {
            var fill = normalizeColor(raw.fill, true);
            if (fill !== undefined)
                style.fill = fill;
        }
        if (Object.prototype.hasOwnProperty.call(raw, 'stroke')) {
            var stroke = normalizeColor(raw.stroke, true);
            if (stroke !== undefined)
                style.stroke = stroke;
        }
        var textColor = normalizeColor(raw.textColor, false);
        if (textColor)
            style.textColor = textColor;
        if (typeof raw.strokeWidth === 'number' && isFinite(raw.strokeWidth) && raw.strokeWidth >= 0 && raw.strokeWidth <= 20)
            style.strokeWidth = raw.strokeWidth;
        if (typeof raw.strokeStyle === 'number' && raw.strokeStyle >= 0 && raw.strokeStyle <= 8 && raw.strokeStyle === Math.round(raw.strokeStyle))
            style.strokeStyle = raw.strokeStyle;
        if (typeof raw.opacity === 'number' && isFinite(raw.opacity) && raw.opacity >= 0 && raw.opacity <= 100)
            style.opacity = raw.opacity;
        if (typeof raw.lineEnd === 'number' && raw.lineEnd >= 0 && raw.lineEnd <= 9 && raw.lineEnd === Math.round(raw.lineEnd))
            style.lineEnd = raw.lineEnd;
        if (typeof raw.align === 'number' && raw.align >= 0 && raw.align <= 3 && raw.align === Math.round(raw.align))
            style.align = raw.align;
        if (typeof raw.fontSize === 'number' && isFinite(raw.fontSize) && raw.fontSize >= 1 && raw.fontSize <= 300)
            style.fontSize = raw.fontSize;
        if (raw.bold === true || raw.bold === false)
            style.bold = raw.bold;
        if (raw.italic === true || raw.italic === false)
            style.italic = raw.italic;
        if (typeof raw.fontFamily === 'string') {
            var family = raw.fontFamily.replace(/[\u0000-\u001f]/g, '').trim();
            if (family.length > 0 && family.length <= 200)
                style.fontFamily = family;
        }
        return Object.keys(style).length ? style : null;
    }

    function parseStored(raw) {
        if (raw == null || raw === '')
            return null;
        if (typeof raw === 'string') {
            try {
                return normalize(JSON.parse(raw));
            } catch (e) {
                return null;
            }
        }
        if (typeof raw === 'object')
            return normalize(raw);
        return null;
    }

    function read(storage, intent, settings) {
        var key = storageKey(intent);
        if (storage && typeof storage.getItem === 'function') {
            try {
                var raw = storage.getItem(key);
                if (raw != null && raw !== '')
                    return parseStored(raw);
            } catch (e) {}
        }
        if (settings && typeof settings.get === 'function') {
            try {
                return parseStored(settings.get(key));
            } catch (e) {}
        }
        return null;
    }

    function write(storage, settings, intent, patch) {
        var incoming = normalize(patch);
        if (!incoming)
            return null;
        if (intent !== INTENT_CALLOUT)
            delete incoming.lineEnd;

        var current = read(storage, intent, settings) || {};
        var merged = {};
        Object.keys(current).forEach(function (key) { merged[key] = current[key]; });
        Object.keys(incoming).forEach(function (key) { merged[key] = incoming[key]; });
        var next = normalize(merged);
        if (!next)
            return null;

        var key = storageKey(intent);
        var json = JSON.stringify(next);
        if (storage && typeof storage.setItem === 'function') {
            try { storage.setItem(key, json); } catch (e) {}
        }
        if (settings && typeof settings.set === 'function') {
            try { settings.set(key, next); } catch (e) {}
        }
        return next;
    }

    function shouldRemember(ctx) {
        if (!ctx || ctx.editMode !== true)
            return false;
        if (ctx.initializing === true || ctx.fromSelection === true)
            return false;
        return ctx.annotType === 'freeText';
    }

    function editorCanFormat(api) {
        if (!api)
            return false;
        if (typeof api.canModifyPdfAnnots === 'function')
            return api.canModifyPdfAnnots() === true;
        if (typeof api.canEdit === 'function')
            return api.canEdit() === true;
        return false;
    }

    function intentForAnnot(annotType, lineEnd, freeTextType) {
        if (annotType !== freeTextType)
            return null;
        return lineEnd == null ? INTENT_COMMENT : INTENT_CALLOUT;
    }

    function pdfAlignFromInternal(internalAlign) {
        return Object.prototype.hasOwnProperty.call(INTERNAL_TO_PDF_ALIGN, internalAlign) ? INTERNAL_TO_PDF_ALIGN[internalAlign] : undefined;
    }

    return {
        INTENT_COMMENT: INTENT_COMMENT,
        INTENT_CALLOUT: INTENT_CALLOUT,
        KEY_COMMENT: KEY_COMMENT,
        KEY_CALLOUT: KEY_CALLOUT,
        storageKey: storageKey,
        normalize: normalize,
        read: read,
        write: write,
        shouldRemember: shouldRemember,
        editorCanFormat: editorCanFormat,
        intentForAnnot: intentForAnnot,
        pdfAlignFromInternal: pdfAlignFromInternal
    };
});
