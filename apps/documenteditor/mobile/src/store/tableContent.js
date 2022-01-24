import {action, observable, computed, makeObservable} from 'mobx';

export class storeTableContent {
    constructor() {
        makeObservable(this, {
            type: observable,
            changeType: action,
            options: observable,
            initSettings: action
        });
    }

    type = 0;

    changeType(value) {
        this.type = value;
    }

    options = {
        contentWidth: 500,
        height: 455
    };

    initSettings(props) {
        // if (props) {
        //     // var value = props.get_Hyperlink();
        //     // this.chLinks.setValue((value !== null && value !== undefined) ? value : 'indeterminate', true);
        //     let value = props.get_StylesType();
            
        //     this.cmbStyles.setValue((value!==null) ? value : Asc.c_oAscTOCStylesType.Current);
        //     value = props.get_ShowPageNumbers();
        //     this.chPages.setValue((value !== null && value !== undefined) ? value : 'indeterminate');
        //     if (this.chPages.getValue() == 'checked') {
        //         value = props.get_RightAlignTab();
        //         this.chAlign.setValue((value !== null && value !== undefined) ? value : 'indeterminate');
        //         if (this.chAlign.getValue() == 'checked') {
        //             value = props.get_TabLeader();
        //             (value!==undefined) && this.cmbLeader.setValue(value);
        //         }
        //     } else {
        //         (this.type==1) && (this.cmbStyles.getValue()==Asc.c_oAscTOFStylesType.Centered) && this.chAlign.setValue(false);
        //     }
        // }

        // (this.type==1) ? this.fillTOFProps(props) : this.fillTOCProps(props);

        // // Show Pages is always true when window is opened
        // this._originalProps = (props) ? props : new Asc.CTableOfContentsPr();
        // if (!props) {
        //     if (this.type==1) {
        //         this._originalProps.put_Caption(this.textFigure);
        //         this._originalProps.put_IncludeLabelAndNumber(this.chFullCaption.getValue() == 'checked');
        //     } else {
        //         this._originalProps.put_OutlineRange(this.startLevel, this.endLevel);
        //     }
        //     this._originalProps.put_Hyperlink(this.chLinks.getValue() == 'checked');
        //     this._originalProps.put_ShowPageNumbers(this.chPages.getValue() == 'checked');
        //     if (this.chPages.getValue() == 'checked') {
        //         this._originalProps.put_RightAlignTab(this.chAlign.getValue() == 'checked');
        //         this._originalProps.put_TabLeader(this.cmbLeader.getValue());
        //     }
        // }

        // (this.type==1) ? this.api.SetDrawImagePlaceTableOfFigures('tableofcontents-img', this._originalProps) : this.api.SetDrawImagePlaceContents('tableofcontents-img', this._originalProps);
        // this.scrollerY.update();
    }
}