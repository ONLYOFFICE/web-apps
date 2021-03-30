
import {makeObservable, observable, action} from 'mobx';

export class storeUsers {
    constructor() {
        makeObservable(this, {
            users: observable,
            reset: action,
            currentUser: observable,
            setCurrentUser: action,
            connection: action,
            isDisconnected: observable,
            resetDisconnected: action
        })
    }

    users = [];
    currentUser;
    isDisconnected = false;

    reset (users) {
        this.users = Object.values(users)
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
        !changed && change && (this.users[change.asc_getId()] = change);
    }

    resetDisconnected (isDisconnected) {
        this.isDisconnected = isDisconnected;
    }

    getInitials (name) {
        const fio = Common.Utils.UserInfoParser.getParsedName(name).split(' ');
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
}
