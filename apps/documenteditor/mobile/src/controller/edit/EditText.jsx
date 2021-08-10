import React, {Component} from 'react';
import { EditText } from '../../view/edit/EditText'

class EditTextController extends Component {
    constructor(props) {
        super(props);

        this.iconWidth = 302,
        this.iconHeight = Asc.FONT_THUMBNAIL_HEIGHT || 26,
        this.thumbCanvas = document.createElement('canvas'),
        this.thumbContext = this.thumbCanvas.getContext('2d'),
        this.thumbs = [
            {ratio: 1, path: '../../../../../../../sdkjs/common/Images/fonts_thumbnail.png', width: this.iconWidth, height: this.iconHeight},
            {ratio: 1.5, path: '../../../../../../../sdkjs/common/Images/fonts_thumbnail@1.5x.png', width: this.iconWidth * 1.5, height: this.iconHeight * 1.5},
            {ratio: 2, path: '../../../../../../../sdkjs/common/Images/fonts_thumbnail@2x.png', width: this.iconWidth * 2, height: this.iconHeight * 2}
        ],
        this.thumbIdx = 0,
        this.listItemHeight = 26,
        this.spriteCols = 1,
        this.applicationPixelRatio = Common.Utils.applicationPixelRatio();

        if (typeof window['AscDesktopEditor'] === 'object') {
            this.thumbs[0].path = window['AscDesktopEditor'].getFontsSprite('');
            this.thumbs[1].path = window['AscDesktopEditor'].getFontsSprite('@1.5x');
            this.thumbs[2].path = window['AscDesktopEditor'].getFontsSprite('@2x');
        }

        let bestDistance = Math.abs(this.applicationPixelRatio - this.thumbs[0].ratio);
        let currentDistance = 0;

        for (let i = 1; i < this.thumbs.length; i++) {
            currentDistance = Math.abs(this.applicationPixelRatio - this.thumbs[i].ratio);
            if (currentDistance < (bestDistance - 0.0001))
            {
                bestDistance = currentDistance;
                this.thumbIdx = i;
            }
        }

        this.thumbCanvas.height = this.thumbs[this.thumbIdx].height;
        this.thumbCanvas.width = this.thumbs[this.thumbIdx].width;

        this.loadSprite();
    }

    loadSprite() {
        this.spriteThumbs = new Image();
        this.spriteCols = Math.floor(this.spriteThumbs.width / (this.thumbs[this.thumbIdx].width)) || 1;
        this.spriteThumbs.src = this.thumbs[this.thumbIdx].path;
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

    onBackgroundColor(color) {
        const api = Common.EditorApi.get();
        if (color == 'transparent') {
            api.put_ParagraphShade(false);
        } else {
            api.put_ParagraphShade(true, Common.Utils.ThemeColor.getRgbColor(color));
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
                api.put_TextPrBaseline(value ? 1 : 0);
            } else {
                api.put_TextPrBaseline(value ? 2 : 0);
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
                onBackgroundColor={this.onBackgroundColor}
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
                onMultiLevelList={this.onMultiLevelList}
                onLineSpacing={this.onLineSpacing}
                spriteThumbs={this.spriteThumbs}
                thumbs={this.thumbs}
                thumbIdx={this.thumbIdx}
                iconWidth={this.iconWidth}
                iconHeight={this.iconHeight}
                thumbCanvas={this.thumbCanvas}
                thumbContext={this.thumbContext}
                spriteCols={this.spriteCols}
            />
        )
    }
}

export default EditTextController;