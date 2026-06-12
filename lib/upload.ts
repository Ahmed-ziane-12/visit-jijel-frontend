import axios from './axios';

interface CloudinarySignature {
    signature: string;
    timestamp: number;
    api_key: string;
    cloud_name: string;
    folder: string;
}

interface UploadOptions {
    file: File;
    modelType: string;
    modelId: number;
    collection: string;
    isCover?: boolean;
}

export async function uploadToCloudinary({
    file,
    modelType,
    modelId,
    collection,
    isCover = false,
}: UploadOptions) {
    // Step 1 — get signature from Laravel
    const { data: sig } = await axios.post<CloudinarySignature>('/api/v1/media/signature', {
        folder: `jijel/${modelType}s`,
    });

    // Step 2 — upload directly to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', sig.api_key);
    formData.append('timestamp', String(sig.timestamp));
    formData.append('signature', sig.signature);
    formData.append('folder', sig.folder);

    const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
        { method: 'POST', body: formData },
    );

    const cloudinaryData = await cloudinaryRes.json();

    // Step 3 — tell Laravel to store the result
    const { data: media } = await axios.post('/api/v1/media/store', {
        model_type: modelType,
        model_id: modelId,
        collection,
        is_cover: isCover,
        cloudinary_public_id: cloudinaryData.public_id,
        url: cloudinaryData.url,
        secure_url: cloudinaryData.secure_url,
        format: cloudinaryData.format,
        resource_type: cloudinaryData.resource_type,
        width: cloudinaryData.width,
        height: cloudinaryData.height,
        bytes: cloudinaryData.bytes,
    });

    return media;
}
