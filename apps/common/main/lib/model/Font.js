/**
 *  Font.js
 *
 *  Created by Alexander Yuzhin on 2/11/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

Common.Models = Common.Models || {};

define([
    'backbone'
], function(Backbone){ 'use strict';

    Common.Models.Font = Backbone.Model.extend({
        defaults: function() {
            return {
                id      : Common.UI.getId(),
                name    : null,
                cloneid : null,
                imgidx  : 0,
                type    : 0
            }
        }
    });
});
