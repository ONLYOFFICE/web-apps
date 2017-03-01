/*
 *
 * (c) Copyright Ascensio System Limited 2010-2017
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
 *  Header.js
 *
 *  Created by Alexander Yuzhin on 2/14/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};

define([
    'backbone',
    'text!common/main/lib/template/Header.template',
    'core',
    'common/main/lib/view/RenameDialog'
], function (Backbone, headerTemplate) { 'use strict';

    Common.Views.Header =  Backbone.View.extend(_.extend(function(){
        var templateR = '<section>' +
                            '<label id="doc-name"></label>' +
                            '<div class="elset">' +
                                '<span class="btn-slot split" id="slot-btn-back"></span>' +
                                '<span class="btn-slot" id="slot-btn-users"></span>' +
                            '</div>' +
                        '</section>';

        var templateL = '<section>' +
                            '<div id="header-logo"></div>'
                        '</section>';
        return {
            options: {
                branding: {},
                headerCaption: 'Default Caption',
                // headerDeveloper: 'DEVELOPER MODE',
                documentCaption: '',
                canBack: false
            },

            el: '#header',

            // Compile our stats template
            template: _.template(headerTemplate),

            // Delegated events for creating new items, and clearing completed ones.
            events: {
                // 'click #header-logo': function (e) {}
            },

            initialize: function (options) {
                var me = this;
                this.options = this.options ? _({}).extend(this.options, options) : options;

                this.headerCaption = this.options.headerCaption;
                // this.headerDeveloper = this.txtHeaderDeveloper;
                this.documentCaption = this.options.documentCaption;
                this.canBack = this.options.canBack;
                this.branding = this.options.customization;

                me.btnGoBack = new Common.UI.Button({
                    id: 'btn-goback',
                    cls: 'btn-toolbar',
                    iconCls: 'img-commonctrl review-prev',
                    split: true,
                    menu: new Common.UI.Menu({
                        style: 'min-width: 60px;',
                        items: [
                            {caption: me.openNewTabText}
                        ]
                    })
                });

                me.btnUsers = new Common.UI.Button({
                    cls: 'btn-toolbar',
                    iconCls: 'img-commonctrl review-next'
                });

                (new Promise(function (accept, reject) {
                    Common.NotificationCenter.on('app:ready', function() { accept(); });
                })).then(function(){
                    me.btnGoBack.updateHint(me.textBack);
                    me.btnUsers.updateHint('Users');

                    me.btnGoBack.on('click', function (e) {
                        me.fireEvent('go:back', ['page:current']);
                    });
                    me.btnGoBack.menu.on('item:click', function (e) {
                        me.fireEvent('go:back', ['page:new']);
                    })

                    me.logo.on('click', function (e) {
                        var _url = !!this.branding && !!this.branding.logo && !!this.branding.logo.url ?
                                        this.branding.logo.url : 'http://www.onlyoffice.com';

                        var newDocumentPage = window.open(_url);
                        newDocumentPage && newDocumentPage.focus();
                    })
                });
            },

            render: function (el, role) {
                $(el).html(this.getPanel(role));

                return this;
            },

            getPanel: function (role) {
                if ( role == 'left' ) {
                    $html = $(templateL);
                    this.logo = $html.find('#header-logo');
                    return $html;
                } else
                if ( role == 'right' ) {
                    var $html = $(templateR);

                    if ( this.canBack === true ) {
                        this.btnGoBack.render($html.find('#slot-btn-back'));
                        this.btnUsers.render($html.find('#slot-btn-users'));
                    }

                    if ( this.documentCaption ) {
                        $html.find('#doc-name').html(
                            Common.Utils.String.htmlEncode(this.documentCaption) );
                    }

                    this.labelDocName = $html.find('#doc-name');

                    return $html;
                }
            },

            setVisible: function (visible) {
                // visible
                //     ? this.show()
                //     : this.hide();
            },

            setBranding: function (value) {
                var element;

                this.branding = value;

                if (value && value.logo && value.logo.image) {
                    element = $('#header-logo');
                    if ( element ) {
                        element.html('<img src="' + value.logo.image + '" style="max-width:86px; max-height:42px; margin: 0 8px 0 15px;"/>');
                        element.css({'background-image': 'none', width: 'auto'});
                    }
                }
            },

            setHeaderCaption: function (value) {
                this.headerCaption = value;

                return value;
            },

            getHeaderCaption: function () {
                return this.headerCaption;
            },

            setDocumentCaption: function (value, applyOnly) {
                !value && (value = '');

                this.documentCaption = value;
                if ( this.labelDocName )
                    this.labelDocName.html(Common.Utils.String.htmlEncode(value));

                return value;
            },

            getDocumentCaption: function () {
                return this.documentCaption;
            },

            setDocumentChanged: function (changed) {
                var _name = Common.Utils.String.htmlEncode(this.documentCaption);
                changed && (_name += '*');

                this.labelDocName.html(_name);
            },

            setCanBack: function (value) {
                this.canBack = value;

                this.btnGoBack[value ? 'show' : 'hide']();
            },

            getCanBack: function () {
                return this.canBack;
            },

            setDeveloperMode: function (mode) {
                // $('#header-developer').toggleClass('hidden', !mode);
            },

            setCanRename: function (rename) {
                // var dc = $('#header-documentcaption div');
                // if (rename) {
                //     var me = this;
                //     dc.tooltip({title: me.txtRename, placement: 'cursor'});
                //     dc.on('click', function (e) {
                //         (new Common.Views.RenameDialog({
                //             filename: me.documentCaption,
                //             handler: function (result, value) {
                //                 if (result == 'ok' && !_.isEmpty(value.trim()) && me.documentCaption !== value.trim()) {
                //                     Common.Gateway.requestRename(value);
                //                 }
                //                 Common.NotificationCenter.trigger('edit:complete', me);
                //             }
                //         })).show(dc.position().left - 1, 20);
                //     });
                // } else {
                //     var tip = dc.data('bs.tooltip');
                //     if (tip) {
                //         tip.options.title = '';
                //         tip.setContent();
                //     }
                //     dc.off('click');
                // }
                // dc.css('cursor', rename ? 'pointer' : 'default');
                // dc.toggleClass('renamed', rename);
            },

            textBack: 'Go to Documents',
            openNewTabText: 'Open in New Tab',
            // txtHeaderDeveloper: 'DEVELOPER MODE',
            txtRename: 'Rename'
        }
    }(), Common.Views.Header || {}))
});
