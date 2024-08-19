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
define([], function () {

    if (window.Common === undefined) {
        window.Common = {};
    }

    if (Common.Utils === undefined) {
        Common.Utils = {};
    }

    function _extend_object(dest, source) {
        if (typeof _ != "undefined") {
            return _.extend({}, dest, source);
        } else if (!!Object) {
            return Object.assign({}, dest, source);
        }

        return source;
    }

    var utils = new (function () {
        var userAgent = navigator.userAgent.toLowerCase(),
            check = function (regex) {
                return regex.test(userAgent);
            },
            isStrict = document.compatMode == "CSS1Compat",
            version = function (is, regex) {
                var m;
                return (is && (m = regex.exec(userAgent))) ? parseFloat(m[1]) : 0;
            },
            docMode = document.documentMode,
            isEdge = check(/edge/),
            isOpera = check(/opera/),
            isOpera10_5 = isOpera && check(/version\/10\.5/),
            isIE = !isOpera && (check(/msie/) || check(/trident/) || check(/edge/)),
            isIE7 = isIE && ((check(/msie 7/) && docMode != 8 && docMode != 9 && docMode != 10) || docMode == 7),
            isIE8 = isIE && ((check(/msie 8/) && docMode != 7 && docMode != 9 && docMode != 10) || docMode == 8),
            isIE9 = isIE && ((check(/msie 9/) && docMode != 7 && docMode != 8 && docMode != 10) || docMode == 9),
            isIE10 = isIE && ((check(/msie 10/) && docMode != 7 && docMode != 8 && docMode != 9) || docMode == 10),
            isIE11 = isIE && ((check(/trident\/7\.0/) && docMode != 7 && docMode != 8 && docMode != 9 && docMode != 10) || docMode == 11),
            isIE6 = isIE && check(/msie 6/),
            isChrome = !isIE && check(/\bchrome\b/),
            isWebKit = !isIE && check(/webkit/),
            isSafari = !isIE && !isChrome && check(/safari/),
            isSafari2 = isSafari && check(/applewebkit\/4/), // unique to Safari 2
            isSafari3 = isSafari && check(/version\/3/),
            isSafari4 = isSafari && check(/version\/4/),
            isSafari5_0 = isSafari && check(/version\/5\.0/),
            isSafari5 = isSafari && check(/version\/5/),
            isGecko = !isWebKit && !isIE && check(/gecko/), // IE11 adds "like gecko" into the user agent string
            isGecko3 = isGecko && check(/rv:1\.9/),
            isGecko4 = isGecko && check(/rv:2\.0/),
            isGecko5 = isGecko && check(/rv:5\./),
            isGecko10 = isGecko && check(/rv:10\./),
            isFF3_0 = isGecko3 && check(/rv:1\.9\.0/),
            isFF3_5 = isGecko3 && check(/rv:1\.9\.1/),
            isFF3_6 = isGecko3 && check(/rv:1\.9\.2/),
            isWindows = check(/windows|win32/),
            isMac = check(/macintosh|mac os x/),
            isLinux = check(/linux/),
            chromeVersion = version(true, /\bchrome\/(\d+\.\d+)/),
            firefoxVersion = version(true, /\bfirefox\/(\d+\.\d+)/),
            ieVersion = version(isIE, /msie (\d+\.\d+)/),
            operaVersion = version(isOpera, /version\/(\d+\.\d+)/),
            safariVersion = version(isSafari, /version\/(\d+\.\d+)/),
            webKitVersion = version(isWebKit, /webkit\/(\d+\.\d+)/),
            isSecure = /^https/i.test(window.location.protocol),
            emailRe = /^(mailto:)?([a-z0-9'\._-]+@[a-z0-9\.-]+\.[a-z0-9]{2,4})([a-яё0-9\._%+-=\? :&]*)/i,
            ipRe = /^(((https?)|(ftps?)):\/\/)?([\-\wа-яё]*:?[\-\wа-яё]*@)?(((1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9][0-9]|[0-9])\.){3}(1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9][0-9]|[0-9]))(:\d+)?(\/[%\-\wа-яё]*(\.[\wа-яё]{2,})?(([\wа-яё\-\.\?\\\/+@&#;:`~=%!,\(\)]*)(\.[\wа-яё]{2,})?)*)*\/?/i,
            hostnameRe = /^(((https?)|(ftps?)):\/\/)?([\-\wа-яё]*:?[\-\wа-яё]*@)?(([\-\wа-яё]+\.)+[\wа-яё\-]{2,}(:\d+)?(\/[%\-\wа-яё]*(\.[\wа-яё]{2,})?(([\wа-яё\-\.\?\\\/\+@&#;:`'~=%!,\(\)]*)(\.[\wа-яё]{2,})?)*)*\/?)/i,
            localRe = /^(((https?)|(ftps?)):\/\/)([\-\wа-яё]*:?[\-\wа-яё]*@)?(([\-\wа-яё]+)(:\d+)?(\/[%\-\wа-яё]*(\.[\wа-яё]{2,})?(([\wа-яё\-\.\?\\\/\+@&#;:`'~=%!,\(\)]*)(\.[\wа-яё]{2,})?)*)*\/?)/i,
            emailStrongRe = /(mailto:)?([a-z0-9'\._-]+@[a-z0-9\.-]+\.[a-z0-9]{2,4})([a-яё0-9\._%+-=\?:&]*)/ig,
            emailAddStrongRe = /(mailto:|\s[@]|\s[+])?([a-z0-9'\._-]+@[a-z0-9\.-]+\.[a-z0-9]{2,4})([a-яё0-9\._%\+-=\?:&]*)/ig,
            ipStrongRe = /(((https?)|(ftps?)):\/\/([\-\wа-яё]*:?[\-\wа-яё]*@)?)(((1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9][0-9]|[0-9])\.){3}(1[0-9]{2}|2[0-4][0-9]|25[0-5]|[1-9][0-9]|[0-9]))(:\d+)?(\/[%\-\wа-яё]*(\.[\wа-яё]{2,})?(([\wа-яё\-\.\?\\\/\+@&#;:`~=%!,\(\)]*)(\.[\wа-яё]{2,})?)*)*\/?/ig,
            hostnameStrongRe = /((((https?)|(ftps?)):\/\/([\-\wа-яё]*:?[\-\wа-яё]*@)?)|(([\-\wа-яё]*:?[\-\wа-яё]*@)?www\.))((([\-\wа-яё]+\.)+[\wа-яё\-]{2,}|([\-\wа-яё]+))(:\d+)?(\/[%\-\wа-яё]*(\.[\wа-яё]{2,})?(([\wа-яё\-\.\?\\\/\+@&#;:`~=%!,\(\)]*)(\.[\wа-яё]{2,})?)*)*\/?)/ig,
            documentSettingsType = {
                Paragraph: 0,
                Table: 1,
                Header: 2,
                TextArt: 3,
                Shape: 4,
                Image: 5,
                Slide: 6,
                Chart: 7,
                MailMerge: 8,
                Signature: 9,
                Pivot: 10,
                Cell: 11,
                Slicer: 12,
                Form: 13
            },
            importTextType = {
                DRM: 0,
                CSV: 1,
                TXT: 2,
                Paste: 3,
                Columns: 4,
                Data: 5
            },
            isMobile = /android|avantgo|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent || navigator.vendor || window.opera),
            me = this,
            checkSize = function () {
                var scale = {};
                if (!!window.AscCommon && !!window.AscCommon.checkDeviceScale) {
                    scale = window.AscCommon.checkDeviceScale();
                    AscCommon.correctApplicationScale(scale);
                } else {
                    var str_mq_125 = "screen and (-webkit-min-device-pixel-ratio: 1.25) and (-webkit-max-device-pixel-ratio: 1.49), " +
                        "screen and (min-resolution: 1.25dppx) and (max-resolution: 1.49dppx)";
                    var str_mq_150 = "screen and (-webkit-min-device-pixel-ratio: 1.5) and (-webkit-max-device-pixel-ratio: 1.74), " +
                        "screen and (min-resolution: 1.5dppx) and (max-resolution: 1.74dppx)";
                    var str_mq_175 = "screen and (-webkit-min-device-pixel-ratio: 1.75) and (-webkit-max-device-pixel-ratio: 1.99), " +
                        "screen and (min-resolution: 1.75dppx) and (max-resolution: 1.99dppx)";
                    var str_mq_200 = "screen and (-webkit-min-device-pixel-ratio: 2), " +
                        "screen and (min-resolution: 2dppx), screen and (min-resolution: 192dpi)";
                    const str_mq_225 = "screen and (-webkit-min-device-pixel-ratio: 2.25), " +
                        "screen and (min-resolution: 2.25dppx), screen and (min-resolution: 216dpi)";

                    if (window.matchMedia(str_mq_125).matches) {
                        scale.devicePixelRatio = 1.5;
                    } else if (window.matchMedia(str_mq_150).matches) {
                        scale.devicePixelRatio = 1.5;
                    } else if (window.matchMedia(str_mq_175).matches) {
                        scale.devicePixelRatio = 1.75;
                    } else if (window.matchMedia(str_mq_200).matches)
                        scale.devicePixelRatio = 2;
                    else scale.devicePixelRatio = 1;

                    if (window.matchMedia(str_mq_225).matches) {
                        scale.devicePixelRatio = 2.25;
                    }
                }

                var $root = $(document.body);
                var classes = document.body.className;
                var clear_list = classes.replace(/pixel-ratio__[\w-]+/gi, '').trim();
                if (scale.devicePixelRatio < 1.25) {
                    if (/pixel-ratio__/.test(classes)) {
                        document.body.className = clear_list;
                    }
                } else if (scale.devicePixelRatio < 1.5) {
                    if (!/pixel-ratio__1_25/.test(classes)) {
                        document.body.className = clear_list + ' pixel-ratio__1_25';
                    }
                } else if (scale.devicePixelRatio < 1.75) {
                    if (!/pixel-ratio__1_5/.test(classes)) {
                        document.body.className = clear_list + ' pixel-ratio__1_5';
                    }
                } else if (!(scale.devicePixelRatio < 1.75) && scale.devicePixelRatio < 2) {
                    if (!/pixel-ratio__1_75/.test(classes)) {
                        document.body.className = clear_list + ' pixel-ratio__1_75';
                    }
                } else if (!(scale.devicePixelRatio < 2) && scale.devicePixelRatio < 2.25) {
                    if (!/pixel-ratio__2\b/.test(classes)) {
                        document.body.className = clear_list + ' pixel-ratio__2';
                    }
                } else {
                    // $root.addClass('pixel-ratio__2_5');
                    if (!/pixel-ratio__2_5/.test(classes)) {
                        document.body.className = clear_list + ' pixel-ratio__2_5';
                    }
                }

                me.zoom = scale.correct ? scale.zoom : 1;
                me.innerWidth = window.innerWidth * me.zoom;
                me.innerHeight = window.innerHeight * me.zoom;
                me.applicationPixelRatio = scale.applicationPixelRatio || scale.devicePixelRatio;
            };
        checkSizeIE = function () {
            me.innerWidth = window.innerWidth;
            me.innerHeight = window.innerHeight;
        };
        me.zoom = 1;
        me.applicationPixelRatio = 1;
        me.innerWidth = window.innerWidth;
        me.innerHeight = window.innerHeight;
        if (isIE) {
            $(document.body).addClass('ie');
            $(window).on('resize', checkSizeIE);
        } else {
            checkSize();
            $(window).on('resize', checkSize);
        }

        return {
            checkSize: checkSize,

            userAgent: userAgent,
            isStrict: isStrict,
            isIEQuirks: isIE && (!isStrict && (isIE6 || isIE7 || isIE8 || isIE9)),
            isOpera: isOpera,
            isOpera10_5: isOpera10_5,
            isWebKit: isWebKit,
            isChrome: isChrome,
            isSafari: isSafari,
            isSafari3: isSafari3,
            isSafari4: isSafari4,
            isSafari5: isSafari5,
            isSafari5_0: isSafari5_0,
            isSafari2: isSafari2,
            isIE: isIE,
            isIE6: isIE6,
            isIE7: isIE7,
            isIE7m: isIE6 || isIE7,
            isIE7p: isIE && !isIE6,
            isIE8: isIE8,
            isIE8m: isIE6 || isIE7 || isIE8,
            isIE8p: isIE && !(isIE6 || isIE7),
            isIE9: isIE9,
            isIE9m: isIE6 || isIE7 || isIE8 || isIE9,
            isIE9p: isIE && !(isIE6 || isIE7 || isIE8),
            isIE10: isIE10,
            isIE10m: isIE6 || isIE7 || isIE8 || isIE9 || isIE10,
            isIE10p: isIE && !(isIE6 || isIE7 || isIE8 || isIE9),
            isIE11: isIE11,
            isIE11m: isIE6 || isIE7 || isIE8 || isIE9 || isIE10 || isIE11,
            isIE11p: isIE && !(isIE6 || isIE7 || isIE8 || isIE9 || isIE10),
            isGecko: isGecko,
            isGecko3: isGecko3,
            isGecko4: isGecko4,
            isGecko5: isGecko5,
            isGecko10: isGecko10,
            isFF3_0: isFF3_0,
            isFF3_5: isFF3_5,
            isFF3_6: isFF3_6,
            isFF4: 4 <= firefoxVersion && firefoxVersion < 5,
            isFF5: 5 <= firefoxVersion && firefoxVersion < 6,
            isFF10: 10 <= firefoxVersion && firefoxVersion < 11,
            isLinux: isLinux,
            isWindows: isWindows,
            isMac: isMac,
            chromeVersion: chromeVersion,
            firefoxVersion: firefoxVersion,
            ieVersion: ieVersion,
            operaVersion: operaVersion,
            safariVersion: safariVersion,
            webKitVersion: webKitVersion,
            isSecure: isSecure,
            emailRe: emailRe,
            ipRe: ipRe,
            hostnameRe: hostnameRe,
            localRe: localRe,
            emailStrongRe: emailStrongRe,
            emailAddStrongRe: emailAddStrongRe,
            ipStrongRe: ipStrongRe,
            hostnameStrongRe: hostnameStrongRe,
            documentSettingsType: documentSettingsType,
            importTextType: importTextType,
            zoom: function () {
                return me.zoom;
            },
            applicationPixelRatio: function () {
                return me.applicationPixelRatio;
            },
            topOffset: 0,
            innerWidth: function () {
                return me.innerWidth;
            },
            innerHeight: function () {
                return me.innerHeight;
            },
            croppedGeometry: function () {
                return {
                    left: 0,
                    top: Common.Utils.InternalSettings.get('window-inactive-area-top'),
                    width: me.innerWidth,
                    height: me.innerHeight - Common.Utils.InternalSettings.get('window-inactive-area-top')
                }
            }
        }
    })();

    Common.Utils = _extend_object(Common.Utils, utils);

    var themecolor = new (function () {
        var initnames = true;

        return {
            txtBlack: 'Black',
            txtWhite: 'White',
            txtRed: 'Red',
            txtGreen: 'Green',
            txtBlue: 'Blue',
            txtYellow: 'Yellow',
            txtPurple: 'Purple',
            txtAqua: 'Aqua',
            txtDarkRed: 'Dark red',
            txtDarkGreen: 'Dark green',
            txtDarkBlue: 'Dark blue',
            txtDarkYellow: 'Dark yellow',
            txtDarkPurple: 'Dark purple',
            txtDarkTeal: 'Dark teal',
            txtLightGray: 'Light gray',
            txtGray: 'Gray',
            txtLightBlue: 'Light blue',
            txtPink: 'Pink',
            txtLightYellow: 'Light yellow',
            txtSkyBlue: 'Sky blue',
            txtRose: 'Rose',
            txtTurquosie: 'Turquosie',
            txtLightGreen: 'Light green',
            txtLavender: 'Lavender',
            txtLightOrange: 'Light orange',
            txtTeal: 'Teal',
            txtGold: 'Gold',
            txtOrange: 'Orange',
            txtIndigo: 'Indigo',
            txtBrown: 'Brown',
            txtDarkGray: 'Dark gray',
            txtbackground: 'Background',
            txttext: 'Text',
            txtaccent: 'Accent',
            txtDarker: 'Darker',
            txtLighter: 'Lighter',
            txtBrightGreen: 'Bright green',
            txtViolet: 'Violet',

            ThemeValues: [6, 15, 7, 16, 0, 1, 2, 3, 4, 5],

            getTranslation: function (name) {
                if (!name) return '';

                return this['txt' + name.replace(' ', '')] || name
            },

            getEffectTranslation: function (value) {
                value = parseInt(value * 100);
                if (value !== 0) {
                    return (value > 0 ? this.txtLighter : this.txtDarker) + ' ' + Math.abs(value) + '%';
                }
                return '';
            },

            setColors: function (colors, standart_colors) {
                if (initnames) {
                    for (var i = 1; i < 3; i++) {
                        this['txtbackground' + i] = this.txtbackground + ' ' + i;
                        this['txttext' + i] = this.txttext + ' ' + i;
                    }
                    for (var i = 1; i < 7; i++) {
                        this['txtaccent' + i] = this.txtaccent + ' ' + i;
                    }
                    initnames = false;
                }

                var i, j, item;

                if (standart_colors && standart_colors.length > 0) {
                    var standartcolors = [];

                    for (i = 0; i < standart_colors.length; i++) {
                        item = {
                            color: this.getHexColor(standart_colors[i].get_r(), standart_colors[i].get_g(), standart_colors[i].get_b()),
                            tip: this.getTranslation(standart_colors[i].asc_getName())
                        };
                        standartcolors.push(item);
                    }

                    this.standartcolors = standartcolors;
                }

                var effectСolors = [];

                for (i = 0; i < 6; i++) {
                    for (j = 0; j < 10; j++) {
                        var idx = i + j * 6;
                        var colorName = this.getTranslation(colors[idx].asc_getName()),
                            schemeName = this.getTranslation(colors[idx].asc_getNameInColorScheme()),
                            effectName = this.getEffectTranslation(colors[idx].asc_getEffectValue());
                        if (colorName) {
                            schemeName && (colorName += Common.Utils.String.textComma + ' ' + schemeName);
                            effectName && (colorName += Common.Utils.String.textComma + ' ' + effectName);
                        }
                        item = {
                            color: this.getHexColor(colors[idx].get_r(), colors[idx].get_g(), colors[idx].get_b()),
                            effectId: idx,
                            effectValue: this.ThemeValues[j],
                            tip: colorName
                        };
                        effectСolors.push(item);
                    }
                }
                this.effectcolors = effectСolors;
            },

            getEffectColors: function () {
                return this.effectcolors;
            },

            getStandartColors: function () {
                return this.standartcolors;
            },

            getHexColor: function (r, g, b) {
                r = r.toString(16);
                g = g.toString(16);
                b = b.toString(16);
                if (r.length == 1) r = '0' + r;
                if (g.length == 1) g = '0' + g;
                if (b.length == 1) b = '0' + b;
                return r + g + b;
            },

            getRgbColor: function (clr) {
                var color = (typeof (clr) == 'object') ? clr.color : clr;

                color = color.replace(/#/, '');
                if (color.length == 3) color = color.replace(/(.)/g, '$1$1');
                color = parseInt(color, 16);
                var c = new Asc.asc_CColor();
                c.put_type((typeof (clr) == 'object' && clr.effectId !== undefined) ? Asc.c_oAscColor.COLOR_TYPE_SCHEME : Asc.c_oAscColor.COLOR_TYPE_SRGB);
                c.put_r(color >> 16);
                c.put_g((color & 0xff00) >> 8);
                c.put_b(color & 0xff);
                c.put_a(0xff);
                if (clr.effectId !== undefined)
                    c.put_value(clr.effectId);
                return c;
            },

            colorValue2EffectId: function (clr) {
                if (typeof (clr) == 'object' && clr && clr.effectValue !== undefined && this.effectcolors) {
                    for (var i = 0; i < this.effectcolors.length; i++) {
                        if (this.effectcolors[i].effectValue === clr.effectValue && clr.color.toUpperCase() === this.effectcolors[i].color.toUpperCase()) {
                            clr.effectId = this.effectcolors[i].effectId;
                            break;
                        }
                    }
                }
                return clr;
            },

            selectPickerColorByEffect: function(color, picker) {
                if (!color)
                    picker.clearSelection();
                else {
                    if ( typeof(color) == 'object' ) {
                        var isselected = false;
                        for (var i=0; i<10; i++) {
                            if ( Common.Utils.ThemeColor.ThemeValues[i] == color.effectValue ) {
                                picker.select(color, true);
                                isselected = true;
                                break;
                            }
                        }
                        if (!isselected) picker.clearSelection();
                    } else
                        picker.select(color,true);
                }
            }
        }
    })();
    Common.Utils.ThemeColor = _extend_object(themecolor, Common.Utils.ThemeColor);

    var metrics = new (function () {
        var me = this;

        me.c_MetricUnits = {
            cm: 0,
            pt: 1,
            inch: 2
        };

        me.currentMetric = me.c_MetricUnits.pt;
        me.metricName = ['Cm', 'Pt', 'Inch'];
        me.defaultMetric = me.c_MetricUnits.cm;

        return {
            c_MetricUnits: me.c_MetricUnits,
            txtCm: 'cm',
            txtPt: 'pt',
            txtInch: '\"',

            setCurrentMetric: function (value) {
                me.currentMetric = value;
            },

            getCurrentMetric: function () {
                return me.currentMetric;
            },

            getCurrentMetricName: function () {
                return this['txt' + me.metricName[me.currentMetric]];
            },

            getMetricName: function (unit) {
                return this['txt' + me.metricName[(unit !== undefined) ? unit : 0]];
            },

            setDefaultMetric: function (value) {
                me.defaultMetric = value;
            },

            getDefaultMetric: function () {
                return me.defaultMetric;
            },

            fnRecalcToMM: function (value) {
                // value in pt/cm/inch. need to convert to mm
                if (value !== null && value !== undefined) {
                    switch (me.currentMetric) {
                        case me.c_MetricUnits.cm:
                            return value * 10;
                        case me.c_MetricUnits.pt:
                            return value * 25.4 / 72.0;
                        case me.c_MetricUnits.inch:
                            return value * 25.4;
                    }
                }
                return value;
            },

            fnRecalcFromMM: function (value) {
                // value in mm. need to convert to pt/cm/inch
                switch (me.currentMetric) {
                    case me.c_MetricUnits.cm:
                        return parseFloat((value / 10.).toFixed(4));
                    case me.c_MetricUnits.pt:
                        return parseFloat((value * 72.0 / 25.4).toFixed(3));
                    case me.c_MetricUnits.inch:
                        return parseFloat((value / 25.4).toFixed(3));
                }
                return value;
            }
        }
    })();

    Common.Utils.Metric = _extend_object(metrics, Common.Utils.Metric);

    Common.Utils.RGBColor = function (colorString) {
        var r, g, b;

        if (colorString.charAt(0) == '#') {
            colorString = colorString.substr(1, 6);
        }

        colorString = colorString.replace(/ /g, '');
        colorString = colorString.toLowerCase();

        var colorDefinitions = [
            {
                re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
//                    example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
                process: function (bits) {
                    return [
                        parseInt(bits[1]),
                        parseInt(bits[2]),
                        parseInt(bits[3])
                    ];
                }
            },
            {
                re: /^hsb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
//                    example: ['hsb(123, 34, 100)'],
                process: function (bits) {
                    var rgb = {};
                    var h = Math.round(bits[1]);
                    var s = Math.round(bits[2] * 255 / 100);
                    var v = Math.round(bits[3] * 255 / 100);
                    if (s == 0) {
                        rgb.r = rgb.g = rgb.b = v;
                    } else {
                        var t1 = v;
                        var t2 = (255 - s) * v / 255;
                        var t3 = (t1 - t2) * (h % 60) / 60;

                        if (h == 360) h = 0;
                        if (h < 60) {
                            rgb.r = t1;
                            rgb.b = t2;
                            rgb.g = t2 + t3
                        } else if (h < 120) {
                            rgb.g = t1;
                            rgb.b = t2;
                            rgb.r = t1 - t3
                        } else if (h < 180) {
                            rgb.g = t1;
                            rgb.r = t2;
                            rgb.b = t2 + t3
                        } else if (h < 240) {
                            rgb.b = t1;
                            rgb.r = t2;
                            rgb.g = t1 - t3
                        } else if (h < 300) {
                            rgb.b = t1;
                            rgb.g = t2;
                            rgb.r = t2 + t3
                        } else if (h < 360) {
                            rgb.r = t1;
                            rgb.g = t2;
                            rgb.b = t1 - t3
                        } else {
                            rgb.r = 0;
                            rgb.g = 0;
                            rgb.b = 0
                        }
                    }
                    return [
                        Math.round(rgb.r),
                        Math.round(rgb.g),
                        Math.round(rgb.b)
                    ];
                }
            },
            {
                re: /^(\w{2})(\w{2})(\w{2})$/,
//                    example: ['#00ff00', '336699'],
                process: function (bits) {
                    return [
                        parseInt(bits[1], 16),
                        parseInt(bits[2], 16),
                        parseInt(bits[3], 16)
                    ];
                }
            },
            {
                re: /^(\w{1})(\w{1})(\w{1})$/,
//                    example: ['#fb0', 'f0f'],
                process: function (bits) {
                    return [
                        parseInt(bits[1] + bits[1], 16),
                        parseInt(bits[2] + bits[2], 16),
                        parseInt(bits[3] + bits[3], 16)
                    ];
                }
            }
        ];

        for (var i = 0; i < colorDefinitions.length; i++) {
            var re = colorDefinitions[i].re;
            var processor = colorDefinitions[i].process;
            var bits = re.exec(colorString);
            if (bits) {
                var channels = processor(bits);
                r = channels[0];
                g = channels[1];
                b = channels[2];
            }
        }

        r = (r < 0 || isNaN(r)) ? 0 : ((r > 255) ? 255 : r);
        g = (g < 0 || isNaN(g)) ? 0 : ((g > 255) ? 255 : g);
        b = (b < 0 || isNaN(b)) ? 0 : ((b > 255) ? 255 : b);

        var isEqual = function (color) {
            return ((r == color.r) && (g == color.g) && (b == color.b));
        };

        var toRGB = function () {
            return 'rgb(' + r + ', ' + g + ', ' + b + ')';
        };

        var toRGBA = function (alfa) {
            if (alfa === undefined) alfa = 1;
            return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alfa + ')';
        };

        var toHex = function () {
            var _r = r.toString(16);
            var _g = g.toString(16);
            var _b = b.toString(16);
            if (_r.length == 1) _r = '0' + _r;
            if (_g.length == 1) _g = '0' + _g;
            if (_b.length == 1) _b = '0' + _b;
            return '#' + _r + _g + _b;
        };

        var toHSB = function () {
            var hsb = {
                h: 0,
                s: 0,
                b: 0
            };

            var min = Math.min(r, g, b);
            var max = Math.max(r, g, b);
            var delta = max - min;
            hsb.b = max;
            hsb.s = max != 0 ? 255 * delta / max : 0;
            if (hsb.s != 0) {
                if (r == max) {
                    hsb.h = 0 + (g - b) / delta;
                } else if (g == max) {
                    hsb.h = 2 + (b - r) / delta;
                } else {
                    hsb.h = 4 + (r - g) / delta;
                }
            } else {
                hsb.h = 0;
            }
            hsb.h *= 60;
            if (hsb.h < 0) {
                hsb.h += 360;
            }
            hsb.s *= 100 / 255;
            hsb.b *= 100 / 255;

            hsb.h = parseInt(hsb.h);
            hsb.s = parseInt(hsb.s);
            hsb.b = parseInt(hsb.b);

            return hsb;
        };

        var isDark = function () {
            return Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b)) < 140;
        };

        return {
            r: r,
            g: g,
            b: b,
            isEqual: isEqual,
            toRGB: toRGB,
            toRGBA: toRGBA,
            toHex: toHex,
            toHSB: toHSB,
            isDark: isDark
        }
    };

    var utilsString = new (function () {
        return {
            textCtrl: 'Ctrl',
            textShift: 'Shift',
            textAlt: 'Alt',
            textComma: ',',

            format: function (format) {
                var args = _.toArray(arguments).slice(1);
                if (args.length && typeof args[0] == 'object')
                    args = args[0];
                return format.replace(/\{(\d+)\}/g, function (s, i) {
                    return args[i];
                });
            },

            htmlEncode: function (string) {
                return (typeof _ !== 'undefined') ? _.escape(string) :
                    string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
            },

            htmlDecode: function (string) {
                return _.unescape(string);
            },

            ellipsis: function (value, len, word) {
                if (value && value.length > len) {
                    if (word) {
                        var vs = value.substr(0, len - 2),
                            index = Math.max(vs.lastIndexOf(' '), vs.lastIndexOf('.'), vs.lastIndexOf('!'), vs.lastIndexOf('?'));
                        if (index !== -1 && index >= (len - 15)) {
                            return vs.substr(0, index) + "...";
                        }
                    }
                    return value.substr(0, len - 3) + "...";
                }
                return value;
            },

            platformKey: function (string, template, hookFn) {
                if (_.isEmpty(template))
                    template = ' ({0})';

                if (Common.Utils.isMac) {
                    if (_.isFunction(hookFn)) {
                        string = hookFn.call(this, string);
                    }
                    return Common.Utils.String.format(template, string.replace(/\+(?=\S)/g, '').replace(/Ctrl|ctrl/g, '⌘').replace(/Alt|alt/g, '⌥').replace(/Shift|shift/g, '⇧'));
                }

                return Common.Utils.String.format(template, string.replace(/Ctrl|ctrl/g, this.textCtrl).replace(/Alt|alt/g, this.textAlt).replace(/Shift|shift/g, this.textShift));
            },

            parseFloat: function (string) {
                (typeof string === 'string') && (string = string.replace(',', '.'));
                return parseFloat(string)
            },

            encodeSurrogateChar: function (nUnicode) {
                if (nUnicode < 0x10000) {
                    return String.fromCharCode(nUnicode);
                } else {
                    nUnicode = nUnicode - 0x10000;
                    var nLeadingChar = 0xD800 | (nUnicode >> 10);
                    var nTrailingChar = 0xDC00 | (nUnicode & 0x3FF);
                    return String.fromCharCode(nLeadingChar) + String.fromCharCode(nTrailingChar);
                }
            },

            fixedDigits: function (num, digits, fill) {
                (fill === undefined) && (fill = '0');
                var strfill = "",
                    str = num.toString();
                for (var i = str.length; i < digits; i++) strfill += fill;
                return strfill + str;
            }
        }
    })();

    Common.Utils.String = _extend_object(utilsString, Common.Utils.String);

    Common.Utils.isBrowserSupported = function () {
        return !((Common.Utils.ieVersion != 0 && Common.Utils.ieVersion < 10.0) ||
            (Common.Utils.safariVersion != 0 && Common.Utils.safariVersion < 5.0) ||
            (Common.Utils.firefoxVersion != 0 && Common.Utils.firefoxVersion < 4.0) ||
            (Common.Utils.chromeVersion != 0 && Common.Utils.chromeVersion < 7.0) ||
            (Common.Utils.operaVersion != 0 && Common.Utils.operaVersion < 10.5));
    };

    Common.Utils.showBrowserRestriction = function () {
        if (document.getElementsByClassName && document.getElementsByClassName('app-error-panel').length > 0) return;
        var editor = (window.DE ? 'Document' : window.SSE ? 'Spreadsheet' : window.PE ? 'Presentation' : window.PDFE ? 'PDF' : 'that');
        var newDiv = document.createElement("div");
        newDiv.innerHTML = '<div class="app-error-panel">' +
            '<div class="message-block">' +
            '<div class="message-inner">' +
            '<div class="title">Your browser is not supported.</div>' +
            '<div class="text">Sorry, ' + editor + ' Editor is currently only supported in the latest versions of the Chrome, Firefox, Safari or Internet Explorer web browsers.</div>' +
            '</div>' +
            '</div>' +
            '<div class="message-auxiliary"></div>' +
            '</div>';

        document.body.appendChild(newDiv);

        $('#loading-mask').hide().remove();
        $('#viewport').hide().remove();
    };

    Common.Utils.applyCustomization = function (config, elmap) {
        for (var name in config) {
            var $el;
            if (!!elmap[name]) {
                $el = $(elmap[name]);

                if ($el.length) {
                    var item = config[name];
                    if (item === false || item.visible === false) {
                        $el.hide()
                    } else {
                        if (!!item.text) {
                            $el.text(item.text);
                        }

                        if (item.visible === false) {
                            $el.hide();
                        }
                    }
                }
            }
        }
    };

    Common.Utils.applyCustomizationPlugins = function (plugins) {
        if (!plugins || plugins.length < 1) return;

        var _createXMLHTTPObject = function () {
            var xmlhttp;
            if (typeof XMLHttpRequest != 'undefined') {
                xmlhttp = new XMLHttpRequest();
            } else {
                try {
                    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
                } catch (e) {
                    try {
                        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                    } catch (E) {
                        xmlhttp = false;
                    }
                }
            }

            return xmlhttp;
        };

        var _getPluginCode = function (url) {
            if (!url) return '';
            try {
                var xhrObj = _createXMLHTTPObject();
                if (xhrObj && url) {
                    xhrObj.open('GET', url, false);
                    xhrObj.send('');
                    if (xhrObj.status == 200)
                        eval(xhrObj.responseText);
                }
            } catch (e) {
            }
            return null;
        };

        plugins.forEach(function (url) {
            if (url) _getPluginCode(url);
        });
    };

    Common.Utils.fillUserInfo = function (info, lang, defname, defid) {
        var _user = info || {};
        _user.anonymous = !_user.id;
        !_user.id && (_user.id = defid);
        _user.fullname = !_user.name ? defname : _user.name;
        _user.group && (_user.fullname = (_user.group).toString() + AscCommon.UserInfoParser.getSeparator() + _user.fullname);
        _user.guest = !_user.name;
        return _user;
    };


    Common.Utils.createXhr = function () {
        var xmlhttp;

        if (typeof XMLHttpRequest != 'undefined') {
            xmlhttp = new XMLHttpRequest();
        } else {
            try {
                xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (E) {
                    xmlhttp = false;
                }
            }
        }

        return xmlhttp;
    };

    Common.Utils.getConfigJson = function (url) {
        if (url) {
            try {
                var xhrObj = Common.Utils.createXhr();
                if (xhrObj) {
                    xhrObj.open('GET', url, false);
                    xhrObj.send('');

                    return JSON.parse(xhrObj.responseText);
                }
            } catch (e) {
            }
        }

        return null;
    };

    Common.Utils.loadConfig = function (url, callback) {
        fetch(url, {
            method: 'get',
            headers: {
                'Accept': 'application/json',
            },
        }).then(function (response) {
            if (response.ok)
                return response.json();
            else return 'error';
        }).then(function (json) {
            callback(json);
        }).catch(function (e) {
            callback('error');
        });
    };

    Common.Utils.asyncCall = function (callback, scope, args) {
        (new Promise(function (resolve, reject) {
            resolve();
        })).then(function () {
            callback.call(scope, args);
        });
    };

// Extend javascript String type
    String.prototype.strongMatch = function (regExp) {
        if (regExp && regExp instanceof RegExp) {
            var arr = this.toString().match(regExp);
            return !!(arr && arr.length > 0 && arr[0].length == this.length);
        }

        return false;
    };

    Common.Utils.InternalSettings = new (function () {
        var settings = {};

        var _get = function (name) {
                return settings[name];
            },
            _set = function (name, value) {
                settings[name] = value;
            };

        return {
            get: _get,
            set: _set
        }
    });

    Common.Utils.lockControls = function (causes, lock, opts, defControls) {
        !opts && (opts = {});

        var controls = opts.array || defControls;
        opts.merge && (controls = _.union(defControls, controls));

        function doLock(cmp, cause) {
            if (cmp && cmp.options && _.contains(cmp.options.lock, cause)) {
                var index = cmp.keepState.indexOf(cause);
                if (lock) {
                    if (index < 0) {
                        cmp.keepState.push(cause);
                    }
                } else {
                    if (!(index < 0)) {
                        cmp.keepState.splice(index, 1);
                    }
                }
            }
        }

        _.each(controls, function (item) {
            if (item && _.isFunction(item.setDisabled)) {
                !item.keepState && (item.keepState = []);
                if (opts.clear && opts.clear.length > 0 && item.keepState.length > 0) {
                    item.keepState = _.difference(item.keepState, opts.clear);
                }

                _.isArray(causes) ? _.each(causes, function (c) {
                    doLock(item, c)
                }) : doLock(item, causes);

                if (!(item.keepState.length > 0)) {
                    item.isDisabled() && item.setDisabled(false);
                } else {
                    !item.isDisabled() && item.setDisabled(true);
                }
            }
        });
    };

    Common.Utils.injectButtons = function ($slots, id, iconCls, caption, lock, split, menu, toggle, dataHint, dataHintDirection, dataHintOffset, dataHintTitle) {
        var btnsArr = createButtonSet();
        btnsArr.setDisabled(true);
        id = id || ("id-toolbar-" + iconCls);
        $slots.each(function (index, el) {
            var _cls = 'btn-toolbar';
            /x-huge/.test(el.className) && (_cls += ' x-huge icon-top');

            var button = new Common.UI.Button({
                parentEl: $slots.eq(index),
                id: id + index,
                cls: _cls,
                iconCls: iconCls,
                caption: caption,
                split: split || false,
                menu: menu || false,
                enableToggle: toggle || false,
                lock: lock,
                disabled: true,
                dataHint: dataHint,
                dataHintDirection: dataHintDirection,
                dataHintOffset: dataHintOffset,
                dataHintTitle: dataHintTitle
            });

            btnsArr.add(button);
        });
        return btnsArr;
    };

    Common.Utils.injectComponent = function ($slot, cmp) {
        if (cmp && $slot.length) {
            cmp.rendered ? $slot.append(cmp.$el) : cmp.render($slot);
        }
    };

    Common.Utils.startFullscreenForElement = function (element) {
        if (element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        }
    }

    Common.Utils.cancelFullscreen = function () {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    Common.Utils.warningDocumentIsLocked = function (opts) {
        if (opts.disablefunc)
            opts.disablefunc(true);

        var app = window.DE || window.PE || window.SSE || window.PDFE;

        Common.UI.warning({
            msg: Common.Locale.get("warnFileLocked", {
                name: "Common.Translation",
                default: "You can't edit this file. Document is in use by another application."
            }),
            buttons: [{
                value: 'view',
                caption: Common.Locale.get("warnFileLockedBtnView", {
                    name: "Common.Translation",
                    default: "Open for viewing"
                })
            }, {
                value: 'edit',
                caption: Common.Locale.get("warnFileLockedBtnEdit", {
                    name: "Common.Translation",
                    default: "Create a copy"
                })
            }],
            primary: 'view',
            callback: function (btn) {
                if (btn == 'edit') {
                    if (opts.disablefunc) opts.disablefunc(false);
                    app.getController('Main').api.asc_setLocalRestrictions(Asc.c_oAscLocalRestrictionType.None);
                }
            }
        });
    };

    jQuery.fn.extend({
        elementById: function (id, parent) {
            /**
             * usage:   $obj.findById('#id')
             *          $().findById('#id', $obj | node)
             *          $.fn.findById('#id', $obj | node)
             *
             * return:  dom element
             * */
            var _el = document.getElementById(id.substring(1));
            if (!_el) {
                parent = parent || this;
                if (parent && parent.length > 0) {
                    parent.each(function (i, node) {
                        if (node.querySelectorAll) {
                            _el = node.querySelectorAll(id);
                            if (_el.length == 0) {
                                if (('#' + node.id) == id) {
                                    _el = node;
                                    return false;
                                }
                            } else if (_el.length) {
                                _el = _el[0];
                                return false;
                            }
                        }
                    })
                } else {
                    if (parent && parent.querySelectorAll) {
                        _el = parent.querySelectorAll(id);
                        if (_el && _el.length) return _el[0];
                    }
                }
            }

            return _el;
        },

        findById: function (id, parent) {
            var _el = $.fn.elementById.apply(this, arguments);
            return !!_el ? $(_el) : $();
        }
    });

    Common.Utils.InternalSettings.set('toolbar-height-tabs', 32);
    Common.Utils.InternalSettings.set('toolbar-height-tabs-top-title', 28);
    Common.Utils.InternalSettings.set('toolbar-height-controls', 67);
    Common.Utils.InternalSettings.set('document-title-height', 28);
    Common.Utils.InternalSettings.set('window-inactive-area-top', 0);

    Common.Utils.InternalSettings.set('toolbar-height-compact', Common.Utils.InternalSettings.get('toolbar-height-tabs'));
    Common.Utils.InternalSettings.set('toolbar-height-normal', Common.Utils.InternalSettings.get('toolbar-height-tabs') + Common.Utils.InternalSettings.get('toolbar-height-controls'));

    Common.Utils.ModalWindow = new (function () {
        var count = 0;
        return {
            show: function () {
                count++;
            },

            close: function () {
                count--;
            },

            isVisible: function () {
                return count > 0;
            }
        }
    })();

    Common.Utils.UserInfoParser = new (function () {
        var parse = false;
        var separator = String.fromCharCode(160);
        return {
            setParser: function (value) {
                parse = !!value;
            },

            getSeparator: function () {
                return separator;
            },

            getParsedName: function (username) {
                if (parse && username) {
                    return username.substring(username.indexOf(separator) + 1);
                } else
                    return username;
            },

            getParsedGroups: function (username) {
                if (parse && username) {
                    var idx = username.indexOf(separator),
                        groups = (idx > -1) ? username.substring(0, idx).split(',') : [];
                    for (var i = 0; i < groups.length; i++)
                        groups[i] = groups[i].trim();
                    return groups;
                } else
                    return undefined;
            }
        }
    })();

    Common.Utils.getUserInitials = function (username) {
        var fio = username.split(' ');
        var initials = fio[0].substring(0, 1).toUpperCase();
        for (var i = fio.length - 1; i > 0; i--) {
            if (fio[i][0] !== '(' && fio[i][0] !== ')') {
                if (/[\u0600-\u06FF]/.test(initials))
                    initials += '\u2009';
                initials += fio[i].substring(0, 1).toUpperCase();
                break;
            }
        }
        return initials;
    };

    Common.Utils.getKeyByValue = function (obj, value) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (obj[prop] === value)
                    return prop;
            }
        }
    };

    Common.Utils.checkComponentLoaded = function (cmp) {
        return typeof cmp === 'function';
    }

    !Common.UI && (Common.UI = {});
    Common.UI.isRTL = function () {
        if (window.isrtl === undefined) {
            if (window.nativeprocvars && window.nativeprocvars.rtl !== undefined)
                window.isrtl = window.nativeprocvars.rtl;
            else window.isrtl = !Common.Utils.isIE && Common.localStorage.getBool("ui-rtl", Common.Locale.isCurrentLanguageRtl());
        }

        return window.isrtl;
    };

    Common.UI.iconsStr2IconsObj = function (icons) {
        if (typeof icons !== 'string')
            return icons;
       
        /*
            valid params:
            theme-type - {string} theme type (light|dark|common)
            theme-name - {string} the name of theme
            state - {string} state of icons for different situations (normal|hover|active)
            scale - {string} list of avaliable scales (100|125|150|175|200|default|extended)
            extension - {string} use it after symbol "." (png|jpeg|svg)

            Example: "resources/%theme-type%(light|dark)/%state%(normal)/icon%scale%(default).%extension%(png)"
        */
        let params_array = {
            "theme-name" : { origin : "", values : [""] },
            "theme-type" : { origin : "", values : [""] },
            "state" : { origin : "", values : ["normal"] },
            "scale" : { origin : "", values : [] },
            "extension" : { origin : "", values : [] }
        };

        let param_parse = function(name) {
            let posOrigin = icons.indexOf("%" + name + "%");
            if (posOrigin === -1)
                return;
            let pos = posOrigin + name.length + 2;
            let pos1 = icons.indexOf("(", pos);
            if (pos1 != pos)
                return;
            let pos2 = icons.indexOf(")", pos1);
            params_array[name].origin = icons.substring(posOrigin, pos2 + 1);
            params_array[name].values = icons.substring(pos1 + 1, pos2).split("|");                    
        };

        for (let name in params_array)
            param_parse(name);

        for (let styleIndex = 0, stylesLen = params_array["scale"].values.length; styleIndex < stylesLen; styleIndex++) {
            if ("default" === params_array["scale"].values[styleIndex])
                params_array["scale"].values.splice(styleIndex, 1, "100", "125", "150", "175", "200");
        }

        let rasterExt = "";
        let isSvgPresent = false;

        for (let extIndex = 0, extsLen = params_array["extension"].values.length; extIndex < extsLen; extIndex++) {
            if ("svg" === params_array["extension"].values[extIndex])
                isSvgPresent = true;
            else
                rasterExt = params_array["extension"].values[extIndex];
        }
        if (isSvgPresent && rasterExt === "")
            rasterExt = "svg";

        let iconsObject = [];
        for (let themeNameIndex = 0, themeNamesLen = params_array["theme-name"].values.length; themeNameIndex < themeNamesLen; themeNameIndex++) {
            let themeName = params_array["theme-name"].values[themeNameIndex];
            for (let themeTypeIndex = 0, themeTypesLen = params_array["theme-type"].values.length; themeTypeIndex < themeTypesLen; themeTypeIndex++) {
                let url = icons;
                let themeType = params_array["theme-type"].values[themeTypeIndex];
                
                let obj = {};
                if ("" !== themeName)
                    obj["theme"] = themeName;
                
                if ("" !== themeType)
                    obj["style"] = themeType;

                if ("" != params_array["theme-name"].origin)
                    url = url.replaceAll(params_array["theme-name"].origin, themeName);
                if ("" != params_array["theme-type"].origin)
                    url = url.replaceAll(params_array["theme-type"].origin, themeType);

                let scalesLen = params_array["scale"].values.length;
                if (0 == scalesLen) {
                    params_array["scale"].values.push("100");
                    scalesLen++;
                }
                for (let scaleIndex = 0; scaleIndex < scalesLen; scaleIndex++) {
                    let scaleValue = params_array["scale"].values[scaleIndex];
                    let isAll = false;

                    if (scaleValue.length > 0) {
                        if (scaleValue === "*")
                            isAll = true;
                        else if (scaleValue.charAt(scaleValue.length - 1) === "%")
                            scaleValue = scaleValue.substring(0, scaleValue.length - 1);
                    } else {
                        isAll = true;
                        scaleValue = "*";
                    }                    

                    let addonScale = "";
                    if (!isAll) {
                        let intScale = parseInt(scaleValue);
                        if (intScale !== 100) {
                            let addon100 = intScale % 100;
                            addonScale = "@" + ((intScale / 100) >> 0);
                            if (addon100 !== 0) {
                                if (0 === (addon100 % 10))
                                    addon100 /= 10;
                                addonScale += ("." + addon100);
                            }
                            addonScale += "x";
                        }
                        scaleValue = scaleValue + "%";
                    }

                    let urlAll = url;
                    if (params_array["scale"].origin != "")
                        urlAll = urlAll.replaceAll(params_array["scale"].origin, addonScale);
                    if (params_array["extension"].origin != "")
                        urlAll = urlAll.replaceAll(params_array["extension"].origin, (isAll && isSvgPresent) ? "svg" : rasterExt);

                    obj[scaleValue] = {};
                    let states =  params_array["state"].values;
                    for (let stateIndex = 0, statesLen = states.length; stateIndex < statesLen; stateIndex++) {
                        let stateValue = params_array["state"].values[stateIndex];
                        if (params_array["state"].origin !== "") {
                            if ("normal" === stateValue) {
                                let statePos = urlAll.indexOf(params_array["state"].origin);
                                obj[scaleValue][stateValue] = urlAll.replace(params_array["state"].origin, "");
                                if (obj[scaleValue][stateValue].charAt(statePos) == "/")
                                    obj[scaleValue][stateValue] = obj[scaleValue][stateValue].substring(0, statePos) + obj[scaleValue][stateValue].substring(statePos + 1);
                            } else {
                                obj[scaleValue][stateValue] = urlAll.replace(params_array["state"].origin, "_" + stateValue);
                            }
                        } else
                            obj[scaleValue][stateValue] = urlAll;
                    }                            
                }                        
                iconsObject.push(obj);
            }
        }

        return iconsObject;
    }

    Common.UI.getSuitableIcons = function (icons) {
        if (!icons) return;

        icons = Common.UI.iconsStr2IconsObj(icons);
        if (icons.length && typeof icons[0] !== 'string') {
            var theme = Common.UI.Themes.currentThemeId().toLowerCase(),
                style = Common.UI.Themes.isDarkTheme() ? 'dark' : 'light',
                idx = -1;
            for (var i = 0; i < icons.length; i++) {
                if (icons[i].theme && icons[i].theme.toLowerCase() == theme) {
                    idx = i;
                    break;
                }
            }
            if (idx < 0)
                for (var i = 0; i < icons.length; i++) {
                    if (icons[i].style && icons[i].style.toLowerCase() == style) {
                        idx = i;
                        break;
                    }
                }
            (idx < 0) && (idx = 0);

            var ratio = Common.Utils.applicationPixelRatio() * 100,
                current = icons[idx],
                bestDistance = 10000,
                currentDistance = 0,
                defUrl,
                bestUrl;
            for (var key in current) {
                if (current.hasOwnProperty(key)) {
                    if (key == 'default') {
                        defUrl = current[key];
                    } else if (!isNaN(parseInt(key))) {
                        currentDistance = Math.abs(ratio - parseInt(key));
                        if (currentDistance < (bestDistance - 0.01)) {
                            bestDistance = currentDistance;
                            bestUrl = current[key];
                        }
                    }
                }
            }
            (bestDistance > 0.01 && defUrl) && (bestUrl = defUrl);
            return {
                'normal': bestUrl ? bestUrl['normal'] : '',
                'hover': bestUrl ? bestUrl['hover'] || bestUrl['normal'] : '',
                'active': bestUrl ? bestUrl['active'] || bestUrl['normal'] : ''
            };
        } else { // old version
            var url = icons[((Common.Utils.applicationPixelRatio() > 1 && icons.length > 1) ? 1 : 0) + (icons.length > 2 ? 2 : 0)];
            return {
                'normal': url,
                'hover': url,
                'active': url
            };
        }
    }

    Common.UI.simpleColorsConfig = {
        colors: [
            '1755A0', 'D43230', 'F5C346', 'EA3368', '12A489', '552F8B', '9D1F87', 'BB2765', '479ED2', '67C9FA',
            '3D8A44', '80CA3D', '1C19B4', '7F4B0F', 'FF7E07', 'FFFFFF', 'D3D3D4', '879397', '575757', '000000'
        ],
        dynamiccolors: 5,
        themecolors: 0,
        effects: 0,
        columns: 5,
        cls: 'palette-large',
        paletteWidth: 174
    };
});