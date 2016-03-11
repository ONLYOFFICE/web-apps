
define([
    'underscore',
    'backbone'
], function(_, Backbone){
    'use strict';

    DE.Models = DE.Models||{};

    DE.Models.Pages = Backbone.Model.extend({
        defaults: {
            current: 0,
            count: 0
        }
    });
});
