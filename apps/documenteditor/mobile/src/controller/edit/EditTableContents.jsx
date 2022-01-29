import React, {Component} from 'react';
import { f7 } from 'framework7-react';
import {Device} from '../../../../../common/mobile/utils/device';
import {observer, inject} from "mobx-react";

import { EditTableContents } from '../../view/edit/EditTableContents';

class EditTableContentsController extends Component {
    constructor (props) {
        super(props);

        this.startLevel = 1;
        this.endLevel = 3;
        this.fillTOCProps = this.fillTOCProps.bind(this);
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

    onLevelsChange(value) {
        const api = Common.EditorApi.get();
        const propsTableContents = api.asc_GetTableOfContentsPr();

        propsTableContents.clear_Styles();
        propsTableContents.put_OutlineRange(1, value);
        api.asc_SetTableOfContentsPr(propsTableContents);
    }

    fillTOCProps(props) {
        const api = Common.EditorApi.get();
        const docStyles = api.asc_GetStylesArray();

        let checkStyles = false,
            disableOutlines = false,
            styles = [];

        docStyles.forEach(style => {
            let name = style.get_Name(),
                level = api.asc_GetHeadingLevel(name);

            if (style.get_QFormat() || level >= 0) { 
                styles.push({
                    name: name,
                    displayValue: style.get_TranslatedName(),
                    allowSelected: false,
                    checked: false,
                    value: '',
                    headerLevel: (level >= 0) ? level + 1 : -1 
                })
            }
        });

        console.log(styles);

        if(props) {
            let start = props.get_OutlineStart(),
                end = props.get_OutlineEnd(),
                count = props.get_StylesCount();

            this.startLevel = start;
            this.endLevel = end;
            this.count = count;

            if ((start < 0 || end < 0) && count < 1) {
                start = 1;
                end = 9;
                // this.spnLevels.setValue(end, true);
            }

            for (let i = 0; i < count; i++) {
                let styleName = props.get_StyleName(i),
                    level = props.get_StyleLevel(i),
                    rec = styles.find(style => style.name == styleName);
        
                if (rec) {
                    rec.checked = true;
                    rec.value = level;
                    if (rec.headerLevel !== level)
                        disableOutlines = true;
                } else {
                    styles.push({
                        name: styleName,
                        displayValue: styleName,
                        allowSelected: false,
                        checked: true,
                        value: level,
                        headerLevel: -1
                    });

                    disableOutlines = true;
                }
            }

            if (start > 0 && end > 0) {
                for (let i = start; i <= end; i++) {
                    let rec = styles.find(style => style.headerLevel === i);
        
                    if (rec) {
                        rec.checked = true;
                        rec.value = i;
                    }
                }
            }

            let newStart = -1, 
                newEnd = -1, 
                emptyIndex = -1;

            for (let i = 0; i < 9; i++) {
                let rec = styles.find(style => style.headerLevel === i + 1);

                if (rec) {
                    let headerLevel = rec.headerLevel,
                        level = rec.value;

                    if (headerLevel == level) {
                        if (emptyIndex < 1) {
                            if (newStart < 1)
                                newStart = level;
                            newEnd = level;
                        } else {
                            newStart = newEnd = -1;
                            disableOutlines = true;
                            break;
                        }
                    } else if (!rec.checked) {
                        (newStart > 0) && (emptyIndex = i + 1);
                    } else {
                        newStart = newEnd = -1;
                        disableOutlines = true;
                        break;
                    }
                }
            }

            // this.spnLevels.setValue(newEnd > 0 ? newEnd : '', true);
            checkStyles = (disableOutlines || newStart > 1);
        } else {
            for (let i = this.startLevel; i <= this.endLevel; i++) {
                let rec = styles.find(style => style.headerLevel === i);

                if (rec) {
                    rec.checked = true;
                    rec.value = i;
                }
            }
        }

        styles.sort(function(a, b) {
            let aname = a.displayValue.toLocaleLowerCase(),
                bname = b.displayValue.toLocaleLowerCase();
            if (aname < bname) return -1;
            if (aname > bname) return 1;
            return 0;
        });

        return {
            styles, 
            start: this.startLevel,
            end: this.endLevel,
            count: this.count,
            disableOutlines,
            checkStyles
        }
    }

    addStyles(styleName, value) {
        const api = Common.EditorApi.get();
        const propsTableContents = api.asc_GetTableOfContentsPr();

        // propsTableContents.clear_Styles();
        propsTableContents.add_Style(styleName, value);

        // if (propsTableContents.get_StylesCount() > 0)
        //     propsTableContents.put_OutlineRange(-1, -1);
        // else
        //     propsTableContents.put_OutlineRange(1, 9);

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
                onLevelsChange={this.onLevelsChange}
                fillTOCProps={this.fillTOCProps}
                addStyles={this.addStyles}
            />
        )
    }
}

export default EditTableContentsController;