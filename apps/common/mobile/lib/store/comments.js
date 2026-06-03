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

export class storeComments {
    constructor() {
        makeObservable(this, {
            collectionComments: observable,
            groupCollectionComments: observable,
            filter: observable,

            showComments: observable,
            changeShowComment: action,
            removeShowComment: action,

            addComment: action,
            removeComment: action,
            changeComment: action,
            changeFilter: action,

            groupCollectionFilter: computed,

            isOpenEditComment: observable,
            openEditComment: action,
            isOpenAddReply: observable,
            openAddReply: action,
            isOpenEditReply: observable,
            openEditReply: action
        })
    }
    collectionComments = [];
    groupCollectionComments = [];

    filter = undefined;

    showComments = [];
    changeShowComment (uid) {
        this.showComments.length = 0;
        uid.forEach((item) => {
            this.showComments.push(this.findComment(item));
        });
    }

    removeShowComment(id) {
        const index = this.showComments.findIndex((comment) => {
            return comment.uid === id;
        });

        if (index !== -1) {
            this.showComments.splice(index, 1);
        }
    }

    addComment (comment) {
        comment.groupName ? this.groupCollectionComments.push(comment) : this.collectionComments.push(comment);
    }

    removeComment (id) {
        const collection = this.collectionComments.length > 0 ? this.collectionComments : this.groupCollectionComments;
        const index = collection.findIndex((comment) => {
            return comment.uid === id;
        });
        if (index !== -1) {
            collection.splice(index, 1);
        }
        this.removeShowComment(id);
    }

    changeComment (id, changeComment) {
        const comment = this.findComment(id);
        if (comment) {
            comment.comment = changeComment.comment;
            comment.userId = changeComment.userId;
            comment.userName = changeComment.userName;
            comment.parsedName = changeComment.parsedName;
            comment.userInitials = changeComment.userInitials;
            comment.userColor = changeComment.userColor;
            comment.resolved = changeComment.resolved;
            comment.quote = changeComment.quote;
            comment.time = changeComment.time;
            comment.date = changeComment.date;
            comment.editable = changeComment.editable;
            comment.removable = changeComment.removable;
            comment.replies = changeComment.replies;
            comment.hide =changeComment.hide;
        }
    }

    changeFilter (filter) {
        this.filter = filter;
    }

    findComment (id) {
        const collection = this.collectionComments.length > 0 ? this.collectionComments : this.groupCollectionComments;
        let comment = collection.find((item) => {
            return item.uid === id;
        });
        return comment;
    }

    get groupCollectionFilter () {
        if (this.filter && this.groupCollectionComments.length > 0) {
            const arr = [];
            this.filter.forEach((groupName) => {
                this.groupCollectionComments.forEach((comment) => {
                    if (comment.groupName === groupName) {
                        arr.push(comment);
                    }
                });
            });
            return arr;
        }
        return false;
    }

    // Edit comment
    currentComment = null;
    isOpenEditComment = false;
    openEditComment (open, comment) {
        if (open !== this.isOpenEditComment) {
            this.currentComment = open ? comment : null;
            this.isOpenEditComment = open;
        }
    }

    currentReply = null;
    isOpenAddReply = false;
    openAddReply (open, comment) {
        if (open !== this.isOpenAddReply) {
            this.currentComment = open ? comment : null;
            this.isOpenAddReply = open;
        }
    }

    isOpenEditReply = false;
    openEditReply (open, comment, reply) {
        if (open !== this.isOpenEditReply) {
            this.currentComment = open ? comment : null;
            this.currentReply = open ? reply : null;
            this.isOpenEditReply = open;
        }
    }
}
