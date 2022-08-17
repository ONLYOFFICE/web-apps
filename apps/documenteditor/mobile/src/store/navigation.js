import {action, observable, makeObservable} from 'mobx';

export class storeNavigation { 
    constructor() {
        makeObservable(this, {
            bookmarks: observable,
            initBookmarks: action
        });
    }

    bookmarks = [];

    initBookmarks(bookmarks) {
        this.bookmarks = bookmarks;
    }
}