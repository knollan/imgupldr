export interface IWidgetProps {
    uploadApi: string;
    height: number;
    width: number;
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
    aspectRatio: string;
    compression: number;
    folder: string;
    callback: string;
}

declare global {
    interface Window {
        imgupldrCallback(result: any): void;
    }
}

export type imageReaderResultType = string;

export interface IUploaderProps {
    setImageSrc(name: string, type: string, src: imageReaderResultType): void;
}
