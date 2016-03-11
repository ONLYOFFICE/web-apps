/**
 *  DocumentHolder.js
 *
 *  DocumentHolder controller
 *
 *  Created by Alexander Yuzhin on 1/15/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

var c_paragraphLinerule = {
    LINERULE_LEAST: 0,
    LINERULE_AUTO: 1,
    LINERULE_EXACT: 2
};

var c_pageNumPosition = {
    PAGE_NUM_POSITION_TOP: 0x01,
    PAGE_NUM_POSITION_BOTTOM: 0x02,
    PAGE_NUM_POSITION_RIGHT: 0,
    PAGE_NUM_POSITION_LEFT: 1,
    PAGE_NUM_POSITION_CENTER: 2
};

var c_tableWrap = {
    TABLE_WRAP_NONE: 0,
    TABLE_WRAP_PARALLEL: 1
};

var c_tableAlign = {
    TABLE_ALIGN_LEFT: 0,
    TABLE_ALIGN_CENTER: 1,
    TABLE_ALIGN_RIGHT: 2
};

var c_tableBorder = {
    BORDER_VERTICAL_LEFT: 0,
    BORDER_HORIZONTAL_TOP: 1,
    BORDER_VERTICAL_RIGHT: 2,
    BORDER_HORIZONTAL_BOTTOM: 3,
    BORDER_VERTICAL_CENTER: 4,
    BORDER_HORIZONTAL_CENTER: 5,
    BORDER_INNER: 6,
    BORDER_OUTER: 7,
    BORDER_ALL: 8,
    BORDER_NONE: 9,
    BORDER_ALL_TABLE: 10, // table border and all cell borders
    BORDER_NONE_TABLE: 11, // table border and no cell borders
    BORDER_INNER_TABLE: 12, // table border and inner cell borders
    BORDER_OUTER_TABLE: 13 // table border and outer cell borders
};

define([
    'core',
    'documenteditor/main/app/view/DocumentHolder'
], function () {
    'use strict';

    DE.Controllers.DocumentHolder = Backbone.Controller.extend({
        models: [],
        collections: [],
        views: [
            'DocumentHolder'
        ],

        initialize: function() {
            //
        },

        onLaunch: function() {
            this.documentHolder = this.createView('DocumentHolder').render();
            this.documentHolder.el.tabIndex = -1;
        },

        setApi: function(api) {
            this.api = api;
        },

        createDelayedElements: function() {
            var diagramEditor = this.getApplication().getController('Common.Controllers.ExternalDiagramEditor').getView('Common.Views.ExternalDiagramEditor');
            if (diagramEditor) {
                diagramEditor.on('internalmessage', _.bind(function(cmp, message) {
                    var command = message.data.command;
                    var data = message.data.data;
                    if (this.api) {
                        (diagramEditor.isEditMode())
                            ? this.api.asc_editChartDrawingObject(data)
                            : this.api.asc_addChartDrawingObject(data);
                    }
                }, this));
                diagramEditor.on('hide', _.bind(function(cmp, message) {
                    this.documentHolder.fireEvent('editcomplete', this.documentHolder);
                    if (this.api) {
                        this.api.asc_onCloseChartFrame();
                        this.api.asc_enableKeyEvents(true);
                    }
                }, this));
            }

            var mergeEditor = this.getApplication().getController('Common.Controllers.ExternalMergeEditor').getView('Common.Views.ExternalMergeEditor');
            if (mergeEditor) {
                mergeEditor.on('internalmessage', _.bind(function(cmp, message) {
                    var command = message.data.command;
                    var data = message.data.data;
                    if (this.api)
                        this.api.asc_setMailMergeData(data);
                }, this));
                mergeEditor.on('hide', _.bind(function(cmp, message) {
                    this.documentHolder.fireEvent('editcomplete', this.documentHolder);
                    if (this.api) {
                        this.api.asc_enableKeyEvents(true);
                    }
                }, this));
            }
        }
    });
});