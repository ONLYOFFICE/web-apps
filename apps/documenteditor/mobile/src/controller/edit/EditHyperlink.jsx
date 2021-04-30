import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";
import { withTranslation } from 'react-i18next';

import EditHyperlink from '../../view/edit/EditHyperlink';

class EditHyperlinkController extends Component {
    constructor (props) {
        super(props);
        this.onRemoveLink = this.onRemoveLink.bind(this);
        this.onEditLink = this.onEditLink.bind(this);
    }

    closeModal () {
        if ( Device.phone ) {
            f7.sheet.close('#edit-sheet', true);
        } else {
            f7.popover.close('#edit-popover');
        }
    }

    onEditLink (link, display, tip) {
        const api = Common.EditorApi.get();
        if (api) {
            const urltype = api.asc_getUrlType(link.trim());
            const isEmail = (urltype == 2);
            if (urltype < 1) {
                const { t } = this.props;
                f7.dialog.alert(t('Edit.textNotUrl'), t('Edit.notcriticalErrorTitle'));
                return;
            }
            let url = link.replace(/^\s+|\s+$/g,'');
            if (! /(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(url) ) {
                url = (isEmail ? 'mailto:' : 'http://') + url;
            }
            url = url.replace(new RegExp("%20",'g')," ");
            const props = new Asc.CHyperlinkProperty();
            props.put_Value(url);
            props.put_Text(display.trim().length < 1 ? url : display);
            props.put_ToolTip(tip);
            const linkObject = this.props.storeFocusObjects.linkObject;
            if (linkObject) {
                props.put_InternalHyperlink(linkObject.get_InternalHyperlink());
            }
            api.change_Hyperlink(props);
            this.closeModal();
        }
    }

    onRemoveLink () {
        const api = Common.EditorApi.get();
        if (api) {
            const linkObject = this.props.storeFocusObjects.linkObject;
            api.remove_Hyperlink(linkObject);
            this.closeModal();
        }
    }

    render () {
        return (
            <EditHyperlink onEditLink={this.onEditLink}
                           onRemoveLink={this.onRemoveLink}
            />
        )
    }
}

export default withTranslation()(inject("storeFocusObjects")(observer(EditHyperlinkController)));