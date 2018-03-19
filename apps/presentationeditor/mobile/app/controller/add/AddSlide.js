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
 *  AddSlide.js
 *  Presentation Editor
 *
 *  Created by Julia Radzhabova on 12/06/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */


define([
    'core',
    'presentationeditor/mobile/app/view/add/AddSlide'
], function (core) {
    'use strict';

    PE.Controllers.AddSlide = Backbone.Controller.extend(_.extend((function() {
        var _layouts = [];

        return {
            models: [],
            collections: [],
            views: [
                'AddSlide'
            ],

            initialize: function () {
                Common.NotificationCenter.on('addcontainer:show', _.bind(this.initEvents, this));
            },

            setApi: function (api) {
                var me = this;
                me.api = api;
                me.api.asc_registerCallback('asc_onUpdateLayout', _.bind(me.onUpdateLayout, me));
            },

            onLaunch: function () {
                this.createView('AddSlide').render();
            },

            initEvents: function () {
                var me = this;
                me.getView('AddSlide').updateLayouts(_layouts);
                $('#add-slide .slide-layout li').single('click',  _.buffered(me.onLayoutClick, 100, me));
            },

            onLayoutClick: function (e) {
                var me = this,
                    $target = $(e.currentTarget),
                    type = $target.data('type');

                me.api.AddSlide(type);

                PE.getController('AddContainer').hideModal();
            },

            // Public

            getLayouts: function () {
                return _layouts;
            },

            // API handlers

            onUpdateLayout: function(layouts){
                var me = this;
                _layouts = [];
                if (!_.isEmpty(layouts)){
                    _.each(layouts, function(layout){
                        var name = layout.get_Name();
                        _layouts.push({
                            imageUrl    : layout.get_Image(),
                            title       : (name !== '') ? name : PE.getController('Main').layoutNames[layout.getType()],
                            itemWidth   : layout.get_Width(),
                            itemHeight  : layout.get_Height(),
                            idx         : layout.getIndex()
                        });
                    });
                }

                Common.SharedSettings.set('slidelayouts', _layouts);
                Common.NotificationCenter.trigger('slidelayouts:load', _layouts);

                this.getView('AddSlide').updateLayouts(_layouts);
                $('#add-slide .slide-layout li').single('click',  _.buffered(me.onLayoutClick, 100, me));
            }
        }
    })(), PE.Controllers.AddSlide || {}))
});