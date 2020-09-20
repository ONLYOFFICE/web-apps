import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changePageOrient } from '../store/actions/actions';
import DocumentSettingsView from '../components/settings/document-settings/DocumentSettings';

const DocumentSettingsController = connect(
    state => ({
        isPortrait: state.settings.isPortrait
    }),
    dispatch => bindActionCreators({
        changePageOrient
    }, dispatch)
)(DocumentSettingsView);

export { DocumentSettingsController as DocumentSettings};