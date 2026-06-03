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
 *  Fonts.js
 *
 *  Created on 2/11/14
 *
 */

if (Common === undefined)
    var Common = {};

Common.Controllers = Common.Controllers || {};

define([
    'core',
    'common/main/lib/collection/Fonts'
], function () { 'use strict';
    Common.Controllers.Fonts = Backbone.Controller.extend((function() {
        var FONT_TYPE_RECENT = 4;
        var cachedStore;

        function isFontSaved(store, rec) {
            var out = rec.get('type') == FONT_TYPE_RECENT,
                i = -1,
                c = store.length,
                su,
                n = rec.get('name');
            while (!out && ++i < c) {
                su = store.at(i);

                if (su.get('type') != FONT_TYPE_RECENT)
                    break;

                out = su.get('name') == n;
            }

            return out;
        }

        function onSelectFont(combo, record) {
            if (combo.showlastused && !isFontSaved(combo.store, record)) {
//                var node = combo.picker.getNode(records[0]);
//
//                var data = records[0].data;
//                var font = {
//                    id: data.id,
//                    name: data.name,
//                    imgidx: data.imgidx,
//                    cloneid: node.querySelector('img').id,
//                    type: FONT_TYPE_RECENT
//                };
//                combo.getStore().insert(0,[font]);
//
//                var separator = combo.picker.getEl().down('.used-fonts-separator');
//                if (!separator) {
//                    separator = document.createElement('div');
//                    separator.setAttribute('class', 'x-menu-item-separator used-fonts-separator');
//                    separator.setAttribute('style', 'padding:0 10px;margin-left: 10px;');
//
//                    node = combo.picker.getNode(combo.getStore().getAt(1));
//                    node.parentNode.insertBefore(separator,node);
//                }
//
//                font = combo.getStore().getAt(5);
//                if (font.data.type==FONT_TYPE_RECENT) {
//                    combo.getStore().remove(font);
//                } else {
//                    var plugin = combo.getPlugin('scrollpane');
//                    if (plugin){plugin.updateScrollPane();}
//                }
            }
        }

        function onApiFontChange(fontobj) {
            Common.NotificationCenter.trigger('fonts:change', fontobj)
        }

        function onApiLoadFonts(fonts, select) {
            var fontsArray = [];
            _.each(fonts, function(font){
                var fontId = font.asc_getFontId();
                fontsArray.push({
                    id          :_.isEmpty(fontId) ? Common.UI.getId() : fontId,
                    name        : font.asc_getFontName(),
//                    displayValue: font.asc_getFontName(),
                    imgidx      : font.asc_getFontThumbnail(),
                    type        : font.asc_getFontType()
                });
            });

            cachedStore = this.getCollection('Common.Collections.Fonts');
            cachedStore && cachedStore.add(fontsArray);

            if ( Common.NotificationCenter._events['fonts:load'] ) {
                Common.NotificationCenter.trigger('fonts:load', cachedStore, select);
                cachedStore = null;
            }
        }

        return {
            models: [
                'Common.Models.Fonts'
            ],
            collections: [
                'Common.Collections.Fonts'
            ],
            views: [],

            store: function () {
                return cachedStore;
            },

            initialize: function() {
                Common.NotificationCenter.on('fonts:select', _.bind(onSelectFont, this))
            },

            onLaunch: function() {
                //
            },

            setApi: function(api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onInitEditorFonts',  _.bind(onApiLoadFonts, this));
                this.api.asc_registerCallback('asc_onFontFamily',       _.bind(onApiFontChange, this));
            }
        }
    })());
});
