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
    'text!documenteditor/main/app/template/SignatureSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button',
    'common/main/lib/view/SignDialog',
    'common/main/lib/view/SignSettingsDialog'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    DE.Views.SignatureSettings = Backbone.View.extend(_.extend({
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
            var me = this;

            this._state = {
                DisabledControls: false,
                DisabledInsertControls: false,
                requestedSignatures: undefined,
                validSignatures: undefined,
                invalidSignatures: undefined,
                DisabledEditing: false,
                ready: false
            };
            this._locked = false;
            this._noApply = false;
            this._originalProps = null;

            this.templateRequested = _.template([
                '<td class="padding-large <% if (signatures.length<1) { %>hidden<% } %>">',
                '<table class="<% if (signatures.length<1) { %>hidden<% } %>" style="width:100%">',
                    '<tr><td colspan="2" class="padding-large"><label class="header"><%= header %></label></td></tr>',
                    '<% _.each(signatures, function(item) { %>',
                    '<tr>',
                        '<td style="padding-bottom: 5px;"><label class="signature-sign-name"><%= Common.Utils.String.htmlEncode(item.name) %></label></td>',
                        '<td style="padding: 0 5px; vertical-align: top; text-align: right;"><label class="link-solid signature-sign-link" data-value="<%= item.guid %>">' + this.strSign + '</label></td>',
                    '</tr>',
                    '<% }); %>',
                '</table>',
                '</td>'
            ].join(''));

            this.templateValid = _.template([
                '<td class="padding-large <% if (signatures.length<1) { %>hidden<% } %>"">',
                '<table class="<% if (signatures.length<1) { %>hidden<% } %>" style="width:100%">',
                    '<tr><td colspan="2" class="padding-large"><label class="header"><%= header %></label></td></tr>',
                    '<% _.each(signatures, function(item) { %>',
                    '<tr>',
                        '<td><div class="signature-sign-name"><%= Common.Utils.String.htmlEncode(item.name) %></div></td>',
                        '<td rowspan="2" style="padding: 0 5px; vertical-align: top; text-align: right;"><label class="link-solid signature-view-link" data-value="<%= item.guid %>">' + this.strView + '</label></td>',
                    '</tr>',
                    '<tr><td style="padding-bottom: 3px;"><label class="signature-sign-name"><%= Common.Utils.String.htmlEncode(item.date) %></label></td></tr>',
                    '<% }); %>',
                '</table>',
                '</td>'
            ].join(''));

            this.render();
        },

        render: function () {
            this.$el.html(this.template({
                scope: this
            }));

            var protection = DE.getController('Common.Controllers.Protection').getView();
            this.btnAddInvisibleSign = protection.getButton('signature');
            this.btnAddInvisibleSign.render(this.$el.find('#signature-invisible-sign'));

            this.cntRequestedSign = $('#signature-requested-sign');
            this.cntValidSign = $('#signature-valid-sign');
            this.cntInvalidSign = $('#signature-invalid-sign');

            this.$el.on('click', '.signature-sign-link', _.bind(this.onSign, this));
            this.$el.on('click', '.signature-view-link', _.bind(this.onViewSignature, this));
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

            this.disableControls(this._locked);
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        disableControls: function(disable) {
            if (this._state.DisabledControls!==disable) {
                this._state.DisabledControls = disable;
                this.$linksSign && this.$linksSign.toggleClass('disabled', disable);
                this.$linksView && this.$linksView.toggleClass('disabled', disable);
            }
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
                me._state.requestedSignatures.push({name: item.asc_getSigner1(), guid: item.asc_getGuid()});
            });
            _.each(valid, function(item, index){
                var sign = {name: item.asc_getSigner1(), guid: item.asc_getId(), date: '18/05/2017'};
                (item.asc_getValid()==0) ? me._state.validSignatures.push(sign) : me._state.invalidSignatures.push(sign);
            });

            // me._state.requestedSignatures = [{name: 'Hammish Mitchell', guid: '123'}, {name: 'Someone Somewhere', guid: '123'}, {name: 'Mary White', guid: '123'}, {name: 'John Black', guid: '123'}];
            // me._state.validSignatures = [{name: 'Hammish Mitchell', guid: '123', date: '18/05/2017'}, {name: 'Someone Somewhere', guid: '345', date: '18/05/2017'}];
            // me._state.invalidSignatures = [{name: 'Mary White', guid: '111', date: '18/05/2017'}, {name: 'John Black', guid: '456', date: '18/05/2017'}];

            this.cntRequestedSign.html(this.templateRequested({signatures: me._state.requestedSignatures, header: this.strRequested}));
            this.cntValidSign.html(this.templateValid({signatures: me._state.validSignatures, header: this.strValid}));
            this.cntInvalidSign.html(this.templateValid({signatures: me._state.invalidSignatures, header: this.strInvalid}));

            this.$linksSign = $('.signature-sign-link', this.$el);
            var width = this.$linksSign.width();
            $('.signature-sign-name', this.cntRequestedSign).css('max-width', 170-width);

            this.$linksView = $('.signature-view-link', this.$el);
            width = this.$linksView.width();
            $('.signature-sign-name', this.cntValidSign).css('max-width', 170-width);
            $('.signature-sign-name', this.cntInvalidSign).css('max-width', 170-width);

            me.disableEditing(me._state.validSignatures.length>0 || me._state.invalidSignatures.length>0);
        },

        onSign: function(event) {
             var target = $(event.currentTarget);
             if (target.hasClass('disabled')) return;

            Common.NotificationCenter.trigger('protect:sign', target.attr('data-value'));
        },

        onViewSignature: function(event) {
            var target = $(event.currentTarget);
            if (target.hasClass('disabled')) return;

            this.api.asc_ViewCertificate(target.attr('data-value'));
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
                    target  : DE.getController('RightMenu').getView('RightMenu').btnSignature.btnEl,
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
                                // me.api.editSignedDoc();
                                // me.disableEditing(false); // call in the asc_onUpdateSignatures event callback.
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

                var rightMenuController = DE.getController('RightMenu');
                if (disable && rightMenuController.rightmenu.GetActivePane() !== 'id-signature-settings')
                    rightMenuController.rightmenu.clearSelection();
                rightMenuController.SetDisabled(disable, false, true);
                DE.getController('Toolbar').DisableToolbar(disable, disable);
                DE.getController('Statusbar').getView('Statusbar').SetDisabled(disable);
                DE.getController('Common.Controllers.ReviewChanges').SetDisabled(disable);
                DE.getController('DocumentHolder').getView().SetDisabled(disable);

                var leftMenu = DE.getController('LeftMenu').leftMenu;
                leftMenu.btnComments.setDisabled(disable);
                var comments = DE.getController('Common.Controllers.Comments');
                if (comments)
                    comments.setPreviewMode(disable);
            }
        },

        strSignature: 'Signature',
        strRequested: 'Requested signatures',
        strValid: 'Valid signatures',
        strInvalid: 'Invalid signatures',
        strSign: 'Sign',
        strView: 'View',
        txtSigned: 'Valid signatures has been added to the document. The document is protected from editing.',
        txtSignedInvalid: 'Some of the digital signatures in document are invalid or could not be verified. The document is protected from editing.',
        txtRequestedSignatures: 'This document needs to be signed.',
        txtContinueEditing: 'Edit anyway',
        notcriticalErrorTitle: 'Warning',
        txtEditWarning: 'Editing will remove the signatures from the document.<br>Are you sure you want to continue?'

    }, DE.Views.SignatureSettings || {}));
});