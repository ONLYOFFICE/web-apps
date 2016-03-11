/**
 *  TableTemplate.js
 *
 *  Created by Alexander Yuzhin on 4/7/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'backbone'
], function(Backbone){ 'use strict';

    SSE.Models = SSE.Models || {};

    SSE.Models.TableTemplate = Backbone.Model.extend({
        defaults: function() {
            return {
                id          : Common.UI.getId(),
                name        : null,
                caption     : null,
                type        : null,
                imageUrl    : null
            }
        }
    });
});