import {action, observable, computed} from 'mobx';

export class storeLinkSettings {
    @observable canAddLink;
    @action canAddHyperlink (value) {
        this.canAddLink = value;
    }
}
