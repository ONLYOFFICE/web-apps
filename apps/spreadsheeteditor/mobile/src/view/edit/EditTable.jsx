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

import React, {useMemo} from 'react';
import {Page, Navbar, NavRight, Link, List, ListItem, ListButton, BlockTitle, Toggle} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { inject, observer } from 'mobx-react';
import { Device } from '../../../../../common/mobile/utils/device';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconExpandDownIos from '@common-ios-icons/icon-expand-down.svg?ios';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';
import IconTableAddColumnLeft from '@common-icons/icon-table-add-column-left.svg';
import IconTableAddColumnRight from '@common-icons/icon-table-add-column-right.svg';
import IconTableAddRowAbove from '@common-icons/icon-table-add-row-above.svg';
import IconTableAddRowBelow from '@common-icons/icon-table-add-row-below.svg';
import IconTableRemoveColumn from '@common-icons/icon-table-remove-column.svg';
import IconTableRemoveRow from '@common-icons/icon-table-remove-row.svg';

const EditTable = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeFocusObjects = props.storeFocusObjects;
    const tableInfo = storeFocusObjects.tableObject;

    if (!tableInfo) return null;

    const canInsertColumnLeft = tableInfo.asc_getIsInsertColumnLeft();
    const canInsertColumnRight = tableInfo.asc_getIsInsertColumnRight();
    const canInsertRowAbove = tableInfo.asc_getIsInsertRowAbove();
    const canInsertRowBelow = tableInfo.asc_getIsInsertRowBelow();
    const canDeleteColumn = tableInfo.asc_getIsDeleteColumn();
    const canDeleteRow = tableInfo.asc_getIsDeleteRow();
    const canDeleteTable = tableInfo.asc_getIsDeleteTable();

    return (
        <Page>
            <Navbar title={_t.textTable} />
            <List>
                <ListItem className='buttons'>
                    <div className="row">
                        <a className={'item-link button' + (!canInsertColumnLeft ? ' disabled' : '')} onClick={() => canInsertColumnLeft && props.onAddCell(Asc.c_oAscInsertOptions.InsertTableColLeft)}>
                            <SvgIcon slot="media" symbolId={IconTableAddColumnLeft.id} className={'icon icon-svg'} />
                        </a>
                        <a className={'item-link button' + (!canInsertColumnRight ? ' disabled' : '')} onClick={() => canInsertColumnRight && props.onAddCell(Asc.c_oAscInsertOptions.InsertTableColRight)}>
                            <SvgIcon slot="media" symbolId={IconTableAddColumnRight.id} className={'icon icon-svg'} />
                        </a>
                        <a className={'item-link button' + (!canInsertRowAbove ? ' disabled' : '')} onClick={() => canInsertRowAbove && props.onAddCell(Asc.c_oAscInsertOptions.InsertTableRowAbove)}>
                            <SvgIcon slot="media" symbolId={IconTableAddRowAbove.id} className={'icon icon-svg'} />
                        </a>
                        <a className={'item-link button' + (!canInsertRowBelow ? ' disabled' : '')} onClick={() => canInsertRowBelow && props.onAddCell(Asc.c_oAscInsertOptions.InsertTableRowBelow)}>
                            <SvgIcon slot="media" symbolId={IconTableAddRowBelow.id} className={'icon icon-svg'} />
                        </a>
                    </div>
                </ListItem>
                <ListItem className='buttons'>
                    <div className="row">
                        <a className={'item-link button' + (!canDeleteColumn ? ' disabled' : '')} onClick={() => canDeleteColumn && props.onRemoveCell(Asc.c_oAscDeleteOptions.DeleteColumns)}>
                            <SvgIcon slot="media" symbolId={IconTableRemoveColumn.id} className={'icon icon-svg'} />
                        </a>
                        <a className={'item-link button' + (!canDeleteRow ? ' disabled' : '')} onClick={() => canDeleteRow && props.onRemoveCell(Asc.c_oAscDeleteOptions.DeleteRows)}>
                            <SvgIcon slot="media" symbolId={IconTableRemoveRow.id} className={'icon icon-svg'} />
                        </a>
                    </div>
                </ListItem>
            </List>
            <List className="buttons-list">
                <ListButton title={_t.textDeleteTable} className={'button-red button-fill button-raised' + (!canDeleteTable ? ' disabled' : '')} onClick={() => canDeleteTable && props.onDeleteTable()}></ListButton>
            </List>
            <List>
                <ListItem title={_t.textStyle} link="/edit-table-style/" routeProps={{
                    onStyleSelect: props.onStyleSelect,
                    onToggleOption: props.onToggleOption
                }}></ListItem>
            </List>
        </Page>
    )
};

