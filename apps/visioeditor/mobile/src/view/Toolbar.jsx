import React, {Fragment, useEffect } from 'react';
import {NavLeft, NavRight, Link} from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device';
import { useTranslation } from 'react-i18next';
import SvgIcon from '@common/lib/component/SvgIcon'
import IconSwitchToDesktop from '@common/resources/icons/switch-desktop.svg'
import IconReturnIos from '@common-ios-icons/icon-return.svg?ios';
import IconReturnAndroid from '@common-android-icons/icon-return.svg';
import IconSettingsIos from '@common-ios-icons/icon-settings.svg?ios';
import IconSettingsAndroid from '@common-android-icons/icon-settings.svg';

const ToolbarView = props => {
    const { t } = useTranslation();
    const isDisconnected = props.isDisconnected;
    const docTitle = props.docTitle;
    const isOpenModal = props.isOpenModal;

    useEffect(() => {
        if ( $$('.skl-container').length ) {
            $$('.skl-container').remove();
        }

        return () => {
        }
    }, []);

    return (
        <Fragment>
            <NavLeft>
                {(props.isShowBack) && <Link iconOnly className={`btn-doc-back${(props.disabledControls || isOpenModal) && ' disabled'}`} onClick={() => Common.Notifications.trigger('goback')}>
                {Device.ios ? 
                    <SvgIcon slot="media" symbolId={IconReturnIos.id} className={'icon icon-svg'} /> :
                    <SvgIcon slot="media" symbolId={IconReturnAndroid.id} className={'icon icon-svg'} />
                }</Link>}
            </NavLeft>
            {(!Device.phone  && !props.isHiddenFileName) &&
                <div className='title' onClick={() => props.changeTitleHandler()} style={{width: '71%'}}>
                    {docTitle}
                </div>
            }
            <NavRight>
                {!Device.phone && <Link key='desktop-link' iconOnly href={false}
                                       className={isOpenModal || props.disabledControls ? 'disabled' : ''}
                                       onClick={() => props.forceDesktopMode()}>
                                        <SvgIcon symbolId={IconSwitchToDesktop.id}
                                             className={'icon icon-svg'} />
                    </Link>}
                <Link iconOnly className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'} id='btn-settings' href={false} onClick={() => props.openOptions('settings')}>
                {Device.ios ? 
                    <SvgIcon symbolId={IconSettingsIos.id} className={'icon icon-svg'} /> :
                    <SvgIcon symbolId={IconSettingsAndroid.id} className={'icon icon-svg'} />
                }</Link>
            </NavRight>
        </Fragment>
    )
};

export default ToolbarView;