import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";

import { EditTableContents } from '../../view/edit/EditTableContents';

class EditTableContentsController extends Component {
    constructor (props) {
        super(props);
    }

    onStyle(value) {
        const api = Common.EditorApi.get();
        const propsTableContents = api.asc_GetTableOfContentsPr();
    
        propsTableContents.put_StylesType(value);
        api.asc_SetTableOfContentsPr(propsTableContents);
    }

    onPageNumbers(value) {
        const api = Common.EditorApi.get();
        const propsTableContents = api.asc_GetTableOfContentsPr();

        propsTableContents.put_ShowPageNumbers(value);
        propsTableContents.put_RightAlignTab(value);
        api.asc_SetTableOfContentsPr(propsTableContents);
    }

    onRightAlign(value) {
        const api = Common.EditorApi.get();
        const propsTableContents = api.asc_GetTableOfContentsPr();

        propsTableContents.put_RightAlignTab(value);
        api.asc_SetTableOfContentsPr(propsTableContents);
    }

    onLeader(value) {
        const api = Common.EditorApi.get();
        const propsTableContents = api.asc_GetTableOfContentsPr();

        propsTableContents.put_TabLeader(value);
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
                onTableContentsUpdate={this.onTableContentsUpdate}
                onRemoveTableContents={this.onRemoveTableContents}
                onPageNumbers={this.onPageNumbers}
                onRightAlign={this.onRightAlign}
                onLeader={this.onLeader}
            />
        )
    }
}

export default EditTableContentsController;