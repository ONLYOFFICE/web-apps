import {action, observable, makeObservable} from 'mobx';

export class storePalette {
    constructor() {
        makeObservable(this, {
            customColors: observable,
            changeCustomColors: action,
            drawColors: observable,
            setDrawColors: action,
        });
    }
    
    customColors = [];
    changeCustomColors (colors) {
        this.customColors = colors;
    }

    drawColors = [];
    setDrawColors (colors) {
        this.drawColors = colors;
    }
}