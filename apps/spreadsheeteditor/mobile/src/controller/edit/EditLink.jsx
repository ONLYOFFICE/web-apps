import React, { Component } from 'react';
import { f7 } from 'framework7-react';
import { Device } from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";
import { withTranslation } from 'react-i18next';

import { EditLink } from '../../view/edit/EditLink';

class EditLinkController extends Component {
    constructor (props) {
        super(props);
        this.onEditLink = this.onEditLink.bind(this);
        this.onRemoveLink = this.onRemoveLink.bind(this);

        const api = Common.EditorApi.get();
        const cellInfo = api.asc_getCellInfo();

        this.linkInfo = cellInfo.asc_getHyperlink();
        this.isLock = cellInfo.asc_getLockText();
        this.currentSheet = api.asc_getWorksheetName(api.asc_getActiveWorksheetIndex());
    
        // Sheets

        let items = [];
        let wsc = api.asc_getWorksheetsCount();

        if (wsc > 0) {
            items = [];
            while (!(--wsc < 0)) {
                if (!api.asc_isWorksheetHidden(wsc)) {
                    items.unshift({
                        value: wsc,
                        caption: api.asc_getWorksheetName(wsc)
                    });
                }
            }
            this.sheets = items;
        }
    }

    closeModal () {
        if ( Device.phone ) {
            f7.sheet.close('#edit-sheet', true);
        } else {
            f7.popover.close('#edit-popover');
        }
    }

    onEditLink(args) {
        const api = Common.EditorApi.get();
        const { t } = this.props;
        const _t = t("View.Edit", {returnObjects: true});

        let linkProps = new Asc.asc_CHyperlink(),
            sheet = "",
            displayText = args.text,
            tip = args.tooltip,
            defaultDisplay = "";

        linkProps.asc_setType(args.type);

        if(args.type === Asc.c_oAscHyperlinkType.RangeLink) {
            let range = args.url,
                isValidRange = /^[A-Z]+[1-9]\d*:[A-Z]+[1-9]\d*$/.test(range);

            if (!isValidRange)
                isValidRange = /^[A-Z]+[1-9]\d*$/.test(range);

            if (!isValidRange) {
                f7.dialog.alert(_t.textInvalidRange, _t.notcriticalErrorTitle);
                return;
            }

            sheet = args.sheet;

            linkProps.asc_setSheet(sheet);
            linkProps.asc_setRange(range);
            defaultDisplay = sheet + '!' + range;
        } else {
            let url = args.url.replace(/^\s+|\s+$/g,'');
            let urltype = api.asc_getUrlType(url.trim());

            if (urltype===AscCommon.c_oAscUrlType.Invalid) {
                f7.dialog.create({
                    title: t('View.Edit.notcriticalErrorTitle'),
                    text: t('View.Edit.textNotUrl'),
                    buttons: [
                        {
                            text: t('View.Edit.textOk')
                        }
                    ]
                }).open();

                return;
            }

            if (urltype!==AscCommon.c_oAscUrlType.Unsafe && ! /(((^https?)|(^ftp)):\/\/)|(^mailto:)/i.test(url))
                url = ( (urltype===AscCommon.c_oAscUrlType.Email) ? 'mailto:' : 'http://' ) + url;

            url = url.replace(new RegExp("%20",'g')," ");

            linkProps.asc_setHyperlinkUrl(url);
            defaultDisplay = url;
        }

        if (this.isLock) {
            linkProps.asc_setText(null);
        } else {
            if (!displayText) {
                displayText = defaultDisplay;
            }
            linkProps.asc_setText(displayText);
        }

        linkProps.asc_setTooltip(tip);

        api.asc_insertHyperlink(linkProps);
        this.closeModal();
     
    }

    onRemoveLink() {
        const api = Common.EditorApi.get();
        api.asc_removeHyperlink();
        this.closeModal();
    }

    render () {
        return (
            <EditLink 
                linkInfo={this.linkInfo}
                isLock={this.isLock}
                sheets={this.sheets}
                currentSheet={this.currentSheet}
                onEditLink={this.onEditLink} 
                onRemoveLink={this.onRemoveLink}
            />
        )
    }
}

const EditLinkWithTranslation = withTranslation()(EditLinkController);

export {EditLinkWithTranslation as EditLinkController};