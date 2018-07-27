
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

