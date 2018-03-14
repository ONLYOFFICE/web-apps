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
 * AddLink.js
 *
 * Created by Maxim.Kadushkin on 1/10/2017
 * Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!spreadsheeteditor/mobile/app/template/AddLink.template',
    'backbone'
], function (addTemplate, Backbone) {
    'use strict';

    SSE.Views.AddLink = Backbone.View.extend(_.extend((function() {
        // private

        var cfgLink = {
            type        : 'ext',
            internal    : {}
        };

        var clickInsertLink = function (e) {
            var $view = $('.settings');
            var type = cfgLink.type;
            var $text = $view.find('#add-link-display input');

            this.fireEvent('link:insert', [{
                type    : type,
                sheet   : type == 'ext' ? undefined : cfgLink.internal.sheet.caption,
                url     : $view.find(type == 'ext' ? '#add-link-url input' : '#add-link-range input').val(),
                text    : $text.is(':disabled') ? null : $text.val(),
                tooltip : $view.find('#add-link-tip input').val()
            }]);
        };

        function initEvents() {
            var me = this;
            var $view = $('.settings');
            $('.page[data-page=add-link]').find('input[type=url], input.range')
                .single('input', function(e) {
                    $view.find('#add-link-insert').toggleClass('disabled', _.isEmpty($(e.target).val()));
                });

            _.delay(function () {
                $view.find('.page[data-page=addother-link] input[type=url]').focus();
            }, 1000);

            $view.find('#add-link-insert').single('click', _.buffered(clickInsertLink, 100, this));
            $view.find('#add-link-type select').single('change', function (e) {
                me.fireEvent('link:changetype', [me, $(e.currentTarget).val()]);
            });
            $view.find('#add-link-sheet select').single('change', function (e) {
                var index = $(e.currentTarget).val(),
                    caption = $(e.currentTarget[e.currentTarget.selectedIndex]).text();
                cfgLink.internal = { sheet: {index: index, caption: caption}};
                // me.fireEvent('link:changesheet', [me, $(e.currentTarget).val()]);
            }).val(cfgLink.internal.sheet.index);
        }


        return {
            // el: '.view-main',

            template: _.template(addTemplate),

            events: {},

            initialize: function () {
                // Common.NotificationCenter.on('addcontainer:show', _.bind(this.initEvents, this));
            },

            initEvents: function () {
                var me = this;
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
                return this.layout ?
                    this.layout.find('#addlink-root-view').html() : '';
            },

            initControls: function () {
                //
            },

            showPage: function (root, navbar) {
                if (root && this.layout) {
                    var $content = this.layout;

                    if ( !$content.find('.navbar').length ) {
                        // Android fix for navigation
                        if (Framework7.prototype.device.android) {
                            $content.find('.page').append(navbar);
                        } else {
                            $content.prepend(navbar);
                        }
                    }

                    root.router.load({
                        content: $content.html()
                    });

                    initEvents.call(this);
                }
            },

            showPanel: function () {
                initEvents.call(this);
            },

            optionLinkType: function (type, opts) {
                cfgLink.type = type;

                var $view = $('.settings');

                if ( !(opts == 'caption') ) {
                    $view.find('#add-link-type select').val(type);
                    $view.find('#add-link-type .item-after').html(
                        type == 'int' ? this.textInternalLink : this.textExternalLink );
                }

                var $btnInsertLink = $view.find('#add-link-insert');
                if ( type == 'int' ) {
                    $view.find('#add-link-url').hide();

                    $view.find('#add-link-sheet').show()
                        .find('.item-after').html(cfgLink.internal.sheet.caption);

                    $view.find('#add-link-range').show();
                    $btnInsertLink.toggleClass('disabled', _.isEmpty($view.find('#add-link-range input').val()));
                } else {
                    $view.find('#add-link-url').show();
                    $view.find('#add-link-sheet').hide();
                    $view.find('#add-link-range').hide();

                    $btnInsertLink.toggleClass('disabled', _.isEmpty($view.find('#add-link-url input').val()));
                }
            },

            optionAllowInternal: function(allow) {
                var $view = $('.settings');

                if ( allow )
                    $view.find('#add-link-type').show();
                else {
                    this.optionLinkType('ext');
                    $view.find('#add-link-type').hide();
                }
            },

            optionDisplayText: function (text) {
                var $view = $('.settings');
                var disabled = text == 'locked';

                disabled && (text = ' ');
                $view.find('#add-link-display input').prop('disabled', disabled).val(text);
                $view.find('#add-link-display .label').toggleClass('disabled', disabled);
            },

            acceptWorksheets: function (sheets) {
                this.worksheets = sheets;

                var tpl = '<% _.each(worksheets, function(item){ %>' +
                    '<option value="<%= item.value %>"><%= item.caption %></option>' +
                    '<% }) %>';

                this.layout.find('#add-link-sheet select').html(
                    _.template(tpl)({
                        worksheets: sheets
                    })
                );

                var $view = $('.settings');

                if ($view.length > 0) {
                    $view.find('#add-link-sheet select').html(
                        _.template(tpl)({
                            worksheets: sheets
                        })
                    );
                }

                var active = _.findWhere(sheets, {active:true});
                if ( active )
                    this.setActiveWorksheet(active.value, active.caption);
                return this;
            },

            setActiveWorksheet: function (index, caption) {
                cfgLink.internal = { sheet: {index: index, caption: caption}};

                var $view = $('.settings');
                // $view.find('#add-link-sheet .item-after').html(this.link.internal.sheet.caption);
                $view.find('#add-link-sheet select').val(index);
                $view.find('#add-link-sheet .item-after').text(caption);

                return this;
            },

            getTitle: function () {
                return this.textAddLink;
            },

            textLink: 'Link',
            textAddLink: 'Add Link',
            textDisplay: 'Display',
            textTip: 'Screen Tip',
            textInsert: 'Insert',
            textLinkSettings: 'Link Settings',
            textAddress: 'Address',
            textLinkType: 'Link Type',
            textExternalLink: 'External Link',
            textInternalLink: 'Internal Data Range',
            textSheet: 'Sheet',
            textRange: 'Range',
            textRequired: 'Required'
        }
    })(), SSE.Views.AddLink || {}))
});