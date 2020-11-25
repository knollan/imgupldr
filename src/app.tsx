import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ImageManager from './imageManager';
import { IWidgetProps } from './common/types/widgetProps';

const target = document.getElementById('osImageMgrPro')
const props: IWidgetProps = {
    uploadApi: target.dataset.uploadApi || '',
    folder: target.dataset.folder || '',
    height: parseInt(target.dataset.height) || 400,
    width: parseInt(target.dataset.width) || 600,
    aspectRatio: target.dataset.aspectRatio || '',
    compression: parseInt(target.dataset.compression) || 60,
    minWidth: parseInt(target.dataset.minWidth) || 380,
    minHeight: parseInt(target.dataset.minHeight) || 380,
    maxWidth: parseInt(target.dataset.maxWidth) || 0,
    maxHeight: parseInt(target.dataset.maxHeight) || 0,
    callback: target.dataset.callback || ''
};

if (!target.dataset.uploadApi) {
    throw new Error('data-upload-api are required');
} else {
    ReactDOM.render(
      <ImageManager {...props} />,
      target,
    );
}
