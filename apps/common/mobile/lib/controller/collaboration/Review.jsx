import React, { Component } from 'react'
import Notifications from '../../../utils/notifications.js'
import {observer, inject} from "mobx-react"
import { withTranslation } from 'react-i18next';

import {PageReview, PageReviewChange} from "../../view/collaboration/Review";
import {LocalStorage} from "../../../utils/LocalStorage";

class InitReview extends Component {
    constructor(props){
        super(props);

        Common.Notifications.on('engineCreated', api => {
            api.asc_registerCallback('asc_onShowRevisionsChange', this.onChangeReview.bind(this));
        });

        Common.Notifications.on('document:ready', () => {
            const api = Common.EditorApi.get();
            const appOptions = props.storeAppOptions;

            var trackChanges = typeof (appOptions.customization) == 'object' ? appOptions.customization.trackChanges : undefined;
            api.asc_SetTrackRevisions(appOptions.isReviewOnly || trackChanges===true || (trackChanges!==false) && LocalStorage.getBool("de-mobile-track-changes-" + (appOptions.fileKey || '')));

            // Init display mode

            const canViewReview = appOptions.canReview || appOptions.isEdit || api.asc_HaveRevisionsChanges(true);
            if (!appOptions.canReview)
                appOptions.setCanViewReview(canViewReview);
            if (canViewReview) {
                let viewReviewMode = (appOptions.isEdit || appOptions.isRestrictedEdit) ? null : LocalStorage.getItem("de-view-review-mode");
                if (viewReviewMode === null)
                    viewReviewMode = appOptions.customization && /^(original|final|markup|simple)$/i.test(appOptions.customization.reviewDisplay) ? appOptions.customization.reviewDisplay.toLocaleLowerCase() : ( appOptions.isEdit || appOptions.isRestrictedEdit ? 'markup' : 'original');
                let displayMode = viewReviewMode.toLocaleLowerCase();
                let type = Asc.c_oAscDisplayModeInReview.Edit;
                switch (displayMode) {
                    case 'final':
                        type = Asc.c_oAscDisplayModeInReview.Final;
                        break;
                    case 'original':
                        type = Asc.c_oAscDisplayModeInReview.Original;
                        break;
                }
                api.asc_SetDisplayModeInReview(type);
                props.storeReview.changeDisplayMode(displayMode);
            }
        });
    }

    onChangeReview (data) {
        const storeReview = this.props.storeReview;
        storeReview.changeArrReview(data);
    }

    render() {
        return null
    }
}

class Review extends Component {
    constructor(props) {
        super(props);
        this.onTrackChanges = this.onTrackChanges.bind(this);
        this.onDisplayMode = this.onDisplayMode.bind(this);

        this.appConfig = props.storeAppOptions;
        this.editorPrefix = window.editorType || '';

        let trackChanges = typeof this.appConfig.customization == 'object' ? this.appConfig.customization.trackChanges : undefined;
        trackChanges = this.appConfig.isReviewOnly || trackChanges === true || trackChanges !== false
            && LocalStorage.getBool(`${this.editorPrefix}-mobile-track-changes-${this.appConfig.fileKey || ''}`);

        this.state = {
            trackChanges: trackChanges
        }
    }

    onTrackChanges (checked) {
        const api = Common.EditorApi.get();
        if ( this.appConfig.isReviewOnly ) {
            this.setState({trackChanges: true});
        } else {
            this.setState({trackChanges: checked});
            api.asc_SetTrackRevisions(checked);
            LocalStorage.setBool(`${this.editorPrefix}-mobile-track-changes-${this.appConfig.fileKey || ''}`, checked);
        }
    }

    onAcceptAll () {
        const api = Common.EditorApi.get();
        api.asc_AcceptAllChanges();
    }

    onRejectAll () {
        const api = Common.EditorApi.get();
        api.asc_RejectAllChanges();
    }

