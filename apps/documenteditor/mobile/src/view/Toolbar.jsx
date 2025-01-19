import React, { Fragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLeft, NavRight, Link } from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device';
import EditorUIController from '../lib/patch';
import SvgIcon from '@common/lib/component/SvgIcon';
import IconReturnIos from '@common-ios-icons/icon-return.svg';
import IconReturnAndroid from '@common-android-icons/icon-return.svg';
import IconStandardView from '@icons/icon-standard-view.svg';
import IconSaveForm from '@icons/icon-save-form.svg';
import IconMobileView from '@icons/icon-mobile-view.svg';
import IconSearch from '@common-icons/icon-search.svg';
import IconCollaboration from '@common-icons/icon-collaboration.svg';
import IconVersionHistory from '@common-icons/icon-version-history.svg';
import IconEditForAndroid from '@common-android-icons/icon-edit.svg';
import IconEditForIos from '@common-ios-icons/icon-edit.svg';
import IconSettings from '@common-icons/icon-settings.svg';
import IconNextField from '@icons/icon-next-field.svg';
import IconPrevField from '@icons/icon-prev-field.svg';
import IconCheck from '@common-android-icons/icon-check.svg';

const ToolbarView = props => {
    const { t } = useTranslation();
    const isVersionHistoryMode = props.isVersionHistoryMode;
    const isDisconnected = props.isDisconnected;
    const docExt = props.docExt;
    const isAvailableExt = docExt && docExt !== 'djvu' && docExt !== 'pdf' && docExt !== 'xps';
    const isForm = props.isForm;
    const canFillForms = props.canFillForms;
    const isEditableForms = isForm && canFillForms;
    const disableEditBtn = props.isObjectLocked || props.stateDisplayMode || props.disabledEditControls || isDisconnected;
    const isViewer = props.isViewer;
    const isMobileView = props.isMobileView;
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
                {(!isViewer && !isVersionHistoryMode) && 
                    <Link text={Device.ios ? t("Toolbar.textOk") : ''} className='back-reader-mode' onClick={() => props.turnOnViewerMode()}>
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
                    <Link className={`btn-doc-back${(props.disabledControls || isOpenModal) && ' disabled'}`} onClick={() => Common.Notifications.trigger('goback')}>
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
                    ((isViewer || !Device.phone) && props.isMobileViewAvailable && !props.disabledControls && !isVersionHistoryMode) &&
                        <Link key='toggle-view-link' className={isOpenModal ? 'disabled' : ''} href={false} onClick={() => {
                            props.changeMobileView();
                            props.openOptions('snackbar');
                        }}>
                        {isMobileView ? 
                            <SvgIcon slot="media" symbolId={IconStandardView.id} className={'icon icon-svg'} /> :
                            <SvgIcon slot="media" symbolId={IconMobileView.id} className={'icon icon-svg'} />
                        }
                    </Link>,
                    (props.showEditDocument && !isViewer) &&
                        <Link key='edit-link' className={(props.disabledControls || isOpenModal) && 'disabled'} href={false} onClick={props.onEditDocument}>
                            {Device.ios ? 
                                <SvgIcon slot="media" symbolId={IconEditForIos.id} className={'icon icon-svg'} />
                            :
                                <SvgIcon slot="media" symbolId={IconEditForAndroid.id} className={'icon icon-svg'} />
                            }
                        </Link>,
                    (props.isEdit && isAvailableExt && !isViewer && EditorUIController.getToolbarOptions && 
                        <Fragment key='editing-buttons'>
                            {EditorUIController.getToolbarOptions({
                            disabled: disableEditBtn || props.disabledControls || isOpenModal,
                                onEditClick: e => props.openOptions('edit'),
                                onAddClick: e => props.openOptions('add')
                            })}
                        </Fragment>
                    ),
                    (Device.phone ? null : 
                        <Link key='search-link' className={(props.disabledControls || props.readerMode || isOpenModal) && 'disabled'} searchbarEnable='.searchbar' href={false}>
                            <SvgIcon slot="media" symbolId={IconSearch.id} className={'icon icon-svg'} />
                        </Link>
                    ),
                    (window.matchMedia("(min-width: 360px)").matches && !isForm && !isVersionHistoryMode ? 
                        <Link key='coauth-link' className={(props.disabledControls || isOpenModal) && 'disabled'} id='btn-coauth' href={false} onClick={() => props.openOptions('coauth')}>
                            <SvgIcon slot="media" symbolId={IconCollaboration.id} className={'icon icon-svg'} />
                        </Link>  
                    : null),
                    (isVersionHistoryMode ? 
                        <Link key='history-link' id='btn-open-history' href={false} className={isOpenModal && 'disabled'} onClick={() => props.openOptions('history')}>
                            <SvgIcon slot="media" symbolId={IconVersionHistory.id} className={'icon icon-svg'} />
                        </Link>  
                    : null),
                    <Link key='btn-settings' className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'} id='btn-settings' icon='icon-settings' href={false} onClick={() => props.openOptions('settings')}></Link>
                ] : [
                    <Link key='prev-field-link' className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'} id='btn-prev-field' href={false} onClick={() => props.movePrevField()}><SvgIcon slot="media" symbolId={IconPrevField.id} className={'icon icon-svg'} /></Link>,
                    <Link key='next-field-link' className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'} id='btn-next-field' href={false} onClick={() => props.moveNextField()}><SvgIcon slot="media" symbolId={IconNextField.id} className={'icon icon-svg'} /></Link>,
                    (props.canSubmitForms ?
                        [
                            <Link key='btn-settings'
                                  className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'}
                                  href={false}
                                  id='btn-settings'
                                  onClick={() => props.openOptions('settings')}><SvgIcon slot="media" symbolId={IconSettings.id} className={'icon icon-svg'} /></Link>,
                            <Link key='send-form-link'
                                  id='btn-submit-form'
                                  className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'}
                                  text={t("Toolbar.btnSend")} href={false}
                                  onClick={() => props.saveForm()}></Link>
                        ] : [
                            <Link key='save-form-link'
                                  className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'}
                                   href={false} onClick={() => props.saveForm()}><SvgIcon slot="media" symbolId={IconSaveForm.id} className={'icon icon-svg'} /></Link>,
                            <Link key='btn-settings'
                                  className={(props.disabledSettings || props.disabledControls || isDisconnected || isOpenModal) && 'disabled'} id='btn-settings'
                                  href={false} onClick={() => {props.openOptions('settings')}}> <SvgIcon slot="media" symbolId={IconSettings.id} className={'icon icon-svg'} /></Link>
                        ]
                    )
                ]}
            </NavRight>
        </Fragment>
    )
};

export default ToolbarView;