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
    'common/main/lib/component/Button',
    'common/main/lib/view/SignDialog'
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
            var me = this;

            this._initSettings = true;

            this._state = {
                DisabledControls: false,
                validSignatures: undefined,
                invalidSignatures: undefined
            };
            this._locked = false;
            this.lockedControls = [];

            this._noApply = false;
            this._originalProps = null;

            this.templateValid = _.template([
                '<td class="padding-large <% if (signatures.length<1) { %>hidden<% } %>"">',
                '<table class="<% if (signatures.length<1) { %>hidden<% } %>" style="width:100%">',
                    '<tr><td colspan="2" class="padding-large"><label class="header"><%= header %></label></td></tr>',
                    '<% _.each(signatures, function(item) { %>',
                    '<tr>',
                        '<td><div style="overflow: hidden; max-height: 15px;"><%= Common.Utils.String.htmlEncode(item.name) %></div></td>',
                        '<td rowspan="2" style="padding: 0 5px; vertical-align: top; text-align: right;"><label class="link-solid signature-view-link" data-value="<%= item.guid %>">' + this.strView + '</label></td>',
                    '</tr>',
                    '<tr><td style="padding-bottom: 3px;"><%= Common.Utils.String.htmlEncode(item.date) %></td></tr>',
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

            this.btnAddInvisibleSign = new Common.UI.Button({
                el: this.$el.find('#signature-invisible-sign')
            });
            this.btnAddInvisibleSign.on('click', _.bind(this.addInvisibleSign, this));
            this.lockedControls.push(this.btnAddInvisibleSign);

            this.cntValidSign = $('#signature-valid-sign');
            this.cntInvalidSign = $('#signature-invalid-sign');
        },

        setApi: function(api) {
            this.api = api;
            if (this.api) {
                this.api.asc_registerCallback('asc_onUpdateSignatures',    _.bind(this.onUpdateSignatures, this));
            }
            return this;
        },

        createDelayedControls: function() {
            this._initSettings = false;
        },

        ChangeSettings: function(props) {
            if (this._initSettings)
                this.createDelayedControls();

            if (!this._state.validSignatures || !this._state.invalidSignatures) {
                this.onUpdateSignatures(this.api.asc_getSignatures());
            }

            this.disableControls(this._locked);
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        disableControls: function(disable) {
            if (this._initSettings) return;

            if (this._state.DisabledControls!==disable) {
                this._state.DisabledControls = disable;
                _.each(this.lockedControls, function(item) {
                    item.setDisabled(disable);
                });
                this.$linksSign.toggleClass('disabled', disable);
                this.$linksView.toggleClass('disabled', disable);
            }
        },

        setMode: function(mode) {
            this.mode = mode;
        },

        onUpdateSignatures: function(valid){
            var me = this;
            me._state.validSignatures = [];
            me._state.invalidSignatures = [];

            _.each(valid, function(item, index){
                var sign = {name: item.asc_getSigner1(), guid: item.asc_getId(), date: '18/05/2017'};
                (item.asc_getValid()==0) ? me._state.validSignatures.push(sign) : me._state.invalidSignatures.push(sign);
            });
            this.cntValidSign.html(this.templateValid({signatures: me._state.validSignatures, header: this.strValid}));
            this.cntInvalidSign.html(this.templateValid({signatures: me._state.invalidSignatures, header: this.strInvalid}));
            // this.cntValidSign.html(this.templateValid({signatures: [{name: 'Hammish Mitchell', guid: '123', date: '18/05/2017'}, {name: 'Someone Somewhere', guid: '345', date: '18/05/2017'}], header: this.strValid}));
            // this.cntInvalidSign.html(this.templateValid({signatures: [{name: 'Mary White', guid: '111', date: '18/05/2017'}, {name: 'John Black', guid: '456', date: '18/05/2017'}], header: this.strInvalid}));

            this.$linksView = $('.signature-view-link', this.$el);
            this.$el.on('click', '.signature-view-link', _.bind(this.onViewSignature, this));
        },

        addInvisibleSign: function(btn) {
            var me = this,
                win = new Common.Views.SignDialog({
                    api: me.api,
                    signType: 'invisible',
                    handler: function(dlg, result) {
                        if (result == 'ok') {
                            var props = dlg.getSettings();
                            me.api.asc_Sign(props.certificateId);
                        }
                        me.fireEvent('editcomplete', me);
                    }
                });

            win.show();
        },

        onViewSignature: function(event) {
            var target = $(event.currentTarget);
            if (target.hasClass('disabled')) return;

            this.api.asc_ViewCertificate(target.attr('data-value'));
        },

        strSignature: 'Signature',
        strInvisibleSign: 'Add invisible digital signature',
        strValid: 'Valid signatures',
        strInvalid: 'Invalid signatures',
        strView: 'View'

    }, PE.Views.SignatureSettings || {}));
});