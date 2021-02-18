
import {observable, action} from 'mobx';

export class storeComments {
    @observable isOpenAddComment = false;

    @action openAddComment (open) {
        if (open !== this.isOpenAddComment) {
            this.isOpenAddComment = open;
        }
    }
}