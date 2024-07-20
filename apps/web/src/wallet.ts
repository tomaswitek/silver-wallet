import * as kaspa from "@repo/kaspa-wasm";
export {type Address} from "@repo/kaspa-wasm";

export async function createWallet() {
  // TODO: put this call in a different init function and also I had to manually copy the was file into public, add a compile step for it?
  // it looks like it does not go via the vite wasm plugin yet
  await kaspa.default("kaspa_bg.wasm");
  const wallet = new kaspa.Wallet({});
  const {accountDescriptor} = await wallet.accountsCreate({
    walletSecret: "password",
    type: "bip32",
    accountName: "test",
    prvKeyDataId: "prvKeyDataId",
  });
  const {address} = await wallet.accountsCreateNewAddress({
    accountId: accountDescriptor.accountId,
  });
  return {address};
}
