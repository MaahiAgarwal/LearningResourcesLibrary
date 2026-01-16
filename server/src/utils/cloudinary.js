import { configDotenv } from 'dotenv';
configDotenv({ quiet: true });
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary with secure connection
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Supported file formats
const SUPPORTED_IMAGE_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
const SUPPORTED_AUDIO_FORMATS = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.wma'];

const uploadOnCloudinary = async (localPath, folderName = 'misc') => {
    try {
        // Validate file exists
        if (!localPath || !fs.existsSync(localPath)) {
            console.error('File not found at path:', localPath);
            return null;
        }

        // Get file extension and validate
        const extname = path.extname(localPath).toLowerCase();
        let resourceType = 'auto';
        let uploadOptions = {
            folder: folderName,
            use_filename: true,
            unique_filename: true,
            overwrite: false
        };

        // Determine resource type and set appropriate options
        if (SUPPORTED_IMAGE_FORMATS.includes(extname)) {
            resourceType = 'image';
        } else if (SUPPORTED_AUDIO_FORMATS.includes(extname)) {
            resourceType = 'video'; // Cloudinary requires 'video' type for audio files
            uploadOptions.resource_type = 'video';
            uploadOptions.format = extname.replace('.', '');
        } else {
            throw new Error(`Unsupported file format: ${extname}. Supported formats: ${[...SUPPORTED_IMAGE_FORMATS, ...SUPPORTED_AUDIO_FORMATS].join(', ')}`);
        }

        console.log(`Uploading ${resourceType} file:`, path.basename(localPath));
        
        // Upload the file
        const response = await cloudinary.uploader.upload(
            localPath, 
            { ...uploadOptions, resource_type: resourceType }
        );

        console.log('File uploaded successfully:', {
            url: response.secure_url,
            public_id: response.public_id,
            format: response.format,
            size: response.bytes,
            ...(resourceType === 'video' && { duration: response.duration })
        });

        // Clean up the local file
        fs.unlinkSync(localPath);
        return response;

    } catch (error) {
        console.error('Error uploading to Cloudinary:', {
            error: error.message,
            path: localPath
        });
        
        // Clean up the local file on error
        if (localPath && fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);
        }
        
        return null;
    }
};

export { uploadOnCloudinary };