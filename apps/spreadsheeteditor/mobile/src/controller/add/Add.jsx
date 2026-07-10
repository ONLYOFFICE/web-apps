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

import React, { createContext } from "react";
import AddView from "../../view/add/Add";

export const AddingContext = createContext();

const AddingController = props => {
    const api = Common.EditorApi.get();
    const cellinfo = api.asc_getCellInfo();
    const seltype = cellinfo.asc_getSelectionType();
    const iscelllocked = cellinfo.asc_getLocked();
    const isAddShapeHyperlink = api.asc_canAddShapeHyperlink();
    let options;

    if(!iscelllocked) {
        options = props.showOptions;

        if(!options) {
            switch(seltype) {
                case Asc.c_oAscSelectionType.RangeCells:
                case Asc.c_oAscSelectionType.RangeRow:
                case Asc.c_oAscSelectionType.RangeCol:
                case Asc.c_oAscSelectionType.RangeMax: break;
                case Asc.c_oAscSelectionType.RangeImage:
                case Asc.c_oAscSelectionType.RangeShape:
                case Asc.c_oAscSelectionType.RangeChart:
                case Asc.c_oAscSelectionType.RangeChartText:
                case Asc.c_oAscSelectionType.RangeShapeText:
                    options = {panels: ['image','shape']};
                    break;
            }
        }
    }

    return (
        <AddingContext.Provider value={{
            isAddShapeHyperlink,
            showPanels: options ? options.panels : undefined
        }}>
            <AddView showOptions={props.showOptions} />
        </AddingContext.Provider>
        
    )
}

export default AddingController;
