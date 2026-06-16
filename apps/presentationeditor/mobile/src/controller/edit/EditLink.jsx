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

import React, { Component } from 'react';
import { f7, View, Popup, Popover } from 'framework7-react';
import { Device } from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";
import { withTranslation } from 'react-i18next';

import { EditLink, ObservablePageEditTypeLink, ObservablePageEditLinkTo } from '../../view/edit/EditLink';

const routes = [
    {
        path: '/edit-link-type/',
        component: ObservablePageEditTypeLink
    },
    {
        path: '/edit-link-to/',
        component: ObservablePageEditLinkTo
    }
];

class EditLinkController extends Component {
    constructor (props) {
        super(props);

        this.onEditLink = this.onEditLink.bind(this);
        this.onRemoveLink = this.onRemoveLink.bind(this);
        this.initLink = this.initLink.bind(this);
        this.initLink();
    }

    closeModal () {
        if ( Device.phone ) {
            f7.popup.close('#edit-link-popup');
        } else {
            f7.popover.close('#edit-link-popover');
        }
    }

    initLink() {
        const api = Common.EditorApi.get();
        const linkObject = this.props.storeFocusObjects.linkObject;
        const url = linkObject.get_Value();
        const tooltip = linkObject.get_ToolTip();
        const display = linkObject.get_Text();

        this.url = url;
        this.tooltip = tooltip;
        this.display = display;
        this.slideLink = 0;
        this.slideNum = 0;

        let indAction;
        let slidesCount;
        let slideNum;

        if(url === null || url === undefined || url === '') {
            this.typeLink = 1;
        }
        else {
            indAction = url.indexOf("ppaction://hlink");
            if(0 == indAction) {
                if (url == "ppaction://hlinkshowjump?jump=firstslide") {
                    this.slideLink = 2;
                } else if (url == "ppaction://hlinkshowjump?jump=lastslide") {
                    this.slideLink = 3;
                }
                else if (url == "ppaction://hlinkshowjump?jump=nextslide") {
                    this.slideLink = 0;
                }
                else if (url == "ppaction://hlinkshowjump?jump=previousslide") {
                    this.slideLink = 1;
                }
                else {
                    this.slideLink = 4;
                    slidesCount = api.getCountPages();
                    let mask = "ppaction://hlinksldjumpslide",
                        indSlide = url.indexOf(mask);
                    if (0 == indSlide) {
                        this.slideNum = parseInt(url.substring(mask.length));
                        if (slideNum < 0) this.slideNum = 0;
                        if (slideNum >= slidesCount) this.slideNum = slidesCount - 1;
                    } else this.slideNum = 0;
                }
                this.typeLink = 0
            } else {
                this.typeLink = 1;
            }
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
            if (urltype===AscCommon.c_oAscUrlType.Invalid) {
                f7.dialog.create({
                    title: t('View.Edit.notcriticalErrorTitle'),
                    text: t('View.Edit.textNotUrl'),
                    buttons: [
                        {
                            text: t('View.Edit.textOk')
                        }
                    ]
                }).open();

                return;
            }

            url = url.replace(/^\s+|\s+$/g, '');
            if (urltype!==AscCommon.c_oAscUrlType.Unsafe && !/(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(url))
                url = (urltype===AscCommon.c_oAscUrlType.Email ? 'mailto:' : 'http://' ) + url;
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
                    slidetip = _t.textPreviousSlide;
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
            props.put_ToolTip(tip === '' ? slidetip : tip);
            def_display = slidetip;
        }

        if (!linkInfo.displayDisabled) {
            props.put_Text(display === '' ? def_display : display);
        } else
            props.put_Text(null);
        
        api.change_Hyperlink(props);
        this.props.isNavigate ? f7.views.current.router.back() : this.closeModal();
    }

    onRemoveLink() {
        const api = Common.EditorApi.get();
        api.remove_Hyperlink();
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
                        <View routes={routes} style={{height: '100%'}}>
                            <EditLink 
                                initLink={this.initLink}
                                typeLink={this.typeLink}
                                url={this.url}
                                display={this.display}
                                tooltip={this.tooltip}
                                slideLink={this.slideLink}
                                slideNum={this.slideNum}
                                onEditLink={this.onEditLink} 
                                onRemoveLink={this.onRemoveLink}
                                closeModal={this.closeModal}
                                isNavigate={this.props.isNavigate}
                            />
                        </View>
                    </Popup>
                :
                    <Popover id="edit-link-popover" className="popover__titled" closeByOutsideClick={false} onPopoverClosed={() => this.props.closeOptions('edit-link')}>
                        <View routes={routes} style={{height: '410px'}}>
                            <EditLink
                                initLink={this.initLink}
                                typeLink={this.typeLink}
                                url={this.url}
                                display={this.display}
                                tooltip={this.tooltip}
                                slideLink={this.slideLink}
                                slideNum={this.slideNum}
                                onEditLink={this.onEditLink} 
                                onRemoveLink={this.onRemoveLink}
                                closeModal={this.closeModal}
                                isNavigate={this.props.isNavigate}
                            />
                        </View>
                    </Popover>
            :     
                <EditLink
                    initLink={this.initLink}
                    typeLink={this.typeLink}
                    url={this.url}
                    display={this.display}
                    tooltip={this.tooltip}
                    slideLink={this.slideLink}
                    slideNum={this.slideNum}
                    onEditLink={this.onEditLink} 
                    onRemoveLink={this.onRemoveLink}
                    closeModal={this.closeModal}
                    isNavigate={this.props.isNavigate}
                />
        )
    }
}

const EditLinkWithTranslation = inject("storeFocusObjects")(observer(withTranslation()(EditLinkController)));

export {EditLinkWithTranslation as EditLinkController};
