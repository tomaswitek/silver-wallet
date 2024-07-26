import {
  default as kaspa,
  Mnemonic,
  PrivateKey,
  NetworkType,
} from "@repo/kaspa-wasm";

export async function initKaspa() {
  await kaspa();
}

export function generatePrivateKey(wordCount = 12, password = "password") {
  const mnemonic = Mnemonic.random(wordCount);
  const seed = mnemonic.toSeed(password);
  // TODO: why do I need 64 hex instead of generated 128? wtf
  const privateKey = new PrivateKey(seed.slice(0, 64));
  return {privateKey, seedPhrase: mnemonic.phrase};
}

export function getAddressFromPrivateKey(privateKey: PrivateKey) {
  return privateKey.toKeypair().toAddress(NetworkType.Mainnet);
}

export {Address} from "@repo/kaspa-wasm";
