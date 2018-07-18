const {ccclass, property} = cc._decorator;  // 从 cc._decorator 命名空间中引入 ccclass 和 property 两个装饰器

import {Global,Scene}  from './Global';
// import myGame from './myGame';
//加速度
//const addSpeedDate = -2;
//生成时的级别范围
const valueRange = 8;
//生成的等级概率
const RangeProb =[16,16,16,16,14,10,6,4];
@ccclass
export default class obj extends cc.Component {

    @property(cc.Sprite)
    mySprite: cc.Sprite = null;

    @property([cc.SpriteFrame])
    spriteFrame: Array<cc.SpriteFrame> = [];

    //左下角位置（即最小位置坐标）
    MinPos = cc.p(0,0);

    //状态：0不存在，1下落（提示），2正常状态，3选中状态，4消失
    myState = 0;
    //所在格子位置
    pos = cc.p(-1,-1);
    //下落速度（每格时间）
    moveSpeed = 0.05;
    //自身代表的级别值(即2048中2的n次方)
    myKind = 1; 
    gameScene:cc.Node = null;
    //偏移量
    offset = cc.p(Global.G_objSizeW/2,Global.G_objSizeH/2);



    start () {
        //绑定触碰事件
        // console.log("picObject---------start");
        this.myState = 0;
        
        // let _ppp = 0;
        // console.log("_ppp000 **** ("+_ppp+")");
        // this.test(_ppp);
        // console.log("_ppp111 **** ("+_ppp+")");

        // let _ppp = cc.v2(2,2);
        // console.log("_ppp000 **** ("+_ppp.x+","+_ppp.y+")");
        // this.test(_ppp.clone());
        // console.log("_ppp111 **** ("+_ppp.x+","+_ppp.y+")");
    }
    // test(_p:number)
    // {
    //     console.log("_p000 **** ("+_p+")");
    //     _p =2;
    //     console.log("_p111 **** ("+_p+")");

    //     // console.log("_p000 **** ("+_p.x+","+_p.y+")");
    //     // _p.x =10;
    //     // _p.y =10;
    //     // console.log("_p111 **** ("+_p.x+","+_p.y+")");
        
