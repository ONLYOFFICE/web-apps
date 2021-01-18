import {action, observable, computed} from 'mobx';

export class storeSlideSettings {
    
    @observable arrayLayouts;
    @observable slideLayoutIndex = -1;
    @observable fillColor = undefined;
    @observable arrayThemes;
    @observable slideThemeIndex;
    @observable effect;
    @observable type;
    
    @action getFillColor (slideObject) {
    
        let color = 'transparent';
        let fill = slideObject.get_background(),
            fillType = fill.get_type();
        let sdkColor;

        if (fillType == Asc.c_oAscFill.FILL_TYPE_SOLID) {
            fill = fill.get_fill();
            sdkColor = fill.get_color();

            if (sdkColor) {
                if (sdkColor.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
                    color = {color: Common.Utils.ThemeColor.getHexColor(sdkColor.get_r(), sdkColor.get_g(), sdkColor.get_b()), effectValue: sdkColor.get_value()};
                } else {
                    color = Common.Utils.ThemeColor.getHexColor(sdkColor.get_r(), sdkColor.get_g(), sdkColor.get_b());
                }
            }
        }

        this.fillColor = color;
        return color;
    }

    @action changeFillColor (color) {
        this.fillColor = color;
    }

    @action addArrayLayouts(array) {
        this.arrayLayouts = array;
    }

    @action changeSlideLayoutIndex(index) {
        this.slideLayoutIndex = index;
    }

    @action addArrayThemes(array) {
        this.arrayThemes = array;
    }

    @action changeSlideThemeIndex(index) {
        this.slideThemeIndex = index;
    }

    @action changeEffect(value) {
        this.effect = value;
    }

    @action changeType(value) {
        this.type = value;
    }
}