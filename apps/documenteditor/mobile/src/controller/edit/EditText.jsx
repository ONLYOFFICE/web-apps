import React, {Component} from 'react';
import { EditText } from '../../view/edit/EditText'
import { inject, observer } from 'mobx-react';

class EditTextController extends Component {
    constructor(props) {
        super(props);
        this.onApiFocusObject = this.onApiFocusObject.bind(this);
        this.updateBulletsNumbers = this.updateBulletsNumbers.bind(this);
        this.updateListType = this.updateListType.bind(this);
    }

    componentDidMount() {
        const api = Common.EditorApi.get();
        api && api.UpdateInterfaceState();
        api.asc_registerCallback('asc_onFocusObject', this.onApiFocusObject);
    }

    componentWillUnmount() {
        const api = Common.EditorApi.get();
        api.asc_unregisterCallback('asc_onFocusObject', this.onApiFocusObject);
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

    onLineSpacing(value) {
        const api = Common.EditorApi.get();
        if (api) {
            const LINERULE_AUTO = 1;
            api.put_PrLineSpacing(LINERULE_AUTO, value);
        }
    }

    onBullet(numberingInfo) {
        const api = Common.EditorApi.get();
        if (api) {
            api.put_ListTypeCustom(JSON.parse(numberingInfo));
        }
    }

    onNumber(numberingInfo) {
        const api = Common.EditorApi.get();
        if (api) {
            api.put_ListTypeCustom(JSON.parse(numberingInfo));
        }
    }

    onMultiLevelList(numberingInfo) {
        const api = Common.EditorApi.get();
        if (api) api.put_ListTypeCustom(JSON.parse(numberingInfo));
    }

    getIconsBulletsAndNumbers(arrayElements, type) {
        const api = Common.EditorApi.get();
        const arr = [];

        arrayElements.forEach( item => {
            arr.push({
                numberingInfo: JSON.parse(item.numberingInfo),
                divId: item.id
            });
        });

        if (api) api.SetDrawImagePreviewBulletForMenu(arr, type);
    }

    updateBulletsNumbers(type) {
        const api = Common.EditorApi.get();
        const storeTextSettings = this.props.storeTextSettings;
        let subtype = undefined;
        let arrayElements = (type===0) ? storeTextSettings.getBulletsList() : (type===1) ? storeTextSettings.getNumbersList() : storeTextSettings.getMultiLevelList();

        for (let i=0; i<arrayElements.length; i++) {
            if (arrayElements[i].type > 0 && api.asc_IsCurrentNumberingPreset(arrayElements[i].numberingInfo, type!==2)) {
                subtype = arrayElements[i].subtype;
                break;
            }
        }

        switch (type) {
            case 0:
                storeTextSettings.resetBullets(subtype);
                break;
            case 1:
                storeTextSettings.resetNumbers(subtype);
                break;
            case 2:
                storeTextSettings.resetMultiLevel(subtype);
                break;
        }
    }

    updateListType() {
        const api = Common.EditorApi.get();
        const listId = api.asc_GetCurrentNumberingId();
        const numformat = (listId !== null) ? api.asc_GetNumberingPr(listId).get_Lvl(api.asc_GetCurrentNumberingLvl()).get_Format() : Asc.c_oAscNumberingFormat.None;

        this.props.storeTextSettings.resetListType(numformat===Asc.c_oAscNumberingFormat.Bullet ? 0 : (numformat===Asc.c_oAscNumberingFormat.None ? -1 : 1));
    }

    onApiFocusObject() {
        this.updateListType();
        this.updateBulletsNumbers(0);
        this.updateBulletsNumbers(1);
        this.updateBulletsNumbers(2);
    }

    setOrientationTextShape(direction) {
        const api = Common.EditorApi.get();
        const properties = new Asc.asc_CImgProperty();

        properties.put_Vert(direction);
        api.ImgApply(properties);
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
                updateBulletsNumbers={this.updateBulletsNumbers}
                updateListType={this.updateListType}
                onMultiLevelList={this.onMultiLevelList}
                onLineSpacing={this.onLineSpacing}
                setOrientationTextShape={this.setOrientationTextShape}
            />
        )
    }
}

export default inject('storeTextSettings')(observer(EditTextController));