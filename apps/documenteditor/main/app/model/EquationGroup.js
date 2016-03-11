/**
 *  EquationGroup.js
 *
 *  Created by Alexey Musinov on 29/10/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */


define([
    'backbone'
], function(Backbone){ 'use strict';

    DE.Models = DE.Models || {};

    DE.Models.EquationModel = Backbone.Model.extend({
        defaults: function() {
            return {
                id          : Common.UI.getId(),
                data        : null,
                width       : 0,
                height      : 0,
                posX        : 0,
                posY        : 0
            }
        }
    });

    DE.Models.EquationGroup = Backbone.Model.extend({
        defaults: function() {
            return {
                id          : Common.UI.getId(),
                groupName   : null,
                groupId     : null,
                groupStore  : null
            }
        }
    });
});
