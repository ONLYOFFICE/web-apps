import React, {Component} from 'react';
import { f7, Popup, Popover, View } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import { withTranslation} from 'react-i18next';

import {PageAddLink} from '../../view/add/AddLink';

class AddLinkController extends Component {
    constructor (props) {
        super(props);

        this.onInsertLink = this.onInsertLink.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    closeModal(mobileSelector, tabletSelector) {
        if (Device.phone) {
            f7.popup.close(mobileSelector);
        } else {
            f7.popover.close(tabletSelector);
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

        if (urltype===AscCommon.c_oAscUrlType.Invalid) {
            f7.dialog.create({
                title: _t.notcriticalErrorTitle,
                text: _t.txtNotUrl,
                buttons: [
                    {
                        text: t('Add.textOk')
                    }
                ]
            }).open();
            return;
        }

        let _url = url.replace(/^\s+|\s+$/g,'');

        if (urltype!==AscCommon.c_oAscUrlType.Unsafe && ! /(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(_url) )
            _url = (urltype===AscCommon.c_oAscUrlType.Email ? 'mailto:' : 'http://' ) + _url;

        _url = _url.replace(new RegExp("%20",'g')," ");

        const props = new Asc.CHyperlinkProperty();

        props.put_Value(_url);
        props.put_Text(!display ? _url : display);
        props.put_ToolTip(tip);

        api.add_Hyperlink(props);

        if(this.props.isNavigate) {
            this.closeModal('.add-popup', '#add-popover');
        } else {
            this.closeModal('#add-link-popup', '#add-link-popover');
        }
    }

    componentDidMount() {
        if(!this.props.isNavigate) {
            if(Device.phone) {
                f7.popup.open('#add-link-popup', true);
            } else {
                f7.popover.open('#add-link-popover', '#btn-add');
            }
        }
    }

    render () {
        return (
            !this.props.isNavigate ?
                Device.phone ?
                    <Popup id="add-link-popup" onPopupClosed={() => this.props.closeOptions('add-link')}>
                        <PageAddLink closeModal={this.closeModal} onInsertLink={this.onInsertLink} getDisplayLinkText={this.getDisplayLinkText} isNavigate={this.props.isNavigate} />
                    </Popup>
                :
                    <Popover id="add-link-popover" className="popover__titled" closeByOutsideClick={false} onPopoverClosed={() => this.props.closeOptions('add-link')}>
                        <View style={{height: '410px'}}>
                            <PageAddLink closeModal={this.closeModal} onInsertLink={this.onInsertLink} getDisplayLinkText={this.getDisplayLinkText} isNavigate={this.props.isNavigate}/>
                        </View>
                    </Popover>
            :
                <PageAddLink closeModal={this.closeModal} onInsertLink={this.onInsertLink} getDisplayLinkText={this.getDisplayLinkText} isNavigate={this.props.isNavigate} />
        )
    }
}

const AddLinkWithTranslation = withTranslation()(AddLinkController);

export {AddLinkWithTranslation as AddLinkController};