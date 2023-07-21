import React, { Fragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLeft, NavRight, NavTitle, Link, Icon, f7 } from 'framework7-react';
import { Device } from '../../../../common/mobile/utils/device';
import EditorUIController from '../lib/patch';

const ToolbarView = props => {
    const { t } = useTranslation();
    const isVersionHistoryMode = props.isVersionHistoryMode;
    const isDisconnected = props.isDisconnected;
    const docExt = props.docExt;
    const isAvailableExt = docExt && docExt !== 'djvu' && docExt !== 'pdf' && docExt !== 'xps' && docExt !== 'oform';
    const disableEditBtn = props.isObjectLocked || props.stateDisplayMode || props.disabledEditControls || isDisconnected;
    const isViewer = props.isViewer;
    const isMobileView = props.isMobileView;
    const docTitle = props.docTitle;
    const docTitleLength = docTitle.length;

    const correctOverflowedText = el => {
        if(el) {
            el.innerText = docTitle;

            if(el.scrollWidth > el.clientWidth) {
                const arrDocTitle = docTitle.split('.');
                const ext = arrDocTitle[1];
                const name = arrDocTitle[0];
                const diff = Math.floor(docTitleLength * el.clientWidth / el.scrollWidth - ext.length - 6);
                const shortName = name.substring(0, diff).trim();

                return `${shortName}...${ext}`;
            }

           return docTitle;
        }
    };

    const changeTitleHandler = () => {
        f7.dialog.create({
            title: t('Toolbar.textRenameFile'),
            text : t('Toolbar.textEnterNewFileName'),
            content: Device.ios ?
            '<div class="input-field"><input type="text" class="modal-text-input" name="modal-title" id="modal-title"></div>' : '<div class="input-field modal-title"><div class="inputs-list list inline-labels"><ul><li><div class="item-content item-input"><div class="item-inner"><div class="item-input-wrap"><input type="text" name="modal-title" id="modal-title"></div></div></div></li></ul></div></div>',
            cssClass: 'dlg-adv-options',
            buttons: [
                {
                    text: t('Edit.textCancel')
                },
                {
                    text: t('Edit.textOk'),
                    cssClass: 'btn-change-title',
                    bold: true,
                    close: false,
                    onClick: () => {
                        const titleFieldValue = document.querySelector('#modal-title').value;
                        if(titleFieldValue.trim().length) {
                            props.changeTitle(titleFieldValue);
                            f7.dialog.close();
                        }
                    }
                }
            ],
            on: {
                opened: () => {
                    const nameDoc = docTitle.split('.')[0];
                    const titleField = document.querySelector('#modal-title');
                    const btnChangeTitle = document.querySelector('.btn-change-title');

                    titleField.value = nameDoc;
                    titleField.focus();
                    titleField.select();

                    titleField.addEventListener('input', () => {
                        if(titleField.value.trim().length) {
                            btnChangeTitle.classList.remove('disabled');
                        } else {
                            btnChangeTitle.classList.add('disabled');
                        }
                    });
                }
            }
        }).open();
    }

    useEffect(() => {
        const elemTitle = document.querySelector('.subnavbar .title');

        if (elemTitle) {
            elemTitle.innerText = correctOverflowedText(elemTitle);
        }
    }, [docTitle, isViewer]);

    return (
        <Fragment>
            <NavLeft>
                {(!isViewer && !isVersionHistoryMode) && <Link text={Device.ios ? t("Toolbar.textOk") : ''} icon={Device.android ? 'icon-check' : null} className='back-reader-mode' onClick={() => props.turnOnViewerMode()}></Link>}
                {isVersionHistoryMode ? <a href="#" className='btn-close-history' onClick={(e) => {
                    e.preventDefault();
                    props.closeHistory();
                }}>{t("Toolbar.textCloseHistory")}</a> : null}
                {(props.isShowBack && isViewer && !isVersionHistoryMode) && <Link className={`btn-doc-back${props.disabledControls && ' disabled'}`} icon='icon-back' onClick={() => Common.Notifications.trigger('goback')}></Link>}
                {(Device.ios && props.isEdit && !isViewer && !isVersionHistoryMode) && EditorUIController.getUndoRedo && EditorUIController.getUndoRedo({
                    disabledUndo: !props.isCanUndo || isDisconnected,
                    disabledRedo: !props.isCanRedo || isDisconnected,
                    onUndoClick: props.onUndo,
                    onRedoClick: props.onRedo
                })}
            </NavLeft>
            {((!Device.phone || isViewer) && !isVersionHistoryMode) && <div className='title' onClick={changeTitleHandler} style={{width: '71%'}}>{docTitle}</div>}
            <NavRight>
                {(Device.android && props.isEdit && !isViewer && !isVersionHistoryMode) && EditorUIController.getUndoRedo && EditorUIController.getUndoRedo({
                    disabledUndo: !props.isCanUndo,
                    disabledRedo: !props.isCanRedo,
                    onUndoClick: props.onUndo,
                    onRedoClick: props.onRedo
                })}
                {/*isAvailableExt && !props.disabledControls &&*/}
                {((isViewer || !Device.phone) && isAvailableExt && !props.disabledControls && !isVersionHistoryMode) && <Link icon={isMobileView ? 'icon-standard-view' : 'icon-mobile-view'} href={false} onClick={() => {
                    props.changeMobileView();
                    props.openOptions('snackbar');
                }}></Link>}
                {(props.showEditDocument && !isViewer) &&
                    <Link className={props.disabledControls ? 'disabled' : ''} icon='icon-edit' href={false} onClick={props.onEditDocument}></Link>
                }
                {props.isEdit && isAvailableExt && !isViewer && EditorUIController.getToolbarOptions && EditorUIController.getToolbarOptions({
                    disabled: disableEditBtn || props.disabledControls,
                    onEditClick: e => props.openOptions('edit'),
                    onAddClick: e => props.openOptions('add')
                })}
                {/*props.displayCollaboration &&*/}
                {Device.phone || isVersionHistoryMode ? null : <Link className={(props.disabledControls || props.readerMode) && 'disabled'} icon='icon-search' searchbarEnable='.searchbar' href={false}></Link>}
                {window.matchMedia("(min-width: 360px)").matches && docExt !== 'oform' && !isVersionHistoryMode ? <Link className={props.disabledControls && 'disabled'} id='btn-coauth' href={false} icon='icon-collaboration' onClick={() => props.openOptions('coauth')}></Link> : null}
                {isVersionHistoryMode ? <Link id='btn-open-history' icon='icon-version-history' href={false} onClick={() => props.openOptions('history')}></Link> : null}
                <Link className={(props.disabledSettings || props.disabledControls || isDisconnected) && 'disabled'} id='btn-settings' icon='icon-settings' href={false} onClick={() => props.openOptions('settings')}></Link>
            </NavRight>
        </Fragment>
    )
};

export default ToolbarView;