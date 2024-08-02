/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;

export function version(a: number): void;

export function generator_ctor(a: number, b: number): void;

export function generator_next(a: number): number;

export function generator_estimate(a: number): number;

export function generator_summary(a: number): number;

export function __wbg_generator_free(a: number): void;

export function __wbg_transactionrecordnotification_free(a: number): void;

export function __wbg_get_transactionrecordnotification_type(
  a: number,
  b: number,
): void;

export function __wbg_set_transactionrecordnotification_type(
  a: number,
  b: number,
  c: number,
): void;

export function __wbg_get_transactionrecordnotification_data(a: number): number;

export function __wbg_set_transactionrecordnotification_data(
  a: number,
  b: number,
): void;

export function __wbg_transactionrecord_free(a: number): void;

export function __wbg_get_transactionrecord_id(a: number): number;

export function __wbg_set_transactionrecord_id(a: number, b: number): void;

export function __wbg_get_transactionrecord_unixtimeMsec(
  a: number,
  b: number,
): void;

export function __wbg_set_transactionrecord_unixtimeMsec(
  a: number,
  b: number,
  c: number,
): void;

export function __wbg_get_transactionrecord_network(a: number): number;

export function __wbg_set_transactionrecord_network(a: number, b: number): void;

export function __wbg_get_transactionrecord_note(a: number, b: number): void;

export function __wbg_set_transactionrecord_note(
  a: number,
  b: number,
  c: number,
): void;

export function __wbg_get_transactionrecord_metadata(
  a: number,
  b: number,
): void;

export function __wbg_set_transactionrecord_metadata(
  a: number,
  b: number,
  c: number,
): void;

export function transactionrecord_value(a: number): number;

export function transactionrecord_blockDaaScore(a: number): number;

export function transactionrecord_binding(a: number): number;

export function transactionrecord_data(a: number): number;

export function transactionrecord_type(a: number, b: number): void;

export function transactionrecord_hasAddress(a: number, b: number): number;

export function transactionrecord_serialize(a: number): number;

export function __wbg_paymentoutput_free(a: number): void;

export function __wbg_get_paymentoutput_address(a: number): number;

export function __wbg_set_paymentoutput_address(a: number, b: number): void;

export function __wbg_get_paymentoutput_amount(a: number): number;

export function __wbg_set_paymentoutput_amount(a: number, b: number): void;

export function paymentoutput_new(a: number, b: number): number;

export function __wbg_paymentoutputs_free(a: number): void;

export function paymentoutputs_constructor(a: number, b: number): void;

