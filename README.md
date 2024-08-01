# Local development

1. create `.env.local` file in the `apps/web` and add  `VITE_NETWORK_TYPE=testnet-11` in order to use testnet-11 instead
   of mainnet _(default option)_
2. `yarn install`
3. `yarn dev`

# Useful links

- [rusty Kaspa](https://github.com/kaspanet/rusty-kaspa) it is a rust library that can be used to interact with kaspa
  nodes or to build wasm modules
- [faucet-t11](https://faucet-t11.kaspa.ws/) it is a faucet that can be used to get some testnet coins
- [KasWare](https://www.kasware.xyz/) it is handy wallet implementation that can be used to send transactions on
  testnet (and mainnet)
