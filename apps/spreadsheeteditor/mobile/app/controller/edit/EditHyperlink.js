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
 *  EditHyperlink.js
 *  Spreadsheet Editor
 *
 *  Created by Alexander Yuzhin on 12/20/16
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */


define([
    'core',
    'spreadsheeteditor/mobile/app/view/edit/EditHyperlink',
    'jquery',
    'underscore',
    'backbone'
], function (core, view, $, _, Backbone) {
    'use strict';

    SSE.Controllers.EditHyperlink = Backbone.Controller.extend(_.extend((function() {

        return {
            models: [],
            collections: [],
            views: [
                'EditHyperlink'
            ],

            initialize: function () {
                Common.NotificationCenter.on('editcontainer:show', _.bind(this.initEvents, this));

                this.addListeners({
                    'EditHyperlink': {
                        'page:show'     : this.onPageShow
                    }
                });
            },

            setApi: function (api) {
                var me = this;
                me.api = api;
            },

            onLaunch: function () {
                this.createView('EditHyperlink').render();
            },

            initEvents: function () {
                if ($('#edit-link').length < 1) {
                    return;
                }

                uiApp.addView('#edit-link');

                var me = this;

                me.initSettings();
            },

            onPageShow: function (view, pageId) {
                var me = this;

                me.initSettings(pageId);
            },

            initSettings: function (pageId) {
                var me = this;

                if ('#edit-link-type-view' == pageId) {
                    var $radioLinkType = $('.page[data-page=edit-link-type-view]').find('input:radio[name=link-type]');
                    $radioLinkType.val([me.linkType]);
                    $radioLinkType.single('change',       _.bind(me.onTypeChange, me));
                } else if ('#edit-link-sheet-view' == pageId) {
                    var sheetCount = me.api.asc_getWorksheetsCount(),
                        i = -1,
                        template = '';
                    while (++i < sheetCount) {
                        if (!me.api.asc_isWorksheetHidden(i)) {
                            template += '<li>' +
                                '<label class="label-radio item-content">' +
                                '<input type="radio" name="link-sheet" value="' + me.api.asc_getWorksheetName(i) + '">';
                            if (Common.SharedSettings.get('android')) {
                                template += '<div class="item-media"><i class="icon icon-form-radio"></i></div>';
                            }
                            template += '<div class="item-inner">' +
                                '<div class="item-title">' + me.api.asc_getWorksheetName(i) + '</div>' +
                                '</div>' +
                                '</label>' +
                                '</li>';
                        }
                    }
                    $('.page[data-page="edit-link-sheet-view"] .page-content .list-block ul').html(_.template([template].join('')));
                    var $radioLinkSheet = $('.page[data-page=edit-link-sheet-view]').find('input:radio[name=link-sheet]');
                    $radioLinkSheet.val([me.linkSheet]);
                    $radioLinkSheet.single('change',       _.bind(function (e) {
                        me.linkSheet = $(e.currentTarget).prop('value');
                        $('#edit-link-sheet .item-after').text(me.linkSheet);
                    }, me));
                } else {

                    var cellInfo = me.api.asc_getCellInfo(),
                        linkInfo = cellInfo.asc_getHyperlink(),
                        isLock = cellInfo.asc_getLockText();

                    me.linkType = linkInfo.asc_getType();
                    $('#edit-link-type .item-after').text((me.linkType == Asc.c_oAscHyperlinkType.RangeLink) ? me.textInternalLink : me.textExternalLink);

                    $('#edit-link-sheet, #edit-link-range').css('display', (linkInfo.asc_getType() == Asc.c_oAscHyperlinkType.RangeLink) ? 'block' : 'none');
                    $('#edit-link-link').css('display', (linkInfo.asc_getType() != Asc.c_oAscHyperlinkType.RangeLink) ? 'block' : 'none');

                    me.currentSheet = me.api.asc_getWorksheetName(me.api.asc_getActiveWorksheetIndex());
                    me.linkSheet = (linkInfo.asc_getType() == Asc.c_oAscHyperlinkType.RangeLink) ? linkInfo.asc_getSheet() : me.currentSheet;
                    $('#edit-link-sheet .item-after').text(me.linkSheet);

                    $('#edit-link-range input').val(linkInfo.asc_getRange());

                    $('#edit-link-link input').val(linkInfo.asc_getHyperlinkUrl() ? linkInfo.asc_getHyperlinkUrl().replace(new RegExp(" ", 'g'), "%20") : '');

                    $('#edit-link-display input').val(isLock ? me.textDefault : linkInfo.asc_getText());
                    $('#edit-link-display input').toggleClass('disabled', isLock);

                    $('#edit-link-tip input').val(linkInfo.asc_getTooltip());

                    var focusInput = ((linkInfo.asc_getType() == Asc.c_oAscHyperlinkType.RangeLink) ? $('#edit-link-range input') : $('#edit-link-link input'));
                    $('#edit-link-edit').toggleClass('disabled', _.isEmpty(focusInput.val()));

                    $('#edit-link-link input, #edit-link-range input').single('input', _.bind(function (e) {
                        $('#edit-link-edit').toggleClass('disabled', _.isEmpty($(e.currentTarget).val()));
                    }, me));

                    $('#edit-link-edit').single('click', _.bind(me.onEdit, me));
                    $('#edit-link-remove').single('click', _.bind(me.onRemove, me));

                }
            },

            // Handlers

            onTypeChange: function (e) {
                var val = parseInt($(e.currentTarget).prop('value'));
                this.linkType = val;

                $('#edit-link-sheet, #edit-link-range').css('display', (val == Asc.c_oAscHyperlinkType.RangeLink) ? 'block' : 'none');
                $('#edit-link-link').css('display', (val != Asc.c_oAscHyperlinkType.RangeLink) ? 'block' : 'none');

                $('#edit-link-type .item-after').text((this.linkType == Asc.c_oAscHyperlinkType.RangeLink) ? this.textInternalLink : this.textExternalLink);
            },

            onEdit: function () {
                var me = this,
                    linkProps = new Asc.asc_CHyperlink(),
                    defaultDisplay = "",
                    sheet = this.linkSheet,
                    $range = $('#edit-link-range input'),
                    $link = $('#edit-link-link input'),
                    $display = $('#edit-link-display input'),
                    $tip = $('#edit-link-tip input'),
                    type = parseInt(this.linkType);

                linkProps.asc_setType(type);

                if (type == Asc.c_oAscHyperlinkType.RangeLink) {
                    var range = $.trim($range.val()),
                        isValidRange = /^[A-Z]+[1-9]\d*:[A-Z]+[1-9]\d*$/.test(range);

                    if (!isValidRange)
                        isValidRange = /^[A-Z]+[1-9]\d*$/.test(range);

                    if (!isValidRange) {
                        uiApp.alert(me.textInvalidRange, me.notcriticalErrorTitle);
                        return;
                    }

                    linkProps.asc_setSheet(sheet);
                    linkProps.asc_setRange(range);
                    defaultDisplay = sheet + '!' + range;
                } else {
                    var url = $link.val().replace(/^\s+|\s+$/g,'');

                    if (! /(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(url)) {
                        var urlType = me.api.asc_getUrlType($.trim(url));

                        if (urlType < 1) {
                            uiApp.alert(me.txtNotUrl, me.notcriticalErrorTitle);
                            return;
                        }

                        url = ( (urlType==2) ? 'mailto:' : 'http://' ) + url;
                    }

                    url = url.replace(new RegExp("%20",'g')," ");

                    linkProps.asc_setHyperlinkUrl(url);
                    defaultDisplay = url;
                }

                if ($display.hasClass('disabled')) {
                    linkProps.asc_setText(null);
                } else {
                    if (_.isEmpty($display.val())) {
                        $display.val(defaultDisplay);
                    }

                    linkProps.asc_setText($display.val());
                }

                linkProps.asc_setTooltip($tip.val());

                me.api.asc_insertHyperlink(linkProps);
                SSE.getController('EditContainer').hideModal();
            },

            onRemove: function () {
                this.api && this.api.asc_removeHyperlink();
                SSE.getController('EditContainer').hideModal();
            },

            textExternalLink: 'External Link',
            textInternalLink: 'Internal Data Range',
            textDefault: 'Selected range',
            textInvalidRange: 'Invalid cells range',
            textEmptyImgUrl: 'You need to specify image URL.',
            txtNotUrl: 'This field should be a URL in the format \"http://www.example.com\"',
            notcriticalErrorTitle: 'Warning'
        }
    })(), SSE.Controllers.EditHyperlink || {}))
});