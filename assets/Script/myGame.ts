const {ccclass, property} = cc._decorator;  // 从 cc._decorator 命名空间中引入 ccclass 和 property 两个装饰器

import {Global,Scene}  from './Global';
import obj from './obj';
import main from './main';
@ccclass
export default class myGame extends cc.Component {

    @property(cc.Prefab)
    objPrefab: cc.Prefab = null;
    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Label)
    timeLabel: cc.Label = null;

    @property(cc.Label)
    highscoreLabel: cc.Label = null;

    @property(cc.Label)
    addScoreNumber: cc.Label = null;

    @property(cc.Sprite)
    lineSprite: cc.Sprite = null;

    @property(cc.Layout)
    gameOverlayer: cc.Layout = null;

    @property(cc.Label)
    gameOverScore: cc.Label = null;

    //游戏音效
    @property([cc.AudioSource])
    Audio_bika:Array<cc.AudioSource> = [];


    //是否所有物体进入稳定状态
    IsAllObjectStabilization = 0;
    //当前局出现过的最大等级值
    private CurTopValue = 1;
    //当前地图中物体值信息
    private CurMapValue:Array<Array<any>> = new Array<Array<any>>();
    private CurMapNode:Array<Array<cc.Node>>  = new Array<Array<cc.Node>>();
    private CurSelectPos:Array<cc.Vec2>  = new Array<cc.Vec2>();
    //画线
    private SelectLine:Array<cc.Node>  = new Array<cc.Node>();
    // private CurMapValue1:[Number];
    // private CurMapValue:number[][];
    // private CurMapNode:cc.Node[][];
    //物体父节点
    private objParentNode: cc.Node = null;
    //当前下落物体
    private curObj: cc.Node = null;
    private lastObj: cc.Node = null;
    private istouchedMove = 0;
    private isGameRunning = false;
    //对象池
    private objPoolSize = 0; 
    private ObjPool:cc.NodePool = null;
    //画线对象池
    private LinePool:cc.NodePool = null;
    private touchPos = cc.v2(-1,-1);
    private num = 0;
    private Score = 0;
    private doubleScore = false;
    private curAudiobikaID = -1;
    //音效
    private AudioBika0:Array<cc.AudioSource> = new Array<cc.AudioSource>();
    private pointBika0 = 0;

    //时间倒计时
    private remaindTime = 0;

    //游戏是否开始
    private IsGameStarted = false;

    private lineColor = cc.color(255,255,255);

    //***********************************************初始化脚本***********************************************//
    onLoad()
    {
        for(var i = 0;i < Global.G_objNY;i++){
            this.CurMapValue[i] = [];
        }
        this.CurMapValue.push([]);
         // 定义二维数组
        // for(var i = 0;i < 3;i++)
        // {
        //    this.CurMapValue[i] = [];
        // }
        // this.CurMapValue.push([]);
        for(var i = 0;i < Global.G_objNY;i++)
        {
           this.CurMapNode[i] = [];
        }
        this.CurMapNode.push([]);
        if(this.objParentNode || !cc.isValid(this.objParentNode))
        {
            this.objParentNode =new cc.Node();
            console.log("create objParentNode");
        }
        this.node.addChild(this.objParentNode);
        //游戏内物体块父类
        this.node.setAnchorPoint(cc.p(0,0));
        this.node.setPosition((Global.width-Global.G_objNX*Global.G_objSizeW)/2,(Global.height-Global.G_objNY*Global.G_objSizeH)/2+130);
        this.node.setContentSize(Global.G_objNX*Global.G_objSizeW,Global.G_objNY*Global.G_objSizeH);
        this.InitObjectPool();
        this.InitLinePool();
        Global.Tool.CreateObjPool("Number",this.addScoreNumber.node,5);
        this.isGameRunning = false;
        this.Score = 0;
        this.doubleScore = false;
        this.curAudiobikaID =-1;
        this.CreateBikaAudio();
        this.HideGameOverLayer();
        this.IsGameStarted = false;
        console.log("myGame---------onLoad");
    }
    start () 
    {
        console.log("myGame---------start");
        this.num = 0;
        this.GameStart();
    }
    onEnable()
    {
        console.log("myGame---------onEnable");
        if(!this.isGameRunning)
        {
            this.GameResume();
        }
        // this.EnabledGame();
    }
    update(dt:number)
    {
        // if(!this.isGameRunning)
        // {
        //     return;
        // }
        // if(this.IsAllObjectStabilization == 0)
        // {
        //     if(this.GetCurObject() != null && this.GetCurObject().getComponent('obj').pos.y == Global.G_objNY-1)
        //     {
        //         this.GameOver();
        //         return;
        //     }
        //     this.CreateObject();
        // }
    }
    onDestroy()
    {
        console.log("myGame---------onDestroy()");
        this.DestroyObjectPool();
        this.DestroyLinePool();
        Global.Tool.DestroyObjPool("Number");
        if(this.objParentNode && cc.isValid(this.objParentNode))
        {
            this.objParentNode.destroy();
        }
        this.objParentNode = null;
        
    }
    //*************************************************触碰事件*********************************************//
    touchStart (event)
    {
        console.log(" touchstart (event)");
        //转换为本节点位置
        let loc = this.node.convertToNodeSpace(event.getLocation());
        if(loc.x<0 || loc.y<0)
        {
            return;
        }
        console.log(" touchstart (event) 000  ");
        this.touchPos.set(loc);
        this.ClearSelectPos();
        this.JudgeSelectObject(loc);
    }
    //滑动事件
    touchMove (event)
    {
        if(this.touchPos.x<0 || this.touchPos.y<0 )
        {
            return;
        }
        let loc = this.node.convertToNodeSpace(event.getLocation());
        if(loc.x<0 || loc.y<0)
        {
            return;
        }
        //画线
        if(this.CurSelectPos.length>0)
        {
            let  _lastpos = cc.v2(0.5,0.5).add(this.CurSelectPos[this.CurSelectPos.length-1]);
            if(Global.Tool.DrawLineWithPic(this.lineSprite,cc.v2(_lastpos.x*Global.G_objSizeW,_lastpos.y*Global.G_objSizeH),loc.clone()))
            {
                this.lineSprite.node.active = true;
            }
            else{
                this.lineSprite.node.active = false;
            }
        }

        this.JudgeSelectObject(loc);
        // // console.log(" touchMove (event) 000  ");
        // const _l = 20; //滑动距离超过20才判定为滑动
        // if(this.istouchedMove>=_l)
        // {
        //     return;
        // }
        // let _curPos = event.getLocation();
        // // console.log(" touchMove (event)  ");
        // var move_x = _curPos.x - this.touchPos.x;
        // var move_y = _curPos.y - this.touchPos.y;
        
        // this.istouchedMove = Math.abs(move_x)>Math.abs(move_y)? Math.abs(move_x):Math.abs(move_y);
        // if (Math.abs(move_x) >= _l)  
        // {
        //     console.log("move_x  >= _l ------------------------------------------ ");
        //     let _dir = move_x>0?1:-1;
        //     //左右移动
        //     this.PicMove(_dir);
        //     return;
        // } 
        // if (move_y <= -_l)
        // {
        //     //向下加速
        //     this.PicMove(0);
        // }

        
    }
    //点击完成事件
    touchEnd (event)
    {
        if(this.touchPos.x<0 || this.touchPos.y<0)
        {
            return;
        }
        // let loc = this.node.convertToNodeSpace(event.getLocation());
        // if(loc.x<0 || loc.y<0)
        // {
        //     return;
        // }
        if(this.CurSelectPos.length>1)
        {
            this.RemoveSelectPos();
        }
        else
        {
            this.ClearSelectPos();
        }
        this.touchPos.x =-1;
        this.touchPos.y =-1;
        console.log(" touchEnd (event)  ");
    }
    touchCancel(event)
    {
        this.touchEnd (event)
        // this.ClearSelectPos();
        // this.touchPos.x =-1;
        // this.touchPos.y =-1;
    }
    //*****************************************************定时器***********************************************//
    timeUpdate(_dt)
    {
        if(this.remaindTime ==0)
        {
            this.GameOver();
        }
        this.timeLabel.string = this.remaindTime.toString();
        this.remaindTime--;
    }
    //*****************************************************对象池***********************************************//
    InitObjectPool()
    {
        //初始化五个对形象代用
        this.objPoolSize = 5;
        this.ObjPool = new cc.NodePool();
        for (let i = 0; i < this.objPoolSize; ++i) 
        {
            let enemy = cc.instantiate(this.objPrefab); // 创建节点
            this.ObjPool.put(enemy); // 通过 putInPool 接口放入对象池
        }
        console.log("-------------------InitObjectPool()-------------------");
        
    }
    GetObjectByPool():cc.Node
    {
        let  _obj = null;
        // // if (this.ObjPool.size() <= 0) 
        // // {
        // //     _obj = cc.instantiate(this.objPrefab); // 创建节点

        // //     this.ObjPool.put(_obj); // 通过 putInPool 接口放入对象池
        // //     console.log("GetObjectByPool() size <= 0");
            
        // // }
        // // _obj = this.ObjPool.get();
        if (this.ObjPool.size() > 0) 
        { // 通过 size 接口判断对象池中是否有空闲的对象
            // console.log("this.ObjPool.size() ppppis --- "+this.ObjPool.size());
             
            _obj = this.ObjPool.get();
            // console.log("this.ObjPool.size() is --- "+this.ObjPool.size());
        } 
        else 
        { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            _obj = cc.instantiate(this.objPrefab);
        }
        // _obj = cc.instantiate(this.objPrefab);
        return _obj;
    }
    PoolRecycleObject(obj:cc.Node)
    {
        this.ObjPool.put(obj); // 通过 putInPool 接口放入对象池
    }
    DestroyObjectPool()
    {
        this.ObjPool.clear();
        this.ObjPool = null;
        this.objPoolSize = 0;
    }
    InitLinePool()
    {
        //初始化五个对形象代用
        let lineSize = 5;
        this.LinePool = new cc.NodePool();
        for (let i = 0; i < lineSize; ++i) 
        {
            let line = cc.instantiate(this.lineSprite.node); // 创建节点
            this.LinePool.put(line); // 通过 putInPool 接口放入对象池
        }
        console.log("-------------------InitObjectPool()-------------------");
        
    }
    GeLineByPool():cc.Node
    {
        let  _obj = null;
       
        if (this.LinePool.size() > 0) 
        { // 通过 size 接口判断对象池中是否有空闲的对象
            // console.log("this.ObjPool.size() ppppis --- "+this.ObjPool.size());
             
            _obj = this.LinePool.get();
            // console.log("this.ObjPool.size() is --- "+this.ObjPool.size());
        } 
        else 
        { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            _obj = cc.instantiate(this.lineSprite.node);
        }
        return _obj;
    }
    PoolRecycleLine(obj:cc.Node)
    {
        this.LinePool.put(obj); // 通过 putInPool 接口放入对象池
    }
    DestroyLinePool()
    {
        this.LinePool.clear();
        this.LinePool = null;
    }
    //**************************************************游戏声明周期********************************************//
    GameStart()
    {
        //---------------------------初始化值--------------------------------//
        //当前局出现过的最大等级值
        this.CurTopValue = 1;

        this.IsGameStarted = true;
        this.remaindTime = 100;
        this.ResetObject();
        // this.CurMapValue[0][1] = 2;
        // this.CreateObject();
        this.istouchedMove =0;
        this.timeUpdate(0);
        this.schedule(this.timeUpdate,1);
        this.EnabledGame();
        
        // this.node.on(cc.Node.EventType.TOUCH_MOVE,function(){
        //     console.log("cc.Node.EventType.TOUCH_MOVE");
            
        // }, this);
        
        this.ClearScore();
    }
    GamePause()
    {
        if(!this.IsGameStarted)
        {
            return;
        }
        this.EnabledGame(false);
    }
    GameResume()
    {
        if(!this.IsGameStarted)
        {
            return;
        }
        this.EnabledGame(true);
    }
    GameReStart()
    {
        //---------------------------初始化值--------------------------------//
        //当前局出现过的最大等级值
        // this.GameOver();
        this.GameStart();
    }
    GameOver()
    {
        
        // this.node.off(cc.Node.EventType.TOUCH_MOVE,this.touchMove, this);
        // this.node.off(cc.Node.EventType.TOUCH_END,this.touchEnd, this);
        this.EnabledGame(false);
        this.unschedule(this.timeUpdate);
        this.IsGameStarted = false;
        this.ShowGameOverLayer();
    }
    EnabledGame(_b = true)
    {
        this.isGameRunning = _b;
        if(_b)
        {
            //绑定触碰事件
            this.node.on(cc.Node.EventType.TOUCH_START,this.touchStart, this);
            this.node.on(cc.Node.EventType.MOUSE_DOWN,this.touchStart, this);
            
            this.node.on(cc.Node.EventType.TOUCH_MOVE,this.touchMove, this);
            this.node.on(cc.Node.EventType.MOUSE_MOVE,this.touchMove, this);
            // this.node.on(cc.Node.EventType.TOUCH_START,function(){
            //     console.log("cc.Node.EventType.TOUCH_START");
                
            // }, this);
            this.node.on(cc.Node.EventType.TOUCH_END,this.touchEnd, this);
            this.node.on(cc.Node.EventType.TOUCH_CANCEL,this.touchCancel, this);
            this.node.resumeAllActions();
            cc.director.getScheduler().resumeTarget(this);
            console.log("EnabledGame true");
            
            
        }
        else{
            //删除绑定触碰事件
            this.node.off(cc.Node.EventType.TOUCH_START,this.touchStart, this);
            this.node.off(cc.Node.EventType.MOUSE_DOWN,this.touchStart, this);
            
            this.node.off(cc.Node.EventType.TOUCH_MOVE,this.touchMove, this);
            this.node.off(cc.Node.EventType.MOUSE_MOVE,this.touchMove, this);

            this.node.off(cc.Node.EventType.TOUCH_END,this.touchEnd, this);
            this.node.off(cc.Node.EventType.TOUCH_CANCEL,this.touchCancel, this);
            this.node.pauseAllActions();
            cc.director.getScheduler().pauseTarget(this);
            console.log("EnabledGame false");
            
            this.ClearSelectPos();
            this.touchPos.x =-1;
            this.touchPos.y =-1;
        }
    }
    //***********************************************自定义方法***********************************************//
    JudgeSelectObject(_p:cc.Vec2)
    {
        let _mapos = cc.p(0,0); 
        _mapos.set(_p);
        console.log("_p ------------------ "+_p.x+","+_p.y);
        _mapos.x =  Math.floor(_mapos.x /Global.G_objSizeW);
        _mapos.y =  Math.floor(_mapos.y /Global.G_objSizeH);
        console.log("_mapos ------------------ "+_mapos.x+","+_mapos.y);
        let obj = this.GetMapObjNode(_mapos);
        if(null==obj)
        {
            return;
        }
        //仍是当前块
        if(this.CurSelectPos.length>0)
        if(_mapos.equals(this.CurSelectPos[this.CurSelectPos.length - 1]))
        {
            return;
        }
        //判断可选中距离
        if(this.CurSelectPos.length>0)
        {
            let _dif = _mapos.sub(this.CurSelectPos[this.CurSelectPos.length - 1]);
            console.log("_mapos ------------------sub- "+_mapos.x+","+_mapos.y);
            if(Math.abs(_dif.x)>1 || Math.abs(_dif.y)>1)
            {
                return;
            }
        }
        //是否可点击
        if(!obj.getComponent('obj').CanToucheMe())
        {
            return;
        }
        
        //是否取消
        if(this.CurSelectPos.length>1)
        if(_mapos.equals(this.CurSelectPos[this.CurSelectPos.length - 2]))
        {
            this.ClearSelectPos(true);
            this.ChangeLastSelect();
            return;
        }
        //是否已是选中状态
        if(3== obj.getComponent('obj').GetState())
        {
            return;
        }
        //是否种类相同
        if(this.CurSelectPos.length>0)
        if(this.GetMapDate(_mapos) != this.GetMapDate(this.CurSelectPos[0]))
        {
            return;
        }
        //获取线的颜色
        if(this.CurSelectPos.length == 0)
        {
            let _color =[cc.color(141,171,0),cc.color(13,191,230),cc.color(254,133,202),
                cc.color(249,132,74),cc.color(245,212,79)];
            this.lineColor = _color[this.GetMapDate(_mapos)-1];
            this.lineSprite.node.color = this.lineColor;
        }
        //连线
        else if(this.CurSelectPos.length > 0)
        {
            let _line = this.GeLineByPool();
            this.SelectLine.push(_line);
            this.objParentNode.addChild(_line,1);
            _line.active = true;
            let _sprite:cc.Sprite = _line.getComponent("cc.Sprite");
            let  _lastpos = cc.v2(0.5,0.5).add(this.CurSelectPos[this.CurSelectPos.length-1]);
            let  _curpos = cc.v2(0.5,0.5).add(_mapos);

            Global.Tool.DrawLineWithPic(_sprite,cc.v2(_lastpos.x*Global.G_objSizeW,_lastpos.y*Global.G_objSizeH),cc.v2(_curpos.x*Global.G_objSizeW,_curpos.y*Global.G_objSizeH));
            console.log("_sprite : "+_sprite.spriteFrame.name);
            _line.color = this.lineColor;
        }
        
        obj.getComponent('obj').changeState(3);
        this.CurSelectPos.push(_mapos.clone());
        this.ChangeLastSelect();
    }
    ClearSelectPos(onlylast = false)
    {
        let _start = cc.p(0,0);
        
        while(this.CurSelectPos.length >0)
        {
            let _p= cc.p(0,0);
            _p.set(this.CurSelectPos.pop());

            let obj = this.GetMapObjNode(_p);
            if(obj)
            {
                let _state = obj.getComponent('obj').GetState();
                if(3 == _state)
                {
                    obj.getComponent('obj').changeState(2);
                }
            }
            if(onlylast)
            {
                break;
            }
        }
        while(this.SelectLine.length >0)
        {
            this.PoolRecycleLine(this.SelectLine.pop());
            if(onlylast)
            {
                break;
            }
        }
        if(!onlylast)
        {
            //去掉划线
            this.lineSprite.node.active = false;
            
        }
        
    }
    RemoveSelectPos()
    {
        let _unitScore = 5;
        //双倍道具
        if(this.doubleScore)
        {
            _unitScore *= 2;
            this.doubleScore = false;
        }
        let n=0;
        let l = this.CurSelectPos.length;
        let hatArray: Array<cc.Vec2> = new Array<cc.Vec2>();
        while(this.CurSelectPos.length >0)
        {
            n++;
            let _p =cc.v2(0,0);
            console.log("RemoveSelectPos1 ------ _p "+_p.x+","+_p.y);
            _p.set(this.CurSelectPos.shift());
            console.log("RemoveSelectPos2 ------ _p "+_p.x+","+_p.y);
            this.AddScore(n*_unitScore,_p.clone());
            this.DestoryObject(_p);
            if(l>5 && l-this.CurSelectPos.length >5)
            {
                hatArray.push(_p.clone());
            }
        }
        if(l >0)
        {
            console.log("Global.G_topScore is "+Global.G_topScore);
            if(this.Score >Global.G_topScore)
            {
                console.log("top score is "+this.Score);
                
                Global.G_topScore = this.Score;
                Global.Tool.setMyScore(Global.G_topScore);
                this.highscoreLabel.string = this.Score.toString();
                Global.Tool.submitScoreButtonFunc(Global.G_topScore);
            }
            this.JudgeAutoMove(-1，hatArray);
            if(l<5)
            {
                this.playBikaAudio(1);
            }
            else if(l<8)
            {
                this.playBikaAudio(2);
            }
            else
            {
                this.playBikaAudio(3);
            }
            while(this.SelectLine.length >0)
            {
                this.PoolRecycleLine(this.SelectLine.pop());
            }
            //去掉划线
            this.lineSprite.node.active = false;
        }
    }
    ChangeLastSelect()
    {
        if(this.CurSelectPos.length ==0)
        {
            return;
        }
        this.playBikaAudio(0);
    }
    ClearScore()
    {
        this.doubleScore = false;
        this.Score = 0;
        this.AddScore(0);
    }
    //加分_p为显示分数特效位置
    AddScore(_s:number,_p:cc.Vec2 =cc.p(-1,-1))
    {
        this.Score +=_s;
        this.scoreLabel.string = this.Score.toString();
        if(_s<=0)
        {
            return;
        }
        //显示加分数字
        let _numberNode = Global.Tool.GetObjPool("Number"); 
        this.objParentNode.addChild(_numberNode,5);
        _numberNode.active = true;
        let _lable:cc.Label = _numberNode.getComponent("cc.Label");
        _lable.string = _s.toString();
        let  _pos = cc.v2(0.5,0.8).add(_p);
        _numberNode.setPosition(Global.G_objSizeW * _pos.x,Global.G_objSizeH*_pos.y);
        //动画效果
        var action = cc.moveBy(0.5,cc.v2(0,20));
        var action2 = cc.fadeOut(0.1);
        _numberNode.opacity = 255;
        _numberNode.color = this.lineColor;
        //移动前停止所有动作
        _numberNode.stopAllActions();
        //移动完成过后,更改状态
        _numberNode.runAction(cc.sequence(action,action2, cc.callFunc(function(){
            ()=>{
                Global.Tool.PoolRecycleObj("Number",_numberNode);
            }
         })));

    }
    //自动确定最大级别
    AutoSetCurTopValue(_value:number)
    {
        this.CurTopValue = _value>this.CurTopValue?_value:this.CurTopValue;
    }
    //获取最大级别
    GetCurTopValue():number
    {
        return this.CurTopValue;
    }
    //更新地图信息
    UpdateMapDate(_value:number,_p:cc.Vec2,_node:cc.Node)
    {
        if(_p.x<0 || _p.x >Global.G_objNX || _p.y<0 || _p.y >Global.G_objNY )
        {
            console.log("Error1: _p ------------------ "+_p.x+","+_p.y);
            return;
        }
        this.CurMapValue[_p.y][_p.x] = _value;
        this.CurMapNode[_p.y][_p.x] = _node;
    }
    //获取指定位置地图信息
    GetMapDate(_p:cc.Vec2):number
    {
        if(_p.x<0 || _p.x >Global.G_objNX || _p.y<0 || _p.y >Global.G_objNY )
        {
            console.log("Error2: _p ------------------ "+_p.x+","+_p.y);
            return 0;
        }
        // console.log("----------------------CurMapValue-------------------");
        // console.log("---------------------------------------------------");
        // console.log("---------------------------------------------------");
        
        return this.CurMapValue[_p.y][_p.x];
    }
    //获取指定位置地图物体节点
    GetMapObjNode(_p:cc.Vec2):cc.Node
    {
        if(_p.x<0 || _p.x >Global.G_objNX || _p.y<0 || _p.y >Global.G_objNY )
        {
            console.log("Error3: _p ------------------ "+_p.x+","+_p.y);
            return null;
        }
        return this.CurMapNode[_p.y][_p.x];
    }
    //创建新物体
    CreateObject(_x:number):cc.Node
    {
        this.num++;
        // 使用给定的模板在场景中生成一个新节点
        let obj = this.GetObjectByPool();
        // console.log("myGame---------obj objPrefab: "+this.objPrefab);
        // console.log("myGame---------obj value: "+obj);
        // console.log("myGame---------obj node: "+ this.objParentNode);
        // console.log("myGame---------obj num: "+ this.num);
        
        // this.node.addChild(obj);
        // 将新增的节点添加到 Canvas 节点下面
        this.objParentNode.addChild(obj,2);
        // console.log("myGame---------obj num: "+ this.num);
        obj.getComponent('obj').Birth(this.node,_x);
        // console.log("myGame---------obj num: "+ this.num);
        this.curObj =  obj;
        this.IsAllObjectStabilization++;
        // console.log("myGame---------CreateObject()");
        return obj;
    }
    //销毁物体
    DestoryObject(_p:cc.Vec2)//(obj:cc.Node)
    {
        // obj =  this.curObj;
        let obj =this.GetMapObjNode(_p);
        if(null == obj)
        {
            return;
        }
        console.log("myGame---------obj value: "+obj.getComponent('obj').myValue);
        obj.getComponent('obj').Die();
        // this.UpdateMapDate(0,_p,null);
        
        console.log("myGame---------obj _p: "+_p.y);
        this.PoolRecycleObject(obj);
        // this.objParentNode.removeChild(obj);
        
    }
    removeAllObject()
    {
        for (let y = 0; y < Global.G_objNY; y++) 
        {
            for (let x = 0; x < Global.G_objNX; x++) 
            {
                this.DestoryObject(cc.p(x,y));  
            }
        }
        this.objParentNode.removeAllChildren();
    }
    //判断自动移动_x:指定行,_hatArray有皇冠的位置
    JudgeAutoMove(_x:number = -1,_hatArray:Array<cc.Vec2>=[])
    {
        let _start =0;
        let _end =Global.G_objNX;
        if(-1 != _x)
        {
            _start = _x;
            _end = _start+1;
        }
        let moveH = 0; 
        for (let x = _start; x < _end; x++)
        {
            moveH = 0;
            for (let y = 0; y < Global.G_objNY; y++)
            {
                let obj = this.CurMapNode[y][x];
                if(null == obj )
                {
                    moveH++;
                }
                else
                {
                    obj.getComponent('obj').Move(moveH);
                }
            }
            for (let y = 0; y < moveH; y++)
            {
                let obj = this.CreateObject(x);
                obj.getComponent('obj').Move(moveH-y,y);
            }
        }
        //更新皇冠信息
        if(_hatArray.length>0)
        {
            _hatArray.forEach(element => {
                let obj = this.GetMapObjNode(element);
                if(obj)
                {
                    obj.getComponent('obj').SetHatState(true);
                }
            });
        }
    }
    //移动方向
    PicMove(dir:number)
    {
        
    }
    TouchStartGame()
    {
        if(this.IsGameStarted)
        {
            return;
        }
        this.GameStart();
    }
    //**************************************************道具****************************************//
    //双倍积分
    DoubleScore()
    {
        this.doubleScore = true;
    }
    //重置物体
    ResetObject()
    {
        this.curAudiobikaID =-1;
        this.removeAllObject();
        //当前地图中物体值信息
        for (let y = 0; y < Global.G_objNY; y++) 
        {
            for (let x = 0; x < Global.G_objNX; x++) 
            {
                //清空地图上信息
                this.CurMapValue[y][x] = 0;
                this.CurMapNode[y][x] = null;
            }
        }
        this.JudgeAutoMove();
    }
    //**************************************************游戏音效****************************************//
    CreateBikaAudio()
    {
        //留5个备用，省的再建内存池
        this.AudioBika0.push(cc.instantiate(this.Audio_bika[0]));
        //指向第几个备用音效
        this.pointBika0 = 0;
    }
    playBikaAudio(_id)
    {
        if(_id<0 ||_id >3)
        {
            return;
        }
        if(0 == _id && _id == this.curAudiobikaID)
        {
            this.AudioBika0[this.pointBika0++].play();
            if(this.pointBika0 >= this.AudioBika0.length)
            {
                this.pointBika0 = 0;
            }
        }
        else 
        {
            this.Audio_bika[_id].play();
        }
        
        this.curAudiobikaID = _id;
        
        // cc.audioEngine.play( this.Audio_button, false, 1);
    }
    //************************************************结束界面***************************************//
    ShowGameOverLayer()
    {
        this.gameOverlayer.node.active = true; 
        this.gameOverScore.string = this.Score.toString();
       
    }
    HideGameOverLayer()
    {
        this.gameOverlayer.node.active = false;
        
    }
    //**********************************************************************************************//
    
}
