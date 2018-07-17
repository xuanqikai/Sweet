import tool from "./tool";


export enum Scene 
{ 
    First =0,
    Main,
} ;

export class Global 
{
    static G_myTool:tool = tool.getInstance();
    //屏幕大小
    static width = 720;
    static height = 1280;
    //颜色种类(0为空位置)
    static G_objKind:number = 5;
    //X和Y方向数量
    static G_objNX:number = 5;
    static G_objNY:number = 5;
    //宽高
    static G_objSizeW:number = 94;
    static G_objSizeH:number = 102;
}