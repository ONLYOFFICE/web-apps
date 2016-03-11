/**
 *  ReviewChanges.js
 *
 *  Created by Julia.Radzhabova on 05.08.15
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

Common.Collections = Common.Collections || {};

define([
    'underscore',
    'backbone',
    'common/main/lib/model/ReviewChange'
], function(_, Backbone){
    'use strict';

    Common.Collections.ReviewChanges = Backbone.Collection.extend({
        model: Common.Models.ReviewChange
    });
});
