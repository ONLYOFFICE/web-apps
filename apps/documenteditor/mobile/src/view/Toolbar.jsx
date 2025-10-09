import React, { Fragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLeft, NavRight, Link } from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device';
import EditorUIController from '../lib/patch';
import SvgIcon from '@common/lib/component/SvgIcon'
import IconSwitchToDesktop from '@common/resources/icons/switch-desktop.svg'
import IconReturnIos from '@common-ios-icons/icon-return.svg?ios';
import IconReturnAndroid from '@common-android-icons/icon-return.svg';
import IconStandardView from '@icons/icon-standard-view.svg';
import IconSaveForm from '@icons/icon-save-form.svg';
import IconMobileView from '@icons/icon-mobile-view.svg';
import IconSearch from '@common-icons/icon-search.svg';
import IconCollaboration from '@common-icons/icon-collaboration.svg';
import IconVersionHistory from '@common-icons/icon-version-history.svg';
import IconEditForAndroid from '@common-android-icons/icon-edit.svg';
import IconEditForIos from '@common-ios-icons/icon-edit.svg?ios';
import IconSettingsIos from '@common-ios-icons/icon-settings.svg?ios';
import IconSettingsAndroid from '@common-android-icons/icon-settings.svg';
import IconNextField from '@icons/icon-next-field.svg';
import IconPrevField from '@icons/icon-prev-field.svg';
import IconCheck from '@common-android-icons/icon-check.svg';

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
                    <Link iconOnly text={Device.ios ? t("Toolbar.textOk") : ''} className='back-reader-mode' onClick={() => props.turnOnViewerMode()}>
                        {Device.android &&
                            <SvgIcon slot="media" symbolId={IconCheck.id} className={'icon icon-svg'} />
                        }
                    </Link>
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
                    <Link iconOnly className={`btn-doc-back${(props.disabledControls || isOpenModal) && ' disabled'}`} onClick={() => Common.Notifications.trigger('goback')}>
                        {Device.ios ? 
                            <SvgIcon slot="media" symbolId={IconReturnIos.id} className={'icon icon-svg'} /> :
                            <SvgIcon slot="media" symbolId={IconReturnAndroid.id} className={'icon icon-svg'} />
                        }
                    </Link>
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
            {((!Device.phone || (isViewer && !isEditableForms)) && !isVersionHistoryMode && !props.isHiddenFileName) && 
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
                        <Link iconOnly key='toggle-view-link' className={isOpenModal ? 'disabled' : ''} href={false} onClick={() => {
                            props.changeMobileView();
                            props.openOptions('snackbar');
                        }}>
                        {isMobileView ? 
                            <SvgIcon slot="media" symbolId={IconStandardView.id} className={'icon icon-svg'} /> :
                            <SvgIcon slot="media" symbolId={IconMobileView.id} className={'icon icon-svg'} />
                        }
                    </Link>,
                    (props.showEditDocument && !isVersionHistoryMode && isViewer) &&
                        <Link iconOnly key='edit-link' className={(props.disabledControls || isOpenModal) && 'disabled'} href={false} onClick={props.onEditDocument}>
                            {Device.ios ? 
                                <SvgIcon slot="media" symbolId={IconEditForIos.id} className={'icon icon-svg'} />
                            :
                                <SvgIcon slot="media" symbolId={IconEditForAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>,
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
                        <Link iconOnly key='search-link' className={(props.disabledControls || props.readerMode || isOpenModal) && 'disabled'} searchbarEnable='.searchbar' href={false}>
                            <SvgIcon slot="media" symbolId={IconSearch.id} className={'icon icon-svg'} />
                        </Link>
                    ),
                    (window.matchMedia("(min-width: 360px)").matches && !props.isForm && !props.isDrawMode && !isVersionHistoryMode ?
                        <Link iconOnly key='coauth-link' className={(props.disabledControls || isOpenModal) && 'disabled'} id='btn-coauth' href={false} onClick={() => props.openOptions('coauth')}>
                            <SvgIcon slot="media" symbolId={IconCollaboration.id} className={'icon icon-svg'} />
                        </Link>  
                    : null),
                    (isVersionHistoryMode ? 
                        <Link iconOnly key='history-link' id='btn-open-history' href={false} className={isOpenModal && 'disabled'} onClick={() => props.openOptions('history')}>
                            <SvgIcon slot="media" symbolId={IconVersionHistory.id} className={'icon icon-svg'} />
                        </Link>  
                    : null),
                    <Link iconOnly key='btn-settings' className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'} id='btn-settings' href={false} onClick={() => props.openOptions('settings')}>        
                        {Device.ios ? 
                           <SvgIcon symbolId={IconSettingsIos.id} className={'icon icon-svg'} /> :
                           <SvgIcon symbolId={IconSettingsAndroid.id} className={'icon icon-svg'} />
                        }</Link>
                ] : [
                    !Device.phone && <Link key='desktop-link' iconOnly href={false} className={isOpenModal || props.disabledControls ? 'disabled' : ''} onClick={() => props.forceDesktopMode()}>
                        <SvgIcon symbolId={IconSwitchToDesktop.id} className={'icon icon-svg'} />
                    </Link>,
                    <Link iconOnly key='prev-field-link' className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'} id='btn-prev-field' href={false} onClick={() => props.movePrevField()}><SvgIcon symbolId={IconPrevField.id} className={'icon icon-svg'} /></Link>,
                    <Link iconOnly key='next-field-link' className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'} id='btn-next-field' href={false} onClick={() => props.moveNextField()}><SvgIcon symbolId={IconNextField.id} className={'icon icon-svg'} /></Link>,
                    (props.canSubmitForms ?
                        [
                            <Link iconOnly key='btn-settings'
                                  className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'}
                                  href={false}
                                  id='btn-settings'
                                  onClick={() => props.openOptions('settings')}>
                                    {Device.ios ? 
                                        <SvgIcon symbolId={IconSettingsIos.id} className={'icon icon-svg'} /> :
                                        <SvgIcon symbolId={IconSettingsAndroid.id} className={'icon icon-svg'} />
                                    }</Link>,
                            <Link key='send-form-link'
                                  id='btn-submit-form' 
                                  className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal ||  props.isSignatureForm) && 'disabled'}
                                  text={t("Toolbar.btnSend")} href={false}
                                  onClick={() => props.saveForm()}></Link>
                        ] : [
                            <Link iconOnly key='save-form-link'
                                  className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'}
                                   href={false} onClick={() => props.saveForm()}><SvgIcon slot="media" symbolId={IconSaveForm.id} className={'icon icon-svg'} /></Link>,
                            <Link iconOnly key='btn-settings'
                                  className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'} id='btn-settings'
                                  href={false} onClick={() => {props.openOptions('settings')}}> 
                                  {Device.ios ? 
                                        <SvgIcon symbolId={IconSettingsIos.id} className={'icon icon-svg'} /> :
                                        <SvgIcon symbolId={IconSettingsAndroid.id} className={'icon icon-svg'} />
                                  }</Link>
                        ]
                    )
                ]}
            </NavRight>
        </Fragment>
    )
};

export default ToolbarView;