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
import VisioInfo from "../../view/settings/VisioInfo";
import { observer, inject } from "mobx-react";

class VisioInfoController extends Component {
    constructor(props) {
        super(props);
        this.docProps = this.getDocProps();

        if(this.docProps) {
            this.modified = this.getModified();
            this.modifiedBy = this.getModifiedBy();
            this.creators = this.getCreators();
            this.title = this.getTitle();
            this.subject = this.getSubject();
            this.description = this.getDescription();
            this.created = this.getCreated();
        }
    }

    getDocProps() {
        const api = Common.EditorApi.get();
        return api.asc_getCoreProps();
    }

    getAppProps() {
        const api = Common.EditorApi.get();
        const appProps = api.asc_getAppProps();

        if (appProps) {
            return `${!appProps.asc_getApplication() ? '' : appProps.asc_getApplication() + ' ' + appProps.asc_getAppVersion()}`;
        }
    }

    getModified() {
        let valueModified = this.docProps.asc_getModified();
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

    getModifiedBy() {
        let valueModifiedBy = this.docProps.asc_getLastModifiedBy();

        if (valueModifiedBy) {
            return AscCommon.UserInfoParser.getParsedName(valueModifiedBy);
        }
    }

    getCreators() {
        return this.docProps.asc_getCreator();
    }

    getTitle() {
        return this.docProps.asc_getTitle();
    }

    getSubject() {
        return this.docProps.asc_getSubject();
    }

    getDescription() {
        return this.docProps.asc_getDescription();
    }

    getCreated() {
        let value = this.docProps.asc_getCreated();
        const _lang = this.props.storeAppOptions.lang;

        if(value) {
            return value.toLocaleString(_lang, {year: 'numeric', month: '2-digit', day: '2-digit'}) + ' ' + value.toLocaleTimeString(_lang, {timeStyle: 'short'});
        }
    }

    render() {
        return (
            <VisioInfo
                getAppProps={this.getAppProps}
                modified={this.modified}
                modifiedBy={this.modifiedBy}
                creators={this.creators}
                created={this.created}
                title={this.title}
                subject={this.subject}
                description={this.description}
            />
        );
    }
}


export default inject("storeAppOptions")(observer(VisioInfoController));
