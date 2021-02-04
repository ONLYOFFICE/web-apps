import {action, observable, computed} from 'mobx';

export class storeCellSettings {

    @observable styleSize = {
       width: 100,
       height: 50
    }

    @observable cellStyles = [];
    @observable fontsArray = [];
    @observable fontInfo = {};

    @observable fillColor = undefined;
    @observable fontColor = undefined;
    @observable styleName = undefined;

    @observable isBold = false;
    @observable isItalic = false;
    @observable isUnderline = false;


    @action initCellSettings(cellInfo) {

        let xfs = cellInfo.asc_getXfs();

        this.initFontSettings(xfs);

        let color = xfs.asc_getFillColor();
        console.log(color);
        let clr = this.resetColor(color);
        
        this.fillColor = clr;
        this.styleName = cellInfo.asc_getStyleName();
    }

    @action initFontSettings(fontObj) {

        this.fontInfo.name = fontObj.asc_getFontName();
        this.fontInfo.size = fontObj.asc_getFontSize();

        this.fontInfo.color = fontObj.asc_getFontColor();
        let clr = this.resetColor(this.fontInfo.color);
        this.fontColor = clr;

        this.isBold = fontObj.asc_getFontBold();
        this.isItalic = fontObj.asc_getFontItalic();
        this.isUnderline = fontObj.asc_getFontUnderline();
    }

    @action initEditorFonts(fonts, select) {
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

    @action initCellStyles(styles) {
        this.cellStyles = styles;
    }

    @action initFontInfo(fontObj) {
        this.fontInfo = fontObj;
    }

    @action changeFontColor(color) {
        // this.fontInfo.color = fontObj.asc_getFontColor();
        // let clr = this.resetColor(this.fontInfo.color);
        this.fontColor = color;
    }

    @action changeFillColor(color) {
        this.fillColor = color;
    }

    resetColor(color) {
        let clr = 'transparent';

        if (color) {
            if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                clr = {
                    color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()),
                    effectValue: color.get_value()
                }
            } else {
                clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
            }
        }

        return clr;
    }

}