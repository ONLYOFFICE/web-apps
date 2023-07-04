import {action, observable, computed, makeObservable} from 'mobx';
import CThumbnailLoader from '../../../../common/mobile/utils/CThumbnailLoader';

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
            typeMultiLevel: observable,
            paragraphAlign: observable,
            textColor: observable,
            customTextColors: observable,
            lineSpacing: observable,
            highlightColor: observable,
            initEditorFonts: action,
            resetFontName: action,
            resetFontsRecent:action,
            resetFontSize: action,
            resetIsBold: action,
            resetIsItalic: action,
            resetIsUnderline: action,
            resetIsStrikeout: action,
            resetTypeBaseline: action,
            isSuperscript: computed,
            isSubscript: computed,
            resetListType: action,
            resetBullets: action,
            resetNumbers: action,
            resetMultiLevel: action,
            resetParagraphAlign: action,
            resetTextColor: action,
            changeCustomTextColors: action,
            resetLineSpacing: action,
            resetHighlightColor: action,
            changeFontFamily: action,
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
    typeMultiLevel = undefined;
    paragraphAlign = undefined;
    textColor = undefined;
    customTextColors = [];
    lineSpacing = undefined;
    highlightColor = undefined;


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

    // vertical align
    resetTypeBaseline (typeBaseline) {
        this.typeBaseline = typeBaseline;
    }
    get isSuperscript() {
        return (this.typeBaseline === Asc.vertalign_SuperScript);
    }
    get isSubscript() {
        return (this.typeBaseline === Asc.vertalign_SubScript);
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

    resetMultiLevel(type) {
        this.typeMultiLevel = type;
    }

    getBulletsList () {
        return [
            {id: 'id-markers-0', type: 0, subtype: -1, numberingInfo: '{"Type":"remove"}' },
            {id: 'id-markers-1', type: 0, subtype: 1, numberingInfo: '{"Type":"bullet","Lvl":[{"lvlJc":"left","suff":"tab","numFmt":{"val":"bullet"},"lvlText":"·","rPr":{"rFonts":{"ascii":"Symbol","cs":"Symbol","eastAsia":"Symbol","hAnsi":"Symbol"}}}]}' },
            {id: 'id-markers-2', type: 0, subtype: 2, numberingInfo: '{"Type":"bullet","Lvl":[{"lvlJc":"left","suff":"tab","numFmt":{"val":"bullet"},"lvlText":"o","rPr":{"rFonts":{"ascii":"Courier New","cs":"Courier New","eastAsia":"Courier New","hAnsi":"Courier New"}}}]}' },
            {id: 'id-markers-3', type: 0, subtype: 3, numberingInfo: '{"Type":"bullet","Lvl":[{"lvlJc":"left","suff":"tab","numFmt":{"val":"bullet"},"lvlText":"§","rPr":{"rFonts":{"ascii":"Wingdings","cs":"Wingdings","eastAsia":"Wingdings","hAnsi":"Wingdings"}}}]}' },
            {id: 'id-markers-4', type: 0, subtype: 4, numberingInfo: '{"Type":"bullet","Lvl":[{"lvlJc":"left","suff":"tab","numFmt":{"val":"bullet"},"lvlText":"v","rPr":{"rFonts":{"ascii":"Wingdings","cs":"Wingdings","eastAsia":"Wingdings","hAnsi":"Wingdings"}}}]}' },
            {id: 'id-markers-5', type: 0, subtype: 5, numberingInfo: '{"Type":"bullet","Lvl":[{"lvlJc":"left","suff":"tab","numFmt":{"val":"bullet"},"lvlText":"Ø","rPr":{"rFonts":{"ascii":"Wingdings","cs":"Wingdings","eastAsia":"Wingdings","hAnsi":"Wingdings"}}}]}' },
            {id: 'id-markers-6', type: 0, subtype: 6, numberingInfo: '{"Type":"bullet","Lvl":[{"lvlJc":"left","suff":"tab","numFmt":{"val":"bullet"},"lvlText":"ü","rPr":{"rFonts":{"ascii":"Wingdings","cs":"Wingdings","eastAsia":"Wingdings","hAnsi":"Wingdings"}}}]}' },
            {id: 'id-markers-7', type: 0, subtype: 7, numberingInfo: '{"Type":"bullet","Lvl":[{"lvlJc":"left","suff":"tab","numFmt":{"val":"bullet"},"lvlText":"¨","rPr":{"rFonts":{"ascii":"Symbol","cs":"Symbol","eastAsia":"Symbol","hAnsi":"Symbol"}}}]}' }
        ];
    }

    getNumbersList () {
        return [
            {id: 'id-numbers-0', type: 1, subtype: -1, numberingInfo: '{"Type":"remove"}'},
            {id: 'id-numbers-4', type: 1, subtype: 4, numberingInfo: '{"Type":"number","Lvl":[{"lvlJc":"left","suff":"tab","numFmt":{"val":"upperLetter"},"lvlText":"%1."}]}'},
            {id: 'id-numbers-5', type: 1, subtype: 5, numberingInfo: '{"Type":"number","Lvl":[{"lvlJc":"left","suff":"tab","numFmt":{"val":"lowerLetter"},"lvlText":"%1)"}]}'},
            {id: 'id-numbers-6', type: 1, subtype: 6, numberingInfo: '{"Type":"number","Lvl":[{"lvlJc":"left","suff":"tab","numFmt":{"val":"lowerLetter"},"lvlText":"%1."}]}'},
            {id: 'id-numbers-1', type: 1, subtype: 1, numberingInfo: '{"Type":"number","Lvl":[{"lvlJc":"right","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%1."}]}'},
            {id: 'id-numbers-2', type: 1, subtype: 2, numberingInfo: '{"Type":"number","Lvl":[{"lvlJc":"right","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%1)"}]}'},
            {id: 'id-numbers-3', type: 1, subtype: 3, numberingInfo: '{"Type":"number","Lvl":[{"lvlJc":"right","suff":"tab","numFmt":{"val":"upperRoman"},"lvlText":"%1."}]}'},
            {id: 'id-numbers-7', type: 1, subtype: 7, numberingInfo: '{"Type":"number","Lvl":[{"lvlJc":"right","suff":"tab","numFmt":{"val":"lowerRoman"},"lvlText":"%1."}]}'}
        ];
    }

    getMultiLevelList () {
        return [
            { id: 'id-multilevels-0', type: 2, subtype: -1, numberingInfo: '{"Type":"remove"}' },
            { id: 'id-multilevels-1', type: 2, subtype: 1, numberingInfo: '{"Type":"number","Lvl":[{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%1)","pPr":{"ind":{"left":360,"firstLine":-360}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"lowerLetter"},"lvlText":"%2)","pPr":{"ind":{"left":720,"firstLine":-360}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"lowerRoman"},"lvlText":"%3)","pPr":{"ind":{"left":1080,"firstLine":-360}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%4)","pPr":{"ind":{"left":1440,"firstLine":-360}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"lowerLetter"},"lvlText":"%5)","pPr":{"ind":{"left":1800,"firstLine":-360}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"lowerRoman"},"lvlText":"%6)","pPr":{"ind":{"left":2160,"firstLine":-360}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%7)","pPr":{"ind":{"left":2520,"firstLine":-360}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"lowerLetter"},"lvlText":"%8)","pPr":{"ind":{"left":2880,"firstLine":-360}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"lowerRoman"},"lvlText":"%9)","pPr":{"ind":{"left":3240,"firstLine":-360}}}]}' },
            { id: 'id-multilevels-2', type: 2, subtype: 2, numberingInfo: '{"Type":"number","Lvl":[{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%1.","pPr":{"ind":{"left":360,"firstLine":-360}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%1.%2.","pPr":{"ind":{"left":792,"firstLine":-432}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%1.%2.%3.","pPr":{"ind":{"left":1224,"firstLine":-504}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%1.%2.%3.%4.","pPr":{"ind":{"left":1728,"firstLine":-648}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%1.%2.%3.%4.%5.","pPr":{"ind":{"left":2232,"firstLine":-792}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%1.%2.%3.%4.%5.%6.","pPr":{"ind":{"left":2736,"firstLine":-936}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%1.%2.%3.%4.%5.%6.%7.","pPr":{"ind":{"left":3240,"firstLine":-1080}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%1.%2.%3.%4.%5.%6.%7.%8.","pPr":{"ind":{"left":3744,"firstLine":-1224}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%1.%2.%3.%4.%5.%6.%7.%8.%9.","pPr":{"ind":{"left":4320,"firstLine":-1440}}}]}' },
            { id: 'id-multilevels-3', type: 2, subtype: 3, numberingInfo: '{"Type":"bullet","Lvl":[{"lvlJc":"left","suff":"tab","numFmt":{"val":"bullet"},"lvlText":"v","pPr":{"ind":{"left":360,"firstLine":-360}},"rPr":{"rFonts":{"ascii":"Wingdings","cs":"Wingdings","eastAsia":"Wingdings","hAnsi":"Wingdings"}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"bullet"},"lvlText":"Ø","pPr":{"ind":{"left":720,"firstLine":-360}},"rPr":{"rFonts":{"ascii":"Wingdings","cs":"Wingdings","eastAsia":"Wingdings","hAnsi":"Wingdings"}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"bullet"},"lvlText":"§","pPr":{"ind":{"left":1080,"firstLine":-360}},"rPr":{"rFonts":{"ascii":"Wingdings","cs":"Wingdings","eastAsia":"Wingdings","hAnsi":"Wingdings"}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"bullet"},"lvlText":"·","pPr":{"ind":{"left":1440,"firstLine":-360}},"rPr":{"rFonts":{"ascii":"Symbol","cs":"Symbol","eastAsia":"Symbol","hAnsi":"Symbol"}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"bullet"},"lvlText":"¨","pPr":{"ind":{"left":1800,"firstLine":-360}},"rPr":{"rFonts":{"ascii":"Symbol","cs":"Symbol","eastAsia":"Symbol","hAnsi":"Symbol"}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"bullet"},"lvlText":"Ø","pPr":{"ind":{"left":2160,"firstLine":-360}},"rPr":{"rFonts":{"ascii":"Wingdings","cs":"Wingdings","eastAsia":"Wingdings","hAnsi":"Wingdings"}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"bullet"},"lvlText":"§","pPr":{"ind":{"left":2520,"firstLine":-360}},"rPr":{"rFonts":{"ascii":"Wingdings","cs":"Wingdings","eastAsia":"Wingdings","hAnsi":"Wingdings"}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"bullet"},"lvlText":"·","pPr":{"ind":{"left":2880,"firstLine":-360}},"rPr":{"rFonts":{"ascii":"Symbol","cs":"Symbol","eastAsia":"Symbol","hAnsi":"Symbol"}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"bullet"},"lvlText":"¨","pPr":{"ind":{"left":3240,"firstLine":-360}},"rPr":{"rFonts":{"ascii":"Symbol","cs":"Symbol","eastAsia":"Symbol","hAnsi":"Symbol"}}}]}' },
            { id: 'id-multilevels-4', type: 2, subtype: 4, numberingInfo: '{"Type":"number","Headings":"true","Lvl":[{"lvlJc":"left","suff":"tab","numFmt":{"val":"upperRoman"},"lvlText":"Article %1.","pPr":{"ind":{"left":0,"firstLine":0}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimalZero"},"lvlText":"Section %1.%2","pPr":{"ind":{"left":0,"firstLine":0}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"lowerLetter"},"lvlText":"(%3)","pPr":{"ind":{"left":720,"firstLine":-432}}},{"lvlJc":"right","suff":"tab","numFmt":{"val":"lowerRoman"},"lvlText":"(%4)","pPr":{"ind":{"left":864,"firstLine":-144}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%5)","pPr":{"ind":{"left":1008,"firstLine":-432}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"lowerLetter"},"lvlText":"%6)","pPr":{"ind":{"left":1152,"firstLine":-432}}},{"lvlJc":"right","suff":"tab","numFmt":{"val":"lowerRoman"},"lvlText":"%7)","pPr":{"ind":{"left":1296,"firstLine":-288}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"lowerLetter"},"lvlText":"%8.","pPr":{"ind":{"left":1440,"firstLine":-432}}},{"lvlJc":"right","suff":"tab","numFmt":{"val":"lowerRoman"},"lvlText":"%9.","pPr":{"ind":{"left":1584,"firstLine":-144}}}]}' },
            { id: 'id-multilevels-5', type: 2, subtype: 5, numberingInfo: '{"Type":"number","Headings":"true","Lvl":[{"lvlJc":"left","suff":"space","numFmt":{"val":"decimal"},"lvlText":"Chapter %1","pPr":{"ind":{"left":0,"firstLine":0}}},{"lvlJc":"left","suff":"nothing","numFmt":{"val":"none"},"lvlText":"","pPr":{"ind":{"left":0,"firstLine":0}}},{"lvlJc":"left","suff":"nothing","numFmt":{"val":"none"},"lvlText":"","pPr":{"ind":{"left":0,"firstLine":0}}},{"lvlJc":"left","suff":"nothing","numFmt":{"val":"none"},"lvlText":"","pPr":{"ind":{"left":0,"firstLine":0}}},{"lvlJc":"left","suff":"nothing","numFmt":{"val":"none"},"lvlText":"","pPr":{"ind":{"left":0,"firstLine":0}}},{"lvlJc":"left","suff":"nothing","numFmt":{"val":"none"},"lvlText":"","pPr":{"ind":{"left":0,"firstLine":0}}},{"lvlJc":"left","suff":"nothing","numFmt":{"val":"none"},"lvlText":"","pPr":{"ind":{"left":0,"firstLine":0}}},{"lvlJc":"left","suff":"nothing","numFmt":{"val":"none"},"lvlText":"","pPr":{"ind":{"left":0,"firstLine":0}}},{"lvlJc":"left","suff":"nothing","numFmt":{"val":"none"},"lvlText":"","pPr":{"ind":{"left":0,"firstLine":0}}}]}' },
            { id: 'id-multilevels-6', type: 2, subtype: 6, numberingInfo: '{"Type":"number","Headings":"true","Lvl":[{"lvlJc":"left","suff":"tab","numFmt":{"val":"upperRoman"},"lvlText":"%1.","pPr":{"ind":{"left":0,"firstLine":0}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"upperLetter"},"lvlText":"%2.","pPr":{"ind":{"left":720,"firstLine":0}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%3.","pPr":{"ind":{"left":1440,"firstLine":0}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"lowerLetter"},"lvlText":"%4)","pPr":{"ind":{"left":2160,"firstLine":0}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"(%5)","pPr":{"ind":{"left":2880,"firstLine":0}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"lowerLetter"},"lvlText":"(%6)","pPr":{"ind":{"left":3600,"firstLine":0}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"lowerRoman"},"lvlText":"(%7)","pPr":{"ind":{"left":4320,"firstLine":0}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"lowerLetter"},"lvlText":"(%8)","pPr":{"ind":{"left":5040,"firstLine":0}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"lowerRoman"},"lvlText":"(%9)","pPr":{"ind":{"left":5760,"firstLine":0}}}]}' },
            { id: 'id-multilevels-7', type: 2, subtype: 7, numberingInfo: '{"Type":"number","Headings":"true","Lvl":[{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%1.","pPr":{"ind":{"left":432,"firstLine":-432}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%1.%2.","pPr":{"ind":{"left":576,"firstLine":-576}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%1.%2.%3.","pPr":{"ind":{"left":720,"firstLine":-720}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%1.%2.%3.%4.","pPr":{"ind":{"left":864,"firstLine":-864}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%1.%2.%3.%4.%5.","pPr":{"ind":{"left":1008,"firstLine":-1008}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%1.%2.%3.%4.%5.%6.","pPr":{"ind":{"left":1152,"firstLine":-1152}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%1.%2.%3.%4.%5.%6.%7.","pPr":{"ind":{"left":1296,"firstLine":-1296}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%1.%2.%3.%4.%5.%6.%7.%8.","pPr":{"ind":{"left":1440,"firstLine":-1440}}},{"lvlJc":"left","suff":"tab","numFmt":{"val":"decimal"},"lvlText":"%1.%2.%3.%4.%5.%6.%7.%8.%9.","pPr":{"ind":{"left":1584,"firstLine":-1584}}}]}' }
        ];
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

    changeFontFamily(name) {
        this.fontName = name;
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

    resetHighlightColor (color) {
        if (color == -1) {
           this.highlightColor = 'transparent';
        } else {
            this.highlightColor = color.get_hex();
        }  
    }
}