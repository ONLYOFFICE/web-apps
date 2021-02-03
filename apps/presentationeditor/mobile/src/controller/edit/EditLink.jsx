import React, { Component } from 'react';
import { f7 } from 'framework7-react';
import { Device } from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";
import { withTranslation } from 'react-i18next';

import { EditLink } from '../../view/edit/EditLink';

class EditLinkController extends Component {
    constructor (props) {
        super(props);
        this.onEditLink = this.onEditLink.bind(this);
        this.onRemoveLink = this.onRemoveLink.bind(this);
    }

    closeModal () {
        if ( Device.phone ) {
            f7.sheet.close('#edit-sheet', true);
        } else {
            f7.popover.close('#edit-popover');
        }
    }

    onEditLink(type, linkInfo) {
        const api = Common.EditorApi.get();
        const { t } = this.props;
        const _t = t("View.Edit", { returnObjects: true });

        const c_oHyperlinkType = {
            InternalLink: 0,
            WebLink: 1
        };

        const display = linkInfo.display;
        const tip = linkInfo.tip;
        const props = new Asc.CHyperlinkProperty();
        let def_display = '';

        if (type == c_oHyperlinkType.WebLink) {
            let url = linkInfo.url;
            const urltype = api.asc_getUrlType(url.trim());
            const isEmail = (urltype == 2);
            if (urltype < 1) {
                f7.dialog.alert(_t.textNotUrl, _t.notcriticalErrorTitle);
                return;
            }

            url = url.replace(/^\s+|\s+$/g, '');
            if (!/(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(url))
                url = (isEmail ? 'mailto:' : 'http://' ) + url;
            url = url.replace(new RegExp("%20", 'g'), " ");

            props.put_Value(url);
            props.put_ToolTip(tip);
            def_display = url;
        } else {
            let url = "ppaction://hlink";
            let slidetip = '';
            switch (linkInfo.linkTo) {
                case 0:
                    url = url + "showjump?jump=nextslide";
                    slidetip = _t.textNextSlide;
                    break;
                case 1:
                    url = url + "showjump?jump=previousslide";
                    slidetip = _t.textPrevSlide;
                    break;
                case 2:
                    url = url + "showjump?jump=firstslide";
                    slidetip = _t.textFirstSlide;
                    break;
                case 3:
                    url = url + "showjump?jump=lastslide";
                    slidetip = _t.textLastSlide;
                    break;
                case 4:
                    url = url + "sldjumpslide" + linkInfo.numberTo;
                    slidetip = _t.textSlide + ' ' + (linkInfo.numberTo + 1);
                    break;
            }
            props.put_Value(url);
            props.put_ToolTip(!tip ? slidetip : tip);
            def_display = slidetip;
        }

        if (!linkInfo.displayDisabled) {
            props.put_Text(!display ? def_display : display);
        } else
            props.put_Text(null);
        
        api.change_Hyperlink(props);

        this.closeModal();
    }

    onRemoveLink() {
        const api = Common.EditorApi.get();
        api.remove_Hyperlink();
        this.closeModal();
    }

    render () {
        return (
            <EditLink 
                onEditLink={this.onEditLink} 
                onRemoveLink={this.onRemoveLink}
            />
        )
    }
}

const EditLinkWithTranslation = withTranslation()(EditLinkController);

export {EditLinkWithTranslation as EditLinkController};