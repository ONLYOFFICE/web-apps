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
import { Device } from '../../../../common/mobile/utils/device';
import { f7 } from "framework7-react";
import { withTranslation } from "react-i18next";
import DropdownList from "../view/DropdownList";

class DropdownListController extends Component {
    constructor(props) {
        super(props);
        this.onChangeItemList = this.onChangeItemList.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.onAddItem = this.onAddItem.bind(this);
        
        this.state = {
            isOpen: false,
            enteredValue: ''
        };

        Common.Notifications.on('openDropdownList', obj => {
            this.initDropdownList(obj);
        });
        Common.Notifications.on('openPdfDropdownList', obj => {
            this.isCorePDF = true;
            this.initPdfDropdownList(obj);
        });
    }

    initDropdownList(obj) {
        const api = Common.EditorApi.get();

        this.type = obj.type;
        this.propsObj = obj.pr;
        this.internalId = this.propsObj.get_InternalId();
        this.isComboBox = this.type === Asc.c_oAscContentControlSpecificType.ComboBox;
        this.specProps = this.isComboBox ? this.propsObj.get_ComboBoxPr() : this.propsObj.get_DropDownListPr();
        this.formProps = this.propsObj.get_FormPr();
        this.listItems = [];
        this.curValue = api.asc_GetContentControlListCurrentValue(this.internalId);

        this.initListItems();
        this.setState({
            isOpen: true,
            enteredValue: api.asc_GetSelectedText()
        });
    }

    initPdfDropdownList(obj) {
        this.listItems = [];
        const options = obj.getOptions(),
            count = options.length;
        for (let i = 0; i < count; i++) {
            this.listItems.push({
                caption: Array.isArray(options[i]) ? options[i][0] : options[i],
                value: i
            });
        }

        this.setState({
            isOpen: true,
            // enteredValue: api.asc_GetSelectedText()
        });
    }

    initListItems() {
        const { t } = this.props;
        const count = this.specProps.get_ItemsCount();

        if(this.formProps) {
            if (!this.formProps.get_Required() || count<1) {// for required or empty dropdown/combobox form control always add placeholder item
                let text = this.propsObj.get_PlaceholderText();

                this.listItems.push({
                    caption: text.trim() !== '' ? text : t('Edit.textEmpty'),
                    value: ''
                });
            }
        }

        for (let i = 0; i < count; i++) {
            if(this.specProps.get_ItemValue(i) || !this.formProps) {
                this.listItems.push({
                    caption: this.specProps.get_ItemDisplayText(i), 
                    value: this.specProps.get_ItemValue(i)
                });
            }
        }

        if (!this.formProps && this.listItems.length < 1) {
            this.listItems.push({
                caption: t('Edit.textEmpty'),
                value: -1
            });
        }
    }

    closeModal() {
        if(Device.isPhone) {
            f7.popup.close('#dropdown-list-popup', true);
        } else {
            f7.popover.close('#dropdown-list-popover', true);
        }

        f7.views.current.router.back();
        this.setState({isOpen: false});
    }

    onChangeItemList(value) {
        const api = Common.EditorApi.get();

        if(value !== -1) {
            this.closeModal();

            if ( this.isCorePDF === true )
                api.asc_SelectPDFFormListItem(value);
            else api.asc_SelectContentControlListItem(value, this.internalId);
        }
    }

    onAddItem(value) {
        const api = Common.EditorApi.get();
        api.asc_SetContentControlText(value, this.internalId);

        this.setState(prevState => ({
            ...prevState,
            enteredValue: value
        }));
        
        f7.views.current.router.back();
    }

    render() {
        return (
            this.state.isOpen &&
                <DropdownList 
                    listItems={this.listItems}
                    onChangeItemList={this.onChangeItemList}
                    closeModal={this.closeModal}
                    isComboBox={this.isComboBox}
                    onAddItem={this.onAddItem}
                    curValue={this.curValue}
                    enteredValue={this.state.enteredValue}
                /> 
        );
    }
}

export default withTranslation()(DropdownListController);
