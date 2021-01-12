import {action, observable} from 'mobx';

export class storeStyle {
    @observable color = undefined;

    @action resetColor (color) {
        let value;
        if (color.get_type() == Asc.c_oAscColor.COLOR_TYPE_SCHEME) {
            value = {
                color: Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b()),
                effectValue: color.get_value()
            }
        } else {
            value = Common.Utils.ThemeColor.getHexColor(color.get_r(), color.get_g(), color.get_b());
        }
        this.color = value;
    }

    // @action changeCustomColors (colors) {
    //     this.customColors = colors;
    // }

}