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
 *  Presentation Editor
 *
 *  Created by Julia Radzhabova on 11/30/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'presentationeditor/mobile/app/view/edit/EditImage',
    'jquery',
    'underscore',
    'backbone'
], function (core, view, $, _, Backbone) {
    'use strict';

    PE.Controllers.EditImage = Backbone.Controller.extend(_.extend((function() {
        // Private
        var _stack = [],
            _imageObject = undefined,
            _metricText = Common.Utils.Metric.getCurrentMetricName();

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

                me.api.asc_registerCallback('asc_onFocusObject', _.bind(me.onApiFocusObject, me));
            },

            onLaunch: function () {
                this.createView('EditImage').render();
            },

            initEvents: function () {
                var me = this;

                $('#image-default').single('click', _.bind(me.onDefaulSize, me));
                $('#image-remove').single('click',  _.bind(me.onRemoveImage, me));

                me.initSettings();
            },

            onPageShow: function (view, pageId) {
                var me = this;

                $('#edit-image-file').single('click',                       _.bind(me.onReplaceByFile, me));
                $('.edit-image-url-link .button, .edit-image-url-link .list-button').single('click', _.bind(me.onReplaceByUrl, me));

                $('.image-reorder a').single('click',                       _.bind(me.onReorder, me));
                $('.image-align a').single('click',                         _.bind(me.onAlign, me));

                // me.initSettings(pageId);
            },

            initSettings: function (pageId) {
            },

            // Public

            getImage: function () {
                return _imageObject;
            },

            // Handlers

            onDefaulSize: function () {
                var me = this;

                if (me.api) {
                    var imgsize = me.api.get_OriginalSizeImage(),
                        properties = new Asc.asc_CImgProperty();

                    properties.put_Width(imgsize.get_ImageWidth());
                    properties.put_Height(imgsize.get_ImageHeight());

                    me.api.ImgApply(properties);
                }
            },

            onRemoveImage: function () {
                this.api.asc_Remove();
                PE.getController('EditContainer').hideModal();
            },

            onReplaceByFile: function () {
                this.api.ChangeImageFromFile();
                PE.getController('EditContainer').hideModal();
            },

            onReplaceByUrl: function () {
                var me = this,
                    $input = $('.edit-image-url-link input[type=url]');

                if ($input) {
                    var value = ($input.val()).replace(/ /g, '');

                    if (!_.isEmpty(value)) {
                        if ((/((^https?)|(^ftp)):\/\/.+/i.test(value))) {
                            PE.getController('EditContainer').hideModal();
                            _.defer(function () {
                                var image = new Asc.asc_CImgProperty();
                                image.put_ImageUrl(value);
                                me.api.ImgApply(image);
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
                    type = $target.data('type');

                if ('all-up' == type) {
                    this.api.shapes_bringToFront();
                } else if ('all-down' == type) {
                    this.api.shapes_bringToBack();
                } else if ('move-up' == type) {
                    this.api.shapes_bringForward();
                } else if ('move-down' == type) {
                    this.api.shapes_bringBackward();
                }
            },

            onAlign: function (e) {
                var $target = $(e.currentTarget),
                    type = $target.data('type');

                if ('align-left' == type) {
                    this.api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_LEFT);
                } else if ('align-center' == type) {
                    this.api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_CENTER);
                } else if ('align-right' == type) {
                    this.api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_RIGHT);
                } else if ('align-top' == type) {
                    this.api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_TOP);
                } else if ('align-middle' == type) {
                    this.api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_MIDDLE);
                }else if ('align-bottom' == type) {
                    this.api.put_ShapesAlign(Asc.c_oAscAlignShapeType.ALIGN_BOTTOM);
                }else if ('distrib-hor' == type) {
                    this.api.DistributeHorizontally();
                }else if ('distrib-vert' == type) {
                    this.api.DistributeVertically();
                }
            },

            // API handlers

            onApiFocusObject: function (objects) {
                _stack = objects;

                var images = [];

                _.each(_stack, function (object) {
                    if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Image && object.get_ObjectValue()) {
                        images.push(object);
                    }
                });

                if (images.length > 0) {
                    var object = images[images.length - 1]; // get top
                    _imageObject = object.get_ObjectValue();
                } else {
                    _imageObject = undefined;
                }
            },

            // Helpers

            _closeIfNeed: function () {
                if (!this._isImageInStack()) {
                    PE.getController('EditContainer').hideModal();
                }
            },

            _isImageInStack: function () {
                var imageExist = false;

                _.some(_stack, function(object) {
                    if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Image && object.get_ObjectValue()) {
                        imageExist = true;
                        return true;
                    }
                });

                return imageExist;
            },

            textEmptyImgUrl: 'You need to specify image URL.',
            txtNotUrl: 'This field should be a URL in the format \"http://www.example.com\"'
        }
    })(), PE.Controllers.EditImage || {}))
});