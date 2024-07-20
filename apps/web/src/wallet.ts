import * as kaspa from "@repo/kaspa-wasm";
export {type Address} from "@repo/kaspa-wasm";

export async function initWasm() {
  await kaspa.default();
}

export async function createWallet() {
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
