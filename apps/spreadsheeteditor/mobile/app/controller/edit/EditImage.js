/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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
 *  EditImage.js
 *  Document Editor
 *
 *  Created by Alexander Yuzhin on 11/3/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'spreadsheeteditor/mobile/app/view/edit/EditImage',
    'jquery',
    'underscore',
    'backbone'
], function (core, view, $, _, Backbone) {
    'use strict';

    SSE.Controllers.EditImage = Backbone.Controller.extend(_.extend((function() {
        // Private
        var _stack = [],
            _imageObject = undefined,
            _isEdit = false;

        return {
            models: [],
            collections: [],
            views: [
                'EditImage'
            ],

            initialize: function () {
                Common.NotificationCenter.on('editcontainer:show', _.bind(this.initEvents, this));

                this.addListeners({
                    'EditImage': {
                        'page:show': this.onPageShow
                    }
                });
            },

            setApi: function (api) {
                var me = this;
                me.api = api;

                me.api.asc_registerCallback('asc_onSelectionChanged',   _.bind(me.onApiSelectionChanged, me));
                me.api.asc_registerCallback('asc_onFocusObject',        _.bind(me.onApiFocusObject, me));
            },

            setMode: function (mode) {
                _isEdit = mode.isEdit;
            },

            onPageShow: function (view, pageId) {
                var me = this;

                me.initSettings(pageId);
            },

            onLaunch: function () {
                this.createView('EditImage').render();
            },

            initEvents: function () {
                var me = this;

                me.initSettings();
            },

            initSettings: function (pageId) {
                if ($('#edit-image').length < 1) {
                    return;
                }

                var me = this;

                if ('#edit-image-replace-view' == pageId) {
                    me.initReplacePage();
                } else if ('#edit-image-reorder-view' == pageId) {
                    me.initReorderPage();
                } else if ('#edit-image-url-view' == pageId) {
                    me.initLinkPage();
                } else {
                    me.initRootPage();
                }
            },

            initRootPage: function () {
                $('#image-default').single('click', _.bind(this.onDefaultSize, this));
                $('#image-remove').single('click',  _.bind(this.onRemoveImage, this));
            },

            initReplacePage: function () {
                $('#edit-image-file').single('click', _.bind(this.onReplaceByFile, this));
            },

            initReorderPage: function () {
                $('.page[data-page=edit-image-reorder-view] a.item-link').single('click', _.bind(this.onReorder, this));
            },

            initLinkPage: function () {
                $('.edit-image-url-link .button, .edit-image-url-link .list-button').single('click', _.bind(this.onReplaceByUrl, this));

                $('.edit-image-url-link input[type=url]').single('input', _.bind(function(e) {
                    $('.edit-image-url-link .buttons').toggleClass('disabled', _.isEmpty($(e.currentTarget).val()));
                }, this));

                _.delay(function () {
                    $('.edit-image-url-link input[type=url]').focus();
                }, 1000);
            },

            // Public

            getImage: function () {
                return _imageObject;
            },

            // Handlers

            onDefaultSize: function () {
                var me = this;

                if (me.api) {
                    var imgSize = me.api.asc_getOriginalImageSize(),
                        properties = new Asc.asc_CImgProperty();

                    properties.put_Width(imgSize.get_ImageWidth());
                    properties.put_Height(imgSize.get_ImageHeight());

                    me.api.asc_setGraphicObjectProps(properties);
                }
            },

            onRemoveImage: function () {
                this.api.asc_Remove();
                SSE.getController('EditContainer').hideModal();
            },

            onReplaceByFile: function () {
                this.api.asc_changeImageFromFile();
                SSE.getController('EditContainer').hideModal();
            },

            onReplaceByUrl: function () {
                var me = this,
                    $input = $('.edit-image-url-link input[type=url]');

                if ($input) {
                    var value = ($input.val()).replace(/ /g, '');

                    if (!_.isEmpty(value)) {
                        if ((/((^https?)|(^ftp)):\/\/.+/i.test(value))) {
                            SSE.getController('EditContainer').hideModal();
                            _.defer(function () {
                                var image = new Asc.asc_CImgProperty();
                                image.asc_putImageUrl(value);
                                me.api.asc_setGraphicObjectProps(image);
                            });
                        } else {
                            uiApp.alert(me.txtNotUrl);
                        }
                    } else {
                        uiApp.alert(me.textEmptyImgUrl);
                    }
                }
            },

            onReorder: function (e) {
                var $target = $(e.currentTarget),
                    type = $target.data('type'),
                    ascType;

                if (type == 'all-up') {
                    ascType = Asc.c_oAscDrawingLayerType.BringToFront;
                } else if (type == 'all-down') {
                    ascType = Asc.c_oAscDrawingLayerType.SendToBack;
                } else if (type == 'move-up') {
                    ascType = Asc.c_oAscDrawingLayerType.BringForward;
                } else {
                    ascType = Asc.c_oAscDrawingLayerType.SendBackward;
                }

                this.api.asc_setSelectedDrawingObjectLayer(ascType);
            },

            // API handlers

            onApiSelectionChanged: function(info) {
                if (!_isEdit) {
                    return;
                }

                var me = this,
                    selectedObjects = [],
                    selectType = info.asc_getFlags().asc_getSelectionType();

                if (selectType == Asc.c_oAscSelectionType.RangeImage) {
                    selectedObjects = me.api.asc_getGraphicObjectProps();
                }

                me.onApiFocusObject(selectedObjects);
            },

            onApiFocusObject: function (objects) {
                _stack = objects;

                if (!_isEdit) {
                    return;
                }

                var images = [];

                _.each(_stack, function (object) {
                    if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Image) {
                        images.push(object.get_ObjectValue());
                    }
                });

                var getTopObject = function(array) {
                    if (array.length > 0) {
                        return array[array.length - 1]; // get top
                    } else {
                        return undefined;
                    }
                };

                _imageObject = getTopObject(images);
            },

            textEmptyImgUrl: 'You need to specify image URL.',
            txtNotUrl: 'This field should be a URL in the format \"http://www.example.com\"'
        }
    })(), SSE.Controllers.EditImage || {}))
});