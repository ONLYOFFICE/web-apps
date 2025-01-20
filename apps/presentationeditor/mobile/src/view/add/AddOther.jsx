import React, {useState} from 'react';
import {observer, inject} from "mobx-react";
import {List, ListItem, Page, Navbar, Icon, ListButton, ListInput, BlockTitle, SkeletonBlock, Segmented, Button} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from "../../../../../common/mobile/utils/device";
import SvgIcon from '@common/lib/component/SvgIcon';
import IconAddTableIos from '@common-ios-icons/icon-add-table.svg';
import IconAddTableAndroid from '@common-android-icons/icon-add-table.svg';
import IconInsertCommentIos from '@common-ios-icons/icon-insert-comment.svg';
import IconInsertCommentAndroid from '@common-android-icons/icon-insert-comment.svg';
import IconImage from '@common-icons/icon-image.svg';
import IconLinkIos from '@common-ios-icons/icon-link.svg';
import IconLinkAndroid from '@common-android-icons/icon-link.svg';

const PageTable = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const storeTableSettings = props.storeTableSettings;
    const styles = storeTableSettings.arrayStylesDefault;

    return (
        <Page id={'add-table'}>
            <Navbar title={_t.textTable} backLink={_t.textBack}/>
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
        </Page>
    )
};

const AddOther = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const showInsertLink = props.storeLinkSettings.canAddLink && !props.storeFocusObjects.paragraphLocked;
    const hideAddComment = props.hideAddComment();
    const isHyperLink = props.storeFocusObjects.settings.indexOf('hyperlink') > -1;

    return (
        <List>
            <ListItem title={_t.textTable} link={'/add-table/'} onClick = {() => props.onGetTableStylesPreviews()} routeProps={{
                onStyleClick: props.onStyleClick,
            }}>
                {Device.ios ? 
                    <SvgIcon symbolId={IconAddTableIos} className={'icon icon-svg'} /> :
                    <SvgIcon symbolId={IconAddTableAndroid} className={'icon icon-svg'} />
                }
            </ListItem>
            {!hideAddComment && <ListItem title={_t.textComment} onClick={() => {
                props.closeModal();
                Common.Notifications.trigger('addcomment');
            }}>
                {Device.ios ? 
                    <SvgIcon symbolId={IconInsertCommentIos} className={'icon icon-svg'} /> :
                    <SvgIcon symbolId={IconInsertCommentAndroid} className={'icon icon-svg'} />
                }
            </ListItem>}
            <ListItem title={_t.textImage} link='/add-image/'>
                <SvgIcon symbolId={IconImage} className={'icon icon-svg'} />
            </ListItem>
            {showInsertLink &&
                <ListItem title={_t.textLink} link={isHyperLink ? '/edit-link/' : '/add-link/'} routeProps={{
                    onClosed: props.onCloseLinkSettings,
                    isNavigate: true
                }}>
                    {Device.ios ? 
                        <SvgIcon symbolId={IconLinkIos} className={'icon icon-svg'} /> :
                        <SvgIcon symbolId={IconLinkAndroid} className={'icon icon-svg'} />
                    }
                </ListItem>
            }
        </List>
    )
};

const PageAddTable = inject("storeTableSettings")(observer(PageTable));
const AddOtherContainer = inject("storeFocusObjects", "storeLinkSettings")(observer(AddOther));

export {AddOtherContainer as AddOther,
        PageAddTable};