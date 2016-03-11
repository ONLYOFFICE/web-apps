/**
 *    User.js
 *
 *    Model
 *
 *    Created by Maxim Kadushkin on 27 February 2014
 *    Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'backbone'
], function(Backbone){
    'use strict';

    Common.Models = Common.Models || {};

    Common.Models.User = Backbone.Model.extend({
        defaults: {
            id          : undefined,
            username    : 'Guest',
            color       : '#fff',
            colorval    : null,
            online      : false,
            view        : false
        }
    });
});
