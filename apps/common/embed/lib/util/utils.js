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

+function () {
    !window.common && (window.common = {});
    !common.utils && (common.utils = {});

    common.utils = new(function(){
        var userAgent = navigator.userAgent.toLowerCase(),
            check = function(regex){
                return regex.test(userAgent);
            },
            version = function (is, regex) {
                var m;
                return (is && (m = regex.exec(userAgent))) ? parseFloat(m[1]) : 0;
            },
            isOpera = check(/opera/),
            isIE = !isOpera && (check(/msie/) || check(/trident/) || check(/edge/)),
            isChrome = !isIE && check(/\bchrome\b/),
            chromeVersion = version(true, /\bchrome\/(\d+\.\d+)/),
            isMac = check(/macintosh|mac os x/),
            zoom = 1,
            checkSize = function () {
                var scale = {};
                if (!!window.AscCommon && !!window.AscCommon.checkDeviceScale) {
                    scale = window.AscCommon.checkDeviceScale();
                    AscCommon.correctApplicationScale(scale);
                    scale.correct && (zoom = scale.zoom);
                }
            },
            isOffsetUsedZoom = function() {
                if (isChrome && 128 <= chromeVersion)
                    return (zoom === 1) ? false : true;
                return false;
            },
            getBoundingClientRect = function(element) {
                let rect = element.getBoundingClientRect();
                if (!isOffsetUsedZoom())
                    return rect;

                let koef = zoom;
                let newRect = {}
                if (rect.x!==undefined) newRect.x = rect.x * koef;
                if (rect.y!==undefined) newRect.y = rect.y * koef;
                if (rect.width!==undefined) newRect.width = rect.width * koef;
                if (rect.height!==undefined) newRect.height = rect.height * koef;

                if (rect.left!==undefined) newRect.left = rect.left * koef;
                if (rect.top!==undefined) newRect.top = rect.top * koef;
                if (rect.right!==undefined) newRect.right = rect.right * koef;
                if (rect.bottom!==undefined) newRect.bottom = rect.bottom * koef;
                return newRect;
            },
            getOffset = function($element) {
                let pos = $element.offset();
                if (!isOffsetUsedZoom())
                    return pos;
                return {left: pos.left * zoom, top: pos.top * zoom};
            },
            setOffset = function($element, options) {
                var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
                    position = $element.css("position"),
                    props = {};

                if ( position === "static" ) {
                    $element[0].style.position = "relative";
                }

                curOffset = getOffset($element);
                curCSSTop = $element.css("top");
                curCSSLeft = $element.css("left");
                calculatePosition = ( position === "absolute" || position === "fixed" ) &&
                    ( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

                if ( calculatePosition ) {
                    curPosition = getPosition($element);
                    curTop = curPosition.top;
                    curLeft = curPosition.left;
                } else {
                    curTop = parseFloat( curCSSTop ) || 0;
                    curLeft = parseFloat( curCSSLeft ) || 0;
                }

                if ( options.top != null ) {
                    props.top = ( options.top - curOffset.top ) + curTop;
                }
                if ( options.left != null ) {
                    props.left = ( options.left - curOffset.left ) + curLeft;
                }
                $element.css( props );
            },
            getPosition = function($element) {
                let pos = $element.position();
                if (!isOffsetUsedZoom())
                    return pos;
                return {left: pos.left * zoom, top: pos.top * zoom};
            };
        if (!isIE) {
            checkSize();
            $(window).on('resize', checkSize);
        }
        return {
            openLink: function(url) {
                if (url) {
                    var newDocumentPage = window.open(url, '_blank');
                    if (newDocumentPage)
                        newDocumentPage.focus();
                }
            }
            , dialogPrint: function(url, api) {
                $('#id-print-frame').remove();

                if ( !!url ) {
                    var iframePrint = document.createElement("iframe");

                    iframePrint.id = "id-print-frame";
                    iframePrint.style.display = 'none';
                    iframePrint.style.visibility = "hidden";
                    iframePrint.style.position = "fixed";
                    iframePrint.style.right = "0";
                    iframePrint.style.bottom = "0";
                    document.body.appendChild(iframePrint);

                    iframePrint.onload = function () {
                        try {
                            iframePrint.contentWindow.focus();
                            iframePrint.contentWindow.print();
                            iframePrint.contentWindow.blur();
                            window.focus();
                        } catch (e) {
                            api.asc_DownloadAs(new Asc.asc_CDownloadOptions(Asc.c_oAscFileType.PDF));
                        }
                    };

                    iframePrint.src = url;
                }
            },
            htmlEncode: function(value) {
                return $('<div/>').text(value).html();
            },

            fillUserInfo: function(info, lang, defname, defid) {
                var _user = info || {};
                _user.anonymous = !_user.id;
                !_user.id && (_user.id = defid);
                _user.fullname = !_user.name ? defname : _user.name;
                _user.group && (_user.fullname = (_user.group).toString() + AscCommon.UserInfoParser.getSeparator() + _user.fullname);
                _user.guest = !_user.name;
                return _user;
            },

            fixedDigits: function(num, digits, fill) {
                (fill===undefined) && (fill = '0');
                var strfill = "",
                    str = num.toString();
                for (var i=str.length; i<digits; i++) strfill += fill;
                return strfill + str;
            },
            getKeyByValue: function(obj, value) {
                for(var prop in obj) {
                    if(obj.hasOwnProperty(prop)) {
                        if(obj[prop] === value)
                            return prop;
                    }
                }
            },
            getBoundingClientRect: getBoundingClientRect,
            getOffset: getOffset,
            setOffset: setOffset,
            getPosition: getPosition,
            isMac : isMac,
            isIE: isIE
        };
    })();
}();
