import React, {useState} from 'react';
import {observer, inject} from "mobx-react";
import {List, ListItem, Page, Navbar, Icon, ListButton, ListInput, BlockTitle, SkeletonBlock, Segmented, Button} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from "../../../../../common/mobile/utils/device";
import SvgIcon from "../../../../../common/mobile/lib/component/SvgIcon";
import IconDraw from "../../../../../common/mobile/resources/icons/draw.svg";

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
                <Icon slot="media" icon="icon-add-table"></Icon>
            </ListItem>
            {!hideAddComment && <ListItem title={_t.textComment} onClick={() => {
                props.closeModal();
                Common.Notifications.trigger('addcomment');
            }}>
                <Icon slot="media" icon="icon-insert-comment"></Icon>
            </ListItem>}
            <ListItem title={_t.textImage} link='/add-image/'>
                <Icon slot="media" icon="icon-image"></Icon>
            </ListItem>
            {showInsertLink &&
                <ListItem title={_t.textLink} link={isHyperLink ? '/edit-link/' : '/add-link/'} routeProps={{
                    onClosed: props.onCloseLinkSettings,
                    isNavigate: true
                }}>
                    <Icon slot="media" icon="icon-link"></Icon>
                </ListItem>
            }
          <ListItem key='drawing' title={_t.textDrawing} onClick={() => {
            props.closeModal();
            Common.Notifications.trigger('draw:start');
          }}>
            <SvgIcon slot='media' symbolId={IconDraw.id} className='icon icon-svg'/>
          </ListItem>
        </List>
    )
};

const PageAddTable = inject("storeTableSettings")(observer(PageTable));
const AddOtherContainer = inject("storeFocusObjects", "storeLinkSettings")(observer(AddOther));

export {AddOtherContainer as AddOther,
        PageAddTable};