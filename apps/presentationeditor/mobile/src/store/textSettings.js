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