import React, {Fragment, useEffect } from 'react';
import {NavLeft, NavRight, Link} from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device';
import EditorUIController from '../lib/patch'
import { useTranslation } from 'react-i18next';
import SvgIcon from '@common/lib/component/SvgIcon'
import IconSwitchToDesktop from '@common/resources/icons/switch-desktop.svg'
import IconReturnIos from '@common-ios-icons/icon-return.svg?ios';
import IconReturnAndroid from '@common-android-icons/icon-return.svg';
import IconPlay from '@icons/icon-play.svg';
import IconEditIos from '@common-ios-icons/icon-edit.svg?ios';
import IconEditAndroid from '@common-android-icons/icon-edit.svg';
import IconSearch from '@common-icons/icon-search.svg';
import IconCollaboration from '@common-icons/icon-collaboration.svg';
import IconSettingsIos from '@common-ios-icons/icon-settings.svg?ios';
import IconSettingsAndroid from '@common-android-icons/icon-settings.svg';
import IconHistory from '@common-icons/icon-version-history.svg';
import IconCheck from '@common-android-icons/icon-check.svg';

const ToolbarView = props => {
    const { t } = useTranslation();
    const isDisconnected = props.isDisconnected;
    const docTitle = props.docTitle;
    const isVersionHistoryMode = props.isVersionHistoryMode;
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
                {props.isDrawMode && <Link iconOnly text={Device.ios ? t("Toolbar.textOk") : ''} className='back-reader-mode' onClick={() => Common.Notifications.trigger('draw:stop')}>
                    {Device.android &&
                        <SvgIcon slot="media" symbolId={IconCheck.id} className={'icon icon-svg'} />
                    }
                </Link>}
                {(props.isShowBack && !props.isDrawMode && !isVersionHistoryMode) && <Link iconOnly className={`btn-doc-back${(props.disabledControls || isOpenModal) && ' disabled'}`} onClick={() => Common.Notifications.trigger('goback')}>
                    {Device.ios ? 
                        <SvgIcon slot="media" symbolId={IconReturnIos.id} className={'icon icon-svg'} /> : 
                        <SvgIcon slot="media" symbolId={IconReturnAndroid.id} className={'icon icon-svg'} />
                    }
                </Link>}
                {isVersionHistoryMode ? <a href="#" className='btn-close-history' onClick={(e) => {
                    e.preventDefault();
                    props.closeHistory();
                }}>{t("Toolbar.textCloseHistory")}</a> : null}
                {(Device.ios && props.isEdit && !isVersionHistoryMode) && EditorUIController.getUndoRedo && EditorUIController.getUndoRedo({
                    disabledUndo: !props.isCanUndo || isDisconnected,
                    disabledRedo: !props.isCanRedo || isDisconnected,
                    onUndoClick: props.onUndo,
                    onRedoClick: props.onRedo
                })}
            </NavLeft>
            {(!Device.phone && !isVersionHistoryMode && !props.isHiddenFileName) && 
                <div className='title' onClick={() => props.changeTitleHandler()} style={{width: '71%'}}>
                    {docTitle}
                </div>
            }
            <NavRight>
                {(Device.android && props.isEdit && EditorUIController.getUndoRedo && !isVersionHistoryMode) && EditorUIController.getUndoRedo({
                    disabledUndo: !props.isCanUndo || isDisconnected,
                    disabledRedo: !props.isCanRedo || isDisconnected,
                    onUndoClick: props.onUndo,
                    onRedoClick: props.onRedo
                })}
                {!Device.phone && <Link key='desktop-link' iconOnly href={false}
                                       className={isOpenModal || props.disabledControls ? 'disabled' : ''}
                                       onClick={() => props.forceDesktopMode()}>
                                        <SvgIcon symbolId={IconSwitchToDesktop.id}
                                             className={'icon icon-svg'} />
                    </Link>}
                {(!isVersionHistoryMode && !props.isDrawMode) &&
                    <Link iconOnly className={(props.disabledControls || props.disabledPreview || isOpenModal) && 'disabled'} href={false} onClick={() => {props.openOptions('preview')}}><SvgIcon symbolId={IconPlay.id} className={'icon icon-svg'} /></Link>
                }
                {(props.showEditDocument && !isVersionHistoryMode) &&
                    <Link iconOnly className={(props.disabledControls || isOpenModal) ? 'disabled' : ''} href={false} onClick={props.onEditDocument}>
                        {Device.ios ? 
                            <SvgIcon symbolId={IconEditIos.id} className={'icon icon-svg'} /> :
                            <SvgIcon symbolId={IconEditAndroid.id} className={'icon icon-svg'} />
                        }
                    </Link>
                }
                {(props.isEdit && EditorUIController.getToolbarOptions && !props.isDrawMode && !isVersionHistoryMode) && EditorUIController.getToolbarOptions({
                    disabledEdit: props.disabledEdit || props.disabledControls || isDisconnected || props.disabledPreview || isOpenModal,
                    disabledAdd: props.disabledControls || isDisconnected || isOpenModal,
                    onEditClick: () => props.openOptions('edit'),
                    onAddClick: () => props.openOptions('add')
                })}
                {Device.phone ? null : <Link iconOnly className={(props.disabledControls || props.disabledPreview || isOpenModal) && 'disabled'}searchbarEnable='.searchbar' href={false}> <SvgIcon symbolId={IconSearch.id} className={'icon icon-svg'} /></Link>}
                {props.displayCollaboration && window.matchMedia("(min-width: 375px)").matches && !isVersionHistoryMode ? <Link iconOnly className={(props.disabledControls || isOpenModal) && 'disabled'} id='btn-coauth' href={false} onClick={() => props.openOptions('coauth')}><SvgIcon symbolId={IconCollaboration.id} className={'icon icon-svg'} /></Link> : null}
                {isVersionHistoryMode ? <Link iconOnly id='btn-open-history' href={false} className={isOpenModal && 'disabled'} onClick={() => props.openOptions('history')}><SvgIcon symbolId={IconHistory.id} className={'icon icon-svg'} /> </Link> : null}
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