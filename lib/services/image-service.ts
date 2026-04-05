import imageCompression from "browser-image-compression"
import { supabase } from "@/lib/supabase/client"
import type { ImageServiceConfig, ImageUploadResult, ImageValidationResult } from "@/lib/types"

const DEFAULT_CONFIG: ImageServiceConfig = {
    bucket: "avatars",
    maxSizeMB: 20,
    compressionThresholdMB: 1,
    allowedTypes: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/avif",
        "image/webp",
    ],
    folder: "profiles",
}

export class ImageService {
    private config: ImageServiceConfig;

    constructor(config: Partial<ImageServiceConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config }
    }

    // 1. Method to do validation
    validate(file: File): ImageValidationResult {
        if (!this.config.allowedTypes.includes(file.type)) {
            const allowedExtensions = this.config.allowedTypes
                .map((type) => type.split("/")[1].toUpperCase())
                .join(", ");

            return {
                valid: false,
                error: `Invalid file type. Allowed types: ${allowedExtensions}`,
            };
        }

        const fileSizeMB = file.size / (1024 * 1024)

        if (fileSizeMB > this.config.maxSizeMB) {
            return {
                valid: false,
                error: `File size exceeds ${this.config.maxSizeMB}MB limit. Your file is ${fileSizeMB.toFixed(2)}MB`,
            };
        }

        return { valid: true };
    }

    // 2. Compress image if it crosses the size threshold
    async compress(file: File): Promise<File> {
        const fileSizeMB = file.size / (1024 * 1024);

        if (fileSizeMB <= this.config.compressionThresholdMB) {
            return file
        }

        try {
            const options = {
                maxSizeMB: this.config.compressionThresholdMB,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
                fileType: file.type as string,
            }

            const compressedFile = await imageCompression(file, options);

            return new File([compressedFile], file.name, {
                type: compressedFile.type,
            });

        } catch (error) {
            console.error("IMage compression failed: ", error)
            return file
        }

    }

    // 3. Generate a unique filename
    generateFilename(originalName: string): string {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 10);
        const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";

        return `${timestamp}-${randomString}.${extension}`;
    }

    // 4. Upload file to supabase
    async upload(file: File, filename: string): Promise<ImageUploadResult> {

        const filePath = this.config.folder ? `${this.config.folder}/${filename}` : filename;

        const { data, error } = await supabase.storage.from(this.config.bucket).upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
        })

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        const { data: { publicUrl } } = supabase.storage.from(this.config.bucket).getPublicUrl(data.path)

        return {
            success: true,
            url: publicUrl,
            filename,
        };

    }

    // 5. Deletes a file from Supabase storage
    async delete(filename: string): Promise<void> {
        const filePath = this.config.folder
            ? `${this.config.folder}/${filename}`
            : filename;

        const { error } = await supabase.storage
            .from(this.config.bucket)
            .remove([filePath]);

        if (error) {
            console.error("Failed to delete image:", error);
        }
    }

    // 6. Main method: Validates, compresses, and uploads the image
    async process(file: File): Promise<ImageUploadResult> {
        const validation = this.validate(file);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        const compressedFile = await this.compress(file);
        const filename = this.generateFilename(file.name);
        const uploadResult = await this.upload(compressedFile, filename);

        return uploadResult;
    }

    // 7. Extracts the filename from a Supabase storage URL
    extractFilenameFromUrl(url: string): string | null {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;

            // Get the last segment (filename)
            const segments = pathname.split("/");
            const filename = segments[segments.length - 1];

            return filename || null;
        } catch {
            return null;
        }
    }

    // Deletes a file from Supabase storage using its full URL
    async deleteByUrl(url: string): Promise<void> {
        const filename = this.extractFilenameFromUrl(url);

        if (!filename) {
            console.error("Failed to extract filename from URL:", url);
            return;
        }

        await this.delete(filename);
    }
}

export const imageService = new ImageService();