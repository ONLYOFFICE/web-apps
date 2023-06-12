import {makeObservable, action, observable, computed} from 'mobx';

export class storeVersionHistory {
    constructor() {
        makeObservable(this, {
            arrVersions: observable, 
            setVersions: action
        })
    }

    arrVersions = [];

    setVersions(arr) {
        this.arrVersions = arr;
    }

    findRevisions(revision) {
        return this.arrVersions.filter(rev => rev.revision === revision);
    }

    hasChanges() {
        return this.arrVersions.filter(rev => rev.isRevision === false).length > 0
    }

    hasCollapsed() {
        return this.arrVersions.filter(rev => rev.isRevision === true && rev.hasChanges === true && rev.isExpanded === false).length > 0;
    }
}