import { media_images } from '@xcomrade/types-server';
import { useState } from 'react';

/*Media Components:
  - ImageGallery --> Display multiple images (media_images)
  - ImageUpload --> Upload images component
*/

interface ImageGalleryProps {
  images: media_images[];
  onImageClick?: (imageId: number) => void;
  columns?: number;
}

const ImageGallery = ({ images, onImageClick, columns = 3 }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<media_images | null>(null);

  const handleImageClick = (image: media_images) => {
    setSelectedImage(image);
    onImageClick?.(image.id);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div className="image-gallery" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {images.length === 0 ? (
          <p className="no-images">No images to display</p>
        ) : (
          images.map((image) => (
            <div
              key={image.id}
              className="gallery-item"
              onClick={() => handleImageClick(image)}
            >
              <img
                src={image.image_url}
                alt={`Gallery image ${image.id}`}
                loading="lazy"
              />
            </div>
          ))
        )}
      </div>

      {selectedImage && (
        <div className="image-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>×</button>
            <img src={selectedImage.image_url} alt="Full size" />
          </div>
        </div>
      )}
    </>
  );
};

interface ImageUploadProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  acceptedFormats?: string;
  isUploading?: boolean;
}

const ImageUpload = ({
  onUpload,
  maxFiles = 5,
  acceptedFormats = 'image/*',
  isUploading = false
}: ImageUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + selectedFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images`);
      return;
    }

    setSelectedFiles([...selectedFiles, ...files]);

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);

    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);

    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (files.length + selectedFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images`);
      return;
    }

    setSelectedFiles([...selectedFiles, ...files]);
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  return (
    <div className="image-upload">
      <div
        className="upload-area"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-input"
          multiple
          accept={acceptedFormats}
          onChange={handleFileSelect}
          disabled={isUploading}
          style={{ display: 'none' }}
        />
        <label htmlFor="file-input" className="upload-label">
          <div className="upload-icon">📷</div>
          <p>Drag & drop images here or click to select</p>
          <small>Max {maxFiles} images</small>
        </label>
      </div>

      {previewUrls.length > 0 && (
        <div className="preview-container">
          <h4>Selected Images ({selectedFiles.length}/{maxFiles})</h4>
          <div className="preview-grid">
            {previewUrls.map((url, index) => (
              <div key={index} className="preview-item">
                <img src={url} alt={`Preview ${index + 1}`} />
                <button
                  className="remove-preview"
                  onClick={() => handleRemoveFile(index)}
                  disabled={isUploading}
                >
                  ×
                </button>
                <p className="file-name">{selectedFiles[index].name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="upload-actions">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="upload-btn"
          >
            {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} image(s)`}
          </button>
          <button
            onClick={() => {
              previewUrls.forEach(url => URL.revokeObjectURL(url));
              setSelectedFiles([]);
              setPreviewUrls([]);
            }}
            disabled={isUploading}
            className="clear-btn"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export { ImageGallery, ImageUpload };
export default { ImageGallery, ImageUpload };
