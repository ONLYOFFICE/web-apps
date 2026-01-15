import React, {Fragment, useState} from 'react';
import {observer, inject} from "mobx-react";
import {f7, Page, Navbar, NavRight, List, ListItem, BlockTitle, Icon, ListInput, ListButton, Link} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import {Device} from '../../../../../common/mobile/utils/device';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconExpandDownIos from '@common-ios-icons/icon-expand-down.svg?ios';
import IconExpandDownAndroid from '@common-android-icons/icon-expand-down.svg';
import IconMoveForeground from '@common-icons/icon-move-foreground.svg';
import IconMoveBackground from '@common-icons/icon-move-background.svg';
import IconMoveForward from '@common-icons/icon-move-forward.svg';
import IconMoveBackward from '@common-icons/icon-move-backward.svg';
import IconImageLibraryIos from '@common-ios-icons/icon-image-library.svg?ios';
import IconImageLibraryAndroid from '@common-android-icons/icon-image-library.svg';
import IconLinkIos from '@common-ios-icons/icon-link.svg?ios';
import IconLinkAndroid from '@common-android-icons/icon-link.svg';

const EditImage = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const storeFocusObjects = props.storeFocusObjects;
    const imageObject = storeFocusObjects.imageObject;
    const pluginGuid = imageObject.asc_getPluginGuid();

    return (
        <Fragment>
            <List>
                <ListItem title={t('View.Edit.textReplaceImage')} link="/edit-replace-image/" className={pluginGuid ? 'disabled' : ''} routeProps={{
                    onReplaceByFile: props.onReplaceByFile,
                    onReplaceByUrl: props.onReplaceByUrl
                }}></ListItem>
                <ListItem title={t('View.Edit.textArrange')} link="/edit-reorder-image/" routeProps={{
                    onReorder: props.onReorder
                }}></ListItem>
            </List>
            <List className="buttons-list">
                <ListButton className="button-fill button-raised" onClick={props.onDefaultSize}>{_t.textActualSize}</ListButton>
                <ListButton className="button-red button-fill button-raised" onClick={props.onRemoveImage}>{t('View.Edit.textDeleteImage')}</ListButton>
            </List>
        </Fragment>
    )
};

const PageReorder = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    const storeFocusObjects = props.storeFocusObjects;
    if ((!storeFocusObjects.imageObject || storeFocusObjects.focusOn === 'cell') && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page>
            <Navbar title={t('View.Edit.textArrange')} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                        {Device.ios ? 
                            <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                            <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                        }</Link>
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem title={_t.textBringToForeground} link='#' onClick={() => {props.onReorder('all-up')}} className='no-indicator'>
                    <SvgIcon slot="media" symbolId={IconMoveForeground.id} className={'icon icon-svg'} /> 
                </ListItem>
                <ListItem title={_t.textSendToBackground} link='#' onClick={() => {props.onReorder('all-down')}} className='no-indicator'>
                    <SvgIcon slot="media" symbolId={IconMoveBackground.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title={_t.textMoveForward} link='#' onClick={() => {props.onReorder('move-up')}} className='no-indicator'>
                    <SvgIcon slot="media" symbolId={IconMoveForward.id} className={'icon icon-svg'} />
                </ListItem>
                <ListItem title={_t.textMoveBackward} link='#' onClick={() => {props.onReorder('move-down')}} className='no-indicator'>
                    <SvgIcon slot="media" symbolId={IconMoveBackward.id} className={'icon icon-svg'} />
                </ListItem>
            </List>
        </Page>
    )
};


const PageReplace = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});

    const storeFocusObjects = props.storeFocusObjects;
    if ((!storeFocusObjects.imageObject || storeFocusObjects.focusOn === 'cell') && Device.phone) {
        $$('.sheet-modal.modal-in').length > 0 && f7.sheet.close();
        return null;
    }

    return (
        <Page className="images">
            <Navbar title={_t.textReplace} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        {Device.ios ? 
                            <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                            <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                        }
                    </NavRight>
                }
            </Navbar>
            <List>
                <ListItem title={_t.textPictureFromLibrary} onClick={() => {props.onReplaceByFile()}}>
                    {Device.ios ? 
                        <SvgIcon slot="media" symbolId={IconImageLibraryIos.id} className={'icon icon-svg'} /> :
                        <SvgIcon slot="media" symbolId={IconImageLibraryAndroid.id} className={'icon icon-svg'} />
                    }
                </ListItem>
                <ListItem title={_t.textPictureFromURL} link='/edit-image-link/' routeProps={{
                    onReplaceByUrl: props.onReplaceByUrl
                }}>
                   {Device.ios ?
                        <SvgIcon slot="media" symbolId={IconLinkIos.id} className={'icon icon-svg'} /> :
                        <SvgIcon slot="media" symbolId={IconLinkAndroid.id} className={'icon icon-svg'} />
                    }
                </ListItem>
            </List>
        </Page>
    )
};

const PageLinkSettings = props => {
    const { t } = useTranslation();
    const _t = t('View.Edit', {returnObjects: true});
    const [stateValue, setValue] = useState('');

    const onReplace = () => {
        if (stateValue.trim().length > 0) {
            if ((/((^https?)|(^ftp)):\/\/.+/i.test(stateValue))) {
                props.onReplaceByUrl(stateValue.trim());
            } else {
                f7.dialog.alert(_t.textNotUrl, _t.notcriticalErrorTitle);
            }
        } else {
            f7.dialog.alert(_t.textEmptyImgUrl, _t.notcriticalErrorTitle);
        }
    };
    return (
        <Page>
            <Navbar title={_t.textLinkSettings} backLink={_t.textBack}>
                {Device.phone &&
                    <NavRight>
                        <Link sheetClose>
                        {Device.ios ? 
                            <SvgIcon symbolId={IconExpandDownIos.id} className={'icon icon-svg'} /> :
                            <SvgIcon symbolId={IconExpandDownAndroid.id} className={'icon icon-svg'} />
                        }</Link>
                    </NavRight>
                }
            </Navbar>
            <BlockTitle>{_t.textAddress}</BlockTitle>
            <List>
                <ListInput
                    type='text'
                    placeholder={_t.textImageURL}
                    value={stateValue}
                    onChange={(event) => {setValue(event.target.value)}}
                >
                </ListInput>
            </List>
            <List>
                <ListButton className={'button-fill button-raised' + (stateValue.length < 1 ? ' disabled' : '')} title={_t.textReplaceImage} onClick={() => {onReplace()}}></ListButton>
            </List>
        </Page>
    )
};

const EditImageContainer = inject("storeFocusObjects")(observer(EditImage));
const PageReplaceContainer = inject("storeFocusObjects")(observer(PageReplace));
const PageReorderContainer = inject("storeFocusObjects")(observer(PageReorder));
const PageLinkSettingsContainer = inject("storeFocusObjects")(observer(PageLinkSettings));

export {
    EditImageContainer as EditImage,
    PageReplaceContainer as PageImageReplace,
    PageReorderContainer as PageImageReorder,
    PageLinkSettingsContainer as PageLinkSettings
}