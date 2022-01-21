import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {AddTableContents} from '../../view/add/AddTableContents';

class AddTableContentsController extends Component {
    constructor (props) {
        super(props);
    }

    closeModal () {
        if ( Device.phone ) {
            f7.sheet.close('.add-popup', true);
        } else {
            f7.popover.close('#add-popover');
        }
    }

    componentDidMount () {
        const api = Common.EditorApi.get();
        api.asc_getButtonsTOC('toc1', 'toc2');
    }

    onTableContents(type, currentTOC) {
        const api = Common.EditorApi.get();
        let props = api.asc_GetTableOfContentsPr(currentTOC);

        switch (type) {
            case 0:
                if (!props) {
                    props = new Asc.CTableOfContentsPr();
                    props.put_OutlineRange(1, 9);
                }
                props.put_Hyperlink(true);
                props.put_ShowPageNumbers(true);
                props.put_RightAlignTab(true);
                props.put_TabLeader(Asc.c_oAscTabLeader.Dot);
                api.asc_AddTableOfContents(null, props);
                break;
            case 1:
                if (!props) {
                    props = new Asc.CTableOfContentsPr();
                    props.put_OutlineRange(1, 9);
                }
                props.put_Hyperlink(true);
                props.put_ShowPageNumbers(false);
                props.put_TabLeader(Asc.c_oAscTabLeader.None);
                props.put_StylesType(Asc.c_oAscTOCStylesType.Web);
                api.asc_AddTableOfContents(null, props);
                break;
        }
    }

    render () {
        return (
            <AddTableContents onTableContents={this.onTableContents} />
        )
    }
}

export default AddTableContentsController;