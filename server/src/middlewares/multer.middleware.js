import multer from "multer";
import path from "path";
import fs from "fs";

// Create the temp directory if it doesn't exist
const tempDir = "./public/temp";
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        // Create a unique filename to avoid conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, extension);
        cb(null, baseName + '-' + uniqueSuffix + extension);
    }
});

// Add file filter and limits for better security
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    // fileFilter: (req, file, cb) => {
    //     // Check if file is an image
    //     if (file.mimetype.startsWith('image/')) {
    //         cb(null, true);
    //     } else {
    //         cb(new Error('Only image files are allowed!'), false);
    //     }
    // }
});