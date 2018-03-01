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
 *  EditContainer.js
 *  Document Editor
 *
 *  Created by Alexander Yuzhin on 9/27/16
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

    DE.Controllers.EditContainer = Backbone.Controller.extend(_.extend((function() {
        // Private
        var _settings = [];

        return {
            models: [],
            collections: [],
            views: [],

            initialize: function() {
                //
            },

            setApi: function(api) {
                this.api = api;
                this.api.asc_registerCallback('asc_onFocusObject',        _.bind(this.onApiFocusObject, this));
            },

            onLaunch: function() {
                //
            },

            showModal: function() {
                var me = this,
                    mainView = DE.getController('Editor').getView('Editor').f7View,
                    isAndroid = Framework7.prototype.device.android === true;

                if ($$('.container-edit.modal-in').length > 0) {
                    // myApp.closeModal('.picker-modal.edit.modal-in');
                    // me.fireEvent('editcontainer:error', [this, 'alreadyOpen']);
                    return;
                }

                uiApp.closeModal();

                me._showByStack(Common.SharedSettings.get('phone'));

                DE.getController('Toolbar').getView('Toolbar').hideSearch();
            },

            hideModal: function () {
                if (this.picker) {
                    uiApp.closeModal(this.picker);
                }
            },

            _emptyEditController: function () {
                var layout =
                    '<div class="content-block inset">' +
                        '<div class="content-block-inner"> ' +
                            '<p>Select object to edit</p>' +
                        '</div>' +
                    '</div>';

                return {
                    caption: this.textSettings,
                    layout: layout
                }
            },

            _layoutEditorsByStack: function () {
                var me = this,
                    editors = [];

                if (_settings.length < 1) {
                    editors.push(me._emptyEditController());
                } else {
                    if (_.contains(_settings, 'text')) {
                        editors.push({
                            caption: me.textText,
                            id: 'edit-text',
                            layout: DE.getController('EditText').getView('EditText').rootLayout()
                        })
                    }
                    if (_.contains(_settings, 'paragraph')) {
                        editors.push({
                            caption: me.textParagraph,
                            id: 'edit-paragraph',
                            layout: DE.getController('EditParagraph').getView('EditParagraph').rootLayout()
                        })
                    }
                    if (_.contains(_settings, 'table')) {
                        editors.push({
                            caption: me.textTable,
                            id: 'edit-table',
                            layout: DE.getController('EditTable').getView('EditTable').rootLayout()
                        })
                    }
                    if (_.contains(_settings, 'shape')) {
                        editors.push({
                            caption: me.textShape,
                            id: 'edit-shape',
                            layout: DE.getController('EditShape').getView('EditShape').rootLayout()
                        })
                    }
                    if (_.contains(_settings, 'image')) {
                        editors.push({
                            caption: me.textImage,
                            id: 'edit-image',
                            layout: DE.getController('EditImage').getView('EditImage').rootLayout()
                        })
                    }
                    if (_.contains(_settings, 'chart')) {
                        editors.push({
                            caption: me.textChart,
                            id: 'edit-chart',
                            layout: DE.getController('EditChart').getView('EditChart').rootLayout()
                        })
                    }
                    if (_.contains(_settings, 'hyperlink')) {
                        editors.push({
                            caption: me.textHyperlink,
                            id: 'edit-link',
                            layout: DE.getController('EditHyperlink').getView('EditHyperlink').rootLayout()
                        })
                    }
                }

                return editors;
            },

            _showByStack: function(isPhone) {
                var me = this,
                    mainView = DE.getController('Editor').getView('Editor').f7View,
                    isAndroid = Framework7.prototype.device.android === true,
                    layoutEditors = me._layoutEditorsByStack();

                if ($$('.container-edit.modal-in').length > 0) {
                    return;
                }

                // Navigation bar
                var $layoutNavbar = $(
                    '<div class="navbar">' +
                        '<div data-page="index" class="navbar-inner">' +
                            '<div class="center sliding categories"></div>' +
                            (isPhone ? '<div class="right sliding"><a href="#" class="link icon-only close-picker"><i class="icon icon-expand-down"></i></a></div>' : '') +
                        '</div>' +
                    '</div>'
                );

                if (layoutEditors.length < 2) {
                    $layoutNavbar
                        .find('.center')
                        .removeClass('categories')
                        .html(layoutEditors[0].caption);
                } else {
                    if (isAndroid) {
                        $layoutNavbar
                            .find('.center')
                            .append('<div class="toolbar tabbar"><div data-page="index" class="toolbar-inner"></div></div>');

                        _.each(layoutEditors, function (layout, index) {
                            $layoutNavbar
                                .find('.toolbar-inner')
                                .append(
                                    '<a href="#' + layout.id + '" class="tab-link ' + (index < 1 ? 'active' : '') + '">' + layout.caption + '</a>'
                                );
                        });
                        $layoutNavbar
                            .find('.toolbar-inner')
                            .append('<span class="tab-link-highlight" style="width: ' + (100/layoutEditors.length) + '%;"></span>');
                    } else {
                        $layoutNavbar
                            .find('.center')
                            .append('<div class="buttons-row"></div>');

                        _.each(layoutEditors, function (layout, index) {
                            $layoutNavbar
                                .find('.buttons-row')
                                .append(
                                    '<a href="#' + layout.id + '" class="tab-link button ' + (index < 1 ? 'active' : '') + '">' + layout.caption + '</a>'
                                );
                        });
                    }
                }


                // Content

                var $layoutPages = $(
                    '<div class="pages">' +
                        '<div class="page" data-page="index">' +
                            '<div class="page-content">' +
                                '<div class="tabs-animated-wrap">' +
                                    '<div class="tabs"></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>'
                );

                _.each(layoutEditors, function (editor, index) {
                    $layoutPages.find('.tabs').append(
                        '<div id="' + editor.id + '" class="tab view ' + (index < 1 ? 'active' : '') + '">' +
                            '<div class="pages">' +
                                '<div class="page no-navbar">' +
                                    '<div class="page-content">' +
                                        editor.layout +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>'
                    );
                });

                if (isPhone) {
                    me.picker = $$(uiApp.pickerModal(
                        '<div class="picker-modal settings container-edit">' +
                            '<div class="view edit-root-view navbar-through">' +
                                $layoutNavbar.prop('outerHTML') +
                                $layoutPages.prop('outerHTML') +
                            '</div>' +
                        '</div>'
                    )).on('opened', function () {
                        if (_.isFunction(me.api.asc_OnShowContextMenu)) {
                            me.api.asc_OnShowContextMenu()
                        }
                    }).on('close', function (e) {
                        mainView.showNavbar();
                    }).on('closed', function () {
                        if (_.isFunction(me.api.asc_OnHideContextMenu)) {
                            me.api.asc_OnHideContextMenu()
                        }
                    });
                    mainView.hideNavbar();
                } else {
                    me.picker = uiApp.popover(
                        '<div class="popover settings container-edit">' +
                            '<div class="popover-angle"></div>' +
                            '<div class="popover-inner">' +
                                '<div class="content-block">' +
                                '<div class="view popover-view edit-root-view navbar-through">' +
                                    $layoutNavbar.prop('outerHTML') +
                                    $layoutPages.prop('outerHTML') +
                                '</div>' +
                            '</div>' +
                        '</div>',
                        $$('#toolbar-edit')
                    );

                    // Prevent hide overlay. Conflict popover and modals.
                    var $overlay = $('.modal-overlay');

                    $$(me.picker).on('opened', function () {
                        $overlay.on('removeClass', function () {
                            if (!$overlay.hasClass('modal-overlay-visible')) {
                                $overlay.addClass('modal-overlay-visible')
                            }
                        });

                        if (_.isFunction(me.api.asc_OnShowContextMenu)) {
                            me.api.asc_OnShowContextMenu()
                        }
                    }).on('close', function () {
                        $overlay.off('removeClass');
                        $overlay.removeClass('modal-overlay-visible')
                    }).on('closed', function () {
                        if (_.isFunction(me.api.asc_OnHideContextMenu)) {
                            me.api.asc_OnHideContextMenu()
                        }
                    });
                }

                $('.container-edit .tab').single('show', function (e) {
                    Common.NotificationCenter.trigger('editcategory:show', e);
                });

                if (isAndroid) {
                    $$('.view.edit-root-view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
                    $$('.view.edit-root-view .navbar').prependTo('.view.edit-root-view > .pages > .page');
                }

                me.rootView = uiApp.addView('.edit-root-view', {
                    dynamicNavbar: true,
                    domCache: true
                });

                Common.NotificationCenter.trigger('editcontainer:show');
            },

            // API handlers

            onApiFocusObject: function (objects) {
                _settings = [];

                // Paragraph  : 0,
                // Table      : 1,
                // Image      : 2,
                // Header     : 3,
                // Shape      : 4,
                // Slide      : 5,
                // Chart      : 6,
                // MailMerge  : 7,
                // TextArt    : 8

                _.each(objects, function(object) {
                    var type = object.get_ObjectType();

                    if (Asc.c_oAscTypeSelectElement.Paragraph == type) {
                        _settings.push('text', 'paragraph');
                    } else if (Asc.c_oAscTypeSelectElement.Table == type) {
                        _settings.push('table');
                    } else if (Asc.c_oAscTypeSelectElement.Image == type) {
                        if (object.get_ObjectValue().get_ChartProperties()) {
                            _settings.push('chart');
                        } else if (object.get_ObjectValue().get_ShapeProperties()) {
                            _settings.push('shape');
                        } else {
                            _settings.push('image');
                        }
                    } else if (Asc.c_oAscTypeSelectElement.Hyperlink == type) {
                        _settings.push('hyperlink');
                    }
                });

                // Exclude shapes if chart exist
                if (_settings.indexOf('chart') > -1) {
                    _settings = _.without(_settings, 'shape');
                }

                _settings = _.uniq(_settings);
            },

            textSettings: 'Settings',
            textText: 'Text',
            textParagraph: 'Paragraph',
            textTable: 'Table',
            textShape: 'Shape',
            textImage: 'Image',
            textChart: 'Chart',
            textHyperlink: 'Hyperlink'

        }
    })(), DE.Controllers.EditContainer || {}))
});