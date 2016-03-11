/**
 *  TableTemplates.js
 *
 *  Created by Alexander Yuzhin on 4/7/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'backbone',
    'spreadsheeteditor/main/app/model/TableTemplate'
], function(Backbone){ 'use strict';
    if (Common === undefined)
        var Common = {};

    Common.Collections = Common.Collections || {};

    SSE.Collections.TableTemplates = Backbone.Collection.extend({
        model: SSE.Models.TableTemplate
    });
});
