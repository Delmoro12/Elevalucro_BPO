// Helper function to decode JWT token
export const decodeJWT = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token format');
    }

    let payload = parts[1];
    // Add padding if necessary
    const padding = payload.length % 4;
    if (padding) {
      payload += '='.repeat(4 - padding);
    }
    
    // Replace URL-safe characters with standard base64 characters
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};