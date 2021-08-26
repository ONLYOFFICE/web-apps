import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import { withTranslation} from 'react-i18next';

import {PageAddLink} from '../../view/add/AddLink';

class AddLinkController extends Component {
    constructor (props) {
        super(props);
        this.onInsertLink = this.onInsertLink.bind(this);
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

    render () {
        return (
            <PageAddLink closeModal={this.closeModal} onInsertLink={this.onInsertLink} getDisplayLinkText={this.getDisplayLinkText} noNavbar={this.props.noNavbar}/>
        )
    }
}

const AddLinkWithTranslation = withTranslation()(AddLinkController);

export {AddLinkWithTranslation as AddLinkController};