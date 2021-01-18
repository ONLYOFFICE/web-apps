import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";

import { EditText } from '../../view/edit/EditText';

class EditTextController extends Component {
    constructor (props) {
        super(props);
    }

    toggleBold(value) {
        const api = Common.EditorApi.get();
        api.put_TextPrBold(value);
    };

    toggleItalic(value) {
        const api = Common.EditorApi.get();
        api.put_TextPrItalic(value);
    };

    toggleUnderline(value) {
        const api = Common.EditorApi.get();
        api.put_TextPrUnderline(value);
    };

    toggleStrikethrough(value) {
        const api = Common.EditorApi.get();
        api.put_TextPrStrikeout(value);
    };

    onParagraphAlign(type) {
        const api = Common.EditorApi.get();
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

        api.setVerticalAlign(value);
    };

    onParagraphMove(type) {
        const api = Common.EditorApi.get();

        if(type === 'left') {
            api.DecreaseIndent();
        } else {
            api.IncreaseIndent();
        }
    };

    render () {
        return (
            <EditText
                toggleBold={this.toggleBold}
                toggleItalic={this.toggleItalic}
                toggleUnderline={this.toggleUnderline}
                toggleStrikethrough={this.toggleStrikethrough}
                onParagraphAlign={this.onParagraphAlign}
                onParagraphValign={this.onParagraphValign}
                onParagraphMove={this.onParagraphMove}
            />
        )
    }
}

export default EditTextController;