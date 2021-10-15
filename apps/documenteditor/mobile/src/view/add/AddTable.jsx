import React, {Fragment, useEffect, useState} from 'react';
import {observer, inject} from "mobx-react";
import { f7 } from 'framework7-react';
import {Page, Navbar, List, ListItem, ListButton, Row, SkeletonBlock, BlockTitle, Range, Toggle, Icon} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';

const AddTable = props => {

    const storeTableSettings = props.storeTableSettings;
    const styles = storeTableSettings.arrayStyles;
    const [stateLoaderSkeleton, setLoaderSkeleton] = useState(true);

    useEffect(() => {

        !styles.length ? setLoaderSkeleton(true) : setLoaderSkeleton(false);

    }, [styles]);

    return (
        <div className={'table-styles dataview'}>
            <ul className="row">
            {stateLoaderSkeleton ?
                Array.from({ length: 41 }).map((item,index) => (
                <li className='skeleton-list' key={index}>    
                    <SkeletonBlock  width='70px' height='8px'  effect='wave'/>
                    <SkeletonBlock  width='70px' height='8px'  effect='wave' />
                    <SkeletonBlock  width='70px' height='8px'  effect='wave' />
                    <SkeletonBlock  width='70px' height='8px'  effect='wave' />
                    <SkeletonBlock  width='70px' height='8px'  effect='wave' />
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


export default  inject("storeTableSettings")(observer(AddTable));