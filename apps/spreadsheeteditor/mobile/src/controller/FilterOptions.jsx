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

import React, { memo, useEffect,useRef,useState } from 'react';
import FilterView from '../../src/view/FilterOptions';
import { f7,Sheet,Popover } from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device';
import { useTranslation } from 'react-i18next';

const FilterOptionsController = memo(props => {
    const { t } = useTranslation();
    const wsProps = props.wsProps;
    const _t = t('View.Edit', {returnObjects: true});
    const configRef = useRef();

    const [listVal, setListValue] = useState([]);
    const [isValid, setIsValid] = useState(null);
    const [checkSort, setCheckSort] = useState('');

    useEffect(() => {
        function onDocumentReady()  {
            const api = Common.EditorApi.get();
            api.asc_registerCallback('asc_onSetAFDialog',onApiFilterOptions);
        }
        
        if ( !Common.EditorApi.get() ) {
            Common.Notifications.on('document:ready',onDocumentReady);
        } else {
            onDocumentReady();
        }

        return () => { 
            Common.Notifications.off('document:ready', onDocumentReady);
            const api = Common.EditorApi.get();
            if ( api ) {
                api.asc_unregisterCallback('asc_onSetAFDialog', onApiFilterOptions);
            }
        }
    }, []);

    const onApiFilterOptions = (config) => {
        setDataFilterCells(config);
        configRef.current = config;

        if (wsProps.PivotTables && config.asc_getPivotObj() || 
            wsProps.AutoFilter && !config.asc_getPivotObj()) return;
        
        setCheckSort((config.asc_getSortState() === Asc.c_oAscSortOptions.Ascending ? 'down' : '') || 
        (config.asc_getSortState() === Asc.c_oAscSortOptions.Descending ? 'up' : ''));
        
        if (Device.phone) { 
            f7.sheet.open('.picker__sheet');
        } else {
            let rect = config.asc_getCellCoord(),
                posX = rect.asc_getX() + rect.asc_getWidth() - 9,
                posY = rect.asc_getY() + rect.asc_getHeight() - 9;

            let $target = $$('#idx-context-menu-target')
                        .css({left: `${posX}px`, top: `${posY}px`});
            if(!$$('#picker-popover.modal-in').length) f7.popover.open('#picker-popover',$target);
        }    
    }

    const onSort = (type) => {
        const api = Common.EditorApi.get();
        api.asc_sortColFilter(type == 'sortdown' ? Asc.c_oAscSortOptions.Ascending : Asc.c_oAscSortOptions.Descending, configRef.current.asc_getCellId(), configRef.current.asc_getDisplayName());
        f7.sheet.close('.picker__sheet');
        f7.popover.close('#picker-popover');
    };
    
    const onClearFilter = () => {
        const api = Common.EditorApi.get();
        if(api) api.asc_clearFilter();
        setCheckSort('');
    };

    const onDeleteFilter = () => {
        const api = Common.EditorApi.get();
        let formatTableInfo = api.asc_getCellInfo().asc_getFormatTableInfo();
        let tablename = (formatTableInfo) ? formatTableInfo.asc_getTableName() : undefined;
        if(api) {
            api.asc_changeAutoFilter(tablename, Asc.c_oAscChangeFilterOptions.filter, false);
            f7.sheet.close('.picker__sheet');
            f7.popover.close('#picker-popover');
        }
    };

    const setClearDisable = (config) => {
        let arr = config.asc_getValues();
        let lenCheck = arr.filter((item) => item.visible == true).length;
        lenCheck == arr.length ? setIsValid(true) : setIsValid(false);
    };

    const setDataFilterCells = (config) => {
        let value = null,
            isnumber = null,
            arrCells = [];

        config.asc_getValues().forEach((item, index) => {
            value = item.asc_getText();
            isnumber = !isNaN(parseFloat(value)) && isFinite(value);

            arrCells.push({
                id              : index,
                selected        : false,
                cellvalue       : value ? value : _t.textEmptyItem,
                value           : isnumber ? value : (value.length > 0 ? value: _t.textEmptyItem),
                groupid         : '1',
                check           : item.asc_getVisible()
            });
        });

        setListValue(arrCells);
    };
    
    const onUpdateCell = (id, state) => {
        const api = Common.EditorApi.get();

        id == 'all' ? listVal.forEach(item => item.check = state) : listVal[id].check = state;
        setListValue([...listVal]);

        if ( listVal.some(item => item.check) ) {
            configRef.current.asc_getValues().forEach(
                (item, index) => item.asc_setVisible(listVal[index].check)
            );

            configRef.current.asc_getFilterObj().asc_setType(Asc.c_oAscAutoFilterTypes.Filters);
            api.asc_applyAutoFilter(configRef.current);
        }

        setClearDisable(configRef.current);
    };

    return (
        <FilterView onSort={onSort} listVal={listVal} checkSort={checkSort} isValid={isValid} onUpdateCell={onUpdateCell} 
        onDeleteFilter={onDeleteFilter} onClearFilter={onClearFilter}/>
    )
});

export default FilterOptionsController;
