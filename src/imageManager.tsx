import * as React from 'react';
import ReactCrop from 'react-image-crop';
import Compressor from 'compressorjs';
import { IWidgetProps, imageReaderResultType } from './common/types/widgetProps';
import Uploader from './components/Uploader/Uploader';
import 'regenerator-runtime/runtime.js';

// Import Styles
import 'react-image-crop/dist/ReactCrop.css';
import './styles/global.scss';

interface IState {
    imgSrc: imageReaderResultType;
    origFileName: string;
    origFileType: string;
    origImageWidth: number;
    origImageHeight: number;
    crop: ReactCrop.Crop | null;
    percentCrop: ReactCrop.Crop | null;
    fileUrl: string;
    croppedImageUrl: string;
    imageRef: HTMLImageElement | null; //CanvasImageSource
    finalUrl: string;
}

interface optionalCropParams {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
}

export default class ImageManager extends React.Component<IWidgetProps, IState> {
    public constructor(props: IWidgetProps) {
        super(props);

        const { aspectRatio, height, width, minWidth, minHeight } = this.props;
        const crop: ReactCrop.Crop = {} as ReactCrop.Crop;

        if (aspectRatio) {
            const aspectRatioSplit: string[] = aspectRatio.split(':');

            if (aspectRatioSplit.length === 2) {
                crop.aspect = parseInt(aspectRatioSplit[0]) / parseInt(aspectRatioSplit[1]);
            }
        }

        crop.unit = 'px';

        if (minWidth > 0 || minHeight > 0) {

            if (minWidth > 0) {
                crop.width = minWidth;
            } else if (minHeight > 0) {
                crop.height = minHeight;
            }
        }

        this.state = {
            imgSrc: null,
            origFileName: '',
            origFileType: '',
            origImageWidth: 0,
            origImageHeight: 0,
            imageRef: null,
            fileUrl: '',
            finalUrl: '',
            croppedImageUrl: '',
            crop,
            percentCrop: null
        };

        this.setImageSrc = this.setImageSrc.bind(this);
        this.handleUpload = this.handleUpload.bind(this);
    }

    private cleanUpString(value: string): string {
        const valueArr: string[] = value.split('');

        let prev: string = '';
        const cleanStr: string = valueArr.map((val: string) => {
            if (val !== prev) {
                prev = val;
                return val;
            }
        }).join('');

        const fileTypePos: number = cleanStr.lastIndexOf('.');
        const fileName: string = cleanStr.substr(0, fileTypePos - 1);
        const fileType: string = cleanStr.substring(fileTypePos);

        return fileName.substring(0, 25) + fileType;
    }

    private setImageSrc(name: string, type: string, src: imageReaderResultType): void {
        const { minWidth, minHeight } = this.props;
        const me: any = this;

        if (src != null) {
            const img: any = new Image();

            img.onload = function() {
                if (minWidth > 0 && this.width < minWidth) {
                    me.setState({imgSrc: null});
                    alert(`Image width must be at least ${minWidth}px`);
                    me.setState({imgSrc: null});
                } else if (minHeight > 0 && this.height < minHeight) {
                    alert(`Image height must be at least ${minHeight}px`);
                } else {
                    const fileName = me.cleanUpString(name.replace(/[^a-zA-Z0-9-_.\s]/g, '').replace(/[\s]/g, '-'));

                    me.setState({
                        imgSrc: src,
                        origFileName: fileName,
                        origFileType: type,
                        origImageWidth: this.width,
                        origImageHeight: this.height
                    });
                }
            };

            img.onerror = function() {
                me.setState({imgSrc: null});
            };

            img.src = src;
        }
    };

    private onImageLoaded = (imageRef: HTMLImageElement ): void => {
        this.setState({ imageRef });
    }

    private onCropComplete = (crop: ReactCrop.Crop): void => {
        this.makeClientCrop(crop);
    }

    private onCropChange = (crop: ReactCrop.Crop, percentCrop: ReactCrop.Crop): void => {
        const actualCropWidth: number = this.state.origImageWidth * percentCrop.width / 100;
        const actualCropHeight: number = this.state.origImageHeight * percentCrop.height / 100;

        if (this.props.minWidth > 0 && this.props.minWidth > actualCropWidth) {
            return;
        }

        if (this.props.minHeight > 0 && this.props.minHeight > actualCropHeight) {
            return;
        }

        this.setState({ crop, percentCrop });
    }

    private async makeClientCrop(crop: ReactCrop.Crop): Promise<void> {
        if (this.state.imageRef && crop.width && crop.height) {
            const croppedImageUrl: string = await this.getCroppedImg(
                this.state.imageRef,
                crop,
                'newFile.jpeg'
            );

            this.setState({
                croppedImageUrl
            });
        }
    }

