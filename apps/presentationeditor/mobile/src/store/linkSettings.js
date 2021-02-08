import {action, observable, computed} from 'mobx';

export class storeLinkSettings {
    @observable canAddLink;
    @action canAddHyperlink (value) {
        this.canAddLink = value;
    }

    @observable typeLink;
    @action changeLinkType(value) {
        this.typeLink = value;
    }

    @observable slideLink;
    @action changeSlideLink(value) {
        this.slideLink = value;
    }

    @observable slideNum;
    @action changeSlideNum(value) {
        this.slideNum = value;
    }

    @observable slideName;
    @action changeSlideName(value) {
        this.slideName = value;
    }

    initCategory(linkObject) {
        const url = linkObject.get_Value();
        const api = Common.EditorApi.get();

        let indAction;
        let slidesCount;
        let slideNum;

        if(url === null || url === undefined || url === '') {
            this.changeLinkType(1);
        }
        else {
            indAction = url.indexOf("ppaction://hlink");
            if(0 == indAction) {
                if (url == "ppaction://hlinkshowjump?jump=firstslide") {
                    this.changeSlideLink(2);
                } else if (url == "ppaction://hlinkshowjump?jump=lastslide") {
                    this.changeSlideLink(3);
                }
                else if (url == "ppaction://hlinkshowjump?jump=nextslide") {
                    this.changeSlideLink(0);
                }
                else if (url == "ppaction://hlinkshowjump?jump=previousslide") {
                    this.changeSlideLink(1);
                }
                else {
                    this.changeSlideLink(4);
                    slidesCount = api.getCountPages();
                    let mask = "ppaction://hlinksldjumpslide",
                        indSlide = url.indexOf(mask);
                    if (0 == indSlide) {
                        slideNum = parseInt(url.substring(mask.length));
                        if (slideNum < 0) this.changeSlideNum(0);
                        if (slideNum >= slidesCount) this.changeSlideNum(slidesCount - 1);
                    } else this.changeSlideNum(0);
                }
                this.changeLinkType(0);
            } else {
                this.changeLinkType(1);
            }
        }
    }

}
