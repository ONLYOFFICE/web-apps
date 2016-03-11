
define([
    'backbone'
], function(Backbone){
    'use strict';

    PE.Models = PE.Models||{};

    PE.Models.Pages = Backbone.Model.extend({
        defaults: {
            current: 0,
            count: 0
        }
    });
});
