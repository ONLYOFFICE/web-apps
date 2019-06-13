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
 *  ReviewChanges.js
 *
 *  View
 *
 *  Created by Julia.Radzhabova on 05.08.15
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
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

    Common.Views.ReviewChanges = Common.UI.BaseView.extend(_.extend((function(){
        var template =
            '<section id="review-changes-panel" class="panel" data-tab="review">' +
                '<div class="group no-group-mask">' +
                    '<span id="slot-btn-sharing" class="btn-slot text x-huge"></span>' +
                    '<span id="slot-btn-coauthmode" class="btn-slot text x-huge"></span>' +
                '</div>' +
                '<div class="separator long sharing"/>' +
                '<div class="group">' +
                    '<span class="btn-slot text x-huge slot-comment"></span>' +
                '</div>' +
                '<div class="separator long comments"/>' +
                '<div class="group">' +
                    '<span id="btn-review-on" class="btn-slot text x-huge"></span>' +
                '</div>' +
                '<div class="group no-group-mask" style="padding-left: 0;">' +
                    '<span id="btn-review-view" class="btn-slot text x-huge"></span>' +
                '</div>' +
                '<div class="group move-changes" style="padding-left: 0;">' +
                    '<span id="btn-change-prev" class="btn-slot text x-huge"></span>' +
                    '<span id="btn-change-next" class="btn-slot text x-huge"></span>' +
                    '<span id="btn-change-accept" class="btn-slot text x-huge"></span>' +
                    '<span id="btn-change-reject" class="btn-slot text x-huge"></span>' +
                '</div>' +
                '<div class="separator long review"/>' +
                '<div class="group no-group-mask">' +
                    '<span id="slot-btn-chat" class="btn-slot text x-huge"></span>' +
                '</div>' +
                '<div class="separator long chat"/>' +
                '<div class="group no-group-mask">' +
                    '<span id="slot-btn-history" class="btn-slot text x-huge"></span>' +
                '</div>' +
            '</section>';

        function _click_turnpreview(btn, e) {
            if (this.appConfig.canReview) {
                Common.NotificationCenter.trigger('reviewchanges:turn', btn.pressed ? 'on' : 'off');
                Common.NotificationCenter.trigger('edit:complete');
            }
        };

        function setEvents() {
            var me = this;

            if ( me.appConfig.canReview ) {
                this.btnAccept.on('click', function (e) {
                    me.fireEvent('reviewchange:accept', [me.btnAccept, 'current']);
                });

                this.btnAccept.menu.on('item:click', function (menu, item, e) {
                    me.fireEvent('reviewchange:accept', [menu, item]);
                });

                this.btnReject.on('click', function (e) {
                    me.fireEvent('reviewchange:reject', [me.btnReject, 'current']);
                });

                this.btnReject.menu.on('item:click', function (menu, item, e) {
                    me.fireEvent('reviewchange:reject', [menu, item]);
                });

                this.btnsTurnReview.forEach(function (button) {
                    button.on('click', _click_turnpreview.bind(me));
                });
            }
            if (this.appConfig.canViewReview) {
                this.btnPrev.on('click', function (e) {
                    me.fireEvent('reviewchange:preview', [me.btnPrev, 'prev']);
                });

                this.btnNext.on('click', function (e) {
                    me.fireEvent('reviewchange:preview', [me.btnNext, 'next']);
                });

                this.btnReviewView && this.btnReviewView.menu.on('item:click', function (menu, item, e) {
                    me.fireEvent('reviewchanges:view', [menu, item]);
                });
            }

            this.btnsSpelling.forEach(function(button) {
                button.on('click', function (b, e) {
                    Common.NotificationCenter.trigger('spelling:turn', b.pressed ? 'on' : 'off');
                    Common.NotificationCenter.trigger('edit:complete', me);
                });
            });

            this.btnsDocLang.forEach(function(button) {
                button.on('click', function (b, e) {
                    me.fireEvent('lang:document', this);
                });
            });

            this.btnSharing && this.btnSharing.on('click', function (btn, e) {
                Common.NotificationCenter.trigger('collaboration:sharing');
            });

            this.btnCoAuthMode && this.btnCoAuthMode.menu.on('item:click', function (menu, item, e) {
                me.fireEvent('collaboration:coauthmode', [menu, item]);
            });

            this.btnHistory && this.btnHistory.on('click', function (btn, e) {
                Common.NotificationCenter.trigger('collaboration:history');
            });

            this.btnChat && this.btnChat.on('click', function (btn, e) {
                me.fireEvent('collaboration:chat', [btn.pressed]);
            });
        }

        return {
            // el: '#review-changes-panel',

            options: {},

            initialize: function (options) {
                Common.UI.BaseView.prototype.initialize.call(this, options);

                this.appConfig = options.mode;

                if ( this.appConfig.canReview ) {
                    this.btnAccept = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        caption: this.txtAccept,
                        split: true,
                        iconCls: 'review-save'
                    });

                    this.btnReject = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        caption: this.txtReject,
                        split: true,
                        iconCls: 'review-deny'
                    });

                    this.btnTurnOn = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'btn-ic-review',
                        caption: this.txtTurnon,
                        enableToggle: true
                    });
                    this.btnsTurnReview = [this.btnTurnOn];
                }
                if (this.appConfig.canViewReview) {
                    this.btnPrev = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'review-prev',
                        caption: this.txtPrev
                    });

                    this.btnNext = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'review-next',
                        caption: this.txtNext
                    });

                    if (!this.appConfig.isRestrictedEdit) {// hide Display mode option for fillForms and commenting mode
                        var menuTemplate = _.template('<a id="<%= id %>" tabindex="-1" type="menuitem"><div><%= caption %></div>' +
                            '<% if (options.description !== null) { %><label style="display: block;color: #a5a5a5;cursor: pointer;white-space: normal;"><%= options.description %></label>' +
                            '<% } %></a>');

                        this.btnReviewView = new Common.UI.Button({
                            cls: 'btn-toolbar x-huge icon-top',
                            iconCls: 'btn-ic-reviewview',
                            caption: this.txtView,
                            menu: new Common.UI.Menu({
                                cls: 'ppm-toolbar',
                                items: [
                                    {
                                        caption: this.txtMarkupCap,
                                        checkable: true,
                                        toggleGroup: 'menuReviewView',
                                        checked: true,
                                        value: 'markup',
                                        template: menuTemplate,
                                        description: this.txtMarkup
                                    },
                                    {
                                        caption: this.txtFinalCap,
                                        checkable: true,
                                        toggleGroup: 'menuReviewView',
                                        checked: false,
                                        template: menuTemplate,
                                        description: this.txtFinal,
                                        value: 'final'
                                    },
                                    {
                                        caption: this.txtOriginalCap,
                                        checkable: true,
                                        toggleGroup: 'menuReviewView',
                                        checked: false,
                                        template: menuTemplate,
                                        description: this.txtOriginal,
                                        value: 'original'
                                    }
                                ]
                            })
                        });
                    }
                }

                if (!!this.appConfig.sharingSettingsUrl && this.appConfig.sharingSettingsUrl.length && this._readonlyRights!==true) {
                    this.btnSharing = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'btn-ic-sharing',
                        caption: this.txtSharing
                    });
                }

                if (this.appConfig.isEdit && !this.appConfig.isOffline && this.appConfig.canCoAuthoring) {
                    this.btnCoAuthMode = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'btn-ic-coedit',
                        caption: this.txtCoAuthMode,
                        menu: true
                    });
                }

                this.btnsSpelling = [];
                this.btnsDocLang = [];

                if (this.appConfig.canUseHistory && !this.appConfig.isDisconnected) {
                    this.btnHistory = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'btn-ic-history',
                        caption: this.txtHistory
                    });
                }

                if (this.appConfig.canCoAuthoring && this.appConfig.canChat) {
                    this.btnChat = new Common.UI.Button({
                        cls: 'btn-toolbar x-huge icon-top',
                        iconCls: 'btn-ic-chat',
                        caption: this.txtChat,
                        enableToggle: true
                    });
                }

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
                    var menuTemplate = _.template('<a id="<%= id %>" tabindex="-1" type="menuitem"><div><%= caption %></div>' +
                        '<% if (options.description !== null) { %><label style="display: block;color: #a5a5a5;cursor: pointer;white-space: normal;"><%= options.description %></label>' +
                        '<% } %></a>');

                    if ( config.canReview ) {
                        me.btnTurnOn.updateHint(me.tipReview);

                        me.btnAccept.setMenu(
                            new Common.UI.Menu({
                                items: [
                                    {
                                        caption: me.txtAcceptCurrent,
                                        value: 'current'
                                    },
                                    {
                                        caption: me.txtAcceptAll,
                                        value: 'all'
                                    }
                                ]
                            })
                        );
                        me.btnAccept.updateHint([me.tipAcceptCurrent, me.txtAcceptChanges]);

                        me.btnReject.setMenu(
                            new Common.UI.Menu({
                                items: [
                                    {
                                        caption: me.txtRejectCurrent,
                                        value: 'current'
                                    },
                                    {
                                        caption: me.txtRejectAll,
                                        value: 'all'
                                    }
                                ]
                            })
                        );
                        me.btnReject.updateHint([me.tipRejectCurrent, me.txtRejectChanges]);

                        me.btnAccept.setDisabled(config.isReviewOnly);
                        me.btnReject.setDisabled(config.isReviewOnly);
                    }
                    if (me.appConfig.canViewReview) {
                        me.btnPrev.updateHint(me.hintPrev);
                        me.btnNext.updateHint(me.hintNext);

                        me.btnReviewView && me.btnReviewView.updateHint(me.tipReviewView);
                    }
                    me.btnSharing && me.btnSharing.updateHint(me.tipSharing);
                    me.btnHistory && me.btnHistory.updateHint(me.tipHistory);
                    me.btnChat && me.btnChat.updateHint(me.txtChat + Common.Utils.String.platformKey('Alt+Q'));

                    if (me.btnCoAuthMode) {
                        me.btnCoAuthMode.setMenu(
                            new Common.UI.Menu({
                                cls: 'ppm-toolbar',
                                style: 'max-width: 220px;',
                                items: [
                                    {
                                        caption: me.strFast,
                                        checkable: true,
                                        toggleGroup: 'menuCoauthMode',
                                        checked: true,
                                        template: menuTemplate,
                                        description: me.strFastDesc,
                                        value: 1
                                    },
                                    {
                                        caption: me.strStrict,
                                        checkable: true,
                                        toggleGroup: 'menuCoauthMode',
                                        checked: false,
                                        template: menuTemplate,
                                        description: me.strStrictDesc,
                                        value: 0
                                    }
                                ]
                            }));
                        me.btnCoAuthMode.updateHint(me.tipCoAuthMode);

                        var value = Common.localStorage.getItem(me.appPrefix + "settings-coauthmode");
                        if (value===null && !Common.localStorage.itemExists(me.appPrefix + "settings-autosave") &&
                            config.customization && config.customization.autosave===false) {
                            value = 0; // use customization.autosave only when de-settings-coauthmode and de-settings-autosave are null
                        }
                        me.turnCoAuthMode((value===null || parseInt(value) == 1) && !(config.isDesktopApp && config.isOffline) && config.canCoAuthoring);
                    }

                    var separator_sharing = !(me.btnSharing || me.btnCoAuthMode) ? me.$el.find('.separator.sharing') : '.separator.sharing',
                        separator_comments = !(config.canComments && config.canCoAuthoring) ? me.$el.find('.separator.comments') : '.separator.comments',
                        separator_review = !(config.canReview || config.canViewReview) ? me.$el.find('.separator.review') : '.separator.review',
                        separator_chat = !me.btnChat ? me.$el.find('.separator.chat') : '.separator.chat',
                        separator_last;

                    if (typeof separator_sharing == 'object')
                        separator_sharing.hide().prev('.group').hide();
                    else
                        separator_last = separator_sharing;

                    if (typeof separator_comments == 'object')
                        separator_comments.hide().prev('.group').hide();
                    else
                        separator_last = separator_comments;

                    if (typeof separator_review == 'object')
                        separator_review.hide().prevUntil('.separator.comments').hide();
                    else
                        separator_last = separator_review;

                    if (typeof separator_chat == 'object')
                        separator_chat.hide().prev('.group').hide();
                    else
                        separator_last = separator_chat;

                    if (!me.btnHistory && separator_last)
                        me.$el.find(separator_last).hide();

                    Common.NotificationCenter.trigger('tab:visible', 'review', config.isEdit || config.canViewReview);

                    setEvents.call(me);
                });
            },

            getPanel: function () {
                this.$el = $(_.template(template)( {} ));

                if ( this.appConfig.canReview ) {
                    this.btnAccept.render(this.$el.find('#btn-change-accept'));
                    this.btnReject.render(this.$el.find('#btn-change-reject'));
                    this.btnTurnOn.render(this.$el.find('#btn-review-on'));
                }
                this.btnPrev && this.btnPrev.render(this.$el.find('#btn-change-prev'));
                this.btnNext && this.btnNext.render(this.$el.find('#btn-change-next'));
                this.btnReviewView && this.btnReviewView.render(this.$el.find('#btn-review-view'));

                this.btnSharing && this.btnSharing.render(this.$el.find('#slot-btn-sharing'));
                this.btnCoAuthMode && this.btnCoAuthMode.render(this.$el.find('#slot-btn-coauthmode'));
                this.btnHistory && this.btnHistory.render(this.$el.find('#slot-btn-history'));
                this.btnChat && this.btnChat.render(this.$el.find('#slot-btn-chat'));

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
                        iconCls     : 'btn-ic-review',
                        hintAnchor  : 'top',
                        hint        : this.tipReview,
                        enableToggle: true
                    });

                    this.btnsTurnReview.push(button);

                    return button;
                } else
                if ( type == 'spelling' ) {
                    button = new Common.UI.Button({
                        cls: 'btn-toolbar',
                        iconCls: 'btn-ic-docspell',
                        hintAnchor  : 'top',
                        hint: this.tipSetSpelling,
                        enableToggle: true
                    });
                    this.btnsSpelling.push(button);

                    return button;
                } else if (type == 'doclang' && parent == 'statusbar' ) {
                    button = new Common.UI.Button({
                        cls: 'btn-toolbar',
                        iconCls: 'btn-ic-doclang',
                        hintAnchor  : 'top',
                        hint: this.tipSetDocLang,
                        disabled: true
                    });
                    this.btnsDocLang.push(button);

                    return button;
                }
            },

            getUserName: function (username) {
                return Common.Utils.String.htmlEncode(username);
            },

            turnChanges: function(state) {
                this.btnsTurnReview.forEach(function(button) {
                    if ( button && button.pressed != state ) {
                        button.toggle(state, true);
                    }
                }, this);
            },

            markChanges: function(status) {
                this.btnsTurnReview.forEach(function(button) {
                    if ( button ) {
                        var _icon_el = $('.icon', button.cmpEl);
                        _icon_el[status ? 'addClass' : 'removeClass']('btn-ic-changes');
                    }
                }, this);
            },

            turnSpelling: function (state) {
                this.btnsSpelling.forEach(function(button) {
                    if ( button && button.pressed != state ) {
                        button.toggle(state, true);
                    }
                }, this);
            },

            turnCoAuthMode: function (fast) {
                if (this.btnCoAuthMode) {
                    this.btnCoAuthMode.menu.items[0].setChecked(fast, true);
                    this.btnCoAuthMode.menu.items[1].setChecked(!fast, true);
                }
            },

            turnChat: function (state) {
                this.btnChat && this.btnChat.toggle(state, true);
            },

            turnDisplayMode: function(mode) {
                if (this.btnReviewView) {
                    this.btnReviewView.menu.items[0].setChecked(mode=='markup', true);
                    this.btnReviewView.menu.items[1].setChecked(mode=='final', true);
                    this.btnReviewView.menu.items[2].setChecked(mode=='original', true);
                }
            },

            SetDisabled: function (state, langs) {
                this.btnsSpelling && this.btnsSpelling.forEach(function(button) {
                    if ( button ) {
                        button.setDisabled(state);
                    }
                }, this);
                this.btnsDocLang && this.btnsDocLang.forEach(function(button) {
                    if ( button ) {
                        button.setDisabled(state || langs && langs.length<1);
                    }
                }, this);
                this.btnsTurnReview && this.btnsTurnReview.forEach(function(button) {
                    if ( button ) {
                        button.setDisabled(state);
                    }
                }, this);
                this.btnChat && this.btnChat.setDisabled(state);
            },

            onLostEditRights: function() {
                this._readonlyRights = true;
                if (!this.rendered)
                    return;

                 this.btnSharing && this.btnSharing.setDisabled(true);
            },

            txtAccept: 'Accept',
            txtAcceptCurrent: 'Accept current Changes',
            txtAcceptAll: 'Accept all Changes',
            txtReject: 'Reject',
            txtRejectCurrent: 'Reject current Changes',
            txtRejectAll: 'Reject all Changes',
            hintNext: 'To Next Change',
            hintPrev: 'To Previous Change',
            txtPrev: 'Previous',
            txtNext: 'Next',
            txtTurnon: 'Turn On',
            txtSpelling: 'Spell checking',
            txtDocLang: 'Language',
            tipSetDocLang: 'Set Document Language',
            tipSetSpelling: 'Spell checking',
            tipReview: 'Review',
            txtAcceptChanges: 'Accept Changes',
            txtRejectChanges: 'Reject Changes',
            txtView: 'Display Mode',
            txtMarkup: 'Text with changes (Editing)',
            txtFinal: 'All changes like accept (Preview)',
            txtOriginal: 'Text without changes (Preview)',
            tipReviewView: 'Select the way you want the changes to be displayed',
            tipAcceptCurrent: 'Accept current changes',
            tipRejectCurrent: 'Reject current changes',
            txtSharing: 'Sharing',
            tipSharing: 'Manage document access rights',
            txtCoAuthMode: 'Co-editing Mode',
            tipCoAuthMode: 'Set co-editing mode',
            strFast: 'Fast',
            strStrict: 'Strict',
            txtHistory: 'Version History',
            tipHistory: 'Show version history',
            txtChat: 'Chat',
            txtMarkupCap: 'Markup',
            txtFinalCap: 'Final',
            txtOriginalCap: 'Original',
            strFastDesc: 'Real-time co-editing. All changes are saved automatically.',
            strStrictDesc: 'Use the \'Save\' button to sync the changes you and others make.'
        }
    }()), Common.Views.ReviewChanges || {}));

    Common.Views.ReviewChangesDialog = Common.UI.Window.extend(_.extend({
        options: {
            width       : 330,
            height      : 90,
            title       : 'Review Changes',
            modal       : false,
            cls         : 'review-changes modal-dlg',
            alias       : 'Common.Views.ReviewChangesDialog'
        },

        initialize : function(options) {
            _.extend(this.options, {
                title    : this.textTitle
            },  options || {});

            this.template = [
                '<div class="box">',
                    '<div class="input-row">',
                        '<div id="id-review-button-prev" style=""></div>',
                        '<div id="id-review-button-next" style=""></div>',
                        '<div id="id-review-button-accept" style=""></div>',
                        '<div id="id-review-button-reject" style="margin-right: 0;"></div>',
                    '</div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);
            this.popoverChanges = this.options.popoverChanges;
            this.mode = this.options.mode;

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.btnPrev = new Common.UI.Button({
                cls: 'dlg-btn iconic',
                iconCls: 'img-commonctrl prev',
                hint: this.txtPrev,
                hintAnchor: 'top'
            });
            this.btnPrev.render( this.$window.find('#id-review-button-prev'));

            this.btnNext = new Common.UI.Button({
                cls: ' dlg-btn iconic',
                iconCls: 'img-commonctrl next',
                hint: this.txtNext,
                hintAnchor: 'top'
            });
            this.btnNext.render( this.$window.find('#id-review-button-next'));

            this.btnAccept = new Common.UI.Button({
                cls         : 'btn-toolbar',
                caption     : this.txtAccept,
                split       : true,
                disabled    : this.mode.isReviewOnly,
                menu        : new Common.UI.Menu({
                    items: [
                        this.mnuAcceptCurrent = new Common.UI.MenuItem({
                            caption: this.txtAcceptCurrent,
                            value: 'current'
                        }),
                        this.mnuAcceptAll = new Common.UI.MenuItem({
                            caption: this.txtAcceptAll,
                            value: 'all'
                        })
                    ]
                })
            });
            this.btnAccept.render(this.$window.find('#id-review-button-accept'));

            this.btnReject = new Common.UI.Button({
                cls         : 'btn-toolbar',
                caption     : this.txtReject,
                split       : true,
                disabled    : this.mode.isReviewOnly,
                menu        : new Common.UI.Menu({
                    items: [
                        this.mnuRejectCurrent = new Common.UI.MenuItem({
                            caption: this.txtRejectCurrent,
                            value: 'current'
                        }),
                        this.mnuRejectAll = new Common.UI.MenuItem({
                            caption: this.txtRejectAll,
                            value: 'all'
                        })
                    ]
                })
            });
            this.btnReject.render(this.$window.find('#id-review-button-reject'));

            var me = this;
            this.btnPrev.on('click', function (e) {
                me.fireEvent('reviewchange:preview', [me.btnPrev, 'prev']);
            });

            this.btnNext.on('click', function (e) {
                me.fireEvent('reviewchange:preview', [me.btnNext, 'next']);
            });

            this.btnAccept.on('click', function (e) {
                me.fireEvent('reviewchange:accept', [me.btnAccept, 'current']);
            });

            this.btnAccept.menu.on('item:click', function (menu, item, e) {
                me.fireEvent('reviewchange:accept', [menu, item]);
            });

            this.btnReject.on('click', function (e) {
                me.fireEvent('reviewchange:reject', [me.btnReject, 'current']);
            });

            this.btnReject.menu.on('item:click', function (menu, item, e) {
                me.fireEvent('reviewchange:reject', [menu, item]);
            });

            return this;
        },

        textTitle: 'Review Changes',
        txtPrev: 'To previous change',
        txtNext: 'To next change',
        txtAccept: 'Accept',
        txtAcceptCurrent: 'Accept Current Change',
        txtAcceptAll: 'Accept All Changes',
        txtReject: 'Reject',
        txtRejectCurrent: 'Reject Current Change',
        txtRejectAll: 'Reject All Changes'
    }, Common.Views.ReviewChangesDialog || {}));
});