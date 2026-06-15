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
 *    Users.js
 *
 *    Collection
 *
 *    Created on 27 February 2014
 *
 */

define([
    'backbone',
    'common/main/lib/model/User'
], function(Backbone){
    'use strict';

    Common.Collections = Common.Collections || {};

    Common.Collections.Users = Backbone.Collection.extend({
        model: Common.Models.User,

        getOnlineCount: function() {
            var count = 0;
            this.each(function(user){
                user.get('online') && ++count;
            });

            return count;
        },

        getEditingCount: function() {
            return this.filter(function(item){return item.get('online') && !item.get('view')}).length;
        },

        getVisibleEditingCount: function() {
            return this.filter(function(item){return item.get('online') && !item.get('view') && !item.get('hidden')}).length;
        },

        getEditingOriginalCount: function() {
            return this.chain().filter(function(item){return item.get('online') && !item.get('view')}).groupBy(function(item) { return item.get('idOriginal'); }).size().value();
        },

        getVisibleEditingOriginalCount: function() {
            return this.chain().filter(function(item){return item.get('online') && !item.get('view') && !item.get('hidden')}).groupBy(function(item) { return item.get('idOriginal'); }).size().value();
        },

        findUser: function(id) {
            return this.findWhere({id: id});
        },

        findOriginalUser: function(id) {
            return this.findWhere({idOriginal: id});
        },

        findOriginalUsers: function(id) {
            return this.where({idOriginal: id});
        }
    });

    Common.Collections.HistoryUsers = Backbone.Collection.extend({
        model: Common.Models.User,

        findUser: function(id) {
            return this.findWhere({id: id});
        }
    });
});
