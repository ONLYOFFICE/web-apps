import {action, observable, computed} from 'mobx';

export class storeParagraphSettings {
    @observable styles = [];
    @observable styleThumbSize = null;
    @observable styleName = undefined;

    @action initEditorStyles (styles) {
        this.styles = styles.get_MergedStyles();
        this.styleThumbSize = {
            width   : styles.STYLE_THUMBNAIL_WIDTH,
            height  : styles.STYLE_THUMBNAIL_HEIGHT
        };
    }
    @computed get paragraphStyles () {
        let _styles = [];
        for (let style of this.styles) {
            _styles.push({
                image   : style.asc_getImage(),
                name    : style.get_Name()
            });
        }
        return _styles;
    }
    @action changeParaStyleName (name) {
        this.styleName = name;
    }
}