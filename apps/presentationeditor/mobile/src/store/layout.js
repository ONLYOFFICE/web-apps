import {action, observable} from 'mobx';

export class storeLayout {
   
    @observable arrayLayouts;
    @observable slideLayoutIndex = -1;
  
    @action addArrayLayouts(array) {
        this.arrayLayouts = array;
    }

    @action changeSlideLayoutIndex(index) {
        this.slideLayoutIndex = index;
    }

}