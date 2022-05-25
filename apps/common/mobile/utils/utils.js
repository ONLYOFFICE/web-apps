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
 *  utils.js
 *
 *  Created by Maxim.Kadushkin on 1/30/2017
 *  Copyright (c) 2018 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'jquery',
    'underscore'
], function ($, _) {
    'use strict';

    !Common && (Common = {});
    !Common.Utils && (Common.Utils = {});

    Common.Utils.androidMenuTop = function ($popover, $target) {
        $popover.css({left: '', top: ''});
        var modalWidth =  $popover.width();
        var modalHeight =  $popover.height();
        var modalAngleSize = 10;
        var targetWidth = $target.outerWidth();
        var targetHeight = $target.outerHeight();
        var targetOffset = $target.offset();
        var targetParentPage = $target.parents('.page');
        if (targetParentPage.length > 0) {
            targetOffset.top = targetOffset.top - targetParentPage[0].scrollTop;
        }

        var windowHeight = $(window).height();
        var windowWidth = $(window).width();

        var modalTop = 0;
        var modalLeft = 0;

        // Top Position
        var modalPosition = 'top';// material ? 'bottom' : 'top';
        {
            if ((modalHeight + modalAngleSize) < targetOffset.top) {
                // On top
                modalTop = targetOffset.top - modalHeight - modalAngleSize;
            }
            else if ((modalHeight + modalAngleSize) < windowHeight - targetOffset.top - targetHeight) {
                // On bottom
                modalPosition = 'bottom';
                modalTop = targetOffset.top + targetHeight + modalAngleSize;
            }
            else {
                // On middle
                modalPosition = 'middle';
                modalTop = targetHeight / 2 + targetOffset.top - modalHeight / 2;

                if (modalTop <= 0) {
                    modalTop = 5;
                }
                else if (modalTop + modalHeight >= windowHeight) {
                    modalTop = windowHeight - modalHeight - 5;
                }
            }

            // Horizontal Position
            if (modalPosition === 'top' || modalPosition === 'bottom') {
                modalLeft = targetWidth / 2 + targetOffset.left - modalWidth / 2;
                if (modalLeft < 5) modalLeft = 5;
                if (modalLeft + modalWidth > windowWidth) modalLeft = windowWidth - modalWidth - 5;
            }
            else if (modalPosition === 'middle') {
                modalLeft = targetOffset.left - modalWidth - modalAngleSize;

                if (modalLeft < 5 || (modalLeft + modalWidth > windowWidth)) {
                    if (modalLeft < 5) modalLeft = targetOffset.left + targetWidth + modalAngleSize;
                    if (modalLeft + modalWidth > windowWidth) modalLeft = windowWidth - modalWidth - 5;
                }
            }
        }

        // Apply Styles
        $popover.css({top: modalTop + 'px', left: modalLeft + 'px'});
    };

    Common.Utils.addScrollIfNeed = function (targetSelector, containerSelector) {
        if (Common.SharedSettings.get('sailfish')) {
            _.delay(function(){
                var $targetEl = $(targetSelector);
                var $containerEl = $(containerSelector);
                
                if ($targetEl.length == 0 || $containerEl == 0) {
                    return;
                }

                $containerEl.css('height', 'auto');
                new IScroll(targetSelector);
            }, 500);
        }
    };

    Common.Utils.CThumbnailLoader = function () {
        this.image = null;
        this.binaryFormat = null;
        this.data = null;
        this.width = 0;
        this.height = 0;
        this.heightOne = 0;
        this.count = 0;

        this.load = function(url, callback) {
            if (!callback)
                return;

            var me = this;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url + ".bin", true);
            xhr.responseType = 'arraybuffer';

            if (xhr.overrideMimeType)
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
            else xhr.setRequestHeader('Accept-Charset', 'x-user-defined');

            xhr.onload = function() {
                // TODO: check errors
                me.binaryFormat = this.response;
                callback();
            };

            xhr.send(null);
        };

        this.openBinary = function(arrayBuffer) {
            //var t1 = performance.now();

            const binaryAlpha = new Uint8Array(arrayBuffer);
            this.width      = (binaryAlpha[0] << 24) | (binaryAlpha[1] << 16) | (binaryAlpha[2] << 8) | (binaryAlpha[3] << 0);
            this.heightOne  = (binaryAlpha[4] << 24) | (binaryAlpha[5] << 16) | (binaryAlpha[6] << 8) | (binaryAlpha[7] << 0);
            this.count      = (binaryAlpha[8] << 24) | (binaryAlpha[9] << 16) | (binaryAlpha[10] << 8) | (binaryAlpha[11] << 0);
            this.height     = this.count * this.heightOne;

            this.data = new Uint8ClampedArray(4 * this.width * this.height);

            var binaryIndex = 12;
            var imagePixels = this.data;
            var index = 0;

            var len0 = 0;
            var tmpValue = 0;
            while (binaryIndex < binaryAlpha.length) {
                tmpValue = binaryAlpha[binaryIndex++];
                if (0 == tmpValue) {
                    len0 = binaryAlpha[binaryIndex++];
                    while (len0 > 0) {
                        len0--;
                        imagePixels[index] = imagePixels[index + 1] = imagePixels[index + 2] = 255;
                        imagePixels[index + 3] = 0; // this value is already 0.
                        index += 4;
                    }
                } else {
                    imagePixels[index] = imagePixels[index + 1] = imagePixels[index + 2] = 255 - tmpValue;
                    imagePixels[index + 3] = tmpValue;
                    index += 4;
                }
            }

            //var t2 = performance.now();
            //console.log(t2 - t1);
        };

        this.getImage = function(index, canvas, ctx) {
            //var t1 = performance.now();
            if (!canvas) {
                canvas = document.createElement("canvas");
                canvas.width = this.width;
                canvas.height = this.heightOne;
                canvas.style.width = iconWidth + "px";
                canvas.style.height = iconHeight + "px";

                ctx = canvas.getContext("2d");
            }

            if (!this.data) {
                this.openBinary(this.binaryFormat);
                delete this.binaryFormat;
            }

            var dataTmp = ctx.createImageData(this.width, this.heightOne);
            const sizeImage = 4 * this.width * this.heightOne;
            dataTmp.data.set(new Uint8ClampedArray(this.data.buffer, index * sizeImage, sizeImage));
            ctx.putImageData(dataTmp, 0, 0);

            //var t2 = performance.now();
            //console.log(t2 - t1);

            return canvas;
        };
    };
});
