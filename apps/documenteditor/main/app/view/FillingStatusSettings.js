/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/**
 *  FillingStatusSettings.js
 *
 *  Created on 10.03.2026
 *
 */

define([
    'text!documenteditor/main/app/template/FillingStatusSettings.template',
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/Button'
], function (menuTemplate, $, _, Backbone) {
    'use strict';

    DE.Views.FillingStatusSettings = Backbone.View.extend(_.extend({
        el: '#id-filling-status-settings',

        // Compile our stats template
        template: _.template(menuTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        options: {
            alias: 'FillingStatusSettings'
        },

        initialize: function () {
            this._initSettings = true;
            this._state = {};
            this._locked = false;

            this.render();
        },

        render: function () {
            const el = this.$el || $(this.el);
            el.html(this.template({
                scope: this
            }));
        },

        createDelayedElements: function() {
            this._initSettings = false;

            const me = this;
            this.rolesCollection = new Backbone.Collection();
            this.rolesCollection.on('reset', function(newCollection, details) {
                me._renderRolesList();
            }, this);
            this.updateRoles();
        },

        setApi: function(api) {
            this.api = api;
            return this;
        },

        ChangeSettings: function(props) {
            if (this._initSettings) {
                this.createDelayedElements();
            }
        },

        setLocked: function (locked) {
            this._locked = locked;
        },

        setMode: function(mode) {
            this.mode = mode;
        },

        disableControls: function(disable) {

        },

        setRoles: function(roles) {
            if(!this.rolesCollection) return;
            
            const me = this;
            let needFindActive = true;
            const resultArray = (roles).map(function(role, index) {
                role = role.asc_getSettings();
                let color = role.asc_getColor();
                color && (color = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()));

                const isFilled = role.asc_getFilled();
                let date = isFilled ? role.asc_getDate() : null;
                date && (date = new Date(date));

                const item = {
                    name: role.asc_getName(),
                    color: color,
                    user: {
                        id: isFilled ? role.asc_getUserId() : null,
                        name: isFilled ? role.asc_getUserName() : null
                    },
                    date: date ? me.dateToLocaleTimeString(date) : null,
                    status: isFilled ? 'done' : 'wait'  //'done' | 'active' | 'wait'
                };
                
                if(needFindActive && item.status == 'wait') {
                    item.status = 'active';
                    needFindActive = false;

                    // If the user can fill form, display their name in the active role
                    const oForm = me.api.asc_GetOForm();
                    const canFillRole = me.mode && me.mode.user.roles[0] && oForm.asc_canFillRole(me.mode.user.roles[0]);
                    if(canFillRole) {
                        item.user.id = me.mode.user.id;
                        item.user.name = me.mode.user.name;
                    }
                }
                return item;
            });

            this.rolesCollection.reset(resultArray);
        },

        updateRoles: function() {
            if(!this.api && this._initSettings) return;
            const oForm = this.api.asc_GetOForm();
            this.setRoles(oForm ? oForm.asc_getAllRoles() : []);
        },

        dateToLocaleTimeString: function (date) {
            function format(date) {
                var strTime,
                    hours = date.getHours(),
                    minutes = date.getMinutes(),
                    ampm = hours >= 12 ? 'pm' : 'am';

                hours = hours % 12;
                hours = hours ? hours : 12; // the hour '0' should be '12'
                minutes = minutes < 10 ? '0'+minutes : minutes;
                strTime = hours + ':' + minutes + ' ' + ampm;

                return strTime;
            }

            var lang = (this.mode ? this.mode.lang || 'en' : 'en').replace('_', '-').toLowerCase();
            try {
                if ( lang == 'ar-SA'.toLowerCase() ) lang = lang + '-u-nu-latn-ca-gregory';
                return date.toLocaleString(lang, {dateStyle: 'short', timeStyle: 'short'});
            } catch (e) {
                lang = 'en';
                return date.toLocaleString(lang, {dateStyle: 'short', timeStyle: 'short'});
            }

            // MM/dd/yyyy hh:mm AM
            return (date.getMonth() + 1) + '/' + (date.getDate()) + '/' + date.getFullYear() + ' ' + format(date);
        },

        _renderRolesList: function() {
            const me = this;
            const $list = this.$el.find('#id-filling-status-settings-roles-list');
            $list.empty();

            let isAllDone = true;
            this.rolesCollection.each(function(role, index) {
                const $item = $(_.template(
                    '<div class="progress-item <%= item.status %>">' +
                        '<div class="progress-item-left">' +
                            '<div class="progress-item-number"><%= index + 1 %></div>' +
                            '<div class="progress-item-dashes"></div>' +
                        '</div>' +
                        '<div class="progress-item-content">' +
                            '<div class="progress-item-header">' +
                                '<div class="progress-item-label"><%= item.name %></div>' +
                                '<% if (item.status == "done") { %>' +
                                    '<div class="progress-item-check"></div>' +
                                '<% } %>' +
                            '</div>' +
                            '<div class="progress-item-name"><%= item.user.name %></div>' +
                            '<% if (item.status == "done") { %>' +
                                '<div class="progress-item-footer">' +
                                    '<div class="progress-item-description"><%= scope.txtDocumentIsSigned %></div>' +
                                    '<% if (item.date) { %>' +
                                        '<div class="progress-item-date"><%= item.date %></div>' +
                                    '<% } %>' +
                                '</div>' +
                            '<% } %>' +
                        '</div>' +
                    '</div>'
                )({ scope: me, item: role.toJSON(), index: index} ));
                $list.append($item);
                
                (role.get('status') != 'done') && (isAllDone = false);
            });
            
            const $completeStep = $(_.template(
                '<div class="progress-item complete <%= isAllDone ? "all-done" : "" %>">' + 
                    '<div class="progress-item-left">' + 
                        '<div class="progress-item-number">' + 
                            '<div class="progress-item-check"></div>' + 
                        '</div>' + 
                    '</div>' + 
                    '<div class="progress-item-content">' + 
                        '<div class="progress-item-header">' + 
                            '<div class="progress-item-label"><%= scope.txtComplete %></div>' + 
                        '</div>' + 
                    '</div>' + 
                '</div>'
            )({ scope: this, isAllDone: isAllDone }));
            $list.append($completeStep);
        },

        txtFillingStatus: 'Filling status',
        txtDocumentIsSigned: 'Document is signed',
        txtComplete: 'Complete'

    }, DE.Views.FillingStatusSettings || {}));
});