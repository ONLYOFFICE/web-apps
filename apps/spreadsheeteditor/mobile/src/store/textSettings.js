import {action, observable, computed} from 'mobx';

export class storeTextSettings {

    @observable fontsArray = [];
    @observable fontInfo = {};
    @observable fontName = '';
    @observable fontSize = undefined;
    @observable isBold = false;
    @observable isItalic = false;
    @observable isUnderline = false;
    @observable textColor = undefined;
    @observable customTextColors = [];
    @observable paragraphAlign = undefined;
    @observable paragraphValign = undefined;
    @observable textIn = undefined;

    @action initTextSettings(cellInfo) {
        let xfs = cellInfo.asc_getXfs();
        let selectType = cellInfo.asc_getSelectionType();

        switch (selectType) {
            case Asc.c_oAscSelectionType.RangeChartText: this.textIn = 1; break;
            case Asc.c_oAscSelectionType.RangeShapeText: this.textIn = 2; break;
            default: this.textIn = 0;
        }

        this.fontName = xfs.asc_getFontName();
        this.fontSize = xfs.asc_getFontSize();

        this.isBold = xfs.asc_getFontBold();
        this.isItalic = xfs.asc_getFontItalic();
        this.isUnderline = xfs.asc_getFontUnderline();
    
        let color = xfs.asc_getFontColor();
        console.log(color);
        this.textColor = this.resetTextColor(color);

        this.paragraphAlign = xfs.asc_getHorAlign();
        this.paragraphValign = xfs.asc_getVertAlign();
    }

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

    @action initFontInfo(fontObj) {
        this.fontInfo = fontObj;
    }

    @action changeTextColor(value) {
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

    @action changeCustomTextColors (colors) {
        this.customTextColors = colors;
    }
}