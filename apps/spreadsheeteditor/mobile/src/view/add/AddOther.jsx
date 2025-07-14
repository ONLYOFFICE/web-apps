import React, { useContext } from 'react';
import { inject, observer } from 'mobx-react';
import {List, ListItem, Icon} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { MainContext } from '../../page/main';
import { Device } from "../../../../../common/mobile/utils/device";
import SvgIcon from "../../../../../common/mobile/lib/component/SvgIcon";
import IconDraw from "../../../../../common/mobile/resources/icons/draw.svg";
import IconInsertCommentIos from '@common-ios-icons/icon-insert-comment.svg?ios';
import IconInsertCommentAndroid from '@common-android-icons/icon-insert-comment.svg';
import IconInsimageIos from '@ios-icons/icon-insimage.svg?ios';
import IconInsimageAndroid from '@android-icons/icon-insimage.svg';
import IconSort from '@icons/icon-sort.svg';
import IconLinkIos from '@common-ios-icons/icon-link.svg?ios';
import IconLinkAndroid from '@common-android-icons/icon-link.svg';

const AddOther = inject("storeFocusObjects", "storeAppOptions")(observer(props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const storeFocusObjects = props.storeFocusObjects;
    const storeAppOptions = props.storeAppOptions;
    const canModifyFilter = storeAppOptions.canModifyFilter;
    const canComments = storeAppOptions.canComments;
    const isHyperLink = storeFocusObjects.selections.indexOf('hyperlink') > -1;
    const hideAddComment = props.hideAddComment();
    const mainContext = useContext(MainContext);
    const wsProps = mainContext.wsProps;

    return (
        <List>
            <ListItem title={_t.textImage} className={wsProps.Objects && 'disabled'} link={'/add-image/'}>
                {Device.ios ? 
                    <SvgIcon slot="media" symbolId={IconInsimageIos.id} className={'icon icon-svg'} /> :
                    <SvgIcon slot="media" symbolId={IconInsimageAndroid.id} className={'icon icon-svg'} />
                }
            </ListItem>
            {(!hideAddComment && canComments && !wsProps.Objects) && <ListItem title={_t.textComment} onClick={() => {
                props.closeModal();
                Common.Notifications.trigger('addcomment');
            }}>
                {Device.ios ? 
                    <SvgIcon slot="media" symbolId={IconInsertCommentIos.id} className={'icon icon-svg'} /> :
                    <SvgIcon slot="media" symbolId={IconInsertCommentAndroid.id} className={'icon icon-svg'} />
                }
            </ListItem>}
            <ListItem title={_t.textSortAndFilter} className={wsProps.Sort || !canModifyFilter ? 'disabled' : ''} link={'/add-sort-and-filter/'}>
                <SvgIcon slot="media" symbolId={IconSort.id} className={'icon icon-svg'} />
            </ListItem>
            <ListItem title={_t.textLink} className={wsProps.InsertHyperlinks && 'disabled'} link={isHyperLink ? '/edit-link/' : '/add-link/'} routeProps={{
                isNavigate: true
            }}>
                {Device.ios ? 
                    <SvgIcon slot="media" symbolId={IconLinkIos.id} className={'icon icon-svg'} /> :
                    <SvgIcon slot="media" symbolId={IconLinkAndroid.id} className={'icon icon-svg'} />
                }
            </ListItem>
            <ListItem key='drawing' title={_t.textDrawing} onClick={() => {
              props.closeModal();
              Common.Notifications.trigger('draw:start');
            }}>
              <SvgIcon slot='media' symbolId={IconDraw.id} className='icon icon-svg'/>
            </ListItem>
        </List>
    )
}));

export {AddOther};