const PageStyle = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const tableInfo = props.storeFocusObjects.tableObject;
    const styleName = tableInfo ? tableInfo.asc_getTableStyleName() : null;

    const stylesList = useMemo(() => {
        if (!tableInfo) return [];
        const api = Common.EditorApi.get();
        return (api.asc_getTablePictures(tableInfo) || []).map(picture => ({
            name: picture.asc_getName(),
            displayName: picture.asc_getDisplayName(),
            type: picture.asc_getType(),
            image: picture.asc_getImage()
        }));
    }, [tableInfo, styleName]);

    return (
        <Page>
            <Navbar title={_t.textStyle} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ?
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem title={_t.textStyleOptions} link="/edit-table-style-options/" routeProps={{
                    onToggleOption: props.onToggleOption
                }} />
            </List>
            <div className={'table-styles dataview'}>
                <ul className="row">
                    {stylesList.map((style, index) => (
                        <li key={index} className={style.name === styleName ? 'active' : ''} onClick={() => props.onStyleSelect(style.name)}>
                            <img src={style.image} />
                        </li>
                    ))}
                </ul>
            </div>
        </Page>
    )
};

const PageStyleOptions = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const tableInfo = props.storeFocusObjects.tableObject;
    const onToggleOption = props.onToggleOption;

    const headerRow = tableInfo ? tableInfo.asc_getFirstRow() : false;
    const totalRow = tableInfo ? tableInfo.asc_getLastRow() : false;
    const bandedRows = tableInfo ? tableInfo.asc_getBandHor() : false;
    const firstColumn = tableInfo ? tableInfo.asc_getFirstCol() : false;
    const lastColumn = tableInfo ? tableInfo.asc_getLastCol() : false;
    const bandedColumns = tableInfo ? tableInfo.asc_getBandVer() : false;
    const filterButton = tableInfo ? tableInfo.asc_getFilterButton() : null;

    return (
        <Page>
            <Navbar title={_t.textStyleOptions} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                            {Device.ios ?
                                <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>
                    </NavRight>
                }
            </Navbar>
            <BlockTitle>{_t.textRow}</BlockTitle>
            <List>
                <ListItem title={_t.textHeaderRow}>
                    <Toggle checked={!!headerRow} onToggleChange={() => onToggleOption(Asc.c_oAscChangeTableStyleInfo.rowHeader, !headerRow)} />
                </ListItem>
                <ListItem title={_t.textTotalRow}>
                    <Toggle checked={!!totalRow} onToggleChange={() => onToggleOption(Asc.c_oAscChangeTableStyleInfo.rowTotal, !totalRow)} />
                </ListItem>
                <ListItem title={_t.textBandedRows}>
                    <Toggle checked={!!bandedRows} onToggleChange={() => onToggleOption(Asc.c_oAscChangeTableStyleInfo.rowBanded, !bandedRows)} />
                </ListItem>
            </List>
            <BlockTitle>{_t.textColumn}</BlockTitle>
            <List>
                <ListItem title={_t.textFirstColumn}>
                    <Toggle checked={!!firstColumn} onToggleChange={() => onToggleOption(Asc.c_oAscChangeTableStyleInfo.columnFirst, !firstColumn)} />
                </ListItem>
                <ListItem title={_t.textLastColumn}>
                    <Toggle checked={!!lastColumn} onToggleChange={() => onToggleOption(Asc.c_oAscChangeTableStyleInfo.columnLast, !lastColumn)} />
                </ListItem>
                <ListItem title={_t.textBandedColumns}>
                    <Toggle checked={!!bandedColumns} onToggleChange={() => onToggleOption(Asc.c_oAscChangeTableStyleInfo.columnBanded, !bandedColumns)} />
                </ListItem>
            </List>
            <List>
                <ListItem title={_t.textFilterButton} className={!headerRow ? 'disabled' : ''}>
                    <Toggle checked={!!filterButton} onToggleChange={() => onToggleOption(Asc.c_oAscChangeTableStyleInfo.filterButton, !filterButton)} />
                </ListItem>
            </List>
        </Page>
    )
};

const EditTableInjected = inject("storeFocusObjects")(observer(EditTable));
const PageTableStyle = inject("storeFocusObjects")(observer(PageStyle));
const PageTableStyleOptions = inject("storeFocusObjects")(observer(PageStyleOptions));

export default EditTableInjected;
export {PageTableStyle, PageTableStyleOptions};
