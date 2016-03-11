/**
 *    Users.js
 *
 *    Collection
 *
 *    Created by Maxim Kadushkin on 27 February 2014
 *    Copyright (c) 2014 Ascensio System SIA. All rights reserved.
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
                user.online && count++;
            });

            return count;
        },

        findUser: function(id) {
            return this.find(
                function(model){
                    return model.get('id') == id;
                });
        }
    });

    Common.Collections.HistoryUsers = Backbone.Collection.extend({
        model: Common.Models.User,

        findUser: function(id) {
            return this.find(
                function(model){
                    return model.get('id') == id;
                });
        }
    });
});
