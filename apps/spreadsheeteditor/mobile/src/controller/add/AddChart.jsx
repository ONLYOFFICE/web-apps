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
import {Device} from '../../../../../common/mobile/utils/device';
import { withTranslation } from 'react-i18next';

import AddChart from '../../view/add/AddChart';

class AddChartController extends Component {
    constructor (props) {
        super(props);
        this.onInsertChart = this.onInsertChart.bind(this);
    }

    closeModal () {
        if ( Device.phone ) {
            f7.sheet.close('.add-popup', true);
        } else {
            f7.popover.close('#add-popover');
        }
    }

    onInsertChart (type) {
        const api = Common.EditorApi.get();
        const { t } = this.props;
        const _t = t('View.Add', {returnObjects: true});
        const settings = api.asc_getChartSettings(true);
        const info = api.asc_getCellInfo();
        const selType = info.asc_getSelectionType();
        const isChartEdit = (selType == Asc.c_oAscSelectionType.RangeChart || selType == Asc.c_oAscSelectionType.RangeChartText);

        if (settings) {
            if (isChartEdit) {
                settings.changeType(type);
            } else {
                settings.putType(type);
                let range = settings.getRange(),
                    isValid = !!range ? api.asc_checkDataRange(Asc.c_oAscSelectionDialogType.Chart, range, true, !settings.getInColumns(), settings.getType()) : Asc.c_oAscError.ID.No;
                if (isValid == Asc.c_oAscError.ID.No) {
                    api.asc_addChartDrawingObject(settings);
                    this.closeModal();
                } else {
                    f7.dialog.alert((isValid == Asc.c_oAscError.ID.StockChartError) ? _t.errorStockChart : ((isValid == Asc.c_oAscError.ID.MaxDataSeriesError) ? _t.errorMaxRows : _t.txtInvalidRange), _t.notcriticalErrorTitle);
                }
            }
        }
    }

    render () {
        return (
            <AddChart onInsertChart={this.onInsertChart} />
        )
    }
}

const AddChartControllerTranslated = withTranslation()(AddChartController);

export {AddChartControllerTranslated as AddChartController};
