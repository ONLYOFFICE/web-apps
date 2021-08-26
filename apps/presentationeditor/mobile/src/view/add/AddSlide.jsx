import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {Page, Navbar, List, ListItem, ListButton, Row, BlockTitle, Range, Toggle, Icon} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';

const AddSlide = props => {
    const layouts = props.storeSlideSettings.slideLayouts;
    const [stateDisabled, setDisabled] = useState(false);
    return (
        <div className={'dataview slide-layout'}>
            {layouts.map((row, rowIndex) => {
                return (
                    <ul key={`row-${rowIndex}`} className={'row'}>
                        {row.map((layout, index) => {
                            return (
                                <li className = {stateDisabled ? 'disabled' : ''} key={`item-${rowIndex}-${index}`} 
                                    onClick={() => {props.onSlideLayout(layout.type); setDisabled(true)}}>
                                    <img src={layout.image} width={layout.width} height={layout.height}/>
                                </li>
                            )
                        })}
                    </ul>
                )
            })}
        </div>
    )
};

export default  inject("storeSlideSettings")(observer(AddSlide));