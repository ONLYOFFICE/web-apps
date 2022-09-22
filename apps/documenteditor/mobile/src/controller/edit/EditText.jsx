import React, {Component} from 'react';
import { EditText } from '../../view/edit/EditText'

class EditTextController extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const api = Common.EditorApi.get();
        api && api.UpdateInterfaceState();
    }

    changeFontSize(curSize, isDecrement) {
        const api = Common.EditorApi.get();
        if (api) {
            let size = curSize;
            if (isDecrement) {
                typeof size === 'undefined' ? api.FontSizeOut() : size = Math.max(1, --size);
            } else {
                typeof size === 'undefined' ? api.FontSizeIn() : size = Math.min(300, ++size);
            }
            if (typeof size !== 'undefined') {
                api.put_TextPrFontSize(size);
            }
        }
    }

    changeFontFamily(name) {
        const api = Common.EditorApi.get();
        if (api && name) {
            api.put_TextPrFontName(name);
        }
    }

    onTextColorAuto() {
        const api = Common.EditorApi.get();
        const color = new Asc.asc_CColor();
        color.put_auto(true);
        api.put_TextColor(color);
    }

    onTextColor(color) {
        const api = Common.EditorApi.get();
        api.put_TextColor(Common.Utils.ThemeColor.getRgbColor(color));
    }

    onHighlightColor(strColor) {
        const api = Common.EditorApi.get();
        
        if (strColor == 'transparent') {
            api.SetMarkerFormat(true, false);
        } else {
            let r = strColor[0] + strColor[1],
                g = strColor[2] + strColor[3],
                b = strColor[4] + strColor[5];

            api.SetMarkerFormat(true, true, parseInt(r, 16), parseInt(g, 16), parseInt(b, 16));
        }
    }

    toggleBold(value) {
        const api = Common.EditorApi.get();
        if (api) {
            api.put_TextPrBold(value);
        }
    }

    toggleItalic(value) {
        const api = Common.EditorApi.get();
        if (api) {
            api.put_TextPrItalic(value);
        }
    }

    toggleUnderline(value) {
        const api = Common.EditorApi.get();
        if (api) {
            api.put_TextPrUnderline(value);
        }
    }

    toggleStrikethrough(value) {
        const api = Common.EditorApi.get();
        if (api) {
            api.put_TextPrStrikeout(value);
        }
    }

    // Additional

    onAdditionalStrikethrough(type, value) {
        const api = Common.EditorApi.get();
        if (api) {
            if ('strikeout' === type) {
                api.put_TextPrStrikeout(value);
            } else {
                api.put_TextPrDStrikeout(value);
            }
        }
    }

    onAdditionalCaps(type, value) {
        const api = Common.EditorApi.get();
        if (api) {
            const paragraphProps = new Asc.asc_CParagraphProperty();
            if ('small' === type) {
                paragraphProps.put_AllCaps(false);
                paragraphProps.put_SmallCaps(value);
            } else {
                paragraphProps.put_AllCaps(value);
                paragraphProps.put_SmallCaps(false);
            }
            api.paraApply(paragraphProps);
        }
    }

    onAdditionalScript(type, value) {
        const api = Common.EditorApi.get();
        if (api) {
            if ('superscript' === type) {
                api.put_TextPrBaseline(value ? Asc.vertalign_SuperScript : Asc.vertalign_Baseline);
            } else {
                api.put_TextPrBaseline(value ? Asc.vertalign_SubScript : Asc.vertalign_Baseline);
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
            properties.put_TextSpacing(Common.Utils.Metric.fnRecalcToMM(spacing));
            api.paraApply(properties);
        }
    }

    onParagraphAlign(type) {
        const api = Common.EditorApi.get();
        if (api) {
            let value;
            switch (type) {
                case 'just':
                    value = 3;
                    break;
                case 'right':
                    value = 0;
                    break;
                case 'center':
                    value = 2;
                    break;
                default:
                    value = 1;
                    break;
            }
            api.put_PrAlign(value);
        }
    }

    onParagraphMove(isLeft) {
        const api = Common.EditorApi.get();
        if (api) {
            if (isLeft) {
                api.DecreaseIndent();
            } else {
                api.IncreaseIndent();
            }
        }
    }

    onBullet(type) {
        const api = Common.EditorApi.get();
        if (api) {
            api.put_ListType(0, parseInt(type));
        }
    }

    onNumber(type) {
        const api = Common.EditorApi.get();
        if (api) {
            api.put_ListType(1, parseInt(type));
        }
    }

    onMultiLevelList(type) {
        const api = Common.EditorApi.get();
        if (api) api.put_ListType(2, parseInt(type));
    }

    getIconsBulletsAndNumbers(arrayElements, type) {
        const api = Common.EditorApi.get();
        const arr = [];

        arrayElements.forEach( item => arr.push(item.id));
        if (api) api.SetDrawImagePreviewBulletForMenu(arr, type);
    }

    onLineSpacing(value) {
        const api = Common.EditorApi.get();
        if (api) {
            const LINERULE_AUTO = 1;
            api.put_PrLineSpacing(LINERULE_AUTO, value);
        }
    }

    render() {
        return (
            <EditText 
                changeFontSize={this.changeFontSize}
                changeFontFamily={this.changeFontFamily}
                onTextColorAuto={this.onTextColorAuto}
                onTextColor={this.onTextColor}
                onHighlightColor={this.onHighlightColor}
                toggleBold={this.toggleBold}
                toggleItalic={this.toggleItalic}
                toggleUnderline={this.toggleUnderline}
                toggleStrikethrough={this.toggleStrikethrough}
                onAdditionalStrikethrough={this.onAdditionalStrikethrough}
                onAdditionalCaps={this.onAdditionalCaps}
                onAdditionalScript={this.onAdditionalScript}
                changeLetterSpacing={this.changeLetterSpacing}
                onParagraphAlign={this.onParagraphAlign}
                onParagraphMove={this.onParagraphMove}
                onBullet={this.onBullet}
                onNumber={this.onNumber}
                getIconsBulletsAndNumbers={this.getIconsBulletsAndNumbers}
                onMultiLevelList={this.onMultiLevelList}
                onLineSpacing={this.onLineSpacing}
            />
        )
    }
}

export default EditTextController;