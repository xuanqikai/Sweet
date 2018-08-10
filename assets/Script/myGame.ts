const {ccclass, property} = cc._decorator;  // 从 cc._decorator 命名空间中引入 ccclass 和 property 两个装饰器

import {Global,Scene}  from './Global';
import obj from './obj';
import encourage from './encourage';
@ccclass
export default class myGame extends cc.Component {

    @property(cc.Prefab)
    objPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    encouragePrefab: cc.Prefab = null;
    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Label)
    timeLabel: cc.Label = null;

    @property(cc.Label)
    highscoreLabel: cc.Label = null;

    @property(cc.Label)
    maxComboLabel: cc.Label = null;

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

    //道具按钮
    @property([cc.Button])
    porpButton:Array<cc.Button> = [];

    //教程手指
    @property(cc.Sprite)
    handSprite:cc.Sprite = null;

    //游戏结束时的视频复活和重新开始按钮
    @property(cc.Button)
    reviveButton:cc.Button = null;

    @property(cc.Button)
    restartButton:cc.Button = null;

    //是否所有物体进入稳定状态
    IsAllObjectStabilization = 0;
    //当前局出现过的最大等级值
    // private CurMaxCombo = 0;
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
    private lastShowScore = 0;
    private doubleScore = false;
    private curAudiobikaID = -1;
    //音效
    private AudioBika0:Array<cc.AudioSource> = new Array<cc.AudioSource>();
    private pointBika0 = 0;

    //时间倒计时
    private remaindTime = 0;

    //游戏是否开始
    private IsGameStarted = false;

    //划线颜色
    private lineColor = cc.color(255,255,255);
    //黑色半透明背景，用来突出某些物体
    private blackBack:cc.Node = null;
    //action延时父节点
    private delayActionNode:cc.Node = null;

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
        //动作执行父节点
        if(null == this.delayActionNode)
        {
            this.delayActionNode =new cc.Node();
            this.node.addChild(this.delayActionNode);
        }
        //游戏物体父节点
        if(!this.objParentNode || !cc.isValid(this.objParentNode))
        {
            this.objParentNode =new cc.Node();
            console.log("create objParentNode");
        }
        this.node.addChild(this.objParentNode);
        //游戏内物体块父类
        this.node.setAnchorPoint(cc.p(0,0));
        this.node.setPosition((Global.width-Global.G_objNX*Global.G_objSizeW)/2,(Global.height-Global.G_objNY*Global.G_objSizeH)/2+110);
        this.node.setContentSize(Global.G_objNX*Global.G_objSizeW,Global.G_objNY*Global.G_objSizeH);
        
        // //黑色背景层
        // if(null == this.blackBack || !cc.isValid(this.blackBack))
        // {
        //     this.blackBack = new cc.Node();
        //     this.blackBack.addComponent(cc.Sprite);
        //     this.blackBack.color =cc.color(0,0,0);
        //     // this.blackBack.opacity = 150;
        //     this.objParentNode.addChild(this.blackBack,100);
        //     this.blackBack.setContentSize(cc.director.getVisibleSize());
        //     this.blackBack.active = true;
        // }
        //读取最大连击数
        this.ReradMaxCombo();
        //读取道具数量
        this.ReadPorpNumber();

        this.InitObjectPool();
        this.InitLinePool();
        Global.Tool.CreateObjPool("Number",this.addScoreNumber.node,5);
        encourage.CreatePrePool(this.encouragePrefab);
        this.isGameRunning = false;
        this.Score = 0;
        this.lastShowScore = 0;
        this.doubleScore = false;
        this.curAudiobikaID =-1;
        this.CreateBikaAudio();
        this.HideGameOverLayer();
        Global.Tool.LoadResouseAnimal();
        this.IsGameStarted = false;
        //判断教程
        this.JudgeCourseStart();
        //没广告时隐藏复活按钮调整重新开始位置
        this.restartButton.node.setPositionY((this.restartButton.node.position.y+this.reviveButton.node.position.y)/2);
        this.reviveButton.node.active = false;
        console.log(" 0000 myGame---------onLoad");
    }
    start () 
    {
        console.log(" 0000 myGame---------start");
        this.num = 0;
        // this.GameStart();
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
        if(this.Score > this.lastShowScore)
        {
            this.lastShowScore++;
            this.scoreLabel.string = this.lastShowScore.toString();
            if(this.Score == this.lastShowScore)
            {
                this.scoreLabel.node.scale = 1.0;
                // this.scoreLabel.node.stopAllActions();
            }
            else{
                this.scoreLabel.node.scale = 1.8;
                // this.scoreLabel.node.runAction(cc.repeatForever(cc.));
            }
        }
    }
    onDestroy()
    {
        console.log("myGame---------onDestroy()");
        Global.Tool.LoadResouseAnimal();
        this.DestroyObjectPool();
        this.DestroyLinePool();
        Global.Tool.DestroyObjPool("Number");
        encourage.DestroyPrePool();
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
        //教程时不进行时间倒计时
        if(this.isCourse)
        {
            return;
        }
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
        //当前局出现过的最大连线
        this.IsGameStarted = true;
        this.remaindTime = 100;
        this.ResetObj();
        this.istouchedMove =0;
        this.timeUpdate(0);
        this.schedule(this.timeUpdate,1);
        this.EnabledGame();
    
        console.log(" GameStart() ");
        
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
        if(this.isCourse)
        {
            this.GameResume();
            return;
        }
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
            this.JudgeAutoMove(-1,hatArray);
            let _startpos = cc.v2(this.node.getContentSize().width/2,this.node.getContentSize().height/2+150);
            if(l<5) 
            {
                this.playBikaAudio(1);
                if(l>3)
                {
                    //鼓励语动画
                    encourage.RunAction(this.node,0,_startpos);
                }
            }
            else if(l<8)
            {
                this.playBikaAudio(2);
                //鼓励语动画
                encourage.RunAction(this.node,1,_startpos);
            }
            else
            {
                this.playBikaAudio(3);
                //鼓励语动画
                encourage.RunAction(this.node,2,_startpos);
            }
            while(this.SelectLine.length >0)
            {
                this.PoolRecycleLine(this.SelectLine.pop());
            }
            //去掉划线
            this.lineSprite.node.active = false;
            //结束教程
            this.courseOver();
            //存储最大连击数据
            this.AutoSetCurTopValue(l);
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
        this.lastShowScore = 0;
        this.scoreLabel.string = this.lastShowScore.toString();
        this.AddScore(0);
    }
    //加分_p为显示分数特效位置
    AddScore(_s:number,_p:cc.Vec2 =cc.p(-1,-1))
    {
        this.Score +=_s;
        // this.scoreLabel.string = this.Score.toString();
        if(_s<=0)
        {
            return;
        }
        //显示加分数字
        let _numberNode = Global.Tool.GetObjByPool("Number"); 
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
       if(_value <= Global.G_maxCombo )
       {
           return;
       }
       Global.G_maxCombo = _value;
       //鼓励语动画
       let _startpos = cc.v2(this.node.getContentSize().width/2,this.node.getContentSize().height/2+300);
       let _endpos = this.maxComboLabel.node.parent.getPosition().sub(this.node.getPosition());
       console.log("_endpos is : "+_endpos.toString());
       
       encourage.RunAction(this.node,3,_startpos,_endpos);

       this.maxComboLabel.string = _value.toString();
       this.maxComboLabel.node.stopAllActions();
    //    this.macComboLabel.node.runAction(cc.repeat(cc.sequence(cc.spawn(cc.scaleTo(0.3,4),cc.fadeOut(0.3)),cc.callFunc(function(target){
    //     //    console.log("macComboLabel action "); 
    //        target.scale = 1;
    //        target.opacity = 255;
    //    })),3));
        
       this.maxComboLabel.node.runAction(cc.sequence(cc.scaleTo(0.4,3),cc.scaleTo(0.3,1)));
       this.StoreMaxCombo();
    }
    //获取最大级别
    GetCurTopValue():number
    {
        return  Global.G_maxCombo;
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
    CreateObject(_x:number,_setvalue = 0):cc.Node
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
        obj.getComponent('obj').Birth(this.node,_x,_setvalue);
        // console.log("myGame---------obj num: "+ this.num);
        this.curObj =  obj;
        this.IsAllObjectStabilization++;
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
                //从上向下行标
                let _yy = moveH-y-1;
                //是否设置固定值，自行判断
                let _setvalue = this.courseSetObjValue(x,_yy);
                //创建物体
                let obj = this.CreateObject(x,_setvalue);
                obj.getComponent('obj').Move(moveH-y,y);
            }
        }
        //教程时设置不可点击
        this.courseSetDisableTouchObj();
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
    ResetObj()
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
    //**************************************************道具****************************************//
    //重置物体
    ResetObjectPorp()
    {
        if(this.isCourse)
        {
            //教程时不能使用道具
            return;
        }
        if(!this.UsePorp(0))
        {
            console.log("have no porp!");
            return;
        }
        this.ResetObj();
    }
    //双倍积分
    DoubleScorePorp()
    {
        if(this.isCourse)
        {
            //教程时不能使用道具
            return;
        }
        if(this.doubleScore)
        {
            return;
        }
        if(!this.UsePorp(1))
        {
            console.log("have no porp!");
            return;
        }
        this.doubleScore = true;
        
    }
    //-----------------------------最大连线的存储----------------------------------//
    ReradMaxCombo()
    {
        Global.G_maxCombo = 0;
        cc.sys.localStorage.removeItem('MaxCombo');
        let _s = cc.sys.localStorage.getItem('MaxCombo');
        if(_s && null != _s)
        {
            Global.G_maxCombo = _s;
        }
        console.log("ReradMaxCombo : "+Global.G_maxCombo);
        
        this.maxComboLabel.string = Global.G_maxCombo.toString();
    }
    StoreMaxCombo()
    {
        cc.sys.localStorage.setItem('MaxCombo', Global.G_maxCombo);
    }
    //-----------------------------道具的存储----------------------------------//
    //读取道具数量
    ReadPorpNumber()
    {
        // cc.sys.localStorage.removeItem('porpData');
        let _s = cc.sys.localStorage.getItem('porpData');
        // console.log("ChangePorpState : ReadPorpNumber : "+_s);
        if(!_s || null == _s)
        {
            for (let index = 0; index < this.porpButton.length; index++) 
            {
                Global.G_porpN[index] = 3;
                // console.log("ChangePorpState : p : "+ Global.G_porpN[index] );
            }
            // console.log("ChangePorpState : porpButton.length  "+ this.porpButton.length );
        }
        else{
            let porpData = JSON.parse(_s);
            // console.log("ChangePorpState : p0 : "+ porpData.p0 +" p1 : " +porpData.p1 );
            Global.G_porpN[0] = porpData.p0;
            Global.G_porpN[1] = porpData.p1;
        }
        // console.log("ChangePorpState : ReadPorpNumber");
        
        this.ChangePorpState();
    }
    //存储道具数量
    StorePorpNumber()
    {
        this.delayActionNode.stopActionByTag(1);
        let _action = cc.sequence(cc.delayTime(0.1),cc.callFunc(function()
        {
            let porpData = {
                p0: Global.G_porpN[0],
                p1: Global.G_porpN[1]
            };
            // console.log("StorePorpNumber : "+JSON.stringify(porpData));
            
            cc.sys.localStorage.setItem('porpData',  JSON.stringify(porpData));
            // console.log("ChangePorpState : StorePorpNumber");
            this.ChangePorpState();
        },this));
        _action.setTag(1);
        this.delayActionNode.runAction(_action);

        
    }
    //获得道具
    GetPorp(id,_n = 1)
    {
        Global.G_porpN[id] += _n;
        this.StorePorpNumber();
        //存储道具加延时，防止同时调用多次影响游戏使用
        // this.delayActionNode.stopActionByTag(1);
        // let _action = cc.sequence(cc.delayTime(0.1),cc.callFunc(this.StorePorpNumber,this));
        // _action.setTag(1);
        // this.delayActionNode.runAction(_action);
    }
    //使用道具
    UsePorp(id,_n = 1):boolean
    {
        if(0==Global.G_porpN[id] )
        {
            return false;
        }
        Global.G_porpN[id] -= _n;
        this.StorePorpNumber();
        //存储道具加延时，防止同时调用多次影响游戏使用
        // this.delayActionNode.stopActionByTag(1);
        // let _action = cc.sequence(cc.delayTime(0.1),cc.callFunc(this.StorePorpNumber,this));
        // _action.setTag(1);
        // this.delayActionNode.runAction(_action);
        return true;
    }
    ChangePorpState()
    {
        // console.log("ChangePorpState() length : "+Global.G_porpN.length);
        
        for (let index = 0; index < this.porpButton.length; index++) 
        {
            // console.log("ChangePorpState index : "+index);
            
            let _lable = this.porpButton[index].getComponentInChildren(cc.Label);
            if(0== Global.G_porpN[index] || this.isCourse)
            {
                this.porpButton[index].interactable = false;
                _lable.node.active = false;
            }
            else{
                this.porpButton[index].interactable = true;
                _lable.node.active = true;
                // console.log("ChangePorpState G_porpN : "+Global.G_porpN.toString());
                _lable.string = Global.G_porpN[index].toString();
            }
        }
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
    //************************************************教程界面***************************************//
    //是否在进行教程
    private isCourse = true;
    //教程数据(从上向下)
    private courseData = [[4,5,1,3,5],[4,4,4,1,3],[5,1,2,3,2]];
    
    //设置教程数据
    courseSetObjValue(_x,_yy):number
    {
        let _setvalue = 0;
        if(this.isCourse)
        {
            //进行数据设定
            if( _yy <this.courseData.length)
            {
                _setvalue = this.courseData[_yy][_x];
            }
        }
        return _setvalue;
    }
    //教程关设置不可点区
    courseSetDisableTouchObj()
    {
        if(!this.isCourse)
        {
            return;
        }
        for (let y = 0; y < Global.G_objNY; y++) 
        {
            for (let x = 0; x < Global.G_objNX; x++) 
            {
                let _obj =this.GetMapObjNode(cc.p(x,y));  

                let _value = this.GetMapDate(cc.p(x,y));
                //规定最后三行value为4的可点击
                if(Global.G_objNX - y <=3 && 4 == _value)
                {
                    continue;
                }
                if(_obj)
                {
                    _obj.getComponent('obj').changeState(5);
                }
            }
        }
        // this.fingerAnimat();
        this.node.runAction(cc.sequence(cc.delayTime(1),cc.callFunc(this.fingerAnimat,this)));
    }
    //教程关恢复不可点区
    courseRecoverTouchObj()
    {
        if(!this.isCourse)
        {
            return;
        }
        for (let y = 0; y < Global.G_objNY; y++) 
        {
            for (let x = 0; x < Global.G_objNX; x++) 
            {
                let _obj =this.GetMapObjNode(cc.p(x,y));
                if(_obj)
                {
                    let _state = _obj.getComponent('obj').GetState();
                    if(5 == _state)
                    {
                        _obj.getComponent('obj').changeState(2);
                    }
                }
            }
        }
    }
    fingerAnimat()
    {
        if(!this.isCourse)
        {
            return;
        }
        // 手指动画通过
        let handPath = [cc.v2(0,4),cc.v2(0,3),cc.v2(1,3),cc.v2(2,3)];
        let _pos:cc.Vec2[] = [];
        let _action = [];
        for (let index = 0; index < handPath.length; index++) {
                _pos[index] = cc.v2(0.5,0.5).add(handPath[index]);
                _pos[index].x = _pos[index].x*Global.G_objSizeW;
                _pos[index].y = _pos[index].y*Global.G_objSizeH;
            
        }
        for (let index = 0; index < handPath.length; index++) {
            _action.push(cc.moveTo(0.5,_pos[index]));
            
        }
        this.handSprite.node.active = true;
        this.handSprite.node.setLocalZOrder(100);
        this.handSprite.node.setPosition(_pos[0]);
        // this.handSprite.node.stopAllActions();
        this.handSprite.node.runAction(cc.repeatForever(cc.sequence(_action[0],_action[1],cc.delayTime(0.3),_action[2],_action[3],cc.delayTime(0.5))));
        console.log("fingerAnimat() ");
        
    }
    //判断教程开始
    JudgeCourseStart()
    {
        // 手指动画通过
        let _n = cc.sys.localStorage.getItem('isCourseOver');
        // _n = null;
        if(!_n || null == _n)
        {
            this.isCourse = true;
        }
        else{
            this.isCourse = false;
            
        }
        this.ChangePorpState();
        this.handSprite.node.active = false;
        // this.fingerAnimat();
        
    }
    //教程结束
    courseOver()
    {
        if(!this.isCourse)
        {
            return;
        }
        this.courseRecoverTouchObj();
        this.isCourse = false;
        this.handSprite.node.stopAllActions();
        this.handSprite.node.active = this.isCourse;
        //存储数据
        cc.sys.localStorage.setItem('isCourseOver',1);
        this.ChangePorpState();
    }
    //**********************************************************************************************//
    
}
