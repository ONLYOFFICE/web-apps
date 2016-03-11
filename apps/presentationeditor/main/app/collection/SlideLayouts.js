/**
 *  SlideLayouts.js
 *
 *  Created by Alexander Yuzhin on 4/18/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'backbone',
    'presentationeditor/main/app/model/SlideLayout'
], function(Backbone){ 'use strict';

    PE.Collections = PE.Collections || {};

    PE.Collections.SlideLayouts = Backbone.Collection.extend({
        model: PE.Models.SlideLayout
    });
});
