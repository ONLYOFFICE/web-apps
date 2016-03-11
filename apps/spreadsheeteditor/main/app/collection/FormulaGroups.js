/**
 *  FormulaGroups.js
 *
 *  Created by Alexey.Musinov on 11/04/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'backbone',
    'spreadsheeteditor/main/app/model/Formula'
], function(Backbone) {
    'use strict';

    SSE.Collections = SSE.Collections || {};
    SSE.Collections.FormulaGroups = Backbone.Collection.extend({
        model: SSE.Models.FormulaGroup
    });
});
