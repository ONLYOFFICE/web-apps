import {action, observable, computed} from 'mobx';

export class storeCellSettings {

    @observable styleSize = {
       width: 100,
       height: 50
    };

    @observable borderInfo = {
        color: '000000', 
        width: Asc.c_oAscBorderStyles.Medium
    };

    @observable borderStyle = 'none';

    @observable cellStyles = [];
    @observable fontsArray = [];
    @observable fontInfo = {};

    @observable fillColor = undefined;
    @observable fontColor = undefined;
    @observable styleName = undefined;

    @observable isBold = false;
    @observable isItalic = false;
    @observable isUnderline = false;

    @observable hAlignStr = 'left';
    @observable vAlignStr = 'bottom';
    @observable isWrapText;

    @observable orientationStr = 'horizontal';

    @action initCellSettings(cellInfo) {

        let xfs = cellInfo.asc_getXfs();

        this.initFontSettings(xfs);

        let color = xfs.asc_getFillColor();
        console.log(color);
        let clr = this.resetColor(color);
        
        this.fillColor = clr;
        this.styleName = cellInfo.asc_getStyleName();

        this.initTextOrientation(xfs);
        this.initTextFormat(xfs);

    }

    @action initTextFormat(xfs) {
        let hAlign = xfs.asc_getHorAlign();
        let vAlign = xfs.asc_getVertAlign();
        let isWrapText = xfs.asc_getWrapText();

        if (vAlign == Asc.c_oAscVAlign.Top)
            this.vAlignStr = 'top';
        else if (vAlign == Asc.c_oAscVAlign.Center)
            this.vAlignStr = 'center';
        else if (vAlign == Asc.c_oAscVAlign.Bottom)
            this.vAlignStr = 'bottom';

        switch (hAlign) {
            case AscCommon.align_Left: this.hAlignStr = 'left'; break;
            case AscCommon.align_Center: this.hAlignStr = 'center'; break;
            case AscCommon.align_Right: this.hAlignStr = 'right'; break;
            case AscCommon.align_Justify: this.hAlignStr = 'justify'; break;
        }

        this.isWrapText = isWrapText; 
    }

    @action initTextOrientation(xfs) {
        let textAngle = xfs.asc_getAngle();

        switch(textAngle) {
            case 45: this.orientationStr = 'anglecount'; break;
            case -45: this.orientationStr = 'angleclock'; break;
            case 255: this.orientationStr = 'vertical'; break;
            case 90: this.orientationStr = 'rotateup'; break;
            case -90: this.orientationStr = 'rotatedown'; break;
            case 0: this.orientationStr = 'horizontal'; break;
        }
    }

    @action initFontSettings(xfs) {

        this.fontInfo.name = xfs.asc_getFontName();
        this.fontInfo.size = xfs.asc_getFontSize();

        this.fontInfo.color = xfs.asc_getFontColor();
        let clr = this.resetColor(this.fontInfo.color);
        this.fontColor = clr;

        this.isBold = xfs.asc_getFontBold();
        this.isItalic = xfs.asc_getFontItalic();
        this.isUnderline = xfs.asc_getFontUnderline();
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
        this.fontColor = color;
    }

    @action changeFillColor(color) {
        this.fillColor = color;
    }

    @action changeBorderColor(color) {
        this.borderInfo.color = color;
    }

    @action changeBorderSize(size) {
        this.borderInfo.width = size;
    }

    @action changeBorderStyle(type) {
        this.borderStyle = type;
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