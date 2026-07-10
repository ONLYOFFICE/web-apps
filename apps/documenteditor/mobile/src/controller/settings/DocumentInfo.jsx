/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import DocumentInfo from "../../view/settings/DocumentInfo";
import { f7 } from 'framework7-react';
import { withTranslation } from 'react-i18next';
import { Device } from "../../../../../common/mobile/utils/device";

class DocumentInfoController extends Component {
    constructor(props) {
        super(props);
        this.docProps = this.getDocProps();
        this.pdfProps = this.getPdfProps();
        this.docInfoObject = {};

        this.getAppProps = this.getAppProps.bind(this);
        this.changeTitleHandler = this.changeTitleHandler.bind(this);

        if(this.docProps) {
            this.updateFileInfo(this.docProps);
        } else if (this.pdfProps) {
            this.updatePdfInfo(this.pdfProps);
        }
    }

    updateFileInfo(props) {
        let value;

        if(props) {
            value = props.asc_getCreated();
            if(value) this.docInfoObject.dateCreated = this.getModified(value);

            value = props.asc_getModified();
            if(value) this.docInfoObject.modifyDate = this.getModified(value);

            value = props.asc_getLastModifiedBy();
            if(value) this.docInfoObject.modifyBy = AscCommon.UserInfoParser.getParsedName(value);

            this.docInfoObject.title = props.asc_getTitle() || '';
            this.docInfoObject.subject = props.asc_getSubject() || '';
            this.docInfoObject.description = props.asc_getDescription() || '';

            value = props.asc_getCreator();
            if(value) this.docInfoObject.creators = value;
        }
    }

    updatePdfInfo(props) {
        const { t } = this.props;
        const _t = t("Settings", { returnObjects: true });
        let value;

        if(props) {
            value = props.CreationDate;
            if (value)
                this.docInfoObject.dateCreated = this.getModified(new Date(value));
            
            value = props.ModDate;
            if (value)
                this.docInfoObject.modifyDate = this.getModified(new Date(value));

            if(props.PageWidth && props.PageHeight && (typeof props.PageWidth === 'number') && (typeof props.PageHeight === 'number')) {
                let width = props.PageWidth,
                    heigth = props.PageHeight;
                switch(Common.Utils.Metric.getCurrentMetric()) {
                    case Common.Utils.Metric.c_MetricUnits.cm:
                        width = parseFloat((width* 25.4 / 72000.).toFixed(2));
                        heigth = parseFloat((heigth* 25.4 / 72000.).toFixed(2));
                        break;
                    case Common.Utils.Metric.c_MetricUnits.pt:
                        width = parseFloat((width/100.).toFixed(2));
                        heigth = parseFloat((heigth/100.).toFixed(2));
                        break;
                    case Common.Utils.Metric.c_MetricUnits.inch:
                        width = parseFloat((width/7200.).toFixed(2));
                        heigth = parseFloat((heigth/7200.).toFixed(2));
                        break;
                }

                this.docInfoObject.pageSize = (width + ' ' + Common.Utils.Metric.getCurrentMetricName() + ' x ' + heigth + ' ' + Common.Utils.Metric.getCurrentMetricName());
            } else this.docInfoObject.pageSize = null;

            value = props.Title;
            if(value) this.docInfoObject.title = value;

            value = props.Subject;
            if(value) this.docInfoObject.subject = value;

            value = props.Author;
            if(value) this.docInfoObject.author = value;

            value = props.Version;
            if(value) this.docInfoObject.version = value;

            value = props.Producer;
            if(value) this.docInfoObject.producer = value;

            value = props.Tagged;
            if (value !== undefined)
                this.docInfoObject.tagged = (value===true ? _t.textYes : _t.textNo);
            
            value = props.FastWebView;
            if (value !== undefined)
                this.docInfoObject.fastWebView = (value===true ? _t.textYes : _t.textNo);
        }
    }

    getDocProps() {
        const api = Common.EditorApi.get();
        return api.asc_getCoreProps();
    }

    getPdfProps() {
        const api = Common.EditorApi.get();
        return api.asc_getPdfProps();
    }

    getAppProps() {
        const api = Common.EditorApi.get();
        const appProps = api.asc_getAppProps();
        let appName;

        if (appProps) {
            appName = appProps.asc_getApplication();
            if ( appName && appProps.asc_getAppVersion() )
                appName += ` ${appProps.asc_getAppVersion()}`;
           
            return appName || '';
        } else if (this.pdfProps) {
            appName = this.pdfProps ? this.pdfProps.Creator || '' : '';
            return appName;
        }
    }

    getModified(valueModified) {
        const _lang = this.props.storeAppOptions.lang;

        if (valueModified) {
            return (
                valueModified.toLocaleString(_lang, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                }) +
                " " +
                valueModified.toLocaleTimeString(_lang, { timeStyle: "short" })
            );
        }
    }

    changeTitleHandler() {
        if(!this.props.storeAppOptions.canRename) return;

        const { t } = this.props;
        const storeDocumentInfo = this.props.storeDocumentInfo;
        const docTitle = storeDocumentInfo.dataDoc.title;
        const api = Common.EditorApi.get();
        
        api.asc_enableKeyEvents(true);

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
                            this.changeTitle(titleFieldValue);
                            f7.dialog.close();
                        }
                    }
                }
            ],
            on: {
                opened: () => {
                    const nameDoc = docTitle.slice(0, docTitle.lastIndexOf("."));
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

    changeTitle(name) {
        const api = Common.EditorApi.get();
        const storeDocumentInfo = this.props.storeDocumentInfo;
        const docInfo = storeDocumentInfo.docInfo;
        const docExt = storeDocumentInfo.dataDoc.fileType;
        const title = `${name}.${docExt}`;

        storeDocumentInfo.changeTitle(title);
        docInfo.put_Title(title);
        storeDocumentInfo.setDocInfo(docInfo);
        api.asc_setDocInfo(docInfo);
    }

    componentDidMount() {
        const api = Common.EditorApi.get();
        api.startGetDocInfo();
    }

    render() {
        return (
            <DocumentInfo
                getAppProps={this.getAppProps}
                docInfoObject={this.docInfoObject}
                changeTitleHandler={this.changeTitleHandler}
            />
        );
    }
}


export default inject("storeAppOptions", "storeDocumentInfo")(observer(withTranslation()(DocumentInfoController)));
