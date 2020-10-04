import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import * as ecc from 'tiny-secp256k1';

export const generateMnemonic = () => bip39.generateMnemonic();
export const isValidMnemonic = (mnemonic) => bip39.validateMnemonic(mnemonic);

export const getKeypairsFromMnemonic = async (mnemonic) => {
  const seed = await bip39.mnemonicToSeed(mnemonic);

  // [TODO] replace bip32 for a generic key derivation lib
  const root = bip32.fromSeed(seed);
  const path = "m/49'/1'/0'/0/0";
  const { publicKey, privateKey } = root.derivePath(path);

  return {
    publicKey: publicKey.toString('base64'),
    privateKey: privateKey.toString('base64'),
  };
};

export const signPayload = async (payload, privateKey) => {
  const encoder = new TextEncoder();
  const encodedPayload = encoder.encode(JSON.stringify(payload));
  const sha256Payload = await crypto.subtle.digest('SHA-256', encodedPayload);
  const payloadBuffer = Buffer.from(sha256Payload);

  return ecc.sign(
    payloadBuffer,
    Buffer.from(privateKey, 'base64'),
  ).toString('base64');
};

export const verifySignature = async (payload, publicKey, signature) => {
  const encoder = new TextEncoder();
  const encodedPayload = encoder.encode(JSON.stringify(payload));
  const sha256Payload = await crypto.subtle.digest('SHA-256', encodedPayload);
  const payloadBuffer = Buffer.from(sha256Payload);

  return ecc.verify(
    payloadBuffer,
    Buffer.from(publicKey, 'base64'),
    Buffer.from(signature, 'base64'),
  );
};
