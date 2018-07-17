
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
}

