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
 * Date: 23.08.2021
 */

define([
    'core',
    /*'documenteditor/main/app/collection/Thumbnails',*/
    'documenteditor/main/app/view/PageThumbnails'
], function () {
    'use strict';

    DE.Controllers.PageThumbnails = Backbone.Controller.extend(_.extend({
        models: [],
        /*collections: [
            'Thumbnails'
        ],*/
        views: [
            'PageThumbnails'
        ],

        initialize: function() {
            this._sendUndoPoint = true;
            this.firstShow = true;
            this.addListeners({
                'PageThumbnails': {
                    'show': _.bind(function () {
                        this.api.asc_viewerThumbnailsResize();
                        if (this.firstShow) {
                            this.api.asc_setViewerThumbnailsUsePageRect(Common.localStorage.getBool("de-thumbnails-highlight", true));
                            this.firstShow = false;
                        }
                    }, this)
                }
            });
        },

        events: function() {
        },

        onLaunch: function() {
            this.panelThumbnails = this.createView('PageThumbnails');
            this.panelThumbnails.on('render:after', _.bind(this.onAfterRender, this));
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onViewerThumbnailsZoomUpdate', _.bind(this.updateSize, this));
            return this;
        },

        setMode: function(mode) {
            this.mode = mode;
            return this;
        },

        onAfterRender: function(panelThumbnails) {
            panelThumbnails.sldrThumbnailsSize.on('change', _.bind(this.onChangeSize, this));

            panelThumbnails.buttonSettings.menu.on('item:click', _.bind(this.onHighlightVisiblePart, this));
            panelThumbnails.buttonSettings.menu.on('show:before', _.bind(function () {
                this.panelThumbnails.sldrThumbnailsSize.setValue(this.thumbnailsSize);
            }, this));


            var viewport = DE.getController('Viewport').getView('Viewport');
            viewport.hlayout.on('layout:resizedrag',  _.bind(function () {
                if (!this.firstShow) {
                    this.api.asc_viewerThumbnailsResize();
                }
            }, this));
        },

        onHighlightVisiblePart: function(menu, item, e) {
            if (item.value === 'highlight') {
                var checked = item.isChecked();
                this.api.asc_setViewerThumbnailsUsePageRect(checked);
                Common.localStorage.setBool("de-thumbnails-highlight", checked);
            }
        },

        updateSize: function (size) {
            this.thumbnailsSize = Math.min(size * 100, 100);
        },

        onChangeSize: function(field, newValue) {
            if (newValue!==undefined) {
                this.thumbnailsSize = newValue;
                this.api.asc_setViewerThumbnailsZoom(newValue / 100);
            }
        },

    }, DE.Controllers.PageThumbnails || {}));
});