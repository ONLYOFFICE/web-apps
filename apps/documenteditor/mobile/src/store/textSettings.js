import {action, observable, computed} from 'mobx';

export class storeTextSettings {
    @observable fontsArray = [];
    @observable fontName = '';
    @observable fontSize = undefined;
    @observable isBold = false;
    @observable isItalic = false;
    @observable isUnderline = false;
    @observable isStrikethrough = false;
    @observable typeBaseline = undefined;
    @observable listType = undefined;
    @observable typeBullets = undefined;
    @observable typeNumbers = undefined;
    @observable paragraphAlign = undefined;
    @observable textColor = undefined;
    @observable customTextColors = [];
    @observable lineSpacing = undefined;
    @observable backgroundColor = undefined;


    @action initEditorFonts (fonts, select) {
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
    }
    @action resetFontName (font) {
        let name = (typeof font.get_Name) === "function" ? font.get_Name() : font.asc_getName();
        this.fontName = name;
    }
    @action resetFontSize (size) {
        this.fontSize = size;
    }
    @action resetIsBold (isBold) {
        this.isBold = isBold;
    }
    @action resetIsItalic (isItalic) {
        this.isItalic = isItalic;
    }
    @action resetIsUnderline (isUnderline) {
        this.isUnderline = isUnderline;
    }
    @action resetIsStrikeout (isStrikethrough) {
        this.isStrikethrough = isStrikethrough;
    }

    // vertical align
    @action resetTypeBaseline (typeBaseline) {
        this.typeBaseline = typeBaseline;
    }
    @computed get isSuperscript() {
        return (this.typeBaseline === 1);
    }
    @computed get isSubscript() {
        return (this.typeBaseline === 2);
    }

    // bullets
    @action resetListType (type) {
        this.listType = type;
    }
    @action resetBullets (type) {
        this.typeBullets = type;
    }
    @action resetNumbers (type) {
        this.typeNumbers = type;
    }

    @action resetParagraphAlign (align) {
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

    @action resetTextColor (color) {
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

    @action changeCustomTextColors (colors) {
        this.customTextColors = colors;
    }

    @action resetLineSpacing (vc) {
        let line = (vc.get_Line() === null || vc.get_LineRule() === null || vc.get_LineRule() != 1) ? -1 : vc.get_Line();
        this.lineSpacing = line;
    }

    @action resetBackgroundColor (color) {
        let value;
        if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
            value = {
                color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()),
                effectValue: color.get_value()
            }
        } else {
            value = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
        }
        this.backgroundColor = value;
    }
}