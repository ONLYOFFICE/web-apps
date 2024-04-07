import React, {Component} from 'react';
import { f7, Popover, Popup, View } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";
import { withTranslation } from 'react-i18next';

import EditHyperlink from '../../view/edit/EditHyperlink';

class EditHyperlinkController extends Component {
    constructor (props) {
        super(props);

        this.onRemoveLink = this.onRemoveLink.bind(this);
        this.onEditLink = this.onEditLink.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    closeModal () {
        if ( Device.phone ) {
            f7.popup.close('#edit-link-popup');
        } else {
            f7.popover.close('#edit-link-popover');
        }
    }

    onEditLink (link, display, tip) {
        const api = Common.EditorApi.get();

        if (api) {
            const urltype = api.asc_getUrlType(link.trim());
            if (urltype===AscCommon.c_oAscUrlType.Invalid) {
                const { t } = this.props;
    
                f7.dialog.create({
                    title: t('Edit.notcriticalErrorTitle'),
                    text: t('Edit.textNotUrl'),
                    buttons: [
                        {
                            text: t('Edit.textOk')
                        }
                    ]
                }).open();
                
                return;
            }

            let url = link.replace(/^\s+|\s+$/g,'');
            if (urltype!==AscCommon.c_oAscUrlType.Unsafe && ! /(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(url) ) {
                url = (urltype===AscCommon.c_oAscUrlType.Email ? 'mailto:' : 'http://') + url;
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
            this.props.isNavigate ? f7.views.current.router.back() : this.closeModal();
        }
    }

    onRemoveLink () {
        const api = Common.EditorApi.get();
        if (api) {
            const linkObject = this.props.storeFocusObjects.linkObject;
            api.remove_Hyperlink(linkObject);
        }
    }

    componentDidMount() {
        if(!this.props.isNavigate) {
            if(Device.phone) {
                f7.popup.open('#edit-link-popup', true);
            } else {
                f7.popover.open('#edit-link-popover', '#btn-add');
            }
        }
    }

    render () {
        return (
            !this.props.isNavigate ?
                Device.phone ?
                    <Popup id="edit-link-popup" onPopupClosed={() => this.props.closeOptions('edit-link')}>
                        <EditHyperlink 
                            onEditLink={this.onEditLink}
                            onRemoveLink={this.onRemoveLink}
                            closeModal={this.closeModal}
                            isNavigate={this.props.isNavigate}
                        />
                    </Popup>
                :
                    <Popover id="edit-link-popover" className="popover__titled" closeByOutsideClick={false} onPopoverClosed={() => this.props.closeOptions('edit-link')}>
                        <View style={{height: '410px'}}>
                            <EditHyperlink 
                                onEditLink={this.onEditLink}
                                onRemoveLink={this.onRemoveLink}
                                closeModal={this.closeModal}
                                isNavigate={this.props.isNavigate}
                            />
                        </View>
                    </Popover>
            :     
                <EditHyperlink 
                    onEditLink={this.onEditLink}
                    onRemoveLink={this.onRemoveLink}
                    closeModal={this.closeModal}
                    isNavigate={this.props.isNavigate}
                />
        )   
    }
}

export default withTranslation()(inject("storeFocusObjects")(observer(EditHyperlinkController)));