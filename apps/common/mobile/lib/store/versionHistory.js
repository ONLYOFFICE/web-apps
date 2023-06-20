import {makeObservable, action, observable} from 'mobx';

export class storeVersionHistory {
    constructor() {
        makeObservable(this, {
            arrVersions: observable, 
            setVersions: action,
            isVersionHistoryMode: observable,
            changeVersionHistoryMode: action,
            currentVersion: observable,
            changeVersion: action

        })
    }

    isVersionHistoryMode = false;
    currentVersion = null;
    arrVersions = [];

    changeVersion(version) {
        this.currentVersion = version;
    }

    changeVersionHistoryMode(value) {
        this.isVersionHistoryMode = value;
    }

    setVersions(arr) {
        this.arrVersions = arr;
    }

    findRevisions(revision) {
        return this.arrVersions.filter(rev => rev.revision === revision);
    }

    hasChanges() {
        return this.arrVersions.filter(rev => rev.isRevision === false).length > 0
    }

    getCurrentVersion() {
        return this.arrVersions.find(rev => rev.selected) || null;
    }

    hasCollapsed() {
        return this.arrVersions.filter(rev => rev.isRevision === true && rev.hasChanges === true && rev.isExpanded === false).length > 0;
    }
}