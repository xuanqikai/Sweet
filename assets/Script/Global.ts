import tool from "./tool";


export enum Scene 
{ 
    First =0,
    Main,
} ;

export class Global 
{
    static Tool:tool = tool.getInstance();
    //屏幕大小
    static width = 720;
    static height = 1280;
    //颜色种类(0为空位置)
    static G_objKind:number = 5;
    //X和Y方向数量
    static G_objNX:number = 5;
    static G_objNY:number = 5;
    //宽高
    // static G_objSizeW:number = 105;
    // static G_objSizeH:number = 120;
    static G_objSizeW:number = 130;
    static G_objSizeH:number = 130;
    //最高分
    static G_topScore:number = 0;
    //声音开关
    static G_musicOn = true;
    //道具数量(重置，分数翻倍)
    static G_porpN = [3,3];
    //最大连线数
    static G_maxCombo = 0;
}
