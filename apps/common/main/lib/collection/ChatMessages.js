/**
 *    ChatMessages.js
 *
 *    Collection
 *
 *    Created by Maxim Kadushkin on 01 March 2014
 *    Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'backbone',
    'common/main/lib/model/ChatMessage'
], function(Backbone){
    'use strict';

    !Common.Collections && (Common.Collections = {});

    Common.Collections.ChatMessages = Backbone.Collection.extend({
        model: Common.Models.ChatMessage
    });
});
