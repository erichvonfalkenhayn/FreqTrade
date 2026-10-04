export type BotApiUrlSecurityError = 'invalid' | 'credentials';

export function getBotApiUrlSecurityError(url: string): BotApiUrlSecurityError | undefined {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return 'invalid';
  }

  if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
    return 'invalid';
  }

  if (parsedUrl.username || parsedUrl.password) {
    return 'credentials';
  }

  return undefined;
}
