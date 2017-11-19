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
    'text!spreadsheeteditor/main/app/template/SignatureSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    SSE.Views.SignatureSettings = Backbone.View.extend(_.extend({
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

            var protection = SSE.getController('Common.Controllers.Protection').getView();
            this.btnAddInvisibleSign = protection.getButton('signature');
            this.btnAddInvisibleSign.render(this.$el.find('#signature-invisible-sign'));

            this.viewRequestedList = new Common.UI.DataView({
                el: $('#signature-requested-sign'),
                enableKeyEvents: false,
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="signature-item requested">',
                        '<div class="caret img-commonctrl"></div>',
                        '<div class="name"><%= Common.Utils.String.htmlEncode(name) %></div>',
                    '</div>'
                ].join(''))
            });

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

            this.viewRequestedList.on('item:click', _.bind(this.onSelectSignature, this));
            this.viewValidList.on('item:click', _.bind(this.onSelectSignature, this));
            this.viewInvalidList.on('item:click', _.bind(this.onSelectSignature, this));

            this.signatureMenu = new Common.UI.Menu({
                menuAlign   : 'tr-br',
                items: [
                    { caption: this.strSign,   value: 0 },
                    { caption: this.strDetails,value: 1 },
                    { caption: this.strSetup,  value: 2 },
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
            if (!this._state.requestedSignatures || !this._state.validSignatures || !this._state.invalidSignatures)
                this.updateSignatures(this.api.asc_getSignatures(), this.api.asc_getRequestSignatures());
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        setMode: function(mode) {
            this.mode = mode;
        },

        onApiUpdateSignatures: function(valid, requested){
            if (!this._state.ready) return;

            this.updateSignatures(valid, requested);
            this.showSignatureTooltip(this._state.validSignatures.length>0, this._state.invalidSignatures.length>0);
        },

        updateSignatures: function(valid, requested){
            var me = this;
            me._state.requestedSignatures = [];
            me._state.validSignatures = [];
            me._state.invalidSignatures = [];

            _.each(requested, function(item, index){
                me._state.requestedSignatures.push({name: item.asc_getSigner1(), guid: item.asc_getGuid(), requested: true});
            });
            _.each(valid, function(item, index){
                var sign = {name: item.asc_getSigner1(), guid: item.asc_getId(), date: '18/05/2017', invisible: !item.asc_getVisible()};
                (item.asc_getValid()==0) ? me._state.validSignatures.push(sign) : me._state.invalidSignatures.push(sign);
            });

            // me._state.requestedSignatures = [{name: 'Hammish Mitchell', guid: '123', requested: true}, {name: 'Someone Somewhere', guid: '123', requested: true}, {name: 'Mary White', guid: '123', requested: true}, {name: 'John Black', guid: '123', requested: true}];
            // me._state.validSignatures = [{name: 'Hammish Mitchell', guid: '123', date: '18/05/2017', invisible: true}, {name: 'Someone Somewhere', guid: '345', date: '18/05/2017'}];
            // me._state.invalidSignatures = [{name: 'Mary White', guid: '111', date: '18/05/2017'}, {name: 'John Black', guid: '456', date: '18/05/2017'}];

            this.viewRequestedList.store.reset(me._state.requestedSignatures);
            this.viewValidList.store.reset(me._state.validSignatures);
            this.viewInvalidList.store.reset(me._state.invalidSignatures);

            this.$el.find('.requested').toggleClass('hidden', me._state.requestedSignatures.length<1);
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
                var requested = record.get('requested'),
                    signed = (this._state.validSignatures.length>0 || this._state.invalidSignatures.length>0);
                menu.items[0].setVisible(requested);
                menu.items[1].setVisible(!requested);
                menu.items[2].setVisible(requested || !record.get('invisible'));
                menu.items[3].setVisible(!requested);
                menu.items[0].setDisabled(this._locked);
                menu.items[3].setDisabled(this._locked);
                menu.items[2].cmpEl.attr('data-value', signed ? 1 : 0); // view or edit signature settings
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
            } else {
                this.api.asc_gotoSignature(record.get('guid'));
            }
        },

        onMenuSignatureClick:  function(menu, item) {
            var guid = menu.cmpEl.attr('data-value');
            switch (item.value) {
                case 0:
                    Common.NotificationCenter.trigger('protect:sign', guid);
                    break;
                case 1:
                    this.api.asc_ViewCertificate(guid);
                    break;
                case 2:
                    Common.NotificationCenter.trigger('protect:signature', 'visible', !!parseInt(item.cmpEl.attr('data-value')), guid);// can edit settings for requested signature
                    break;
                case 3:
                    this.api.asc_RemoveSignature(guid);
                    break;
            }
        },

        onDocumentReady: function() {
            this._state.ready = true;

            this.updateSignatures(this.api.asc_getSignatures(), this.api.asc_getRequestSignatures());
            this.showSignatureTooltip(this._state.validSignatures.length>0, this._state.invalidSignatures.length>0, this._state.requestedSignatures.length>0);
        },

        showSignatureTooltip: function(hasValid, hasInvalid, hasRequested) {
            if (!hasValid && !hasInvalid && !hasRequested) return;

            var tipText = (hasInvalid) ? this.txtSignedInvalid : (hasValid ? this.txtSigned : "");
            if (hasRequested)
                tipText = this.txtRequestedSignatures + "<br><br>" + tipText;

            var me = this,
                tip = new Common.UI.SynchronizeTip({
                    target  : SSE.getController('RightMenu').getView('RightMenu').btnSignature.btnEl,
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

                var rightMenuController = SSE.getController('RightMenu');
                if (disable && rightMenuController.rightmenu.GetActivePane() !== 'id-signature-settings')
                    rightMenuController.rightmenu.clearSelection();
                rightMenuController.SetDisabled(disable, true);
                SSE.getController('Toolbar').DisableToolbar(disable, disable);
                SSE.getController('Statusbar').SetDisabled(disable);
                SSE.getController('Common.Controllers.ReviewChanges').SetDisabled(disable);
                SSE.getController('DocumentHolder').SetDisabled(disable);

                var leftMenu = SSE.getController('LeftMenu').leftMenu;
                leftMenu.btnComments.setDisabled(disable);
                var comments = SSE.getController('Common.Controllers.Comments');
                if (comments)
                    comments.setPreviewMode(disable);
            }
        },

        strSignature: 'Signature',
        strRequested: 'Requested signatures',
        strValid: 'Valid signatures',
        strInvalid: 'Invalid signatures',
        strSign: 'Sign',
        strDetails: 'Signature Details',
        strSetup: 'Signature Setup',
        txtSigned: 'Valid signatures has been added to the workbook. The workbook is protected from editing.',
        txtSignedInvalid: 'Some of the digital signatures in workbook are invalid or could not be verified. The workbook is protected from editing.',
        txtRequestedSignatures: 'This workbook needs to be signed.',
        txtContinueEditing: 'Edit anyway',
        notcriticalErrorTitle: 'Warning',
        txtEditWarning: 'Editing will remove the signatures from the workbook.<br>Are you sure you want to continue?',
        strDelete: 'Remove Signature'

    }, SSE.Views.SignatureSettings || {}));
});