import React, {Fragment, useState} from 'react';
import {Page, Navbar, BlockTitle, List, ListItem, ListInput, ListButton, Icon} from 'framework7-react';
import { useTranslation } from 'react-i18next';
import { Device } from '../../../../../common/mobile/utils/device';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconImageLibraryIos from '@common-ios-icons/icon-image-library.svg?ios';
import IconImageLibraryAndroid from '@common-android-icons/icon-image-library.svg';
import IconLinkIos from '@common-ios-icons/icon-link.svg?ios';
import IconLinkAndroid from '@common-android-icons/icon-link.svg';

const AddImageList = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    return (
        <List>
            <ListItem title={_t.textPictureFromLibrary} onClick={() => {props.onInsertByFile()}}>
                {Device.ios ? 
                    <SvgIcon slot="media" symbolId={IconImageLibraryIos.id} className={'icon icon-svg'} /> :
                    <SvgIcon slot="media" symbolId={IconImageLibraryAndroid.id} className={'icon icon-svg'} />
                }
            </ListItem>
            <ListItem title={_t.textPictureFromURL} link={'/add-image-from-url/'} routeProps={{
                onInsertByUrl: props.onInsertByUrl
            }}>
                {Device.ios ?
                    <SvgIcon slot="media" symbolId={IconLinkIos.id} className={'icon icon-svg'} /> :
                    <SvgIcon slot="media" symbolId={IconLinkAndroid.id} className={'icon icon-svg'} />
                }
            </ListItem>
        </List>
    )
};

const PageLinkSettings = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    const [stateValue, setValue] = useState('');
    return (
        <Page>
            <Navbar title={t('View.Add.textPasteImageUrl')} backLink={_t.textBack}></Navbar>
            <BlockTitle>{_t.textAddress}</BlockTitle>
            <List className='add-image'>
                <ListInput
                    type='text'
                    placeholder={_t.textImageURL}
                    value={stateValue}
                    onChange={(event) => {setValue(event.target.value)}}
                >
                </ListInput>
            </List>
            <List className="buttons-list">
                <ListButton className={'button-fill button-raised' + (stateValue.length < 1 ? ' disabled' : '')}
                            title={_t.textInsertImage}
                            onClick={() => {props.onInsertByUrl(stateValue)}}></ListButton>
            </List>
        </Page>
    )
};

const AddImage = props => {
    const { t } = useTranslation();
    const _t = t('View.Add', {returnObjects: true});
    return (
        props.inTabs ?
            <AddImageList onInsertByFile={props.onInsertByFile} onInsertByUrl={ props.onInsertByUrl} /> :
            <Page>
                <Navbar title={_t.textImage} backLink={_t.textBack}/>
                <AddImageList onInsertByFile={props.onInsertByFile} onInsertByUrl={ props.onInsertByUrl} />
            </Page>
        )
};

export {AddImage, PageLinkSettings as PageImageLinkSettings};