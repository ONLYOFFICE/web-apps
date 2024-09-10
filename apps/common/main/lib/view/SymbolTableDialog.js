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

/**
 *  SymbolTableDialog.js
 *
 *  Created on 07.11.2019
 *
 */
if (Common === undefined)
    var Common = {};

define([
    'common/main/lib/util/character'
], function () { 'use strict';
    var oRangeNames = {};
    oRangeNames[1] =  'Basic Latin';
    oRangeNames[2] =  'Latin 1 Supplement';
    oRangeNames[3] =  'Latin Extended A';
    oRangeNames[4] =  'Latin Extended B';
    oRangeNames[5] =  'IPA Extensions';
    oRangeNames[6] =  'Spacing Modifier Letters';
    oRangeNames[7] =  'Combining Diacritical Marks';
    oRangeNames[8] =  'Greek and Coptic';
    oRangeNames[9] =  'Cyrillic';
    oRangeNames[10] =  'Cyrillic Supplement';
    oRangeNames[11] =  'Armenian';
    oRangeNames[12] =  'Hebrew';
    oRangeNames[13] =  'Arabic';
    oRangeNames[14] =  'Syriac';
    oRangeNames[15] =  'Arabic Supplement';
    oRangeNames[16] =  'Thaana';
    oRangeNames[17] =  'NKo';
    oRangeNames[18] =  'Samaritan';
    oRangeNames[19] =  'Mandaic';
    oRangeNames[20] =  'Arabic Extended A';
    oRangeNames[21] =  'Devanagari';
    oRangeNames[22] =  'Bengali';
    oRangeNames[23] =  'Gurmukhi';
    oRangeNames[24] =  'Gujarati';
    oRangeNames[25] =  'Oriya';
    oRangeNames[26] =  'Tamil';
    oRangeNames[27] =  'Telugu';
    oRangeNames[28] =  'Kannada';
    oRangeNames[29] =  'Malayalam';
    oRangeNames[30] =  'Sinhala';
    oRangeNames[31] =  'Thai';
    oRangeNames[32] =  'Lao';
    oRangeNames[33] =  'Tibetan';
    oRangeNames[34] =  'Myanmar';
    oRangeNames[35] =  'Georgian';
    oRangeNames[36] =  'Hangul Jamo';
    oRangeNames[37] =  'Ethiopic';
    oRangeNames[38] =  'Ethiopic Supplement';
    oRangeNames[39] =  'Cherokee';
    oRangeNames[40] =  'Unified Canadian Aboriginal Syllabics';
    oRangeNames[41] =  'Ogham';
    oRangeNames[42] =  'Runic';
    oRangeNames[43] =  'Tagalog';
    oRangeNames[44] =  'Hanunoo';
    oRangeNames[45] =  'Buhid';
    oRangeNames[46] =  'Tagbanwa';
    oRangeNames[47] =  'Khmer';
    oRangeNames[48] =  'Mongolian';
    oRangeNames[49] =  'Unified Canadian Aboriginal Syllabics Extended';
    oRangeNames[50] =  'Limbu';
    oRangeNames[51] =  'Tai Le';
    oRangeNames[52] =  'New Tai Lue';
    oRangeNames[53] =  'Khmer Symbols';
    oRangeNames[54] =  'Buginese';
    oRangeNames[55] =  'Tai Tham';
    oRangeNames[56] =  'Combining Diacritical Marks Extended';
    oRangeNames[57] =  'Balinese';
    oRangeNames[58] =  'Sundanese';
    oRangeNames[59] =  'Batak';
    oRangeNames[60] =  'Lepcha';
    oRangeNames[61] =  'Ol Chiki';
    oRangeNames[62] =  'Cyrillic Extended C';
    oRangeNames[63] =  'Sundanese Supplement';
    oRangeNames[64] =  'Vedic Extensions';
    oRangeNames[65] =  'Phonetic Extensions';
    oRangeNames[66] =  'Phonetic Extensions Supplement';
    oRangeNames[67] =  'Combining Diacritical Marks Supplement';
    oRangeNames[68] =  'Latin Extended Additional';
    oRangeNames[69] =  'Greek Extended';
    oRangeNames[70] =  'General Punctuation';
    oRangeNames[71] =  'Superscripts and Subscripts';
    oRangeNames[72] =  'Currency Symbols';
    oRangeNames[73] =  'Combining Diacritical Marks for Symbols';
    oRangeNames[74] =  'Letterlike Symbols';
    oRangeNames[75] =  'Number Forms';
    oRangeNames[76] =  'Arrows';
    oRangeNames[77] =  'Mathematical Operators';
    oRangeNames[78] =  'Miscellaneous Technical';
    oRangeNames[79] =  'Control Pictures';
    oRangeNames[80] =  'Optical Character Recognition';
    oRangeNames[81] =  'Enclosed Alphanumerics';
    oRangeNames[82] =  'Box Drawing';
    oRangeNames[83] =  'Block Elements';
    oRangeNames[84] =  'Geometric Shapes';
    oRangeNames[85] =  'Miscellaneous Symbols';
    oRangeNames[86] =  'Dingbats';
    oRangeNames[87] =  'Miscellaneous Mathematical Symbols A';
    oRangeNames[88] =  'Supplemental Arrows A';
    oRangeNames[89] =  'Braille Patterns';
    oRangeNames[90] =  'Supplemental Arrows B';
    oRangeNames[91] =  'Miscellaneous Mathematical Symbols B';
    oRangeNames[92] =  'Supplemental Mathematical Operators';
    oRangeNames[93] =  'Miscellaneous Symbols and Arrows';
    oRangeNames[94] =  'Glagolitic';
    oRangeNames[95] =  'Latin Extended C';
    oRangeNames[96] =  'Coptic';
    oRangeNames[97] =  'Georgian Supplement';
    oRangeNames[98] =  'Tifinagh';
    oRangeNames[99] =  'Ethiopic Extended';
    oRangeNames[100] =  'Cyrillic Extended A';
    oRangeNames[101] =  'Supplemental Punctuation';
    oRangeNames[102] =  'CJK Radicals Supplement';
    oRangeNames[103] =  'Kangxi Radicals';
    oRangeNames[104] =  'Ideographic Description Characters';
    oRangeNames[105] =  'CJK Symbols and Punctuation';
    oRangeNames[106] =  'Hiragana';
    oRangeNames[107] =  'Katakana';
    oRangeNames[108] =  'Bopomofo';
    oRangeNames[109] =  'Hangul Compatibility Jamo';
    oRangeNames[110] =  'Kanbun';
    oRangeNames[111] =  'Bopomofo Extended';
    oRangeNames[112] =  'CJK Strokes';
    oRangeNames[113] =  'Katakana Phonetic Extensions';
    oRangeNames[114] =  'Enclosed CJK Letters and Months';
    oRangeNames[115] =  'CJK Compatibility';
    oRangeNames[116] =  'CJK Unified Ideographs Extension';
    oRangeNames[117] =  'Yijing Hexagram Symbols';
    oRangeNames[118] =  'CJK Unified Ideographs';
    oRangeNames[119] =  'Yi Syllables';
    oRangeNames[120] =  'Yi Radicals';
    oRangeNames[121] =  'Lisu';
    oRangeNames[122] =  'Vai';
    oRangeNames[123] =  'Cyrillic Extended B';
    oRangeNames[124] =  'Bamum';
    oRangeNames[125] =  'Modifier Tone Letters';
    oRangeNames[126] =  'Latin Extended D';
    oRangeNames[127] =  'Syloti Nagri';
    oRangeNames[128] =  'Common Indic Number Forms';
    oRangeNames[129] =  'Phags pa';
    oRangeNames[130] =  'Saurashtra';
    oRangeNames[131] =  'Devanagari Extended';
    oRangeNames[132] =  'Kayah Li';
    oRangeNames[133] =  'Rejang';
    oRangeNames[134] =  'Hangul Jamo Extended A';
    oRangeNames[135] =  'Javanese';
    oRangeNames[136] =  'Myanmar Extended B';
    oRangeNames[137] =  'Cham';
    oRangeNames[138] =  'Myanmar Extended A';
    oRangeNames[139] =  'Tai Viet';
    oRangeNames[140] =  'Meetei Mayek Extensions';
    oRangeNames[141] =  'Ethiopic Extended A';
    oRangeNames[142] =  'Latin Extended E';
    oRangeNames[143] =  'Cherokee Supplement';
    oRangeNames[144] =  'Meetei Mayek';
    oRangeNames[145] =  'Hangul Syllables';
    oRangeNames[146] =  'Hangul Jamo Extended B';
    oRangeNames[147] =  'High Surrogates';
    oRangeNames[148] =  'High Private Use Surrogates';
    oRangeNames[149] =  'Low Surrogates';
    oRangeNames[150] =  'Private Use Area';
    oRangeNames[151] =  'CJK Compatibility Ideographs';
    oRangeNames[152] =  'Alphabetic Presentation Forms';
    oRangeNames[153] =  'Arabic Presentation Forms A';
    oRangeNames[154] =  'Variation Selectors';
    oRangeNames[155] =  'Vertical Forms';
    oRangeNames[156] =  'Combining Half Marks';
    oRangeNames[157] =  'CJK Compatibility Forms';
    oRangeNames[158] =  'Small Form Variants';
    oRangeNames[159] =  'Arabic Presentation Forms B';
    oRangeNames[160] =  'Halfwidth and Fullwidth Forms';
    oRangeNames[161] =  'Specials';
    oRangeNames[162] =  'Linear B Syllabary';
    oRangeNames[163] =  'Linear B Ideograms';
    oRangeNames[164] =  'Aegean Numbers';
    oRangeNames[165] =  'Ancient Greek Numbers';
    oRangeNames[166] =  'Ancient Symbols';
    oRangeNames[167] =  'Phaistos Disc';
    oRangeNames[168] =  'Lycian';
    oRangeNames[169] =  'Carian';
    oRangeNames[170] =  'Coptic Epact Numbers';
    oRangeNames[171] =  'Old Italic';
    oRangeNames[172] =  'Gothic';
    oRangeNames[173] =  'Old Permic';
    oRangeNames[174] =  'Ugaritic';
    oRangeNames[175] =  'Old Persian';
    oRangeNames[176] =  'Deseret';
    oRangeNames[177] =  'Shavian';
    oRangeNames[178] =  'Osmanya';
    oRangeNames[179] =  'Osage';
    oRangeNames[180] =  'Elbasan';
    oRangeNames[181] =  'Caucasian Albanian';
    oRangeNames[182] =  'Linear A';
    oRangeNames[183] =  'Cypriot Syllabary';
    oRangeNames[184] =  'Imperial Aramaic';
    oRangeNames[185] =  'Palmyrene';
    oRangeNames[186] =  'Nabataean';
    oRangeNames[187] =  'Hatran';
    oRangeNames[188] =  'Phoenician';
    oRangeNames[189] =  'Lydian';
    oRangeNames[190] =  'Meroitic Hieroglyphs';
    oRangeNames[191] =  'Meroitic Cursive';
    oRangeNames[192] =  'Kharoshthi';
    oRangeNames[193] =  'Old South Arabian';
    oRangeNames[194] =  'Old North Arabian';
    oRangeNames[195] =  'Manichaean';
    oRangeNames[196] =  'Avestan';
    oRangeNames[197] =  'Inscriptional Parthian';
    oRangeNames[198] =  'Inscriptional Pahlavi';
    oRangeNames[199] =  'Psalter Pahlavi';
    oRangeNames[200] =  'Old Turkic';
    oRangeNames[201] =  'Old Hungarian';
    oRangeNames[202] =  'Rumi Numeral Symbols';
    oRangeNames[203] =  'Brahmi';
    oRangeNames[204] =  'Kaithi';
    oRangeNames[205] =  'Sora Sompeng';
    oRangeNames[206] =  'Chakma';
    oRangeNames[207] =  'Mahajani';
    oRangeNames[208] =  'Sharada';
    oRangeNames[209] =  'Sinhala Archaic Numbers';
    oRangeNames[210] =  'Khojki';
    oRangeNames[211] =  'Multani';
    oRangeNames[212] =  'Khudawadi';
    oRangeNames[213] =  'Grantha';
    oRangeNames[214] =  'Newa';
    oRangeNames[215] =  'Tirhuta';
    oRangeNames[216] =  'Siddham';
    oRangeNames[217] =  'Modi';
    oRangeNames[218] =  'Mongolian Supplement';
    oRangeNames[219] =  'Takri';
    oRangeNames[220] =  'Ahom';
    oRangeNames[221] =  'Warang Citi';
    oRangeNames[222] =  'Pau Cin Hau';
    oRangeNames[223] =  'Bhaiksuki';
    oRangeNames[224] =  'Marchen';
    oRangeNames[225] =  'Cuneiform';
    oRangeNames[226] =  'Cuneiform Numbers and Punctuation';
    oRangeNames[227] =  'Early Dynastic Cuneiform';
    oRangeNames[228] =  'Egyptian Hieroglyphs';
    oRangeNames[229] =  'Anatolian Hieroglyphs';
    oRangeNames[230] =  'Bamum Supplement';
    oRangeNames[231] =  'Mro';
    oRangeNames[232] =  'Bassa Vah';
    oRangeNames[233] =  'Pahawh Hmong';
    oRangeNames[234] =  'Miao';
    oRangeNames[235] =  'Ideographic Symbols and Punctuation';
    oRangeNames[236] =  'Tangut';
    oRangeNames[237] =  'Tangut Components';
    oRangeNames[238] =  'Kana Supplement';
    oRangeNames[239] =  'Duployan';
    oRangeNames[240] =  'Shorthand Format Controls';
    oRangeNames[241] =  'Byzantine Musical Symbols';
    oRangeNames[242] =  'Musical Symbols';
    oRangeNames[243] =  'Ancient Greek Musical Notation';
    oRangeNames[244] =  'Tai Xuan Jing Symbols';
    oRangeNames[245] =  'Counting Rod Numerals';
    oRangeNames[246] =  'Mathematical Alphanumeric Symbols';
    oRangeNames[247] =  'Sutton SignWriting';
    oRangeNames[248] =  'Glagolitic Supplement';
    oRangeNames[249] =  'Mende Kikakui';
    oRangeNames[250] =  'Adlam';
    oRangeNames[251] =  'Arabic Mathematical Alphabetic Symbols';
    oRangeNames[252] =  'Mahjong Tiles';
    oRangeNames[253] =  'Domino Tiles';
    oRangeNames[254] =  'Playing Cards';
    oRangeNames[255] =  'Enclosed Alphanumeric Supplement';
    oRangeNames[256] =  'Enclosed Ideographic Supplement';
    oRangeNames[257] =  'Miscellaneous Symbols and Pictographs';
    oRangeNames[258] =  'Emoticons';
    oRangeNames[259] =  'Ornamental Dingbats';
    oRangeNames[260] =  'Transport and Map Symbols';
    oRangeNames[261] =  'Alchemical Symbols';
    oRangeNames[262] =  'Geometric Shapes Extended';
    oRangeNames[263] =  'Supplemental Arrows C';
    oRangeNames[264] =  'Supplemental Symbols and Pictographs';
    oRangeNames[265] =  'CJK Unified Ideographs Extension B';
    oRangeNames[266] =  'CJK Unified Ideographs Extension C';
    oRangeNames[267] =  'CJK Unified Ideographs Extension D';
    oRangeNames[268] =  'CJK Unified Ideographs Extension E';
    oRangeNames[269] =  'CJK Compatibility Ideographs Supplement';
    oRangeNames[270] =  'Tags';
    oRangeNames[271] =  'Variation Selectors Supplement';
    oRangeNames[272] =  'Supplementary Private Use Area A';
    oRangeNames[273] =  'Supplementary Private Use Area B';

    var CELL_WIDTH = 31;
    var CELL_HEIGHT = 33;

    var aFontSelects = [];
    var aRanges = [];
    var aRecents = [];
    var nCurrentFont = -1;// индекс в aFontSelects
    var nCurrentSymbol = -1;// code
    var bMainFocus = true;//фокус в основной таблице
    var nFontNameRecent = -1;

    var nMaxRecent = 36;
    var bScrollMouseUp = false;

    var sInitFont = "";
    var sInitSymbol = "";

    var nLastScroll = -1000;

    var sLastId = "";
    var nLastTime = -1000;

    var lastTime = -1;
    var lastKeyCode = -1;

    var minScrollbarLength = 20;
    var wheelSpeed = 20;


    var loadTranslation = function(lang, callback) {
        lang = lang.split(/[\-_]/)[0].toLocaleLowerCase();
        Common.Utils.loadConfig('resources/symboltable/' + lang + '.json', function (langJson) {
            for (var i=1; i<274; i++) {
                var val = oRangeNames[i];
                oRangeNames[i] = langJson[val] || val;
            }
            callback && callback();
        });
    };

    Common.Views.SymbolTableDialog = Common.UI.Window.extend(_.extend({
        options: {
            resizable       : true,
            minwidth        : 448,
            minheight       : 434,
            width: 448,
            height: 434,
            cls: 'modal-dlg invisible-borders',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            var config = {
                resizable       : true,
                minwidth        : 448,
                minheight       : 434,
                width: 448,
                height: 434,
                cls: 'modal-dlg invisible-borders',
                buttons: ['ok', 'cancel']
            };

            var filter = Common.localStorage.getKeysFilter();
            this.appPrefix = (filter && filter.length) ? filter.split(',')[0] : '';

            var path = this.appPrefix + 'settings-size-symbol-table',
                size = Common.Utils.InternalSettings.get(path);
            if (size==null || size==undefined) {
                size = Common.localStorage.getItem(path) || '';
                Common.Utils.InternalSettings.set(path, size);
            }
            size = size ? JSON.parse(size) : [];

            this.options = _.extend(config, {
                title: this.textTitle,
                width           : size[0] || 448,
                height          : size[1] || 434
            }, options || {});

            this.api = this.options.api;
            this.type = this.options.type || 0; // 0 - close on OK, single adding symbol
            this.special = this.options.special || false; // true - show special tab
            this.showShortcutKey = this.options.showShortcutKey || false;
            !this.special && (this.options.height -= 38);
            !this.special && (this.options.minheight -= 38);

            this.template = [
                '<div class="box">',
                    '<div style="margin-bottom: 16px;" class="'+ (this.special ? '' : 'hidden') +'">',
                        '<button type="button" class="btn btn-text-default auto" id="symbol-table-symbols">', this.textSymbols,'</button>',
                        '<button type="button" class="btn btn-text-default auto" id="symbol-table-special">', this.textSpecial,'</button>',
                    '</div>',
                    '<div id="symbol-table-pnl-symbols">',
                        '<table cols="2" style="width: 100%;max-width: 497px;">',
                            '<tr>',
                                '<td class="padding-right-5" style="padding-bottom: 8px;width: 50%;">',
                                    '<label class="input-label">' + this.textFont + '</label>',
                                    '<div id="symbol-table-cmb-fonts"></div>',
                                '</td>',
                                '<td class="padding-left-5" style="padding-bottom: 8px;">',
                                    '<label class="input-label">' + this.textRange + '</label>',
                                    '<div id="symbol-table-cmb-range"></div>',
                                '</td>',
                            '</tr>',
                        '</table>',
                        '<table cols="1" style="width: 100%;">',
                            '<tr>',
                                '<td style="padding-bottom: 16px;">',
                                    '<div id="symbol-table-scrollable-div" style="position: relative;height:'+ (this.options.height-304 + 38*(this.special ? 0 : 1)) + 'px;">',
                                        '<div style="width: 100%;">',
                                            '<div id="id-preview">',
                                                '<div>',
                                                    '<div style="position: absolute; top: 0;"><div id="id-preview-data" tabindex="0" oo_editor_input="true"></div></div>',
                                                '</div>',
                                            '</div>',
                                        '</div>',
                                    '</div>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td style="padding-bottom: 16px;">',
                                    '<label class="input-label">' + this.textRecent + '</label>',
                                    '<div id="symbol-table-recent" tabindex="0" oo_editor_input="true" style="width: 100%;"></div>',
                                '</td>',
                            '</tr>',
                        '</table>',
                        '<table cols="2" style="width: 100%;max-width: 497px;">',
                            '<tr>',
                                '<td class="padding-right-5" style="width: 50%;">',
                                    '<label class="input-label">' + this.textCode + '</label>',
                                '</td>',
                                '<td class="padding-left-5">',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td class="padding-right-5">',
                                    '<div id="symbol-table-text-code" oo_editor_input="true"></div>',
                                '</td>',
                                '<td class="padding-left-5">',
                                    '<div id="symbol-table-label-font" style="overflow: hidden; text-overflow: ellipsis;white-space: nowrap;max-width: 160px;"></div>',
                                '</td>',
                            '</tr>',
                        '</table>',
                    '</div>',
                    '<div id="symbol-table-pnl-special">',
                        '<table cols="1" style="width: 100%;">',
                            '<tr>',
                                '<td>',
                                    '<label>' + this.textCharacter + '</label>',
                                    '<label id="symbol-table-lbl-shortcut" style="width: 112px;" class="float-right">' + this.textShortcut + '</label>',
                                '</td>',
                            '</tr>',
                            '<tr>',
                                '<td>',
                                    '<div id="symbol-table-special-list" class="no-borders" style="width:100%; height: '+ (this.options.height-157 + 38*(this.special ? 0 : 1)) + 'px;"></div>',
                                '</td>',
                            '</tr>',
                        '</table>',
                    '</div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            var init = (aFontSelects.length<1);
            init && this.initFonts();

            //fill recents
            this.fillRecentSymbols();

            var lastfont;
            if (options.font) {
                lastfont = options.font;
            } else if (aRecents.length>0) {
                lastfont = aRecents[0].font;
            }
            if (lastfont) {
                for(var i = 0; i < aFontSelects.length; ++i){
                    if(aFontSelects[i].displayValue === lastfont){
                        nCurrentFont = i;
                        break;
                    }
                }
            }

            if (nCurrentFont < 0)
                nCurrentFont = 0;

            aRanges = this.getArrRangesByFont(nCurrentFont);
            if(sInitSymbol && sInitSymbol.length > 0){
                nCurrentSymbol = this.fixedCharCodeAt(sInitSymbol, 0);
                if(false === nCurrentSymbol){
                    nCurrentSymbol = -1;
                }
                else{
                    for(var i = 0; i < aRanges.length; ++i){
                        if(nCurrentSymbol >= aRanges[i].Start && nCurrentSymbol <= aRanges[i].End){
                            break;
                        }
                    }
                    if(i === aRanges.length){
                        nCurrentSymbol = -1;
                    }
                }
            }
            if(nCurrentSymbol === -1){
                nCurrentSymbol = aRanges[0].Start;
            }

            if (options.code) {
                nCurrentSymbol = options.code;
            } else if (options.symbol) {
                nCurrentSymbol = this.fixedCharCodeAt(options.symbol, 0);
            } else if (aRecents.length>0) {
                nCurrentSymbol = aRecents[0].symbol;
            }

            if (init && this.options.lang && this.options.lang != 'en') {
                var me = this;
                loadTranslation(this.options.lang, function(){
                    me.updateRangeSelector();
                });
            }

            Common.UI.Window.prototype.initialize.call(this, this.options);

            this.on('resizing', _.bind(this.onWindowResizing, this));
            this.on('resize', _.bind(this.onWindowResize, this));

            bMainFocus = true;
        },

        initFonts: function() {
            var fontList = this.api.pluginMethod_GetFontList();
            fontList.sort(function(a, b){
                if(a.m_wsFontName < b.m_wsFontName) return -1;
                if(a.m_wsFontName > b.m_wsFontName) return 1;
                return 0;
            });

            var oCurFont, oLastFont;
            var data = [];
            var oFontsByName = {};
            var sCurFontNameInMap;
            for(var i = 0; i < fontList.length; ++i){
                oCurFont = fontList[i];
                sCurFontNameInMap = oCurFont.m_wsFontName;
                oLastFont = oFontsByName[sCurFontNameInMap];
                if(!oLastFont){
                    oFontsByName[sCurFontNameInMap] = oCurFont;
                }
                else{
                    if(oLastFont.m_bBold && oLastFont.m_bItalic){
                        oFontsByName[sCurFontNameInMap] = oCurFont;
                    }
                    else if(oLastFont.m_bBold && !oCurFont.m_bBold){
                        oFontsByName[sCurFontNameInMap] = oCurFont;
                    }
                    else if(oLastFont.m_bItalic && !oCurFont.m_bBold && !oCurFont.m_bItalic){
                        oFontsByName[sCurFontNameInMap] = oCurFont;
                    }
                }
            }
            delete oFontsByName['ASCW3'];
            var i = 0;
            for(var key in oFontsByName){
                if(oFontsByName.hasOwnProperty(key)){
                    data.push(oFontsByName[key]);
                    data[data.length-1].displayValue = oFontsByName[key].m_wsFontName;
                }
            }

            //initialize params
            aFontSelects = data;
            aFontSelects.sort(function(a, b){return (a.displayValue.toLowerCase() > b.displayValue.toLowerCase()) ? 1 : -1;});
            for(i = 0; i < aFontSelects.length; ++i){
                aFontSelects[i].value = i;
            }

            if(!oFontsByName[sInitFont]){
                if(oFontsByName['Cambria Math']){
                    sInitFont = 'Cambria Math';
                }
                else if(oFontsByName['Asana-Math']){
                    sInitFont = 'Asana-Math';
                }
            }
            if(oFontsByName[sInitFont]){
                for(i = 0; i < aFontSelects.length; ++i){
                    if(aFontSelects[i].displayValue === sInitFont){
                        nCurrentFont = i;
                        break;
                    }
                }
            }
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            var me = this,
                $window = this.getChild();

            this.btnSymbols = new Common.UI.Button({
                el: $window.find('#symbol-table-symbols'),
                enableToggle: true,
                toggleGroup: 'hyperlink-type',
                allowDepress: false,
                pressed: true
            });
            this.btnSymbols.on('click', _.bind(this.onModeClick, this, false));

            this.btnSpecial = new Common.UI.Button({
                el: $window.find('#symbol-table-special'),
                enableToggle: true,
                toggleGroup: 'hyperlink-type',
                allowDepress: false
            });
            this.btnSpecial.on('click', _.bind(this.onModeClick, this, true));

            // symbols

            this.cmbFonts = new Common.UI.ComboBox({
                el          : $window.find('#symbol-table-cmb-fonts'),
                cls         : 'input-group-nr',
                data        : aFontSelects,
                editable    : false,
                search      : true,
                menuStyle   : 'min-width: 100%; max-height: 209px;'
            }).on('selected', function(combo, record) {
                var oCurrentRange = me.getRangeBySymbol(aRanges, nCurrentSymbol);
                nCurrentFont = record.value;
                aRanges = me.getArrRangesByFont(nCurrentFont);
                if(oCurrentRange){
                    for(var i = 0; i < aRanges.length; ++i){
                        if(oCurrentRange.Name === aRanges[i].Name){
                            break;
                        }
                    }
                    if(i === aRanges.length){
                        nCurrentSymbol = aRanges[0].Start;
                    }
                }
                else{
                    nCurrentSymbol = aRanges[0].Start;
                }
                bMainFocus = true;
                me.updateView();
                setTimeout(function(){
                    me.previewPanel.focus();
                }, 1);
            });
            this.cmbFonts.setValue(nCurrentFont);

            this.cmbRange = new Common.UI.ComboBox({
                el          : $window.find('#symbol-table-cmb-range'),
                cls         : 'input-group-nr',
                editable    : false,
                search      : true,
                menuStyle   : 'min-width: 100%; max-height: 209px;'
            }).on('selected', function(combo, record) {
                var oCurrentRange = me.getRangeByName(aRanges, parseInt(record.value));
                nCurrentSymbol = oCurrentRange.Start;
                bMainFocus = true;
                me.updateView(undefined, undefined, undefined, undefined, false);
                setTimeout(function(){
                    me.previewPanel.focus();
                }, 1);
            });
            this.updateRangeSelector();

            me.inputCode = new Common.UI.InputField({
                el          : $window.find('#symbol-table-text-code'),
                allowBlank  : false,
                blankError  : me.txtEmpty,
                style       : 'width: 100%;',
                validateOnBlur: false,
                validateOnChange: true
            }).on('changing', function(cmp, newValue, oldValue) {
                var value = parseInt(newValue, 16);
                if(!isNaN(value) && value > 0x1F){
                    var oRange = me.getRangeBySymbol(aRanges, value);
                    if(oRange){
                        var bUpdateTable = ($window.find("#c" + value).length === 0);
                        nCurrentSymbol = value;
                        bMainFocus = true;
                        me.updateView(bUpdateTable, undefined, false);
                    }
                }
            }).on('change:after', function(cmp, newValue, oldValue) {
                me.updateInput();
            });

            this.symbolTablePanel = $window.find('#symbol-table-scrollable-div');
            this.previewPanel = $window.find('#id-preview-data');
            this.previewParent = this.previewPanel.parent();
            this.previewScrolled = $window.find('#id-preview');
            this.previewInner = this.previewScrolled.find('> div:first-child');
            this.recentPanel = $window.find('#symbol-table-recent');
            this.fontLabel = $window.find("#symbol-table-label-font");
            this.boxPanel = $window.find('.box');
            this.updateView(undefined, undefined, undefined, true);

            // special
            var data = [{symbol: '—',  description: this.textEmDash,       shortcutKey: Common.Utils.String.platformKey(Common.Utils.isMac ? 'Alt Shift -' : 'Alt+Ctrl+Num -', '{0}'), code: '2014'},
                        {symbol: '–',   description: this.textEnDash,       shortcutKey: Common.Utils.String.platformKey(Common.Utils.isMac ? 'Ctrl Num -' : 'Ctrl+Num -', '{0}'), code: '2013'},
                        {symbol: '‑',   description: this.textNBHyphen,     shortcutKey: Common.Utils.String.platformKey(Common.Utils.isMac ? 'Ctrl Shift _' : 'Ctrl+Shift+_', '{0}'), code: '002D', special: {"NonBreakingHyphen":true}},
                        // {symbol: '',    description: this.textSHyphen,      shortcutKey: 'Alt+-', code: '00AD'},
                        {symbol: '',    description: this.textEmSpace,      shortcutKey: '', code: '2003'},
                        {symbol: '',    description: this.textEnSpace,      shortcutKey: '', code: '2002'},
                        {symbol: '',    description: this.textQEmSpace,     shortcutKey: '', code: '2005'},
                        {symbol: '°',   description: this.textNBSpace,      shortcutKey: Common.Utils.String.platformKey(Common.Utils.isMac ? 'Alt ' : 'Ctrl+Shift+', '{0}') + 'Space', code: '00A0'},
                        {symbol: '©',   description: this.textCopyright,    shortcutKey: Common.Utils.String.platformKey(Common.Utils.isMac ? 'Alt Ctrl ' : 'Alt+Ctrl+', '{0}') + 'G', code: '00A9'},
                        {symbol: '®',   description: this.textRegistered,   shortcutKey: Common.Utils.String.platformKey(Common.Utils.isMac ? 'Alt Ctrl ' : 'Alt+Ctrl+', '{0}') + 'R', code: '00AE'},
                        {symbol: '™',  description: this.textTradeMark,    shortcutKey: Common.Utils.String.platformKey(Common.Utils.isMac ? 'Alt Ctrl ' : 'Alt+Ctrl+', '{0}') + 'T', code: '2122'},
                        {symbol: '§',   description: this.textSection,      shortcutKey: '', code: '00A7'},
                        {symbol: '¶',   description: this.textPilcrow,      shortcutKey: '', code: '00B6'},
                        {symbol: '…',  description: this.textEllipsis,     shortcutKey: Common.Utils.String.platformKey(Common.Utils.isMac ? 'Alt Ctrl ' : 'Alt+Ctrl+', '{0}') + '.', code: '2026'},
                        {symbol: '‛',   description: this.textSOQuote,      shortcutKey: '', code: '2018'},
                        {symbol: '’',   description: this.textSCQuote,      shortcutKey: '', code: '2019'},
                        {symbol: '‟',   description: this.textDOQuote,      shortcutKey: '', code: '201C'},
                        {symbol: '”',   description: this.textDCQuote,      shortcutKey: '', code: '201D'}
            ];
            this.specialList = new Common.UI.ListView({
                el: $window.find('#symbol-table-special-list'),
                store: new Common.UI.DataViewStore(data),
                simpleAddMode: true,
                cls: 'dbl-clickable',
                itemTemplate: _.template([
                    '<div id="<%= id %>" class="list-item" style="width: 100%;display:flex;">',
                        '<div class="padding-right-5" style="width:70px;text-align: center;"><%= symbol %></div>',
                        '<div class="padding-right-5" style="flex-grow:1;"><%= description %></div>',
                        '<% if (' + this.showShortcutKey + ') { %>',
                            '<div style="width:105px;"><%= shortcutKey %></div>',
                        '<% } %>',
                    '</div>'
                ].join(''))
            });
            this.specialList.on('item:dblclick', _.bind(this.onDblClickSpecialItem, this))
                            .on('entervalue', _.bind(this.onDblClickSpecialItem, this));
            this.specialList.selectByIndex(0);

            this.lblShortCut = $window.find('#symbol-table-lbl-shortcut');
            this.lblShortCut.toggleClass('hidden', !this.showShortcutKey);

            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
            this.symbolsPanel = $window.find('#symbol-table-pnl-symbols');
            this.specialPanel = $window.find('#symbol-table-pnl-special');
        },

        show: function() {
            Common.UI.Window.prototype.show.apply(this, arguments);

            if (!this.binding)
                this.binding = {};
            this.binding.keydownSymbols = _.bind(this.onKeyDown,this);
            this.binding.keypressSymbols = _.bind(this.onKeyPress,this);
            $(document).on('keydown.' + this.cid, '#symbol-table-scrollable-div #id-preview-data, #symbol-table-recent', this.binding.keydownSymbols);
            $(document).on('keypress.' + this.cid, '#symbol-table-scrollable-div #id-preview-data, #symbol-table-recent', this.binding.keypressSymbols);

            var special = this.special && !!Common.Utils.InternalSettings.get(this.appPrefix + "symbol-table-special");
            special ? this.btnSpecial.toggle(true) : this.btnSymbols.toggle(true);
            this.ShowHideElem(special);
        },

        close: function(suppressevent) {
            $(document).off('keydown.' + this.cid, this.binding.keydownSymbols);
            $(document).off('keypress.' + this.cid, this.binding.keypressSymbols);

            this.special && Common.Utils.InternalSettings.set(this.appPrefix + "symbol-table-special", this.btnSpecial.isActive());

            Common.UI.Window.prototype.close.apply(this, arguments);
        },

        getPasteSymbol: function(cellId) {
            var bUpdateRecents = false;
            var sFont;
            if (cellId && cellId.length>0) {
                bUpdateRecents = (cellId[0] === 'c');
                if(bUpdateRecents){
                    sFont = aFontSelects[nCurrentFont].displayValue;
                } else {
                    var nFontId = parseInt(cellId.split('_')[2]);
                    sFont = aFontSelects[nFontId].displayValue;
                }
            }
            return {font: sFont, symbol: this.encodeSurrogateChar(nCurrentSymbol), code: nCurrentSymbol, updateRecents: bUpdateRecents};
        },

        getSpecialSymbol: function() {
            var rec = this.specialList.getSelectedRec();
            return {font: undefined, symbol: this.encodeSurrogateChar(rec.get('code')), code: parseInt(rec.get('code'), 16), special: rec.get('special'), speccharacter: true};
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value, true);
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        _handleInput: function(state, fromButton) {
            if(!fromButton && document.activeElement && document.activeElement.localName == 'textarea' && /area_id/.test(document.activeElement.id)){
                return;
            }

            var special = this.btnSpecial.isActive();
            var settings = (state=='ok') ? (special ? this.getSpecialSymbol() : this.getPasteSymbol(this.$window.find('.cell-selected').attr('id'))) : {};
            if (this.options.handler) {
                this.options.handler.call(this, this, state, settings);
            }
            if (state=='ok') {
                !special && this.checkRecent(nCurrentSymbol, settings.font);
                !special && settings.updateRecents && this.updateRecents();
                if (this.type)
                    return;
            }
            this.close();
        },

        encodeSurrogateChar: function(nUnicode) {
            if (nUnicode < 0x10000)
            {
                return String.fromCharCode(nUnicode);
            }
            else
            {
                nUnicode = nUnicode - 0x10000;
                var nLeadingChar = 0xD800 | (nUnicode >> 10);
                var nTrailingChar = 0xDC00 | (nUnicode & 0x3FF);
                return String.fromCharCode(nLeadingChar) + String.fromCharCode(nTrailingChar);
            }
        },

        fixedCharCodeAt: function(str, idx) {
            idx = idx || 0;
            var code = str.charCodeAt(idx);
            var hi, low;
            if (0xD800 <= code && code <= 0xDBFF) {
                hi = code;
                low = str.charCodeAt(idx + 1);
                if (isNaN(low)) {
                    throw 'Старшая часть суррогатной пары без следующей младшей в fixedCharCodeAt()';
                }
                return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
            }
            if (0xDC00 <= code && code <= 0xDFFF) {
                return false;
            }
            return code;
        },

        getArrRangesByFont: function(nFontName){
            var _ret = getSupportedRangesByFont(aFontSelects[nFontName]);
            if(_ret.length === 0){
                _ret.push({Start:0x20, End: 0xFF});
            }
            if(_ret[0].Start < 0x20){
                _ret[0].Start = 0x20;
            }
            return _ret;
        },

        getRangeBySymbol: function(arrRanges, nCode){
            for(var i = 0; i < arrRanges.length; ++i){
                if(arrRanges[i].Start <= nCode && arrRanges[i].End >= nCode){
                    return arrRanges[i];
                }
            }
            return null;
        },

        getRangeByName: function(arrRanges, nName){
            for(var i = 0; i < arrRanges.length; ++i){
                if(arrRanges[i].Name === nName){
                    return arrRanges[i];
                }
            }
            return null;
        },

        getLinearIndexByCode: function(arrRanges, nCode){
            var nLinearIndex = -1;
            var nCounter = 0;
            var oCurRange;
            for(var i = 0; i < arrRanges.length; ++i){
                oCurRange = arrRanges[i];
                if(oCurRange.Start > nCode){
                    return -1;
                }
                if(oCurRange.Start <= nCode && oCurRange.End >= nCode){
                    return nCounter + (nCode - oCurRange.Start);
                }
                nCounter += (oCurRange.End - oCurRange.Start + 1);
            }
            return nLinearIndex;
        },

        getCodeByLinearIndex: function(arrRanges, nIndex){
            if(nIndex < 0){
                return -1;
            }
            var nCount = 0;
            var oCurRange = arrRanges[0];
            var nDiff;
            for(var i = 0; i < arrRanges.length; ++i){
                oCurRange = arrRanges[i];
                nDiff = oCurRange.End - oCurRange.Start + 1;
                if(nCount + nDiff > nIndex){
                    return oCurRange.Start + nIndex - nCount;
                }
                nCount += nDiff;
            }
            return -1;
        },

        createTable: function(arrSym, nRowsCount, nColsCount){
            var nDivCount = nRowsCount*nColsCount;
            var nCellsCounter = 0;
            var sInnerHtml = '';
            var sId;
            var sStyle = 'style=\'border-bottom: none\'';
            var sCellStyle;
            for(var i = 0; i < nDivCount; ++i){


                if(((i / nColsCount) >> 0) === (nRowsCount - 1)){
                    sCellStyle = sStyle;
                }
                else{
                    sCellStyle = '';
                }
                if(i < arrSym.length){
                    sId = 'c' + arrSym[i];
                    sInnerHtml += '<div dir=\"ltr\" class=\"cell\" '+sCellStyle +' id=\"' + sId + '\">' + '&#' + arrSym[i].toString(10) + '</div>';
                }
                else{
                    sInnerHtml += '<div dir=\"ltr\" class=\"cell\"'+sCellStyle +'></div>';
                }
                ++nCellsCounter;
                if(nCellsCounter >= nColsCount){
                    sInnerHtml +=  '<br class=\"noselect\">';
                    nCellsCounter = 0;
                }
            }
            this.previewPanel.html(sInnerHtml);
        },

        fillRecentSymbols: function(){
            var sRecents = Common.localStorage.getItem(this.appPrefix + 'recentSymbols');
            var aRecentCookies;
            if(sRecents != ''){
                aRecentCookies = JSON.parse(sRecents);
            }
            if(_.isArray(aRecentCookies)){
                aRecents = aRecentCookies;
            }
        },

        saveRecent: function(){
            var sJSON = JSON.stringify(aRecents);
            Common.localStorage.setItem(this.appPrefix + 'recentSymbols', sJSON);
        },

        checkRecent: function(sSymbol, sFont){
            if(aRecents.length === 0){
                aRecents.push({symbol: sSymbol, font: sFont});
                this.saveRecent();
                return;
            }
            for(var i = 0; i < aRecents.length; ++i){
                if(aRecents[i].symbol === sSymbol && aRecents[i].font === sFont){
                    aRecents.splice(i, 1);
                    break;
                }
            }
            aRecents.splice(0, 0, {symbol: sSymbol, font: sFont});
            if(aRecents.length > nMaxRecent){
                aRecents.splice(nMaxRecent, aRecents.length - nMaxRecent);
            }
            this.saveRecent();
        },

        createCell: function(nSymbolCode, sFontName){
            var sId = '',
                symbol = '';
            if(sFontName){
                var nFontIndex = 0;
                for(var i = 0; i < aFontSelects.length; ++i){
                    if(aFontSelects[i].displayValue === sFontName){
                        nFontIndex = i;
                        break;
                    }
                }
                sId = 'r_' + nSymbolCode + '_' + nFontIndex;
                symbol = '&#' + nSymbolCode.toString();
            } else if (nSymbolCode!==undefined) {
                sId = 'r' + nSymbolCode;
                symbol = '&#' + nSymbolCode.toString();
            }
            var _ret = $('<div dir=\"ltr\" id=\"' + sId + '\">' + symbol + '</div>');
            _ret.addClass('cell');
            _ret.addClass('noselect');
            _ret.mousedown(_.bind(this.cellClickHandler, this));
            if(sFontName){
                _ret.css('font-family', '\'' + sFontName + '\'');
            }
            return _ret;
        },

        cellClickHandler: function (e) {
            var id = $(e.target).attr('id');
            if(!id){
                return;
            }
            var nTime = (new Date()).getTime();
            if(id === sLastId && (nTime - nLastTime) < 300 ){
                this.cellDblClickHandler(e)
            }
            else{
                if(id[0] === 'c'){
                    nCurrentSymbol = parseInt(id.slice(1, id.length));
                    bMainFocus = true;
                }
                else{
                    var aStrings = id.split('_');
                    nCurrentSymbol = parseInt(aStrings[1]);
                    nFontNameRecent = parseInt(aStrings[2]);
                    bMainFocus = false;
                }
                this.updateView(false);
            }
            sLastId = e.target.id;
            nLastTime = nTime;
        },

        cellDblClickHandler: function (e){
            if (!this.type)
                this._handleInput('ok');
            else {
                var settings = this.getPasteSymbol($(e.target).attr('id'));
                this.checkRecent(nCurrentSymbol, settings.font);
                settings.updateRecents && this.updateView(false, undefined, undefined, true);
                this.fireEvent('symbol:dblclick', this, 'ok', settings);
            }
        },

        onDblClickSpecialItem: function(e) {
            if (!this.type)
                this._handleInput('ok');
            else {
                var settings = this.getSpecialSymbol();
                this.fireEvent('symbol:dblclick', this, 'ok', settings);
            }
        },

        updateRecents: function(){
            var oRecentsDiv = this.recentPanel;
            oRecentsDiv.empty();
            var nCols = this.getColsCount(),
                nRecents = aRecents.length;
            oRecentsDiv.width(nCols * CELL_WIDTH);
            for(var i = 0; i < nCols; ++i){
                var oCell = (i<nRecents) ? this.createCell(aRecents[i].symbol, aRecents[i].font) : this.createCell();
                oCell.css('border-bottom', 'none');
                oRecentsDiv.append(oCell);
                if(i === (nCols - 1)){
                    oCell.css(Common.UI.isRTL() ? 'border-left' : 'border-right', 'none');
                }
            }
        },

        getColsCount: function(){
            var nMaxWidth = this.boxPanel.innerWidth()-13;
            return ((nMaxWidth/CELL_WIDTH) >> 0);
        },

        getMaxHeight: function(){
            return this.symbolTablePanel.innerHeight()-2;
        },

        getRowsCount: function() {
            return  Math.max(1, ((this.getMaxHeight()/CELL_HEIGHT) >> 0));
        },

        getAllSymbolsCount: function(arrRanges){
            var _count = 0;
            var oRange;
            for(var i = 0; i < arrRanges.length; ++i){
                oRange = arrRanges[i];
                _count += (oRange.End - oRange.Start + 1);
            }
            return _count;
        },

        setTable: function(nStartCode){
            var nColsCount = this.getColsCount();
            var nRowsCount = this.getRowsCount();
            var nIndexSymbol = this.getLinearIndexByCode(aRanges, nStartCode);
            var nAllSymbolsCount = this.getAllSymbolsCount(aRanges);
            var nAllRowsCount = Math.ceil(nAllSymbolsCount/nColsCount);
            var nRowsSkip = Math.max(0, Math.min(nAllRowsCount - nRowsCount, ((nIndexSymbol / nColsCount) >> 0)));
            var nFirst = nRowsSkip*nColsCount;
            var nSymbolsCount = nRowsCount*nColsCount;
            var aSymbols = [];
            var nCode;
            for(var i = 0; i < nSymbolsCount; ++i){
                nCode = this.getCodeByLinearIndex(aRanges, nFirst + i);
                if(nCode === -1){
                    break;
                }
                aSymbols.push(nCode);
            }
            this.previewPanel.css('font-family',  '\'' + aFontSelects[nCurrentFont].displayValue + '\'');
            this.createTable(aSymbols, nRowsCount, nColsCount);
            return nRowsSkip;
        },

        updateView: function(bUpdateTable, nTopSymbol, bUpdateInput, bUpdateRecents, bUpdateRanges) {
            //fill ranges combo box
            if(bMainFocus){
                if(bUpdateRanges !== false){
                    this.updateRangeSelector();
                }
            }

            if(bMainFocus){
                this.fontLabel.text(aFontSelects[nCurrentFont] ? aFontSelects[nCurrentFont].displayValue : '');
            } else {
                this.fontLabel.text(aFontSelects[nFontNameRecent] ? aFontSelects[nFontNameRecent].displayValue : '');
            }

            if(bUpdateTable !== false){
                //fill fonts combo box
                this.cmbFonts.setValue(nCurrentFont);
            }

            //main table
            var nRowsCount = this.getRowsCount();
            var nHeight = nRowsCount*CELL_HEIGHT;
            bScrollMouseUp = false;
            if(bUpdateTable !== false){
                //fill table
                var nSymbol = (nTopSymbol !== null && nTopSymbol !== undefined)? nTopSymbol : nCurrentSymbol;
                var nRowSkip = this.setTable(nSymbol);
                //update scroll
                var nSymbolsCount = this.getAllSymbolsCount(aRanges);
                var nAllRowsCount = Math.ceil(nSymbolsCount/this.getColsCount());
                var nFullHeight = nAllRowsCount*CELL_HEIGHT;

                this.previewInner.height(nFullHeight);
                this.previewPanel.height(nHeight);
                this.previewScrolled.height(nHeight);

                if (!this.scrollerY) {
                    minScrollbarLength = Math.max((CELL_HEIGHT*2.0/3.0 + 0.5) >> 0, ((nHeight/8.0 + 0.5) >> 0));
                    wheelSpeed = Math.min((Math.floor(this.previewPanel.height()/CELL_HEIGHT) * CELL_HEIGHT)/10, 20);
                    this.scrollerY = new Common.UI.Scroller({
                        el: this.previewScrolled,
                        minScrollbarLength: minScrollbarLength,
                        alwaysVisibleY: true,
                        wheelSpeed: wheelSpeed,
                        useKeyboard: false,
                        onChange: _.bind(function(){
                            if (this.scrollerY) {
                                this._preventUpdateScroll = true;
                                this.onScrollEnd();
                                this._preventUpdateScroll = false;
                                this.previewParent.height(nHeight);
                                this.previewParent.css({top: this.scrollerY.getScrollTop()});
                            }
                        }, this)
                    });
                }
                if (!this._preventUpdateScroll) {
                    this.scrollerY.update({
                        minScrollbarLength: minScrollbarLength,
                        wheelSpeed: wheelSpeed
                    });
                    this.scrollerY.scrollTop(nRowSkip*CELL_HEIGHT);
                }

                var aCells = this.previewPanel.find('.cell');
                aCells.off('mousedown');
                aCells.mousedown(_.bind(this.cellClickHandler, this));
            }

            //fill recent
            if(bUpdateRecents){
                this.updateRecents();
            }

            //reset selection
            this.$window.find('.cell').removeClass('cell-selected');

            //select current cell
            if(bMainFocus){
                this.$window.find('#c' + nCurrentSymbol).addClass('cell-selected');
            } else {
                this.$window.find('#r_' + nCurrentSymbol + '_' + nFontNameRecent).addClass('cell-selected');
            }

            //update input
            if(bUpdateInput !== false){
                this.updateInput();
            }
        },

        onScrollEnd: function(){
            if(this.scrollerY.getScrollTop() === nLastScroll){
                return;
            }

            var nSymbolsCount = this.getAllSymbolsCount(aRanges);
            var nColsCount = this.getColsCount();
            var nRows = this.getRowsCount();
            var nAllRowsCount = Math.ceil(nSymbolsCount/nColsCount);
            var nFullHeight = nAllRowsCount*CELL_HEIGHT;
            var nRowSkip = Math.max(0, Math.min(nAllRowsCount - nRows, (nAllRowsCount*this.scrollerY.getScrollTop()/nFullHeight + 0.5) >> 0));
            nLastScroll = this.scrollerY.getScrollTop();
            if(!bMainFocus){
                nCurrentSymbol = this.getCodeByLinearIndex(aRanges, nRowSkip*nColsCount);
                bMainFocus = true;
            }
            else{
                var oFirstCell = this.previewPanel.children()[0];
                if(oFirstCell){
                    var id = oFirstCell.id;
                    if(id){
                        var nOldFirstCode = parseInt(id.slice(1, id.length));
                        var nOldFirstLinearIndex = this.getLinearIndexByCode(aRanges, nOldFirstCode);
                        var nOldCurrentLinearIndex = this.getLinearIndexByCode(aRanges, nCurrentSymbol);
                        var nDiff = nOldCurrentLinearIndex - nOldFirstLinearIndex;
                        var nNewCurLinearIndex = nRowSkip*nColsCount + nDiff;
                        nCurrentSymbol = this.getCodeByLinearIndex(aRanges, nNewCurLinearIndex);
                        var nFirstIndex = nRowSkip*nColsCount;
                        nNewCurLinearIndex -= nColsCount;
                        while(nCurrentSymbol === -1 && nNewCurLinearIndex >= nFirstIndex){
                            nCurrentSymbol = this.getCodeByLinearIndex(aRanges, nNewCurLinearIndex);
                            nNewCurLinearIndex -= nColsCount;
                        }
                        if(nCurrentSymbol === -1){
                            nCurrentSymbol = this.getCodeByLinearIndex(aRanges, nFirstIndex);
                        }
                    }
                    else{
                        nCurrentSymbol = this.getCodeByLinearIndex(aRanges, nRowSkip*nColsCount);
                    }
                }
            }
            this.updateView(true, this.getCodeByLinearIndex(aRanges, nRowSkip*nColsCount));
        },

        updateInput: function(){
            var sVal = nCurrentSymbol.toString(16).toUpperCase();
            var sValLen = sVal.length;
            for(var i = sValLen; i < 5; ++i){
                sVal = '0' + sVal;
            }
            this.inputCode.setValue(sVal);
        },

        updateRangeSelector: function() {
            var oCurrentRange = this.getRangeBySymbol(aRanges, nCurrentSymbol);
            if(!oCurrentRange || !oCurrentRange.Name){
                this.cmbRange.setDisabled(true);
                this.cmbRange.setValue('');
            }
            else{
                this.cmbRange.setDisabled(false);
                var oOption, i, data = [];
                for(i = 0; i < aRanges.length; ++i){
                    data.push({
                        value: aRanges[i].Name,
                        displayValue: oRangeNames[aRanges[i].Name]
                    });
                }
                this.cmbRange.setData(data);
                this.cmbRange.setValue(oCurrentRange.Name);
            }
        },

        onKeyDown: function(e){
            if(document.activeElement){
                if(document.activeElement.nodeName && document.activeElement.nodeName.toLowerCase() === 'span'){
                    return;
                }
            }
            var value = e.which || e.charCode || e.keyCode || 0;
            var bFill = true;
            if(bMainFocus){
                var nCode = -1;
                if ( value === Common.UI.Keys.LEFT ){//left
                    nCode = this.getCodeByLinearIndex(aRanges, this.getLinearIndexByCode(aRanges, nCurrentSymbol) - 1);
                }
                else if ( value === Common.UI.Keys.UP ){//top
                    nCode = this.getCodeByLinearIndex(aRanges, this.getLinearIndexByCode(aRanges, nCurrentSymbol) - this.getColsCount());
                }
                else if ( value === Common.UI.Keys.RIGHT ){//right
                    nCode = this.getCodeByLinearIndex(aRanges, this.getLinearIndexByCode(aRanges, nCurrentSymbol) + 1);
                }
                else if ( value === Common.UI.Keys.DOWN ){//bottom
                    nCode = this.getCodeByLinearIndex(aRanges, this.getLinearIndexByCode(aRanges, nCurrentSymbol) + this.getColsCount());
                }
                else if(value === Common.UI.Keys.HOME){//home
                    if(aRanges.length > 0){
                        nCode = aRanges[0].Start;
                    }
                }
                else if(value === Common.UI.Keys.END){//end
                    if(aRanges.length > 0){
                        nCode = aRanges[aRanges.length - 1].End;
                    }
                }
                else{
                    bFill = false;
                }
                if(nCode > -1){
                    nCurrentSymbol = nCode;
                    var bUpdateTable =  this.$window.find('#c' + nCurrentSymbol).length === 0;
                    this.updateView(bUpdateTable);
                }
            }
            else{
                var oSelectedCell, aStrings;
                if ( value === Common.UI.Keys.LEFT ){//left
                    oSelectedCell = this.$window.find('.cell-selected')[0];
                    if(oSelectedCell && oSelectedCell.id[0] === 'r'){
                        var oPresCell = this.$window.find(oSelectedCell).prev();
                        if(oPresCell.length > 0){
                            aStrings = this.$window.find(oPresCell).attr('id').split('_');
                            nCurrentSymbol = parseInt(aStrings[1]);
                            nFontNameRecent = parseInt(aStrings[2]);
                            this.updateView(false);
                        }
                    }
                }
                else if ( value === Common.UI.Keys.RIGHT ){//right
                    oSelectedCell = this.$window.find('.cell-selected')[0];
                    if(oSelectedCell && oSelectedCell.id[0] === 'r'){
                        var oNextCell = this.$window.find(oSelectedCell).next();
                        if(oNextCell.length > 0){
                            aStrings = this.$window.find(oNextCell).attr('id').split('_');
                            nCurrentSymbol = parseInt(aStrings[1]);
                            nFontNameRecent = parseInt(aStrings[2]);
                            this.updateView(false);
                        }
                    }
                }
                else if(value === Common.UI.Keys.HOME){//home
                    var oFirstCell = this.$window.find('#recent-table').children()[0];
                    if(oFirstCell){
                        aStrings = oFirstCell.id.split('_');
                        nCurrentSymbol = parseInt(aStrings[1]);
                        nFontNameRecent = parseInt(aStrings[2]);
                        this.updateView(false);
                    }
                }
                else if(value === Common.UI.Keys.END){//end
                    var aChildren = this.recentPanel.children();
                    var oLastCell = aChildren[aChildren.length - 1];
                    if(oLastCell){
                        aStrings = oLastCell.id.split('_');
                        nCurrentSymbol = parseInt(aStrings[1]);
                        nFontNameRecent = parseInt(aStrings[2]);
                        this.updateView(false);
                    }
                }
                else{
                    bFill = false;
                }
            }

            if(bFill){
                lastKeyCode = value;
                lastTime = (new Date()).getTime();
            }
        },

        onKeyPress: function(e){
            if(document.activeElement){
                if(document.activeElement.nodeName && document.activeElement.nodeName.toLowerCase() === 'span'){
                    return;
                }
            }
            var value = e.which || e.charCode || e.keyCode || 0;
            if(lastKeyCode === value){
                if(Math.abs(lastTime - (new Date()).getTime()) < 1000){
                    return;
                }
            }
            if(!isNaN(value) && value > 0x1F){
                var oRange = this.getRangeBySymbol(aRanges, value);
                if(oRange){
                    var bUpdateTable = (this.$window.find("#c" + value).length === 0);
                    nCurrentSymbol = value;
                    bMainFocus = true;
                    this.updateView(bUpdateTable, undefined, true);
                }
            }
            e.preventDefault && e.preventDefault();
        },

        onWindowResize: function (args) {
            var size = this.getSize();
            if (args && args[1]=='start') {
                this._preventUpdateScroll = true;
                this.curSize = {resize: false, width: size[0], height: size[1]};
            } else if (this.curSize.resize) {
                this._preventUpdateScroll = false;
                this.curSize.height = size[1] - 304 + 38*(this.special ? 0 : 1);
                var rows = Math.max(1, (((this.curSize.height-2)/CELL_HEIGHT) >> 0)),
                    height = rows*CELL_HEIGHT;

                this.symbolTablePanel.css({'height': this.curSize.height + 'px'});
                this.previewPanel.css({'height': height + 'px'});
                this.previewScrolled.css({'height': height + 'px'});
                this.scrollerY = null;

                this.updateView(undefined, undefined, undefined, true);

                this.specialList.cmpEl.height(size[1] - 157 + 38*(this.special ? 0 : 1));

                !this.special && (size[1] += 38);
                var valJson = JSON.stringify(size);
                Common.localStorage.setItem(this.appPrefix + 'settings-size-symbol-table', valJson);
                Common.Utils.InternalSettings.set(this.appPrefix + 'settings-size-symbol-table', valJson);
            }
        },

        onWindowResizing: function () {
            if (!this.curSize) return;

            var size = this.getSize();
            if (size[0] !== this.curSize.width || size[1] !== this.curSize.height) {
                if (!this.curSize.resize)
                    this.curSize.resize = true;

                this.curSize.width = size[0];
                this.curSize.height = size[1] - 304 + 38*(this.special ? 0 : 1);

                var rows = Math.max(1, (((this.curSize.height-2)/CELL_HEIGHT) >> 0)),
                    height = rows*CELL_HEIGHT;

                this.symbolTablePanel.css({'height': this.curSize.height + 'px'});
                this.previewPanel.css({'height': height  + 'px'});
                this.previewScrolled.css({'height': height + 'px'});

                this.specialList.cmpEl.height(size[1] - 157 + 38*(this.special ? 0 : 1));

                this.updateView(undefined, undefined, undefined, true);
            }
        },

        onModeClick: function(special, btn, event) {
            this.ShowHideElem(special);
        },

        ShowHideElem: function(special) {
            this.symbolsPanel.toggleClass('hidden', special);
            this.specialPanel.toggleClass('hidden', !special);
            var me = this;
            _.delay(function(){
                special ? me.specialList.focus() : me.previewPanel.focus();
            },50);

        },

        textTitle: 'Symbol',
        textFont: 'Font',
        textRange: 'Range',
        textRecent: 'Recently used symbols',
        textCode: 'Unicode HEX value',
        textSymbols: 'Symbols',
        textSpecial: 'Special characters',
        textCharacter: 'Character',
        textShortcut: 'Shortcut key',
        textEmDash: 'Em Dash',
        textEnDash: 'En Dash',
        textNBHyphen: 'Non-breaking Hyphen',
        textSHyphen: 'Soft Hyphen',
        textEmSpace: 'Em Space',
        textEnSpace: 'En Space',
        textQEmSpace: '1/4 Em Space',
        textNBSpace: 'No-break Space',
        textCopyright: 'Copyright Sign',
        textRegistered: 'Registered Sign',
        textTradeMark: 'Trade Mark Sign',
        textSection: 'Section Sign',
        textPilcrow: 'Pilcrow Sign',
        textEllipsis: 'Horizontal Ellipsis',
        textSOQuote: 'Single Opening Quote',
        textSCQuote: 'Single Closing Quote',
        textDOQuote: 'Double Opening Quote',
        textDCQuote: 'Double Closing Quote'

    }, Common.Views.SymbolTableDialog || {}))
});