import {action, observable, computed, makeObservable} from 'mobx';

export class storeParagraphSettings {
    constructor() {
        makeObservable(this, {
            styles: observable,
            styleThumbSize: observable,
            styleName: observable,
            backColor: observable,
            initEditorStyles: action,
            paragraphStyles: computed,
            changeParaStyleName: action,
            setBackColor: action,
            getBackgroundColor: action
        });
    }

    styles = [];
    styleThumbSize = null;
    styleName = undefined;

    initEditorStyles (styles) {
        this.styles = styles.get_MergedStyles();
        this.styleThumbSize = {
            width   : styles.STYLE_THUMBNAIL_WIDTH,
            height  : styles.STYLE_THUMBNAIL_HEIGHT
        };
    }

    get paragraphStyles () {
        let _styles = [];
        for (let style of this.styles) {
            _styles.push({
                image   : style.asc_getImage(),
                name    : style.get_Name()
            });
        }
        return _styles;
    }

    changeParaStyleName (name) {
        this.styleName = name;
    }

    backColor = undefined;

    setBackColor (color) {
        this.backColor = color;
    }

    getBackgroundColor (paragraphObject) {
        const shade = paragraphObject.get_Shade();
        let backColor = 'transparent';
        if (!!shade && shade.get_Value() === Asc.c_oAscShdClear) {
            const color = shade.get_Color();
            if (color) {
                if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                    backColor = {
                        color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()),
                        effectValue: color.get_value()
                    };
                } else {
                    backColor = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
                }
            }
        }
        this.backColor = backColor;
        return backColor;
    }
}