/*
 *
 * (c) Copyright Ascensio System Limited 2010-2016
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
 *  Copyright (c) 2016 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'text!spreadsheeteditor/mobile/app/template/AddOther.template',
    'backbone'
], function (addTemplate, Backbone) {
    'use strict';

    SSE.Views.AddOther = Backbone.View.extend(_.extend((function() {
        // private

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

                this.link = {type:'ext', internal:{}};
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

            initControls: function () {
                //
            },

            showPage: function (templateId) {
                var rootView = SSE.getController('AddContainer').rootView;

                if (rootView && this.layout) {
                    var $content = this.layout.find(templateId);

                    // Android fix for navigation
                    if (Framework7.prototype.device.android) {
                        $content.find('.page').append($content.find('.navbar'));
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
                this.showPage('#addother-link');

                var me = this;
                var $view = $('.settings');
                $('.page[data-page=addother-link]').find('input[type=url], input.range')
                    .single('input', function(e) {
                        $view.find('#add-link-insert').toggleClass('disabled', _.isEmpty($(e.target).val()));
                });

                _.delay(function () {
                    $view.find('.page[data-page=addother-link] input[type=url]').focus();
                }, 1000);

                $view.find('#add-link-insert').single('click', _.buffered(this.clickInsertLink, 100, this));
                $view.find('#add-link-type select').single('change', function (e) {
                    me.fireEvent('link:changetype', [me, $(e.currentTarget).val()]);
                });
                $view.find('#add-link-sheet select').single('change', function (e) {
                    var index = $(e.currentTarget).val(),
                        caption = $(e.currentTarget[e.currentTarget.selectedIndex]).text();
                    me.link.internal = { sheet: {index: index, caption: caption}};
                    me.fireEvent('link:changesheet', [me, $(e.currentTarget).val()]);
                }).val(me.link.internal.sheet.index);
            },

            showSortPage: function (e) {
                this.showPage('#addother-sort');

                var me = this;
                $('.settings .sortdown').single('click', function (e) {me.fireEvent('insert:sort',['down']);});
                $('.settings .sortup').single('click', function (e) {me.fireEvent('insert:sort',['up']);});
                $('.settings #other-chb-insfilter input:checkbox').single('change', function (e) {
                    var $checkbox = $(e.currentTarget);
                    me.fireEvent('insert:filter', [$checkbox.is(':checked')]);
                });
            },

            clickInsertLink: function (e) {
                var $view = $('.settings');
                var type = this.link.type;
                var $text = $view.find('#add-link-display input');

                this.fireEvent('link:insert', [{
                    type    : type,
                    sheet   : type == 'ext' ? undefined : this.link.internal.sheet.index,
                    url     : $view.find(type == 'ext' ? '#add-link-url input' : '#add-link-range input').val(),
                    text    : $text.is(':disabled') ? null : $text.val(),
                    tooltip : $view.find('#add-link-tip input').val()
                }]);
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
                $('#addimage-url input[type=url]').single('input', function (e) {
                    $btnInsert.toggleClass('disabled', _.isEmpty($(e.currentTarget).val()));
                });

                _.delay(function () { $input.focus(); }, 1000);
            },

            optionAutofilter: function (checked) {
                $('.settings #other-chb-insfilter input:checkbox').prop('checked', checked);
            },

            optionLinkType: function (type, opts) {
                this.link.type = type;

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
                        .find('.item-after').html(this.link.internal.sheet.caption);

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
                    _.template(tpl, {
                        worksheets: sheets
                    })
                );

                return this;
            },

            setActiveWorksheet: function (index, caption) {
                this.link.internal = { sheet: {index: index, caption: caption}};

                var $view = $('.settings');
                // $view.find('#add-link-sheet .item-after').html(this.link.internal.sheet.caption);
                $view.find('#add-link-sheet select').val(index);
                $view.find('#add-link-sheet .item-after').text(caption);

                return this;
            },

            textInsertImage: 'Insert Image',
            textSort: 'Sort and Filter',
            textLink: 'Link',
            textBack: 'Back',
            textAddLink: 'Add Link',
            textDisplay: 'Display',
            textTip: 'Screen Tip',
            textInsert: 'Insert',
            textFromLibrary: 'Picture from Library',
            textFromURL: 'Picture from URL',
            textLinkSettings: 'Link Settings',
            textAddress: 'Address',
            textImageURL: 'Image URL',
            textFilter: 'Filter',
            textLinkType: 'Link Type',
            textExternalLink: 'External Link',
            textInternalLink: 'Internal Data Range',
            textSheet: 'Sheet',
            textRange: 'Range',
            textRequired: 'Required'
        }
    })(), SSE.Views.AddOther || {}))
});