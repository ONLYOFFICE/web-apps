import React, { Fragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLeft, NavRight, Link } from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device';
import EditorUIController from '../lib/patch';
import SvgIcon from '@common/lib/component/SvgIcon'
import IconSwitchToDesktop from '@common/resources/icons/switch-desktop.svg'

const ToolbarView = props => {
    const { t } = useTranslation();
    const isVersionHistoryMode = props.isVersionHistoryMode;
    const isDisconnected = props.isDisconnected;
    const docExt = props.docExt;
    const isAvailableExt = docExt && docExt !== 'djvu' && docExt !== 'pdf' && docExt !== 'xps';
    const isEditableForms = props.isForm && props.canFillForms;
    const disableEditBtn = props.isObjectLocked || props.stateDisplayMode || props.disabledEditControls || isDisconnected;
    const isViewer = props.isViewer;
    const isMobileView = props.isMobileView;
    const docTitle = props.docTitle;
    const isOpenModal = props.isOpenModal;

    useEffect(() => {
        if ( $$('.skl-container').length ) {
            $$('.skl-container').remove();
        }
    }, []);

    return (
        <Fragment>
            <NavLeft>
                {(!isViewer && !isVersionHistoryMode) && 
                    <Link text={Device.ios ? t("Toolbar.textOk") : ''} icon={Device.android ? 'icon-check' : null} className='back-reader-mode' onClick={() => props.turnOnViewerMode()}></Link>
                }
                {isVersionHistoryMode ? 
                    <a href="#" className='btn-close-history' onClick={(e) => {
                        e.preventDefault();
                        props.closeHistory();
                    }}>
                        {t("Toolbar.textCloseHistory")}
                    </a> 
                : null}
                {(props.isShowBack && isViewer && !isVersionHistoryMode) && 
                    <Link className={`btn-doc-back${(props.disabledControls || isOpenModal) && ' disabled'}`} icon='icon-return' onClick={() => Common.Notifications.trigger('goback')}></Link>
                }
                {((Device.ios && props.isEdit && !isViewer && !isVersionHistoryMode) || 
                (Device.ios && isEditableForms)) &&          
                    EditorUIController.getUndoRedo && EditorUIController.getUndoRedo({
                        disabledUndo: !props.isCanUndo || isDisconnected,
                        disabledRedo: !props.isCanRedo || isDisconnected,
                        onUndoClick: props.onUndo,
                        onRedoClick: props.onRedo
                    })
                }
            </NavLeft>
            {((!Device.phone || (isViewer && !isEditableForms)) && !isVersionHistoryMode) && 
                <div className='title' onClick={() => props.changeTitleHandler()} style={{width: '71%'}}>
                    {docTitle}
                </div>
            }
            <NavRight>
                {((Device.android && props.isEdit && !isViewer && !isVersionHistoryMode) || 
                (Device.android && isEditableForms)) && 
                    EditorUIController.getUndoRedo && EditorUIController.getUndoRedo({
                        disabledUndo: !props.isCanUndo,
                        disabledRedo: !props.isCanRedo,
                        onUndoClick: props.onUndo,
                        onRedoClick: props.onRedo
                    })
                }
                {!isEditableForms ? [
                    !Device.phone && <Link key='desktop-link' iconOnly href={false}
                                           className={isOpenModal || props.disabledControls ? 'disabled' : ''}
                                           onClick={() => props.forceDesktopMode()}>
                                        <SvgIcon symbolId={IconSwitchToDesktop.id}
                                                 className={'icon icon-svg'} />
                                    </Link>,
                    ((isViewer || !Device.phone) && props.isMobileViewAvailable && !props.disabledControls && !isVersionHistoryMode) &&
                        <Link key='toggle-view-link' className={isOpenModal ? 'disabled' : ''} icon={isMobileView ? 'icon-standard-view' : 'icon-mobile-view'} href={false} onClick={() => {
                            props.changeMobileView();
                            props.openOptions('snackbar');
                        }}></Link>,
                    (props.showEditDocument && !isViewer) &&
                        <Link key='edit-link' className={(props.disabledControls || isOpenModal) && 'disabled'} icon='icon-edit' href={false} onClick={props.onEditDocument}></Link>,
                    (props.isEdit && isAvailableExt && !isViewer && !props.isDrawMode && EditorUIController.getToolbarOptions &&
                        <Fragment key='editing-buttons'>
                            {EditorUIController.getToolbarOptions({
                            disabled: disableEditBtn || props.disabledControls || isOpenModal,
                                onEditClick: e => props.openOptions('edit'),
                                onAddClick: e => props.openOptions('add')
                            })}
                        </Fragment>
                    ),
                    (Device.phone ? null : 
                        <Link key='search-link' className={(props.disabledControls || props.readerMode || isOpenModal) && 'disabled'} icon='icon-search' searchbarEnable='.searchbar' href={false}></Link>
                    ),
                    (window.matchMedia("(min-width: 360px)").matches && !props.isForm && !props.isDrawMode && !isVersionHistoryMode ?
                        <Link key='coauth-link' className={(props.disabledControls || isOpenModal) && 'disabled'} id='btn-coauth' href={false} icon='icon-collaboration' onClick={() => props.openOptions('coauth')}></Link> 
                    : null),
                    (isVersionHistoryMode ? 
                        <Link key='history-link' id='btn-open-history' icon='icon-version-history' href={false} className={isOpenModal && 'disabled'} onClick={() => props.openOptions('history')}></Link> 
                    : null),
                    <Link key='btn-settings' className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'} id='btn-settings' icon='icon-settings' href={false} onClick={() => props.openOptions('settings')}></Link>
                ] : [
                    // /!Device.phone && <Link key='desktop-link' iconOnly href={false}
                    //                        className={isOpenModal || props.disabledControls ? 'disabled' : ''}
                    //                        onClick={() => props.forceDesktopMode()}>
                    //                     <SvgIcon symbolId={IconSwitchToDesktop.id}
                    //                              className={'icon icon-svg'} />
                    //                 </Link>,
                    <Link key='prev-field-link' className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'} id='btn-prev-field' icon='icon-prev-field' href={false} onClick={() => props.movePrevField()}></Link>,
                    <Link key='next-field-link' className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'} id='btn-next-field' icon='icon-next-field' href={false} onClick={() => props.moveNextField()}></Link>,
                    (props.canSubmitForms ?
                        [
                            <Link key='btn-settings'
                                  className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'}
                                  icon='icon-settings' href={false}
                                  id='btn-settings'
                                  onClick={() => props.openOptions('settings')}></Link>,
                            <Link key='send-form-link'
                                  id='btn-submit-form'
                                  className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'}
                                  text={t("Toolbar.btnSend")} href={false}
                                  onClick={() => props.saveForm()}></Link>
                        ] : [
                            <Link key='save-form-link'
                                  className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'}
                                  icon='icon-save-form' href={false} onClick={() => props.saveForm()}></Link>,
                            <Link key='btn-settings'
                                  className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'} id='btn-settings' icon='icon-settings'
                                  href={false} onClick={() => {props.openOptions('settings')}}></Link>
                        ]
                    )
                ]}
            </NavRight>
        </Fragment>
    )
};

export default ToolbarView;