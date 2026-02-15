import React, {useState, useCallback, useEffect, useRef} from 'react';
import {useOutletContext} from "react-router";
import {CheckCircle2, ImageIcon, UploadIcon} from "lucide-react";
import {PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS} from "../lib/constants";

interface UploadProps {
    onComplete?: (data: string) => void;
}

const Upload: React.FC<UploadProps> = ({ onComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    

    const {isSignedIn} = useOutletContext<AuthContext>() // to check login

    const uploadIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const uploadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const processFile = useCallback((file: File) => {
        if (!isSignedIn) return;

        // Clear existing timers
        if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
        if (uploadTimeoutRef.current) clearTimeout(uploadTimeoutRef.current);

        setFile(file);
        setProgress(0);

        const reader = new FileReader();
        reader.onerror=()=>{ // Error handling for image reading
            setFile(null);
            setProgress(0);
        }
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            
            uploadIntervalRef.current = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
                        uploadIntervalRef.current = null;

                        uploadTimeoutRef.current = setTimeout(() => {
                            onComplete?.(base64);
                            uploadTimeoutRef.current = null;
                        }, REDIRECT_DELAY_MS);
                        return 100;
                    }
                    return prev + PROGRESS_STEP;
                });
            }, PROGRESS_INTERVAL_MS);
        };
        reader.readAsDataURL(file);
    }, [isSignedIn, onComplete]);

    useEffect(() => {
        return () => {
            if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
            if (uploadTimeoutRef.current) clearTimeout(uploadTimeoutRef.current);
        };
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (isSignedIn) setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (!isSignedIn) return;

        const droppedFile = e.dataTransfer.files[0]
        const allowedTypes = ['image/jpeg','image/jpp','image/png'];
        if(droppedFile && allowedTypes.includes(droppedFile.type)) {
            processFile(droppedFile);


        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) return;
        const files = e.target.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    return (
        <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input type="file"
                           className='drop-input'
                           accept=".jpg,.jpeg,.png"
                           disabled={!isSignedIn}
                           onChange={handleChange}/>
                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20}/>
                        </div>
                        <p>
                            {isSignedIn?(
                                "Click to upload or just drag and drop"
                            ):(
                                "Sign in or Sign up with Puter to upload"
                            )}
                        </p>
                        <p className="help">Maximum file size 50MB.</p>
                    </div>
                </div>
            ): (
                <div className="upload-status">
                    <div className="status-content">
                        <div className="status-icon">
                            {progress == 100 ? (
                                <CheckCircle2 className="check" />
                            ): (
                                <ImageIcon className="image" />
                            )}
                        </div>

                        <h3>{file.name}</h3>
                        <div className="progress">
                            <div className="bar" style={{ width: `${progress}%`}}/>
                            <p className="status-text">
                                {progress <100 ? 'Analyzing Floor Plan... ': 'Redirecting... '}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Upload;