export const bufferToBase64 = (buffer: Uint8Array): string => {
  return btoa(String.fromCharCode(...buffer));
};

export const base64ToBuffer = (base64: string): Uint8Array => {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
};
