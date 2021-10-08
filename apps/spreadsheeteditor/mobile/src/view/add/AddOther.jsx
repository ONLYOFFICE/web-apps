import React from 'react';
import {List, ListItem, Icon} from 'framework7-react';
import { useTranslation } from 'react-i18next';

const AddOther = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const hideAddComment = props.hideAddComment();
    const wsPropsHyperlinks = props.wsPropsHyperlinks;
    const wsPropsObjects = props.wsPropsObjects;

    return (
        <List>
            <ListItem title={_t.textImage} className={wsPropsObjects && 'disabled'} link={'/add-image/'}>
                <Icon slot="media" icon="icon-insimage"></Icon>
            </ListItem>
            {(!hideAddComment && !wsPropsObjects) && <ListItem title={_t.textComment} onClick={() => {
                props.closeModal();
                Common.Notifications.trigger('addcomment');
            }}>
                <Icon slot="media" icon="icon-insert-comment"></Icon>
            </ListItem>}
            <ListItem title={_t.textSortAndFilter} className={wsPropsObjects && 'disabled'} link={'/add-sort-and-filter/'}>
                <Icon slot="media" icon="icon-sort"></Icon>
            </ListItem>
            <ListItem title={_t.textLink} className={wsPropsHyperlinks && 'disabled'} link={'/add-link/'}>
                <Icon slot="media" icon="icon-link"></Icon>
            </ListItem>
        </List>
    )
};

export {AddOther};