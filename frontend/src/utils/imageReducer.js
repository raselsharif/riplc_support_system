const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;
const MAX_SIZE_KB = 1500;
const QUALITY = 0.7;

export function compressImage(file, maxWidth = MAX_WIDTH, maxHeight = MAX_HEIGHT, quality = QUALITY) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}

export async function reduceImages(files, maxSizeKB = MAX_SIZE_KB) {
  const results = [];
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;

    if (file.size / 1024 <= maxSizeKB) {
      results.push(file);
      continue;
    }

    let quality = QUALITY;
    let compressed = await compressImage(file, MAX_WIDTH, MAX_HEIGHT, quality);

    while (compressed.size / 1024 > maxSizeKB && quality > 0.1) {
      quality -= 0.1;
      compressed = await compressImage(file, MAX_WIDTH, MAX_HEIGHT, quality);
    }

    if (compressed.size / 1024 > maxSizeKB) {
      const reducedWidth = Math.round(MAX_WIDTH * 0.5);
      const reducedHeight = Math.round(MAX_HEIGHT * 0.5);
      compressed = await compressImage(file, reducedWidth, reducedHeight, 0.6);
    }

    const reducedFile = new File([compressed], file.name.replace(/\.[^.]+$/, '.jpg'), {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    results.push(reducedFile);
  }
  return results;
}
