import React, { useCallback, useState } from 'react';

export interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  placeholder?: string;
  dragActiveText?: string;
}

export function UploadDropzone({
  onFileSelect,
  accept,
  multiple = false,
  disabled = false,
  className = '',
  style = {},
  children,
  placeholder = 'Click to select or drag and drop files here',
  dragActiveText = 'Drop the files here...',
}: UploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragActive(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (multiple) {
        files.forEach(file => onFileSelect(file));
      } else {
        onFileSelect(files[0]);
      }
    }
  }, [disabled, multiple, onFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      if (multiple) {
        files.forEach(file => onFileSelect(file));
      } else {
        onFileSelect(files[0]);
      }
    }
  }, [multiple, onFileSelect]);

  const defaultStyles: React.CSSProperties = {
    border: '2px dashed #cccccc',
    borderRadius: '4px',
    padding: '20px',
    textAlign: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: isDragActive ? '#f0f8ff' : '#fafafa',
    transition: 'background-color 0.2s ease',
    opacity: disabled ? 0.5 : 1,
    ...style,
  };

  return (
    <div
      className={`nexus-upload-dropzone ${className}`}
      style={defaultStyles}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => !disabled && document.getElementById('nexus-file-input')?.click()}
    >
      <input
        id="nexus-file-input"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      {children || (
        <p style={{ margin: 0, color: '#666' }}>
          {isDragActive ? dragActiveText : placeholder}
        </p>
      )}
    </div>
  );
}