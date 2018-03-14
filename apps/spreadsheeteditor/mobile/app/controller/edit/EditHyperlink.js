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


            initSettings: function () {
                var me = this,
                    cellInfo = me.api.asc_getCellInfo(),
                    linkInfo = cellInfo.asc_getHyperlink(),
                    sheetCount = me.api.asc_getWorksheetsCount(),
                    isLock = cellInfo.asc_getFlags().asc_getLockText(),
                    i = -1,
                    sheets = [];

                while (++i < sheetCount) {
                    if (!me.api.asc_isWorksheetHidden(i)) {
                        sheets.push(Common.Utils.String.format('<option value="{0}">{1}</option>', me.api.asc_getWorksheetName(i), me.api.asc_getWorksheetName(i)));
                    }
                }

                $('#edit-link-sheet select').html(sheets.join(''));

                $('#edit-link-type select').val(linkInfo.asc_getType());
                $('#edit-link-type .item-after').text((linkInfo.asc_getType() == Asc.c_oAscHyperlinkType.RangeLink) ? me.textInternalLink : me.textExternalLink);

                $('#edit-link-sheet, #edit-link-range').css('display', (linkInfo.asc_getType() == Asc.c_oAscHyperlinkType.RangeLink) ? 'block' : 'none');
                $('#edit-link-link').css('display', (linkInfo.asc_getType() != Asc.c_oAscHyperlinkType.RangeLink) ? 'block' : 'none');

                var currentSheet = me.api.asc_getWorksheetName(me.api.asc_getActiveWorksheetIndex());
                $('#edit-link-sheet select').val((linkInfo.asc_getType() == Asc.c_oAscHyperlinkType.RangeLink) ? linkInfo.asc_getSheet(): currentSheet);
                $('#edit-link-sheet .item-after').text((linkInfo.asc_getType() == Asc.c_oAscHyperlinkType.RangeLink) ? linkInfo.asc_getSheet(): currentSheet);

                $('#edit-link-range input').val(linkInfo.asc_getRange());

                $('#edit-link-link input').val(linkInfo.asc_getHyperlinkUrl() ? linkInfo.asc_getHyperlinkUrl().replace(new RegExp(" ",'g'), "%20") : '');

                $('#edit-link-display input').val(isLock ? me.textDefault : linkInfo.asc_getText());
                $('#edit-link-display input').toggleClass('disabled', isLock);

                $('#edit-link-tip input').val(linkInfo.asc_getTooltip());

                var focusInput = ((linkInfo.asc_getType() == Asc.c_oAscHyperlinkType.RangeLink) ? $('#edit-link-range input') : $('#edit-link-link input'));
                $('#edit-link-edit').toggleClass('disabled', _.isEmpty(focusInput.val()));

                $('#edit-link-link input, #edit-link-range input').single('input', _.bind(function(e) {
                    $('#edit-link-edit').toggleClass('disabled', _.isEmpty($(e.currentTarget).val()));
                }, me));

                $('#edit-link-edit').single('click',    _.bind(me.onEdit, me));
                $('#edit-link-remove').single('click',  _.bind(me.onRemove, me));

                $('#edit-link-type select').single('change', _.bind(me.onTypeChange, me));
            },

            // Handlers

            onTypeChange: function (e) {
                var val = parseInt($(e.currentTarget).val());

                $('#edit-link-sheet, #edit-link-range').css('display', (val == Asc.c_oAscHyperlinkType.RangeLink) ? 'block' : 'none');
                $('#edit-link-link').css('display', (val != Asc.c_oAscHyperlinkType.RangeLink) ? 'block' : 'none');

                var requireInput = (val == Asc.c_oAscHyperlinkType.RangeLink) ? $('#edit-link-range input') : $('#edit-link-link input');

                $('#edit-link-edit').toggleClass('disabled', _.isEmpty(requireInput.val()));
            },

            onEdit: function () {
                var me = this,
                    linkProps = new Asc.asc_CHyperlink(),
                    defaultDisplay = "",
                    $type = $('#edit-link-type select'),
                    $sheet = $('#edit-link-sheet select'),
                    $range = $('#edit-link-range input'),
                    $link = $('#edit-link-link input'),
                    $display = $('#edit-link-display input'),
                    $tip = $('#edit-link-tip input'),
                    type = parseInt($type.val());

                linkProps.asc_setType(type);

                if (type == Asc.c_oAscHyperlinkType.RangeLink) {
                    var range = $.trim($range.val()),
                        isValidRange = /^[A-Z]+[1-9]\d*:[A-Z]+[1-9]\d*$/.test(range);

                    if (!isValidRange)
                        isValidRange = /^[A-Z]+[1-9]\d*$/.test(range);

                    if (!isValidRange) {
                        uiApp.alert(me.textInvalidRange);
                        return;
                    }

                    linkProps.asc_setSheet($sheet.val());
                    linkProps.asc_setRange(range);
                    defaultDisplay = $sheet.val() + '!' + range;
                } else {
                    var url = $link.val().replace(/^\s+|\s+$/g,'');

                    if (! /(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(url)) {
                        var urlType = me.api.asc_getUrlType($.trim(url));

                        if (urlType < 1) {
                            uiApp.alert(me.txtNotUrl);
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
            txtNotUrl: 'This field should be a URL in the format \"http://www.example.com\"'
        }
    })(), SSE.Controllers.EditHyperlink || {}))
});