    // }
    // //点击事件
    // touchFunction (event)
    // {
    //     // console.log('touchstart');
    //     // var s = 'touchFunction_state : '+ String(Global.G_uiState);
    //     // console.log(s);
    //     // //点击切换场景
    //     // if(Scene.first  == Global.G_uiState)
    //     // {
    //     //     this.changeScene(Scene.main);
    //     // }
    //     // else
    //     // {
    //     //     this.changeScene(Scene.first);
    //     // }
    // }
    upddate(dt:number)
    {
        // console.log("picObject---------upddate()");  
    }
    //移动：0为下落几个位置
    Move(n:number,_delay:number =0)
    {
        this.changeState(1);
        let _time = this.moveSpeed *n;
        this.pos.y -= n;
        let curPos = cc.p(this.pos.x*Global.G_objSizeW,this.pos.y*Global.G_objSizeH).add(this.offset);
        let dt = cc.delayTime(_delay * this.moveSpeed);
        //让玩家移动到点击位置
        var action = cc.moveTo(_time,curPos);
        // cc.log("移动时间： ",_time);
        //移动前停止所有动作
        this.node.stopAllActions();
        //移动完成过后,更改状态
        this.node.runAction(cc.sequence(dt,action, cc.callFunc(function(){
            ()=>{
                this.changeState(2);
            }
             
         })));
         this.changeState(2);          
    }
    //更改状态(coerce 是否强制更新状态)
    changeState(_state:number,coerce:boolean = false)
    {
        if(!coerce && _state == this.myState)
        {
            return;
        }
        this.myState = _state;
        if(_state >0)
        {
            this.node.active = true;
        }
        else
        {
            this.node.active = false;
        }
        if(2 == _state)
        {
            //把当前节点加入地图信息
            this.GetParentScript().UpdateMapDate(this.myKind,this.pos,this.node);
            this.node.setScale(1.0);
            
        }
        else if(3 == _state)
        {
            //把当前节点加入地图信息
            this.node.setScale(1.2);
            
        }
        else if(4 == _state || 1 == _state || 0 == _state)
        {
            //把当前节点从地图信息清除
            this.GetParentScript().UpdateMapDate(0,this.pos,null);
            
        }
        console.log(" state is :"+_state);
        
    }
    GetState():number
    {
        return this.myState;
    }
    CanToucheMe()
    {
        if(2 == this.myState || 3 == this.myState)
        {
            return true;
        }
        return false;
    }
    //出生
    Birth(_game:cc.Node,_x:number)
    {
        this.gameScene = _game;

        console.log("picObject---------getgameScene");
        //状态
        this.myState = 0;
        //所在格子位置
        this.pos = cc.p(_x,Global.G_objNY);
        /*
        //随机生成级别值
        let _top = this.GetParentScript().GetCurTopValue();
        //生成的最高值
        if(_top >valueRange )
        {
            _top = valueRange;
        }
        else if(_top >6 )
        {
            _top = 6;
        }
        else if(_top <=3 )
        {
            _top = 3;
        }
        //随机的范围
        let _r = 0;
        for (let index = 0; index < _top; index++)
        {
            _r += RangeProb[index];
        }
        let num = Math.random()*_r;
        //随机到值
        let _value = 1;
        for (let index = 0; index < valueRange; index++) 
        {
            if(num < RangeProb[index])
            {
                _value = index+1;
                break;
            }
            num -= RangeProb[index];
        }
        */
        let _value =  Math.floor(Math.random()*Global.G_objKind +1);
        this.SetMyKind(_value);
        // this.changeState(0);
        //设置位置 this.pos.y*Global.G_objSizeH
        let curPos = cc.p(this.pos.x*Global.G_objSizeW,Global.height).add(this.offset);
        // let _curPos = this.MinPos.add(_p.mul(Global.g));
        this.node.setPosition(curPos);
        console.log("picObject---------Birth() _value:"+_value);
    }
    //节点消失
    Die()
    {
        this.unschedule(this.upddate);
        this.changeState(0);
    }
    //设置自身级别值
    SetMyKind(_v:number)
    {
        _v = Math.floor(_v);
        this.myKind = _v;
        console.log("picObject---------SetmyKind : _value: "+_v);
        //更换为对应图片
        // if(null != this.lableText)
        // {
        //     this.lableText.string = _v.toString();
        // }
        if(null == this.mySprite)
        {
            return;
        }
        //*************<方法一>**************//
        //路径一定要放在资源管理器的绝对路径下,不然会一直报错说在resources文件下找不到(不知原因)
        if(_v <=0 || _v > Global.G_objKind)
        {
            return;
        }
        // let str = 'obj'+_v +'.png';
        this.mySprite.spriteFrame = this.spriteFrame[_v-1];
    }
    //获取父节点的脚本信息
    GetParentScript(): any
    {
        // console.log("GetParentScript()-----------"+this.gameScene );
        
        return this.gameScene.getComponent('myGame');
    }
    //**********************************碰撞信息***********************************//
    //判断是否是空位
    EstimateIsEmpty(_p:cc.Vec2):boolean
    {
        if(_p.x<0 || _p.y<0)
        {
            console.log("EstimateIsEmpty ---- _p.x<0 || _p.y<0 is "+ _p.y);
            
            return false;
        }
        console.log("EstimateIsEmpty  ---- _p is -- "+_p.x+","+_p.y);
        let b = this.GetParentScript().GetMapDate(_p.clone())==0;
        if(!b)
        {
            console.log("EstimateIsEmpty false ---- _p is -- "+_p.x+","+_p.y);
        }
        return b;
    }
    //****************************************************************************//
}
