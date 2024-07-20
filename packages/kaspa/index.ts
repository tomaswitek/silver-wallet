import {default as kaspa, Mnemonic, PrivateKey} from "@repo/kaspa-wasm";

export async function initKaspa() {
  await kaspa();
}

export function generatePrivateKey(wordCount = 12, password = "password") {
  const mnemonic = Mnemonic.random(wordCount);
  const seed = mnemonic.toSeed(password);
  // TODO: why do I need 64 hex instead of generated 128? wtf
  const privateKey = new PrivateKey(seed.slice(0, 64));
  console.log(privateKey);
}
