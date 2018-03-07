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
 *  AddOther.js
 *  Document Editor
 *
 *  Created by Alexander Yuzhin on 10/17/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'documenteditor/mobile/app/view/add/AddOther',
    'jquery',
    'underscore',
    'backbone'
], function (core, view, $, _, Backbone) {
    'use strict';

    DE.Controllers.AddOther = Backbone.Controller.extend(_.extend((function() {
        var c_pageNumPosition = {
            PAGE_NUM_POSITION_TOP: 0x01,
            PAGE_NUM_POSITION_BOTTOM: 0x02,
            PAGE_NUM_POSITION_RIGHT: 0,
            PAGE_NUM_POSITION_LEFT: 1,
            PAGE_NUM_POSITION_CENTER: 2
        };

        return {
            models: [],
            collections: [],
            views: [
                'AddOther'
            ],

            initialize: function () {
                Common.NotificationCenter.on('addcontainer:show', _.bind(this.initEvents, this));

                this.addListeners({
                    'AddOther': {
                        'page:show' : this.onPageShow
                    }
                });
            },

            setApi: function (api) {
                var me = this;
                me.api = api;

                // me.api.asc_registerCallback('asc_onInitEditorFonts',    _.bind(onApiLoadFonts, me));

            },

            onLaunch: function () {
                this.createView('AddOther').render();
            },

            initEvents: function () {
                var me = this;
                $('#add-other-pagebreak').single('click',   _.bind(me.onPageBreak, me));
                $('#add-other-columnbreak').single('click', _.bind(me.onColumnBreak, me));
            },

            onPageShow: function (view, pageId) {
                var me = this;

                $('.page[data-page=addother-sectionbreak] li a').single('click',    _.buffered(me.onInsertSectionBreak, 100, me));
                $('.page[data-page=addother-pagenumber] li a').single('click',      _.buffered(me.onInsertPageNumber, 100, me));
                $('#add-link-insert').single('click',                               _.buffered(me.onInsertLink, 100, me));


                if (pageId == '#addother-link') {
                    if ($('#addother-link-view')) {
                        _.defer(function () {
                            var text = me.api.can_AddHyperlink();
                            $('#add-link-display input').val(_.isString(text) ? text : '');
                        });
                    }
                }
            },

            // Handlers

            onInsertLink: function (e) {
                var me      = this,
                    url     = $('#add-link-url input').val(),
                    display = $('#add-link-display input').val(),
                    tip     = $('#add-link-tip input').val(),
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

                me.api.add_Hyperlink(props);

                DE.getController('AddContainer').hideModal();
            },

            onPageBreak: function (e) {
                this.api && this.api.put_AddPageBreak();
                DE.getController('AddContainer').hideModal();
            },

            onColumnBreak: function () {
                this.api && this.api.put_AddColumnBreak();
                DE.getController('AddContainer').hideModal();
            },

            onInsertSectionBreak: function (e) {
                var $target = $(e.currentTarget);

                if ($target && this.api) {
                    var type = $target.data('type'),
                        value;

                    if ('next' == type) {
                        value = Asc.c_oAscSectionBreakType.NextPage;
                    } else if ('continuous' == type) {
                        value = Asc.c_oAscSectionBreakType.Continuous;
                    } else if ('even' == type) {
                        value = Asc.c_oAscSectionBreakType.EvenPage;
                    } else if ('odd' == type) {
                        value = Asc.c_oAscSectionBreakType.OddPage;
                    }

                    this.api.add_SectionBreak(value);
                }

                DE.getController('AddContainer').hideModal();
            },

            onInsertPageNumber: function (e) {
                var $target = $(e.currentTarget);

                if ($target && this.api) {
                    var value = -1,
                        type = $target.data('type');

                    if (2 == type.length) {
                        value = {};

                        if (type[0] == 'l') {
                            value.subtype = c_pageNumPosition.PAGE_NUM_POSITION_LEFT;
                        } else if (type[0] == 'c') {
                            value.subtype = c_pageNumPosition.PAGE_NUM_POSITION_CENTER;
                        } else if (type[0] == 'r') {
                            value.subtype = c_pageNumPosition.PAGE_NUM_POSITION_RIGHT;
                        }

                        if (type[1] == 't') {
                            value.type = c_pageNumPosition.PAGE_NUM_POSITION_TOP;
                        } else if (type[1] == 'b') {
                            value.type = c_pageNumPosition.PAGE_NUM_POSITION_BOTTOM;
                        }

                        this.api.put_PageNum(value.type, value.subtype);
                    } else {
                        this.api.put_PageNum(value);
                    }
                }

                DE.getController('AddContainer').hideModal();
            },

            txtNotUrl: 'This field should be a URL in the format \"http://www.example.com\"'

        }
    })(), DE.Controllers.AddOther || {}))
});