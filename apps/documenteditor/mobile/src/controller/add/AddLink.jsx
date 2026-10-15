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
