const {ccclass, property} = cc._decorator;  // 从 cc._decorator 命名空间中引入 ccclass 和 property 两个装饰器

import {Global,Scene}  from './Global';
import obj from './obj';
@ccclass
export default class myGame extends cc.Component {

    @property(cc.Prefab)
    objPrefab: cc.Prefab = null;

    //是否所有物体进入稳定状态
    IsAllObjectStabilization = 0;
    //当前局出现过的最大等级值
    private CurTopValue = 1;
    //当前地图中物体值信息
    private CurMapValue:Array<Array<any>> = new Array<Array<any>>();
    private CurMapNode:Array<Array<cc.Node>>  = new Array<Array<cc.Node>>();
    private CurSelectPos:Array<cc.Vec2>  = new Array<cc.Vec2>();
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
    private touchPos = cc.v2(-1,-1);
    private num = 0;


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
        this.node.setPosition((Global.width-Global.G_objNX*Global.G_objSizeW)/2,(Global.height-Global.G_objNY*Global.G_objSizeH)/2);
        this.InitObjectPool();
        this.isGameRunning = false;
        
    }
    start () 
    {
        console.log("myGame---------start");
        this.num = 0;
    }
    onEnable()
    {
        // this.GameStart();
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
        if(this.objParentNode && cc.isValid(this.objParentNode))
        {
            this.objParentNode.destroy();
        }
        this.objParentNode = null;
        
    }
    //*************************************************触碰事件*********************************************//
    touchStart (event)
    {
        //转换为本节点位置
        ~~~
        if(event.getLocation().x<0 || event.getLocation().y<0)
        {
            return;
        }
        console.log(" touchstart (event) 000  ");
        this.touchPos.set(event.getLocation());
        this.ClearSelectPos();
        this.JudgeSelectObject(event.getLocation());
    }
    //滑动事件
    touchMove (event)
    {
        if(this.touchPos.x<0 || this.touchPos.y<0)
        {
            return;
        }
        this.JudgeSelectObject(event.getLocation());
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
        if(this.ClearSelectPos.length>1)
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
    //**************************************************游戏声明周期********************************************//
    GameStart()
    {
        //---------------------------初始化值--------------------------------//
        //当前局出现过的最大等级值
        this.CurTopValue = 1;

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
        // this.CurMapValue[0][1] = 2;
        // this.CreateObject();
        this.istouchedMove =0;
        this.isGameRunning = true;
        //绑定触碰事件
        this.node.on(cc.Node.EventType.TOUCH_START,this.touchStart, this);
        this.node.on(cc.Node.EventType.MOUSE_DOWN,this.touchStart, this);
        
        this.node.on(cc.Node.EventType.TOUCH_MOVE,this.touchMove, this);
        this.node.on(cc.Node.EventType.MOUSE_MOVE,this.touchMove, this);
        // this.node.on(cc.Node.EventType.TOUCH_START,function(){
        //     console.log("cc.Node.EventType.TOUCH_START");
            
        // }, this);
        this.node.on(cc.Node.EventType.TOUCH_END,this.touchEnd, this);
        // this.node.on(cc.Node.EventType.TOUCH_MOVE,function(){
        //     console.log("cc.Node.EventType.TOUCH_MOVE");
            
        // }, this);
        this.JudgeAutoMove();

    }
    GameOver()
    {
        //删除绑定触碰事件
        // this.node.off(cc.Node.EventType.TOUCH_MOVE,this.touchMove, this);
        // this.node.off(cc.Node.EventType.TOUCH_END,this.touchEnd, this);
        this.isGameRunning = false;
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
        if(!obj.getComponent('obj').CanToucheMe())
        {
            return;
        }
        if(this.CurSelectPos.length>1)
        if(_mapos.equals(this.CurSelectPos[this.CurSelectPos.length - 2]))
        {
            this.ClearSelectPos(true);
            this.ClearSelectPos(true);
            return;
        }
        if(this.GetMapDate(_mapos) != this.GetMapDate(this.CurSelectPos[0]))
        {
            return;
        }
        obj.getComponent('obj').changeState(3);
        this.CurSelectPos.push(_mapos.clone());
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
    }
    RemoveSelectPos()
    {
        let l = this.CurSelectPos.length;
        while(l >0)
        {
            let _p= cc.p(0,0);
            _p.set(this.CurSelectPos.pop());

            let obj = this.GetMapObjNode(_p);
            this.DestoryObject(_p);
        }
        if(l >0)
        {
            this.JudgeAutoMove();
        }
    }
    //获取当前下落物体
    GetCurObject():cc.Node
    {
        return this.curObj;
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
        console.log("myGame---------obj objPrefab: "+this.objPrefab);
        console.log("myGame---------obj value: "+obj);
        console.log("myGame---------obj node: "+ this.objParentNode);
        console.log("myGame---------obj num: "+ this.num);
        
        // this.node.addChild(obj);
        // 将新增的节点添加到 Canvas 节点下面
        this.objParentNode.addChild(obj);
        console.log("myGame---------obj num: "+ this.num);
        obj.getComponent('obj').Birth(this.node,_x);
        console.log("myGame---------obj num: "+ this.num);
        this.curObj =  obj;
        this.IsAllObjectStabilization++;
        console.log("myGame---------CreateObject()");
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
        // console.log("myGame---------obj value: "+obj.getComponent('obj').myValue);
        obj.getComponent('obj').Die();
        this.UpdateMapDate(0,_p,null);
        
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
    //判断自动移动_x:指定行
    JudgeAutoMove(_x:number = -1)
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
    }
    //移动方向
    PicMove(dir:number)
    {
        
    }
    //**********************************************************************************************//
    
}
