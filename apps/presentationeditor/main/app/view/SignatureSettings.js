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
 *  SignatureSettings.js
 *
 *  Created by Julia Radzhabova on 5/24/17
 *  Copyright (c) 2017 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!presentationeditor/main/app/template/SignatureSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    PE.Views.SignatureSettings = Backbone.View.extend(_.extend({
        el: '#id-signature-settings',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        options: {
            alias: 'SignatureSettings'
        },

        initialize: function () {
            this._state = {
                requestedSignatures: undefined,
                validSignatures: undefined,
                invalidSignatures: undefined,
                DisabledEditing: false,
                ready: false
            };
            this._locked = false;

            this.render();
        },

        render: function () {
            this.$el.html(this.template({
                scope: this
            }));

            var protection = PE.getController('Common.Controllers.Protection').getView();
            this.btnAddInvisibleSign = protection.getButton('signature');
            this.btnAddInvisibleSign.render(this.$el.find('#signature-invisible-sign'));

            this.viewValidList = new Common.UI.DataView({
                el: $('#signature-valid-sign'),
                enableKeyEvents: false,
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="signature-item">',
                        '<div class="caret img-commonctrl"></div>',
                        '<div class="name"><%= Common.Utils.String.htmlEncode(name) %></div>',
                        '<div class="date"><%= Common.Utils.String.htmlEncode(date) %></div>',
                    '</div>'
                ].join(''))
            });

            this.viewInvalidList = new Common.UI.DataView({
                el: $('#signature-invalid-sign'),
                enableKeyEvents: false,
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="signature-item">',
                        '<div class="caret img-commonctrl"></div>',
                        '<div class="name"><%= Common.Utils.String.htmlEncode(name) %></div>',
                        '<div class="date"><%= Common.Utils.String.htmlEncode(date) %></div>',
                    '</div>'
                ].join(''))
            });

            this.viewValidList.on('item:click', _.bind(this.onSelectSignature, this));
            this.viewInvalidList.on('item:click', _.bind(this.onSelectSignature, this));

            this.signatureMenu = new Common.UI.Menu({
                menuAlign   : 'tr-br',
                items: [
                    { caption: this.strDetails,value: 1 },
                    { caption: this.strDelete, value: 3 }
                ]
            });
            this.signatureMenu.on('item:click', _.bind(this.onMenuSignatureClick, this));
        },

        setApi: function(api) {
            this.api = api;
            if (this.api) {
                this.api.asc_registerCallback('asc_onUpdateSignatures',    _.bind(this.onApiUpdateSignatures, this));
            }
            Common.NotificationCenter.on('document:ready', _.bind(this.onDocumentReady, this));
            return this;
        },

        ChangeSettings: function(props) {
            if (!this._state.validSignatures || !this._state.invalidSignatures)
                this.updateSignatures(this.api.asc_getSignatures());
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        setMode: function(mode) {
            this.mode = mode;
        },

        onApiUpdateSignatures: function(valid){
            if (!this._state.ready) return;

            this.updateSignatures(valid);
            this.showSignatureTooltip(this._state.validSignatures.length>0, this._state.invalidSignatures.length>0);
        },

        updateSignatures: function(valid){
            var me = this;
            me._state.validSignatures = [];
            me._state.invalidSignatures = [];

            _.each(valid, function(item, index){
                var sign = {name: item.asc_getSigner1(), guid: item.asc_getId(), date: '18/05/2017'};
                (item.asc_getValid()==0) ? me._state.validSignatures.push(sign) : me._state.invalidSignatures.push(sign);
            });

            // me._state.validSignatures = [{name: 'Hammish Mitchell', guid: '123', date: '18/05/2017', invisible: true}, {name: 'Someone Somewhere', guid: '345', date: '18/05/2017'}];
            // me._state.invalidSignatures = [{name: 'Mary White', guid: '111', date: '18/05/2017'}, {name: 'John Black', guid: '456', date: '18/05/2017'}];

            this.viewValidList.store.reset(me._state.validSignatures);
            this.viewInvalidList.store.reset(me._state.invalidSignatures);

            this.$el.find('.valid').toggleClass('hidden', me._state.validSignatures.length<1);
            this.$el.find('.invalid').toggleClass('hidden', me._state.invalidSignatures.length<1);

            me.disableEditing(me._state.validSignatures.length>0 || me._state.invalidSignatures.length>0);
        },

        onSelectSignature: function(picker, item, record, e){
            if (!record) return;

            var btn = $(e.target);
            if (btn && btn.hasClass('caret')) {
                var menu = this.signatureMenu;
                if (menu.isVisible()) {
                    menu.hide();
                    return;
                }

                var showPoint, me = this,
                    currentTarget = $(e.currentTarget),
                    parent = $(this.el),
                    offset = currentTarget.offset(),
                    offsetParent = parent.offset();

                showPoint = [offset.left - offsetParent.left + currentTarget.width(), offset.top - offsetParent.top + currentTarget.height()/2];

                var menuContainer = parent.find('#menu-signature-container');
                if (!menu.rendered) {
                    if (menuContainer.length < 1) {
                        menuContainer = $('<div id="menu-signature-container" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', menu.id);
                        parent.append(menuContainer);
                    }
                    menu.render(menuContainer);
                    menu.cmpEl.attr({tabindex: "-1"});

                    menu.on({
                        'show:after': function(cmp) {
                            if (cmp && cmp.menuAlignEl)
                                cmp.menuAlignEl.toggleClass('over', true);
                        },
                        'hide:after': function(cmp) {
                            if (cmp && cmp.menuAlignEl)
                                cmp.menuAlignEl.toggleClass('over', false);
                        }
                    });
                }
                menu.items[1].setDisabled(this._locked);
                menu.cmpEl.attr('data-value', record.get('guid'));

                menuContainer.css({left: showPoint[0], top: showPoint[1]});

                menu.menuAlignEl = currentTarget;
                menu.setOffset(-20, -currentTarget.height()/2 + 3);
                menu.show();
                _.delay(function() {
                    menu.cmpEl.focus();
                }, 10);
                e.stopPropagation();
                e.preventDefault();
            }
        },

        onMenuSignatureClick:  function(menu, item) {
            var guid = menu.cmpEl.attr('data-value');
            switch (item.value) {
                case 1:
                    this.api.asc_ViewCertificate(guid);
                    break;
                case 3:
                    this.api.asc_RemoveSignature(guid);
                    break;
            }
        },

        onDocumentReady: function() {
            this._state.ready = true;

            this.updateSignatures(this.api.asc_getSignatures(), this.api.asc_getRequestSignatures());
            this.showSignatureTooltip(this._state.validSignatures.length>0, this._state.invalidSignatures.length>0);
        },

        showSignatureTooltip: function(hasValid, hasInvalid) {
            if (!hasValid && !hasInvalid) return;

            var tipText = (hasInvalid) ? this.txtSignedInvalid : (hasValid ? this.txtSigned : "");

            var me = this,
                tip = new Common.UI.SynchronizeTip({
                    target  : PE.getController('RightMenu').getView('RightMenu').btnSignature.btnEl,
                    text    : tipText,
                    showLink: hasValid || hasInvalid,
                    textLink: this.txtContinueEditing,
                    placement: 'left'
                });
            tip.on({
                'dontshowclick': function() {
                    Common.UI.warning({
                        title: me.notcriticalErrorTitle,
                        msg: me.txtEditWarning,
                        buttons: ['ok', 'cancel'],
                        primary: 'ok',
                        callback: function(btn) {
                            if (btn == 'ok') {
                                tip.close();
                                me.api.asc_RemoveAllSignatures();
                            }
                        }
                    });
                },
                'closeclick': function() {
                    tip.close();
                }
            });
            tip.show();
        },

        disableEditing: function(disable) {
            if (this._state.DisabledEditing != disable) {
                this._state.DisabledEditing = disable;

                var rightMenuController = PE.getController('RightMenu');
                if (disable && rightMenuController.rightmenu.GetActivePane() !== 'id-signature-settings')
                    rightMenuController.rightmenu.clearSelection();
                rightMenuController.SetDisabled(disable, true);
                PE.getController('Toolbar').DisableToolbar(disable, disable);
                PE.getController('Statusbar').getView('Statusbar').SetDisabled(disable);
                PE.getController('Common.Controllers.ReviewChanges').SetDisabled(disable);
                PE.getController('DocumentHolder').getView('DocumentHolder').SetDisabled(disable);

                var leftMenu = PE.getController('LeftMenu').leftMenu;
                leftMenu.btnComments.setDisabled(disable);
                var comments = PE.getController('Common.Controllers.Comments');
                if (comments)
                    comments.setPreviewMode(disable);
            }
        },

        strSignature: 'Signature',
        strValid: 'Valid signatures',
        strInvalid: 'Invalid signatures',
        strDetails: 'Signature Details',
        txtSigned: 'Valid signatures has been added to the presentation. The presentation is protected from editing.',
        txtSignedInvalid: 'Some of the digital signatures in presentation are invalid or could not be verified. The presentation is protected from editing.',
        txtContinueEditing: 'Edit anyway',
        notcriticalErrorTitle: 'Warning',
        txtEditWarning: 'Editing will remove the signatures from the presentation.<br>Are you sure you want to continue?',
        strDelete: 'Remove Signature'

    }, PE.Views.SignatureSettings || {}));
});