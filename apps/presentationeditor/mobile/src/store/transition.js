import {action, observable} from 'mobx';

export class storeTransition {

    @observable effect;
    
    @action changeEffect(value) {
        this.effect = value;
    }
}