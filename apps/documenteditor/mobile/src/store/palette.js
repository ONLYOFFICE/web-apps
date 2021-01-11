import {action, observable} from 'mobx';

export class storePalette {
    @observable customColors = [];

    @action changeCustomColors (colors) {
        this.customColors = colors;
    }
}