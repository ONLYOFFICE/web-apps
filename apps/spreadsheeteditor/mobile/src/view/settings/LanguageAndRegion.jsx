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

import React from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle, Icon } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageLanguageAndRegion = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });

    const appOptions = props.storeAppOptions;
    const _isEdit = appOptions.isEdit;

    const storeApplicationSettings = props.storeApplicationSettings;
    const formulaLang = storeApplicationSettings.formulaLang;
    const formulaLangsColection = storeApplicationSettings.formulaLangsColection;
    const defineFormulaLang = (lang) => formulaLangsColection.find(obj => obj.value === lang);
    let currentFormulaLang = defineFormulaLang(formulaLang);
    if (!currentFormulaLang) {
        storeApplicationSettings.changeFormulaLang('en');
        currentFormulaLang = defineFormulaLang('en');
    }
    const regData = storeApplicationSettings.regData;
    const regCode = storeApplicationSettings.regCode;
    const regExample = storeApplicationSettings.regExample;
    const defineRegSetting = () => regData.find(obj => regCode === obj.code);
    const currentRegSetting = defineRegSetting();

    return (
        <Page>
            <Navbar title={_t.textLanguageAndRegion} backLink={_t.textBack} />
            {_isEdit &&
                <>
                    <BlockTitle>{_t.textFormulaLanguage}</BlockTitle>
                    <List mediaList>
                        <ListItem title={currentFormulaLang.displayValue} subtitle={`${t('View.Settings.textExample')}: ${currentFormulaLang.exampleValue}`} link="/formula-languages/" 
                            routeProps={{
                                onFormulaLangChange: props.onFormulaLangChange
                            }}>
                        </ListItem>
                    </List>
                    <BlockTitle>{_t.textRegionalSettings}</BlockTitle>
                    <List mediaList>
                        <ListItem title={currentRegSetting.displayName} subtitle={`${t('View.Settings.textExample')}: ${regExample}`} link="/regional-settings/" routeProps={{
                            onRegSettings: props.onRegSettings
                        }}></ListItem>
                    </List>
                </>
            }
        </Page>
    );
};

const PageRegionalSettings = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const storeApplicationSettings = props.storeApplicationSettings;
    const regData = storeApplicationSettings.regData;
    const regCode = storeApplicationSettings.regCode;
    
    return (
        <Page className="regional-settings">
            <Navbar title={_t.textRegionalSettings} backLink={_t.textBack} />
            <List>
                {regData.length ? regData.map((elem, index) => {
                    return (
                        <ListItem key={index} radio checked={elem.code === regCode} onChange={() => {
                            storeApplicationSettings.changeRegCode(elem.code);
                            props.onRegSettings(elem.code);
                        }}>
                            <div className="item-title-row">
                                <Icon slot="media" icon={`lang-flag ${elem.langName}`}></Icon>
                                <div className="item-title">{elem.displayName}</div>
                            </div> 
                        </ListItem>
                    )
                }) : null}
            </List>
        </Page>
    )
}

const PageFormulaLanguage = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const storeApplicationSettings = props.storeApplicationSettings;
    const formulaLangsColection = storeApplicationSettings.formulaLangsColection;
    const formulaLang = storeApplicationSettings.formulaLang;

    return (
        <Page>
            <Navbar title={_t.textFormulaLanguage} backLink={_t.textBack} />
            <List mediaList>
                {formulaLangsColection.map((elem, index) => {
                    return (
                        <ListItem radio key={index} title={elem.displayValue} subtitle={`${t('View.Settings.textExample')}: ${elem.exampleValue}`} checked={elem.value === formulaLang}
                            onChange={() => {
                                storeApplicationSettings.changeFormulaLang(elem.value);
                                props.onFormulaLangChange(elem.value);
                            }}>
                        </ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const RegionalSettings = inject("storeApplicationSettings")(observer(PageRegionalSettings));
const FormulaLanguage = inject("storeApplicationSettings")(observer(PageFormulaLanguage));
const LanguageAndRegion = inject("storeApplicationSettings", "storeAppOptions")(observer(PageLanguageAndRegion));

export {LanguageAndRegion, FormulaLanguage, RegionalSettings};