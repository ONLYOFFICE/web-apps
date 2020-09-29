
import {observable, action} from 'mobx';

export class storeUsers {
    @observable users = []

    @action reset(users) {
        this.users = Object.values(users)
    }
}
