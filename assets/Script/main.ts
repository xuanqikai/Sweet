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

    //暂停界面
    @property(cc.Layout)
    PauseLayer: cc.Layout = null;

    //音乐开关按钮
    @property([cc.Toggle])
    musicToggle: Array<cc.Toggle> = [];
    //音乐开关背景图
    @property([cc.Sprite])
    musicBack: Array<cc.Sprite> = [];
    //背景音乐
    @property(cc.AudioSource)
    backAudioSource: cc.AudioSource;
    //按钮音效
    @property(cc.AudioSource)
    Audio_button: cc.AudioSource;

    currentScene = Scene.First;
    openWX = true;
    musicID = 0;


    onLoad()
    {
        let isBackGround = false;
        cc.game.on(cc.game.EVENT_HIDE, function(event){
            if(!isBackGround){
                isBackGround = true;
                cc.log("切换后台",event);
            }
        });
        cc.game.on(cc.game.EVENT_SHOW, function(event){
            if(isBackGround){
                cc.log("切换前台",event);    
                isBackGround = false;
                this.InitMusicState();
            }
        });
    }
    start () {
        // init logic
        // this.label.string = this.text;
        // wx.showShareMenu();
        this.InitMusicState();
        this.changeScene(Scene.First,true);
        //游戏圈
        if(this.openWX && wx)
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
        }
        this.musicID= 0;
        
        // wx.updateShareMenu({
        //     withShareTicket: true
        //   });
        // wx.getShareInfo({
        //     shareTicket: res.shareTickets[0],
        //     success: this.shareCallBack
        // });
    }
    onEnable()
    {
        this.InitMusicState();
        // console.log("myGame---------onEnable");
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
        if(_n == 0)
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
        if(this.openWX && wx)
        {
            wx.shareAppMessage({
                title: "@你，大家快点来玩Sweet",
                imageUrl: "res/raw-assets/Texture/back.png",//"http://pic.qiantucdn.com/58pic/22/06/55/57b2d98e109c6_1024.jpg!/fw/1024/watermark/url/L2ltYWdlcy93YXRlcm1hcmsvZGF0dS5wbmc=/repeat/true/crop/0x1024a0a0",
                query: "123456"
              });
        }
        
    }
    shareCallBack(object:Object )
    {
        console.log("object  "+object.toString());
        
    }
    //-------------------------------------微信云存储----------------------------------//
    // wxUpUserUserCloudStorage()
    // {
    //     if(!this.openWX || !wx)
    //     {
    //         return;
    //     }
    //     wx.setUserCloudStorage({
    //         keyList:""
    //     });
    // }
    // wxGetUserUserCloudStorage()
    // {
    //     if(!this.openWX || !wx)
    //     {
    //         return;
    //     }
    //     wx.getUserCloudStorage({
    //         keyList:"",
    //         success: this.getDateCallBack(res),
    //         fail: this.getDateFailed()
    //     });
    // }
    // wxGetFriendCloudStorage()
    // {
    //     if(!this.openWX || !wx)
    //     {
    //         return;
    //     }

    // }
    // wxGetUserInfo()
    // {
    //     if(!this.openWX || !wx)
    //     {
    //         return;
    //     }
    //     wx.getUserInfo({
    //         openIdList: ['selfOpenId'],
    //         lang: 'zh_CN',
    //         success: (res) = > {
    //             console.log('success', res.data)
    //         },
    //         fail: (res) = > {
    //             reject(res)
    //         }
    //     });
    // }
    getDateCallBack(_list)
    {

    }
    getDateFailed()
    {

    }
}

