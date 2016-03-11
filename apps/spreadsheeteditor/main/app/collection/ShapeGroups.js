/**
 *  ShapeGroups.js
 *
 *  Created by Alexander Yuzhin on 2/10/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'backbone',
    'spreadsheeteditor/main/app/model/ShapeGroup'
], function(Backbone){ 'use strict';
    if (Common === undefined)
        var Common = {};

    Common.Collections = Common.Collections || {};

    SSE.Collections.ShapeGroups = Backbone.Collection.extend({
        model: SSE.Models.ShapeGroup
    });
});
