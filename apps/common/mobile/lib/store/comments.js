
import {observable, action, computed} from 'mobx';

export class storeComments {
    @observable collectionComments = [];
    @observable groupCollectionComments = [];

    @action addComment (comment) {
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
        this.groupCollectionComments[groupname].push(comment);
        if (this.filter.indexOf(groupname) !== -1) {
            this.groupCollectionFilter.push(comment);
        }
    }

    @action removeComment (id) {
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
                if (this.filter.indexOf(name) !== -1) {
                    this.groupCollectionFilter.splice(this.groupCollectionFilter.indexOf(comment), 1);
                }
            }
        }
    }

    @observable filter; // for sse
    @observable groupCollectionFilter = []; // for sse

    @action changeFilter (filter) {
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
            const id = id.isArray() ? id[0] : id;
            model = store.find((item) => {
                return item.uid === id;
            });
            if (model) return model;
        }
        return model;
    }

    @computed get sortComments () {
        const comments = (this.groupCollectionFilter.length !== 0) ? this.groupCollectionFilter : (this.collectionComments.length !== 0 ? this.collectionComments : false);
        if (comments.length > 0) {
            return  [...comments].sort((a, b) => a.time > b.time ? 1 : -1);
        }
        return false;
    }

    // Add comment modal window
    @observable isOpenAddComment = false;

    @action openAddComment (open) {
        if (open !== this.isOpenAddComment) {
            this.isOpenAddComment = open;
        }
    }
}