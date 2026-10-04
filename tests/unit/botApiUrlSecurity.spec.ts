import { describe, expect, it } from 'vitest';
import { getBotApiUrlSecurityError } from '@/utils/botApiUrlSecurity';

describe('getBotApiUrlSecurityError', () => {
  it('allows HTTPS bot URLs', () => {
    expect(getBotApiUrlSecurityError('https://bot.example.com')).toBeUndefined();
  });

  it('allows HTTP for loopback hosts', () => {
    expect(getBotApiUrlSecurityError('http://localhost:8080')).toBeUndefined();
    expect(getBotApiUrlSecurityError('http://127.0.0.1:8080')).toBeUndefined();
    expect(getBotApiUrlSecurityError('http://[::1]:8080')).toBeUndefined();
  });

  it('allows HTTP for remote hosts when explicitly configured', () => {
    expect(getBotApiUrlSecurityError('http://bot.example.com')).toBeUndefined();
    expect(getBotApiUrlSecurityError('http://192.168.1.20:8080')).toBeUndefined();
  });

  it('rejects invalid URLs and unsupported protocols', () => {
    expect(getBotApiUrlSecurityError('not a URL')).toBe('invalid');
    expect(getBotApiUrlSecurityError('ftp://bot.example.com')).toBe('invalid');
  });

  it('rejects URLs containing credentials', () => {
    expect(getBotApiUrlSecurityError('https://user:password@bot.example.com')).toBe('credentials');
  });
});
