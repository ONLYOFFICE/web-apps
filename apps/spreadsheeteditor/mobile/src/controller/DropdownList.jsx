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
        
        this.state = {
            isOpen: false
        };

        Common.Notifications.on('openDropdownList', (textArr, addArr) => {
            this.initDropdownList(textArr, addArr);
        });
    }

    initDropdownList(textArr, addArr) {
        this.listItems = textArr.map((item, index) => {
            return {
                caption: item, 
                value: addArr ? addArr[index] : item
            };
        });

        this.setState({
            isOpen: true
        });
    }

    closeModal() {
        if(Device.isPhone) {
            f7.sheet.close('#dropdown-list-sheet', true);
        } else {
            f7.popover.close('#dropdown-list-popover', true);
        }

        this.setState({isOpen: false});
    }

    onChangeItemList(value) {
        const api = Common.EditorApi.get();

        this.closeModal();
        api.asc_insertInCell(value, Asc.c_oAscPopUpSelectorType.None, false);
    }

    render() {
        return (
            this.state.isOpen &&
                <DropdownList 
                    listItems={this.listItems}
                    onChangeItemList={this.onChangeItemList}
                    closeModal={this.closeModal}
                /> 
        );
    }
}

export default withTranslation()(DropdownListController);
