import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import { withTranslation} from 'react-i18next';

import {AddOther} from '../../view/add/AddOther';

class AddOtherController extends Component {
    constructor (props) {
        super(props);
        this.onInsertLink = this.onInsertLink.bind(this);
        this.onInsertPageNumber = this.onInsertPageNumber.bind(this);
    }

    closeModal () {
        if ( Device.phone ) {
            f7.sheet.close('.add-popup', true);
        } else {
            f7.popover.close('#add-popover');
        }
    }

    getDisplayLinkText () {
        const api = Common.EditorApi.get();
        return api.can_AddHyperlink();
    }

    onInsertLink (url, display, tip) {
        const api = Common.EditorApi.get();

        const { t } = this.props;
        const _t = t("Add", { returnObjects: true });

        const urltype = api.asc_getUrlType(url.trim());
        const isEmail = (urltype == 2);

        if (urltype < 1) {
            f7.dialog.alert(_t.txtNotUrl, _t.notcriticalErrorTitle);
            return;
        }

        let _url = url.replace(/^\s+|\s+$/g,'');

        if (! /(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(_url) )
            _url = (isEmail ? 'mailto:' : 'http://' ) + _url;

        _url = _url.replace(new RegExp("%20",'g')," ");

        const props = new Asc.CHyperlinkProperty();
        props.put_Value(_url);
        props.put_Text(!display ? _url : display);
        props.put_ToolTip(tip);

        api.add_Hyperlink(props);

        this.closeModal();
    }

    onInsertPageNumber (type) {
        const api = Common.EditorApi.get();

        let value = -1;

        if (2 == type.length) {
            const c_pageNumPosition = {
                PAGE_NUM_POSITION_TOP: 0x01,
                PAGE_NUM_POSITION_BOTTOM: 0x02,
                PAGE_NUM_POSITION_RIGHT: 0,
                PAGE_NUM_POSITION_LEFT: 1,
                PAGE_NUM_POSITION_CENTER: 2
            };
            value = {};

            if (type[0] == 'l') {
                value.subtype = c_pageNumPosition.PAGE_NUM_POSITION_LEFT;
            } else if (type[0] == 'c') {
                value.subtype = c_pageNumPosition.PAGE_NUM_POSITION_CENTER;
            } else if (type[0] == 'r') {
                value.subtype = c_pageNumPosition.PAGE_NUM_POSITION_RIGHT;
            }

            if (type[1] == 't') {
                value.type = c_pageNumPosition.PAGE_NUM_POSITION_TOP;
            } else if (type[1] == 'b') {
                value.type = c_pageNumPosition.PAGE_NUM_POSITION_BOTTOM;
            }

            api.put_PageNum(value.type, value.subtype);
        } else {
            api.put_PageNum(value);
        }

        this.closeModal();
    }

    render () {
        return (
            <AddOther onInsertLink={this.onInsertLink}
                      getDisplayLinkText={this.getDisplayLinkText}
                      onInsertPageNumber={this.onInsertPageNumber}
            />
        )
    }
}

const AddOtherWithTranslation = withTranslation()(AddOtherController);

export {AddOtherWithTranslation as AddOtherController};