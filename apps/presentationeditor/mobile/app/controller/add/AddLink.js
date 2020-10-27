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
 *  AddLink.js
 *  Presentation Editor
 *
 *  Created by Julia Radzhabova on 12/01/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'presentationeditor/mobile/app/view/add/AddOther'
], function (core) {
    'use strict';

    PE.Controllers.AddLink = Backbone.Controller.extend(_.extend((function() {
        var c_oHyperlinkType = {
                InternalLink:0,
                WebLink: 1
            },
            c_oSlideLink = {
                Next: 0,
                Previouse: 1,
                Last: 2,
                First: 3,
                Num: 4
            },
            _slidesCount = 0;

        return {
            models: [],
            collections: [],
            views: [
                'AddOther'
            ],

            initialize: function () {

                this.addListeners({
                    'AddOther': {
                        'category:show': this.categoryShow,
                        'page:show'    : this.onPageShow
                    }
                });

                var me = this;
                uiApp.onPageBack('addlink-type addlink-slidenumber', function (page) {
                    me.initSettings();
                });

                this._linkType = c_oHyperlinkType.WebLink;
                this._slideLink = 0;
                this._slideNum = 0;
            },

            setApi: function (api) {
                var me = this;
                me.api = api;
            },

            initEvents: function () {
                var me = this;
                $('#add-link-insert').single('click', _.buffered(me.onInsertLink, 100, me));
            },

            categoryShow: function (view, pageId) {
                if (pageId === '#addother-insert-link') {
                    this._linkType = c_oHyperlinkType.WebLink;
                    this._slideLink = this._slideNum = 0;
                    var text = this.api.can_AddHyperlink();
                    if (text !== false) {
                        $('#add-link-display input').val((text !== null) ? text : this.textDefault);
                        $('#add-link-display').toggleClass('disabled', text === null);
                    }

                    this.initEvents();
                    this.initSettings();
                }
            },

            initSettings: function (pageId) {
                var me = this;

                if (pageId == '#addlink-type') {
                    $('#page-addlink-type input').val([this._linkType]);
                } else if (pageId == '#addlink-slidenumber') {
                    _slidesCount = me.api.getCountPages();
                    $('#page-addlink-slidenumber input').val([this._slideLink]);
                    $('#addlink-slide-number .item-after label').text(this._slideNum+1);
                } else {
                    $('#add-link-type .item-after').text((this._linkType==c_oHyperlinkType.WebLink) ? me.textExternalLink : me.textInternalLink);
                    $('#add-link-url')[(this._linkType==c_oHyperlinkType.WebLink) ? 'show' : 'hide']();
                    $('#add-link-number')[(this._linkType==c_oHyperlinkType.WebLink) ? 'hide' : 'show']();

                    if (this._linkType==c_oHyperlinkType.WebLink) {
                        $('#add-link-url input[type=url]').single('input', _.bind(function(e) {
                            $('#add-link-insert').toggleClass('disabled', _.isEmpty($('#add-link-url input').val()));
                        }, this));
                        _.delay(function () {
                            $('#add-link-url input[type=url]').focus();
                        }, 1000);
                    } else {
                        var slidename = '';
                        switch (this._slideLink) {
                            case 0:
                                slidename = me.textNext;
                                break;
                            case 1:
                                slidename = me.textPrev;
                                break;
                            case 2:
                                slidename = me.textFirst;
                                break;
                            case 3:
                                slidename = me.textLast;
                                break;
                            case 4:
                                slidename = me.textSlide + ' ' + (this._slideNum+1);
                                break;
                        }
                        $('#add-link-number .item-after').text(slidename);
                    }

                    $('#add-link-insert').toggleClass('disabled', (this._linkType==c_oHyperlinkType.WebLink) && _.isEmpty($('#add-link-url input').val()));
                }
            },

            onPageShow: function (view, pageId) {
                var me = this;

                $('#page-addlink-type li').single('click',  _.buffered(me.onLinkType, 100, me));
                $('#page-addlink-slidenumber li').single('click', _.buffered(me.onSlideLink, 100, me));
                $('#addlink-slide-number .button').single('click',_.buffered(me.onSlideNumber, 100, me));
                me.initSettings(pageId);
            },

            // Handlers

            onInsertLink: function (e) {
                PE.getController('AddContainer').hideModal();
            },

            onLinkType: function (e) {
                var $target = $(e.currentTarget).find('input');

                if ($target && this.api) {
                    this._linkType = parseFloat($target.prop('value'));
                }
            },

            onSlideLink: function (e) {
                var $target = $(e.currentTarget).find('input');

                if ($target && this.api) {
                    this._slideLink = parseFloat($target.prop('value'));
                }
            },

            onSlideNumber: function (e) {
                var $button = $(e.currentTarget),
                    slide = this._slideNum;

                if ($button.hasClass('decrement')) {
                    slide = Math.max(0, --slide);
                } else {
                    slide = Math.min(_slidesCount-1, ++slide);
                }
                this._slideNum = slide;
                $('#addlink-slide-number .item-after label').text(slide+1);
            },

            txtNotUrl: 'This field should be a URL in the format \"http://www.example.com\"',
            textDefault: 'Selected text',
            textNext: 'Next Slide',
            textPrev: 'Previous Slide',
            textFirst: 'First Slide',
            textLast: 'Last Slide',
            textSlide: 'Slide',
            textExternalLink: 'External Link',
            textInternalLink: 'Slide in this Presentation',
            notcriticalErrorTitle: 'Warning'
        }
    })(), PE.Controllers.AddLink || {}))
});