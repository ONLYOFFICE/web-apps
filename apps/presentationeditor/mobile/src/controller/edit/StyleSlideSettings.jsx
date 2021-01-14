import React, { Component } from "react";
import { StyleFillColor } from "../../view/edit/StyleSlideSettings";

class StyleSlideController extends Component {
    constructor(props) {
        super(props);
    }

    onFillColor(color) {
        const api = Common.EditorApi.get();

        let props = new Asc.CAscSlideProps(),
            fill = new Asc.asc_CShapeFill();

        if (color == 'transparent') {
            fill.put_type(Asc.c_oAscFill.FILL_TYPE_NOFILL);
            fill.put_fill(null);
        } else {
            fill.put_type(Asc.c_oAscFill.FILL_TYPE_SOLID);
            fill.put_fill(new Asc.asc_CFillSolid());
            fill.get_fill().put_color(Common.Utils.ThemeColor.getRgbColor(color));
        }

        props.put_background(fill);
        api.SetSlideProps(props);
        
    };

    render() {
        return (
            <StyleFillColor onFillColor={this.onFillColor} />
        );
    }
}

export default StyleSlideController;