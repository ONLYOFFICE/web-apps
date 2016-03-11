/**
 *  Fonts.js
 *
 *  Created by Alexander Yuzhin on 2/11/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

Common.Collections = Common.Collections || {};

define([
    'backbone',
    'common/main/lib/model/Font'
], function(Backbone){ 'use strict';
    Common.Collections.Fonts = Backbone.Collection.extend({
        model: Common.Models.Font,
        comparator: function(item1, item2) {
            var n1 = item1.get('name').toLowerCase(),
                n2 = item2.get('name').toLowerCase();
            if (n1==n2) return 0;
            return (n1<n2) ? -1 : 1;
        }
    });
});
