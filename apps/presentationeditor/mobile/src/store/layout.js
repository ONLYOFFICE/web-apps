import {action, observable} from 'mobx';

export class storeLayout {
   
    @observable arrayLayouts;
  
    @action addArrayLayouts(array) {
        this.arrayLayouts = array;
    }

}