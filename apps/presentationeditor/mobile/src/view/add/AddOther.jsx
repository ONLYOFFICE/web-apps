import React, {useState} from 'react';
import {observer, inject} from "mobx-react";
import {List, ListItem, Page, Navbar, Icon, ListButton, ListInput, BlockTitle, Segmented, Button} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from "../../../../../common/mobile/utils/device";

const PageTable = props => {
    props.initStyleTable();
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const storeTableSettings = props.storeTableSettings;
    const styles = storeTableSettings.styles;
    return (
        <Page id={'add-table'}>
            <Navbar title={_t.textTable} backLink={_t.textBack}/>
            <div className={'table-styles dataview'}>
                <ul className="row">
                    {styles.map((style, index) => {
                        return (
                            <li key={index}
                                onClick={() => {props.onStyleClick(style.templateId)}}>
                                <img src={style.imageUrl}/>
                            </li>
                        )
                    })}
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
    return (
        <List>
            <ListItem title={_t.textTable} link={'/add-table/'} routeProps={{
                onStyleClick: props.onStyleClick,
                initStyleTable: props.initStyleTable
            }}>
                <Icon slot="media" icon="icon-add-table"></Icon>
            </ListItem>
            {!hideAddComment && <ListItem title={_t.textComment} onClick={() => {
                props.closeModal();
                Common.Notifications.trigger('addcomment');
            }}>
                <Icon slot="media" icon="icon-insert-comment"></Icon>
            </ListItem>}
            {showInsertLink &&
                <ListItem title={_t.textLink} link={'/add-link/'}>
                    <Icon slot="media" icon="icon-link"></Icon>
                </ListItem>
            }
        </List>
    )
};

const PageAddTable = inject("storeTableSettings")(observer(PageTable));
const AddOtherContainer = inject("storeFocusObjects", "storeLinkSettings")(observer(AddOther));

export {AddOtherContainer as AddOther,
        PageAddTable};