    onDisplayMode (mode) {
        const api = Common.EditorApi.get();
        let type = Asc.c_oAscDisplayModeInReview.Edit;
        switch (mode) {
            case 'final':
                type = Asc.c_oAscDisplayModeInReview.Final;
                break;
            case 'original':
                type = Asc.c_oAscDisplayModeInReview.Original;
                break;
        }
        api.asc_SetDisplayModeInReview(type);
        !this.appConfig.isEdit && !this.appConfig.isRestrictedEdit && LocalStorage.setItem("de-view-review-mode", mode);
        this.props.storeReview.changeDisplayMode(mode);
    }

    render() {
        const displayMode = this.props.storeReview.displayMode;
        const isReviewOnly = this.appConfig.isReviewOnly;
        const canReview = this.appConfig.canReview;
        const canUseReviewPermissions = this.appConfig.canUseReviewPermissions;
        const isRestrictedEdit = this.appConfig.isRestrictedEdit;
        return (
            <PageReview isReviewOnly={isReviewOnly}
                        canReview={canReview}
                        canUseReviewPermissions={canUseReviewPermissions}
                        isRestrictedEdit={isRestrictedEdit}
                        displayMode={displayMode}
                        trackChanges={this.state.trackChanges}
                        onTrackChanges={this.onTrackChanges}
                        onAcceptAll={this.onAcceptAll}
                        onRejectAll={this.onRejectAll}
                        onDisplayMode={this.onDisplayMode}
                        noBack={this.props.noBack}
            />
        )
    }
}

class ReviewChange extends Component {
    constructor (props) {
        super(props);
        this.onAcceptCurrentChange = this.onAcceptCurrentChange.bind(this);
        this.onRejectCurrentChange = this.onRejectCurrentChange.bind(this);
        this.onGotoNextChange = this.onGotoNextChange.bind(this);
        this.onDeleteChange = this.onDeleteChange.bind(this);

        this.appConfig = props.storeAppOptions;
    }
    
