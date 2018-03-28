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
 *  AddOther.js
 *
 *  Created by Kadushkin Maxim on 12/07/2016
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!spreadsheeteditor/mobile/app/template/AddOther.template',
    'backbone'
], function (addTemplate, Backbone) {
    'use strict';

    SSE.Views.AddOther = Backbone.View.extend(_.extend((function() {
        // private

        var tplNavigation = '<div class="navbar">' +
                                '<div class="navbar-inner">' +
                                    '<div class="left sliding">' +
                                        '<a href="#" class="back link">' +
                                            '<i class="icon icon-back"></i>' +
                                            '<% if (!android) { %><span><%= textBack %></span><% } %>' +
                                        '</a>' +
                                    '</div>' +
                                    '<div class="center sliding"><%= title %></div>' +
                                '</div>' +
                            '</div>';

        var mapNavigation = {};

        var getNavigation = function (panelid) {
            var el = mapNavigation[panelid];
            if ( !el ) {
                var _title;
                switch ( panelid ) {
                case '#addlink':
                    _title = SSE.getController('AddLink').getView('AddLink').getTitle();
                    break;
                case '#addother-insimage': _title = this.textInsertImage; break;
                case '#addother-sort': _title = this.textSort; break;
                case '#addother-imagefromurl': _title = this.textLinkSettings; break;
                }

                mapNavigation =
                    el = _.template(tplNavigation)({
                            android     : Common.SharedSettings.get('android'),
                            phone       : Common.SharedSettings.get('phone'),
                            textBack    : this.textBack,
                            title       : _title
                        }
                    );
            }

            return el;
        };

        return {
            // el: '.view-main',

            template: _.template(addTemplate),

            events: {},

            initialize: function () {
                Common.NotificationCenter.on('addcontainer:show', _.bind(this.initEvents, this));
            },

            initEvents: function () {
                var me = this;

                var $page = $('#add-other');
                $page.find('#add-other-insimage').single('click', _.bind(me.showInsertImage, me));
                $page.find('#add-other-link').single('click', _.bind(me.showInsertLink, me));
                $page.find('#add-other-sort').single('click', _.bind(me.showSortPage, me));

                me.initControls();
            },

            // Render layout
            render: function () {
                this.layout = $('<div/>').append(this.template({
                    android : Common.SharedSettings.get('android'),
                    phone   : Common.SharedSettings.get('phone'),
                    scope   : this
                }));

                return this;
            },

            rootLayout: function () {
                if (this.layout) {
                    return this.layout
                        .find('#addother-root-view')
                        .html();
                }

                return '';
            },

            childLayout: function (name) {
                if (this.layout) {
                    if ( name == 'image' )
                        return this.layout.find('#addother-insimage .page-content').html();
                }

                return '';
            },

            initControls: function () {
                //
            },

            showPage: function (templateId) {
                var rootView = SSE.getController('AddContainer').rootView;

                if (rootView && this.layout) {
                    var $content = this.layout.find(templateId);
                    var navbar = getNavigation.call(this, templateId);

                    if ( !$content.find('.navbar').length ) {
                        // Android fix for navigation
                        if (Framework7.prototype.device.android) {
                            $content.find('.page').append(navbar);
                        } else {
                            $content.prepend(navbar);
                        }
                    }

                    rootView.router.load({
                        content: $content.html()
                    });

                    this.fireEvent('page:show', [this, templateId]);
                }
            },

            showInsertImage: function () {
                this.showPage('#addother-insimage');

                $('#addimage-url').single('click', this.showImageFromUrl.bind(this));
                $('#addimage-file').single('click', function () {
                    this.fireEvent('image:insert',[{islocal:true}]);
                }.bind(this));
            },

            showInsertLink: function () {
                SSE.getController('AddLink').showPage(getNavigation.call(this, '#addlink'));
            },

            showSortPage: function (e) {
                this.showPage('#addother-sort');

                var me = this;
                $('.settings .sortdown').single('click', function (e) {me.fireEvent('insert:sort',['down']);});
                $('.settings .sortup').single('click', function (e) {me.fireEvent('insert:sort',['up']);});

                // temporary hidden
                // TODO: make filter's options menu
                $('.settings #other-chb-insfilter').parents('.list-block').hide();

                $('.settings #other-chb-insfilter input:checkbox').single('change', function (e) {
                    var $checkbox = $(e.currentTarget);
                    me.fireEvent('insert:filter', [$checkbox.is(':checked')]);
                });
            },

            showImageFromUrl: function () {
                this.showPage('#addother-imagefromurl');

                var me = this;
                var $input = $('#addimage-link-url input[type=url]');

                $('#addimage-insert a').single('click', _.buffered(function () {
                    var value = ($input.val()).replace(/ /g, '');
                    me.fireEvent('image:insert', [{islocal:false, url:value}]);
                }, 100, me));

                var $btnInsert = $('#addimage-insert');
                $('#addimage-fromurl input[type=url]').single('input', function (e) {
                    $btnInsert.toggleClass('disabled', _.isEmpty($(e.currentTarget).val()));
                });

                _.delay(function () { $input.focus(); }, 1000);
            },

            optionAutofilter: function (checked) {
                $('.settings #other-chb-insfilter input:checkbox').prop('checked', checked);
            },

            textInsertImage: 'Insert Image',
            textSort: 'Sort and Filter',
            textLink: 'Link',
            textBack: 'Back',
            textInsert: 'Insert',
            textFromLibrary: 'Picture from Library',
            textFromURL: 'Picture from URL',
            textAddress: 'Address',
            textImageURL: 'Image URL',
            textFilter: 'Filter'
        }
    })(), SSE.Views.AddOther || {}))
});