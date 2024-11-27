import {action, observable, makeObservable} from 'mobx';
import { LocalStorage } from '../../../../common/mobile/utils/LocalStorage.mjs';

export class storeApplicationSettings {
    constructor() {
        makeObservable(this, {
            // macrosMode: observable,
            // macrosRequest: observable,
            // changeMacrosSettings: action,
            // changeMacrosRequest: action,
        });
    }

    // macrosMode = 0;
    // macrosRequest = 0;

    // changeMacrosSettings(value) {
    //     this.macrosMode = +value;
    // }
    //
    // changeMacrosRequest(value) {
    //     this.macrosRequest = value;
    // }
}