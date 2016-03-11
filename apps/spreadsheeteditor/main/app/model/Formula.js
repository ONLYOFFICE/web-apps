/**
 *  Formula.js
 *
 *  Models for formulas.
 *
 *  Created by Alexey.Musinov on 11/04/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'backbone'
], function(Backbone){
    'use strict';

    SSE.Models = SSE.Models || {};

    SSE.Models.FormulaModel = Backbone.Model.extend({
        defaults: function () {
            return {
                id              : Common.UI.getId(),
                index           : 0,
                group           : null,
                name            : null,
                args            : null
            }
        }
    });

    SSE.Models.FormulaGroup = Backbone.Model.extend({
        defaults: function () {
            return {
                id              : Common.UI.getId(),
                index           : 0,
                name            : null,
                store           : null,
                functions       : []
            }
        }
    });
});

