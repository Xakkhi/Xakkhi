import { supabase } from './supabase';

/**
 * Upload a compressed photo Blob to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadPhoto(blob) {
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from('report-photos')
    .upload(filename, blob, {
      contentType: 'image/jpeg',
      cacheControl: '31536000', // 1 year – photos are immutable
    });

  if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`);

  const { data } = supabase.storage.from('report-photos').getPublicUrl(filename);
  return data.publicUrl;
}
