import {action, observable, computed} from 'mobx';

export class storeFocusObjects {
    @observable focusObjects = [];
    @observable headerType = 1;

    @action resetFocusObjects (objects) {
        this.focusObjects = objects;
        let _settings = [];
        for (let object of objects) {
            var type = object.get_ObjectType();
            if (Asc.c_oAscTypeSelectElement.Paragraph === type) {
                _settings.push('text', 'paragraph');
            } else if (Asc.c_oAscTypeSelectElement.Table === type) {
                _settings.push('table');
            } else if (Asc.c_oAscTypeSelectElement.Image === type) {
                if (object.get_ObjectValue().get_ChartProperties()) {
                    _settings.push('chart');
                } else if (object.get_ObjectValue().get_ShapeProperties()) {
                    _settings.push('shape');
                } else {
                    _settings.push('image');
                }
            } else if (Asc.c_oAscTypeSelectElement.Hyperlink === type) {
                _settings.push('hyperlink');
            } else if (Asc.c_oAscTypeSelectElement.Header === type) {
                _settings.push('header');
                this.headerType = object.get_ObjectValue().get_Type();
            }
        }
        // Exclude shapes if chart exist
        if (_settings.indexOf('chart') > -1) {
            _settings = _settings.filter((value) => value !== 'shape');
        }
        this.focusObjects = _settings.filter((value, index, self) => self.indexOf(value) === index);
    }
}