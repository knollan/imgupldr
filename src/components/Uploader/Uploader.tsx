import * as React from "react";
import { IUploaderProps } from '../../common/types/widgetProps';

interface IState {
    drag: boolean,
    dragCounter: number
}

export default class Uploader extends React.Component<IUploaderProps> {
    state: IState = {
        drag: false,
        dragCounter: 0
    };

    handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        this.setState({ dragCounter: this.state.dragCounter + 1 });
        if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
            this.setState({drag: true});
        }
    };

    handleDragleave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        this.setState({ dragCounter: this.state.dragCounter - 1 });
        if (this.state.dragCounter === 0) {
            this.setState({drag: false});
        }
    };

    handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        this.setState({drag: false});
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            console.log(event.dataTransfer.files);
            event.dataTransfer.clearData();
            this.state.dragCounter = 0;
            this.readFile(event.dataTransfer.files[0]);
        }
    };

    onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            this.readFile(event.target.files[0]);
        }
    };

    readFile = (file: any): void => {
        const reader = new FileReader();
        const fileName: string = file.name;
        const fileType: string = file.type;

        reader.addEventListener('load', () => {
            this.props.setImageSrc(fileName, fileType, reader.result.toString());    
        });

        reader.readAsDataURL(file);
    }

    public render() {
        return (
            <div className="uploader"
                draggable={true}
                onDragEnter={this.handleDragEnter}
                onDragOver={this.handleDragOver}
                onDrop={this.handleDrop}
            >
                <div className="initial-view">
                    <div className="big">Drag an image here</div>
                    <div className="small">or you can also</div>
                    <input type="file" accept="image/*" className="custom-file-input" onChange={this.onSelectFile} />
                </div>
            </div>
        );
    }
}
