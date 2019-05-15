/*
 *
 * (c) Copyright Ascensio System SIA 2010-2019
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
 * street, Riga, Latvia, EU, LV-1050.
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
 *  Collaboration.js
 *  Document Editor
 *
 *  Created by Julia Svinareva on 14/5/19
 *  Copyright (c) 2019 Ascensio System SIA. All rights reserved.
 *
 */
define([
    'core',
    'jquery',
    'underscore',
    'backbone',
    'documenteditor/mobile/app/view/Collaboration'
], function (core, $, _, Backbone) {
    'use strict';

    DE.Controllers.Collaboration = Backbone.Controller.extend(_.extend((function() {
        // Private
        var _settings = [],
            _headerType = 1,
             rootView,
            _isReviewOnly = false,
            _fileKey,
            _canReview = false;

        return {
            models: [],
            collections: [],
            views: [
                'Collaboration'
            ],

            initialize: function() {
                var me = this;
                me.addListeners({
                    'Collaboration': {
                        'page:show' : me.onPageShow
                    }
                });
            },

            setApi: function(api) {
                this.api = api;
            },

            onLaunch: function () {
                this.createView('Collaboration').render();
            },

            setMode: function (mode) {
                _isReviewOnly = mode.isReviewOnly;
                _fileKey = mode.fileKey;
                _canReview = mode.canReview;
            },


            showModal: function() {
                var me = this,
                    isAndroid = Framework7.prototype.device.android === true,
                    modalView,
                    mainView = DE.getController('Editor').getView('Editor').f7View;

                uiApp.closeModal();

                /*me._showByStack(Common.SharedSettings.get('phone'));*/

                if (Common.SharedSettings.get('phone')) {
                    modalView = $$(uiApp.pickerModal(
                        '<div class="picker-modal settings container-edit">' +
                        '<div class="view collaboration-root-view navbar-through">' +
                        this.getView('Collaboration').rootLayout() +
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
                    modalView = uiApp.popover(
                        '<div class="popover settings container-edit">' +
                        '<div class="popover-angle"></div>' +
                        '<div class="popover-inner">' +
                        '<div class="content-block">' +
                        '<div class="view popover-view collaboration-root-view navbar-through">' +
                        this.getView('Collaboration').rootLayout() +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>',
                        $$('#toolbar-edit')
                    );
                }

                if (Framework7.prototype.device.android === true) {
                    $$('.view.collaboration-root-view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
                    $$('.view.collaboration-root-view .navbar').prependTo('.view.collaboration-root-view > .pages > .page');
                }

                rootView = uiApp.addView('.collaboration-root-view', {
                    dynamicNavbar: true,
                    domCache: true
                });

                Common.NotificationCenter.trigger('collaborationcontainer:show');
                this.onPageShow(this.getView('Collaboration'));

                DE.getController('Toolbar').getView('Toolbar').hideSearch();
            },

            rootView : function() {
                return rootView;
            },

            onPageShow: function(view, pageId) {
                var me = this;

                if ('#reviewing-settings-view' == pageId) {
                    me.initReviewingSettingsView();
                    Common.Utils.addScrollIfNeed('.page[data-page=reviewing-settings-view]', '.page[data-page=reviewing-settings-view] .page-content');
                } else {

                }
            },

            initReviewingSettingsView: function () {
                var me = this;
                $('#settings-review input:checkbox').attr('checked', _isReviewOnly || Common.localStorage.getBool("de-mobile-track-changes-" + (_fileKey || '')));
                $('#settings-review input:checkbox').single('change',       _.bind(me.onTrackChanges, me));
                if (_isReviewOnly) $layour.find('#settings-review').addClass('disabled');
            },

            onTrackChanges: function(e) {
                var $checkbox = $(e.currentTarget),
                    state = $checkbox.is(':checked');
                if ( _isReviewOnly ) {
                    $checkbox.attr('checked', true);
                } else if ( _canReview ) {
                    this.api.asc_SetTrackRevisions(state);
                    Common.localStorage.setItem("de-mobile-track-changes-" + (_fileKey || ''), state ? 1 : 0);
                }
            },



            text: ''

        }
    })(), DE.Controllers.Collaboration || {}))
});