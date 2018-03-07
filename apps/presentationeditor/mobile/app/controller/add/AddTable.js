/*
 *
 * (c) Copyright Ascensio System Limited 2010-2018
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

/**
 *  AddTable.js
 *  Presentation Editor
 *
 *  Created by Julia Radzhabova on 11/30/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */


define([
    'core',
    'presentationeditor/mobile/app/view/add/AddTable'
], function (core) {
    'use strict';

    PE.Controllers.AddTable = Backbone.Controller.extend(_.extend((function() {
        var _styles = [],
            _initDefaultStyles = false;

        return {
            models: [],
            collections: [],
            views: [
                'AddTable'
            ],

            initialize: function () {
                Common.NotificationCenter.on('addcontainer:show', _.bind(this.initEvents, this));
            },

            setApi: function (api) {
                var me = this;
                me.api = api;

                me.api.asc_registerCallback('asc_onInitTableTemplates', _.bind(me.onApiInitTemplates, me));
            },

            onLaunch: function () {
                this.createView('AddTable').render();
            },

            initEvents: function () {
                var me = this;

                if (!_initDefaultStyles) {
                    _initDefaultStyles = true;
                    _styles = [];

                    me.api.asc_GetDefaultTableStyles && me.api.asc_GetDefaultTableStyles();
                }

                $('#add-table li').single('click',  _.buffered(me.onStyleClick, 100, me));
            },

            onStyleClick: function (e) {
                var me = this,
                    $target = $(e.currentTarget),
                    type = $target.data('type');

                if ($('.modal.modal-in').length > 0) {
                    return;
                }

                PE.getController('AddContainer').hideModal();

                if ($target) {
                    var picker;
                    var modal = uiApp.modal({
                        title: me.textTableSize,
                        text: '',
                        afterText:
                        '<div class="content-block">' +
                            '<div class="row no-gutter" style="text-align: center;">' +
                                '<div class="col-50">' + me.textColumns + '</div>' +
                                '<div class="col-50">' + me.textRows + '</div>' +
                            '</div>' +
                        '<div id="picker-table-size"></div>' +
                        '</div>',
                        buttons: [
                            {
                                text: me.textCancel
                            },
                            {
                                text: 'OK',
                                bold: true,
                                onClick: function () {
                                    var size = picker.value;

                                    if (me.api) {
                                        me.api.put_Table(parseInt(size[0]), parseInt(size[1]));

                                        var properties = new Asc.CTableProp();
                                        properties.put_TableStyle(type);

                                        me.api.tblApply(properties);
                                    }
                                }
                            }
                        ]
                    });

                    picker = uiApp.picker({
                        container: '#picker-table-size',
                        toolbar: false,
                        rotateEffect: true,
                        value: [3, 3],
                        cols: [{
                            textAlign: 'center',
                            width: '100%',
                            values: [1,2,3,4,5,6,7,8,9,10]
                        }, {
                            textAlign: 'center',
                            width: '100%',
                            values: [1,2,3,4,5,6,7,8,9,10]
                        }]
                    });

                    // Vertical align
                    $$(modal).css({
                        marginTop: - Math.round($$(modal).outerHeight() / 2) + 'px'
                    });
                }
            },

            // Public

            getStyles: function () {
                return _styles;
            },

            // API handlers

            onApiInitTemplates: function(templates){
                if (_styles.length < 1) {
                    _.each(templates, function(template){
                        _styles.push({
                            imageUrl    : template.get_Image(),
                            templateId  : template.get_Id()
                        });
                    });

                    this.getView('AddTable').render();
                }

                Common.SharedSettings.set('tablestyles', _styles);
                Common.NotificationCenter.trigger('tablestyles:load', _styles);
            },

            textTableSize: 'Table Size',
            textColumns: 'Columns',
            textRows: 'Rows',
            textCancel: 'Cancel'
        }
    })(), PE.Controllers.AddTable || {}))
});