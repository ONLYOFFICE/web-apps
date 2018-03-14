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
 *  EditLink.js
 *  Document Editor
 *
 *  Created by Alexander Yuzhin on 11/7/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */


define([
    'core',
    'documenteditor/mobile/app/view/edit/EditHyperlink'
], function (core) {
    'use strict';

    DE.Controllers.EditHyperlink = Backbone.Controller.extend(_.extend((function() {
        // Private
        var _stack = [],
            _linkObject = undefined;

        return {
            models: [],
            collections: [],
            views: [
                'EditHyperlink'
            ],

            initialize: function () {
                Common.NotificationCenter.on('editcontainer:show', _.bind(this.initEvents, this));

            },

            setApi: function (api) {
                var me = this;
                me.api = api;

                me.api.asc_registerCallback('asc_onFocusObject', _.bind(me.onApiFocusObject, me));
            },

            onLaunch: function () {
                this.createView('EditHyperlink').render();
            },

            initEvents: function () {
                var me = this;

                $('#edit-link-edit').single('click',    _.bind(me.onEditLink, me));
                $('#edit-link-remove').single('click',  _.bind(me.onRemoveLink, me));

                me.initSettings();
            },

            initSettings: function () {
                if (_linkObject) {
                    if (_linkObject.get_Value()) {
                        $('#edit-link-url input').val([_linkObject.get_Value().replace(new RegExp(" ", 'g'), "%20")]);
                    } else {
                        $('#edit-link-url input').val('');
                    }

                    if (!_.isNull(_linkObject.get_Text())) {
                        $('#edit-link-display input').val([_linkObject.get_Text()]);
                    }

                    $('#edit-link-tip input').val([_linkObject.get_ToolTip()]);

                    $('#edit-link-edit').toggleClass('disabled', _.isEmpty($('#edit-link-url input').val()));
                }
            },


            // Handlers

            onEditLink: function () {
                var me      = this,
                    url     = $('#edit-link-url input').val(),
                    display = $('#edit-link-display input').val(),
                    tip     = $('#edit-link-tip input').val(),
                    urltype = me.api.asc_getUrlType($.trim(url)),
                    isEmail = (urltype == 2);

                if (urltype < 1) {
                    uiApp.alert(me.txtNotUrl);
                    return;
                }

                url = url.replace(/^\s+|\s+$/g,'');

                if (! /(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(url) )
                    url = (isEmail ? 'mailto:' : 'http://' ) + url;

                url = url.replace(new RegExp("%20",'g')," ");

                var props = new Asc.CHyperlinkProperty();
                props.put_Value(url);
                props.put_Text(_.isEmpty(display) ? url : display);
                props.put_ToolTip(tip);
                if (_linkObject)
                    props.put_InternalHyperlink(_linkObject.get_InternalHyperlink());

                me.api.change_Hyperlink(props);

                DE.getController('EditContainer').hideModal();
            },

            onRemoveLink: function () {
                this.api && this.api.remove_Hyperlink(_linkObject);
                DE.getController('EditContainer').hideModal();
            },

            // API handlers

            onApiFocusObject: function (objects) {
                _stack = objects;

                var links = [];

                _.each(_stack, function (object) {
                    if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Hyperlink) {
                        links.push(object);
                    }
                });

                if (links.length > 0) {
                    var object = links[links.length - 1]; // get top
                    _linkObject = object.get_ObjectValue();
                } else {
                    _linkObject = undefined;
                }
            },

            // Helpers

            _closeIfNeed: function () {
                if (!this._isImageInStack()) {
                    DE.getController('EditContainer').hideModal();
                }
            },

            textEmptyImgUrl: 'You need to specify image URL.',
            txtNotUrl: 'This field should be a URL in the format \"http://www.example.com\"'
        };
    })(), DE.Controllers.EditHyperlink || {}))
});