
import {observable, action, computed} from 'mobx';

export class storeUsers {
    @observable users = [];

    @action reset(users) {
        this.users = Object.values(users)
    }

    @observable currentUser;

    @action setCurrentUser(id) {
        this.users.forEach((item) => {
            if (item.asc_getIdOriginal() === id) {
                this.currentUser = item;
            }
        });
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
}
