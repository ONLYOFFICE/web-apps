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

import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {withTranslation} from 'react-i18next';

import {AddImage} from '../../view/add/AddImage';

class AddImageController extends Component {
    constructor (props) {
        super(props);
        this.onInsertByFile = this.onInsertByFile.bind(this);
        this.onInsertByUrl = this.onInsertByUrl.bind(this);
    }

    closeModal () {
        if ( Device.phone ) {
            f7.sheet.close('.add-popup', true);
        } else {
            f7.popover.close('#add-popover');
        }
    }

    onInsertByFile () {
        const api = Common.EditorApi.get();
        api.asc_addImage();
        this.closeModal();
    }

    onInsertByUrl (value) {
        const { t } = this.props;
        const _t = t("View.Add", { returnObjects: true });

        const _value = value.replace(/ /g, '');

        if (_value) {
            if ((/((^https?)|(^ftp)):\/\/.+/i.test(_value))) {
                this.closeModal();
                const api = Common.EditorApi.get();
                api.asc_addImageDrawingObject([_value]);
            } else {
                f7.dialog.alert(_t.txtNotUrl, _t.notcriticalErrorTitle);
            }
        } else {
            f7.dialog.alert(_t.textEmptyImgUrl, _t.notcriticalErrorTitle);
        }
    }

    render () {
        return (
            <AddImage inTabs={this.props.inTabs}
                      onInsertByFile={this.onInsertByFile}
                      onInsertByUrl={this.onInsertByUrl}
            />
        )
    }
}

const AddImageWithTranslation = withTranslation()(AddImageController);

export {AddImageWithTranslation as AddImageController};
