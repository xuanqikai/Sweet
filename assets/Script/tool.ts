
 /**
     * 工具类和全局变量
     * 
     *
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class tool extends cc.Component {

    //界面层：0为进入游戏界面，1为游戏界面
    public GuiState: number = 0;

    //注意，Singleton是要替换成你自己实现的子类 这里没有实际的作用
    private static instance:tool = null;
    /**
     * 获取实例的静态方法实例
     * @return
     *
     */
    ObjectPoolMap:{[key:string] : cc.NodePool} = {};
    PoolPreMap:{[key:string] : any} = {};

    private bannerAd = null;

    private rewardedAd = null;

    public static getInstance():tool
    {
        if(!this.instance)
        {
            this.instance = new tool();
        }
        return this.instance;
    }
    DrawLineWithPic(_spr:cc.Sprite, _origin:cc.Vec2,_tar:cc.Vec2):boolean
    {
        console.log("DrawLineWithPic 0");
        
        if(!_spr)
        {
            return false;
        }
        console.log("DrawLineWithPic 1");
        let angle = 0;
        let lx = _tar.x - _origin.x;
        let ly = _tar.y - _origin.y;
        let length = Math.sqrt(lx*lx+ly*ly);
        console.log("DrawLineWithPic length："+length);
        if(length<10)
        {
            return false;
        }
        let _h= _spr.node.getContentSize().height;
        _spr.node.setPosition(_origin);
        //设置锚点
        _spr.node.setAnchorPoint(0,0.5);
        //缩放
        _spr.node.width = length;//(length/_h);

        
        angle = -Math.atan2(ly,lx)/Math.PI *180;
        _spr.node.rotation = angle;
        console.log("DrawLineWithPic angle："+angle);
        return true;
    }
    //********************************************存储****************************************************/
    getMyScore():number
    {
        cc.log("getMyScore():----------------------------------------- ");
        let _n = cc.sys.localStorage.getItem('topScore');
        cc.log("getMyScore():----------------------------------------- " + _n);
        if(null == _n)
        {
            return 0;
        }
        return _n;
    }
    setMyScore(_n:number)
    {
        cc.log("setMyScore(_n:number)------------------------------- "+ _n );
        cc.sys.localStorage.setItem('topScore', _n);
    }
    //********************************************自动回收池****************************************************/
    //_name创建的对象池名，_pre预制体或Node节点对象,initSize初始大小(与DestroyObjPool要对应调用)
    CreateObjPool(_name:string,_pre:any,initSize = 0)
    {
        let objPool = new cc.NodePool();
        for (let i = 0; i < initSize; ++i) 
        {
            let obj = cc.instantiate(_pre); // 创建节点
            objPool.put(obj); // 通过 putInPool 接口放入对象池
        }
        this.ObjectPoolMap[_name] = objPool;
        this.PoolPreMap[_name] = _pre;
        console.log("-------------------InitObjectPool()-------------------");
        
    }
    GetObjPool(_name:string):cc.Node
    {
        let  _objPoll = this.ObjectPoolMap[_name];
        if(!_objPoll)
        {
            console.log("Error: The _objPoll "+_name +" is NULL!");          
            return null;
        }
        let  _obj = null;
        if (_objPoll.size() > 0) 
        { // 通过 size 接口判断对象池中是否有空闲的对象
            // console.log("this.ObjPool.size() ppppis --- "+this.ObjPool.size());
             
            _obj = _objPoll.get();
            // console.log("this.ObjPool.size() is --- "+this.ObjPool.size());
        } 
        else 
        { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            _obj = cc.instantiate(this.PoolPreMap[_name]);
        }
        return _obj;
    }
    PoolRecycleObj(_name:string,obj:cc.Node)
    {
        this.ObjectPoolMap[_name].put(obj); // 通过 putInPool 接口放入对象池
    }
    DestroyObjPool(_name:string)
    {
        this.ObjectPoolMap[_name].clear();
        delete this.ObjectPoolMap[_name];
        delete this.PoolPreMap[_name];
    }
    //********************************************************************************************************/
    //改变图片
    ChangeSprite(kind:number)
    {
        //*************<方法一>**************//
        //路径一定要放在资源管理器的绝对路径下,不然会一直报错说在resources文件下找不到(不知原因)
        // var realUrl = cc.url.raw('resources/obj2.png');
        // var texture = cc.textureCache.addImage(realUrl);
        // this.getComponent(cc.Sprite).spriteFrame.setTexture(texture);
    }
    friendButtonFunc() {
        if (CC_WECHATGAME) {
            // 发消息给子域
            window.wx.postMessage({
                messageType: 1,
                MAIN_MENU_NUM: "x2"
            });
        } else {
            cc.log("获取好友排行榜数据。x1");
        }
    }

    groupFriendButtonFunc() {
        if (CC_WECHATGAME) {
            window.wx.shareAppMessage({
                success: (res) => {
                    if (res.shareTickets != undefined && res.shareTickets.length > 0) {
                        window.wx.postMessage({
                            messageType: 5,
                            MAIN_MENU_NUM: "x2",
                            shareTicket: res.shareTickets[0]
                        });
                    }
                }
            });
        } else {
            cc.log("获取群排行榜数据。x1");
        }
    }

    gameOverButtonFunc () {
        if (CC_WECHATGAME) {
            window.wx.postMessage({// 发消息给子域
                messageType: 4,
                MAIN_MENU_NUM: "x2"
            });
        } else {
            cc.log("获取横向展示排行榜数据。x1");
        }
    }

    submitScoreButtonFunc(_score:number){
        cc.log("提交得分: x1 222:----------------------------------------- " + _score);
        if (CC_WECHATGAME) {
            cc.log("提交得分: x1 000:----------------------------------------- " + _score);
            window.wx.postMessage({
                messageType: 3,
                MAIN_MENU_NUM: "x2",
                score: _score,
            });
        } else {
            cc.log("提交得分: x1 : " + _score)
        }
        cc.log("提交得分: x1 :----------------------------------------- " + _score);
    }
    
    CreateBanner()
    {
        if (CC_WECHATGAME) 
        {
            this.bannerAd = wx.createBannerAd({
                adUnitId: 'xxxx',
                style: {
                left: 10,
                top: 76,
                width: 370,
                high: 170
                }
            });
        }
    }
    ShowBanner(_b:boolean =false)
    {
        if (CC_WECHATGAME) 
        {
            if(_b)
            {
                this.bannerAd.show();
            }
            else
            {
                this.bannerAd.hide();
            }
        }
    }
    ChangeBanner()
    {
        if (CC_WECHATGAME) 
        {
            this.bannerAd.destroy();
            this.CreateBanner();
            this.ShowBanner();
        }
    }
    CreateRewardedAd()
    {
        if (CC_WECHATGAME) 
        {
            this.rewardedAd = wx.createRewardedVideoAd({ adUnitId: 'xxxx' });
        }
    }
    ShowRewardedAd()
    {
        if (CC_WECHATGAME) 
        {
            this.rewardedAd.show()
            .catch(err => {
                this.rewardedAd.load()
                .then(() => this.rewardedAd.show());
            });
        }
    }
    GetRewardedAdState()
    {
        if (CC_WECHATGAME) 
        {
            this.rewardedAd.onClose(res => {
                // 用户点击了【关闭广告】按钮
                // 小于 2.1.0 的基础库版本，res 是一个 undefined
                if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                console.log("GetRewardedAdState() over");
                
                }
                else {
                    // 播放中途退出，不下发游戏奖励
                    console.log("GetRewardedAdState() over");
                }
            })
        }
    }
}

