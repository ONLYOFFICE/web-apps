/**
 *  SlideLayout.js
 *
 *  Created by Alexander Yuzhin on 4/18/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'backbone'
], function(Backbone){ 'use strict';

    PE.Models = PE.Models||{};

    PE.Models.SlideLayout = Backbone.Model.extend({
        defaults: function() {
            return {
                id      : Common.UI.getId(),
                imageUrl: null,
                title   : null,
                data    : null
            }
        }
    });
});
