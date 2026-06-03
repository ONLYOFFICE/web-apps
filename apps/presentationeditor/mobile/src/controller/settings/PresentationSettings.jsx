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
import { observer, inject } from "mobx-react";
import {PresentationSettings} from '../../view/settings/PresentationSettings';

class PresentationSettingsController extends Component {
    constructor(props) {
        super(props);
        this.initSlideSize = this.initSlideSize.bind(this);
        this.onSlideSize = this.onSlideSize.bind(this);
        this.onSlideOrientation = this.onSlideOrientation.bind(this);
        this.onColorSchemeChange = this.onColorSchemeChange.bind(this);
        this.onToggleLoopSlideshow = this.onToggleLoopSlideshow.bind(this);
        this.slideObject = this.props.storeFocusObjects.slideObject;
        this.props.storePresentationSettings.getLoopSlideshow(this.slideObject);
        this.initSlideSize();
    }

    initSlideSize() {
        if (!this.init) {
            const api = Common.EditorApi.get();
            const slideSizes = [
                [9144000, 6858000, Asc.c_oAscSlideSZType.SzScreen4x3], 
                [12192000, 6858000, Asc.c_oAscSlideSZType.SzCustom]
            ];

            this.props.storePresentationSettings.initSlideSizes(slideSizes);
            this.props.storePresentationSettings.changeSizeIndex(api.get_PresentationWidth(), api.get_PresentationHeight());
            this.init = true;
        }
    }

    onSlideSize(slideSizeArr) {
        const api = Common.EditorApi.get();

        let ratio = slideSizeArr[1] / slideSizeArr[0];
        let currentHeight = this.props.storePresentationSettings.currentPageSize.height;
        let currentPageSize = {
            width: this.props.storePresentationSettings.slideOrientation ? ((currentHeight || slideSizeArr[1]) / ratio) : ((currentHeight || slideSizeArr[1]) * ratio),
            height: currentHeight
        };
        // api.changeSlideSize(slideSizeArr[0], slideSizeArr[1], slideSizeArr[2]);
        api.changeSlideSize(currentPageSize.width, currentPageSize.height, slideSizeArr[2]);
    }

    onSlideOrientation() {
        const api = Common.EditorApi.get();
        api.changeSlideSize(this.props.storePresentationSettings.currentPageSize.height, this.props.storePresentationSettings.currentPageSize.width);
    }

    // Color Schemes

    initPageColorSchemes() {
        const api = Common.EditorApi.get();
        return api.asc_GetCurrentColorSchemeIndex();
    }

    onColorSchemeChange(newScheme) {
        const api = Common.EditorApi.get();
        api.asc_ChangeColorSchemeByIdx(newScheme);
        this.props.storeTableSettings.setStyles([], 'default');
    }

    onToggleLoopSlideshow(loop) {
        const api = Common.EditorApi.get();
        const props = new Asc.CAscSlideProps();
        const transition = new Asc.CAscSlideTransition();
        transition.put_ShowLoop(loop);
        props.put_transition(transition);
        api.SetSlideProps(props);
        this.props.storePresentationSettings.setLoopSlideshow(loop);
    }


    render() {
        return (
            <PresentationSettings
                initSlideSize={this.initSlideSize}
                onSlideSize={this.onSlideSize}
                onSlideOrientation={this.onSlideOrientation}
                onColorSchemeChange={this.onColorSchemeChange}
                initPageColorSchemes={this.initPageColorSchemes}
                onToggleLoopSlideshow={this.onToggleLoopSlideshow}
            />
        )
    }
}

export default inject("storePresentationSettings", "storeTableSettings", "storeFocusObjects")(observer(PresentationSettingsController));
