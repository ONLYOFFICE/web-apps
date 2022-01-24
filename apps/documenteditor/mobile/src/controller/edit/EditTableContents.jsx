import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";

import { EditTableContents } from '../../view/edit/EditTableContents';

class EditTableContentsController extends Component {
    constructor (props) {
        super(props);
    }

    onStyle(value, type) {
        const api = Common.EditorApi.get();
        const propsTableContents = api.asc_GetTableOfContentsPr();
        propsTableContents.put_StylesType(value);

        if (type === 1) {
            let checked = (value !== Asc.c_oAscTOFStylesType.Centered);
            propsTableContents.put_RightAlignTab(checked);
            // checked && properties.put_TabLeader(this.cmbLeader.getValue());
        }
        console.log(propsTableContents);
        api.asc_SetTableOfContentsPr(propsTableContents);
    }

    onTableContentsUpdate(type, currentTOC) {
        const api = Common.EditorApi.get();
        let props = api.asc_GetTableOfContentsPr(currentTOC);

        if (props) {
            if (currentTOC && props)
                currentTOC = props.get_InternalClass();
            api.asc_UpdateTableOfContents(type == 'pages', currentTOC);
        }
    };

    onRemoveTableContents(currentTOC) {
        const api = Common.EditorApi.get();
        currentTOC = !!currentTOC;
        let props = api.asc_GetTableOfContentsPr(currentTOC);

        currentTOC = (currentTOC && props) ? props.get_InternalClass() : undefined;
        api.asc_RemoveTableOfContents(currentTOC);
    }

    render () {
        return (
            <EditTableContents 
                onStyle={this.onStyle} 
            />
        )
    }
}

export default EditTableContentsController;