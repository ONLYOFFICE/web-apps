/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
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
 * User: Julia.Svinareva
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
                    'show': _.bind(this.onAfterShow, this)
                }
            });
        },

        events: function() {
        },

        onLaunch: function() {
            this.panelThumbnails = this.createView('PageThumbnails', /*{
                storeThumbnails: this.getApplication().getCollection('Thumbnails')
            }*/);
            this.panelThumbnails.on('render:after', _.bind(this.onAfterRender, this));
        },

        setApi: function(api) {
            this.api = api;
            this.api.asc_registerCallback('asc_onViewerThumbnailsZoomUpdate', _.bind(this.updateSize, this));
            this.api.asc_registerCallback('asc_onViewerBookmarksUpdate', _.bind(this.updateBookmarks, this));
            return this;
        },

        setMode: function(mode) {
            this.mode = mode;
            return this;
        },

        onAfterRender: function(panelThumbnails) {
            panelThumbnails.sldrThumbnailsSize.on('change', _.bind(this.onChangeSize, this));
            //panelThumbnails.sldrThumbnailsSize.on('changecomplete', _.bind(this.onSizeChangeComplete, this));

            panelThumbnails.buttonSettings.menu.on('item:click', this.onHighlightVisiblePart.bind(this));
        },

        onAfterShow: function() {
            this.panelThumbnails.sldrThumbnailsSize.setValue(this.thumbnailsSize * 100);
            if (this.firstShow) {
                this.api.asc_setViewerThumbnailsZoom(this.thumbnailsSize);
                this.firstShow = false;
            }
        },

        updateSize: function (size) {
            this.thumbnailsSize = size;
        },

        onHighlightVisiblePart: function(menu, item, e) {
            if (item.value === 'highlight') {
                //console.log(item.isChecked());
            }
        },

        onChangeSize: function(field, newValue) {
            if (newValue!==undefined) {
                this.api.asc_setViewerThumbnailsZoom(newValue / 100);
            }
        },

        updateBookmarks: function (t) {
            var r = t;
            console.log(t);
        }

    }, DE.Controllers.PageThumbnails || {}));
});