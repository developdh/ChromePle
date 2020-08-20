export interface InitData {
    width: number;
    height: number;
    dataURL: string;
}

export interface BrushData {
    color: number;
    width: number;
    alpha: number;
    eraserMode: boolean;
}

export interface ChromePle {
    initData: InitData;
    brushData: BrushData;
}