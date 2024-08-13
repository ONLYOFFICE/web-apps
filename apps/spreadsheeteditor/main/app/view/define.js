/*
 * (c) Copyright Ascensio System SIA 2010-2024
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
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
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