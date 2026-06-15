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
import {observer, inject} from "mobx-react";
import {Device} from "../../../../../common/mobile/utils/device";
import { Swiper, SwiperSlide } from 'swiper/react';
import SvgIcon from '@common/lib/component/SvgIcon';

const AddChart = props => {
    const types = props.storeChartSettings.types;
    const countSlides = Math.ceil(types.length / 3);
    const arraySlides = !Device.phone ? Array(countSlides).fill(countSlides) : [types.slice(0, 6), types.slice(6)];
    
    return (
        <div className={'dataview chart-types'}>
            {types && types.length ? (
                <Swiper pagination={true}>
                    {Device.phone ?
                        arraySlides.map((typesSlide, indexSlide) => {
                            return (
                                <SwiperSlide key={indexSlide}>
                                    {typesSlide.map((row, indexRow) => {
                                        return (
                                            <ul className="row" key={`row-${indexRow}`}>
                                                {row.map((type, index) => {
                                                    return (
                                                        <li key={`${indexRow}-${index}`}
                                                            onClick={() => {
                                                                props.onInsertChart(type.type)
                                                            }}>
                                                            <div className={'thumb'}>
                                                                <SvgIcon symbolId={type.thumb} className={'thumb-icon'} />
                                                            </div>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        )
                                    })}
                                </SwiperSlide>
                            )
                        })
                        :
                        arraySlides.map((_, indexSlide) => {
                            let typesSlide = types.slice(indexSlide * 3, (indexSlide * 3) + 3);

                            return (
                                <SwiperSlide key={indexSlide}>
                                    {typesSlide.map((row, indexRow) => {
                                        return (
                                            <ul className="row" key={`row-${indexRow}`}>
                                                {row.map((type, index) => {
                                                    return (
                                                        <li key={`${indexRow}-${index}`}
                                                            onClick={() => {
                                                                props.onInsertChart(type.type)
                                                            }}>
                                                            <div className={'thumb'}>
                                                                <SvgIcon symbolId={type.thumb} className={'thumb-icon'} />
                                                            </div>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        )
                                    })}
                                </SwiperSlide>
                            )
                        })}
                </Swiper>
            ) : null}
        </div>
    )
};

export default inject("storeChartSettings")(observer(AddChart));
