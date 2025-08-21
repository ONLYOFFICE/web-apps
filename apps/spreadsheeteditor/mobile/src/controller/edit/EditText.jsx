import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';

import { EditText } from '../../view/edit/EditText';

class EditTextController extends Component {
    constructor (props) {
        super(props);
    }

    toggleBold(value) {
        const api = Common.EditorApi.get();
        api.asc_setCellBold(value);
    };

    toggleItalic(value) {
        const api = Common.EditorApi.get();
        api.asc_setCellItalic(value);
    };

    toggleUnderline(value) {
        const api = Common.EditorApi.get();
        api.asc_setCellUnderline(value);
    };

    // Additional

    onAdditionalStrikethrough(type, value) {
        const api = Common.EditorApi.get();
        if (api) {          
            if ('strikeout' === type) {
                api.asc_setCellStrikeout(value);
            } else {
                api.asc_setCellStrikeout(value);
            }
        }
    }

    onAdditionalCaps(type, value) {
        const api = Common.EditorApi.get();
        if (api) {
            const paragraphProps = new Asc.asc_CParagraphProperty();
            // const paragraphProps = new Asc.asc_CImgProperty();
            // console.log(api.CreateParagraph());
            
            if ('small' === type) {
                paragraphProps.put_AllCaps(false);
                paragraphProps.put_SmallCaps(value);
            } else {
                paragraphProps.put_AllCaps(value);
                paragraphProps.put_SmallCaps(false);
            }
            // api.asc_setDrawImagePlaceParagraph('paragraphadv-font-img', paragraphProps);
        }
    }

    onAdditionalScript(type, value) {
        const api = Common.EditorApi.get();
        if (api) {
            if ('superscript' === type) {
                api.asc_setCellSuperscript(value ? Asc.vertalign_SuperScript : Asc.vertalign_Baseline);
            } else {
                api.asc_setCellSubscript(value ? Asc.vertalign_SubScript : Asc.vertalign_Baseline);
            }
        }
    }

    changeLetterSpacing(curSpacing, isDecrement) {
        const api = Common.EditorApi.get();
        if (api) {
            let spacing = curSpacing;
            if (isDecrement) {
                spacing = Math.max(-100, --spacing);
            } else {
                spacing = Math.min(100, ++spacing);
            }
            const properties = new Asc.asc_CParagraphProperty();
            // console.log(properties);
            
            properties.put_TextSpacing(Common.Utils.Metric.fnRecalcToMM(spacing));
            // api.paraApply(properties);
            api.asc_setGraphicObjectProps(properties);
        }
    }

    onParagraphAlign(type) {
        const api = Common.EditorApi.get();
        let value = AscCommon.align_Left;
        
        switch (type) {
            case 'justify':
                value = AscCommon.align_Justify;
                break;
            case 'right':
                value = AscCommon.align_Right;
                break;
            case 'center':
                value = AscCommon.align_Center;
                break;
        }

        api.asc_setCellAlign(value);
    };

    onParagraphValign(type) {
        const api = Common.EditorApi.get();
        let value;

        switch(type) {
            case 'top':
                value = Asc.c_oAscVAlign.Top;
                break;
            case 'center':
                value = Asc.c_oAscVAlign.Center;
                break;
            case 'bottom':
                value = Asc.c_oAscVAlign.Bottom;
                break;
        }

        api.asc_setCellVertAlign(value);
    };

    changeFontSize(curSize, isDecrement) {
        const api = Common.EditorApi.get();
        let size = curSize;

        if (isDecrement) {
            typeof size === 'undefined' ? api.asc_decreaseFontSize() : size = Math.max(1, --size);
        } else {
            typeof size === 'undefined' ? api.asc_increaseFontSize() : size = Math.min(409, ++size);
        }

        if (typeof size !== 'undefined') {
            api.asc_setCellFontSize(size);
        }
    };

    changeFontFamily(name) {
        const api = Common.EditorApi.get();
        if (name) {
            api.asc_setCellFontName(name);
        }
    }

    onTextColor(color) {
        const api = Common.EditorApi.get();
        api.asc_setCellTextColor(Common.Utils.ThemeColor.getRgbColor(color));
    }

    setOrientationTextShape(direction) {
        const api = Common.EditorApi.get();
        const properties = new Asc.asc_CImgProperty();

        properties.asc_putVert(direction);
        api.asc_setGraphicObjectProps(properties);
    }

    render () {
        return (
            <EditText 
                toggleBold={this.toggleBold}
                toggleItalic={this.toggleItalic}
                toggleUnderline={this.toggleUnderline}
                onParagraphAlign={this.onParagraphAlign}
                onParagraphValign={this.onParagraphValign}
                changeFontSize={this.changeFontSize}
                changeFontFamily={this.changeFontFamily}
                onTextColor={this.onTextColor}
                setOrientationTextShape={this.setOrientationTextShape}
                onAdditionalStrikethrough={this.onAdditionalStrikethrough}
                onAdditionalCaps={this.onAdditionalCaps}
                onAdditionalScript={this.onAdditionalScript}
                changeLetterSpacing={this.changeLetterSpacing}
            />
        )
    }
}

export default EditTextController;