export function utxoprocessor_addEventListener(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function utxoprocessor_removeEventListener(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function utxoprocessor_ctor(a: number, b: number): void;

export function utxoprocessor_start(a: number): number;

export function utxoprocessor_stop(a: number): number;

export function utxoprocessor_rpc(a: number): number;

export function utxoprocessor_networkId(a: number, b: number): void;

export function utxoprocessor_setNetworkId(
  a: number,
  b: number,
  c: number,
): void;

export function utxoprocessor_isActive(a: number): number;

export function utxoprocessor_setCoinbaseTransactionMaturityDAA(
  a: number,
  b: number,
  c: number,
): void;

export function utxoprocessor_setUserTransactionMaturityDAA(
  a: number,
  b: number,
  c: number,
): void;

export function __wbg_utxoprocessor_free(a: number): void;

export function sompiToKaspaStringWithSuffix(
  a: number,
  b: number,
  c: number,
): void;

export function sompiToKaspaString(a: number, b: number): void;

export function kaspaToSompi(a: number, b: number): number;

export function masscalculator_new(a: number): number;

export function masscalculator_isDust(a: number, b: number): number;

export function masscalculator_isTransactionOutputDust(
  a: number,
  b: number,
): void;

export function masscalculator_minimumRelayTransactionFee(): number;

export function masscalculator_maximumStandardTransactionMass(): number;

export function masscalculator_minimumRequiredTransactionRelayFee(
  a: number,
): number;

export function masscalculator_calcMassForTransaction(
  a: number,
  b: number,
  c: number,
): void;

export function masscalculator_blankTransactionSerializedByteSize(): number;

export function masscalculator_blankTransactionMass(a: number): number;

export function masscalculator_calcMassForPayload(a: number, b: number): number;

export function masscalculator_calcMassForOutputs(
  a: number,
  b: number,
  c: number,
): void;

export function masscalculator_calcMassForInputs(
  a: number,
  b: number,
  c: number,
): void;

export function masscalculator_calcMassForOutput(
  a: number,
  b: number,
  c: number,
): void;

export function masscalculator_calcMassForInput(
  a: number,
  b: number,
  c: number,
): void;

export function masscalculator_calcSignatureMass(a: number, b: number): number;

export function masscalculator_calcSignatureMassForInputs(
  a: number,
  b: number,
  c: number,
): number;

export function masscalculator_calcMinimumTransactionRelayFeeFromMass(
  a: number,
  b: number,
): number;

export function masscalculator_calcMiniumTxRelayFee(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function __wbg_masscalculator_free(a: number): void;

export function prvkeydatainfo_id(a: number, b: number): void;

export function prvkeydatainfo_name(a: number): number;

export function prvkeydatainfo_isEncrypted(a: number): number;

export function prvkeydatainfo_setName(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function __wbg_prvkeydatainfo_free(a: number): void;

export function utxocontext_ctor(a: number, b: number): void;

export function utxocontext_trackAddresses(
  a: number,
  b: number,
  c: number,
): number;

export function utxocontext_unregisterAddresses(a: number, b: number): number;

export function utxocontext_clear(a: number): number;

export function utxocontext_isActive(a: number): number;

export function utxocontext_getMatureRange(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function utxocontext_matureLength(a: number): number;

export function utxocontext_getPending(a: number, b: number): void;

export function utxocontext_balance(a: number): number;

export function utxocontext_balanceStrings(a: number, b: number): void;

export function __wbg_utxocontext_free(a: number): void;

export function __wbg_storage_free(a: number): void;

export function storage_filename(a: number, b: number): void;

export function wallet_constructor(a: number, b: number): void;

export function wallet_rpc(a: number): number;

export function wallet_isOpen(a: number): number;

export function wallet_isSynced(a: number): number;

export function wallet_descriptor(a: number): number;

export function wallet_exists(a: number, b: number, c: number): number;

export function wallet_start(a: number): number;

export function wallet_stop(a: number): number;

export function wallet_connect(a: number, b: number): number;

export function wallet_disconnect(a: number): number;

export function wallet_addEventListener(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function wallet_removeEventListener(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function __wbg_wallet_free(a: number): void;

export function pendingtransaction_id(a: number, b: number): void;

export function pendingtransaction_paymentAmount(a: number): number;

export function pendingtransaction_changeAmount(a: number): number;

export function pendingtransaction_feeAmount(a: number): number;

export function pendingtransaction_aggregateInputAmount(a: number): number;

export function pendingtransaction_aggregateOutputAmount(a: number): number;

export function pendingtransaction_type(a: number, b: number): void;

export function pendingtransaction_addresses(a: number): number;

export function pendingtransaction_getUtxoEntries(a: number): number;

export function pendingtransaction_signInput(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
): void;

export function pendingtransaction_fillInput(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function pendingtransaction_sign(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function pendingtransaction_submit(a: number, b: number): number;

export function pendingtransaction_transaction(a: number, b: number): void;

export function pendingtransaction_serializeToObject(
  a: number,
  b: number,
): void;

export function pendingtransaction_serializeToJSON(a: number, b: number): void;

export function pendingtransaction_serializeToSafeJSON(
  a: number,
  b: number,
): void;

export function __wbg_pendingtransaction_free(a: number): void;

export function generatorsummary_networkType(a: number): number;

export function generatorsummary_utxos(a: number): number;

export function generatorsummary_fees(a: number): number;

export function generatorsummary_transactions(a: number): number;

export function generatorsummary_finalAmount(a: number): number;

export function generatorsummary_finalTransactionId(a: number, b: number): void;

export function __wbg_generatorsummary_free(a: number): void;

export function account_ctor(a: number, b: number): void;

export function account_balance(a: number): number;

export function account_type(a: number, b: number): void;

export function account_balanceStrings(a: number, b: number, c: number): void;

export function account_receiveAddress(a: number, b: number): void;

export function account_changeAddress(a: number, b: number): void;

export function account_deriveReceiveAddress(a: number): number;

export function account_deriveChangeAddress(a: number): number;

export function account_scan(a: number): number;

export function account_send(a: number, b: number): number;

export function __wbg_account_free(a: number): void;

export function __wbg_get_account_context(a: number): number;

export function __wbg_set_account_context(a: number, b: number): void;

export function verifyMessage(a: number, b: number): void;

export function signMessage(a: number, b: number): void;

export function __wbg_accountkind_free(a: number): void;

export function accountkind_ctor(a: number, b: number, c: number): void;

export function accountkind_toString(a: number, b: number): void;

export function balancestrings_mature(a: number, b: number): void;

export function balancestrings_pending(a: number, b: number): void;

export function __wbg_balancestrings_free(a: number): void;

export function balance_mature(a: number): number;

export function balance_pending(a: number): number;

export function balance_outgoing(a: number): number;

export function balance_toBalanceStrings(a: number, b: number, c: number): void;

export function __wbg_balance_free(a: number): void;

export function getConsensusParametersByNetwork(a: number): number;

export function getConsensusParametersByAddress(a: number): number;

export function __wbg_consensusparams_free(a: number): void;

export function __wbg_walletdescriptor_free(a: number): void;

export function __wbg_get_walletdescriptor_title(a: number, b: number): void;

export function __wbg_set_walletdescriptor_title(
  a: number,
  b: number,
  c: number,
): void;

export function __wbg_get_walletdescriptor_filename(a: number, b: number): void;

export function __wbg_set_walletdescriptor_filename(
  a: number,
  b: number,
  c: number,
): void;

export function wallet_batch(a: number, b: number): number;

export function wallet_flush(a: number, b: number): number;

export function wallet_retainContext(a: number, b: number): number;

export function wallet_getStatus(a: number, b: number): number;

export function wallet_walletEnumerate(a: number, b: number): number;

export function wallet_walletCreate(a: number, b: number): number;

export function wallet_walletOpen(a: number, b: number): number;

export function wallet_walletReload(a: number, b: number): number;

export function wallet_walletClose(a: number, b: number): number;

export function wallet_walletChangeSecret(a: number, b: number): number;

export function wallet_walletExport(a: number, b: number): number;

export function wallet_walletImport(a: number, b: number): number;

export function wallet_prvKeyDataEnumerate(a: number, b: number): number;

export function wallet_prvKeyDataCreate(a: number, b: number): number;

export function wallet_prvKeyDataRemove(a: number, b: number): number;

export function wallet_prvKeyDataGet(a: number, b: number): number;

export function wallet_accountsEnumerate(a: number, b: number): number;

export function wallet_accountsRename(a: number, b: number): number;

export function wallet_accountsDiscovery(a: number, b: number): number;

export function wallet_accountsCreate(a: number, b: number): number;

export function wallet_accountsEnsureDefault(a: number, b: number): number;

export function wallet_accountsImport(a: number, b: number): number;

export function wallet_accountsActivate(a: number, b: number): number;

export function wallet_accountsDeactivate(a: number, b: number): number;

export function wallet_accountsGet(a: number, b: number): number;

export function wallet_accountsCreateNewAddress(a: number, b: number): number;

export function wallet_accountsSend(a: number, b: number): number;

export function wallet_accountsTransfer(a: number, b: number): number;

export function wallet_accountsEstimate(a: number, b: number): number;

export function wallet_transactionsDataGet(a: number, b: number): number;

export function wallet_transactionsReplaceNote(a: number, b: number): number;

export function wallet_transactionsReplaceMetadata(
  a: number,
  b: number,
): number;

export function wallet_addressBookEnumerate(a: number, b: number): number;

export function createAddress(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
): void;

export function createMultisigAddress(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
): void;

export function cryptobox_ctor(a: number, b: number, c: number): void;

export function cryptobox_publicKey(a: number, b: number): void;

export function cryptobox_encrypt(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function cryptobox_decrypt(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function __wbg_cryptobox_free(a: number): void;

export function cryptoboxpublickey_ctor(a: number, b: number): void;

export function cryptoboxpublickey_toString(a: number, b: number): void;

export function __wbg_cryptoboxpublickey_free(a: number): void;

export function cryptoboxprivatekey_ctor(a: number, b: number): void;

export function cryptoboxprivatekey_to_public_key(a: number): number;

export function __wbg_cryptoboxprivatekey_free(a: number): void;

export function estimateTransactions(a: number): number;

export function createTransactions(a: number): number;

export function createTransaction(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
): void;

export function signScriptHash(a: number, b: number, c: number): void;

export function signTransaction(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function setDefaultStorageFolder(a: number, b: number, c: number): void;

export function setDefaultWalletFile(a: number, b: number, c: number): void;

export function argon2sha256ivFromText(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function argon2sha256ivFromBinary(a: number, b: number, c: number): void;

export function sha256dFromText(a: number, b: number, c: number): void;

export function sha256dFromBinary(a: number, b: number): void;

export function sha256FromText(a: number, b: number, c: number): void;

export function sha256FromBinary(a: number, b: number): void;

export function decryptXChaCha20Poly1305(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
): void;

export function encryptXChaCha20Poly1305(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
): void;

export function __wbg_assertionerroroptions_free(a: number): void;

export function assertionerroroptions_new(
  a: number,
  b: number,
  c: number,
  d: number,
): number;

export function assertionerroroptions_message(a: number): number;

export function assertionerroroptions_set_message(a: number, b: number): void;

export function assertionerroroptions_actual(a: number): number;

export function assertionerroroptions_set_actual(a: number, b: number): void;

export function assertionerroroptions_expected(a: number): number;

export function assertionerroroptions_set_expected(a: number, b: number): void;

export function assertionerroroptions_operator(a: number): number;

export function assertionerroroptions_set_operator(a: number, b: number): void;

export function __wbg_netserveroptions_free(a: number): void;

export function netserveroptions_allow_half_open(a: number): number;

export function netserveroptions_set_allow_half_open(
  a: number,
  b: number,
): void;

export function netserveroptions_pause_on_connect(a: number): number;

export function netserveroptions_set_pause_on_connect(
  a: number,
  b: number,
): void;

export function __wbg_createhookcallbacks_free(a: number): void;

export function createhookcallbacks_new(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
): number;

export function createhookcallbacks_init(a: number): number;

export function createhookcallbacks_set_init(a: number, b: number): void;

export function createhookcallbacks_before(a: number): number;

export function createhookcallbacks_set_before(a: number, b: number): void;

export function createhookcallbacks_after(a: number): number;

export function createhookcallbacks_set_after(a: number, b: number): void;

export function createhookcallbacks_destroy(a: number): number;

export function createhookcallbacks_set_destroy(a: number, b: number): void;

export function createhookcallbacks_promise_resolve(a: number): number;

export function createhookcallbacks_set_promise_resolve(
  a: number,
  b: number,
): void;

export function __wbg_processsendoptions_free(a: number): void;

export function processsendoptions_new(a: number): number;

export function processsendoptions_swallow_errors(a: number): number;

export function processsendoptions_set_swallow_errors(
  a: number,
  b: number,
): void;

export function __wbg_wasioptions_free(a: number): void;

export function wasioptions_new_with_values(
  a: number,
  b: number,
  c: number,
  d: number,
): number;

export function wasioptions_new(a: number): number;

export function wasioptions_args(a: number, b: number): void;

export function wasioptions_set_args(a: number, b: number, c: number): void;

export function wasioptions_env(a: number): number;

export function wasioptions_set_env(a: number, b: number): void;

export function wasioptions_preopens(a: number): number;

export function wasioptions_set_preopens(a: number, b: number): void;

export function __wbg_consoleconstructoroptions_free(a: number): void;

export function consoleconstructoroptions_new_with_values(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
): number;

export function consoleconstructoroptions_new(a: number, b: number): number;

export function consoleconstructoroptions_stdout(a: number): number;

export function consoleconstructoroptions_set_stdout(
  a: number,
  b: number,
): void;

export function consoleconstructoroptions_stderr(a: number): number;

export function consoleconstructoroptions_set_stderr(
  a: number,
  b: number,
): void;

export function consoleconstructoroptions_ignore_errors(a: number): number;

export function consoleconstructoroptions_set_ignore_errors(
  a: number,
  b: number,
): void;

export function consoleconstructoroptions_color_mod(a: number): number;

export function consoleconstructoroptions_set_color_mod(
  a: number,
  b: number,
): void;

export function consoleconstructoroptions_inspect_options(a: number): number;

export function consoleconstructoroptions_set_inspect_options(
  a: number,
  b: number,
): void;

export function __wbg_getnameoptions_free(a: number): void;

export function getnameoptions_new(
  a: number,
  b: number,
  c: number,
  d: number,
): number;

export function getnameoptions_family(a: number): number;

export function getnameoptions_set_family(a: number, b: number): void;

export function getnameoptions_host(a: number): number;

export function getnameoptions_set_host(a: number, b: number): void;

export function getnameoptions_local_address(a: number): number;

export function getnameoptions_set_local_address(a: number, b: number): void;

export function getnameoptions_port(a: number): number;

export function getnameoptions_set_port(a: number, b: number): void;

export function __wbg_appendfileoptions_free(a: number): void;

export function appendfileoptions_new_with_values(
  a: number,
  b: number,
  c: number,
  d: number,
): number;

export function appendfileoptions_new(): number;

export function appendfileoptions_encoding(a: number): number;

export function appendfileoptions_set_encoding(a: number, b: number): void;

export function appendfileoptions_mode(a: number, b: number): void;

export function appendfileoptions_set_mode(
  a: number,
  b: number,
  c: number,
): void;

export function appendfileoptions_flag(a: number): number;

export function appendfileoptions_set_flag(a: number, b: number): void;

export function __wbg_formatinputpathobject_free(a: number): void;

export function formatinputpathobject_new_with_values(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
): number;

export function formatinputpathobject_new(): number;

export function formatinputpathobject_base(a: number): number;

export function formatinputpathobject_set_base(a: number, b: number): void;

export function formatinputpathobject_dir(a: number): number;

export function formatinputpathobject_set_dir(a: number, b: number): void;

export function formatinputpathobject_ext(a: number): number;

export function formatinputpathobject_set_ext(a: number, b: number): void;

export function formatinputpathobject_name(a: number): number;

export function formatinputpathobject_set_name(a: number, b: number): void;

export function formatinputpathobject_root(a: number): number;

export function formatinputpathobject_set_root(a: number, b: number): void;

export function __wbg_createreadstreamoptions_free(a: number): void;

export function createreadstreamoptions_new_with_values(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
  j: number,
  k: number,
  l: number,
  m: number,
  n: number,
): number;

export function createreadstreamoptions_auto_close(a: number): number;

export function createreadstreamoptions_set_auto_close(
  a: number,
  b: number,
): void;

export function createreadstreamoptions_emit_close(a: number): number;

export function createreadstreamoptions_set_emit_close(
  a: number,
  b: number,
): void;

export function createreadstreamoptions_encoding(a: number): number;

export function createreadstreamoptions_set_encoding(
  a: number,
  b: number,
): void;

export function createreadstreamoptions_end(a: number, b: number): void;

export function createreadstreamoptions_set_end(
  a: number,
  b: number,
  c: number,
): void;

export function createreadstreamoptions_fd(a: number, b: number): void;

export function createreadstreamoptions_set_fd(
  a: number,
  b: number,
  c: number,
): void;

export function createreadstreamoptions_flags(a: number): number;

export function createreadstreamoptions_set_flags(a: number, b: number): void;

export function createreadstreamoptions_high_water_mark(
  a: number,
  b: number,
): void;

export function createreadstreamoptions_set_high_water_mark(
  a: number,
  b: number,
  c: number,
): void;

export function createreadstreamoptions_mode(a: number, b: number): void;

export function createreadstreamoptions_set_mode(
  a: number,
  b: number,
  c: number,
): void;

export function createreadstreamoptions_start(a: number, b: number): void;

export function createreadstreamoptions_set_start(
  a: number,
  b: number,
  c: number,
): void;

export function __wbg_setaadoptions_free(a: number): void;

export function setaadoptions_new(a: number, b: number, c: number): number;

export function setaadoptions_flush(a: number): number;

export function setaadoptions_set_flush(a: number, b: number): void;

export function setaadoptions_plaintextLength(a: number): number;

export function setaadoptions_set_plaintext_length(a: number, b: number): void;

export function setaadoptions_transform(a: number): number;

export function setaadoptions_set_transform(a: number, b: number): void;

export function readstream_add_listener_with_open(a: number, b: number): number;

export function readstream_add_listener_with_close(
  a: number,
  b: number,
): number;

export function readstream_on_with_open(a: number, b: number): number;

export function readstream_on_with_close(a: number, b: number): number;

export function readstream_once_with_open(a: number, b: number): number;

export function readstream_once_with_close(a: number, b: number): number;

export function readstream_prepend_listener_with_open(
  a: number,
  b: number,
): number;

export function readstream_prepend_listener_with_close(
  a: number,
  b: number,
): number;

export function readstream_prepend_once_listener_with_open(
  a: number,
  b: number,
): number;

export function readstream_prepend_once_listener_with_close(
  a: number,
  b: number,
): number;

export function __wbg_pipeoptions_free(a: number): void;

export function pipeoptions_new(a: number): number;

export function pipeoptions_end(a: number): number;

export function pipeoptions_set_end(a: number, b: number): void;

export function __wbg_streamtransformoptions_free(a: number): void;

export function streamtransformoptions_new(a: number, b: number): number;

export function streamtransformoptions_flush(a: number): number;

export function streamtransformoptions_set_flush(a: number, b: number): void;

export function streamtransformoptions_transform(a: number): number;

export function streamtransformoptions_set_transform(
  a: number,
  b: number,
): void;

export function __wbg_agentconstructoroptions_free(a: number): void;

export function agentconstructoroptions_keep_alive_msecs(a: number): number;

export function agentconstructoroptions_set_keep_alive_msecs(
  a: number,
  b: number,
): void;

export function agentconstructoroptions_keep_alive(a: number): number;

export function agentconstructoroptions_set_keep_alive(
  a: number,
  b: number,
): void;

export function agentconstructoroptions_max_free_sockets(a: number): number;

export function agentconstructoroptions_set_max_free_sockets(
  a: number,
  b: number,
): void;

export function agentconstructoroptions_max_sockets(a: number): number;

export function agentconstructoroptions_set_max_sockets(
  a: number,
  b: number,
): void;

export function agentconstructoroptions_timeout(a: number): number;

export function agentconstructoroptions_set_timeout(a: number, b: number): void;

export function __wbg_userinfooptions_free(a: number): void;

export function userinfooptions_new_with_values(a: number): number;

export function userinfooptions_new(): number;

export function userinfooptions_encoding(a: number): number;

export function userinfooptions_set_encoding(a: number, b: number): void;

export function __wbg_writefilesyncoptions_free(a: number): void;

export function writefilesyncoptions_new(
  a: number,
  b: number,
  c: number,
  d: number,
): number;

export function writefilesyncoptions_encoding(a: number): number;

export function writefilesyncoptions_set_encoding(a: number, b: number): void;

export function writefilesyncoptions_flag(a: number): number;

export function writefilesyncoptions_set_flag(a: number, b: number): void;

export function writefilesyncoptions_mode(a: number, b: number): void;

export function writefilesyncoptions_set_mode(
  a: number,
  b: number,
  c: number,
): void;

export function writestream_add_listener_with_open(
  a: number,
  b: number,
): number;

export function writestream_add_listener_with_close(
  a: number,
  b: number,
): number;

export function writestream_on_with_open(a: number, b: number): number;

export function writestream_on_with_close(a: number, b: number): number;

export function writestream_once_with_open(a: number, b: number): number;

export function writestream_once_with_close(a: number, b: number): number;

export function writestream_prepend_listener_with_open(
  a: number,
  b: number,
): number;

export function writestream_prepend_listener_with_close(
  a: number,
  b: number,
): number;

export function writestream_prepend_once_listener_with_open(
  a: number,
  b: number,
): number;

export function writestream_prepend_once_listener_with_close(
  a: number,
  b: number,
): number;

export function __wbg_createwritestreamoptions_free(a: number): void;

export function createwritestreamoptions_new_with_values(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,
  j: number,
): number;

export function createwritestreamoptions_auto_close(a: number): number;

export function createwritestreamoptions_set_auto_close(
  a: number,
  b: number,
): void;

export function createwritestreamoptions_emit_close(a: number): number;

export function createwritestreamoptions_set_emit_close(
  a: number,
  b: number,
): void;

export function createwritestreamoptions_encoding(a: number): number;

export function createwritestreamoptions_set_encoding(
  a: number,
  b: number,
): void;

export function createwritestreamoptions_fd(a: number, b: number): void;

export function createwritestreamoptions_set_fd(
  a: number,
  b: number,
  c: number,
): void;

export function createwritestreamoptions_flags(a: number): number;

export function createwritestreamoptions_set_flags(a: number, b: number): void;

export function createwritestreamoptions_mode(a: number, b: number): void;

export function createwritestreamoptions_set_mode(
  a: number,
  b: number,
  c: number,
): void;

export function createwritestreamoptions_start(a: number, b: number): void;

export function createwritestreamoptions_set_start(
  a: number,
  b: number,
  c: number,
): void;

export function __wbg_mkdtempsyncoptions_free(a: number): void;

export function mkdtempsyncoptions_new_with_values(a: number): number;

export function mkdtempsyncoptions_new(): number;

export function mkdtempsyncoptions_encoding(a: number): number;

export function mkdtempsyncoptions_set_encoding(a: number, b: number): void;

export function __wbg_xpub_free(a: number): void;

export function xpub_try_new(a: number, b: number, c: number): void;

export function xpub_deriveChild(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function xpub_derivePath(a: number, b: number, c: number): void;

export function xpub_intoString(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function xpub_toPublicKey(a: number): number;

export function __wbg_publickey_free(a: number): void;

export function publickey_try_new(a: number, b: number, c: number): void;

export function publickey_toString(a: number, b: number): void;

export function publickey_toAddress(a: number, b: number, c: number): void;

export function publickey_toAddressECDSA(a: number, b: number, c: number): void;

export function publickey_toXOnlyPublicKey(a: number): number;

export function __wbg_xonlypublickey_free(a: number): void;

export function xonlypublickey_try_new(a: number, b: number, c: number): void;

export function xonlypublickey_toString(a: number, b: number): void;

export function xonlypublickey_toAddress(a: number, b: number, c: number): void;

export function xonlypublickey_toAddressECDSA(
  a: number,
  b: number,
  c: number,
): void;

export function xonlypublickey_fromAddress(a: number, b: number): void;

export function __wbg_privatekeygenerator_free(a: number): void;

export function privatekeygenerator_new(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
): void;

export function privatekeygenerator_receiveKey(
  a: number,
  b: number,
  c: number,
): void;

export function privatekeygenerator_changeKey(
  a: number,
  b: number,
  c: number,
): void;

export function __wbg_derivationpath_free(a: number): void;

export function derivationpath_new(a: number, b: number, c: number): void;

export function derivationpath_isEmpty(a: number): number;

export function derivationpath_length(a: number): number;

export function derivationpath_parent(a: number): number;

export function derivationpath_push(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function derivationpath_toString(a: number, b: number): void;

export function __wbg_privatekey_free(a: number): void;

export function privatekey_try_new(a: number, b: number, c: number): void;

export function privatekey_toString(a: number, b: number): void;

export function privatekey_toKeypair(a: number, b: number): void;

export function privatekey_toPublicKey(a: number, b: number): void;

export function privatekey_toAddress(a: number, b: number, c: number): void;

export function privatekey_toAddressECDSA(
  a: number,
  b: number,
  c: number,
): void;

export function __wbg_xprv_free(a: number): void;

export function xprv_try_new(a: number, b: number): void;

export function xprv_fromXPrv(a: number, b: number, c: number): void;

export function xprv_deriveChild(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function xprv_derivePath(a: number, b: number, c: number): void;

export function xprv_intoString(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function xprv_toString(a: number, b: number): void;

export function xprv_toXPub(a: number, b: number): void;

export function __wbg_keypair_free(a: number): void;

export function keypair_get_public_key(a: number, b: number): void;

export function keypair_get_private_key(a: number, b: number): void;

export function keypair_get_xonly_public_key(a: number): number;

export function keypair_toAddress(a: number, b: number, c: number): void;

export function keypair_toAddressECDSA(a: number, b: number, c: number): void;

export function keypair_random(a: number): void;

export function keypair_fromPrivateKey(a: number, b: number): void;

export function __wbg_publickeygenerator_free(a: number): void;

export function publickeygenerator_fromXPub(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function publickeygenerator_fromMasterXPrv(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
): void;

export function publickeygenerator_receivePubkeys(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function publickeygenerator_receivePubkey(
  a: number,
  b: number,
  c: number,
): void;

export function publickeygenerator_receivePubkeysAsStrings(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function publickeygenerator_receivePubkeyAsString(
  a: number,
  b: number,
  c: number,
): void;

export function publickeygenerator_receiveAddresses(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
): void;

export function publickeygenerator_receiveAddress(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function publickeygenerator_receiveAddressAsStrings(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
): void;

export function publickeygenerator_receiveAddressAsString(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function publickeygenerator_changePubkeys(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function publickeygenerator_changePubkey(
  a: number,
  b: number,
  c: number,
): void;

export function publickeygenerator_changePubkeysAsStrings(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function publickeygenerator_changePubkeyAsString(
  a: number,
  b: number,
  c: number,
): void;

export function publickeygenerator_changeAddresses(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
): void;

export function publickeygenerator_changeAddress(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function publickeygenerator_changeAddressAsStrings(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
): void;

export function publickeygenerator_changeAddressAsString(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function publickeygenerator_toString(a: number, b: number): void;

export function __wbg_mnemonic_free(a: number): void;

export function mnemonic_constructor(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function mnemonic_validate(a: number, b: number, c: number): number;

export function mnemonic_entropy(a: number, b: number): void;

export function mnemonic_set_entropy(a: number, b: number, c: number): void;

export function mnemonic_random(a: number, b: number): void;

export function mnemonic_phrase(a: number, b: number): void;

export function mnemonic_set_phrase(a: number, b: number, c: number): void;

export function mnemonic_toSeed(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function resolver_urls(a: number): number;

export function resolver_getNode(a: number, b: number, c: number): number;

export function resolver_getUrl(a: number, b: number, c: number): number;

export function resolver_connect(a: number, b: number): number;

export function resolver_ctor(a: number, b: number): void;

export function __wbg_resolver_free(a: number): void;

export function rpcclient_getBlockCount(a: number, b: number): number;

export function rpcclient_getBlockDagInfo(a: number, b: number): number;

export function rpcclient_getCoinSupply(a: number, b: number): number;

export function rpcclient_getConnectedPeerInfo(a: number, b: number): number;

export function rpcclient_getInfo(a: number, b: number): number;

export function rpcclient_getPeerAddresses(a: number, b: number): number;

export function rpcclient_getMetrics(a: number, b: number): number;

export function rpcclient_getSink(a: number, b: number): number;

export function rpcclient_getSinkBlueScore(a: number, b: number): number;

export function rpcclient_ping(a: number, b: number): number;

export function rpcclient_shutdown(a: number, b: number): number;

export function rpcclient_getServerInfo(a: number, b: number): number;

export function rpcclient_getSyncStatus(a: number, b: number): number;

export function rpcclient_addPeer(a: number, b: number): number;

export function rpcclient_ban(a: number, b: number): number;

export function rpcclient_estimateNetworkHashesPerSecond(
  a: number,
  b: number,
): number;

export function rpcclient_getBalanceByAddress(a: number, b: number): number;

export function rpcclient_getBalancesByAddresses(a: number, b: number): number;

export function rpcclient_getBlock(a: number, b: number): number;

export function rpcclient_getBlocks(a: number, b: number): number;

export function rpcclient_getBlockTemplate(a: number, b: number): number;

export function rpcclient_getDaaScoreTimestampEstimate(
  a: number,
  b: number,
): number;

export function rpcclient_getCurrentNetwork(a: number, b: number): number;

export function rpcclient_getHeaders(a: number, b: number): number;

export function rpcclient_getMempoolEntries(a: number, b: number): number;

export function rpcclient_getMempoolEntriesByAddresses(
  a: number,
  b: number,
): number;

export function rpcclient_getMempoolEntry(a: number, b: number): number;

export function rpcclient_getSubnetwork(a: number, b: number): number;

export function rpcclient_getUtxosByAddresses(a: number, b: number): number;

export function rpcclient_getVirtualChainFromBlock(
  a: number,
  b: number,
): number;

export function rpcclient_resolveFinalityConflict(a: number, b: number): number;

export function rpcclient_submitBlock(a: number, b: number): number;

export function rpcclient_submitTransaction(a: number, b: number): number;

export function rpcclient_unban(a: number, b: number): number;

export function rpcclient_subscribeBlockAdded(a: number): number;

export function rpcclient_unsubscribeBlockAdded(a: number): number;

export function rpcclient_subscribeFinalityConflict(a: number): number;

export function rpcclient_unsubscribeFinalityConflict(a: number): number;

export function rpcclient_subscribeFinalityConflictResolved(a: number): number;

export function rpcclient_unsubscribeFinalityConflictResolved(
  a: number,
): number;

export function rpcclient_subscribeSinkBlueScoreChanged(a: number): number;

export function rpcclient_unsubscribeSinkBlueScoreChanged(a: number): number;

export function rpcclient_subscribePruningPointUtxoSetOverride(
  a: number,
): number;

export function rpcclient_unsubscribePruningPointUtxoSetOverride(
  a: number,
): number;

export function rpcclient_subscribeNewBlockTemplate(a: number): number;

export function rpcclient_unsubscribeNewBlockTemplate(a: number): number;

export function rpcclient_subscribeVirtualDaaScoreChanged(a: number): number;

export function rpcclient_unsubscribeVirtualDaaScoreChanged(a: number): number;

export function rpcclient_subscribeUtxosChanged(a: number, b: number): number;

export function rpcclient_unsubscribeUtxosChanged(a: number, b: number): number;

export function rpcclient_subscribeVirtualChainChanged(
  a: number,
  b: number,
): number;

export function rpcclient_unsubscribeVirtualChainChanged(
  a: number,
  b: number,
): number;

export function rpcclient_defaultPort(a: number, b: number, c: number): void;

export function rpcclient_parseUrl(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
): void;

export function rpcclient_ctor(a: number, b: number): void;

export function rpcclient_url(a: number, b: number): void;

export function rpcclient_resolver(a: number): number;

export function rpcclient_setResolver(a: number, b: number, c: number): void;

export function rpcclient_setNetworkId(a: number, b: number, c: number): void;

export function rpcclient_isConnected(a: number): number;

export function rpcclient_encoding(a: number, b: number): void;

export function rpcclient_nodeId(a: number, b: number): void;

export function rpcclient_providerName(a: number, b: number): void;

export function rpcclient_providerUrl(a: number, b: number): void;

export function rpcclient_connect(a: number, b: number): number;

export function rpcclient_disconnect(a: number): number;

export function rpcclient_start(a: number): number;

export function rpcclient_stop(a: number): number;

export function rpcclient_triggerAbort(a: number): void;

export function rpcclient_addEventListener(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function rpcclient_removeEventListener(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function rpcclient_clearEventListener(
  a: number,
  b: number,
  c: number,
): void;

export function rpcclient_removeAllEventListeners(a: number, b: number): void;

export function __wbg_rpcclient_free(a: number): void;

export function __wbg_nodedescriptor_free(a: number): void;

export function __wbg_get_nodedescriptor_id(a: number, b: number): void;

export function __wbg_set_nodedescriptor_id(
  a: number,
  b: number,
  c: number,
): void;

export function __wbg_get_nodedescriptor_url(a: number, b: number): void;

export function __wbg_set_nodedescriptor_url(
  a: number,
  b: number,
  c: number,
): void;

export function __wbg_get_nodedescriptor_provider_name(
  a: number,
  b: number,
): void;

export function __wbg_set_nodedescriptor_provider_name(
  a: number,
  b: number,
  c: number,
): void;

export function __wbg_get_nodedescriptor_provider_url(
  a: number,
  b: number,
): void;

export function __wbg_set_nodedescriptor_provider_url(
  a: number,
  b: number,
  c: number,
): void;

export function __wbg_pow_free(a: number): void;

export function pow_new(a: number, b: number, c: number, d: number): void;

export function pow_target(a: number, b: number): void;

export function pow_checkWork(a: number, b: number, c: number): void;

export function pow_get_pre_pow_hash(a: number, b: number): void;

export function pow_fromRaw(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
): void;

export function calculateTarget(a: number, b: number): void;

export function transactionsigninghashecdsa_new(): number;

export function transactionsigninghashecdsa_update(
  a: number,
  b: number,
  c: number,
): void;

export function transactionsigninghashecdsa_finalize(
  a: number,
  b: number,
): void;

export function __wbg_transactionsigninghashecdsa_free(a: number): void;

export function transactionsigninghash_new(): number;

export function transactionsigninghash_update(
  a: number,
  b: number,
  c: number,
): void;

export function transactionsigninghash_finalize(a: number, b: number): void;

export function __wbg_transactionsigninghash_free(a: number): void;

export function transactioninput_constructor(a: number, b: number): void;

export function transactioninput_get_previous_outpoint(a: number): number;

export function transactioninput_set_previous_outpoint(
  a: number,
  b: number,
  c: number,
): void;

export function transactioninput_get_signature_script_as_hex(
  a: number,
  b: number,
): void;

export function transactioninput_set_signature_script_from_js_value(
  a: number,
  b: number,
  c: number,
): void;

export function transactioninput_get_sequence(a: number): number;

export function transactioninput_set_sequence(a: number, b: number): void;

export function transactioninput_get_sig_op_count(a: number): number;

export function transactioninput_set_sig_op_count(a: number, b: number): void;

export function transactioninput_get_utxo(a: number): number;

export function __wbg_transactioninput_free(a: number): void;

export function transaction_serializeToObject(a: number, b: number): void;

export function transaction_serializeToJSON(a: number, b: number): void;

export function transaction_serializeToSafeJSON(a: number, b: number): void;

export function transaction_deserializeFromObject(a: number, b: number): void;

export function transaction_deserializeFromJSON(
  a: number,
  b: number,
  c: number,
): void;

export function transaction_deserializeFromSafeJSON(
  a: number,
  b: number,
  c: number,
): void;

export function transaction_is_coinbase(a: number): number;

export function transaction_finalize(a: number, b: number): void;

export function transaction_id(a: number, b: number): void;

export function transaction_constructor(a: number, b: number): void;

export function transaction_get_inputs_as_js_array(a: number): number;

export function transaction_addresses(a: number, b: number, c: number): void;

export function transaction_set_inputs_from_js_array(
  a: number,
  b: number,
): void;

export function transaction_get_outputs_as_js_array(a: number): number;

export function transaction_set_outputs_from_js_array(
  a: number,
  b: number,
): void;

export function transaction_version(a: number): number;

export function transaction_set_version(a: number, b: number): void;

export function transaction_lock_time(a: number): number;

export function transaction_set_lock_time(a: number, b: number): void;

export function transaction_gas(a: number): number;

export function transaction_set_gas(a: number, b: number): void;

export function transaction_get_subnetwork_id_as_hex(
  a: number,
  b: number,
): void;

export function transaction_set_subnetwork_id_from_js_value(
  a: number,
  b: number,
): void;

export function transaction_get_payload_as_hex_string(
  a: number,
  b: number,
): void;

export function transaction_set_payload_from_js_value(
  a: number,
  b: number,
): void;

export function __wbg_transaction_free(a: number): void;

export function __wbg_transactionoutput_free(a: number): void;

export function transactionoutput_ctor(a: number, b: number): number;

export function transactionoutput_value(a: number): number;

export function transactionoutput_set_value(a: number, b: number): void;

export function transactionoutput_scriptPublicKey(a: number): number;

export function transactionoutput_set_scriptPublicKey(
  a: number,
  b: number,
): void;

export function __wbg_transactionoutpoint_free(a: number): void;

export function transactionoutpoint_ctor(a: number, b: number): number;

export function transactionoutpoint_getId(a: number, b: number): void;

export function transactionoutpoint_transactionId(a: number, b: number): void;

export function transactionoutpoint_index(a: number): number;

export function __wbg_utxoentry_free(a: number): void;

export function __wbg_get_utxoentry_address(a: number): number;

export function __wbg_set_utxoentry_address(a: number, b: number): void;

export function __wbg_get_utxoentry_outpoint(a: number): number;

export function __wbg_set_utxoentry_outpoint(a: number, b: number): void;

export function __wbg_get_utxoentry_amount(a: number): number;

export function __wbg_set_utxoentry_amount(a: number, b: number): void;

export function __wbg_get_utxoentry_scriptPublicKey(a: number): number;

export function __wbg_set_utxoentry_scriptPublicKey(a: number, b: number): void;

export function __wbg_get_utxoentry_blockDaaScore(a: number): number;

export function __wbg_set_utxoentry_blockDaaScore(a: number, b: number): void;

export function __wbg_get_utxoentry_isCoinbase(a: number): number;

export function __wbg_set_utxoentry_isCoinbase(a: number, b: number): void;

export function utxoentry_toString(a: number, b: number): void;

export function __wbg_utxoentryreference_free(a: number): void;

export function utxoentryreference_toString(a: number, b: number): void;

export function utxoentryreference_entry(a: number): number;

export function utxoentryreference_getTransactionId(a: number, b: number): void;

export function utxoentryreference_getId(a: number, b: number): void;

export function utxoentryreference_amount(a: number): number;

export function utxoentryreference_isCoinbase(a: number): number;

export function utxoentryreference_blockDaaScore(a: number): number;

export function __wbg_utxoentries_free(a: number): void;

export function utxoentries_js_ctor(a: number, b: number): void;

export function utxoentries_get_items_as_js_array(a: number): number;

export function utxoentries_set_items_from_js_array(a: number, b: number): void;

export function utxoentries_sort(a: number): void;

export function utxoentries_amount(a: number): number;

export function isScriptPayToScriptHash(a: number, b: number): void;

export function isScriptPayToPubkeyECDSA(a: number, b: number): void;

export function isScriptPayToPubkey(a: number, b: number): void;

export function addressFromScriptPublicKey(
  a: number,
  b: number,
  c: number,
): void;

export function payToScriptHashSignatureScript(
  a: number,
  b: number,
  c: number,
): void;

export function payToScriptHashScript(a: number, b: number): void;

export function payToAddressScript(a: number, b: number): void;

export function header_constructor(a: number, b: number): void;

export function header_finalize(a: number, b: number): void;

export function header_asJSON(a: number, b: number): void;

export function header_get_version(a: number): number;

export function header_set_version(a: number, b: number): void;

export function header_get_timestamp(a: number): number;

export function header_set_timestamp(a: number, b: number): void;

export function header_bits(a: number): number;

export function header_set_bits(a: number, b: number): void;

export function header_nonce(a: number): number;

export function header_set_nonce(a: number, b: number): void;

export function header_daa_score(a: number): number;

export function header_set_daa_score(a: number, b: number): void;

export function header_blue_score(a: number): number;

export function header_set_blue_score(a: number, b: number): void;

export function header_get_hash_as_hex(a: number, b: number): void;

export function header_get_hash_merkle_root_as_hex(a: number, b: number): void;

export function header_set_hash_merkle_root_from_js_value(
  a: number,
  b: number,
): void;

export function header_get_accepted_id_merkle_root_as_hex(
  a: number,
  b: number,
): void;

export function header_set_accepted_id_merkle_root_from_js_value(
  a: number,
  b: number,
): void;

export function header_get_utxo_commitment_as_hex(a: number, b: number): void;

export function header_set_utxo_commitment_from_js_value(
  a: number,
  b: number,
): void;

export function header_get_pruning_point_as_hex(a: number, b: number): void;

export function header_set_pruning_point_from_js_value(
  a: number,
  b: number,
): void;

export function header_get_parents_by_level_as_js_value(a: number): number;

export function header_set_parents_by_level_from_js_value(
  a: number,
  b: number,
): void;

export function header_blue_work(a: number): number;

export function header_getBlueWorkAsHex(a: number, b: number): void;

export function header_set_blue_work_from_js_value(a: number, b: number): void;

export function __wbg_header_free(a: number): void;

export function scriptbuilder_new(): number;

export function scriptbuilder_fromScript(a: number, b: number): void;

export function scriptbuilder_addOp(a: number, b: number, c: number): void;

export function scriptbuilder_addOps(a: number, b: number, c: number): void;

export function scriptbuilder_addData(a: number, b: number, c: number): void;

export function scriptbuilder_addI64(a: number, b: number, c: number): void;

export function scriptbuilder_addLockTime(
  a: number,
  b: number,
  c: number,
): void;

export function scriptbuilder_addSequence(
  a: number,
  b: number,
  c: number,
): void;

export function scriptbuilder_canonicalDataSize(a: number, b: number): void;

export function scriptbuilder_toString(a: number): number;

export function scriptbuilder_drain(a: number): number;

export function scriptbuilder_createPayToScriptHashScript(a: number): number;

export function scriptbuilder_encodePayToScriptHashSignatureScript(
  a: number,
  b: number,
  c: number,
): void;

export function scriptbuilder_hexView(a: number, b: number, c: number): void;

export function __wbg_scriptbuilder_free(a: number): void;

export function __wbg_transactionutxoentry_free(a: number): void;

export function __wbg_get_transactionutxoentry_amount(a: number): number;

export function __wbg_set_transactionutxoentry_amount(
  a: number,
  b: number,
): void;

export function __wbg_get_transactionutxoentry_scriptPublicKey(
  a: number,
): number;

export function __wbg_set_transactionutxoentry_scriptPublicKey(
  a: number,
  b: number,
): void;

export function __wbg_get_transactionutxoentry_blockDaaScore(a: number): number;

export function __wbg_set_transactionutxoentry_blockDaaScore(
  a: number,
  b: number,
): void;

export function __wbg_get_transactionutxoentry_isCoinbase(a: number): number;

export function __wbg_set_transactionutxoentry_isCoinbase(
  a: number,
  b: number,
): void;

export function __wbg_sighashtype_free(a: number): void;

export function __wbg_scriptpublickey_free(a: number): void;

export function __wbg_get_scriptpublickey_version(a: number): number;

export function __wbg_set_scriptpublickey_version(a: number, b: number): void;

export function scriptpublickey_constructor(
  a: number,
  b: number,
  c: number,
): void;

export function scriptpublickey_script_as_hex(a: number, b: number): void;

export function __wbg_networkid_free(a: number): void;

export function __wbg_get_networkid_type(a: number): number;

export function __wbg_set_networkid_type(a: number, b: number): void;

export function __wbg_get_networkid_suffix(a: number, b: number): void;

export function __wbg_set_networkid_suffix(
  a: number,
  b: number,
  c: number,
): void;

export function networkid_ctor(a: number, b: number): void;

export function networkid_id(a: number, b: number): void;

export function networkid_toString(a: number, b: number): void;

export function networkid_addressPrefix(a: number, b: number): void;

export function rustsecp256k1_v0_9_2_context_create(a: number): number;

export function rustsecp256k1_v0_9_2_context_destroy(a: number): void;

export function rustsecp256k1_v0_9_2_default_illegal_callback_fn(
  a: number,
  b: number,
): void;

export function rustsecp256k1_v0_9_2_default_error_callback_fn(
  a: number,
  b: number,
): void;

export function __wbg_hash_free(a: number): void;

export function hash_constructor(a: number, b: number): number;

export function hash_toString(a: number, b: number): void;

export function __wbg_address_free(a: number): void;

export function address_constructor(a: number, b: number): number;

export function address_validate(a: number, b: number): number;

export function address_toString(a: number, b: number): void;

export function address_version(a: number, b: number): void;

export function address_prefix(a: number, b: number): void;

export function address_set_setPrefix(a: number, b: number, c: number): void;

export function address_payload(a: number, b: number): void;

export function address_short(a: number, b: number, c: number): void;

export function initWASM32Bindings(a: number, b: number): void;

export function initConsolePanicHook(): void;

export function initBrowserPanicHook(): void;

export function presentPanicHookLogs(): void;

export function defer(): number;

export function __wbg_aborted_free(a: number): void;

export function __wbg_abortable_free(a: number): void;

export function abortable_new(): number;

export function abortable_isAborted(a: number): number;

export function abortable_abort(a: number): void;

export function abortable_check(a: number, b: number): void;

export function abortable_reset(a: number): void;

export function setLogLevel(a: number): void;

export function __wbindgen_malloc(a: number, b: number): number;

export function __wbindgen_realloc(
  a: number,
  b: number,
  c: number,
  d: number,
): number;

export const __wbindgen_export_2: WebAssembly.Table;

export function _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h8a39f97c45b66eb5(
  a: number,
  b: number,
): void;

export function _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__he207a4d744e23aaa(
  a: number,
  b: number,
  c: number,
): void;

export function _dyn_core__ops__function__FnMut__A_B___Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h4fcf0ff2bd4d0451(
  a: number,
  b: number,
  c: number,
  d: number,
): number;

export function _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h3ab98d36cc07bb24(
  a: number,
  b: number,
  c: number,
): void;

export function _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h157135bb305edcba(
  a: number,
  b: number,
  c: number,
): void;

export function _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h048a2b7c6a5bcd30(
  a: number,
  b: number,
  c: number,
): void;

export function _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h536d4da9a2de3155(
  a: number,
  b: number,
  c: number,
): void;

export function _dyn_core__ops__function__Fn_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hcd41749ffaf9b105(
  a: number,
  b: number,
): void;

export function _dyn_core__ops__function__Fn__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hbc5fa08bd8e61ccd(
  a: number,
  b: number,
  c: number,
): void;

export function __wbindgen_add_to_stack_pointer(a: number): number;

export function _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hd51b775d844bf3c0(
  a: number,
  b: number,
  c: number,
  d: number,
): void;

export function __wbindgen_free(a: number, b: number, c: number): void;

export function __wbindgen_exn_store(a: number): void;

export function wasm_bindgen__convert__closures__invoke2_mut__h0960375cf53849aa(
  a: number,
  b: number,
  c: number,
  d: number,
): void;
