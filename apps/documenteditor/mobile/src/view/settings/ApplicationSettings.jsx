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

import React, { Fragment } from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle, Toggle, Block } from "framework7-react";
import { useTranslation } from "react-i18next";

const PageApplicationSettings = props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
    const storeThemes = props.storeThemes;
    const displayMode = props.storeReview.displayMode;
    const storeApplicationSettings = props.storeApplicationSettings;
    const unitMeasurement = storeApplicationSettings.unitMeasurement;
    const isSpellChecking = storeApplicationSettings.isSpellChecking;
    const isNonprintingCharacters = storeApplicationSettings.isNonprintingCharacters;
    const isHiddenTableBorders = storeApplicationSettings.isHiddenTableBorders;
    const isComments = storeApplicationSettings.isComments;
    const isResolvedComments = storeApplicationSettings.isResolvedComments;
    const directionMode = storeApplicationSettings.directionMode;
    const newDirectionMode = directionMode !== 'ltr' ? 'ltr' : 'rtl';

    const changeMeasureSettings = value => {
        storeApplicationSettings.changeUnitMeasurement(value);
        props.setUnitMeasurement(value);
    };

    // set mode
    const appOptions = props.storeAppOptions;
    const colorTheme = storeThemes.colorTheme;
    const themes = storeThemes.themes;
    const typeTheme = colorTheme.type;
    const isConfigSelectTheme = storeThemes.isConfigSelectTheme;
    const isViewer = appOptions.isViewer;
    const _isEdit = appOptions.isEdit;
    const _isShowMacros = (!appOptions.isDisconnected && appOptions.customization) ? appOptions.customization.macros !== false : true;

    return (
        <Page>
            <Navbar title={_t.textApplicationSettings} backLink={_t.textBack} />
            {_isEdit && !isViewer &&
                <>
                    <BlockTitle>{_t.textUnitOfMeasurement}</BlockTitle>
                    <List>
                        <ListItem radio radioIcon="end" title={_t.textCentimeter} name="unit-of-measurement" checked={unitMeasurement === 0}
                                  onChange={() => changeMeasureSettings(0)}></ListItem>
                        <ListItem radio radioIcon="end" title={_t.textPoint} name="unit-of-measurement" checked={unitMeasurement === 1}
                                  onChange={() => changeMeasureSettings(1)}></ListItem>
                        <ListItem radio radioIcon="end" title={_t.textInch} name="unit-of-measurement" checked={unitMeasurement === 2}
                                  onChange={() => changeMeasureSettings(2)}></ListItem>
                    </List>
                    <List>
                        <ListItem title={_t.textNoCharacters} disabled={displayMode !== 'markup'}>{/*ToDo: if (DisplayMode == "final" || DisplayMode == "original") {disabled} */}
                            <Toggle checked={isNonprintingCharacters}
                                    onToggleChange={() => {
                                        storeApplicationSettings.changeNoCharacters(!isNonprintingCharacters);
                                        props.switchNoCharacters(!isNonprintingCharacters);
                                    }}
                            />
                        </ListItem>
                        <ListItem title={_t.textHiddenTableBorders} disabled={displayMode !== 'markup'}>{/*ToDo: if (DisplayMode == "final" || DisplayMode == "original") {disabled} */}
                            <Toggle checked={isHiddenTableBorders}
                                    onToggleChange={() => {
                                        storeApplicationSettings.changeShowTableEmptyLine(!isHiddenTableBorders);
                                        props.switchShowTableEmptyLine(!isHiddenTableBorders);
                                    }}
                            />
                        </ListItem>
                    </List>
                </>
            }
            {_isEdit &&
                <List>
                    <ListItem title={_t.textSpellcheck}>
                        <Toggle checked={isSpellChecking}
                                onToggleChange={() => {
                                    storeApplicationSettings.changeSpellCheck(!isSpellChecking);
                                    props.switchSpellCheck(!isSpellChecking);
                                }}
                        />
                    </ListItem>
                </List>
            }
            <BlockTitle>{_t.textCommentsDisplay}</BlockTitle>
            <List>
                <ListItem title={_t.textComments}>
                    <Toggle checked={isComments}
                        onToggleChange={() => {
                            storeApplicationSettings.changeDisplayComments(!isComments);
                            props.switchDisplayComments(!isComments);
                        }}
                    />
                </ListItem>
                <ListItem title={_t.textResolvedComments}>
                    <Toggle checked={isResolvedComments} disabled={!isComments}
                        onToggleChange={() => {
                            storeApplicationSettings.changeDisplayResolved(!isResolvedComments);
                            props.switchDisplayResolved(!isResolvedComments);
                        }}
                    />
                </ListItem>
            </List>
            {!!isConfigSelectTheme &&
                <List mediaList>
                    <ListItem title={t("Common.Themes.textTheme")} after={themes[typeTheme].text} link="/theme-settings/" routeProps={{
                        changeTheme: props.changeTheme,
                    }}></ListItem>
                </List>
            }
            {_isShowMacros &&
                <List mediaList>
                    <ListItem title={_t.textMacrosSettings} link="/macros-settings/" routeProps={{
                        setMacrosSettings: props.setMacrosSettings
                    }}></ListItem>
                </List>
            }
        </Page>
    );
};

const PageThemeSettings = props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
    const storeThemes = props.storeThemes;
    const themes = storeThemes.themes;
    const colorTheme = storeThemes.colorTheme;
    const typeTheme = colorTheme.type;

    return (
        <Page>
            <Navbar title={t('Common.Themes.textTheme')} backLink={_t.textBack} />
            <List>
                {Object.keys(themes).map((key, index) => {
                    return (
                        <ListItem key={index} radio checked={typeTheme === themes[key].type} onChange={() => props.changeTheme(key)} name={themes[key].id} title={themes[key].text}></ListItem>
                    )
                })}
            </List>
        </Page>
    )
}

const PageMacrosSettings = props => {
    const { t } = useTranslation();
    const _t = t("Settings", { returnObjects: true });
    const storeApplicationSettings = props.storeApplicationSettings;
    const macrosMode = storeApplicationSettings.macrosMode;

    const changeMacros = value => {
        storeApplicationSettings.changeMacrosSettings(value);
        props.setMacrosSettings(value);
    };

    return (
        <Page>
            <Navbar title={_t.textMacrosSettings} backLink={_t.textBack} />
            <List mediaList>
                <ListItem radio name="macros-settings" title={_t.textDisableAll} text={_t.textDisableAllMacrosWithoutNotification} 
                    checked={macrosMode === 2} onChange={() => changeMacros(2)}></ListItem>
                <ListItem radio name="macros-settings" title={_t.textShowNotification} text={_t.textDisableAllMacrosWithNotification}
                    checked={macrosMode === 0} onChange={() => changeMacros(0)}></ListItem>
                <ListItem radio name="macros-settings" title={_t.textEnableAll} text={_t.textEnableAllMacrosWithoutNotification}
                    checked={macrosMode === 1} onChange={() => changeMacros(1)}></ListItem>
            </List>
        </Page>
    );
};

const ApplicationSettings = inject("storeApplicationSettings", "storeAppOptions", "storeReview", "storeThemes")(observer(PageApplicationSettings));
const MacrosSettings = inject("storeApplicationSettings")(observer(PageMacrosSettings));
const ThemeSettings = inject("storeThemes")(observer(PageThemeSettings));

export {ApplicationSettings, MacrosSettings, ThemeSettings};
