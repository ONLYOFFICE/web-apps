import {action, observable, computed, makeObservable} from 'mobx';

export class storeTextSettings {
    constructor() {
        makeObservable(this, {
            fontsArray: observable,
            fontName: observable,
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
            textColor: observable,
            customTextColors: observable,
            lineSpacing: observable,
            backgroundColor: observable,
            initEditorFonts: action,
            resetFontName: action,
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
            resetParagraphAlign: action,
            resetTextColor: action,
            changeCustomTextColors: action,
            resetLineSpacing: action,
            resetBackgroundColor: action,
            changeFontFamily: action
        });
    }

    fontsArray = [];
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
    textColor = undefined;
    customTextColors = [];
    lineSpacing = undefined;
    backgroundColor = undefined;


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

        array.sort(function(a, b) {
            return (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1;
        });

        this.fontsArray = array;
    }
    resetFontName (font) {
        let name = (typeof font.get_Name) === "function" ? font.get_Name() : font.asc_getName();
        this.fontName = name;
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

    resetLineSpacing (vc) {
        let line = (vc.get_Line() === null || vc.get_LineRule() === null || vc.get_LineRule() != 1) ? -1 : vc.get_Line();
        this.lineSpacing = line;
    }

    resetBackgroundColor (color) {
        let value;

        if(color) {
            if (color.get_auto()) {
                value = 'transparent'
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

        this.backgroundColor = value;
    }
}