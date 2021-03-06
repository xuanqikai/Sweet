import { Scene, Global } from "./Global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class main extends cc.Component {

    //游戏开始界面
    @property(cc.Layout)
    firstScene: cc.Layout = null;

    //游戏主界面
    @property(cc.Layout)
    mainScene: cc.Layout = null;

    //游戏主逻辑界面
    @property(cc.Layout)
    myGame: cc.Layout = null;

    //暂停界面
    @property(cc.Layout)
    PauseLayer: cc.Layout = null;

    //背景图
    @property([cc.Node])
    gameBackNode: Array<cc.Node> = [];

    @property(cc.Label)
    highscoreLabel: cc.Label = null;

    //音乐开关按钮
    @property([cc.Toggle])
    musicToggle: Array<cc.Toggle> = [];
    //音乐开关背景图
    @property([cc.Sprite])
    musicBack: Array<cc.Sprite> = [];
    //背景音乐
    @property(cc.AudioSource)
    backAudioSource: cc.AudioSource = null;
    //按钮音效
    @property(cc.AudioSource)
    Audio_button: cc.AudioSource = null;

    @property(cc.Sprite)
    rankingScrollView: cc.Sprite = null;//显示排行榜

    currentScene = Scene.First;
    openWX = true;
    musicID = 0;


    onLoad()
    {
        // let isBackGround = false;
        // cc.game.on(cc.game.EVENT_HIDE, function(event){
        //     if(!isBackGround){
        //         isBackGround = true;
        //         cc.log("切换后台",event);
        //     }
        // });
        // cc.game.on(cc.game.EVENT_SHOW, function(event){
        //     if(isBackGround){
        //         cc.log("切换前台",event);    
        //         isBackGround = false;
        //     }
        // });
        //适配解决方案
        console.log("winSize: W: "+cc.director.getVisibleSize().width+" H: "+cc.director.getVisibleSize().height);
        let _canvas:cc.Canvas = this.getComponent("cc.Canvas");

        //设计分辨率比
        let _rateR = _canvas.designResolution.height/_canvas.designResolution.width;
        //显示分辨率比
        let _rateV = cc.director.getVisibleSize().height/cc.director.getVisibleSize().width;
        console.log("winSize: _rateR: "+_rateR+" _rateV: "+_rateV);
        if(_rateV > _rateR)
        {
            _canvas.fitHeight = false;
            _canvas.fitWidth = true;
            console.log("winSize: fitWidth");
            this.gameBackNode.forEach(element => {
                element.setScale(_rateV/_rateR);
                // console.log("winSize: setScale: "+ _rateV/_rateR);
            });
        }
        else
        {
            _canvas.fitHeight = true;
            _canvas.fitWidth = false;
            console.log("winSize: fitHeight");
            this.gameBackNode.forEach(element => {
                element.setScale(_rateR/_rateV);
                // console.log("winSize: setScale: "+ _rateR/_rateV);
            });
            
        }
        console.log(" 0000 main---------onLoad");
    }
    start () {
        // init logic
        // this.label.string = this.text;
        // wx.showShareMenu();
        Global.G_topScore = 0;
        let _n = Global.Tool.getMyScore();
        // let _n = cc.sys.localStorage.getItem('topScore');
        if(_n && _n>0)
        {
            Global.G_topScore = _n;
        }
        this.highscoreLabel.string = Global.G_topScore.toString();
        this.InitMusicState();
        this.changeScene(Scene.First,true);
        this.wxInit();
        this.musicID= 0;
        
        // wx.updateShareMenu({
        //     withShareTicket: true
        //   });
        // wx.getShareInfo({
        //     shareTicket: res.shareTickets[0],
        //     success: this.shareCallBack
        // });
        console.log(" 0000 main---------start");
    }
    onEnable()
    {
        
        // console.log("myGame---------onEnable");
    }
    update() {
        this._updateSubDomainCanvas();
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
    GoBack()
    {
        this.changeScene(Scene.First);
    }
    //-----------------------------声音的存储----------------------------------//
    //通过存储初始化声音状态
    InitMusicState()
    {
        let _n = cc.sys.localStorage.getItem('music');
        if(!_n || _n == 0)
        {
            Global.G_musicOn = false;
        }
        else{
            Global.G_musicOn = true;
        }
        this.ChangeMusicState(Global.G_musicOn,true);

    }
    //改变声音状态
    ChangeMusicState(_on:boolean,_force:boolean = false)
    {
        if(!_force &&_on == Global.G_musicOn)
        {
            return;
        }
        if(_on != Global.G_musicOn)
        {
            Global.G_musicOn = _on;
            let _n = _on?1:0;
            cc.sys.localStorage.setItem('music', _n);
            console.log("ChangeMusicState ---- "+ Global.G_musicOn);
        }
        this.changeToggleState();
        if(_on)
        {
            if(_force)
            {
                this.backAudioSource.stop();
            }
            this.backAudioSource.play();
            this.backAudioSource.loop = true;
        }
        else
        {
            this.backAudioSource.stop();
        }
        
    }
    changeToggleState()
    {
        this.musicToggle.forEach(element => {
            element.isChecked = Global.G_musicOn;
        });
        this.musicBack.forEach(element => {
            element.node.active = !Global.G_musicOn;
        });
    }
    //获取声音状态
    GetMusicState():boolean
    {
        return Global.G_musicOn;
    }
    MusicCallback(event, customEventData) 
    {
        // //这里 event 是一个 Touch Event 对象，就是响应的节点
        var node:cc.Toggle = event;
        
        // var toggle = node.getComponent(cc.Toggle);
        // var toggle = event.detail;
        this.ChangeMusicState(node.isChecked);
    }
    ShowPauseLayer()
    {
        this.PauseLayer.node.active = true;
    }
    HidePauseLayer()
    {
        this.PauseLayer.node.active = false;
    }
    //-------------------------------------声音----------------------------------//
    playButtonAudio()
    {
        this.Audio_button.play();
        // cc.audioEngine.play( this.Audio_button, false, 1);
    }
    
    //-------------------------------------分享----------------------------------//
    //分享
    share()
    {
        console.log("share  00000");
        Global.Tool.setMyScore(0);
        console.log("share  11111");
        if(this.openWX && wx)
        {
            wx.shareAppMessage({
                title: "震惊!00后放学后发现，校长竟然和王老师一起玩连盟!",
                imageUrl: "res/raw-assets/Texture/shareAD2.png",//"http://pic.qiantucdn.com/58pic/22/06/55/57b2d98e109c6_1024.jpg!/fw/1024/watermark/url/L2ltYWdlcy93YXRlcm1hcmsvZGF0dS5wbmc=/repeat/true/crop/0x1024a0a0",
                query: "123456"
              });
        }
        
    }
    shareCallBack(object:Object )
    {
        console.log("object  "+object.toString());
        
    }
    //-------------------------------------广告----------------------------------//
    //视频复活
    ReviveByAD()
    {
        console.log("reviveBuAD");
        
    }
    //-------------------------------------微信----------------------------------//
    wxInit()
    {
        //游戏圈
        if(CC_WECHATGAME)
        {
            wx.createGameClubButton({
                icon: 'green',
                style: {
                    left: 10,
                    bottom: 60,
                    width: 40,
                    height: 40
                    
                }
            });
            wx.onShow((res) => {
                this.InitMusicState();
                        });

            window.wx.showShareMenu({withShareTicket: true});//设置分享按钮，方便获取群id展示群排行榜
            this.tex = new cc.Texture2D();
            // window.sharedCanvas.width = 720;
            // window.sharedCanvas.height = 1280;
            window.wx.postMessage({
                messageType: 1,
                MAIN_MENU_NUM: "x2"
            });
        }
        // this.rankingScrollView.node.setContentSize(cc.view.getFrameSize());
        this.rankingScrollView.node.setContentSize(cc.director.getVisibleSize());
        console.log("winSize: W2222: "+cc.director.getVisibleSize().width+" H22222: "+cc.director.getVisibleSize().height);
    }
    getRank()
    {
        Global.Tool.friendButtonFunc();
    }

    // 刷新子域的纹理
    _updateSubDomainCanvas() {
        if (window.sharedCanvas != undefined) {
            this.tex.initWithElement(window.sharedCanvas);
            this.tex.handleLoadedTexture();
            this.rankingScrollView.spriteFrame = new cc.SpriteFrame(this.tex);
        }
    }

    

    
}

