export const serverStorage = (uri: string | null | undefined): string => {
  console.log(uri)
  // Handle null, undefined, or empty strings
  if (!uri || uri === '') {
    return '';
  }

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';
  
  const formattedBackendUrl = BACKEND_URL.endsWith("/")
    ? BACKEND_URL.slice(0, -1)
    : BACKEND_URL;
    
  // Only process if uri is a string and not already a full URL
  if (typeof uri === 'string') {
    // If it's already a full URL, return as is
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      return uri;
    }
    
    // Ensure uri starts with /
    const formattedUri = uri.startsWith("/") ? uri : `/${uri}`;
    return `${formattedBackendUrl}${formattedUri}`;
  }

  return '';
};