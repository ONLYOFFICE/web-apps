import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";

const AddShape = props => {
    const shapes = props.storeShapeSettings.getStyleGroups();
    return (
        <div className={'dataview shapes'}>
            {shapes.map((row, indexRow) => {
                return (
                    <ul className="row" key={'shape-row-' + indexRow}>
                        {row.map((shape, index) => {
                            return (
                                <li key={'shape-' + indexRow + '-' + index} onClick={() => {props.onShapeClick(shape.type)}}>
                                    <div className="thumb"
                                         style={{WebkitMaskImage: `url('resources/img/shapes/${shape.thumb}')`}}>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )
            })}
        </div>
    )
};

export default inject("storeShapeSettings")(observer(AddShape));