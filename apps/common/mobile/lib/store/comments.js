
import {makeObservable, observable, action, computed} from 'mobx';

export class storeComments {
    constructor() {
        makeObservable(this, {
            collectionComments: observable,
            groupCollectionComments: observable,
            filter: observable,
            groupCollectionFilter: observable,

            showComments: observable,
            changeShowComment: action,

            addComment: action,
            removeComment: action,
            changeComment: action,
            changeFilter: action,

            sortComments: computed,

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
    groupCollectionFilter = []; // for sse

    showComments = [];
    changeShowComment (uid) {
        this.showComments.length = 0;
        uid.forEach((item) => {
            this.showComments.push(this.findComment(item));
        });
    }

    addComment (comment) {
        comment.groupName ? this.addCommentToGroupCollection(comment) : this.addCommentToCollection(comment);
    }

    addCommentToCollection (comment) {
        this.collectionComments.push(comment);
    }

    addCommentToGroupCollection (comment) {
        const groupName = comment.groupName;
        if (!this.groupCollectionComments[groupName]) {
            this.groupCollectionComments[groupName] = [];
        }
        this.groupCollectionComments[groupName].push(comment);
        if (typeof this.filter === 'object' && this.filter.indexOf(groupName) !== -1) {
            this.groupCollectionFilter.push(comment);
        }
    }

    removeComment (id) {
        if (this.collectionComments.length > 0) {
            this.removeCommentFromCollection(id);
        } else {
            this.removeCommentFromGroups(id);
        }
    }

    removeCommentFromCollection (id) {
        const index = this.collectionComments.findIndex((comment) => {
            return comment.uid === id;
        });
        if (index !== -1) {
            this.collectionComments.splice(index, 1);
        }
    }

    removeCommentFromGroups (id) {
        for (let name in this.groupCollectionComments) {
            const store = this.groupCollectionComments[name];
            const comment = store.find((item) => {
                return item.uid === id;
            });
            const index = store.indexOf(comment);
            if (index !== -1) {
                this.groupCollectionComments[name].splice(index, 1);
                if (typeof this.filter === 'object' && this.filter.indexOf(name) !== -1) {
                    this.groupCollectionFilter.splice(this.groupCollectionFilter.indexOf(comment), 1);
                }
            }
        }
    }

    changeComment (id, changeComment) {
        const comment = this.findComment(id);
        if (comment) {
            comment.comment = changeComment.comment;
            comment.userId = changeComment.userId;
            comment.userName = changeComment.userName;
            comment.userColor = changeComment.userColor;
            comment.resolved = changeComment.resolved;
            comment.quote = changeComment.quote;
            comment.time = changeComment.time;
            comment.date = changeComment.date;
            comment.editable = changeComment.editable;
            comment.removable = changeComment.removable;
            comment.replies = changeComment.replies;
        }
    }

    changeFilter (filter) {
        let comments = [];
        this.filter = filter;
        filter.forEach((item) => {
            if (!this.groupCollectionComments[item])
                this.groupCollectionComments[item] = [];
            comments = comments.concat(this.groupCollectionComments[item]);
        });
        this.groupCollectionFilter = comments;
    }

    findComment (id) {
        let comment = this.collectionComments.find((item) => {
            return item.uid === id;
        });
        if (!comment) {
            comment = this.findCommentInGroup(id);
        }
        return comment;
    }

    findCommentInGroup (id) {
        let model;
        for (let name in this.groupCollectionComments) {
            const store = this.groupCollectionComments[name];
            const uid = typeof id === 'object' && id.isArray() ? id[0] : id;
            model = store.find((item) => {
                return item.uid === uid;
            });
            if (model) return model;
        }
        return model;
    }

    get sortComments () {
        const comments = (this.groupCollectionFilter.length !== 0) ? this.groupCollectionFilter : (this.collectionComments.length !== 0 ? this.collectionComments : false);
        if (comments.length > 0) {
            return  [...comments].sort((a, b) => a.time > b.time ? 1 : -1);
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