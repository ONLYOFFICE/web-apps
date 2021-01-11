import {action, observable} from 'mobx';

export class storeTransition {

    @observable effect;
    @observable type;
    
    @action changeEffect(value) {
        this.effect = value;
    }

    @action changeType(value) {
        this.type = value;
    }
}