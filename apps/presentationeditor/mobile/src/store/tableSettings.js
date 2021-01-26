import {action, observable, computed} from 'mobx';
import {f7} from 'framework7-react';

export class storeTableSettings {
    @observable _templates = [];

    @action initTableTemplates(templates) {
        this._templates = templates;
    }

    @computed get styles() {
        let styles = [];
        for (let template of this._templates) {
            styles.push({
                imageUrl: template.asc_getImage(),
                templateId: template.asc_getId()
            });
        }
        return styles;
    }
}