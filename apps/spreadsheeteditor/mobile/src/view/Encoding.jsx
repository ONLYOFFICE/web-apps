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

import React, {Component, useEffect, useState} from 'react';
import { f7, Page, Navbar, List, ListItem, BlockTitle, ListButton, Popover, Popup, View, Link } from "framework7-react";
import { useTranslation } from "react-i18next";
import { Device } from '../../../../common/mobile/utils/device';

const PageEncoding = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const encodeData = props.encodeData;
    const valuesDelimeter = props.valuesDelimeter;
    const namesDelimeter = props.namesDelimeter;
    const [stateEncoding, setStateEncoding] = useState(props.valueEncoding === -1 ? encodeData.find(encoding => encoding.lcid === 65001).value : props.valueEncoding);
    const [stateDelimeter, setStateDelimeter] = useState(props.valueDelimeter);
    const getIndexNameEncoding = () => encodeData.findIndex(encoding => encoding.value === stateEncoding);
    const nameEncoding = encodeData[getIndexNameEncoding()].displayValue;
    const nameDelimeter = namesDelimeter[valuesDelimeter.indexOf(stateDelimeter)];
    const mode = props.mode;

    const changeStateEncoding = value => {
        setStateEncoding(value);
    }

    const changeStateDelimeter = value => {
        setStateDelimeter(value);
    }

    return (
        <View style={props.style} routes={routes}>
            <Page>
                <Navbar title={_t.textChooseCsvOptions} />
                <BlockTitle>{_t.textDelimeter}</BlockTitle>
                <List>
                    <ListItem title={nameDelimeter} link="/delimeter-list/" routeProps={{
                        stateDelimeter,
                        namesDelimeter: props.namesDelimeter,
                        valuesDelimeter: props.valuesDelimeter,
                        changeStateDelimeter
                    }}></ListItem>
                </List>
                <BlockTitle>{_t.textEncoding}</BlockTitle>
                <List>
                    <ListItem title={nameEncoding} link="/encoding-list/" routeProps={{
                        stateEncoding,
                        encodeData,
                        changeStateEncoding
                    }}></ListItem>
                </List>
                <List className="buttons-list">
                    {mode === 2 ? 
                        <ListButton className='button-fill button-raised' title={_t.textCancel} onClick={() => props.closeModal()}></ListButton>
                    : null}
                    <ListButton className='button-fill button-raised' title={mode === 2 ?_t.textDownload : _t.txtOk} onClick={() => props.onSaveFormat(stateEncoding, stateDelimeter)}></ListButton>
                </List>
            </Page>
        </View>
        
    )
};

const PageEncodingList = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const [currentEncoding, changeCurrentEncoding] = useState(props.stateEncoding);
    const encodeData = props.encodeData;
    
    return (
        <Page>
            <Navbar title={_t.txtDownloadCsv} backLink={_t.textBack} />
            <BlockTitle>{_t.textChooseEncoding}</BlockTitle>
            <List>
                {encodeData.map((encoding, index) => {
                    return (
                        <ListItem radio checked={currentEncoding === encoding.value} title={encoding.displayValue} key={index} value={encoding.value} after={encoding.lcid} onChange={() => {
                            changeCurrentEncoding(encoding.value);
                            props.changeStateEncoding(encoding.value);
                            f7.views.current.router.back();
                        }}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
};

const PageDelimeterList = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const [currentDelimeter, changeCurrentDelimeter] = useState(props.stateDelimeter);
    const namesDelimeter = props.namesDelimeter;
    const valuesDelimeter = props.valuesDelimeter;
    
    return (
        <Page>
            <Navbar title={_t.txtDownloadCsv} backLink={_t.textBack} />
            <BlockTitle>{_t.textChooseDelimeter}</BlockTitle>
            <List>
                {namesDelimeter.map((name, index) => {
                    return (
                        <ListItem radio checked={currentDelimeter === valuesDelimeter[index]} title={name} key={index} value={valuesDelimeter[index]} onChange={() => {
                            changeCurrentDelimeter(valuesDelimeter[index]);
                            props.changeStateDelimeter(valuesDelimeter[index]);
                            f7.views.current.router.back();
                        }}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
};

class EncodingView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Popup className="encoding-popup" closeByBackdropClick={false}>
                <PageEncoding 
                    onSaveFormat={this.props.onSaveFormat} 
                    closeModal={this.props.closeModal}
                    mode={this.props.mode}  
                    encodeData={this.props.encodeData}
                    namesDelimeter={this.props.namesDelimeter}
                    valueEncoding={this.props.valueEncoding}
                    valueDelimeter={this.props.valueDelimeter}
                    valuesDelimeter={this.props.valuesDelimeter}
                />
            </Popup>
        )
    }
}

const routes = [
    {
        path: '/encoding-list/',
        component: PageEncodingList
    },
    {
        path: '/delimeter-list/',
        component: PageDelimeterList
    }
];

const Encoding = props => {
    useEffect(() => {
        f7.popup.open('.encoding-popup');
       
        return () => {
        }
    });

    return (
        <EncodingView  
            closeModal={props.closeModal}
            onSaveFormat={props.onSaveFormat} 
            mode={props.mode}  
            encodeData={props.encodeData}
            namesDelimeter={props.namesDelimeter}
            valueEncoding={props.valueEncoding}
            valueDelimeter={props.valueDelimeter}
            valuesDelimeter={props.valuesDelimeter}
        />
    )
};

export {Encoding, PageEncodingList, PageDelimeterList}
