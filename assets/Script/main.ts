import { Scene } from "./Global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class main extends cc.Component {

    @property(cc.Layout)
    firstScene: cc.Layout = null;

    @property(cc.Layout)
    mainScene: cc.Layout = null;

    currentScene = Scene.First;


    start () {
        // init logic
        // this.label.string = this.text;
        this.changeScene(Scene.First,true);
    }
    changeScene(_id:Scene, _force:boolean = false)
    {
        if(!_force && _id == this.currentScene)
        {
            return;
        }
        this.currentScene = _id;
        this.firstScene.node.active = false;
        this.mainScene.node.active = false;

        switch(_id)
        {
            case Scene.First:
                this.firstScene.node.active = true;
            break;
            case Scene.Main:
                this.mainScene.node.active = true;
            break;
            default:
            break;
        }
    }
    GoMianScene()
    {
        this.changeScene(Scene.Main);
    }
}
