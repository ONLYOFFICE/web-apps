import {action, observable, makeObservable} from 'mobx';

export class storeLinkSettings {
    constructor() {
        makeObservable(this, {
            canAddLink: observable,
            canAddHyperlink: action
        });
    }

    canAddLink;

    canAddHyperlink (value) {
        this.canAddLink = value;
    }
}
