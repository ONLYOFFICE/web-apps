import {action, observable} from 'mobx';

export class storeTheme {

    @observable arrayThemes;
    @observable slideThemeIndex;
  
    @action addArrayThemes(array) {
        this.arrayThemes = array;
    }

    @action changeSlideThemeIndex(index) {
        this.slideThemeIndex = index;
    }
}