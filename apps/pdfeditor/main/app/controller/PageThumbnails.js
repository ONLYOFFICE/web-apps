/*
 * (c) Copyright Ascensio System SIA 2010-2024
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */
/**
 * Date: 23.08.2021
 */

define([
    'core',
    /*'pdfeditor/main/app/collection/Thumbnails',*/
    'pdfeditor/main/app/view/PageThumbnails'
], function () {
    'use strict';

    PDFE.Controllers.PageThumbnails = Backbone.Controller.extend(_.extend({
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


            var viewport = PDFE.getController('Viewport').getView('Viewport');
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

    }, PDFE.Controllers.PageThumbnails || {}));
});