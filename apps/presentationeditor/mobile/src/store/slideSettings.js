import {action, observable, computed, makeObservable} from 'mobx';

export class storeSlideSettings {
    constructor() {
        makeObservable(this, {
            arrayLayouts: observable,
            slideLayoutIndex: observable,
            fillColor: observable,
            arrayThemes: observable,
            slideThemeIndex: observable,
            getFillColor: action,
            changeFillColor: action,
            addArrayLayouts: action,
            slideLayouts: computed,
            changeSlideLayoutIndex: action,
            addArrayThemes: action,
            changeSlideThemeIndex: action,
        });
    }

    arrayLayouts;
    slideLayoutIndex = -1;
    fillColor = undefined;
    arrayThemes;
    slideThemeIndex;
    
    getFillColor (slideObject) {
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

    changeFillColor (color) {
        this.fillColor = color;
    }

    addArrayLayouts(array) {
        this.arrayLayouts = array;
    }

    get slideLayouts () {
        const layouts = [];
        const columns = 2;
        let row = -1;
        this.arrayLayouts.forEach((item, index)=>{
            if (0 == index % columns) {
                layouts.push([]);
                row++
            }
            layouts[row].push({
                type: item.getIndex(),
                image: item.get_Image(),
                width: item.get_Width(),
                height: item.get_Height()
            });
        });
        return layouts;
    }

    changeSlideLayoutIndex(index) {
        this.slideLayoutIndex = index;
    }

    addArrayThemes(array) {
        this.arrayThemes = array;
    }

    changeSlideThemeIndex(index) {
        this.slideThemeIndex = index;
    }
}