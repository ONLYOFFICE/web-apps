/**
 *  ShapeGroup.js
 *
 *  Created by Alexander Yuzhin on 2/10/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */


define([
    'backbone'
], function(Backbone){ 'use strict';

    PE.Models = PE.Models || {};

    PE.Models.ShapeModel = Backbone.Model.extend({
        defaults: function() {
            return {
                id: Common.UI.getId(),
                imageUrl: null,
                data: null
            }
        }
    });

    PE.Models.ShapeGroup = Backbone.Model.extend({
        defaults: function() {
            return {
                id: Common.UI.getId(),
                groupName: null,
                groupId: null,
                groupStore: null
            }
        }
    });
});
