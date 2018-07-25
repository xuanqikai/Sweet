import { Scene } from "./Global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class firstScene extends cc.Component {

    @property(cc.Layout)
    rankLayer: cc.Layout = null;


    start () {
        this.closeRank();
    }
    
    OpenRank()
    {
        this.rankLayer.node.active = true;
    }
    closeRank()
    {
        this.rankLayer.node.active = false;
    }
}
