/**
 * Browser-side image compression utility
 * Compresses and resizes images before upload using Canvas API
 * Outputs WebP format (best browser support for modern compression)
 */

export interface CompressOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
}

const defaultOptions: Required<CompressOptions> = {
    maxWidth: 400,
    maxHeight: 600,
    quality: 0.8,
};

/**
 * Compress an image file using Canvas API
 * @param file - The original image file
 * @param options - Compression options
 * @returns Promise<File> - Compressed WebP file
 */
export async function compressImage(
    file: File,
    options: CompressOptions = {}
): Promise<File> {
    const { maxWidth, maxHeight, quality } = { ...defaultOptions, ...options };

    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
        }

        img.onload = () => {
            // Calculate new dimensions maintaining aspect ratio
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;

            // Draw image on canvas
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to WebP blob
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Failed to compress image'));
                        return;
                    }

                    // Create new file with WebP extension
                    const compressedFile = new File(
                        [blob],
                        file.name.replace(/\.[^.]+$/, '.webp'),
                        { type: 'image/webp' }
                    );

                    resolve(compressedFile);
                },
                'image/webp',
                quality
            );
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        // Load image from file
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Check if a file is a valid image type
 */
export function isValidImageType(file: File): boolean {
    const validTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/avif',
    ];
    return validTypes.includes(file.type);
}
