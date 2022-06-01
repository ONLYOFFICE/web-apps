import {action, observable, makeObservable, computed} from 'mobx';

export class storeTextSettings {
    constructor() {
        makeObservable(this, {
            fontsArray: observable,
            fontInfo: observable,
            fontName: observable,
            arrayRecentFonts: observable,
            fontSize: observable,
            isBold: observable,
            isItalic: observable,
            isUnderline: observable,
            textColor: observable,
            customTextColors: observable,
            paragraphAlign: observable,
            paragraphValign: observable,
            textIn: observable,
            resetFontsRecent:action,
            initTextSettings: action,
            initFontSettings: action,
            initEditorFonts: action,
            initFontInfo: action,
            changeTextColor: action,
            changeCustomTextColors: action,
            iconWidth: observable,
            iconHeight: observable,
            thumbCanvas: observable,
            thumbContext: observable,
            thumbs: observable,
            thumbIdx: observable,
            listItemHeight: observable,
            spriteCols: observable,
            loadSprite: action,
            addFontToRecent:action
        });
    }
    
    iconWidth;
    iconHeight;
    thumbCanvas;
    thumbContext;
    thumbs;
    thumbIdx = 0;
    listItemHeight = 28;
    spriteCols = 1;
    fontsArray = [];
    arrayRecentFonts = [];
    fontInfo = {};
    fontName = '';
    fontSize = undefined;
    isBold = false;
    isItalic = false;
    isUnderline = false;
    textColor = undefined;
    customTextColors = [];
    paragraphAlign = undefined;
    paragraphValign = undefined;
    textIn = undefined;

    initTextSettings(cellInfo) {
        let xfs = cellInfo.asc_getXfs();
        let selectType = cellInfo.asc_getSelectionType();

        switch (selectType) {
            case Asc.c_oAscSelectionType.RangeChartText: this.textIn = 1; break;
            case Asc.c_oAscSelectionType.RangeShapeText: this.textIn = 2; break;
            default: this.textIn = 0;
        }

        this.initFontSettings(xfs);
    }

    initFontSettings(xfs) {
        this.fontName = xfs.asc_getFontName();
        this.fontSize = xfs.asc_getFontSize();

        this.isBold = xfs.asc_getFontBold();
        this.isItalic = xfs.asc_getFontItalic();
        this.isUnderline = xfs.asc_getFontUnderline();
    
        let color = xfs.asc_getFontColor();
        // console.log(color);
        this.textColor = this.resetTextColor(color);

        this.paragraphAlign = xfs.asc_getHorAlign();
        this.paragraphValign = xfs.asc_getVertAlign();
    }

    initEditorFonts (fonts, select) {
        let array = [];
        for (let font of fonts) {
            let fontId = font.asc_getFontId();
            array.push({
                id          : fontId,
                name        : font.asc_getFontName(),
                //displayValue: font.asc_getFontName(),
                imgidx      : font.asc_getFontThumbnail(),
                type        : font.asc_getFontType()
            });
        }
        this.fontsArray = array;
        this.iconWidth = 300;
        this.iconHeight = Asc.FONT_THUMBNAIL_HEIGHT || 28;
        this.thumbCanvas = document.createElement('canvas');
        this.thumbContext = this.thumbCanvas.getContext('2d');
        this.thumbs = [
            {ratio: 1, path: '../../../../../sdkjs/common/Images/fonts_thumbnail.png', width: this.iconWidth, height: this.iconHeight},
            {ratio: 1.25, path: '../../../../../sdkjs/common/Images/fonts_thumbnail@1.25x.png', width: this.iconWidth * 1.25, height: this.iconHeight * 1.25},
            {ratio: 1.5, path: '../../../../../sdkjs/common/Images/fonts_thumbnail@1.5x.png', width: this.iconWidth * 1.5, height: this.iconHeight * 1.5},
            {ratio: 1.75, path: '../../../../../sdkjs/common/Images/fonts_thumbnail@1.75x.png', width: this.iconWidth * 1.75, height: this.iconHeight * 1.75},
            {ratio: 2, path: '../../../../../sdkjs/common/Images/fonts_thumbnail@2x.png', width: this.iconWidth * 2, height: this.iconHeight * 2}
        ];

        const applicationPixelRatio = Common.Utils.applicationPixelRatio();

        let bestDistance = Math.abs(applicationPixelRatio - this.thumbs[0].ratio);
        let currentDistance = 0;

        for (let i = 1; i < this.thumbs.length; i++) {
            currentDistance = Math.abs(applicationPixelRatio - this.thumbs[i].ratio);
            if (currentDistance < (bestDistance - 0.0001))
            {
                bestDistance = currentDistance;
                this.thumbIdx = i;
            }
        }

        this.thumbCanvas.height = this.thumbs[this.thumbIdx].height;
        this.thumbCanvas.width = this.thumbs[this.thumbIdx].width;

        this.loadSprite();
    }

