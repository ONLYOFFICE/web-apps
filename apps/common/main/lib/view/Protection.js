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
 *  Protection.js
 *
 *  Created by Julia Radzhabova on 14.11.2017
 *  Copyright (c) 2017 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/BaseView',
    'common/main/lib/component/Layout',
    'common/main/lib/component/Window'
], function (template) {
    'use strict';

    Common.Views.Protection = Common.UI.BaseView.extend(_.extend((function(){
        var template =
            '<section id="protection-panel" class="panel" data-tab="protect">' +
            '<div class="group">' +
                '<span id="slot-btn-add-password" class="btn-slot text x-huge"></span>' +
                '<span id="slot-btn-change-password" class="btn-slot text x-huge"></span>' +
                '<span id="slot-btn-signature" class="btn-slot text x-huge"></span>' +
            '</div>' +
            '</section>';

        function setEvents() {
            var me = this;

            if ( me.appConfig.isDesktopApp && me.appConfig.isOffline ) {
                this.btnAddPwd.on('click', function (e) {
                    me.fireEvent('protect:password', [me.btnAddPwd, 'add']);
                });

                this.btnPwd.menu.on('item:click', function (menu, item, e) {
                    me.fireEvent('protect:password', [menu, item.value]);
                });

                if (me.appConfig.canProtect) {
                    this.btnSignature.menu.on('item:click', function (menu, item, e) {
                        me.fireEvent('protect:signature', [menu, item.value]);
                    });

                    this.btnsInvisibleSignature.forEach(function(button) {
                        button.on('click', function (b, e) {
                            me.fireEvent('protect:signature', [b, 'invisible']);
                        });
                    });
                }
            }
        }

        return {

            options: {},

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                this.appConfig = options.mode;

                if ( this.appConfig.isDesktopApp && this.appConfig.isOffline ) {
                    this.btnAddPwd = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'review-prev',
                        caption: this.txtEncrypt
                    });

                    this.btnPwd = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'btn-ic-reviewview',
                        caption: this.txtEncrypt,
                        menu: true
                    });

                    if (this.appConfig.canProtect)
                        this.btnSignature = new Common.UI.Button({
                            cls: 'btn-toolbar x-huge icon-top',
                            iconCls: 'btn-ic-reviewview',
                            caption: this.txtSignature,
                            menu: true
                        });
                }

                this.btnsInvisibleSignature = [];

                var filter = Common.localStorage.getKeysFilter();
                this.appPrefix = (filter && filter.length) ? filter.split(',')[0] : '';

                Common.NotificationCenter.on('app:ready', this.onAppReady.bind(this));
            },

            render: function (el) {
                this.boxSdk = $('#editor_sdk');
                if ( el ) el.html( this.getPanel() );

                return this;
            },

            onAppReady: function (config) {
                var me = this;
                (new Promise(function (accept, reject) {
                    accept();
                })).then(function(){
                    if ( config.isDesktopApp && config.isOffline) {
                        me.btnAddPwd.updateHint(me.hintAddPwd);
                        me.btnPwd.updateHint(me.hintPwd);

                        me.btnPwd.setMenu(
                            new Common.UI.Menu({
                                items: [
                                    {
                                        caption: me.txtChangePwd,
                                        value: 'add'
                                    },
                                    {
                                        caption: me.txtDeletePwd,
                                        value: 'delete'
                                    }
                                ]
                            })
                        );

                        if (me.btnSignature) {
                            me.btnSignature.updateHint(me.hintSignature);
                            me.btnSignature.setMenu(
                                new Common.UI.Menu({
                                    items: [
                                        {
                                            caption: me.txtInvisibleSignature,
                                            value: 'invisible'
                                        },
                                        {
                                            caption: me.txtSignatureLine,
                                            value: 'visible'
                                        }
                                    ]
                                })
                            );
                        }
                        Common.NotificationCenter.trigger('tab:visible', 'protect', true);
                    }

                    setEvents.call(me);
                });
            },

            getPanel: function () {
                this.$el = $(_.template(template)( {} ));

                if ( this.appConfig.isDesktopApp && this.appConfig.isOffline ) {
                    this.btnAddPwd.render(this.$el.find('#slot-btn-add-password'));
                    this.btnPwd.render(this.$el.find('#slot-btn-change-password'));
                    this.btnPwd.setVisible(false);
                    this.btnSignature && this.btnSignature.render(this.$el.find('#slot-btn-signature'));
                }
                return this.$el;
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getButton: function(type, parent) {
                if ( type == 'signature' ) {
                    var button = new Common.UI.Button({});
                    this.btnsInvisibleSignature.push(button);

                    return button;
                }
            },

            SetDisabled: function (state, langs) {
                this.btnsInvisibleSignature && this.btnsInvisibleSignature.forEach(function(button) {
                    if ( button ) {
                        button.setDisabled(state);
                    }
                }, this);
                this.btnSignature && this.btnSignature.setDisabled(state);
            },

            txtEncrypt: 'Encrypt',
            txtSignature: 'Signature',
            hintAddPwd: 'Encrypt with password',
            hintPwd: 'Change or delete password',
            hintSignature: 'Add digital signature or signature line',
            txtChangePwd: 'Change password',
            txtDeletePwd: 'Delete password',
            txtInvisibleSignature: 'Add digital signature',
            txtSignatureLine: 'Signature line'

        }
    }()), Common.Views.Protection || {}));
});