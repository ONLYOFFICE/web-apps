import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";

const AddChart = props => {
    const types = props.storeChartSettings.types;
    return (
        <div className={'dataview chart-types'}>
            {types.map((row, indexRow) => {
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
        </div>
    )
};

export default inject("storeChartSettings")(observer(AddChart));