    dateToLocaleTimeString (date) {
        const format = (date) => {
            let strTime,
                hours = date.getHours(),
                minutes = date.getMinutes(),
                ampm = hours >= 12 ? 'pm' : 'am';

            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            strTime = hours + ':' + minutes + ' ' + ampm;

            return strTime;
        };

        // MM/dd/yyyy hh:mm AM
        return (date.getMonth() + 1) + '/' + (date.getDate()) + '/' + date.getFullYear() + ' ' + format(date);
    }
    getArrChangeReview (data) {
        const api = Common.EditorApi.get();

        const { t } = this.props;
        const _t = t("Common.Collaboration", { returnObjects: true });

        if (data.length === 0) return [];
        const arr = [];
        const c_paragraphLinerule = {
            LINERULE_LEAST: 0,
            LINERULE_AUTO: 1,
            LINERULE_EXACT: 2
        };
        data.forEach((item) => {
            let changeText = [], proptext = [],
                value = item.get_Value(),
                movetype = item.get_MoveType();
            switch (item.get_Type()) {
                case Asc.c_oAscRevisionsChangeType.TextAdd:
                    changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextAdd}`}><b>{movetype === Asc.c_oAscRevisionsMove.NoMove ? _t.textInserted : _t.textParaMoveTo}</b></label>);
                    if (typeof value == 'object') {
                        value.forEach( (obj) => {
                            if (typeof obj === 'string')
                                changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextAdd}-1`}> {Common.Utils.String.htmlEncode(obj)}</label>);
                            else {
                                switch (obj) {
                                    case 0:
                                        changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextAdd}-2`}> &lt;{_t.textImage}&gt;</label>);
                                        break;
                                    case 1:
                                        changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextAdd}-3`}> &lt;{_t.textShape}&gt;</label>);
                                        break;
                                    case 2:
                                        changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextAdd}-4`}> &lt;{_t.textChart}&gt;</label>);
                                        break;
                                    case 3:
                                        changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextAdd}-5`}> &lt;{_t.textEquation}&gt;</label>);
                                        break;
                                }
                            }
                        })
                    } else if (typeof value === 'string') {
                        changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextAdd}-6`}> {Common.Utils.String.htmlEncode(value)}</label>);
                    }
                    break;
                case Asc.c_oAscRevisionsChangeType.TextRem:
                    changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextRem}`}><b>{(movetype === Asc.c_oAscRevisionsMove.NoMove) ? _t.textDeleted : (item.is_MovedDown() ? _t.textParaMoveFromDown : _t.textParaMoveFromUp)}</b></label>);
                    if (typeof value == 'object') {
                        value.forEach( (obj) => {
                            if (typeof obj === 'string')
                                changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextRem}-1`}> {Common.Utils.String.htmlEncode(obj)}</label>);
                            else {
                                switch (obj) {
                                    case 0:
                                        changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextRem}-2`}> &lt;{_t.textImage}&gt;</label>);
                                        break;
                                    case 1:
                                        changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextRem}-3`}> &lt;{_t.textShape}&gt;</label>);
                                        break;
                                    case 2:
                                        changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextRem}-4`}> &lt;{_t.textChart}&gt;</label>);
                                        break;
                                    case 3:
                                        changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextRem}-5`}> &lt;{_t.textEquation}&gt;</label>);
                                        break;
                                }
                            }
                        })
                    } else if (typeof value === 'string') {
                        changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextRem}-6`}> {Common.Utils.String.htmlEncode(value)}</label>);
                    }
                    break;
                case Asc.c_oAscRevisionsChangeType.ParaAdd:
                    changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaAdd}`}><b>{_t.textParaInserted}</b> </label>);
                    break;
                case Asc.c_oAscRevisionsChangeType.ParaRem:
                    changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaRem}`}><b>{_t.textParaDeleted}</b> </label>);
                    break;
                case Asc.c_oAscRevisionsChangeType.TextPr:
                    if (value.Get_Bold() !== undefined)
                        proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-1`}>{(value.Get_Bold() ? '' : _t.textNot) + _t.textBold}</label>);
                    if (value.Get_Italic() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-02`}>, </label>);
                        proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-2`}>{(value.Get_Italic() ? '' : _t.textNot) + _t.textItalic}</label>);
                    }
                    if (value.Get_Underline() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-03`}>, </label>);
                        proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-3`}>{(value.Get_Underline() ? '' : _t.textNot) + _t.textUnderline}</label>);
                    }
                    if (value.Get_Strikeout() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-04`}>, </label>);
                        proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-4`}>{(value.Get_Strikeout() ? '' : _t.textNot) + _t.textStrikeout}</label>);
                    }
                    if (value.Get_DStrikeout() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-05`}>, </label>);
                        proptext.push(<label  key={`${Asc.c_oAscRevisionsChangeType.TextPr}-5`}>{(value.Get_DStrikeout() ? '' : _t.textNot) + _t.textDStrikeout}</label>);
                    }
                    if (value.Get_Caps() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-06`}>, </label>);
                        proptext.push(<label  key={`${Asc.c_oAscRevisionsChangeType.TextPr}-6`}>{(value.Get_Caps() ? '' : _t.textNot) + _t.textCaps}</label>);
                    }
                    if (value.Get_SmallCaps() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-07`}>, </label>);
                        proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-7`}>{(value.Get_SmallCaps() ? '' : _t.textNot) + _t.textSmallCaps}</label>);
                    }
                    if (value.Get_VertAlign() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-08`}>, </label>);
                        proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-8`}>{((value.Get_VertAlign() == 1) ? _t.textSuperScript : ((value.Get_VertAlign() == 2) ? _t.textSubScript : _t.textBaseline))}</label>);
                    }
                    if (value.Get_Color() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-09`}>, </label>);
                        proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-9`}>{_t.textColor}</label>);
                    }
                    if (value.Get_Highlight() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-010`}>, </label>);
                        proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-10`}>{_t.textHighlight}</label>);
                    }
                    if (value.Get_Shd() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-011`}>, </label>);
                        proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-11`}>{_t.textShd}</label>);
                    }
                    if (value.Get_FontFamily() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-012`}>, </label>);
                        proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-12`}>{value.Get_FontFamily()}</label>);
                    }
                    if (value.Get_FontSize() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-013`}>, </label>);
                        proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-13`}>{value.Get_FontSize()}</label>);
                    }
                    if (value.Get_Spacing() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-014`}>, </label>);
                        proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-14`}>{_t.textSpacing} {Common.Utils.Metric.fnRecalcFromMM(value.Get_Spacing()).toFixed(2)} {Common.Utils.Metric.getCurrentMetricName()}</label>);
                    }
                    if (value.Get_Position() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-015`}>, </label>);
                        proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-15`}>{_t.textPosition} {Common.Utils.Metric.fnRecalcFromMM(value.Get_Position()).toFixed(2)} {Common.Utils.Metric.getCurrentMetricName()}</label>);
                    }
                    if (value.Get_Lang() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-016`}>, </label>);
                        proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-16`}>{Common.util.LanguageInfo.getLocalLanguageName(value.Get_Lang())[1]}</label>);
                    }

                    if (proptext.length > 0) {
                        changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-17`}><b>{_t.textFormatted}: </b></label>);
                        proptext.forEach((item) => {
                            changeText.push(item);
                        });
                    } else {
                        changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.TextPr}-18`}><b>{_t.textFormatted}</b></label>);
                    }
                    break;
                case Asc.c_oAscRevisionsChangeType.ParaPr:
                    if (value.Get_ContextualSpacing())
                        proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaPr}-1`}>{(value.Get_ContextualSpacing() ? _t.textContextual : _t.textNoContextual)}</label>);
                    if (value.Get_IndLeft() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaPr}-02`}>, </label>);
                        proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaPr}-2`}>{_t.textIndentLeft} {Common.Utils.Metric.fnRecalcFromMM(value.Get_IndLeft()).toFixed(2)} {Common.Utils.Metric.getCurrentMetricName()}</label>);
                    }
                    if (value.Get_IndRight() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaPr}-03`}>, </label>);
                        proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaPr}-3`}>{_t.textIndentRight} {Common.Utils.Metric.fnRecalcFromMM(value.Get_IndRight()).toFixed(2)} {Common.Utils.Metric.getCurrentMetricName()}</label>);
                    }
                    if (value.Get_IndFirstLine() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaPr}-04`}>, </label>);
                        proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaPr}-4`}>{_t.textFirstLine} {Common.Utils.Metric.fnRecalcFromMM(value.Get_IndFirstLine()).toFixed(2)} {Common.Utils.Metric.getCurrentMetricName()}</label>);
                    }
                    if (value.Get_Jc() !== undefined) {
                        switch (value.Get_Jc()) {
                            case 0:
                                proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaPr}-05`}>, </label>);
                                proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaPr}-5`}>{_t.textRight}</label>);
                                break;
                            case 1:
                                proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaPr}-06`}>, </label>);
                                proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaPr}-6`}>{_t.textLeft}</label>);
                                break;
                            case 2:
                                proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaPr}-07`}>, </label>);
                                proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaPr}-7`}>{_t.textCenter}</label>);
                                break;
                            case 3:
                                proptext.length > 0 && proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaPr}-08`}>, </label>);
                                proptext.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaPr}-8`}>{_t.textJustify}</label>);
                                break;
                        }
                    }
                    if (value.Get_KeepLines() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`keepLines-01`}>, </label>);
                        proptext.push(<label key={`keepLines-1`}>{(value.Get_KeepLines() ? _t.textKeepLines : _t.textNoKeepLines)}</label>);
                    }
                    if (value.Get_KeepNext()) {
                        proptext.length > 0 && proptext.push(<label key={`keepNext-01`}>, </label>);
                        proptext.push(<label key={`keepNext-1`}>{(value.Get_KeepNext() ? _t.textKeepNext : _t.textNoKeepNext)}</label>);
                    }
                    if (value.Get_PageBreakBefore()) {
                        proptext.length > 0 && proptext.push(<label key={`breakBefore-01`}>, </label>);
                        proptext.push(<label key={`breakBefore-1`}>{(value.Get_PageBreakBefore() ? _t.textBreakBefore : _t.textNoBreakBefore)}</label>);
                    }
                    if (value.Get_SpacingLineRule() !== undefined && value.Get_SpacingLine() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`spacingLineRule-01`}>, </label>);
                        proptext.push(<label key={`spacingLineRule-1`}>{t.textLineSpacing}</label>);
                        proptext.push(<label key={`spacingLineRule-2`}>{((value.Get_SpacingLineRule() == c_paragraphLinerule.LINERULE_LEAST) ? _t.textAtLeast : ((value.Get_SpacingLineRule() == c_paragraphLinerule.LINERULE_AUTO) ? _t.textMultiple : _t.textExact))} </label>);
                        proptext.push(<label key={`spacingLineRule-3`}>{((value.Get_SpacingLineRule() == c_paragraphLinerule.LINERULE_AUTO) ? value.Get_SpacingLine() : Common.Utils.Metric.fnRecalcFromMM(value.Get_SpacingLine()).toFixed(2) + ' ' + Common.Utils.Metric.getCurrentMetricName())}</label>);
                    }
                    if (value.Get_SpacingBeforeAutoSpacing()) {
                        proptext.length > 0 && proptext.push(<label key={`spacingBeforeAutoSpacing-01`}>, </label>);
                        proptext.push(<label key={`spacingBeforeAutoSpacing-1`}>{_t.textSpacingBefore} {_t.textAuto}</label>);
                    }
                    else if (value.Get_SpacingBefore() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`spacingBefore-01`}>, </label>);
                        proptext.push(<label key={`spacingBefore-1`}>{_t.textSpacingBefore} {Common.Utils.Metric.fnRecalcFromMM(value.Get_SpacingBefore()).toFixed(2)} {Common.Utils.Metric.getCurrentMetricName()}</label>);
                    }
                    if (value.Get_SpacingAfterAutoSpacing()) {
                        proptext.length > 0 && proptext.push(<label key={`spacingAfterAutoSpacing-01`}>, </label>);
                        proptext.push(<label key={`spacingAfterAutoSpacing-1`}>{_t.textSpacingAfter} {_t.textAuto}</label>);
                    }
                    else if (value.Get_SpacingAfter() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`spacingAfter-01`}>, </label>);
                        proptext.push(<label key={`spacingAfter-1`}>{_t.textSpacingAfter} {Common.Utils.Metric.fnRecalcFromMM(value.Get_SpacingAfter()).toFixed(2)} {Common.Utils.Metric.getCurrentMetricName()}</label>);
                    }
                    if (value.Get_WidowControl()) {
                        proptext.length > 0 && proptext.push(<label key={`widowControl-01`}>, </label>);
                        proptext.push(<label key={`widowControl-1`}>{(value.Get_WidowControl() ? _t.textWidow : _t.textNoWidow)}</label>);
                    }
                    if (value.Get_Tabs() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`tabs-01`}>, </label>);
                        proptext.push(<label key={`tabs-1`}>{_t.textTabs}</label>);
                    }
                    if (value.Get_NumPr() !== undefined) {
                        proptext.length > 0 && proptext.push(<label key={`num-01`}>, </label>);
                        proptext.push(<label key={`num-1`}>{_t.textNum}</label>)
                    }
                    if (value.Get_PStyle() !== undefined) {
                        const style = api.asc_GetStyleNameById(value.Get_PStyle());
                        if (style.length > 0) {
                            proptext.length > 0 && proptext.push(<label key={`style-01`}>, </label>);
                            proptext.push(<label key={`style-1`}>{style}</label>);
                        }
                    }

                    if (proptext.length > 0) {
                        changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaPr}-9`}><b>{_t.textParaFormatted}: </b></label>);
                        proptext.forEach((item) => {
                            changeText.push(item);
                        });
                    } else {
                        changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaPr}-10`}><b>{_t.textParaFormatted}</b></label>);
                    }
                    break;
                case Asc.c_oAscRevisionsChangeType.TablePr:
                    changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaPr}-11`}><b>{_t.textTableChanged}</b></label>);
                    break;
                case Asc.c_oAscRevisionsChangeType.RowsAdd:
                    changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaPr}-12`}><b>{_t.textTableRowsAdd}</b></label>);
                    break;
                case Asc.c_oAscRevisionsChangeType.RowsRem:
                    changeText.push(<label key={`${Asc.c_oAscRevisionsChangeType.ParaPr}-13`}><b>{_t.textTableRowsDel}</b></label>);
                    break;

            }
            let date = (item.get_DateTime() == '') ? new Date() : new Date(item.get_DateTime());
            const user = item.get_UserName();
            const userColor = item.get_UserColor();
            const goto = (item.get_MoveType() == Asc.c_oAscRevisionsMove.MoveTo || item.get_MoveType() == Asc.c_oAscRevisionsMove.MoveFrom);
            date = this.dateToLocaleTimeString(date);
            const editable = this.appConfig.isReviewOnly && (item.get_UserId() == this.appConfig.user.id) || !this.appConfig.isReviewOnly && (!this.appConfig.canUseReviewPermissions || AscCommon.UserInfoParser.canEditReview(item.get_UserName()));
            arr.push({date: date, user: user, userColor: userColor, changeText: changeText, goto: goto, editable: editable});
        });
        return arr;
    }

    onPrevChange () {
        const api = Common.EditorApi.get();
        api.asc_GetPrevRevisionsChange();
    }

    onNextChange () {
        const api = Common.EditorApi.get();
        api.asc_GetNextRevisionsChange();
    }

    onAcceptCurrentChange () {
        const api = Common.EditorApi.get();
        api.asc_AcceptChanges(this.dataChanges[0]);
        setTimeout(() => {
            api.asc_GetNextRevisionsChange();
        });
    }

    onRejectCurrentChange () {
        const api = Common.EditorApi.get();
        api.asc_RejectChanges(this.dataChanges[0]);
        setTimeout(() => {
            api.asc_GetNextRevisionsChange();
        });
    }

    onGotoNextChange () {
        const api = Common.EditorApi.get();
        api.asc_FollowRevisionMove(this.dataChanges[0]);
    }

    onDeleteChange () {
        const api = Common.EditorApi.get();
        api.asc_RejectChanges(this.dataChanges[0]);
    }

    render() {
        this.dataChanges = this.props.storeReview.dataChanges;
        const arrChangeReview = this.getArrChangeReview(this.dataChanges);
        let change;
        let goto = false;
        if (arrChangeReview.length > 0) {
            const name = AscCommon.UserInfoParser.getParsedName(arrChangeReview[0].user);
            change = {
                date: arrChangeReview[0].date,
                user: arrChangeReview[0].user,
                userName: Common.Utils.String.htmlEncode(name),
                color: arrChangeReview[0].userColor.get_hex(),
                text: arrChangeReview[0].changeText,
                initials: this.props.users.getInitials(name),
                editable: arrChangeReview[0].editable
            };
            goto = arrChangeReview[0].goto;
        }

        const isReviewOnly = this.appConfig.isReviewOnly;
        const canReview = this.appConfig.canReview;
        const displayMode = this.props.storeReview.displayMode;

        return (
            <PageReviewChange change={change}
                              goto={goto}
                              isReviewOnly={isReviewOnly}
                              canReview={canReview}
                              displayMode={displayMode}
                              onPrevChange={this.onPrevChange}
                              onNextChange={this.onNextChange}
                              onAcceptCurrentChange={this.onAcceptCurrentChange}
                              onRejectCurrentChange={this.onRejectCurrentChange}
                              onGotoNextChange={this.onGotoNextChange}
                              onDeleteChange={this.onDeleteChange}
                              noBack={this.props.noBack}
            />
        )
    }
}


const InitReviewController = inject("storeAppOptions", "storeReview")(observer(InitReview));
const ReviewController = inject("storeAppOptions", "storeReview")(observer(Review));
const ReviewChangeController = withTranslation()(inject("storeAppOptions", "storeReview", "users")(observer(ReviewChange)));

export {InitReviewController, ReviewController, ReviewChangeController};