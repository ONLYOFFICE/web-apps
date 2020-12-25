import {action, observable} from 'mobx';

export class storeTransition {
   
    @observable isDelay = false;
    @observable transitionObj = {};

    @action toggleDelay() {
        this.isDelay = !this.isDelay;
    }

    @action addTransitionObj(obj) {
        this.transitionObj = obj;
    }
}