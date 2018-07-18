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
 *  AddImage.js
 *  Presentation Editor
 *
 *  Created by Julia Radzhabova on 11/30/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */


define([
    'core',
    'presentationeditor/mobile/app/view/add/AddImage'
], function (core) {
    'use strict';

    PE.Controllers.AddImage = Backbone.Controller.extend(_.extend((function() {
        //

        return {
            models: [],
            collections: [],
            views: [
                'AddImage'
            ],

            initialize: function () {
                Common.NotificationCenter.on('addcontainer:show', _.bind(this.initEvents, this));

                this.addListeners({
                    'AddImage': {
                        'page:show' : this.onPageShow
                    }
                });
            },

            setApi: function (api) {
                this.api = api;
            },

            onLaunch: function () {
                this.createView('AddImage').render();
            },

            initEvents: function () {
                var me = this;
                $('#add-image-file').single('click', _.bind(me.onInsertByFile, me));
            },

            onPageShow: function () {
                var me = this;

                $('#addimage-insert a').single('click', _.buffered(me.onInsertByUrl, 100, me));
                $('#addimage-url input[type=url]').single('input', _.bind(me.onUrlChange, me));

                _.delay(function () {
                    $('#addimage-link-url input[type=url]').focus();
                }, 1000);
            },

            // Handlers

            onInsertByFile: function (e) {
                PE.getController('AddContainer').hideModal();

                if (this.api) {
                    this.api.asc_addImage();
                }
            },

            onUrlChange: function (e) {
                $('#addimage-insert').toggleClass('disabled', _.isEmpty($(e.currentTarget).val()));
            },

            onInsertByUrl: function (e) {
                var me = this,
                    $input = $('#addimage-link-url input[type=url]');

                if ($input) {
                    var value = ($input.val()).replace(/ /g, '');

                    if (!_.isEmpty(value)) {
                        if ((/((^https?)|(^ftp)):\/\/.+/i.test(value))) {
                            PE.getController('AddContainer').hideModal();
                            _.defer(function () {
                                me.api.AddImageUrl(value);
                            });
                        } else {
                            uiApp.alert(me.txtNotUrl);
                        }
                    } else {
                        uiApp.alert(me.textEmptyImgUrl);
                    }
                }
            },

            textEmptyImgUrl : 'You need to specify image URL.',
            txtNotUrl       : 'This field should be a URL in the format \"http://www.example.com\"'
        }
    })(), PE.Controllers.AddImage || {}))
});
