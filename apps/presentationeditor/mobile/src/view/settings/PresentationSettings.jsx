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

import React, {useState} from "react";
import { observer, inject } from "mobx-react";
import { Page, Navbar, List, ListItem, BlockTitle, Toggle } from "framework7-react";
import { useTranslation } from "react-i18next";

const PagePresentationSettings = props => {
    const { t } = useTranslation();
    const _t = t("View.Settings", { returnObjects: true });
    const storePresentationSettings = props.storePresentationSettings;
    const slideSizeArr = storePresentationSettings.slideSizes;
    const slideSizeIndex = storePresentationSettings.slideSizeIndex;
    const slideOrientation = storePresentationSettings.slideOrientation;
    const isLoopSlideshow = storePresentationSettings.isLoopSlideshow;

    return (
        <Page>
            <Navbar title={_t.textPresentationSettings} backLink={_t.textBack} />
            <BlockTitle>{_t.textSlideSize}</BlockTitle>
            <List>
                <ListItem radio name="slide-size" checked={slideSizeIndex === 0} 
                    onChange={() => props.onSlideSize(slideSizeArr[0])} title={_t.mniSlideStandard}></ListItem>
                <ListItem radio name="slide-size" checked={slideSizeIndex === 1}
                    onChange={() => props.onSlideSize(slideSizeArr[1])} title={_t.mniSlideWide}></ListItem>
            </List>
            <BlockTitle>{_t.textSlideOrientation}</BlockTitle>
            <List>
                <ListItem radio name="slide-orientation" checked={!slideOrientation}
                    onChange={() => props.onSlideOrientation()} title={_t.mniSlidePortrait}></ListItem>
                <ListItem radio name="slide-orientation" checked={slideOrientation}
                    onChange={() => props.onSlideOrientation()} title={_t.mniSlideLandscape}></ListItem>
            </List>
            <List mediaList>
                <ListItem title={_t.textColorSchemes} link="/color-schemes/" routeProps={{
                    onColorSchemeChange: props.onColorSchemeChange,
                    initPageColorSchemes: props.initPageColorSchemes
                }}></ListItem>
            </List>
            <List>
                <ListItem title={_t.textLoopSlideshow}>
                    <Toggle checked={isLoopSlideshow} onToggleChange={() => {props.onToggleLoopSlideshow(!isLoopSlideshow)}}/>
                </ListItem>
            </List>
        </Page>
    )
}

const PagePresentationColorSchemes = props => {
    const { t } = useTranslation();
    const curScheme = props.initPageColorSchemes();
    const [stateScheme, setScheme] = useState(curScheme);
    const storePresentationSettings = props.storePresentationSettings;
    const allSchemes = storePresentationSettings.allSchemes;

    return (
        <Page>
            <Navbar title={t('View.Settings.textColorSchemes')} backLink={t('View.Settings.textBack')} />
            <List>
                {
                    allSchemes ? allSchemes.map((scheme, index) => {
                        return (
                            <ListItem radio={true} className="color-schemes-menu no-fastclick" key={index} title={scheme.get_name()} checked={stateScheme === index}
                                onChange={() => {
                                    setScheme(index);
                                    setTimeout(() => props.onColorSchemeChange(index), 10);
                            }}>
                                <div slot="before-title">
                                    <span className="color-schema-block">
                                        {
                                            scheme.get_colors().map((elem, index) => {
                                                if(index >=2 && index < 7) {
                                                    let clr = {background: "#" + Common.Utils.ThemeColor.getHexColor(elem.get_r(), elem.get_g(), elem.get_b())};
                                                    return (
                                                        <span className="color" key={index} style={clr}></span>
                                                    )
                                                }
                                            })
                                        }
                                       
                                    </span>
                                </div>
                            </ListItem>
                        )
                    }) : null        
                }
            </List>
        </Page>

    )
};

const PresentationSettings = inject("storePresentationSettings")(observer(PagePresentationSettings));
const PresentationColorSchemes = inject("storePresentationSettings")(observer(PagePresentationColorSchemes));

export { PresentationSettings, PresentationColorSchemes }
