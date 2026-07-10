/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
if (Common === undefined) {
    var Common = {};
}

if (Common.define === undefined) {
    Common.define = {};
}

define(function(){ 'use strict';

    Common.define.conditionalData = _.extend( new(function() {
        return {
            textDate: 'Date',
            textYesterday: 'Yesterday',
            textToday: 'Today',
            textTomorrow: 'Tomorrow',
            textLast7days: 'In the last 7 days',
            textLastWeek: 'Last week',
            textThisWeek: 'This week',
            textNextWeek: 'Next week',
            textLastMonth: 'Last month',
            textThisMonth: 'This month',
            textNextMonth: 'Next month',
            textText: 'Text',
            textContains: 'Contains',
            textNotContains: 'Does not contain',
            textBegins: 'Begins with',
            textEnds: 'Ends with',
            textAverage: 'Average',
            textAbove: 'Above',
            textBelow: 'Below',
            textEqAbove: 'Equal to or above',
            textEqBelow: 'Equal to or below',
            text1Above: '1 std dev above',
            text1Below: '1 std dev below',
            text2Above: '2 std dev above',
            text2Below: '2 std dev below',
            text3Above: '3 std dev above',
            text3Below: '3 std dev below',
            textGreater: 'Greater than',
            textGreaterEq: 'Greater than or equal to',
            textLess: 'Less than',
            textLessEq: 'Less than or equal to',
            textEqual: 'Equal to',
            textNotEqual: 'Not equal to',
            textBetween: 'Between',
            textNotBetween: 'Not between',
            textTop: 'Top',
            textBottom: 'Bottom',
            textBlank: 'Blank',
            textError: 'Error',
            textBlanks: 'Contains blanks',
            textNotBlanks: 'Does not contain blanks',
            textErrors: 'Contains errors',
            textNotErrors: 'Does not contain errors',
            textDuplicate: 'Duplicate',
            textUnique: 'Unique',
            textDataBar: 'Data bar',
            textIconSets: 'Icon sets',
            textFormula: 'Formula',
            exampleText: 'AaBbCcYyZz',
            noFormatText: 'No format set',
            textValue: 'Value is'
        }
    })(), Common.define.conditionalData || {});

});