/**
 * Created by Julia.Radzhabova on 09.07.15
 * Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 */

if (Common === undefined)
    var Common = {};

Common.Collections = Common.Collections || {};

define([
    'backbone'
], function(Backbone){
    'use strict';

    Common.Collections.TextArt = Backbone.Collection.extend({
        model: Backbone.Model.extend({
            defaults: function() {
                return {
                    id: Common.UI.getId(),
                    imageUrl: null,
                    data: null
                }
            }
        })
    });
});

