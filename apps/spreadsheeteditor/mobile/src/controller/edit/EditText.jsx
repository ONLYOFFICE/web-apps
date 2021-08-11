import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';

import { EditText } from '../../view/edit/EditText';

class EditTextController extends Component {
    constructor (props) {
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