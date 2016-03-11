/**
 *  NotificationCenter.js
 *
 *  A pub-sub object that can be used to decouple various parts
 *  of an application through event-driven architecture.
 *
 *  Created by Alexander Yuzhin on 1/21/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */


/**
 *  Using:
 *
 *  Common.NotificationCenter.on("foo", function(){
 *      alert("bar");
 *  });
 *
 *  Common.NotificationCenter.trigger("foo"); // => alert box "bar"
 *
 */

if (Common === undefined)
    var Common = {};

define([
    'backbone'
], function (Backbone) {
    'use strict';

    var NotificationCenter = function(){};

    // Copy the basic Backbone.Events on to the event aggregator
    _.extend(NotificationCenter.prototype, Backbone.Events);

    if(typeof Common.NotificationCenter == 'undefined') {
        // Method to create new Common.NotificationCenter class
        NotificationCenter.extend = Backbone.Model.extend;

        Common.NotificationCenter = new NotificationCenter();
    }
    else {
        throw ('Native Common.NotificationCenter instance already defined.')
    }
});