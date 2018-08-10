// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {Global,Scene}  from './Global';

const {ccclass, property} = cc._decorator;

@ccclass
export default class encourage extends cc.Component {

    @property([cc.SpriteFrame])
    spriteFrameArray: Array<cc.SpriteFrame> = [];

    // LIFE-CYCLE CALLBACKS:

    private static  Name = "encourage";
    static CreatePrePool(_pre:any)
    {
        Global.Tool.CreateObjPool(encourage.Name,_pre,2);
    }
    static DestroyPrePool()
    {
        Global.Tool.DestroyObjPool(encourage.Name);
    }
    static RunAction(_parent:cc.Node,_kind,_p:cc.Vec2,_pend = cc.v2(-1,-1))
    {
        let _obj = Global.Tool.GetObjByPool(encourage.Name);
        _parent.addChild(_obj,5);
        _obj.getComponent("encourage").initSelf(_kind,_p,_pend);
        
    }
    // onLoad () {}

    start () {

    }
    initSelf(_kind,_pstart:cc.Vec2,_pend = cc.v2(-1,-1))
    {
        this.node.stopAllActions();
        this.node.scale =1;
        this.node.opacity = 255;
        this.node.position = _pstart;
        this.node.active = true;
        

        let _spr = this.getComponent(cc.Sprite);
        _spr.spriteFrame = this.spriteFrameArray[_kind];
        let _action = null;
        switch(_kind)
        {
            case 0:
                _action = cc.sequence(cc.delayTime(0.3),cc.moveTo(0.2,_pstart.add(cc.v2(0,200))));
            break;
            case 1:
                this.node.setPositionX(-300);
                _action = cc.sequence(cc.moveTo(0.2,_pstart.add(cc.v2(50,0))).easing(cc.easeSineIn()),cc.moveTo(0.1,_pstart),cc.delayTime(0.2),cc.spawn(cc.scaleTo(0.2,2),cc.fadeOut(0.2)));
            break;
            case 2:
                _action = cc.sequence(cc.scaleTo(0.2,2),cc.scaleTo(0.2,1),cc.scaleTo(0.2,2),cc.scaleTo(0.2,1),cc.spawn(cc.fadeOut(0.2),cc.scaleTo(0.2,3)));
            break;
            case 3:
                _action = cc.sequence(cc.delayTime(0.1),cc.scaleTo(0.2,2),cc.scaleTo(0.2,1),cc.scaleTo(0.2,2),cc.scaleTo(0.2,1),cc.spawn(cc.moveTo(0.2,_pend),cc.scaleTo(0.2,0.3)));
            break;
            default:
                console.log("Error : Illegal encourage kind !");
            break;
            
        }
        this.node.runAction(cc.sequence(_action,cc.callFunc(this.RecycleSelf,this)));
    }
    RecycleSelf()
    {
        this.node.stopAllActions();
        this.node.active = false;
        Global.Tool.PoolRecycleObj(encourage.Name,this.node);
    }

    // update (dt) {}
}
