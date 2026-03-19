const FIVE_MB_IN_BYTES = 5 * 1024 * 1024;
const IMAGE_VALIDATION_TIMEOUT_IN_MS = 8_000;

function parseHttpUrl(url: string) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed : null;
  } catch {
    return null;
  }
}

function isImageContentType(contentType: string | null) {
  return !contentType || contentType.toLowerCase().startsWith('image/');
}

function getHeaderSize(headers: Headers) {
  const headerValue = headers.get('content-length');

  if (!headerValue) {
    return null;
  }

  const parsedSize = Number(headerValue);
  return Number.isFinite(parsedSize) ? parsedSize : null;
}

async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), IMAGE_VALIDATION_TIMEOUT_IN_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

async function canLoadImage(url: string) {
  return await new Promise<boolean>((resolve) => {
    const image = new Image();

    const cleanup = () => {
      window.clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
    };

    const timeout = window.setTimeout(() => {
      cleanup();
      resolve(false);
    }, IMAGE_VALIDATION_TIMEOUT_IN_MS);

    image.onload = () => {
      cleanup();
      resolve(true);
    };

    image.onerror = () => {
      cleanup();
      resolve(false);
    };

    image.src = url;
  });
}

function getImageValidationErrorFromHeaders(headers: Headers) {
  if (!isImageContentType(headers.get('content-type'))) {
    return 'A URL informada nao aponta para uma imagem.';
  }

  const imageSize = getHeaderSize(headers);

  if (typeof imageSize === 'number' && imageSize > FIVE_MB_IN_BYTES) {
    return 'A imagem deve ter no maximo 5MB.';
  }

  return null;
}

export function validateImageInput(url?: string) {
  if (!url) {
    return true;
  }

  return Boolean(parseHttpUrl(url));
}

export async function validateImageUrl(url?: string) {
  const trimmedUrl = url?.trim();

  if (!trimmedUrl) {
    return null;
  }

  if (!validateImageInput(trimmedUrl)) {
    return 'Informe uma URL de imagem valida.';
  }

  try {
    const headResponse = await fetchWithTimeout(trimmedUrl, { method: 'HEAD' });

    if (headResponse.ok) {
      const headerValidationError = getImageValidationErrorFromHeaders(headResponse.headers);

      if (headerValidationError) {
        return headerValidationError;
      }

      if (getHeaderSize(headResponse.headers) !== null) {
        return null;
      }
    }
  } catch {}

  try {
    const imageResponse = await fetchWithTimeout(trimmedUrl);

    if (!imageResponse.ok) {
      return (await canLoadImage(trimmedUrl))
        ? null
        : 'Nao foi possivel validar a imagem informada. Tente outra URL.';
    }

    const headerValidationError = getImageValidationErrorFromHeaders(imageResponse.headers);

    if (headerValidationError) {
      return headerValidationError;
    }

    const imageBlob = await imageResponse.blob();

    if (imageBlob.type && !imageBlob.type.startsWith('image/')) {
      return 'A URL informada nao aponta para uma imagem.';
    }

    if (imageBlob.size > FIVE_MB_IN_BYTES) {
      return 'A imagem deve ter no maximo 5MB.';
    }

    return null;
  } catch {
    return (await canLoadImage(trimmedUrl)) ? null : 'Nao foi possivel validar o tamanho da imagem. Use outra URL.';
  }
}
