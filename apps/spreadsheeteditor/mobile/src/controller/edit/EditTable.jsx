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
import { f7 } from 'framework7-react';
import { inject, observer } from 'mobx-react';
import { Device } from '../../../../../common/mobile/utils/device';

import EditTable from '../../view/edit/EditTable';

class EditTableController extends Component {
    constructor (props) {
        super(props);

        this.onAddCell = this.onAddCell.bind(this);
        this.onRemoveCell = this.onRemoveCell.bind(this);
        this.onStyleSelect = this.onStyleSelect.bind(this);
        this.onToggleOption = this.onToggleOption.bind(this);
        this.onDeleteTable = this.onDeleteTable.bind(this);
    }

    getTableName () {
        const tableInfo = this.props.storeFocusObjects.tableObject;
        return tableInfo ? tableInfo.asc_getTableName() : null;
    }

    closeIfTableGone () {
        if (!this.props.storeFocusObjects.tableObject) {
            if (Device.phone) {
                f7.sheet.close('#edit-sheet', true);
            } else {
                f7.popover.close('#edit-popover');
            }
        }
    }

    onAddCell (direction) {
        const tableName = this.getTableName();
        if (!tableName) return;

        const api = Common.EditorApi.get();
        api.asc_insertCellsInTable(tableName, direction);
    }

    onRemoveCell (target) {
        const tableName = this.getTableName();
        if (!tableName) return;

        const api = Common.EditorApi.get();
        api.asc_deleteCellsInTable(tableName, target);
        this.closeIfTableGone();
    }

    onStyleSelect (styleName) {
        const tableName = this.getTableName();
        if (!tableName) return;

        const api = Common.EditorApi.get();
        api.asc_changeAutoFilter(tableName, Asc.c_oAscChangeFilterOptions.style, styleName);
    }

    onToggleOption (option, value) {
        const tableName = this.getTableName();
        if (!tableName) return;

        const api = Common.EditorApi.get();
        api.asc_changeFormatTableInfo(tableName, option, value);
    }

    onDeleteTable () {
        const tableName = this.getTableName();
        if (!tableName) return;

        const api = Common.EditorApi.get();
        api.asc_deleteCellsInTable(tableName, Asc.c_oAscDeleteOptions.DeleteTable);
        this.closeIfTableGone();
    }

    render () {
        return (
            <EditTable onAddCell={this.onAddCell}
                        onRemoveCell={this.onRemoveCell}
                        onStyleSelect={this.onStyleSelect}
                        onToggleOption={this.onToggleOption}
                        onDeleteTable={this.onDeleteTable}
            />
        )
    }
}

export default inject("storeFocusObjects")(observer(EditTableController));