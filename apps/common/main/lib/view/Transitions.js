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
 *  Transitions.js
 *
 *  View
 *
 *  Created by Olga.Sharova on 15.07.21
 *  Copyright (c) 2021 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};

define([
    'common/main/lib/util/utils',
    'common/main/lib/component/Button',
    'common/main/lib/component/DataView',
    'common/main/lib/component/Layout',
    'common/main/lib/component/Window'
], function () {
    'use strict';

    Common.Views.Transitions = Common.UI.BaseView.extend(_.extend((function(){
        var template =
            '<section id="transitions-panel" class="panel" data-tab="transit">' +
                //'<div class="separator long sharing"></div>' +
                '<div class="group">' +
                    '<span class="btn-slot text x-huge slot-comment"></span>' +
                    '<span class="btn-slot text x-huge" id="slot-comment-remove"></span>' +
                    '<span class="btn-slot text x-huge" id="slot-comment-resolve"></span>' +
                '</div>' +
                '<div class="separator long comments"></div>' +


            '</section>';

        function setEvents() {
            var me = this;
            if (this.btnCommentRemove) {
                this.btnCommentRemove.on('click', function (e) {
                    me.fireEvent('comment:removeComments', ['current']);
                });

                this.btnCommentRemove.menu.on('item:click', function (menu, item, e) {
                    me.fireEvent('comment:removeComments', [item.value]);
                });
            }
            if (this.btnCommentResolve) {
                this.btnCommentResolve.on('click', function (e) {
                    me.fireEvent('comment:resolveComments', ['current']);
                });

                this.btnCommentResolve.menu.on('item:click', function (menu, item, e) {
                    me.fireEvent('comment:resolveComments', [item.value]);
                });
            }
        }

        return {
            // el: '#review-changes-panel',

            options: {},

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                this.appConfig = options.mode;
                var filter = Common.localStorage.getKeysFilter();
                this.appPrefix = (filter && filter.length) ? filter.split(',')[0] : '';

               this.btnCommentRemove = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    caption: this.txtCommentRemove,
                    split: true,
                    iconCls: 'toolbar__icon btn-rem-comment'
                });
                this.btnCommentResolve = new Common.UI.Button({
                    cls: 'btn-toolbar x-huge icon-top',
                    caption: this.txtCommentResolve,
                    split: true,
                    iconCls: 'toolbar__icon btn-resolve-all'
                });


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

                    if (me.btnCommentRemove) {
                        var items = [
                            {
                                caption: config.canDeleteComments ? me.txtCommentRemCurrent : me.txtCommentRemMyCurrent,
                                value: 'current'
                            },
                            {
                                caption: me.txtCommentRemMy,
                                value: 'my'
                            }
                        ];
                        if (config.canDeleteComments)
                            items.push({
                                caption: me.txtCommentRemAll,
                                value: 'all'
                            });
                        me.btnCommentRemove.setMenu(
                            new Common.UI.Menu({items: items})
                        );
                        me.btnCommentRemove.updateHint([me.tipCommentRemCurrent, me.tipCommentRem]);
                    }

                     if (me.btnCommentResolve) {
                        var items = [
                            {
                                caption: config.canEditComments ? me.txtCommentResolveCurrent : me.txtCommentResolveMyCurrent,
                                value: 'current'
                            },
                            {
                                caption: me.txtCommentResolveMy,
                                value: 'my'
                            }
                        ];
                        if (config.canEditComments)
                            items.push({
                                caption: me.txtCommentResolveAll,
                                value: 'all'
                            });
                        me.btnCommentResolve.setMenu(
                            new Common.UI.Menu({items: items})
                        );
                        me.btnCommentResolve.updateHint([me.tipCommentResolveCurrent, me.tipCommentResolve]);
                    }

                   setEvents.call(me);
                });
            },

            getPanel: function () {
                this.$el = $(_.template(template)( {} ));
                this.btnCommentRemove && this.btnCommentRemove.render(this.$el.find('#slot-comment-remove'));
                this.btnCommentResolve && this.btnCommentResolve.render(this.$el.find('#slot-comment-resolve'));

                return this.$el;
            },

            show: function () {
                Common.UI.BaseView.prototype.show.call(this);
                this.fireEvent('show', this);
            },

            getButton: function(type, parent) {
                if ( type == 'turn' && parent == 'statusbar' ) {
                    var button = new Common.UI.Button({
                        cls         : 'btn-toolbar',
                        iconCls     : 'toolbar__icon btn-ic-review',
                        hintAnchor  : 'top',
                        hint        : this.tipReview,
                        split       : !this.appConfig.isReviewOnly,
                        enableToggle: true/*,
                        menu: this.appConfig.isReviewOnly ? false : new Common.UI.Menu({
                            menuAlign: 'bl-tl',
                            style: 'margin-top:-5px;',
                            items: [
                            {
                                caption: this.txtOn,
                                value: 0,
                                checkable: true,
                                toggleGroup: 'menuTurnReviewStb'
                            },
                            {
                                caption: this.txtOff,
                                value: 1,
                                checkable: true,
                                toggleGroup: 'menuTurnReviewStb'
                            },
                            {
                                caption: this.txtOnGlobal,
                                value: 2,
                                checkable: true,
                                toggleGroup: 'menuTurnReviewStb'
                            },
                            {
                                caption: this.txtOffGlobal,
                                value: 3,
                                checkable: true,
                                toggleGroup: 'menuTurnReviewStb'
                            }
                        ]})*/
                    });

                   // this.btnsTurnReview.push(button);

                    return button;
                } else
                if ( type == 'spelling' ) {
                    button = new Common.UI.Button({
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-ic-docspell',
                        hintAnchor  : 'top',
                        hint: this.tipSetSpelling,
                        enableToggle: true
                    });
                    //this.btnsSpelling.push(button);

                    return button;
                } else if (type == 'doclang' && parent == 'statusbar' ) {
                    button = new Common.UI.Button({
                        cls: 'btn-toolbar',
                        iconCls: 'toolbar__icon btn-ic-doclang',
                        hintAnchor  : 'top',
                        hint: this.tipSetDocLang,
                        disabled: true
                    });
                    //this.btnsDocLang.push(button);

                    return button;
                 }
            },

            getUserName: function (username) {
                return Common.Utils.String.htmlEncode(AscCommon.UserInfoParser.getParsedName(username));
            },

            markChanges: function(status) {

            },

            turnSpelling: function (state) {

            },
            SetDisabled: function (state, langs) {
                this.btnCommentRemove && this.btnCommentRemove.setDisabled(state || !Common.Utils.InternalSettings.get(this.appPrefix + "settings-livecomment"));
                this.btnCommentResolve && this.btnCommentResolve.setDisabled(state || !Common.Utils.InternalSettings.get(this.appPrefix + "settings-livecomment"));
            },

            txtCommentRemove: 'Remove',
            tipCommentRemCurrent: 'Remove current comments',
            tipCommentRem: 'Remove comments',
            txtCommentRemCurrent: 'Remove Current Comments',
            txtCommentRemMyCurrent: 'Remove My Current Comments',
            txtCommentRemMy: 'Remove My Comments',
            txtCommentRemAll: 'Remove All Comments',
            txtCommentResolve: 'Resolve',
            tipCommentResolveCurrent: 'Resolve current comments',
            tipCommentResolve: 'Resolve comments',
            txtCommentResolveCurrent: 'Resolve Current Comments',
            txtCommentResolveMyCurrent: 'Resolve My Current Comments',
            txtCommentResolveMy: 'Resolve My Comments',
            txtCommentResolveAll: 'Resolve All Comments'
        }
    }()), Common.Views.Transitions || {}));

    });