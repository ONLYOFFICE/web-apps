import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {Page, Navbar, List, ListItem, ListButton, Row, BlockTitle,SkeletonBlock, Range, Toggle, Icon} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';

const AddTable = props => {
    const storeTableSettings = props.storeTableSettings;
    const styles = storeTableSettings.arrayStylesDefault;

    return (
        <div className={'table-styles dataview'}>
            <ul className="row">
                {!styles.length ?
                    Array.from({ length: 70 }).map((item,index) => (
                    <li className='skeleton-list' key={index}>    
                        <SkeletonBlock width='70px' height='8px' effect="fade" />
                        <SkeletonBlock width='70px' height='8px' effect="fade" />
                        <SkeletonBlock width='70px' height='8px' effect="fade" />
                        <SkeletonBlock width='70px' height='8px' effect="fade" />
                        <SkeletonBlock width='70px' height='8px' effect="fade" />
                    </li>
                    )) :
                        styles.map((style, index) => {
                            return (
                                <li key={index}
                                    onClick={() => {props.onStyleClick(style.templateId)}}>
                                    <img src={style.imageUrl}/>
                                </li>
                            )
                        })
                }
            </ul>
        </div>
    )
};

export default inject("storeTableSettings")(observer(AddTable));