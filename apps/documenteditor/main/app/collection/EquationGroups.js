/**
 *  EquationGroups.js
 *
 *  Created by Alexey Musinov on 29/10/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'backbone',
    'documenteditor/main/app/model/EquationGroup'
], function(Backbone){ 'use strict';
    if (Common === undefined)
        var Common = {};

    Common.Collections = Common.Collections || {};

    DE.Collections.EquationGroups = Backbone.Collection.extend({
        model: DE.Models.EquationGroup
    });
});
