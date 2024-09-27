import React, {Component} from 'react';
import {observer, inject} from "mobx-react";
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {LocalStorage} from '../../../../../common/mobile/utils/LocalStorage.mjs';
import {AddFunction} from '../../view/add/AddFunction';

class _FunctionGroups extends Component {
    constructor (props) {
        super(props);

        Common.Notifications.on('changeFuncLang', () => {
            this.api = Common.EditorApi.get();
            this.init();
        });

        Common.Notifications.on('changeRegSettings', () => {
            this.api = Common.EditorApi.get();
            this.init();
        });
    }
    componentDidMount() {
        Common.Notifications.on('document:ready', () => {
            this.api = Common.EditorApi.get();
            this.init();
        });
    }
    init () {
        const editorLang = LocalStorage.getItem('sse-settings-func-lang');
        this._editorLang = (editorLang ? editorLang : 'en').split(/[\-\_]/)[0].toLowerCase();
        const localizationFunctions = (data) => {
            this.api.asc_setLocalization(data, this._editorLang);
            this.fill(data);
        };

        fetch(`locale/l10n/functions/${this._editorLang}.json`)
            .then(response => response.json())
            .then((data) => {
                localizationFunctions(data);
            });
    }
    fill () {
        this._functions = {};
        const localizationFunctionsDesc = (data) => {
            let jsonDesc = {};
            try {
                jsonDesc = JSON.parse(data);
            } catch (e) {
                jsonDesc = data;
            }
            const grouparr = this.api.asc_getFormulasInfo();
            const separator = this.api.asc_getFunctionArgumentSeparator();
            this.props.storeFunctions.initFunctions(grouparr, jsonDesc, separator);
        };

        fetch(`locale/l10n/functions/${this._editorLang}_desc.json`)
            .then(response => response.json())
            .then((data) => {
                localizationFunctionsDesc(data);
            });
    }
    render() {
        return null;
    }
}
const FunctionGroups = inject("storeFunctions")(observer(_FunctionGroups));

class AddFunctionController extends Component {
    constructor (props) {
        super(props);
        this.onInsertFunction = this.onInsertFunction.bind(this);
    }

    closeModal () {
        if ( Device.phone ) {
            f7.sheet.close('.add-popup', true);
        } else {
            f7.popover.close('#add-popover');
        }
    }

    onInsertFunction (type) {
        const api = Common.EditorApi.get();
        api.asc_insertInCell(api.asc_getFormulaLocaleName(type), Asc.c_oAscPopUpSelectorType.Func, true);
        this.closeModal();
    }

    render () {
        return (
            <AddFunction onInsertFunction={this.onInsertFunction} />
        )
    }
}

export {FunctionGroups, AddFunctionController};