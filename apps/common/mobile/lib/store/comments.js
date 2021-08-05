
import {makeObservable, observable, action, computed} from 'mobx';

export class storeComments {
    constructor() {
        makeObservable(this, {
            collectionComments: observable,
            groupCollectionComments: observable,
            filter: observable,

            showComments: observable,
            changeShowComment: action,

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