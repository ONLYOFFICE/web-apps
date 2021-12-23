import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {Swiper, SwiperSlide} from 'framework7-react';

const AddChart = props => {
    const types = props.storeChartSettings.types;
    const countSlides = Math.floor(types.length / 3);
    const arraySlides = Array(countSlides).fill(countSlides);
    
    return (
        <div className={'dataview chart-types'}>
            {types && types.length ? (
                <Swiper pagination={true}>
                    {arraySlides.map((_, indexSlide) => {
                        let typesSlide = types.slice(indexSlide * 3, (indexSlide * 3) + 3);

                        return (
                            <SwiperSlide key={indexSlide}>
                                {typesSlide.map((row, indexRow) => {
                                    return (
                                        <ul className="row" key={`row-${indexRow}`}>
                                            {row.map((type, index) => {
                                                return (
                                                    <li key={`${indexRow}-${index}`}
                                                        onClick={()=>{props.onInsertChart(type.type)}}>
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