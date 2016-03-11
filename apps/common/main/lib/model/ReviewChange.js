/**
 *  ReviewChange.js
 *
 *  Created by Julia.Radzhabova on 05.08.15
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

Common.Models = Common.Models || {};

define([
    'underscore',
    'backbone',
    'common/main/lib/component/BaseView'
], function(_, Backbone){
    'use strict';

    Common.Models.ReviewChange = Backbone.Model.extend({
        defaults: {
            uid                 : 0,                        //  asc
            userid              : 0,
            username            : 'Guest',
            usercolor           : '#ee3525',
            date                : undefined,
            changetext          : '',
            lock                : false,
            lockuser            : '',
            type                : 0,
            changedata          : null,

            id                  : Common.UI.getId(),        //  internal
            scope               : null
        }
    });
});
