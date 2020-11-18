import React, {Component} from 'react';

import EditHeader from '../../view/edit/EditHeader';

class EditHeaderController extends Component {
    constructor (props) {
        super(props);
    }

    onDiffFirst (value) {
        const api = Common.EditorApi.get();
        if (api) {
            api.HeadersAndFooters_DifferentFirstPage(value);
        }
    }

    onDiffOdd (value) {
        const api = Common.EditorApi.get();
        if (api) {
            api.HeadersAndFooters_DifferentOddandEvenPage(value);
        }
    }

    onSameAs (value) {
        const api = Common.EditorApi.get();
        if (api) {
            api.HeadersAndFooters_LinkToPrevious(value);
        }
    }

    onNumberingContinue (isChecked, value) {
        const api = Common.EditorApi.get();
        if (api) {
            api.asc_SetSectionStartPage(isChecked ? -1 : value);
        }
    }

    onStartAt (value, isDecrement) {
        const api = Common.EditorApi.get();
        if (api) {
            let start = value;
            if (isDecrement) {
                start = Math.max(1, --start);
            } else {
                start = Math.min(2147483646, ++start);
            }
            api.asc_SetSectionStartPage(start);
        }
    }

    render () {
        return (
            <EditHeader onDiffFirst={this.onDiffFirst}
                        onDiffOdd={this.onDiffOdd}
                        onSameAs={this.onSameAs}
                        onNumberingContinue={this.onNumberingContinue}
                        onStartAt={this.onStartAt}
            />
        )
    }
}

export default EditHeaderController;