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

import {makeObservable, observable, action, computed} from 'mobx';

export class storeUsers {
    constructor() {
        makeObservable(this, {
            users: observable,
            reset: action,
            addUser: action,
            currentUser: observable,
            setCurrentUser: action,
            connection: action,
            isDisconnected: observable,
            resetDisconnected: action,
            hasEditUsers: computed,
            editUsers: computed
        })
    }

    users = [];
    currentUser;
    isDisconnected = false;

    reset (users) {
        this.users = Object.values(users)
    }

    addUser (user) {
        this.users.push(user);
    }

    setCurrentUser (id) {
        this.users.forEach((item) => {
            if (item.asc_getIdOriginal() === id) {
                this.currentUser = item;
            }
        });
        return this.currentUser;
    }

    connection (change) {
        let changed = false;
        for (let uid in this.users) {
            if (undefined !== uid) {
                const user = this.users[uid];
                if (user && user.asc_getId() === change.asc_getId()) {
                    this.users[uid] = change;
                    changed = true;
                }
            }
        }
        !changed && change && (this.users.push(change));
    }

    resetDisconnected (isDisconnected) {
        this.isDisconnected = isDisconnected;
    }

    getInitials (name) {
        const fio = name.split(' ');
        let initials = fio[0].substring(0, 1).toUpperCase();
        for (let i = fio.length-1; i>0; i--) {
            if (fio[i][0]!=='(' && fio[i][0]!==')') {
                initials += fio[i].substring(0, 1).toUpperCase();
                break;
            }
        }
        return initials;
    }

    searchUserById (id) {
        let user = null;
        this.users.forEach((item) => {
            if (item.asc_getIdOriginal() === id) {
                user = item;
            }
        });
        return user;
    }

    searchUserByCurrentId (id) {
        let user = null;
        this.users.forEach((item) => {
            if (item.asc_getId() === id) {
                user = item;
            }
        });
        return user;
    }

    get hasEditUsers () {
        let length = 0;
        this.users.forEach((item) => {
            if ((item.asc_getState()!==false) && !item.asc_getView()) {
                length++;
            }
        });
        return (length >= 1);
    }

    get editUsers () {
        const idArray = [];
        const usersArray = [];
        const curUserId = this.currentUser.asc_getIdOriginal();
        this.users.forEach((item) => {
            const name = AscCommon.UserInfoParser.getParsedName(item.asc_getUserName());
            if((item.asc_getState() !== false) && !item.asc_getView()) {
                const idOriginal = item.asc_getIdOriginal();
                const ind = idArray.indexOf(idOriginal);
                if (ind !== -1) {
                    usersArray[ind].count = usersArray[ind].count + 1;
                } else {
                    const userAttr = {
                        color: item.asc_getColor(),
                        id: item.asc_getId(),
                        idOriginal: item.asc_getIdOriginal(),
                        name: name,
                        view: item.asc_getView(),
                        initials: this.getInitials(name),
                        count: 1
                    };
                    if(idOriginal === curUserId) {
                        usersArray.unshift(userAttr);
                        idArray.unshift(idOriginal);
                    } else {
                        usersArray.push(userAttr);
                        idArray.push(idOriginal);
                    }
                }
            }
        });
        return usersArray;
    }
}
