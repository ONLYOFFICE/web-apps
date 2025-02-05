import React, {Fragment, useEffect } from 'react';
import {NavLeft, NavRight, Link} from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device';
import EditorUIController from '../lib/patch'
import { useTranslation } from 'react-i18next';
import SvgIcon from '@common/lib/component/SvgIcon'
import IconSwitchToDesktop from '@common/resources/icons/switch-desktop.svg'

const ToolbarView = props => {
    const { t } = useTranslation();
    const isDisconnected = props.isDisconnected;
    const wsProps = props.wsProps;
    const focusOn = props.focusOn;
    const isShapeLocked = props.isShapeLocked;
    const undo_box = props.isEdit && EditorUIController.toolbarOptions ? EditorUIController.toolbarOptions.getUndoRedo({
            disabledUndo: !props.isCanUndo || isDisconnected,
            disabledRedo: !props.isCanRedo || isDisconnected,
            onUndoClick: props.onUndo,
            onRedoClick: props.onRedo
        }) : null;
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
              {props.isDrawMode && <Link text={Device.ios ? t("Toolbar.textOk") : ''} icon={Device.android ? 'icon-close' : null} className='back-reader-mode' onClick={() => Common.Notifications.trigger('draw:stop')}/>}
                {(!props.isDrawMode && props.isShowBack && !isVersionHistoryMode) && <Link className={`btn-doc-back${(props.disabledControls || isOpenModal) && ' disabled'}`} icon='icon-return' onClick={() => Common.Notifications.trigger('goback')}></Link>}
                {isVersionHistoryMode ? <a href="#" className='btn-close-history' onClick={(e) => {
                    e.preventDefault();
                    props.closeHistory();
                }}>{t("Toolbar.textCloseHistory")}</a> : null}
                {(Device.ios && !isVersionHistoryMode) && undo_box}
            </NavLeft>
            {(!Device.phone && !isVersionHistoryMode) && 
                <div className='title' onClick={() => props.changeTitleHandler()} style={{width: '71%'}}>
                    {docTitle}
                </div>
            }
            <NavRight>
                {(Device.android && !isVersionHistoryMode) && undo_box}
                {!Device.phone && <Link key='desktop-link' iconOnly href={false}
                                       className={isOpenModal || props.disabledControls ? 'disabled' : ''}
                                       onClick={() => props.forceDesktopMode()}>
                                        <SvgIcon symbolId={IconSwitchToDesktop.id}
                                             className={'icon icon-svg'} />
                    </Link>}
                {(props.showEditDocument && !isVersionHistoryMode) &&
                    <Link className={(props.disabledControls || isOpenModal) ? 'disabled' : ''} icon='icon-edit' href={false} onClick={props.onEditDocument}></Link>
                }
                {(!props.isDrawMode && props.isEdit && EditorUIController.toolbarOptions && !isVersionHistoryMode) && EditorUIController.toolbarOptions.getEditOptions({
                    disabled: props.disabledEditControls || props.disabledControls || isDisconnected || isOpenModal,
                    wsProps,
                    focusOn,
                    isShapeLocked,
                    onEditClick: () => props.openOptions('edit'),
                    onAddClick: () => props.openOptions('add')
                })}
                {Device.phone ? null : <Link className={(props.disabledControls || props.disabledSearch || isOpenModal) && 'disabled'} icon='icon-search' searchbarEnable='.searchbar' href={false}></Link>}
                {!props.isDrawMode && props.displayCollaboration && window.matchMedia("(min-width: 360px)").matches && !isVersionHistoryMode ? <Link className={(props.disabledControls || props.disabledCollaboration || isOpenModal) && 'disabled'} id='btn-coauth' href={false} icon='icon-collaboration' onClick={() => props.openOptions('coauth')}></Link> : null}
                {isVersionHistoryMode ? <Link id='btn-open-history' icon='icon-version-history' href={false} className={isOpenModal && 'disabled'} onClick={() => props.openOptions('history')}></Link> : null}
                <Link className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'} id='btn-settings' icon='icon-settings' href={false} onClick={() => props.openOptions('settings')}></Link>
            </NavRight>
        </Fragment>
    )
};

export default ToolbarView;