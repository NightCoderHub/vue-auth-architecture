// src/utils/storage/modules/Cipher.ts
import CryptoJS from 'crypto-js';

// 默认密钥，实际项目中建议从环境变量读取
const SECRET_KEY = import.meta.env.VITE_STORAGE_KEY || 'vue-auth-admin-secret-key-888';

export class Cipher {
  /**
   * 加密
   * @param data 需要加密的数据 (JSON string)
   * @returns 加密后的字符串
   */
  static encrypt(data: string): string {
    if (!data) return '';
    try {
      return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
    } catch (e) {
      console.error('[Cipher] Encrypt Error:', e);
      return data;
    }
  }

  /**
   * 解密
   * @param cipherText 密文
   * @returns 解密后的字符串 (JSON string)
   */
  static decrypt(cipherText: string): string {
    if (!cipherText) return '';
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
      console.error('[Cipher] Decrypt Error:', e);
      return ''; // 解密失败返回空
    }
  }
}
