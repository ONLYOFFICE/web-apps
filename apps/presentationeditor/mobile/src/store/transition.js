import {action, observable} from 'mobx';

export class storeTransition {
   
    @observable transition = {};
    @observable isDelay = false;
    @observable isStartOnClick = true;

    @action toggleDelay() {
        this.isDelay = !this.isDelay;
    }

    @action toggleStartOnClick() {
        this.isStartOnClick = !this.isStartOnClick;
    }

    @action addTransition(obj) {
        this.transition = obj;
    }
}