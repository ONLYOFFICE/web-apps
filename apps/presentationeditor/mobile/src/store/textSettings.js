import {action, observable, computed, makeObservable} from 'mobx';

export class storeTextSettings {
    constructor() {
        makeObservable(this, {
            fontsArray: observable,
            fontName: observable,
            arrayRecentFonts:observable,
            fontSize: observable,
            isBold: observable,
            isItalic: observable,
            isUnderline: observable,
            isStrikethrough: observable,
            typeBaseline: observable,
            listType: observable,
            typeBullets: observable,
            typeNumbers: observable,
            paragraphAlign: observable,
            paragraphValign: observable,
            canIncreaseIndent: observable,
            canDecreaseIndent: observable,
            textColor: observable,
            customTextColors: observable,
            lineSpacing: observable,
            initEditorFonts: action,
            resetFontName: action,
            resetFontsRecent:action,
            resetFontSize: action,
            resetIsBold: action,
            resetIsItalic: action,
            resetIsUnderline: action,
            resetIsStrikeout: action,
            resetIncreaseIndent: action,
            resetDecreaseIndent: action,
            resetTypeBaseline: action,
            isSuperscript: computed,
            isSubscript: computed,
            resetListType: action,
            resetBullets: action,
            resetNumbers: action,
            resetParagraphAlign: action,
            resetParagraphValign: action,
            resetTextColor: action,
            changeCustomTextColors: action,
            resetLineSpacing: action,
            iconWidth: observable,
            iconHeight: observable,
            thumbCanvas: observable,
            thumbContext: observable,
            thumbs: observable,
            thumbIdx: observable,
            listItemHeight: observable,
            spriteCols: observable,
            loadSprite: action,
            addFontToRecent:action,
            highlightColor: observable,
            resetHighlightColor: action
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
    fontName = '';
    fontSize = undefined;
    isBold = false;
    isItalic = false;
    isUnderline = false;
    isStrikethrough = false;
    typeBaseline = undefined;
    listType = undefined;
    typeBullets = undefined;
    typeNumbers = undefined;
    paragraphAlign = undefined;
    paragraphValign = undefined;
    canIncreaseIndent = undefined;
    canDecreaseIndent = undefined;
    textColor = undefined;
    highlightColor = undefined;
    customTextColors = [];
    lineSpacing = undefined;

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

                xhr.onload = e =>  {
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

    resetFontName (font) {
        let name = (typeof font.get_Name) === "function" ? font.get_Name() : font.asc_getName();
        this.fontName = name;
    }

    resetFontsRecent(fonts) {
        this.arrayRecentFonts = fonts;
        this.arrayRecentFonts = this.arrayRecentFonts ? JSON.parse(this.arrayRecentFonts) : [];
    }

    resetFontSize (size) {
        this.fontSize = size;
    }

    resetIsBold (isBold) {
        this.isBold = isBold;
    }

    resetIsItalic (isItalic) {
        this.isItalic = isItalic;
    }

    resetIsUnderline (isUnderline) {
        this.isUnderline = isUnderline;
    }

    resetIsStrikeout (isStrikethrough) {
        this.isStrikethrough = isStrikethrough;
    }

    // Indent 

    resetIncreaseIndent(value) {
        this.canIncreaseIndent = value;
    }

    resetDecreaseIndent(value) {
        this.canDecreaseIndent = value;
    }

    // vertical align

    resetTypeBaseline (typeBaseline) {
        this.typeBaseline = typeBaseline;
    }

    get isSuperscript() {
        return (this.typeBaseline === 1);
    }

    get isSubscript() {
        return (this.typeBaseline === 2);
    }

    // bullets

    resetListType (type) {
        this.listType = type;
    }

    resetBullets (type) {
        this.typeBullets = type;
    }

    resetNumbers (type) {
        this.typeNumbers = type;
    }

    resetParagraphAlign (align) {
        let value;
        switch (align) {
            case 0:
                value = 'right';
                break;
            case 1:
                value = 'left';
                break;
            case 2:
                value = 'center';
                break;
            case 3:
                value = 'just';
                break;
        }
        this.paragraphAlign = value;
    }

    resetParagraphValign (align) {
        let value;
        switch (align) {
            case 0:
                value = 'bottom';
                break;
            case 4:
                value = 'top';
                break;
            case 1:
                value = 'center';
                break;
        }
        this.paragraphValign = value;
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
        this.textColor = value;
    }

    changeCustomTextColors (colors) {
        this.customTextColors = colors;
    }

    addFontToRecent (font) {
        this.arrayRecentFonts.forEach(item => {
            if (item.name === font.name) this.arrayRecentFonts.splice(this.arrayRecentFonts.indexOf(item),1);
        })
        this.arrayRecentFonts.unshift(font);

        if (this.arrayRecentFonts.length > 5) this.arrayRecentFonts.splice(4,1);
    }

    resetLineSpacing (vc) {
        let line = (vc.get_Line() === null || vc.get_LineRule() === null || vc.get_LineRule() != 1) ? -1 : vc.get_Line();
        this.lineSpacing = line;
    }

    resetHighlightColor(color) {
        if (color == -1) {
            this.highlightColor = 'transparent';  
        } else {
            this.highlightColor = color.get_hex();
        }
        
    }
}