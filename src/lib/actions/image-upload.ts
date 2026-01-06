'use server';

import getSupabaseAdmin from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

const BUCKET_NAME = 'book-thumbnails';

// Upload pre-compressed image from browser
// The compression is done client-side using Canvas API
export async function uploadBookThumbnail(formData: FormData): Promise<{ url: string } | { error: string }> {
    try {
        const file = formData.get('image') as File;
        
        if (!file || file.size === 0) {
            return { error: 'No image file provided' };
        }

        // Max file size: 5MB (after client-side compression)
        if (file.size > 5 * 1024 * 1024) {
            return { error: 'Image too large. Maximum size is 5MB' };
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const extension = file.type === 'image/webp' ? 'webp' : 'jpg';
        const filename = `${timestamp}-${randomId}.${extension}`;

        // Upload to Supabase Storage
        const adminClient = getSupabaseAdmin();
        const { data, error } = await adminClient.storage
            .from(BUCKET_NAME)
            .upload(filename, buffer, {
                contentType: file.type,
                cacheControl: '31536000', // 1 year cache
            });

        if (error) {
            console.error('Storage upload error:', error);
            return { error: 'Failed to upload image' };
        }

        // Get public URL
        const { data: urlData } = adminClient.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filename);

        return { url: urlData.publicUrl };
    } catch (err) {
        console.error('Image upload error:', err);
        return { error: 'Failed to upload image' };
    }
}

export async function deleteBookThumbnail(url: string): Promise<{ success: boolean } | { error: string }> {
    try {
        if (!url) return { success: true };

        // Extract filename from URL
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1];

        if (!filename) return { success: true };

        const adminClient = getSupabaseAdmin();
        const { error } = await adminClient.storage
            .from(BUCKET_NAME)
            .remove([filename]);

        if (error) {
            console.error('Storage delete error:', error);
            return { error: 'Failed to delete image' };
        }

        return { success: true };
    } catch (err) {
        console.error('Image deletion error:', err);
        return { error: 'Failed to delete image' };
    }
}

export async function updateBookWithThumbnail(bookId: string, thumbnailUrl: string) {
    const adminClient = getSupabaseAdmin();

    const { error } = await adminClient
        .from('books')
        .update({ thumbnail_url: thumbnailUrl })
        .eq('id', bookId);

    if (error) throw error;

    revalidatePath('/catalog');
    return { success: true };
}
