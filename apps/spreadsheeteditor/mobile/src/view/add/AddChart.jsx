import React from 'react';
import {observer, inject} from "mobx-react";
import {Device} from "../../../../../common/mobile/utils/device";
import { Swiper, SwiperSlide } from 'swiper/react';

const AddChart = props => {
    const types = props.storeChartSettings.types;
    const countSlides = Math.floor(types.length / 3);
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
                                                            <div className={`thumb ${type.thumb}`}></div>
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
                                                            <div className={`thumb ${type.thumb}`}></div>
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