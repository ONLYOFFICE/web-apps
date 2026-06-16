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

import React from 'react';
import {f7, List, Popover, Sheet, ListItem, Icon, ListButton, Page, Navbar, NavRight, Link, View} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from '../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";
import SvgIcon from '@common/lib/component/SvgIcon';
import IconSortdown from '@icons/icon-sortdown.svg';
import IconSortup  from '@icons/icon-sortup.svg';
import IconExpandDownIos from '@common-ios-icons/icon-expand-down.svg?ios';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';

const FilterOptions = inject('storeAppOptions')(observer(props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeAppOptions = props.storeAppOptions;
    const canModifyFilter = storeAppOptions.canModifyFilter;
    let is_all_checked = props.listVal.every(item => item.check);

    const HandleClearFilter = () => {
        is_all_checked = true;
        props.onClearFilter();
        props.onUpdateCell('all', true);
    };

    const onValidChecked = () => {
        if ( props.listVal.every(item => !item.check) ) {
            f7.dialog.create({
                title: _t.textErrorTitle,
                text: _t.textErrorMsg,
                buttons: [
                    { text: _t.textOk }
                ]
            }).open();
        }
    };

    return (
        <View style={props.style}>
            <Page>
                <Navbar title={_t.textFilterOptions}>
                    {Device.phone &&
                        <NavRight>
                            <Link sheetClose=".picker__sheet">
                                {Device.ios ? 
                                    <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                                    <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                                }
                            </Link>
                        </NavRight>
                    }
                </Navbar>
                <List>
                    <ListItem className='buttons'>
                        <div className="row">
                            <a className={'button' + (props.checkSort === 'down' ? ' active' : '')} onClick={() => {
                                props.onSort('sortdown');
                                onValidChecked();
                            }}>
                                <SvgIcon slot="media" symbolId={IconSortdown.id} className={'icon icon-svg'} />
                            </a>
                            <a className={'button' + (props.checkSort === 'up' ? ' active' : '')} onClick={() => {
                                props.onSort('sortup');
                                onValidChecked();
                            }}>
                                <SvgIcon slot="media" symbolId={IconSortup.id} className={'icon icon-svg'} />
                            </a>
                        </div>
                    </ListItem>
                </List>
                <List>
                    <ListButton className={props.isValid || is_all_checked ? 'disabled' : ''}
                                onClick={HandleClearFilter}>{_t.textClearFilter}</ListButton>
                    <ListButton color="red" className={!canModifyFilter ? 'disabled' : ''}
                                onClick={() => props.onDeleteFilter()}
                                id="btn-delete-filter">{_t.textDeleteFilter}</ListButton>
                </List>
                <List>
                    <ListItem className='radio-checkbox-item' onChange={e => {
                        props.onUpdateCell('all', e.target.checked);
                        onValidChecked();
                    }} name='filter-cellAll' checkbox checked={is_all_checked}>{_t.textSelectAll}</ListItem>
                    {props.listVal.map((value) =>
                        <ListItem className='radio-checkbox-item' onChange={e => {
                            props.onUpdateCell(value.id, e.target.checked);
                            onValidChecked();
                        }} key={value.value} name='filter-cell' value={value.value} title={value.cellvalue} checkbox
                                  checked={value.check}/>
                    )}
                </List>
            </Page>
        </View>
    )
}));

const FilterView = (props) => {
    return (
        !Device.phone ?
            <Popover id="picker-popover" className="popover__titled popover-filter">
                <FilterOptions style={{height: '410px'}} {...props}></FilterOptions>
            </Popover> :
            <Sheet className="picker__sheet sheet-filter">
                <FilterOptions  {...props}></FilterOptions>
            </Sheet>
    )
}

export default FilterView;
