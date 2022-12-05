import CryptoJS from 'crypto-js';
import { ENCRYPT_DATA_SECRET } from '../configs/index';

const encrypt = (val, ENCRYPT_SECRET = ENCRYPT_DATA_SECRET) => {
  const encrypted = CryptoJS.AES.encrypt(val, ENCRYPT_SECRET).toString();
  return encrypted;
};

const decrypt = (encrypted, ENCRYPT_SECRET = ENCRYPT_DATA_SECRET) => {
  const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPT_SECRET);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};

export default {
  encrypt,
  decrypt,
};