    loadSprite() {
        function CThumbnailLoader() {
            this.supportBinaryFormat = true;

            this.image = null;
            this.binaryFormat = null;
            this.data = null;
            this.width = 0;
            this.height = 0;
            this.heightOne = 0;
            this.count = 0;
            this.offsets = null;

            this.load = function(url, callback) {
                if (!callback)
                    return;

                var xhr = new XMLHttpRequest();
                xhr.open('GET', url + ".bin", true);
                xhr.responseType = 'arraybuffer';

                if (xhr.overrideMimeType)
                    xhr.overrideMimeType('text/plain; charset=x-user-defined');
                else xhr.setRequestHeader('Accept-Charset', 'x-user-defined');

                xhr.onload = e => {
                    // TODO: check errors
                    this.binaryFormat = new Uint8Array(e.target.response);
                    callback();
                };

                xhr.send(null);
            };

            this.openBinary = function(arrayBuffer) {

                //var t1 = performance.now();

                var binaryAlpha = new Uint8Array(arrayBuffer);
                this.width      = (binaryAlpha[0] << 24) | (binaryAlpha[1] << 16) | (binaryAlpha[2] << 8) | (binaryAlpha[3] << 0);
                this.heightOne  = (binaryAlpha[4] << 24) | (binaryAlpha[5] << 16) | (binaryAlpha[6] << 8) | (binaryAlpha[7] << 0);
                this.count      = (binaryAlpha[8] << 24) | (binaryAlpha[9] << 16) | (binaryAlpha[10] << 8) | (binaryAlpha[11] << 0);
                this.height     = this.count * this.heightOne;

                const MAX_MEMORY_SIZE = 100000000;
                const memorySize = 4 * this.width * this.height;
                const isOffsets = memorySize > MAX_MEMORY_SIZE;

                if (!isOffsets)
                    this.data = new Uint8ClampedArray(memorySize);
                else this.offsets = new Array(this.count);

                var binaryIndex = 12;
                var binaryLen = binaryAlpha.length;
                var index = 0;

                var len0 = 0;
                var tmpValue = 0;

                if (!isOffsets) {
                    var imagePixels = this.data;
                    while (binaryIndex < binaryLen) {
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
                } else {
                    var module = this.width * this.heightOne;
                    var moduleCur = module - 1;
                    while (binaryIndex < binaryLen) {
                        tmpValue = binaryAlpha[binaryIndex++];
                        if (0 == tmpValue) {
                            len0 = binaryAlpha[binaryIndex++];
                            while (len0 > 0) {
                                len0--;
                                moduleCur++;
                                if (moduleCur === module) {
                                    this.offsets[index++] = { pos : binaryIndex, len : len0 + 1 };
                                    moduleCur = 0;
                                }
                            }
                        } else {
                            moduleCur++;
                            if (moduleCur === module) {
                                this.offsets[index++] = { pos : binaryIndex - 1, len : -1 };
                                moduleCur = 0;
                            }
                        }
                    }
                }

                if ( !this.offsets )
                    delete this.binaryFormat;

                //var t2 = performance.now();
                //console.log(t2 - t1);
            };

            this.getImage = function(index, canvas, ctx) {

                //var t1 = performance.now();
                if (!canvas)
                {
                    canvas = document.createElement("canvas");
                    canvas.width = this.width;
                    canvas.height = this.heightOne;
                    canvas.style.width = iconWidth + "px";
                    canvas.style.height = iconHeight + "px";

                    ctx = canvas.getContext("2d");
                }

                if (!this.data && !this.offsets) {
                    this.openBinary(this.binaryFormat);
                }

                var dataTmp = ctx.createImageData(this.width, this.heightOne);
                var sizeImage = 4 * this.width * this.heightOne;

                if (!this.offsets) {
                    dataTmp.data.set(new Uint8ClampedArray(this.data.buffer, index * sizeImage, sizeImage));
                } else {
                    const binaryAlpha = this.binaryFormat;
                    var binaryIndex = this.offsets[index].pos;
                    var alphaChannel = 0;
                    var pixelsCount = this.width * this.heightOne;
                    var tmpValue = 0, len0 = 0;
                    let imagePixels = dataTmp.data;
                    if (-1 != this.offsets[index].len) {
                        /*
                        // this values is already 0.
                        for (var i = 0; i < this.offsets[index].len; i++) {
                            pixels[alphaChannel] = 0;
                            alphaChannel += 4;
                        }
                        */
                        alphaChannel += 4 * this.offsets[index].len;
                    }
                    while (pixelsCount > 0) {
                        tmpValue = binaryAlpha[binaryIndex++];
                        if (0 == tmpValue) {
                            len0 = binaryAlpha[binaryIndex++];
                            if (len0 > pixelsCount)
                                len0 = pixelsCount;
                            while (len0 > 0) {
                                len0--;
                                imagePixels[alphaChannel] = imagePixels[alphaChannel + 1] = imagePixels[alphaChannel + 2] = 255;
                                imagePixels[alphaChannel + 3] = 0; // this value is already 0.
                                alphaChannel += 4;
                                pixelsCount--;
                            }
                        } else {
                            imagePixels[alphaChannel] = imagePixels[alphaChannel + 1] = imagePixels[alphaChannel + 2] = 255 - tmpValue;
                            imagePixels[alphaChannel + 3] = tmpValue;
                            alphaChannel += 4;
                            pixelsCount--;
                        }
                    }
                }
                ctx.putImageData(dataTmp, 0, 0);

                //var t2 = performance.now();
                //console.log(t2 - t1);

                return canvas;
            };
        }

        this.spriteThumbs = new CThumbnailLoader();
        this.spriteThumbs.load(this.thumbs[this.thumbIdx].path, () => {
            this.spriteCols = Math.floor(this.spriteThumbs.width / (this.thumbs[this.thumbIdx].width)) || 1;

            if (!this.spriteThumbs.data && !this.spriteThumbs.offsets) {
                this.spriteThumbs.openBinary(this.spriteThumbs.binaryFormat);
            }
        });
    }

    initFontInfo(fontObj) {
        this.fontInfo = fontObj;
    }

    addFontToRecent (font) {
        this.arrayRecentFonts.forEach(item => {
            if (item.name === font.name) this.arrayRecentFonts.splice(this.arrayRecentFonts.indexOf(item),1);
        })
        this.arrayRecentFonts.unshift(font);

        if (this.arrayRecentFonts.length > 5) this.arrayRecentFonts.splice(4,1);
    }

    changeTextColor(value) {
        this.textColor = value;
    }

    resetTextColor (color) {
        let value;

        if (color) {
            if (color.get_auto()) {
                value = 'auto';
            } else {
                if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                    value = {
                        color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()),
                        effectValue: color.get_value()
                    }
                } else {
                    value = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                }
            }
        }

        return value;
    }

    resetFontsRecent(fonts) {
        this.arrayRecentFonts = fonts;
        this.arrayRecentFonts = this.arrayRecentFonts ? JSON.parse(this.arrayRecentFonts) : [];
    }

    changeCustomTextColors (colors) {
        this.customTextColors = colors;
    }
}