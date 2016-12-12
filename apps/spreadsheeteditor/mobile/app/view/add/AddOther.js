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
 *  Document Editor
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

                $('#add-other-insimage').single('click',    _.bind(me.showInsertImage, me));
                $('#add-other-link').single('click',        _.bind(me.showLink, me));

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
                    this.fireEvent('insert:image',[{islocal:true}]);
                }.bind(this));
            },

            showLink: function () {
                this.showPage('#addother-link');

                $('.page[data-page=addother-link] input[type=url]').single('input', _.bind(function(e) {
                    $('#add-link-insert').toggleClass('disabled', _.isEmpty($('#add-link-url input').val()));
                }, this));

                _.delay(function () {
                    $('.page[data-page=addother-link] input[type=url]').focus();
                }, 1000);

                $('#add-link-insert').single('click', _.buffered(this.clickInsertLink, 100, this));
            },

            clickInsertLink: function (e) {
                var url     = $('#add-link-url input').val(),
                    display = $('#add-link-display input').val(),
                    tip     = $('#add-link-tip input').val();

                this.fireEvent('insert:link', [{url:url, text:display, tooltip:tip}]);
            },

            showImageFromUrl: function () {
                this.showPage('#addother-imagefromurl');

                var me = this;
                var $input = $('#addimage-link-url input[type=url]');

                $('#addimage-insert a').single('click', _.buffered(function () {
                    var value = ($input.val()).replace(/ /g, '');
                    me.fireEvent('insert:image', [{islocal:false, url:value}]);
                }, 100, me));

                var $btnInsert = $('#addimage-insert');
                $('#addimage-url input[type=url]').single('input', function (e) {
                    $btnInsert.toggleClass('disabled', _.isEmpty($(e.currentTarget).val()));
                });

                _.delay(function () { $input.focus(); }, 1000);
            },

            textInsertImage: 'Insert Image',
            textSort: 'Sort and Filter',
            textLink: 'Link',
            textBack: 'Back',
            textAddLink: 'Add Link',
            textDisplay: 'Display',
            textTip: 'Screen Tip',
            textInsert: 'Insert',
            textPosition: 'Position',
            textLeftTop: 'Left Top',
            textCenterTop: 'Center Top',
            textRightTop: 'Right Top',
            textLeftBottom: 'Left Bottom',
            textCenterBottom: 'Center Bottom',
            textRightBottom: 'Right Bottom',
            textCurrentPos: 'Current Position',
            textNextPage: 'Next Page',
            textContPage: 'Continuous Page',
            textEvenPage: 'Even Page',
            textOddPage: 'Odd Page'
            , textFromLibrary: 'Picture from Library'
            , textFromURL: 'Picture from URL'
            , textLinkSettings: 'Link Settings'
            , textAddress: 'Address'
            , textImageURL: 'Image URL'
        }
    })(), SSE.Views.AddOther || {}))
});