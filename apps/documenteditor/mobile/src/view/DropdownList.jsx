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

import React, { Component, useEffect, useState } from 'react';
import { f7, Page, Navbar, List, ListItem, Popover, View, Link, Sheet, Icon, NavRight, BlockTitle, NavLeft, Popup } from "framework7-react";
import { Device } from '../../../../common/mobile/utils/device';
import { useTranslation } from 'react-i18next';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconDone from '@common-android-icons/icon-done.svg';

const PageCustomOptionList = props => {
    const { t } = useTranslation();
    const [itemValue, setItemValue] = useState(props.enteredValue);

    return (
        <Page>
            <Navbar className='navbar-dropdown-list'>
                <NavLeft>
                    <Link text={t('Edit.textCancel')} onClick={() => {
                        f7.views.current.router.back();
                    }} />
                </NavLeft>
                <NavRight>
                    <Link text={t('Edit.textSave')} onClick={() => props.onAddItem(itemValue)} />
                </NavRight>
            </Navbar>
            <div className="custom-option-wrapper">
                <div className='wrap-textarea'>
                    <textarea autoFocus placeholder={t('Edit.textPlaceholder')} onChange={(e) => {setItemValue(e.target.value)}} value={itemValue}></textarea>
                </div>
            </div>
        </Page>
    )
}

const PageDropdownList = props => {
    const listItems = props.listItems;
    const curValue = props.curValue;
    const enteredValue = props.enteredValue;
    const { t } = useTranslation();

    const openDlgCustomOption = () => {
        f7.dialog.create({
            title: t('Edit.textYourOption'),
            content: `
                <div class="input-field dropdown-option">
                    <div class="inputs-list list inline-labels">
                        <ul>
                            <li>
                                <div class="item-content item-input">
                                    <div class="item-inner">
                                        <div class="item-input-wrap">
                                            <input type="text" id="custom-option-field" placeholder='${t('Edit.textPlaceholder')}' value='${enteredValue}'>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>`,
            on: {
                opened: () => {
                    const optionField = document.querySelector('#custom-option-field');
                    optionField.focus();
                }
            },
            buttons: [
                {
                    text: t('Edit.textCancel')
                },
                {
                    text: t('Edit.textSave'),
                    onClick: () => {
                        const itemValue = document.querySelector('#custom-option-field').value;
                        props.onAddItem(itemValue);
                    }
                }
            ]
        }).open();
    }

    const customOptionClickHandler = () => {
        if(Device.android) {
            openDlgCustomOption();
        } else {
            f7.views.current.router.navigate('/custom-option/', {
                props: {
                    onAddItem: props.onAddItem,
                    enteredValue
                }
            });
        }
    }

    return (
        <View style={props.style} routes={routes}>
            <Page>
                <Navbar title={t('Edit.textChooseAnOption')} className='navbar-dropdown-list'>
                    <NavRight>
                        <Link text={Device.ios ? t('Edit.textDone') : ''} onClick={props.closeModal}>
                            {Device.android && 
                                <SvgIcon slot="media" symbolId={IconDone.id} className={'icon icon-svg done'} />
                            }
                        </Link>
                    </NavRight>
                </Navbar>
                {props.isComboBox ?
                    <>
                        <List className="dropdown-list">
                            <ListItem radio radioIcon="end" checked={enteredValue.length} title={enteredValue || t('Edit.textEnterYourOption')} name="custom-option" onClick={customOptionClickHandler}></ListItem> 
                        </List>
                        <BlockTitle>{t('Edit.textChooseAnItem')}</BlockTitle>
                    </>
                : null}
                <List className="dropdown-list">
                    {listItems.length && listItems.map((item, index) => (
                        <ListItem radioIcon="end" radio checked={item.value === curValue && !enteredValue} key={index} name="dropdown-option" className={'no-indicator ' + (index === 0 ? 'dropdown-list__placeholder' : '')} title={item.caption} onClick={() => props.onChangeItemList(item.value)}></ListItem>
                    ))}
                </List>
            </Page>
        </View>
    );
};

const routes = [
    {
        path: '/custom-option/',
        component: PageCustomOptionList
    }
]

class DropdownListView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            Device.isPhone ? 
                <Popup id="dropdown-list-popup" className="dropdown-list-popup" closeByOutsideClick={true} swipeToClose={true} onPopupClosed={() => this.props.closeModal()}> 
                    <PageDropdownList
                        listItems={this.props.listItems}
                        onChangeItemList={this.props.onChangeItemList}
                        closeModal={this.props.closeModal}
                        isComboBox={this.props.isComboBox}
                        onAddItem={this.props.onAddItem}
                        curValue={this.props.curValue}
                        enteredValue={this.props.enteredValue}
                        style={{height: '260px'}}
                    />
                </Popup>
            : 
                <Popover id="dropdown-list-popover" className="popover__titled" closeByOutsideClick={true} onPopoverClosed={() => this.props.closeModal()}>
                    <PageDropdownList
                        listItems={this.props.listItems}
                        onChangeItemList={this.props.onChangeItemList}
                        closeModal={this.props.closeModal}
                        isComboBox={this.props.isComboBox}
                        onAddItem={this.props.onAddItem}
                        curValue={this.props.curValue}
                        enteredValue={this.props.enteredValue}
                        style={{height: '410px'}}
                    />
                </Popover>
            
        );
    }
}


const DropdownList = props => {
    useEffect(() => {
        if(Device.isPhone) {
            f7.popup.open('#dropdown-list-popup', true);
        } else {
            f7.popover.open('#dropdown-list-popover', '#dropdown-list-target');
        }
    
        return () => {}
    });

    return (
        <DropdownListView 
            listItems={props.listItems}
            onChangeItemList={props.onChangeItemList}
            closeModal={props.closeModal}
            isComboBox={props.isComboBox}
            onAddItem={props.onAddItem}
            curValue={props.curValue}
            enteredValue={props.enteredValue}
        />
    );
};

export default DropdownList;
