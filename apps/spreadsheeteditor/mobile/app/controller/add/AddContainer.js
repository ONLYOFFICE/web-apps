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
 *  AddContainer.js
 *  Spreadsheet Editor
 *
 *  Created by Alexander Yuzhin on 12/6/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'jquery',
    'underscore',
    'backbone'
], function (core, $, _, Backbone) {
    'use strict';

    SSE.Controllers.AddContainer = Backbone.Controller.extend(_.extend((function() {
        // private

        var parentButton = null,
            options;

        return {
            models: [],
            collections: [],
            views: [],

            initialize: function() {
                //
            },

            setApi: function(api) {
                this.api = api;
            },

            onLaunch: function() {
                //
            },

            showModal: function(opts) {
                var me = this;

                if ($$('.container-add.modal-in').length > 0) {
                    return;
                }

                uiApp.closeModal();

                var cellinfo = me.api.asc_getCellInfo();
                var iscellmenu, isrowmenu, iscolmenu, isallmenu, ischartmenu, isimagemenu, istextshapemenu, isshapemenu, istextchartmenu,
                    seltype             = cellinfo.asc_getFlags().asc_getSelectionType(),
                    iscelllocked        = cellinfo.asc_getLocked(),
                    isTableLocked       = cellinfo.asc_getLockedTable()===true;

                if ( !iscelllocked ) {
                    options = opts;

                    if ( !options ) {
                        switch (seltype) {
                            case Asc.c_oAscSelectionType.RangeCells:
                            case Asc.c_oAscSelectionType.RangeRow:
                            case Asc.c_oAscSelectionType.RangeCol:
                            case Asc.c_oAscSelectionType.RangeMax: break;
                            case Asc.c_oAscSelectionType.RangeImage:
                            case Asc.c_oAscSelectionType.RangeShape:
                            case Asc.c_oAscSelectionType.RangeChart:
                            case Asc.c_oAscSelectionType.RangeChartText:
                            case Asc.c_oAscSelectionType.RangeShapeText:
                                options = {panels: ['image','shape']};
                                break;
                        }
                    }

                    parentButton = !opts || !opts.button ? '#toolbar-add' : opts.button;
                    me._showByStack(Common.SharedSettings.get('phone'));
                }

                this.api.asc_closeCellEditor();
                SSE.getController('Toolbar').getView('Toolbar').hideSearch();
            },

            hideModal: function () {
                if (this.picker) {
                    uiApp.closeModal(this.picker);
                }
            },

            _layoutEditorsByStack: function () {
                var me = this,
                    addViews = [];

                // var seltype = this.api.asc_getCellInfo().asc_getFlags().asc_getSelectionType();

                if ( !options )
                    addViews.push({
                        caption: me.textChart,
                        id: 'add-chart',
                        layout: SSE.getController('AddChart').getView('AddChart').rootLayout()
                    });

                if ( !options || options.panel == 'function' ) {
                    view = SSE.getController('AddFunction').getView('AddFunction');
                    addViews.push({
                        caption: me.textFormula,
                        id: 'add-formula',
                        layout: options ? view.rootLayout() : view.layoutPanel()
                    });
                }

                if ( !options || !(_.indexOf(options.panels, 'shape') < 0) )
                    addViews.push({
                        caption: me.textShape,
                        id: 'add-shape',
                        layout:  SSE.getController('AddShape').getView('AddShape').rootLayout()
                    });

                if ( !options )
                    addViews.push({
                        caption: me.textOther,
                        id: 'add-other',
                        layout: SSE.getController('AddOther').getView('AddOther').rootLayout()
                    });

                if ( options && options.panel == 'hyperlink' ) {
                    var view = SSE.getController('AddLink').getView();
                    addViews.push({
                        caption: view.getTitle(),
                        id: 'add-link',
                        layout: view.rootLayout()
                    });
                }

                if ( options && !(_.indexOf(options.panels, 'image')) ) {
                    addViews.push({
                        caption: me.textImage,
                        id: 'add-image',
                        layout: SSE.getController('AddOther').getView('AddOther').childLayout('image')
                    });
                }

                return addViews;
            },

            _showByStack: function(isPhone) {
                var me = this,
                    isAndroid = Framework7.prototype.device.android === true,
                    layoutAdds = me._layoutEditorsByStack();

                if ($$('.container-add.modal-in').length > 0) {
                    return;
                }

                // Navigation bar
                var $layoutNavbar = $(
                    '<div class="navbar">' +
                        '<div data-page="index" class="navbar-inner">' +
                            '<div class="center sliding categories"></div>' +
                            (isPhone ? '<div class="right sliding"><a href="#" class="link icon-only close-popup"><i class="icon icon-expand-down"></i></a></div>' : '') +
                        '</div>' +
                    '</div>'
                );


                if (layoutAdds.length == 1) {
                    $layoutNavbar
                        .find('.center')
                        .removeClass('categories')
                        .html(layoutAdds[0].caption);

                    $layoutPages = $('<div class="pages">' +
                                        layoutAdds[0].layout +
                                    '</div>');
                } else {
                    if (isAndroid) {
                        $layoutNavbar
                            .find('.center')
                            .append('<div class="toolbar tabbar"><div data-page="index" class="toolbar-inner"></div></div>');

                        _.each(layoutAdds, function (layout, index) {
                            $layoutNavbar
                                .find('.toolbar-inner')
                                .append(
                                    '<a href="#' + layout.id + '" class="tab-link ' + (index < 1 ? 'active' : '') + '">' + layout.caption + '</a>'
                                );
                        });
                        $layoutNavbar
                            .find('.toolbar-inner')
                            .append('<span class="tab-link-highlight" style="width: ' + (100 / layoutAdds.length) + '%;"></span>');
                    } else {
                        $layoutNavbar
                            .find('.center')
                            .append('<div class="buttons-row"></div>');

                        _.each(layoutAdds, function (layout, index) {
                            $layoutNavbar
                                .find('.buttons-row')
                                .append(
                                    '<a href="#' + layout.id + '" class="tab-link button ' + (index < 1 ? 'active' : '') + '">' + layout.caption + '</a>'
                                );
                        });
                    }

                    // Content

                    var _arrangePages = _.template(
                        '<% _.each(pages, function(view, index) { %>' +
                            '<div id="<%= view.id %>" class="tab view<% if (index < 1) print(" active"); %>">' +
                                '<div class="pages">' +
                                    '<div class="page no-navbar">' +
                                        '<div class="page-content">' +
                                            '<%= view.layout %>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '<% }); %>');

                    var $layoutPages = $('<div class="pages">' +
                                            '<div class="page" data-page="index">' +
                                                '<div class="page-content">' +
                                                    '<div class="tabs-animated-wrap">' +
                                                        '<div class="tabs">' +
                                                            _arrangePages({pages: layoutAdds}) +
                                                        '</div>' +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>');
                }

                if (isPhone) {
                    me.picker = $$(uiApp.popup(
                        '<div class="popup settings container-add">' +
                            '<div class="view add-root-view navbar-through">' +
                                $layoutNavbar.prop('outerHTML') +
                                $layoutPages.prop('outerHTML') +
                            '</div>' +
                        '</div>'
                    ))
                } else {
                    me.picker = uiApp.popover(
                        '<div class="popover settings container-add">' +
                            '<div class="popover-angle"></div>' +
                            '<div class="popover-inner">' +
                                '<div class="content-block">' +
                                    '<div class="view popover-view add-root-view navbar-through">' +
                                        $layoutNavbar.prop('outerHTML') +
                                        $layoutPages.prop('outerHTML') +
                                    '</div>' +
                                '</div>' +
                            '</div>',
                        $$(parentButton)
                    );

                    // Prevent hide overlay. Conflict popover and modals.
                    var $overlay = $('.modal-overlay');

                    $$(me.picker).on('opened', function () {
                        $overlay.on('removeClass', function () {
                            if (!$overlay.hasClass('modal-overlay-visible')) {
                                $overlay.addClass('modal-overlay-visible')
                            }
                        });
                    }).on('close', function () {
                        $overlay.off('removeClass');
                        $overlay.removeClass('modal-overlay-visible')
                    });
                }

                if (isAndroid) {
                    $$('.view.add-root-view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
                    $$('.view.add-root-view .navbar').prependTo('.view.add-root-view > .pages > .page');
                }

                me.rootView = uiApp.addView('.add-root-view', {
                    dynamicNavbar: true,
                    domCache: true
                });

                Common.NotificationCenter.trigger('addcontainer:show', options);
            },

            textChart: 'Chart',
            textFormula: 'Function',
            textShape: 'Shape',
            textImage: 'Image',
            textOther: 'Other'
        }
    })(), SSE.Controllers.AddContainer || {}))
});