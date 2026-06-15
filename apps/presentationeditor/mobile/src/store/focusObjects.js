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

import {action, observable, computed, makeObservable} from 'mobx';

export class storeFocusObjects {
    constructor() {
        makeObservable(this, {
            _focusObjects: observable,
            resetFocusObjects: action,
            settings: computed,
            slideObject: computed,
            paragraphObject: computed,
            paragraphLocked: computed,
            shapeObject: computed,
            imageObject: computed,
            tableObject: computed,
            isTableInStack: computed,
            chartObject: computed,
            linkObject: computed,
            isEditLocked: computed
        });
    }

    _focusObjects = [];

    resetFocusObjects(objects) {
        this._focusObjects = objects;
    }

    get settings() {
        return !!this.intf ? this.intf.filterFocusObjects() : null;
    }

    get slideObject() {
        return !!this.intf ? this.intf.getSlideObject() : null;
    }

    get paragraphObject() {
        return !!this.intf ? this.intf.getParagraphObject() : null;
    }

    get paragraphLocked() {
        let _paragraphLocked = false;
        for (let object of this._focusObjects) {
            if (Asc.c_oAscTypeSelectElement.Paragraph == object.get_ObjectType()) {
                _paragraphLocked = object.get_ObjectValue().get_Locked();
            }
        }
        return _paragraphLocked;
    }

    get shapeObject() {
        return !!this.intf ? this.intf.getShapeObject() : null;
    }

    get imageObject() {
        return !!this.intf ? this.intf.getImageObject() : null;
    }

    get tableObject() {
        return !!this.intf ? this.intf.getTableObject() : null;
    }

    get isTableInStack() {
        for (let object of this._focusObjects) {
            if (object.get_ObjectType() == Asc.c_oAscTypeSelectElement.Table) {
                return true;
            }
        }
        return false;
    }

    get chartObject() {
        return !!this.intf ? this.intf.getChartObject() : null;
    }

    get linkObject() {
        return !!this.intf ? this.intf.getLinkObject() : null;
    }

    get isEditLocked() {
        if (this._focusObjects.length > 0) {
            let slide_deleted = false,
                slide_lock = false,
                no_object = true,
                objectLocked = false;
            this._focusObjects.forEach((object) => {
                const type = object.get_ObjectType();
                const objectValue = object.get_ObjectValue();
                if (type === Asc.c_oAscTypeSelectElement.Slide) {
                    slide_deleted = objectValue.get_LockDelete();
                    slide_lock = objectValue.get_LockLayout() || objectValue.get_LockBackground() || objectValue.get_LockTransition() || objectValue.get_LockTiming();
                } else if (objectValue && typeof objectValue.get_Locked === 'function') {
                    no_object = false;
                    objectLocked = objectLocked || objectValue.get_Locked();
                }
            });

            return (slide_deleted || (objectLocked || no_object) && slide_lock);
        }
    }
}
