/**
 *    ChatMessage.js
 *
 *    Model
 *
 *    Created by Maxim Kadushkin on 01 March 2014
 *    Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'backbone'
], function(Backbone){
    'use strict';

    Common.Models = Common.Models || {};

    Common.Models.ChatMessage = Backbone.Model.extend({
        defaults: {
            type        : 0,
            userid      : null,
            username    : '',
            message     : ''
        }
    });
});
