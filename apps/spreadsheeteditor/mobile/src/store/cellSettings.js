import {makeObservable, action, observable, computed} from 'mobx';

export class storeCellSettings {
    constructor() {
        makeObservable(this, {
            styleSize: observable, 
            borderInfo: observable, 
            borderStyle: observable, 
            cellStyles: observable, 
            fontsArray: observable, 
            fontInfo: observable, 
            fillColor: observable, 
            fontColor: observable, 
            styleName: observable, 
            isBold: observable, 
            isItalic: observable, 
            isUnderline: observable, 
            isStrikethrough: observable,
            hAlignStr: observable, 
            vAlignStr: observable, 
            isWrapText: observable, 
            orientationStr: observable,
            colorAuto: observable,
            initCellSettings: action, 
            initTextFormat: action, 
            initTextOrientation: action, 
            initFontSettings: action, 
            initEditorFonts: action, 
            initCellStyles: action, 
            initFontInfo: action, 
            changeFontColor: action, 
            changeFillColor: action, 
            changeBorderColor: action, 
            changeBorderSize: action, 
            changeBorderStyle: action,
            setAutoColor: action,
            customFormats: observable,
            initCustomFormats: action,
            addCustomFormat: action
        });
    }

    styleSize = {
       width: 104,
       height: 48
    };

    borderInfo = {
        color: '000000', 
        width: 12           // Asc.c_oAscBorderStyles.Medium
    };

    borderStyle = 'none';

    cellStyles = [];
    fontsArray = [];
    fontInfo = {};

    fillColor = undefined;
    fontColor = undefined;
    styleName = undefined;

    isBold = false;
    isItalic = false;
    isUnderline = false;
    isStrikethrough = false;

    hAlignStr = 'left';
    vAlignStr = 'bottom';
    isWrapText;

    orientationStr = 'horizontal';

    colorAuto = 'auto';

    customFormats;

    initCustomFormats(formatsArr) {
        this.customFormats = formatsArr;
    }

    addCustomFormat(format) {
        this.customFormats.push(format);
    }

    setAutoColor(value) {
        this.colorAuto = value;
    }

    initCellSettings(cellInfo) {

        let xfs = cellInfo.asc_getXfs();
        this.initFontSettings(xfs);

        let color = xfs.asc_getFillColor();
        // console.log(color);
      
        const clr = color.get_auto() ? 'transparent' : this.resetColor(color);
        
        this.fillColor = clr;
        this.styleName = cellInfo.asc_getStyleName();

        this.initTextOrientation(xfs);
        this.initTextFormat(xfs);

    }

    initTextFormat(xfs) {
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

    initTextOrientation(xfs) {
        switch( xfs.asc_getAngle() ) {
            case 45: this.orientationStr = 'anglecount'; break;
            case -45: this.orientationStr = 'angleclock'; break;
            case 255: this.orientationStr = 'vertical'; break;
            case 90: this.orientationStr = 'rotateup'; break;
            case -90: this.orientationStr = 'rotatedown'; break;
            case 0: this.orientationStr = 'horizontal'; break;
        }
    }

    initFontSettings(xfs) {
        this.fontInfo.name = xfs.asc_getFontName();
        this.fontInfo.size = xfs.asc_getFontSize();

        this.fontInfo.color = xfs.asc_getFontColor();
        this.fontColor = this.resetColor(this.fontInfo.color);

        this.isBold = xfs.asc_getFontBold();
        this.isItalic = xfs.asc_getFontItalic();
        this.isUnderline = xfs.asc_getFontUnderline();
        this.isStrikethrough = xfs.asc_getFontStrikeout();
    }

    initEditorFonts(fonts, select) {
        let array = [];

        for (let font of fonts) {
            array.push({
                id          : font.asc_getFontId(),
                name        : font.asc_getFontName(),
                //displayValue: font.asc_getFontName(),
                imgidx      : font.asc_getFontThumbnail(),
                type        : font.asc_getFontType()
            });
        }
        this.fontsArray = array;
    }

    initCellStyles(styles) {
        this.cellStyles = styles;
    }

    initFontInfo(fontObj) {
        this.fontInfo = fontObj;
    }

    changeFontColor(color) {
        this.fontColor = color;
    }

    changeFillColor(color) {
        this.fillColor = color;
    }

    changeBorderColor(color) {
        this.borderInfo.color = color;
    }

    changeBorderSize(size) {
        this.borderInfo.width = size;
    }

    changeBorderStyle(type) {
        this.borderStyle = type;
    }

    resetColor(color) {
        let clr = 'transparent';

        if(color) {
            if (color.get_auto()) {
                clr = 'auto'
            } else {
                if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                    clr = {
                        color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()),
                        effectValue: color.get_value()
                    }
                } else {
                    clr = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                }
            }
        }

        return clr;
    }

}