    private getCroppedImg(image: HTMLImageElement, crop: ReactCrop.Crop, fileName: string): Promise<string> {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        const scaleX: number = image.naturalWidth / image.width;
        const scaleY: number = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob: Blob): void => {
                if (!blob) {
                    reject('Canvas is empty');
                    console.error('Canvas is empty');
                    return;
                }

                //blob.name = fileName;
                window.URL.revokeObjectURL(this.state.fileUrl);
                this.setState({fileUrl: window.URL.createObjectURL(blob)});
                resolve(this.state.fileUrl);
            }, 'image/jpeg');
        });
    }

    private handleUpload() {
        const { imgSrc, percentCrop } = this.state;
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
        const myImage: HTMLImageElement = new Image();
        myImage.src = imgSrc;
        const targetWidth: number = percentCrop.width / 100 * myImage.width;
        const targetHeight: number = percentCrop.height / 100 * myImage.height;
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        ctx.drawImage(
            myImage,
            percentCrop.x / 100 * myImage.width,
            percentCrop.y / 100  * myImage.height,
            targetWidth,
            targetHeight,
            0,
            0,
            targetWidth,
            targetHeight
        );

        canvas.toBlob((blob: Blob): void => {
            if (!blob) {
                console.error('Canvas is empty');
                return;
            }

            const self: ImageManager = this;

            new Compressor(
                blob,
                {
                    quality: this.props.compression / 100,
                    maxWidth: this.props.maxWidth,
                    maxHeight: this.props.maxHeight,
                    success: function (result: Blob) {
                        window.URL.revokeObjectURL(self.state.finalUrl);

                        const output: string = window.URL.createObjectURL(result);
                        self.setState({finalUrl: output});

                        self.uploadFile(output);
                    },
                    error: function (err: Error) {
                        console.error(`Compression error:\r\n${err.message}`);
                    },
                }
            );
        }, 'image/jpeg');
    }

    public uploadFile(src: string) {
        const { folder, uploadApi } = this.props;

        this.srcToFile(src)
            .then((file) => {
                var formData = new FormData();
                formData.append('files[]', file);
                formData.append('folder', folder);

                return fetch(
                    uploadApi,
                    { method:'POST', body:formData }
                ).then((res) => {
                    if (typeof window.imgupldrCallback === "function") {
                        const { origFileName, origFileType} = this.state;

                        window.imgupldrCallback({
                            file: {
                                url: src,
                                name: origFileName,
                                type: origFileType
                            }
                        });

                        this.setState({
                            imgSrc: null,
                            origFileName: '',
                            origFileType: '',
                            origImageWidth: 0,
                            origImageHeight: 0,
                            imageRef: null,
                            fileUrl: '',
                            finalUrl: '',
                            croppedImageUrl: '',
                            crop: {} as ReactCrop.Crop,
                            percentCrop: null
                        });
                    }
                });
            });
    }

    public srcToFile(src: string) {
        return (
            fetch(src)
                .then((res) => res.arrayBuffer())
                .then((buf) => new File([buf], this.state.origFileName, { type: this.state.origFileType }))
        );
    }

    public render() {
        const {
            height,
            width,
            minWidth,
            minHeight,
            maxWidth,
            maxHeight
        } = this.props;

        const { imgSrc } = this.state;
        const styles: any = {};

        if (height > 0) {
            styles.height = height;
        }

        if (width > 0) {
            styles.width = width;
        }

        return (
            <div className="img-upldr" style={styles}>
                {
                    imgSrc == null
                        ?
                            <Uploader setImageSrc={this.setImageSrc} />
                        :
                            <React.Fragment>
                                <div className="crop-container">
                                    <div className="cropper">
                                        <div className="header">
                                            Original image
                                            <span className="refresh" onClick={() => window.location.reload()}>X</span>
                                        </div>
                                        <ReactCrop
                                            src={imgSrc}
                                            crop={this.state.crop}
                                            ruleOfThirds={true}
                                            keepSelection={true}
                                            onImageLoaded={this.onImageLoaded}
                                            onComplete={this.onCropComplete}
                                            onChange={this.onCropChange}
                                        />
                                    </div>
                                    <div className="preview">
                                        <p>Preview:</p>
                                    {
                                        this.state.croppedImageUrl &&
                                        <img alt="Crop" style={{ maxWidth: '100%' }} src={this.state.croppedImageUrl} />
                                    }
                                    </div>
                                </div>
                                <div className="footer">
                                    <button className="btn" onClick={this.handleUpload}>
                                        Upload
                                    </button>
                                </div>
                            </React.Fragment>
                }
                {
                    this.state.finalUrl &&
                    <div style={{"display": "none"}}>
                        <img src={this.state.finalUrl} />
                    </div>
                }
            </div>
        );
    }
}
