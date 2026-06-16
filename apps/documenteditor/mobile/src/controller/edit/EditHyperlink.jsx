/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
