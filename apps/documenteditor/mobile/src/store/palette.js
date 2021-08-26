import {action, observable, makeObservable} from 'mobx';

export class storePalette {
    constructor() {
        makeObservable(this, {
            customColors: observable,
            changeCustomColors: action
        });
    }
    
    customColors = [];

    changeCustomColors (colors) {
        this.customColors = colors;
    }
}