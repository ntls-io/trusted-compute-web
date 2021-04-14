import CryptoJS from "crypto-js";

const encrypt = (file: string, secret: string): CryptoJS.lib.CipherParams => {
  return CryptoJS.AES.encrypt(file, secret);
};

export { encrypt };
