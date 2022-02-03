import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";
import StylesImages from '../../view/edit/StylesImages';

class StylesImagesController extends Component {
    constructor (props) {
        super(props);
        // this.getStylesImages = this.getStylesImages.bind(this);
    }

    getStylesImages() {
        const api = Common.EditorApi.get();
        // const propsTableContents = api.asc_GetTableOfContentsPr();
        const arrValuesStyles = [Asc.c_oAscTOCStylesType.Current, Asc.c_oAscTOCStylesType.Simple, Asc.c_oAscTOCStylesType.Web, Asc.c_oAscTOCStylesType.Standard, Asc.c_oAscTOCStylesType.Modern, Asc.c_oAscTOCStylesType.Classic];

        arrValuesStyles.forEach((value, index) => {
            let propsTableContents = api.asc_GetTableOfContentsPr();
            // let propsTableContents = new Asc.CTableOfContentsPr();
            propsTableContents.put_StylesType(value);
            api.SetDrawImagePlaceContents(`image-style${index}`, propsTableContents);
        });
    }

    componentDidMount() {
        console.log('mount');
        // setTimeout(() => {
        this.getStylesImages();
        // }, 1000);
    }

    componentWillUnmount() {
        console.log('unmount');
    }

    onStyle(value) {
        const api = Common.EditorApi.get();
        const propsTableContents = api.asc_GetTableOfContentsPr();
    
        propsTableContents.put_StylesType(value);
        api.asc_SetTableOfContentsPr(propsTableContents);
    }

    render () {
        return (
            <StylesImages 
                onStyle={this.onStyle} 
                getStylesImages={this.getStylesImages}
            />
        )
    }
}

export default StylesImagesController;