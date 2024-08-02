let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) {
  return heap[idx];
}

let heap_next = heap.length;

function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];

  if (typeof heap_next !== "number") throw new Error("corrupt heap");

  heap[idx] = obj;
  return idx;
}

const cachedTextDecoder =
  typeof TextDecoder !== "undefined"
    ? new TextDecoder("utf-8", {
        ignoreBOM: true,
        fatal: true,
      })
    : {
        decode: () => {
          throw Error("TextDecoder not available");
        },
      };

if (typeof TextDecoder !== "undefined") {
  cachedTextDecoder.decode();
}
let cachedUint8Memory0 = null;

function getUint8Memory0() {
  if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
    cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder =
  typeof TextEncoder !== "undefined"
    ? new TextEncoder("utf-8")
    : {
        encode: () => {
          throw Error("TextEncoder not available");
        },
      };

const encodeString =
  typeof cachedTextEncoder.encodeInto === "function"
    ? function (arg, view) {
        return cachedTextEncoder.encodeInto(arg, view);
      }
    : function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
          read: arg.length,
          written: buf.length,
        };
      };

function passStringToWasm0(arg, malloc, realloc) {
  if (typeof arg !== "string")
    throw new Error(`expected a string argument, found ${typeof arg}`);

  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length, 1) >>> 0;
    getUint8Memory0()
      .subarray(ptr, ptr + buf.length)
      .set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }

  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;

  const mem = getUint8Memory0();

  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7f) break;
    mem[ptr + offset] = code;
  }

  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, (len = offset + arg.length * 3), 1) >>> 0;
    const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);
    if (ret.read !== arg.length) throw new Error("failed to pass whole string");
    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

function isLikeNone(x) {
  return x === undefined || x === null;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
  if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
    cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachedInt32Memory0;
}

function _assertBoolean(n) {
  if (typeof n !== "boolean") {
    throw new Error(`expected a boolean argument, found ${typeof n}`);
  }
}

function _assertNum(n) {
  if (typeof n !== "number")
    throw new Error(`expected a number argument, found ${typeof n}`);
}

let cachedFloat64Memory0 = null;

function getFloat64Memory0() {
  if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
    cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
  }
  return cachedFloat64Memory0;
}

function debugString(val) {
  // primitive types
  const type = typeof val;
  if (type == "number" || type == "boolean" || val == null) {
    return `${val}`;
  }
  if (type == "string") {
    return `"${val}"`;
  }
  if (type == "symbol") {
    const description = val.description;
    if (description == null) {
      return "Symbol";
    } else {
      return `Symbol(${description})`;
    }
  }
  if (type == "function") {
    const name = val.name;
    if (typeof name == "string" && name.length > 0) {
      return `Function(${name})`;
    } else {
      return "Function";
    }
  }
  // objects
  if (Array.isArray(val)) {
    const length = val.length;
    let debug = "[";
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (let i = 1; i < length; i++) {
      debug += ", " + debugString(val[i]);
    }
    debug += "]";
    return debug;
  }
  // Test for built-in
  const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  let className;
  if (builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    // Failed to match the standard '[object ClassName]'
    return toString.call(val);
  }
  if (className == "Object") {
    // we're a user defined class or Object
    // JSON.stringify avoids problems with cycles, and is generally much
    // easier than looping through ownProperties of `val`.
    try {
      return "Object(" + JSON.stringify(val) + ")";
    } catch (_) {
      return "Object";
    }
  }
  // errors
  if (val instanceof Error) {
    return `${val.name}: ${val.message}\n${val.stack}`;
  }
  // TODO we could test for more things here, like `Set`s and `Map`s.
  return className;
}

function _assertBigInt(n) {
  if (typeof n !== "bigint")
    throw new Error(`expected a bigint argument, found ${typeof n}`);
}

let cachedBigInt64Memory0 = null;

function getBigInt64Memory0() {
  if (
    cachedBigInt64Memory0 === null ||
    cachedBigInt64Memory0.byteLength === 0
  ) {
    cachedBigInt64Memory0 = new BigInt64Array(wasm.memory.buffer);
  }
  return cachedBigInt64Memory0;
}

function dropObject(idx) {
  if (idx < 132) return;
  heap[idx] = heap_next;
  heap_next = idx;
}

function takeObject(idx) {
  const ret = getObject(idx);
  dropObject(idx);
  return ret;
}

const CLOSURE_DTORS =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((state) => {
        wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b);
      });

function makeMutClosure(arg0, arg1, dtor, f) {
  const state = { a: arg0, b: arg1, cnt: 1, dtor };
  const real = (...args) => {
    // First up with a closure we increment the internal reference
    // count. This ensures that the Rust closure environment won't
    // be deallocated while we're invoking it.
    state.cnt++;
    const a = state.a;
    state.a = 0;
    try {
      return f(a, state.b, ...args);
    } finally {
      if (--state.cnt === 0) {
        wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);
        CLOSURE_DTORS.unregister(state);
      } else {
        state.a = a;
      }
    }
  };
  real.original = state;
  CLOSURE_DTORS.register(real, state, state);
  return real;
}

function logError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    let error = (function () {
      try {
        return e instanceof Error
          ? `${e.message}\n\nStack:\n${e.stack}`
          : e.toString();
      } catch (_) {
        return "<failed to stringify thrown value>";
      }
    })();
    console.error(
      "wasm-bindgen: imported JS function that was not marked as `catch` threw an error:",
      error,
    );
    throw e;
  }
}

function __wbg_adapter_60(arg0, arg1) {
  _assertNum(arg0);
  _assertNum(arg1);
  wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h8a39f97c45b66eb5(
    arg0,
    arg1,
  );
}

function __wbg_adapter_63(arg0, arg1, arg2) {
  _assertNum(arg0);
  _assertNum(arg1);
  wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__he207a4d744e23aaa(
    arg0,
    arg1,
    addHeapObject(arg2),
  );
}

function __wbg_adapter_66(arg0, arg1, arg2, arg3) {
  _assertNum(arg0);
  _assertNum(arg1);
  _assertNum(arg3);
  const ret =
    wasm._dyn_core__ops__function__FnMut__A_B___Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h4fcf0ff2bd4d0451(
      arg0,
      arg1,
      addHeapObject(arg2),
      arg3,
    );
  return takeObject(ret);
}

function __wbg_adapter_69(arg0, arg1, arg2) {
  _assertNum(arg0);
  _assertNum(arg1);
  wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h3ab98d36cc07bb24(
    arg0,
    arg1,
    addHeapObject(arg2),
  );
}

function __wbg_adapter_72(arg0, arg1, arg2) {
  _assertNum(arg0);
  _assertNum(arg1);
  _assertNum(arg2);
  wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h157135bb305edcba(
    arg0,
    arg1,
    arg2,
  );
}

function __wbg_adapter_75(arg0, arg1, arg2) {
  _assertNum(arg0);
  _assertNum(arg1);
  wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h048a2b7c6a5bcd30(
    arg0,
    arg1,
    addHeapObject(arg2),
  );
}

function __wbg_adapter_78(arg0, arg1, arg2) {
  _assertNum(arg0);
  _assertNum(arg1);
  wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h536d4da9a2de3155(
    arg0,
    arg1,
    addHeapObject(arg2),
  );
}

function makeClosure(arg0, arg1, dtor, f) {
  const state = { a: arg0, b: arg1, cnt: 1, dtor };
  const real = (...args) => {
    // First up with a closure we increment the internal reference
    // count. This ensures that the Rust closure environment won't
    // be deallocated while we're invoking it.
    state.cnt++;
    try {
      return f(state.a, state.b, ...args);
    } finally {
      if (--state.cnt === 0) {
        wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b);
        state.a = 0;
        CLOSURE_DTORS.unregister(state);
      }
    }
  };
  real.original = state;
  CLOSURE_DTORS.register(real, state, state);
  return real;
}

function __wbg_adapter_81(arg0, arg1) {
  _assertNum(arg0);
  _assertNum(arg1);
  wasm._dyn_core__ops__function__Fn_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hcd41749ffaf9b105(
    arg0,
    arg1,
  );
}

function __wbg_adapter_84(arg0, arg1, arg2) {
  _assertNum(arg0);
  _assertNum(arg1);
  wasm._dyn_core__ops__function__Fn__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hbc5fa08bd8e61ccd(
    arg0,
    arg1,
    addHeapObject(arg2),
  );
}

function __wbg_adapter_87(arg0, arg1, arg2) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    _assertNum(arg0);
    _assertNum(arg1);
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hd51b775d844bf3c0(
      retptr,
      arg0,
      arg1,
      addHeapObject(arg2),
    );
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    if (r1) {
      throw takeObject(r0);
    }
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * Returns the version of the Rusty Kaspa framework.
 * @category General
 * @returns {string}
 */
export function version() {
  let deferred1_0;
  let deferred1_1;
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.version(retptr);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    deferred1_0 = r0;
    deferred1_1 = r1;
    return getStringFromWasm0(r0, r1);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
    wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
  }
}

function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    wasm.__wbindgen_exn_store(addHeapObject(e));
  }
}

function __wbg_adapter_295(arg0, arg1, arg2, arg3) {
  _assertNum(arg0);
  _assertNum(arg1);
  wasm.wasm_bindgen__convert__closures__invoke2_mut__h0960375cf53849aa(
    arg0,
    arg1,
    addHeapObject(arg2),
    addHeapObject(arg3),
  );
}

let stack_pointer = 128;

function addBorrowedObject(obj) {
  if (stack_pointer == 1) throw new Error("out of js stack");
  heap[--stack_pointer] = obj;
  return stack_pointer;
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
  if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
    cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
  }
  return cachedUint32Memory0;
}

function passArrayJsValueToWasm0(array, malloc) {
  const ptr = malloc(array.length * 4, 4) >>> 0;
  const mem = getUint32Memory0();
  for (let i = 0; i < array.length; i++) {
    mem[ptr / 4 + i] = addHeapObject(array[i]);
  }
  WASM_VECTOR_LEN = array.length;
  return ptr;
}

function getArrayJsValueFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  const mem = getUint32Memory0();
  const slice = mem.subarray(ptr / 4, ptr / 4 + len);
  const result = [];
  for (let i = 0; i < slice.length; i++) {
    result.push(takeObject(slice[i]));
  }
  return result;
}

/**
 *Set the logger log level using a string representation.
 *Available variants are: 'off', 'error', 'warn', 'info', 'debug', 'trace'
 *@category General
 * @param {"off" | "error" | "warn" | "info" | "debug" | "trace"} level
 */
export function setLogLevel(level) {
  wasm.setLogLevel(addHeapObject(level));
}

/**
 * Configuration for the WASM32 bindings runtime interface.
 * @see {@link IWASM32BindingsConfig}
 * @category General
 * @param {IWASM32BindingsConfig} config
 */
export function initWASM32Bindings(config) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.initWASM32Bindings(retptr, addHeapObject(config));
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    if (r1) {
      throw takeObject(r0);
    }
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * Initialize Rust panic handler in console mode.
 *
 * This will output additional debug information during a panic to the console.
 * This function should be called right after loading WASM libraries.
 * @category General
 */
export function initConsolePanicHook() {
  wasm.initConsolePanicHook();
}

/**
 * Initialize Rust panic handler in browser mode.
 *
 * This will output additional debug information during a panic in the browser
 * by creating a full-screen `DIV`. This is useful on mobile devices or where
 * the user otherwise has no access to console/developer tools. Use
 * {@link presentPanicHookLogs} to activate the panic logs in the
 * browser environment.
 * @see {@link presentPanicHookLogs}
 * @category General
 */
export function initBrowserPanicHook() {
  wasm.initBrowserPanicHook();
}

/**
 * Present panic logs to the user in the browser.
 *
 * This function should be called after a panic has occurred and the
 * browser-based panic hook has been activated. It will present the
 * collected panic logs in a full-screen `DIV` in the browser.
 * @see {@link initBrowserPanicHook}
 * @category General
 */
export function presentPanicHookLogs() {
  wasm.presentPanicHookLogs();
}

/**
 *r" Deferred promise - an object that has `resolve()` and `reject()`
 *r" functions that can be called outside of the promise body.
 *r" WARNING: This function uses `eval` and can not be used in environments
 *r" where dynamically-created code can not be executed such as web browser
 *r" extensions.
 *r" @category General
 * @returns {Promise<any>}
 */
export function defer() {
  const ret = wasm.defer();
  return takeObject(ret);
}

function _assertClass(instance, klass) {
  if (!(instance instanceof klass)) {
    throw new Error(`expected instance of ${klass.name}`);
  }
  return instance.ptr;
}

function getArrayU8FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

/**
 *
 * Format a Sompi amount to a string representation of the amount in Kaspa with a suffix
 * based on the network type (e.g. `KAS` for mainnet, `TKAS` for testnet,
 * `SKAS` for simnet, `DKAS` for devnet).
 *
 * @category Wallet SDK
 * @param {bigint | number | HexString} sompi
 * @param {NetworkType | NetworkId | string} network
 * @returns {string}
 */
export function sompiToKaspaStringWithSuffix(sompi, network) {
  let deferred2_0;
  let deferred2_1;
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.sompiToKaspaStringWithSuffix(
      retptr,
      addHeapObject(sompi),
      addBorrowedObject(network),
    );
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    var r3 = getInt32Memory0()[retptr / 4 + 3];
    var ptr1 = r0;
    var len1 = r1;
    if (r3) {
      ptr1 = 0;
      len1 = 0;
      throw takeObject(r2);
    }
    deferred2_0 = ptr1;
    deferred2_1 = len1;
    return getStringFromWasm0(ptr1, len1);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
    heap[stack_pointer++] = undefined;
    wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
  }
}

/**
 *
 * Convert Sompi to a string representation of the amount in Kaspa.
 *
 * @category Wallet SDK
 * @param {bigint | number | HexString} sompi
 * @returns {string}
 */
export function sompiToKaspaString(sompi) {
  let deferred2_0;
  let deferred2_1;
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.sompiToKaspaString(retptr, addHeapObject(sompi));
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    var r3 = getInt32Memory0()[retptr / 4 + 3];
    var ptr1 = r0;
    var len1 = r1;
    if (r3) {
      ptr1 = 0;
      len1 = 0;
      throw takeObject(r2);
    }
    deferred2_0 = ptr1;
    deferred2_1 = len1;
    return getStringFromWasm0(ptr1, len1);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
    wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
  }
}

/**
 * Convert a Kaspa string to Sompi represented by bigint.
 * This function provides correct precision handling and
 * can be used to parse user input.
 * @category Wallet SDK
 * @param {string} kaspa
 * @returns {bigint | undefined}
 */
export function kaspaToSompi(kaspa) {
  const ptr0 = passStringToWasm0(
    kaspa,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  );
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.kaspaToSompi(ptr0, len0);
  return takeObject(ret);
}

/**
 * @category Wallet SDK
 * @param {PublicKey | string} key
 * @param {NetworkType | NetworkId | string} network
 * @param {boolean | undefined} [ecdsa]
 * @param {AccountKind | undefined} [account_kind]
 * @returns {Address}
 */
export function createAddress(key, network, ecdsa, account_kind) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    if (!isLikeNone(ecdsa)) {
      _assertBoolean(ecdsa);
    }
    let ptr0 = 0;
    if (!isLikeNone(account_kind)) {
      _assertClass(account_kind, AccountKind);
      if (account_kind.__wbg_ptr === 0) {
        throw new Error("Attempt to use a moved value");
      }
      ptr0 = account_kind.__destroy_into_raw();
    }
    wasm.createAddress(
      retptr,
      addHeapObject(key),
      addBorrowedObject(network),
      isLikeNone(ecdsa) ? 0xffffff : ecdsa ? 1 : 0,
      ptr0,
    );
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return Address.__wrap(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
    heap[stack_pointer++] = undefined;
  }
}

/**
 * @category Wallet SDK
 * @param {number} minimum_signatures
 * @param {(PublicKey | string)[]} keys
 * @param {NetworkType} network_type
 * @param {boolean | undefined} [ecdsa]
 * @param {AccountKind | undefined} [account_kind]
 * @returns {Address}
 */
export function createMultisigAddress(
  minimum_signatures,
  keys,
  network_type,
  ecdsa,
  account_kind,
) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    _assertNum(minimum_signatures);
    _assertNum(network_type);
    if (!isLikeNone(ecdsa)) {
      _assertBoolean(ecdsa);
    }
    let ptr0 = 0;
    if (!isLikeNone(account_kind)) {
      _assertClass(account_kind, AccountKind);
      if (account_kind.__wbg_ptr === 0) {
        throw new Error("Attempt to use a moved value");
      }
      ptr0 = account_kind.__destroy_into_raw();
    }
    wasm.createMultisigAddress(
      retptr,
      minimum_signatures,
      addHeapObject(keys),
      network_type,
      isLikeNone(ecdsa) ? 0xffffff : ecdsa ? 1 : 0,
      ptr0,
    );
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return Address.__wrap(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * WASM32 binding for `argon2sha256iv` hash function.
 * @param text - The text string to hash.
 * @category Encryption
 * @param {string} text
 * @param {number} byteLength
 * @returns {HexString}
 */
export function argon2sha256ivFromText(text, byteLength) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    const ptr0 = passStringToWasm0(
      text,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    _assertNum(byteLength);
    wasm.argon2sha256ivFromText(retptr, ptr0, len0, byteLength);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return takeObject(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * WASM32 binding for `argon2sha256iv` hash function.
 * @param data - The data to hash ({@link HexString} or Uint8Array).
 * @category Encryption
 * @param {HexString | Uint8Array} data
 * @param {number} hashLength
 * @returns {HexString}
 */
export function argon2sha256ivFromBinary(data, hashLength) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    _assertNum(hashLength);
    wasm.argon2sha256ivFromBinary(retptr, addHeapObject(data), hashLength);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return takeObject(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * WASM32 binding for `SHA256d` hash function.
 * @param {string} text - The text string to hash.
 * @category Encryption
 * @param {string} text
 * @returns {HexString}
 */
export function sha256dFromText(text) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    const ptr0 = passStringToWasm0(
      text,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.sha256dFromText(retptr, ptr0, len0);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return takeObject(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * WASM32 binding for `SHA256d` hash function.
 * @param data - The data to hash ({@link HexString} or Uint8Array).
 * @category Encryption
 * @param {HexString | Uint8Array} data
 * @returns {HexString}
 */
export function sha256dFromBinary(data) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.sha256dFromBinary(retptr, addHeapObject(data));
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return takeObject(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * WASM32 binding for `SHA256` hash function.
 * @param {string} text - The text string to hash.
 * @category Encryption
 * @param {string} text
 * @returns {HexString}
 */
export function sha256FromText(text) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    const ptr0 = passStringToWasm0(
      text,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.sha256FromText(retptr, ptr0, len0);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return takeObject(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * WASM32 binding for `SHA256` hash function.
 * @param data - The data to hash ({@link HexString} or Uint8Array).
 * @category Encryption
 * @param {HexString | Uint8Array} data
 * @returns {HexString}
 */
export function sha256FromBinary(data) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.sha256FromBinary(retptr, addHeapObject(data));
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return takeObject(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * WASM32 binding for `decryptXChaCha20Poly1305` function.
 * @category Encryption
 * @param {string} base64string
 * @param {string} password
 * @returns {string}
 */
export function decryptXChaCha20Poly1305(base64string, password) {
  let deferred4_0;
  let deferred4_1;
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    const ptr0 = passStringToWasm0(
      base64string,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(
      password,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len1 = WASM_VECTOR_LEN;
    wasm.decryptXChaCha20Poly1305(retptr, ptr0, len0, ptr1, len1);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    var r3 = getInt32Memory0()[retptr / 4 + 3];
    var ptr3 = r0;
    var len3 = r1;
    if (r3) {
      ptr3 = 0;
      len3 = 0;
      throw takeObject(r2);
    }
    deferred4_0 = ptr3;
    deferred4_1 = len3;
    return getStringFromWasm0(ptr3, len3);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
    wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
  }
}

/**
 * WASM32 binding for `encryptXChaCha20Poly1305` function.
 * @returns The encrypted text as a base64 string.
 * @category Encryption
 * @param {string} plainText
 * @param {string} password
 * @returns {string}
 */
export function encryptXChaCha20Poly1305(plainText, password) {
  let deferred4_0;
  let deferred4_1;
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    const ptr0 = passStringToWasm0(
      plainText,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(
      password,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len1 = WASM_VECTOR_LEN;
    wasm.encryptXChaCha20Poly1305(retptr, ptr0, len0, ptr1, len1);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    var r3 = getInt32Memory0()[retptr / 4 + 3];
    var ptr3 = r0;
    var len3 = r1;
    if (r3) {
      ptr3 = 0;
      len3 = 0;
      throw takeObject(r2);
    }
    deferred4_0 = ptr3;
    deferred4_1 = len3;
    return getStringFromWasm0(ptr3, len3);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
    wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
  }
}

/**
 * Verifies with a public key the signature of the given message
 * @category Message Signing
 */
export function verifyMessage(value) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.verifyMessage(retptr, addHeapObject(value));
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return r0 !== 0;
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * Signs a message with the given private key
 * @category Message Signing
 * @param {ISignMessage} value
 * @returns {HexString}
 */
export function signMessage(value) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.signMessage(retptr, addHeapObject(value));
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return takeObject(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * Set a custom storage folder for the wallet SDK
 * subsystem.  Encrypted wallet files and transaction
 * data will be stored in this folder. If not set
 * the storage folder will default to `~/.kaspa`
 * (note that the folder is hidden).
 *
 * This must be called before using any other wallet
 * SDK functions.
 *
 * NOTE: This function will create a folder if it
 * doesn't exist. This function will have no effect
 * if invoked in the browser environment.
 *
 * @param {String} folder - the path to the storage folder
 *
 * @category Wallet API
 */
export function setDefaultStorageFolder(folder) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    const ptr0 = passStringToWasm0(
      folder,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.setDefaultStorageFolder(retptr, ptr0, len0);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    if (r1) {
      throw takeObject(r0);
    }
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * Set the name of the default wallet file name
 * or the `localStorage` key.  If `Wallet::open`
 * is called without a wallet file name, this name
 * will be used.  Please note that this name
 * will be suffixed with `.wallet` suffix.
 *
 * This function should be called before using any
 * other wallet SDK functions.
 *
 * @param {String} folder - the name to the wallet file or key.
 *
 * @category Wallet API
 * @param {string} folder
 */
export function setDefaultWalletFile(folder) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    const ptr0 = passStringToWasm0(
      folder,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.setDefaultWalletFile(retptr, ptr0, len0);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    if (r1) {
      throw takeObject(r0);
    }
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * Helper function that creates an estimate using the transaction {@link Generator}
 * by producing only the {@link GeneratorSummary} containing the estimate.
 * @see {@link IGeneratorSettingsObject}, {@link Generator}, {@link createTransactions}
 * @category Wallet SDK
 * @param {IGeneratorSettingsObject} settings
 * @returns {Promise<GeneratorSummary>}
 */
export function estimateTransactions(settings) {
  const ret = wasm.estimateTransactions(addHeapObject(settings));
  return takeObject(ret);
}

/**
 * Helper function that creates a set of transactions using the transaction {@link Generator}.
 * @see {@link IGeneratorSettingsObject}, {@link Generator}, {@link estimateTransactions}
 * @category Wallet SDK
 * @param {IGeneratorSettingsObject} settings
 * @returns {Promise<ICreateTransactions>}
 */
export function createTransactions(settings) {
  const ret = wasm.createTransactions(addHeapObject(settings));
  return takeObject(ret);
}

/**
 * Create a basic transaction without any mass limit checks.
 * @category Wallet SDK
 * @param {IUtxoEntry[]} utxo_entry_source
 * @param {IPaymentOutput[]} outputs
 * @param {Address | string} change_address
 * @param {bigint} priority_fee
 * @param {any} payload
 * @param {any} sig_op_count
 * @param {any} minimum_signatures
 * @returns {Transaction}
 */
export function createTransaction(
  utxo_entry_source,
  outputs,
  change_address,
  priority_fee,
  payload,
  sig_op_count,
  minimum_signatures,
) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.createTransaction(
      retptr,
      addHeapObject(utxo_entry_source),
      addHeapObject(outputs),
      addHeapObject(change_address),
      addHeapObject(priority_fee),
      addHeapObject(payload),
      addHeapObject(sig_op_count),
      addHeapObject(minimum_signatures),
    );
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return Transaction.__wrap(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * find Consensus parameters for given NetworkType
 * @category Wallet SDK
 * @param {NetworkType} network
 * @returns {ConsensusParams}
 */
export function getConsensusParametersByNetwork(network) {
  _assertNum(network);
  const ret = wasm.getConsensusParametersByNetwork(network);
  return ConsensusParams.__wrap(ret);
}

/**
 * find Consensus parameters for given Address
 * @category Wallet SDK
 * @param {Address} address
 * @returns {ConsensusParams}
 */
export function getConsensusParametersByAddress(address) {
  _assertClass(address, Address);
  if (address.__wbg_ptr === 0) {
    throw new Error("Attempt to use a moved value");
  }
  const ret = wasm.getConsensusParametersByAddress(address.__wbg_ptr);
  return ConsensusParams.__wrap(ret);
}

/**
 * @category Wallet SDK
 * @param {any} script_hash
 * @param {PrivateKey} privkey
 * @returns {string}
 */
export function signScriptHash(script_hash, privkey) {
  let deferred2_0;
  let deferred2_1;
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    _assertClass(privkey, PrivateKey);
    if (privkey.__wbg_ptr === 0) {
      throw new Error("Attempt to use a moved value");
    }
    wasm.signScriptHash(retptr, addHeapObject(script_hash), privkey.__wbg_ptr);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    var r3 = getInt32Memory0()[retptr / 4 + 3];
    var ptr1 = r0;
    var len1 = r1;
    if (r3) {
      ptr1 = 0;
      len1 = 0;
      throw takeObject(r2);
    }
    deferred2_0 = ptr1;
    deferred2_1 = len1;
    return getStringFromWasm0(ptr1, len1);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
    wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
  }
}

/**
 * `signTransaction()` is a helper function to sign a transaction using a private key array or a signer array.
 * @category Wallet SDK
 * @param {Transaction} tx
 * @param {(PrivateKey | HexString | Uint8Array)[]} signer
 * @param {boolean} verify_sig
 * @returns {Transaction}
 */
export function signTransaction(tx, signer, verify_sig) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    _assertClass(tx, Transaction);
    if (tx.__wbg_ptr === 0) {
      throw new Error("Attempt to use a moved value");
    }
    var ptr0 = tx.__destroy_into_raw();
    _assertBoolean(verify_sig);
    wasm.signTransaction(retptr, ptr0, addHeapObject(signer), verify_sig);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return Transaction.__wrap(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * Returns true if the script passed is a pay-to-script-hash (P2SH) format, false otherwise.
 * @param script - The script ({@link HexString} or Uint8Array).
 * @category Wallet SDK
 * @param {HexString | Uint8Array} script
 * @returns {boolean}
 */
export function isScriptPayToScriptHash(script) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.isScriptPayToScriptHash(retptr, addHeapObject(script));
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return r0 !== 0;
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * Returns returns true if the script passed is an ECDSA pay-to-pubkey.
 * @param script - The script ({@link HexString} or Uint8Array).
 * @category Wallet SDK
 * @param {HexString | Uint8Array} script
 * @returns {boolean}
 */
export function isScriptPayToPubkeyECDSA(script) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.isScriptPayToPubkeyECDSA(retptr, addHeapObject(script));
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return r0 !== 0;
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * Returns true if the script passed is a pay-to-pubkey.
 * @param script - The script ({@link HexString} or Uint8Array).
 * @category Wallet SDK
 * @param {HexString | Uint8Array} script
 * @returns {boolean}
 */
export function isScriptPayToPubkey(script) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.isScriptPayToPubkey(retptr, addHeapObject(script));
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return r0 !== 0;
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * Returns the address encoded in a script public key.
 * @param script_public_key - The script public key ({@link ScriptPublicKey}).
 * @param prefix - The address prefix.
 * @category Wallet SDK
 * @param {ScriptPublicKey | HexString} script_public_key
 * @param {NetworkType | NetworkId | string} network
 * @returns {Address | undefined}
 */
export function addressFromScriptPublicKey(script_public_key, network) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.addressFromScriptPublicKey(
      retptr,
      addHeapObject(script_public_key),
      addBorrowedObject(network),
    );
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return takeObject(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
    heap[stack_pointer++] = undefined;
  }
}

/**
 * Generates a signature script that fits a pay-to-script-hash script.
 * @param redeem_script - The redeem script ({@link HexString} or Uint8Array).
 * @param signature - The signature ({@link HexString} or Uint8Array).
 * @category Wallet SDK
 * @param {HexString | Uint8Array} redeem_script
 * @param {HexString | Uint8Array} signature
 * @returns {HexString}
 */
export function payToScriptHashSignatureScript(redeem_script, signature) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.payToScriptHashSignatureScript(
      retptr,
      addHeapObject(redeem_script),
      addHeapObject(signature),
    );
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return takeObject(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * Takes a script and returns an equivalent pay-to-script-hash script.
 * @param redeem_script - The redeem script ({@link HexString} or Uint8Array).
 * @category Wallet SDK
 * @param {HexString | Uint8Array} redeem_script
 * @returns {ScriptPublicKey}
 */
export function payToScriptHashScript(redeem_script) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.payToScriptHashScript(retptr, addHeapObject(redeem_script));
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return ScriptPublicKey.__wrap(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * Creates a new script to pay a transaction output to the specified address.
 * @category Wallet SDK
 * @param {Address | string} address
 * @returns {ScriptPublicKey}
 */
export function payToAddressScript(address) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.payToAddressScript(retptr, addHeapObject(address));
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return ScriptPublicKey.__wrap(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * Calculates target from difficulty, based on set_difficulty function on
 * <https://github.com/tmrlvi/kaspa-miner/blob/bf361d02a46c580f55f46b5dfa773477634a5753/src/client/stratum.rs#L375>
 * @category Mining
 * @param {number} difficulty
 * @returns {bigint}
 */
export function calculateTarget(difficulty) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    wasm.calculateTarget(retptr, difficulty);
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var r2 = getInt32Memory0()[retptr / 4 + 2];
    if (r2) {
      throw takeObject(r1);
    }
    return takeObject(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 * @category Wallet API
 */
export const AccountsDiscoveryKind = Object.freeze({ Bip44: 0, 0: "Bip44" });
/**
 *
 * Languages supported by BIP39.
 *
 * Presently only English is specified by the BIP39 standard.
 *
 * @see {@link Mnemonic}
 *
 * @category Wallet SDK
 */
export const Language = Object.freeze({
  /**
   * English is presently the only supported language
   */
  English: 0,
  0: "English",
});
/**
 * wRPC protocol encoding: `Borsh` or `JSON`
 * @category Transport
 */
export const Encoding = Object.freeze({
  Borsh: 0,
  0: "Borsh",
  SerdeJson: 1,
  1: "SerdeJson",
});
/**
 * `ConnectionStrategy` specifies how the WebSocket `async fn connect()`
 * function should behave during the first-time connectivity phase.
 * @category WebSocket
 */
export const ConnectStrategy = Object.freeze({
  /**
   * Continuously attempt to connect to the server. This behavior will
   * block `connect()` function until the connection is established.
   */
  Retry: 0,
  0: "Retry",
  /**
   * Causes `connect()` to return immediately if the first-time connection
   * has failed.
   */
  Fallback: 1,
  1: "Fallback",
});
/**
 * Kaspa Sighash types allowed by consensus
 * @see {@link signInput}
 * @category Consensus
 */
export const SighashType = Object.freeze({
  All: 0,
  0: "All",
  None: 1,
  1: "None",
  Single: 2,
  2: "Single",
  AllAnyOneCanPay: 3,
  3: "AllAnyOneCanPay",
  NoneAnyOneCanPay: 4,
  4: "NoneAnyOneCanPay",
  SingleAnyOneCanPay: 5,
  5: "SingleAnyOneCanPay",
});
/**
 * Kaspa Transaction Script Opcodes
 * @see {@link ScriptBuilder}
 * @category Consensus
 */
export const Opcodes = Object.freeze({
  OpFalse: 0,
  0: "OpFalse",
  OpData1: 1,
  1: "OpData1",
  OpData2: 2,
  2: "OpData2",
  OpData3: 3,
  3: "OpData3",
  OpData4: 4,
  4: "OpData4",
  OpData5: 5,
  5: "OpData5",
  OpData6: 6,
  6: "OpData6",
  OpData7: 7,
  7: "OpData7",
  OpData8: 8,
  8: "OpData8",
  OpData9: 9,
  9: "OpData9",
  OpData10: 10,
  10: "OpData10",
  OpData11: 11,
  11: "OpData11",
  OpData12: 12,
  12: "OpData12",
  OpData13: 13,
  13: "OpData13",
  OpData14: 14,
  14: "OpData14",
  OpData15: 15,
  15: "OpData15",
  OpData16: 16,
  16: "OpData16",
  OpData17: 17,
  17: "OpData17",
  OpData18: 18,
  18: "OpData18",
  OpData19: 19,
  19: "OpData19",
  OpData20: 20,
  20: "OpData20",
  OpData21: 21,
  21: "OpData21",
  OpData22: 22,
  22: "OpData22",
  OpData23: 23,
  23: "OpData23",
  OpData24: 24,
  24: "OpData24",
  OpData25: 25,
  25: "OpData25",
  OpData26: 26,
  26: "OpData26",
  OpData27: 27,
  27: "OpData27",
  OpData28: 28,
  28: "OpData28",
  OpData29: 29,
  29: "OpData29",
  OpData30: 30,
  30: "OpData30",
  OpData31: 31,
  31: "OpData31",
  OpData32: 32,
  32: "OpData32",
  OpData33: 33,
  33: "OpData33",
  OpData34: 34,
  34: "OpData34",
  OpData35: 35,
  35: "OpData35",
  OpData36: 36,
  36: "OpData36",
  OpData37: 37,
  37: "OpData37",
  OpData38: 38,
  38: "OpData38",
  OpData39: 39,
  39: "OpData39",
  OpData40: 40,
  40: "OpData40",
  OpData41: 41,
  41: "OpData41",
  OpData42: 42,
  42: "OpData42",
  OpData43: 43,
  43: "OpData43",
  OpData44: 44,
  44: "OpData44",
  OpData45: 45,
  45: "OpData45",
  OpData46: 46,
  46: "OpData46",
  OpData47: 47,
  47: "OpData47",
  OpData48: 48,
  48: "OpData48",
  OpData49: 49,
  49: "OpData49",
  OpData50: 50,
  50: "OpData50",
  OpData51: 51,
  51: "OpData51",
  OpData52: 52,
  52: "OpData52",
  OpData53: 53,
  53: "OpData53",
  OpData54: 54,
  54: "OpData54",
  OpData55: 55,
  55: "OpData55",
  OpData56: 56,
  56: "OpData56",
  OpData57: 57,
  57: "OpData57",
  OpData58: 58,
  58: "OpData58",
  OpData59: 59,
  59: "OpData59",
  OpData60: 60,
  60: "OpData60",
  OpData61: 61,
  61: "OpData61",
  OpData62: 62,
  62: "OpData62",
  OpData63: 63,
  63: "OpData63",
  OpData64: 64,
  64: "OpData64",
  OpData65: 65,
  65: "OpData65",
  OpData66: 66,
  66: "OpData66",
  OpData67: 67,
  67: "OpData67",
  OpData68: 68,
  68: "OpData68",
  OpData69: 69,
  69: "OpData69",
  OpData70: 70,
  70: "OpData70",
  OpData71: 71,
  71: "OpData71",
  OpData72: 72,
  72: "OpData72",
  OpData73: 73,
  73: "OpData73",
  OpData74: 74,
  74: "OpData74",
  OpData75: 75,
  75: "OpData75",
  OpPushData1: 76,
  76: "OpPushData1",
  OpPushData2: 77,
  77: "OpPushData2",
  OpPushData4: 78,
  78: "OpPushData4",
  Op1Negate: 79,
  79: "Op1Negate",
  OpReserved: 80,
  80: "OpReserved",
  OpTrue: 81,
  81: "OpTrue",
  Op2: 82,
  82: "Op2",
  Op3: 83,
  83: "Op3",
  Op4: 84,
  84: "Op4",
  Op5: 85,
  85: "Op5",
  Op6: 86,
  86: "Op6",
  Op7: 87,
  87: "Op7",
  Op8: 88,
  88: "Op8",
  Op9: 89,
  89: "Op9",
  Op10: 90,
  90: "Op10",
  Op11: 91,
  91: "Op11",
  Op12: 92,
  92: "Op12",
  Op13: 93,
  93: "Op13",
  Op14: 94,
  94: "Op14",
  Op15: 95,
  95: "Op15",
  Op16: 96,
  96: "Op16",
  OpNop: 97,
  97: "OpNop",
  OpVer: 98,
  98: "OpVer",
  OpIf: 99,
  99: "OpIf",
  OpNotIf: 100,
  100: "OpNotIf",
  OpVerIf: 101,
  101: "OpVerIf",
  OpVerNotIf: 102,
  102: "OpVerNotIf",
  OpElse: 103,
  103: "OpElse",
  OpEndIf: 104,
  104: "OpEndIf",
  OpVerify: 105,
  105: "OpVerify",
  OpReturn: 106,
  106: "OpReturn",
  OpToAltStack: 107,
  107: "OpToAltStack",
  OpFromAltStack: 108,
  108: "OpFromAltStack",
  Op2Drop: 109,
  109: "Op2Drop",
  Op2Dup: 110,
  110: "Op2Dup",
  Op3Dup: 111,
  111: "Op3Dup",
  Op2Over: 112,
  112: "Op2Over",
  Op2Rot: 113,
  113: "Op2Rot",
  Op2Swap: 114,
  114: "Op2Swap",
  OpIfDup: 115,
  115: "OpIfDup",
  OpDepth: 116,
  116: "OpDepth",
  OpDrop: 117,
  117: "OpDrop",
  OpDup: 118,
  118: "OpDup",
  OpNip: 119,
  119: "OpNip",
  OpOver: 120,
  120: "OpOver",
  OpPick: 121,
  121: "OpPick",
  OpRoll: 122,
  122: "OpRoll",
  OpRot: 123,
  123: "OpRot",
  OpSwap: 124,
  124: "OpSwap",
  OpTuck: 125,
  125: "OpTuck",
  /**
   * Splice opcodes.
   */
  OpCat: 126,
  126: "OpCat",
  OpSubStr: 127,
  127: "OpSubStr",
  OpLeft: 128,
  128: "OpLeft",
  OpRight: 129,
  129: "OpRight",
  OpSize: 130,
  130: "OpSize",
  /**
   * Bitwise logic opcodes.
   */
  OpInvert: 131,
  131: "OpInvert",
  OpAnd: 132,
  132: "OpAnd",
  OpOr: 133,
  133: "OpOr",
  OpXor: 134,
  134: "OpXor",
  OpEqual: 135,
  135: "OpEqual",
  OpEqualVerify: 136,
  136: "OpEqualVerify",
  OpReserved1: 137,
  137: "OpReserved1",
  OpReserved2: 138,
  138: "OpReserved2",
  /**
   * Numeric related opcodes.
   */
  Op1Add: 139,
  139: "Op1Add",
  Op1Sub: 140,
  140: "Op1Sub",
  Op2Mul: 141,
  141: "Op2Mul",
  Op2Div: 142,
  142: "Op2Div",
  OpNegate: 143,
  143: "OpNegate",
  OpAbs: 144,
  144: "OpAbs",
  OpNot: 145,
  145: "OpNot",
  Op0NotEqual: 146,
  146: "Op0NotEqual",
  OpAdd: 147,
  147: "OpAdd",
  OpSub: 148,
  148: "OpSub",
  OpMul: 149,
  149: "OpMul",
  OpDiv: 150,
  150: "OpDiv",
  OpMod: 151,
  151: "OpMod",
  OpLShift: 152,
  152: "OpLShift",
  OpRShift: 153,
  153: "OpRShift",
  OpBoolAnd: 154,
  154: "OpBoolAnd",
  OpBoolOr: 155,
  155: "OpBoolOr",
  OpNumEqual: 156,
  156: "OpNumEqual",
  OpNumEqualVerify: 157,
  157: "OpNumEqualVerify",
  OpNumNotEqual: 158,
  158: "OpNumNotEqual",
  OpLessThan: 159,
  159: "OpLessThan",
  OpGreaterThan: 160,
  160: "OpGreaterThan",
  OpLessThanOrEqual: 161,
  161: "OpLessThanOrEqual",
  OpGreaterThanOrEqual: 162,
  162: "OpGreaterThanOrEqual",
  OpMin: 163,
  163: "OpMin",
  OpMax: 164,
  164: "OpMax",
  OpWithin: 165,
  165: "OpWithin",
  /**
   * Undefined opcodes.
   */
  OpUnknown166: 166,
  166: "OpUnknown166",
  OpUnknown167: 167,
  167: "OpUnknown167",
  /**
   * Crypto opcodes.
   */
  OpSHA256: 168,
  168: "OpSHA256",
  OpCheckMultiSigECDSA: 169,
  169: "OpCheckMultiSigECDSA",
  OpBlake2b: 170,
  170: "OpBlake2b",
  OpCheckSigECDSA: 171,
  171: "OpCheckSigECDSA",
  OpCheckSig: 172,
  172: "OpCheckSig",
  OpCheckSigVerify: 173,
  173: "OpCheckSigVerify",
  OpCheckMultiSig: 174,
  174: "OpCheckMultiSig",
  OpCheckMultiSigVerify: 175,
  175: "OpCheckMultiSigVerify",
  OpCheckLockTimeVerify: 176,
  176: "OpCheckLockTimeVerify",
  OpCheckSequenceVerify: 177,
  177: "OpCheckSequenceVerify",
  /**
   * Undefined opcodes.
   */
  OpUnknown178: 178,
  178: "OpUnknown178",
  OpUnknown179: 179,
  179: "OpUnknown179",
  OpUnknown180: 180,
  180: "OpUnknown180",
  OpUnknown181: 181,
  181: "OpUnknown181",
  OpUnknown182: 182,
  182: "OpUnknown182",
  OpUnknown183: 183,
  183: "OpUnknown183",
  OpUnknown184: 184,
  184: "OpUnknown184",
  OpUnknown185: 185,
  185: "OpUnknown185",
  OpUnknown186: 186,
  186: "OpUnknown186",
  OpUnknown187: 187,
  187: "OpUnknown187",
  OpUnknown188: 188,
  188: "OpUnknown188",
  OpUnknown189: 189,
  189: "OpUnknown189",
  OpUnknown190: 190,
  190: "OpUnknown190",
  OpUnknown191: 191,
  191: "OpUnknown191",
  OpUnknown192: 192,
  192: "OpUnknown192",
  OpUnknown193: 193,
  193: "OpUnknown193",
  OpUnknown194: 194,
  194: "OpUnknown194",
  OpUnknown195: 195,
  195: "OpUnknown195",
  OpUnknown196: 196,
  196: "OpUnknown196",
  OpUnknown197: 197,
  197: "OpUnknown197",
  OpUnknown198: 198,
  198: "OpUnknown198",
  OpUnknown199: 199,
  199: "OpUnknown199",
  OpUnknown200: 200,
  200: "OpUnknown200",
  OpUnknown201: 201,
  201: "OpUnknown201",
  OpUnknown202: 202,
  202: "OpUnknown202",
  OpUnknown203: 203,
  203: "OpUnknown203",
  OpUnknown204: 204,
  204: "OpUnknown204",
  OpUnknown205: 205,
  205: "OpUnknown205",
  OpUnknown206: 206,
  206: "OpUnknown206",
  OpUnknown207: 207,
  207: "OpUnknown207",
  OpUnknown208: 208,
  208: "OpUnknown208",
  OpUnknown209: 209,
  209: "OpUnknown209",
  OpUnknown210: 210,
  210: "OpUnknown210",
  OpUnknown211: 211,
  211: "OpUnknown211",
  OpUnknown212: 212,
  212: "OpUnknown212",
  OpUnknown213: 213,
  213: "OpUnknown213",
  OpUnknown214: 214,
  214: "OpUnknown214",
  OpUnknown215: 215,
  215: "OpUnknown215",
  OpUnknown216: 216,
  216: "OpUnknown216",
  OpUnknown217: 217,
  217: "OpUnknown217",
  OpUnknown218: 218,
  218: "OpUnknown218",
  OpUnknown219: 219,
  219: "OpUnknown219",
  OpUnknown220: 220,
  220: "OpUnknown220",
  OpUnknown221: 221,
  221: "OpUnknown221",
  OpUnknown222: 222,
  222: "OpUnknown222",
  OpUnknown223: 223,
  223: "OpUnknown223",
  OpUnknown224: 224,
  224: "OpUnknown224",
  OpUnknown225: 225,
  225: "OpUnknown225",
  OpUnknown226: 226,
  226: "OpUnknown226",
  OpUnknown227: 227,
  227: "OpUnknown227",
  OpUnknown228: 228,
  228: "OpUnknown228",
  OpUnknown229: 229,
  229: "OpUnknown229",
  OpUnknown230: 230,
  230: "OpUnknown230",
  OpUnknown231: 231,
  231: "OpUnknown231",
  OpUnknown232: 232,
  232: "OpUnknown232",
  OpUnknown233: 233,
  233: "OpUnknown233",
  OpUnknown234: 234,
  234: "OpUnknown234",
  OpUnknown235: 235,
  235: "OpUnknown235",
  OpUnknown236: 236,
  236: "OpUnknown236",
  OpUnknown237: 237,
  237: "OpUnknown237",
  OpUnknown238: 238,
  238: "OpUnknown238",
  OpUnknown239: 239,
  239: "OpUnknown239",
  OpUnknown240: 240,
  240: "OpUnknown240",
  OpUnknown241: 241,
  241: "OpUnknown241",
  OpUnknown242: 242,
  242: "OpUnknown242",
  OpUnknown243: 243,
  243: "OpUnknown243",
  OpUnknown244: 244,
  244: "OpUnknown244",
  OpUnknown245: 245,
  245: "OpUnknown245",
  OpUnknown246: 246,
  246: "OpUnknown246",
  OpUnknown247: 247,
  247: "OpUnknown247",
  OpUnknown248: 248,
  248: "OpUnknown248",
  OpUnknown249: 249,
  249: "OpUnknown249",
  OpSmallInteger: 250,
  250: "OpSmallInteger",
  OpPubKeys: 251,
  251: "OpPubKeys",
  OpUnknown252: 252,
  252: "OpUnknown252",
  OpPubKeyHash: 253,
  253: "OpPubKeyHash",
  OpPubKey: 254,
  254: "OpPubKey",
  OpInvalidOpCode: 255,
  255: "OpInvalidOpCode",
});
/**
 *
 * @see {@link IFees}, {@link IGeneratorSettingsObject}, {@link Generator}, {@link estimateTransactions}, {@link createTransactions}
 * @category Wallet SDK
 */
export const FeeSource = Object.freeze({
  SenderPays: 0,
  0: "SenderPays",
  ReceiverPays: 1,
  1: "ReceiverPays",
});
/**
 * @category Consensus
 */
export const NetworkType = Object.freeze({
  Mainnet: 0,
  0: "Mainnet",
  Testnet: 1,
  1: "Testnet",
  Devnet: 2,
  2: "Devnet",
  Simnet: 3,
  3: "Simnet",
});
/**
 * Specifies the type of an account address to create.
 * The address can bea receive address or a change address.
 *
 * @category Wallet API
 */
export const NewAddressKind = Object.freeze({
  Receive: 0,
  0: "Receive",
  Change: 1,
  1: "Change",
});
/**
 *
 *  Kaspa `Address` version (`PubKey`, `PubKey ECDSA`, `ScriptHash`)
 *
 * @category Address
 */
export const AddressVersion = Object.freeze({
  /**
   * PubKey addresses always have the version byte set to 0
   */
  PubKey: 0,
  0: "PubKey",
  /**
   * PubKey ECDSA addresses always have the version byte set to 1
   */
  PubKeyECDSA: 1,
  1: "PubKeyECDSA",
  /**
   * ScriptHash addresses always have the version byte set to 8
   */
  ScriptHash: 8,
  8: "ScriptHash",
});

const AbortableFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_abortable_free(ptr >>> 0));

/**
 *
 * Abortable trigger wraps an `Arc<AtomicBool>`, which can be cloned
 * to signal task terminating using an atomic bool.
 *
 * ```
 * let abortable = Abortable::default();
 * let result = my_task(abortable).await?;
 * // ... elsewhere
 * abortable.abort();
 * ```
 *
 * @category General
 */
export class Abortable {
  static __unwrap(jsValue) {
    if (!(jsValue instanceof Abortable)) {
      return 0;
    }
    return jsValue.__destroy_into_raw();
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    AbortableFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_abortable_free(ptr);
  }

  /**
   */
  constructor() {
    const ret = wasm.abortable_new();
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * @returns {boolean}
   */
  isAborted() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.abortable_isAborted(this.__wbg_ptr);
    return ret !== 0;
  }

  /**
   */
  abort() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.abortable_abort(this.__wbg_ptr);
  }

  /**
   */
  check() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.abortable_check(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   */
  reset() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.abortable_reset(this.__wbg_ptr);
  }
}

const AbortedFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_aborted_free(ptr >>> 0));

/**
 * Error emitted by [`Abortable`].
 * @category General
 */
export class Aborted {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Aborted.prototype);
    obj.__wbg_ptr = ptr;
    AbortedFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    AbortedFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_aborted_free(ptr);
  }
}

const AccountFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_account_free(ptr >>> 0));

/**
 *
 * The `Account` class is a wallet account that can be used to send and receive payments.
 *
 *
 *  @category Wallet API
 */
export class Account {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Account.prototype);
    obj.__wbg_ptr = ptr;
    AccountFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      balance: this.balance,
      type: this.type,
      receiveAddress: this.receiveAddress,
      changeAddress: this.changeAddress,
      context: this.context,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    AccountFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_account_free(ptr);
  }

  /**
   * @param {any} js_value
   * @returns {Account}
   */
  static ctor(js_value) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.account_ctor(retptr, addHeapObject(js_value));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Account.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @returns {any}
   */
  get balance() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.account_balance(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {string}
   */
  get type() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.account_type(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @param {NetworkType | NetworkId | string} network_type
   * @returns {any}
   */
  balanceStrings(network_type) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.account_balanceStrings(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(network_type),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @returns {string}
   */
  get receiveAddress() {
    let deferred2_0;
    let deferred2_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.account_receiveAddress(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr1 = r0;
      var len1 = r1;
      if (r3) {
        ptr1 = 0;
        len1 = 0;
        throw takeObject(r2);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }

  /**
   * @returns {string}
   */
  get changeAddress() {
    let deferred2_0;
    let deferred2_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.account_changeAddress(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr1 = r0;
      var len1 = r1;
      if (r3) {
        ptr1 = 0;
        len1 = 0;
        throw takeObject(r2);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }

  /**
   * @returns {Promise<Address>}
   */
  deriveReceiveAddress() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.account_deriveReceiveAddress(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {Promise<Address>}
   */
  deriveChangeAddress() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.account_deriveChangeAddress(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {Promise<void>}
   */
  scan() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.account_scan(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {any} js_value
   * @returns {Promise<any>}
   */
  send(js_value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.account_send(this.__wbg_ptr, addHeapObject(js_value));
    return takeObject(ret);
  }

  /**
   * @returns {UtxoContext}
   */
  get context() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.__wbg_get_account_context(this.__wbg_ptr);
    return UtxoContext.__wrap(ret);
  }

  /**
   * @param {UtxoContext} arg0
   */
  set context(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertClass(arg0, UtxoContext);
    if (arg0.__wbg_ptr === 0) {
      throw new Error("Attempt to use a moved value");
    }
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_account_context(this.__wbg_ptr, ptr0);
  }
}

const AccountKindFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_accountkind_free(ptr >>> 0));

/**
 * @category Wallet SDK
 */
export class AccountKind {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(AccountKind.prototype);
    obj.__wbg_ptr = ptr;
    AccountKindFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    AccountKindFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_accountkind_free(ptr);
  }

  /**
   * @param {string} kind
   */
  constructor(kind) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        kind,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.accountkind_ctor(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @returns {string}
   */
  toString() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.accountkind_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
}

const AddressFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_address_free(ptr >>> 0));

/**
 * Kaspa `Address` struct that serializes to and from an address format string: `kaspa:qz0s...t8cv`.
 * @category Address
 */
export class Address {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Address.prototype);
    obj.__wbg_ptr = ptr;
    AddressFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      version: this.version,
      prefix: this.prefix,
      payload: this.payload,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    AddressFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_address_free(ptr);
  }

  /**
   * @param {string} address
   */
  constructor(address) {
    const ptr0 = passStringToWasm0(
      address,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.address_constructor(ptr0, len0);
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * @param {string} address
   * @returns {boolean}
   */
  static validate(address) {
    const ptr0 = passStringToWasm0(
      address,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.address_validate(ptr0, len0);
    return ret !== 0;
  }

  /**
   * Convert an address to a string.
   * @returns {string}
   */
  toString() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.address_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @returns {string}
   */
  get version() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.address_version(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @returns {string}
   */
  get prefix() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.address_prefix(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @param {string} prefix
   */
  set setPrefix(prefix) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      prefix,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.address_set_setPrefix(this.__wbg_ptr, ptr0, len0);
  }

  /**
   * @returns {string}
   */
  get payload() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.address_payload(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @param {number} n
   * @returns {string}
   */
  short(n) {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(n);
      wasm.address_short(retptr, this.__wbg_ptr, n);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
}

const AgentConstructorOptionsFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_agentconstructoroptions_free(ptr >>> 0),
      );

/**
 */
export class AgentConstructorOptions {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    AgentConstructorOptionsFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_agentconstructoroptions_free(ptr);
  }

  /**
   * @returns {number}
   */
  get keep_alive_msecs() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.agentconstructoroptions_keep_alive_msecs(this.__wbg_ptr);
    return ret;
  }

  /**
   * @param {number} value
   */
  set keep_alive_msecs(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.agentconstructoroptions_set_keep_alive_msecs(this.__wbg_ptr, value);
  }

  /**
   * @returns {boolean}
   */
  get keep_alive() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.agentconstructoroptions_keep_alive(this.__wbg_ptr);
    return ret !== 0;
  }

  /**
   * @param {boolean} value
   */
  set keep_alive(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertBoolean(value);
    wasm.agentconstructoroptions_set_keep_alive(this.__wbg_ptr, value);
  }

  /**
   * @returns {number}
   */
  get max_free_sockets() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.agentconstructoroptions_max_free_sockets(this.__wbg_ptr);
    return ret;
  }

  /**
   * @param {number} value
   */
  set max_free_sockets(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.agentconstructoroptions_set_max_free_sockets(this.__wbg_ptr, value);
  }

  /**
   * @returns {number}
   */
  get max_sockets() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.agentconstructoroptions_max_sockets(this.__wbg_ptr);
    return ret;
  }

  /**
   * @param {number} value
   */
  set max_sockets(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.agentconstructoroptions_set_max_sockets(this.__wbg_ptr, value);
  }

  /**
   * @returns {number}
   */
  get timeout() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.agentconstructoroptions_timeout(this.__wbg_ptr);
    return ret;
  }

  /**
   * @param {number} value
   */
  set timeout(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.agentconstructoroptions_set_timeout(this.__wbg_ptr, value);
  }
}

const AppendFileOptionsFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_appendfileoptions_free(ptr >>> 0),
      );

/**
 */
export class AppendFileOptions {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(AppendFileOptions.prototype);
    obj.__wbg_ptr = ptr;
    AppendFileOptionsFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    AppendFileOptionsFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_appendfileoptions_free(ptr);
  }

  /**
   * @param {string | undefined} [encoding]
   * @param {number | undefined} [mode]
   * @param {string | undefined} [flag]
   */
  constructor(encoding, mode, flag) {
    if (!isLikeNone(mode)) {
      _assertNum(mode);
    }
    const ret = wasm.appendfileoptions_new_with_values(
      isLikeNone(encoding) ? 0 : addHeapObject(encoding),
      !isLikeNone(mode),
      isLikeNone(mode) ? 0 : mode,
      isLikeNone(flag) ? 0 : addHeapObject(flag),
    );
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * @returns {AppendFileOptions}
   */
  static new() {
    const ret = wasm.appendfileoptions_new();
    return AppendFileOptions.__wrap(ret);
  }

  /**
   * @returns {string | undefined}
   */
  get encoding() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.appendfileoptions_encoding(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {string | undefined} [value]
   */
  set encoding(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.appendfileoptions_set_encoding(
      this.__wbg_ptr,
      isLikeNone(value) ? 0 : addHeapObject(value),
    );
  }

  /**
   * @returns {number | undefined}
   */
  get mode() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.appendfileoptions_mode(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      return r0 === 0 ? undefined : r1 >>> 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {number | undefined} [value]
   */
  set mode(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    if (!isLikeNone(value)) {
      _assertNum(value);
    }
    wasm.appendfileoptions_set_mode(
      this.__wbg_ptr,
      !isLikeNone(value),
      isLikeNone(value) ? 0 : value,
    );
  }

  /**
   * @returns {string | undefined}
   */
  get flag() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.appendfileoptions_flag(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {string | undefined} [value]
   */
  set flag(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.appendfileoptions_set_flag(
      this.__wbg_ptr,
      isLikeNone(value) ? 0 : addHeapObject(value),
    );
  }
}

const AssertionErrorOptionsFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_assertionerroroptions_free(ptr >>> 0),
      );

/**
 */
export class AssertionErrorOptions {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    AssertionErrorOptionsFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_assertionerroroptions_free(ptr);
  }

  /**
   * @param {string | undefined} message
   * @param {any} actual
   * @param {any} expected
   * @param {string} operator
   */
  constructor(message, actual, expected, operator) {
    const ret = wasm.assertionerroroptions_new(
      isLikeNone(message) ? 0 : addHeapObject(message),
      addHeapObject(actual),
      addHeapObject(expected),
      addHeapObject(operator),
    );
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * If provided, the error message is set to this value.
   * @returns {string | undefined}
   */
  get message() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.assertionerroroptions_message(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {string | undefined} [value]
   */
  set message(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.assertionerroroptions_set_message(
      this.__wbg_ptr,
      isLikeNone(value) ? 0 : addHeapObject(value),
    );
  }

  /**
   * The actual property on the error instance.
   * @returns {any}
   */
  get actual() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.assertionerroroptions_actual(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {any} value
   */
  set actual(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.assertionerroroptions_set_actual(this.__wbg_ptr, addHeapObject(value));
  }

  /**
   * The expected property on the error instance.
   * @returns {any}
   */
  get expected() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.assertionerroroptions_expected(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {any} value
   */
  set expected(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.assertionerroroptions_set_expected(
      this.__wbg_ptr,
      addHeapObject(value),
    );
  }

  /**
   * The operator property on the error instance.
   * @returns {string}
   */
  get operator() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.assertionerroroptions_operator(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {string} value
   */
  set operator(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.assertionerroroptions_set_operator(
      this.__wbg_ptr,
      addHeapObject(value),
    );
  }
}

const BalanceFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_balance_free(ptr >>> 0));

/**
 *
 * Represents a {@link UtxoContext} (account) balance.
 *
 * @see {@link IBalance}, {@link UtxoContext}
 *
 * @category Wallet SDK
 */
export class Balance {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Balance.prototype);
    obj.__wbg_ptr = ptr;
    BalanceFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    BalanceFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_balance_free(ptr);
  }

  /**
   * Confirmed amount of funds available for spending.
   * @returns {bigint}
   */
  get mature() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.balance_mature(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * Amount of funds that are being received and are not yet confirmed.
   * @returns {bigint}
   */
  get pending() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.balance_pending(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * Amount of funds that are being send and are not yet accepted by the network.
   * @returns {bigint}
   */
  get outgoing() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.balance_outgoing(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {NetworkType | NetworkId | string} network_type
   * @returns {BalanceStrings}
   */
  toBalanceStrings(network_type) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.balance_toBalanceStrings(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(network_type),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return BalanceStrings.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }
}

const BalanceStringsFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_balancestrings_free(ptr >>> 0),
      );

/**
 *
 * Formatted string representation of the {@link Balance}.
 *
 * The value is formatted as `123,456.789`.
 *
 * @category Wallet SDK
 */
export class BalanceStrings {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(BalanceStrings.prototype);
    obj.__wbg_ptr = ptr;
    BalanceStringsFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    BalanceStringsFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_balancestrings_free(ptr);
  }

  /**
   * @returns {string}
   */
  get mature() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.balancestrings_mature(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @returns {string | undefined}
   */
  get pending() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.balancestrings_pending(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      let v1;
      if (r0 !== 0) {
        v1 = getStringFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1, 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}

const ConsensusParamsFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_consensusparams_free(ptr >>> 0),
      );

/**
 * @category Wallet SDK
 */
export class ConsensusParams {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(ConsensusParams.prototype);
    obj.__wbg_ptr = ptr;
    ConsensusParamsFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    ConsensusParamsFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_consensusparams_free(ptr);
  }
}

const ConsoleConstructorOptionsFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_consoleconstructoroptions_free(ptr >>> 0),
      );

/**
 */
export class ConsoleConstructorOptions {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(ConsoleConstructorOptions.prototype);
    obj.__wbg_ptr = ptr;
    ConsoleConstructorOptionsFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    ConsoleConstructorOptionsFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_consoleconstructoroptions_free(ptr);
  }

  /**
   * @param {any} stdout
   * @param {any} stderr
   * @param {boolean | undefined} ignore_errors
   * @param {any} color_mod
   * @param {object | undefined} [inspect_options]
   */
  constructor(stdout, stderr, ignore_errors, color_mod, inspect_options) {
    if (!isLikeNone(ignore_errors)) {
      _assertBoolean(ignore_errors);
    }
    const ret = wasm.consoleconstructoroptions_new_with_values(
      addHeapObject(stdout),
      addHeapObject(stderr),
      isLikeNone(ignore_errors) ? 0xffffff : ignore_errors ? 1 : 0,
      addHeapObject(color_mod),
      isLikeNone(inspect_options) ? 0 : addHeapObject(inspect_options),
    );
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * @param {any} stdout
   * @param {any} stderr
   * @returns {ConsoleConstructorOptions}
   */
  static new(stdout, stderr) {
    const ret = wasm.consoleconstructoroptions_new(
      addHeapObject(stdout),
      addHeapObject(stderr),
    );
    return ConsoleConstructorOptions.__wrap(ret);
  }

  /**
   * @returns {any}
   */
  get stdout() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.consoleconstructoroptions_stdout(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {any} value
   */
  set stdout(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.consoleconstructoroptions_set_stdout(
      this.__wbg_ptr,
      addHeapObject(value),
    );
  }

  /**
   * @returns {any}
   */
  get stderr() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.consoleconstructoroptions_stderr(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {any} value
   */
  set stderr(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.consoleconstructoroptions_set_stderr(
      this.__wbg_ptr,
      addHeapObject(value),
    );
  }

  /**
   * @returns {boolean | undefined}
   */
  get ignore_errors() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.consoleconstructoroptions_ignore_errors(this.__wbg_ptr);
    return ret === 0xffffff ? undefined : ret !== 0;
  }

  /**
   * @param {boolean | undefined} [value]
   */
  set ignore_errors(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    if (!isLikeNone(value)) {
      _assertBoolean(value);
    }
    wasm.consoleconstructoroptions_set_ignore_errors(
      this.__wbg_ptr,
      isLikeNone(value) ? 0xffffff : value ? 1 : 0,
    );
  }

  /**
   * @returns {any}
   */
  get color_mod() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.consoleconstructoroptions_color_mod(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {any} value
   */
  set color_mod(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.consoleconstructoroptions_set_color_mod(
      this.__wbg_ptr,
      addHeapObject(value),
    );
  }

  /**
   * @returns {object | undefined}
   */
  get inspect_options() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.consoleconstructoroptions_inspect_options(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {object | undefined} [value]
   */
  set inspect_options(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.consoleconstructoroptions_set_inspect_options(
      this.__wbg_ptr,
      isLikeNone(value) ? 0 : addHeapObject(value),
    );
  }
}

const CreateHookCallbacksFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_createhookcallbacks_free(ptr >>> 0),
      );

/**
 */
export class CreateHookCallbacks {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    CreateHookCallbacksFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_createhookcallbacks_free(ptr);
  }

  /**
   * @param {Function} init
   * @param {Function} before
   * @param {Function} after
   * @param {Function} destroy
   * @param {Function} promise_resolve
   */
  constructor(init, before, after, destroy, promise_resolve) {
    try {
      const ret = wasm.createhookcallbacks_new(
        addBorrowedObject(init),
        addBorrowedObject(before),
        addBorrowedObject(after),
        addBorrowedObject(destroy),
        addBorrowedObject(promise_resolve),
      );
      this.__wbg_ptr = ret >>> 0;
      return this;
    } finally {
      heap[stack_pointer++] = undefined;
      heap[stack_pointer++] = undefined;
      heap[stack_pointer++] = undefined;
      heap[stack_pointer++] = undefined;
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @returns {Function}
   */
  get init() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.createhookcallbacks_init(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {Function} value
   */
  set init(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.createhookcallbacks_set_init(this.__wbg_ptr, addHeapObject(value));
  }

  /**
   * @returns {Function}
   */
  get before() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.createhookcallbacks_before(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {Function} value
   */
  set before(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.createhookcallbacks_set_before(this.__wbg_ptr, addHeapObject(value));
  }

  /**
   * @returns {Function}
   */
  get after() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.createhookcallbacks_after(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {Function} value
   */
  set after(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.createhookcallbacks_set_after(this.__wbg_ptr, addHeapObject(value));
  }

  /**
   * @returns {Function}
   */
  get destroy() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.createhookcallbacks_destroy(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {Function} value
   */
  set destroy(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.createhookcallbacks_set_destroy(this.__wbg_ptr, addHeapObject(value));
  }

  /**
   * @returns {Function}
   */
  get promise_resolve() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.createhookcallbacks_promise_resolve(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {Function} value
   */
  set promise_resolve(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.createhookcallbacks_set_promise_resolve(
      this.__wbg_ptr,
      addHeapObject(value),
    );
  }
}

const CreateReadStreamOptionsFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_createreadstreamoptions_free(ptr >>> 0),
      );

/**
 */
export class CreateReadStreamOptions {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    CreateReadStreamOptionsFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_createreadstreamoptions_free(ptr);
  }

  /**
   * @param {boolean | undefined} [auto_close]
   * @param {boolean | undefined} [emit_close]
   * @param {string | undefined} [encoding]
   * @param {number | undefined} [end]
   * @param {number | undefined} [fd]
   * @param {string | undefined} [flags]
   * @param {number | undefined} [high_water_mark]
   * @param {number | undefined} [mode]
   * @param {number | undefined} [start]
   */
  constructor(
    auto_close,
    emit_close,
    encoding,
    end,
    fd,
    flags,
    high_water_mark,
    mode,
    start,
  ) {
    if (!isLikeNone(auto_close)) {
      _assertBoolean(auto_close);
    }
    if (!isLikeNone(emit_close)) {
      _assertBoolean(emit_close);
    }
    if (!isLikeNone(end)) {
      _assertNum(end);
    }
    if (!isLikeNone(fd)) {
      _assertNum(fd);
    }
    if (!isLikeNone(high_water_mark)) {
      _assertNum(high_water_mark);
    }
    if (!isLikeNone(mode)) {
      _assertNum(mode);
    }
    if (!isLikeNone(start)) {
      _assertNum(start);
    }
    const ret = wasm.createreadstreamoptions_new_with_values(
      isLikeNone(auto_close) ? 0xffffff : auto_close ? 1 : 0,
      isLikeNone(emit_close) ? 0xffffff : emit_close ? 1 : 0,
      isLikeNone(encoding) ? 0 : addHeapObject(encoding),
      !isLikeNone(end),
      isLikeNone(end) ? 0 : end,
      !isLikeNone(fd),
      isLikeNone(fd) ? 0 : fd,
      isLikeNone(flags) ? 0 : addHeapObject(flags),
      !isLikeNone(high_water_mark),
      isLikeNone(high_water_mark) ? 0 : high_water_mark,
      !isLikeNone(mode),
      isLikeNone(mode) ? 0 : mode,
      !isLikeNone(start),
      isLikeNone(start) ? 0 : start,
    );
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * @returns {boolean | undefined}
   */
  get auto_close() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.createreadstreamoptions_auto_close(this.__wbg_ptr);
    return ret === 0xffffff ? undefined : ret !== 0;
  }

  /**
   * @param {boolean | undefined} [value]
   */
  set auto_close(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    if (!isLikeNone(value)) {
      _assertBoolean(value);
    }
    wasm.createreadstreamoptions_set_auto_close(
      this.__wbg_ptr,
      isLikeNone(value) ? 0xffffff : value ? 1 : 0,
    );
  }

  /**
   * @returns {boolean | undefined}
   */
  get emit_close() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.createreadstreamoptions_emit_close(this.__wbg_ptr);
    return ret === 0xffffff ? undefined : ret !== 0;
  }

  /**
   * @param {boolean | undefined} [value]
   */
  set emit_close(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    if (!isLikeNone(value)) {
      _assertBoolean(value);
    }
    wasm.createreadstreamoptions_set_emit_close(
      this.__wbg_ptr,
      isLikeNone(value) ? 0xffffff : value ? 1 : 0,
    );
  }

  /**
   * @returns {string | undefined}
   */
  get encoding() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.createreadstreamoptions_encoding(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {string | undefined} [value]
   */
  set encoding(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.createreadstreamoptions_set_encoding(
      this.__wbg_ptr,
      isLikeNone(value) ? 0 : addHeapObject(value),
    );
  }

  /**
   * @returns {number | undefined}
   */
  get end() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.createreadstreamoptions_end(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r2 = getFloat64Memory0()[retptr / 8 + 1];
      return r0 === 0 ? undefined : r2;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {number | undefined} [value]
   */
  set end(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    if (!isLikeNone(value)) {
      _assertNum(value);
    }
    wasm.createreadstreamoptions_set_end(
      this.__wbg_ptr,
      !isLikeNone(value),
      isLikeNone(value) ? 0 : value,
    );
  }

  /**
   * @returns {number | undefined}
   */
  get fd() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.createreadstreamoptions_fd(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      return r0 === 0 ? undefined : r1 >>> 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {number | undefined} [value]
   */
  set fd(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    if (!isLikeNone(value)) {
      _assertNum(value);
    }
    wasm.createreadstreamoptions_set_fd(
      this.__wbg_ptr,
      !isLikeNone(value),
      isLikeNone(value) ? 0 : value,
    );
  }

  /**
   * @returns {string | undefined}
   */
  get flags() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.createreadstreamoptions_flags(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {string | undefined} [value]
   */
  set flags(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.createreadstreamoptions_set_flags(
      this.__wbg_ptr,
      isLikeNone(value) ? 0 : addHeapObject(value),
    );
  }

  /**
   * @returns {number | undefined}
   */
  get high_water_mark() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.createreadstreamoptions_high_water_mark(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r2 = getFloat64Memory0()[retptr / 8 + 1];
      return r0 === 0 ? undefined : r2;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {number | undefined} [value]
   */
  set high_water_mark(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    if (!isLikeNone(value)) {
      _assertNum(value);
    }
    wasm.createreadstreamoptions_set_high_water_mark(
      this.__wbg_ptr,
      !isLikeNone(value),
      isLikeNone(value) ? 0 : value,
    );
  }

  /**
   * @returns {number | undefined}
   */
  get mode() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.createreadstreamoptions_mode(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      return r0 === 0 ? undefined : r1 >>> 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {number | undefined} [value]
   */
  set mode(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    if (!isLikeNone(value)) {
      _assertNum(value);
    }
    wasm.createreadstreamoptions_set_mode(
      this.__wbg_ptr,
      !isLikeNone(value),
      isLikeNone(value) ? 0 : value,
    );
  }

  /**
   * @returns {number | undefined}
   */
  get start() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.createreadstreamoptions_start(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r2 = getFloat64Memory0()[retptr / 8 + 1];
      return r0 === 0 ? undefined : r2;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {number | undefined} [value]
   */
  set start(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    if (!isLikeNone(value)) {
      _assertNum(value);
    }
    wasm.createreadstreamoptions_set_start(
      this.__wbg_ptr,
      !isLikeNone(value),
      isLikeNone(value) ? 0 : value,
    );
  }
}

const CreateWriteStreamOptionsFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_createwritestreamoptions_free(ptr >>> 0),
      );

/**
 */
export class CreateWriteStreamOptions {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    CreateWriteStreamOptionsFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_createwritestreamoptions_free(ptr);
  }

  /**
   * @param {boolean | undefined} [auto_close]
   * @param {boolean | undefined} [emit_close]
   * @param {string | undefined} [encoding]
   * @param {number | undefined} [fd]
   * @param {string | undefined} [flags]
   * @param {number | undefined} [mode]
   * @param {number | undefined} [start]
   */
  constructor(auto_close, emit_close, encoding, fd, flags, mode, start) {
    if (!isLikeNone(auto_close)) {
      _assertBoolean(auto_close);
    }
    if (!isLikeNone(emit_close)) {
      _assertBoolean(emit_close);
    }
    if (!isLikeNone(fd)) {
      _assertNum(fd);
    }
    if (!isLikeNone(mode)) {
      _assertNum(mode);
    }
    if (!isLikeNone(start)) {
      _assertNum(start);
    }
    const ret = wasm.createwritestreamoptions_new_with_values(
      isLikeNone(auto_close) ? 0xffffff : auto_close ? 1 : 0,
      isLikeNone(emit_close) ? 0xffffff : emit_close ? 1 : 0,
      isLikeNone(encoding) ? 0 : addHeapObject(encoding),
      !isLikeNone(fd),
      isLikeNone(fd) ? 0 : fd,
      isLikeNone(flags) ? 0 : addHeapObject(flags),
      !isLikeNone(mode),
      isLikeNone(mode) ? 0 : mode,
      !isLikeNone(start),
      isLikeNone(start) ? 0 : start,
    );
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * @returns {boolean | undefined}
   */
  get auto_close() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.createwritestreamoptions_auto_close(this.__wbg_ptr);
    return ret === 0xffffff ? undefined : ret !== 0;
  }

  /**
   * @param {boolean | undefined} [value]
   */
  set auto_close(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    if (!isLikeNone(value)) {
      _assertBoolean(value);
    }
    wasm.createwritestreamoptions_set_auto_close(
      this.__wbg_ptr,
      isLikeNone(value) ? 0xffffff : value ? 1 : 0,
    );
  }

  /**
   * @returns {boolean | undefined}
   */
  get emit_close() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.createwritestreamoptions_emit_close(this.__wbg_ptr);
    return ret === 0xffffff ? undefined : ret !== 0;
  }

  /**
   * @param {boolean | undefined} [value]
   */
  set emit_close(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    if (!isLikeNone(value)) {
      _assertBoolean(value);
    }
    wasm.createwritestreamoptions_set_emit_close(
      this.__wbg_ptr,
      isLikeNone(value) ? 0xffffff : value ? 1 : 0,
    );
  }

  /**
   * @returns {string | undefined}
   */
  get encoding() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.createwritestreamoptions_encoding(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {string | undefined} [value]
   */
  set encoding(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.createwritestreamoptions_set_encoding(
      this.__wbg_ptr,
      isLikeNone(value) ? 0 : addHeapObject(value),
    );
  }

  /**
   * @returns {number | undefined}
   */
  get fd() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.createwritestreamoptions_fd(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      return r0 === 0 ? undefined : r1 >>> 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {number | undefined} [value]
   */
  set fd(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    if (!isLikeNone(value)) {
      _assertNum(value);
    }
    wasm.createwritestreamoptions_set_fd(
      this.__wbg_ptr,
      !isLikeNone(value),
      isLikeNone(value) ? 0 : value,
    );
  }

  /**
   * @returns {string | undefined}
   */
  get flags() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.createwritestreamoptions_flags(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {string | undefined} [value]
   */
  set flags(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.createwritestreamoptions_set_flags(
      this.__wbg_ptr,
      isLikeNone(value) ? 0 : addHeapObject(value),
    );
  }

  /**
   * @returns {number | undefined}
   */
  get mode() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.createwritestreamoptions_mode(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      return r0 === 0 ? undefined : r1 >>> 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {number | undefined} [value]
   */
  set mode(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    if (!isLikeNone(value)) {
      _assertNum(value);
    }
    wasm.createwritestreamoptions_set_mode(
      this.__wbg_ptr,
      !isLikeNone(value),
      isLikeNone(value) ? 0 : value,
    );
  }

  /**
   * @returns {number | undefined}
   */
  get start() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.createwritestreamoptions_start(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r2 = getFloat64Memory0()[retptr / 8 + 1];
      return r0 === 0 ? undefined : r2;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {number | undefined} [value]
   */
  set start(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    if (!isLikeNone(value)) {
      _assertNum(value);
    }
    wasm.createwritestreamoptions_set_start(
      this.__wbg_ptr,
      !isLikeNone(value),
      isLikeNone(value) ? 0 : value,
    );
  }
}

const CryptoBoxFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_cryptobox_free(ptr >>> 0));

/**
 *
 * CryptoBox allows for encrypting and decrypting messages using the `crypto_box` crate.
 *
 * https://docs.rs/crypto_box/0.9.1/crypto_box/
 *
 *  @category Wallet SDK
 */
export class CryptoBox {
  toJSON() {
    return {
      publicKey: this.publicKey,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    CryptoBoxFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_cryptobox_free(ptr);
  }

  /**
   * @param {CryptoBoxPrivateKey | HexString | Uint8Array} secretKey
   * @param {CryptoBoxPublicKey | HexString | Uint8Array} peerPublicKey
   */
  constructor(secretKey, peerPublicKey) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.cryptobox_ctor(
        retptr,
        addHeapObject(secretKey),
        addHeapObject(peerPublicKey),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @returns {string}
   */
  get publicKey() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.cryptobox_publicKey(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @param {string} plaintext
   * @returns {string}
   */
  encrypt(plaintext) {
    let deferred3_0;
    let deferred3_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      const ptr0 = passStringToWasm0(
        plaintext,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.cryptobox_encrypt(retptr, this.__wbg_ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr2 = r0;
      var len2 = r1;
      if (r3) {
        ptr2 = 0;
        len2 = 0;
        throw takeObject(r2);
      }
      deferred3_0 = ptr2;
      deferred3_1 = len2;
      return getStringFromWasm0(ptr2, len2);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
  }

  /**
   * @param {string} base64string
   * @returns {string}
   */
  decrypt(base64string) {
    let deferred3_0;
    let deferred3_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      const ptr0 = passStringToWasm0(
        base64string,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.cryptobox_decrypt(retptr, this.__wbg_ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr2 = r0;
      var len2 = r1;
      if (r3) {
        ptr2 = 0;
        len2 = 0;
        throw takeObject(r2);
      }
      deferred3_0 = ptr2;
      deferred3_1 = len2;
      return getStringFromWasm0(ptr2, len2);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
  }
}

const CryptoBoxPrivateKeyFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_cryptoboxprivatekey_free(ptr >>> 0),
      );

/**
 * @category Wallet SDK
 */
export class CryptoBoxPrivateKey {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    CryptoBoxPrivateKeyFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_cryptoboxprivatekey_free(ptr);
  }

  /**
   * @param {HexString | Uint8Array} secretKey
   */
  constructor(secretKey) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.cryptoboxprivatekey_ctor(retptr, addHeapObject(secretKey));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @returns {CryptoBoxPublicKey}
   */
  to_public_key() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.cryptoboxprivatekey_to_public_key(this.__wbg_ptr);
    return CryptoBoxPublicKey.__wrap(ret);
  }
}

const CryptoBoxPublicKeyFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_cryptoboxpublickey_free(ptr >>> 0),
      );

/**
 * @category Wallet SDK
 */
export class CryptoBoxPublicKey {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(CryptoBoxPublicKey.prototype);
    obj.__wbg_ptr = ptr;
    CryptoBoxPublicKeyFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    CryptoBoxPublicKeyFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_cryptoboxpublickey_free(ptr);
  }

  /**
   * @param {HexString | Uint8Array} publicKey
   */
  constructor(publicKey) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.cryptoboxpublickey_ctor(retptr, addHeapObject(publicKey));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @returns {string}
   */
  toString() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.cryptoboxpublickey_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
}

const DerivationPathFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_derivationpath_free(ptr >>> 0),
      );

/**
 * Key derivation path
 * @category Wallet SDK
 */
export class DerivationPath {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(DerivationPath.prototype);
    obj.__wbg_ptr = ptr;
    DerivationPathFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    DerivationPathFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_derivationpath_free(ptr);
  }

  /**
   * @param {string} path
   */
  constructor(path) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        path,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.derivationpath_new(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Is this derivation path empty? (i.e. the root)
   * @returns {boolean}
   */
  isEmpty() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.derivationpath_isEmpty(this.__wbg_ptr);
    return ret !== 0;
  }

  /**
   * Get the count of [`ChildNumber`] values in this derivation path.
   * @returns {number}
   */
  length() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.derivationpath_length(this.__wbg_ptr);
    return ret >>> 0;
  }

  /**
   * Get the parent [`DerivationPath`] for the current one.
   *
   * Returns `Undefined` if this is already the root path.
   * @returns {DerivationPath | undefined}
   */
  parent() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.derivationpath_parent(this.__wbg_ptr);
    return ret === 0 ? undefined : DerivationPath.__wrap(ret);
  }

  /**
   * Push a [`ChildNumber`] onto an existing derivation path.
   * @param {number} child_number
   * @param {boolean | undefined} [hardened]
   */
  push(child_number, hardened) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(child_number);
      if (!isLikeNone(hardened)) {
        _assertBoolean(hardened);
      }
      wasm.derivationpath_push(
        retptr,
        this.__wbg_ptr,
        child_number,
        isLikeNone(hardened) ? 0xffffff : hardened ? 1 : 0,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @returns {string}
   */
  toString() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.derivationpath_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
}

const FormatInputPathObjectFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_formatinputpathobject_free(ptr >>> 0),
      );

/**
 */
export class FormatInputPathObject {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(FormatInputPathObject.prototype);
    obj.__wbg_ptr = ptr;
    FormatInputPathObjectFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    FormatInputPathObjectFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_formatinputpathobject_free(ptr);
  }

  /**
   * @param {string | undefined} [base]
   * @param {string | undefined} [dir]
   * @param {string | undefined} [ext]
   * @param {string | undefined} [name]
   * @param {string | undefined} [root]
   */
  constructor(base, dir, ext, name, root) {
    const ret = wasm.formatinputpathobject_new_with_values(
      isLikeNone(base) ? 0 : addHeapObject(base),
      isLikeNone(dir) ? 0 : addHeapObject(dir),
      isLikeNone(ext) ? 0 : addHeapObject(ext),
      isLikeNone(name) ? 0 : addHeapObject(name),
      isLikeNone(root) ? 0 : addHeapObject(root),
    );
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * @returns {FormatInputPathObject}
   */
  static new() {
    const ret = wasm.formatinputpathobject_new();
    return FormatInputPathObject.__wrap(ret);
  }

  /**
   * @returns {string | undefined}
   */
  get base() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.formatinputpathobject_base(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {string | undefined} [value]
   */
  set base(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.formatinputpathobject_set_base(
      this.__wbg_ptr,
      isLikeNone(value) ? 0 : addHeapObject(value),
    );
  }

  /**
   * @returns {string | undefined}
   */
  get dir() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.formatinputpathobject_dir(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {string | undefined} [value]
   */
  set dir(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.formatinputpathobject_set_dir(
      this.__wbg_ptr,
      isLikeNone(value) ? 0 : addHeapObject(value),
    );
  }

  /**
   * @returns {string | undefined}
   */
  get ext() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.formatinputpathobject_ext(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {string | undefined} [value]
   */
  set ext(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.formatinputpathobject_set_ext(
      this.__wbg_ptr,
      isLikeNone(value) ? 0 : addHeapObject(value),
    );
  }

  /**
   * @returns {string | undefined}
   */
  get name() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.formatinputpathobject_name(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {string | undefined} [value]
   */
  set name(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.formatinputpathobject_set_name(
      this.__wbg_ptr,
      isLikeNone(value) ? 0 : addHeapObject(value),
    );
  }

  /**
   * @returns {string | undefined}
   */
  get root() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.formatinputpathobject_root(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {string | undefined} [value]
   */
  set root(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.formatinputpathobject_set_root(
      this.__wbg_ptr,
      isLikeNone(value) ? 0 : addHeapObject(value),
    );
  }
}

const GeneratorFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_generator_free(ptr >>> 0));

/**
 * Generator is a type capable of generating transactions based on a supplied
 * set of UTXO entries or a UTXO entry producer (such as {@link UtxoContext}). The Generator
 * accumulates UTXO entries until it can generate a transaction that meets the
 * requested amount or until the total mass of created inputs exceeds the allowed
 * transaction mass, at which point it will produce a compound transaction by forwarding
 * all selected UTXO entries to the supplied change address and prepare to start generating
 * a new transaction.  Such sequence of daisy-chained transactions is known as a "batch".
 * Each compound transaction results in a new UTXO, which is immediately reused in the
 * subsequent transaction.
 *
 * The Generator constructor accepts a single {@link IGeneratorSettingsObject} object.
 *
 * ```javascript
 *
 * let generator = new Generator({
 *     utxoEntries : [...],
 *     changeAddress : "kaspa:...",
 *     outputs : [
 *         { amount : kaspaToSompi(10.0), address: "kaspa:..."},
 *         { amount : kaspaToSompi(20.0), address: "kaspa:..."},
 *         ...
 *     ],
 *     priorityFee : 1000n,
 * });
 *
 * let pendingTransaction;
 * while(pendingTransaction = await generator.next()) {
 *     await pendingTransaction.sign(privateKeys);
 *     await pendingTransaction.submit(rpc);
 * }
 *
 * let summary = generator.summary();
 * console.log(summary);
 *
 * ```
 * @see
 *     {@link IGeneratorSettingsObject},
 *     {@link PendingTransaction},
 *     {@link UtxoContext},
 *     {@link createTransactions},
 *     {@link estimateTransactions},
 * @category Wallet SDK
 */
export class Generator {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    GeneratorFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_generator_free(ptr);
  }

  /**
   * @param {IGeneratorSettingsObject} args
   */
  constructor(args) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.generator_ctor(retptr, addHeapObject(args));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Generate next transaction
   * @returns {Promise<any>}
   */
  next() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.generator_next(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {Promise<GeneratorSummary>}
   */
  estimate() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.generator_estimate(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {GeneratorSummary}
   */
  summary() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.generator_summary(this.__wbg_ptr);
    return GeneratorSummary.__wrap(ret);
  }
}

const GeneratorSummaryFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_generatorsummary_free(ptr >>> 0),
      );

/**
 *
 * A class containing a summary produced by transaction {@link Generator}.
 * This class contains the number of transactions, the aggregated fees,
 * the aggregated UTXOs and the final transaction amount that includes
 * both network and QoS (priority) fees.
 *
 * @see {@link createTransactions}, {@link IGeneratorSettingsObject}, {@link Generator}
 * @category Wallet SDK
 */
export class GeneratorSummary {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(GeneratorSummary.prototype);
    obj.__wbg_ptr = ptr;
    GeneratorSummaryFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      networkType: this.networkType,
      utxos: this.utxos,
      fees: this.fees,
      transactions: this.transactions,
      finalAmount: this.finalAmount,
      finalTransactionId: this.finalTransactionId,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    GeneratorSummaryFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_generatorsummary_free(ptr);
  }

  /**
   * @returns {NetworkType}
   */
  get networkType() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.generatorsummary_networkType(this.__wbg_ptr);
    return ret;
  }

  /**
   * @returns {number}
   */
  get utxos() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.generatorsummary_utxos(this.__wbg_ptr);
    return ret >>> 0;
  }

  /**
   * @returns {bigint}
   */
  get fees() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.generatorsummary_fees(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {number}
   */
  get transactions() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.generatorsummary_transactions(this.__wbg_ptr);
    return ret >>> 0;
  }

  /**
   * @returns {bigint | undefined}
   */
  get finalAmount() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.generatorsummary_finalAmount(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {string | undefined}
   */
  get finalTransactionId() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.generatorsummary_finalTransactionId(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      let v1;
      if (r0 !== 0) {
        v1 = getStringFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1, 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}

const GetNameOptionsFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_getnameoptions_free(ptr >>> 0),
      );

/**
 */
export class GetNameOptions {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(GetNameOptions.prototype);
    obj.__wbg_ptr = ptr;
    GetNameOptionsFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    GetNameOptionsFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_getnameoptions_free(ptr);
  }

  /**
   * @param {number | undefined} family
   * @param {string} host
   * @param {string} local_address
   * @param {number} port
   * @returns {GetNameOptions}
   */
  static new(family, host, local_address, port) {
    if (!isLikeNone(family)) {
      _assertNum(family);
    }
    _assertNum(port);
    const ret = wasm.getnameoptions_new(
      isLikeNone(family) ? 0xffffff : family,
      addHeapObject(host),
      addHeapObject(local_address),
      port,
    );
    return GetNameOptions.__wrap(ret);
  }

  /**
   * @returns {number | undefined}
   */
  get family() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.getnameoptions_family(this.__wbg_ptr);
    return ret === 0xffffff ? undefined : ret;
  }

  /**
   * @param {number | undefined} [value]
   */
  set family(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    if (!isLikeNone(value)) {
      _assertNum(value);
    }
    wasm.getnameoptions_set_family(
      this.__wbg_ptr,
      isLikeNone(value) ? 0xffffff : value,
    );
  }

  /**
   * @returns {string}
   */
  get host() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.getnameoptions_host(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {string} value
   */
  set host(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.getnameoptions_set_host(this.__wbg_ptr, addHeapObject(value));
  }

  /**
   * @returns {string}
   */
  get local_address() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.getnameoptions_local_address(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {string} value
   */
  set local_address(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.getnameoptions_set_local_address(this.__wbg_ptr, addHeapObject(value));
  }

  /**
   * @returns {number}
   */
  get port() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.getnameoptions_port(this.__wbg_ptr);
    return ret >>> 0;
  }

  /**
   * @param {number} value
   */
  set port(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertNum(value);
    wasm.getnameoptions_set_port(this.__wbg_ptr, value);
  }
}

const HashFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_hash_free(ptr >>> 0));

/**
 * @category General
 */
export class Hash {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Hash.prototype);
    obj.__wbg_ptr = ptr;
    HashFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    HashFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_hash_free(ptr);
  }

  /**
   * @param {string} hex_str
   */
  constructor(hex_str) {
    const ptr0 = passStringToWasm0(
      hex_str,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.hash_constructor(ptr0, len0);
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * @returns {string}
   */
  toString() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.hash_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
}

const HeaderFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_header_free(ptr >>> 0));

/**
 * @category Consensus
 */
export class Header {
  toJSON() {
    return {
      version: this.version,
      timestamp: this.timestamp,
      bits: this.bits,
      nonce: this.nonce,
      daaScore: this.daaScore,
      blueScore: this.blueScore,
      hash: this.hash,
      hashMerkleRoot: this.hashMerkleRoot,
      acceptedIdMerkleRoot: this.acceptedIdMerkleRoot,
      utxoCommitment: this.utxoCommitment,
      pruningPoint: this.pruningPoint,
      parentsByLevel: this.parentsByLevel,
      blueWork: this.blueWork,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    HeaderFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_header_free(ptr);
  }

  /**
   * @param {IHeader | Header} js_value
   */
  constructor(js_value) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.header_constructor(retptr, addHeapObject(js_value));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Finalizes the header and recomputes (updates) the header hash
   * @return { String } header hash
   * @returns {string}
   */
  finalize() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.header_finalize(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * Obtain `JSON` representation of the header. JSON representation
   * should be obtained using WASM, to ensure proper serialization of
   * big integers.
   * @returns {string}
   */
  asJSON() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.header_asJSON(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @returns {number}
   */
  get version() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.header_get_version(this.__wbg_ptr);
    return ret;
  }

  /**
   * @param {number} version
   */
  set version(version) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertNum(version);
    wasm.header_set_version(this.__wbg_ptr, version);
  }

  /**
   * @returns {bigint}
   */
  get timestamp() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.header_get_timestamp(this.__wbg_ptr);
    return BigInt.asUintN(64, ret);
  }

  /**
   * @param {bigint} timestamp
   */
  set timestamp(timestamp) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertBigInt(timestamp);
    wasm.header_set_timestamp(this.__wbg_ptr, timestamp);
  }

  /**
   * @returns {number}
   */
  get bits() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.header_bits(this.__wbg_ptr);
    return ret >>> 0;
  }

  /**
   * @param {number} bits
   */
  set bits(bits) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertNum(bits);
    wasm.header_set_bits(this.__wbg_ptr, bits);
  }

  /**
   * @returns {bigint}
   */
  get nonce() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.header_nonce(this.__wbg_ptr);
    return BigInt.asUintN(64, ret);
  }

  /**
   * @param {bigint} nonce
   */
  set nonce(nonce) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertBigInt(nonce);
    wasm.header_set_nonce(this.__wbg_ptr, nonce);
  }

  /**
   * @returns {bigint}
   */
  get daaScore() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.header_daa_score(this.__wbg_ptr);
    return BigInt.asUintN(64, ret);
  }

  /**
   * @param {bigint} daa_score
   */
  set daaScore(daa_score) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertBigInt(daa_score);
    wasm.header_set_daa_score(this.__wbg_ptr, daa_score);
  }

  /**
   * @returns {bigint}
   */
  get blueScore() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.header_blue_score(this.__wbg_ptr);
    return BigInt.asUintN(64, ret);
  }

  /**
   * @param {bigint} blue_score
   */
  set blueScore(blue_score) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertBigInt(blue_score);
    wasm.header_set_blue_score(this.__wbg_ptr, blue_score);
  }

  /**
   * @returns {string}
   */
  get hash() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.header_get_hash_as_hex(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @returns {string}
   */
  get hashMerkleRoot() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.header_get_hash_merkle_root_as_hex(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @param {any} js_value
   */
  set hashMerkleRoot(js_value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.header_set_hash_merkle_root_from_js_value(
      this.__wbg_ptr,
      addHeapObject(js_value),
    );
  }

  /**
   * @returns {string}
   */
  get acceptedIdMerkleRoot() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.header_get_accepted_id_merkle_root_as_hex(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @param {any} js_value
   */
  set acceptedIdMerkleRoot(js_value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.header_set_accepted_id_merkle_root_from_js_value(
      this.__wbg_ptr,
      addHeapObject(js_value),
    );
  }

  /**
   * @returns {string}
   */
  get utxoCommitment() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.header_get_utxo_commitment_as_hex(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @param {any} js_value
   */
  set utxoCommitment(js_value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.header_set_utxo_commitment_from_js_value(
      this.__wbg_ptr,
      addHeapObject(js_value),
    );
  }

  /**
   * @returns {string}
   */
  get pruningPoint() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.header_get_pruning_point_as_hex(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @param {any} js_value
   */
  set pruningPoint(js_value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.header_set_pruning_point_from_js_value(
      this.__wbg_ptr,
      addHeapObject(js_value),
    );
  }

  /**
   * @returns {any}
   */
  get parentsByLevel() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.header_get_parents_by_level_as_js_value(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {any} js_value
   */
  set parentsByLevel(js_value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.header_set_parents_by_level_from_js_value(
      this.__wbg_ptr,
      addHeapObject(js_value),
    );
  }

  /**
   * @returns {bigint}
   */
  get blueWork() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.header_blue_work(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {string}
   */
  getBlueWorkAsHex() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.header_getBlueWorkAsHex(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @param {any} js_value
   */
  set blueWork(js_value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.header_set_blue_work_from_js_value(
      this.__wbg_ptr,
      addHeapObject(js_value),
    );
  }
}

const KeypairFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_keypair_free(ptr >>> 0));

/**
 * Data structure that contains a secret and public keys.
 * @category Wallet SDK
 */
export class Keypair {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Keypair.prototype);
    obj.__wbg_ptr = ptr;
    KeypairFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      publicKey: this.publicKey,
      privateKey: this.privateKey,
      xOnlyPublicKey: this.xOnlyPublicKey,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    KeypairFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_keypair_free(ptr);
  }

  /**
   * Get the [`PublicKey`] of this [`Keypair`].
   * @returns {string}
   */
  get publicKey() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.keypair_get_public_key(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * Get the [`PrivateKey`] of this [`Keypair`].
   * @returns {string}
   */
  get privateKey() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.keypair_get_private_key(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * Get the `XOnlyPublicKey` of this [`Keypair`].
   * @returns {any}
   */
  get xOnlyPublicKey() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.keypair_get_xonly_public_key(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * Get the [`Address`] of this Keypair's [`PublicKey`].
   * Receives a [`NetworkType`] to determine the prefix of the address.
   * JavaScript: `let address = keypair.toAddress(NetworkType.MAINNET);`.
   * @param {NetworkType | NetworkId | string} network
   * @returns {Address}
   */
  toAddress(network) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.keypair_toAddress(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(network),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Address.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * Get `ECDSA` [`Address`] of this Keypair's [`PublicKey`].
   * Receives a [`NetworkType`] to determine the prefix of the address.
   * JavaScript: `let address = keypair.toAddress(NetworkType.MAINNET);`.
   * @param {NetworkType | NetworkId | string} network
   * @returns {Address}
   */
  toAddressECDSA(network) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.keypair_toAddressECDSA(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(network),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Address.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * Create a new random [`Keypair`].
   * JavaScript: `let keypair = Keypair::random();`.
   * @returns {Keypair}
   */
  static random() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.keypair_random(retptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Keypair.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Create a new [`Keypair`] from a [`PrivateKey`].
   * JavaScript: `let privkey = new PrivateKey(hexString); let keypair = privkey.toKeypair();`.
   * @param {PrivateKey} secret_key
   * @returns {Keypair}
   */
  static fromPrivateKey(secret_key) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertClass(secret_key, PrivateKey);
      if (secret_key.__wbg_ptr === 0) {
        throw new Error("Attempt to use a moved value");
      }
      wasm.keypair_fromPrivateKey(retptr, secret_key.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Keypair.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}

const MassCalculatorFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_masscalculator_free(ptr >>> 0),
      );

/**
 * @category Wallet SDK
 */
export class MassCalculator {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    MassCalculatorFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_masscalculator_free(ptr);
  }

  /**
   * @param {ConsensusParams} cp
   */
  constructor(cp) {
    _assertClass(cp, ConsensusParams);
    if (cp.__wbg_ptr === 0) {
      throw new Error("Attempt to use a moved value");
    }
    var ptr0 = cp.__destroy_into_raw();
    const ret = wasm.masscalculator_new(ptr0);
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * @param {bigint} amount
   * @returns {boolean}
   */
  isDust(amount) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertBigInt(amount);
    const ret = wasm.masscalculator_isDust(this.__wbg_ptr, amount);
    return ret !== 0;
  }

  /**
   * `isTransactionOutputDust()` returns whether or not the passed transaction output
   * amount is considered dust or not based on the configured minimum transaction
   * relay fee.
   *
   * Dust is defined in terms of the minimum transaction relay fee. In particular,
   * if the cost to the network to spend coins is more than 1/3 of the minimum
   * transaction relay fee, it is considered dust.
   *
   * It is exposed by `MiningManager` for use by transaction generators and wallets.
   * @param {any} transaction_output
   * @returns {boolean}
   */
  static isTransactionOutputDust(transaction_output) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.masscalculator_isTransactionOutputDust(
        retptr,
        addBorrowedObject(transaction_output),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return r0 !== 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * `minimumRelayTransactionFee()` specifies the minimum transaction fee for a transaction to be accepted to
   * the mempool and relayed. It is specified in sompi per 1kg (or 1000 grams) of transaction mass.
   *
   * `pub(crate) const MINIMUM_RELAY_TRANSACTION_FEE: u64 = 1000;`
   * @returns {number}
   */
  static minimumRelayTransactionFee() {
    const ret = wasm.masscalculator_minimumRelayTransactionFee();
    return ret >>> 0;
  }

  /**
   * `maximumStandardTransactionMass()` is the maximum mass allowed for transactions that
   * are considered standard and will therefore be relayed and considered for mining.
   *
   * `pub const MAXIMUM_STANDARD_TRANSACTION_MASS: u64 = 100_000;`
   * @returns {number}
   */
  static maximumStandardTransactionMass() {
    const ret = wasm.masscalculator_maximumStandardTransactionMass();
    return ret >>> 0;
  }

  /**
   * minimum_required_transaction_relay_fee returns the minimum transaction fee required
   * for a transaction with the passed mass to be accepted into the mempool and relayed.
   * @param {number} mass
   * @returns {number}
   */
  static minimumRequiredTransactionRelayFee(mass) {
    _assertNum(mass);
    const ret = wasm.masscalculator_minimumRequiredTransactionRelayFee(mass);
    return ret >>> 0;
  }

  /**
   * @param {any} tx
   * @returns {number}
   */
  calcMassForTransaction(tx) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.masscalculator_calcMassForTransaction(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(tx),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return r0 >>> 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @returns {number}
   */
  static blankTransactionSerializedByteSize() {
    const ret = wasm.masscalculator_blankTransactionSerializedByteSize();
    return ret >>> 0;
  }

  /**
   * @returns {number}
   */
  blankTransactionMass() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.masscalculator_blankTransactionMass(this.__wbg_ptr);
    return ret >>> 0;
  }

  /**
   * @param {number} payload_byte_size
   * @returns {number}
   */
  calcMassForPayload(payload_byte_size) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertNum(payload_byte_size);
    const ret = wasm.masscalculator_calcMassForPayload(
      this.__wbg_ptr,
      payload_byte_size,
    );
    return ret >>> 0;
  }

  /**
   * @param {any} outputs
   * @returns {number}
   */
  calcMassForOutputs(outputs) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.masscalculator_calcMassForOutputs(
        retptr,
        this.__wbg_ptr,
        addHeapObject(outputs),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return r0 >>> 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {any} inputs
   * @returns {number}
   */
  calcMassForInputs(inputs) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.masscalculator_calcMassForInputs(
        retptr,
        this.__wbg_ptr,
        addHeapObject(inputs),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return r0 >>> 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {TransactionOutput} output
   * @returns {number}
   */
  calcMassForOutput(output) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertClass(output, TransactionOutput);
      if (output.__wbg_ptr === 0) {
        throw new Error("Attempt to use a moved value");
      }
      wasm.masscalculator_calcMassForOutput(
        retptr,
        this.__wbg_ptr,
        output.__wbg_ptr,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return r0 >>> 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {TransactionInput} input
   * @returns {number}
   */
  calcMassForInput(input) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertClass(input, TransactionInput);
      if (input.__wbg_ptr === 0) {
        throw new Error("Attempt to use a moved value");
      }
      wasm.masscalculator_calcMassForInput(
        retptr,
        this.__wbg_ptr,
        input.__wbg_ptr,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return r0 >>> 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {number} minimum_signatures
   * @returns {number}
   */
  calcSignatureMass(minimum_signatures) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertNum(minimum_signatures);
    const ret = wasm.masscalculator_calcSignatureMass(
      this.__wbg_ptr,
      minimum_signatures,
    );
    return ret >>> 0;
  }

  /**
   * @param {number} number_of_inputs
   * @param {number} minimum_signatures
   * @returns {number}
   */
  calcSignatureMassForInputs(number_of_inputs, minimum_signatures) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertNum(number_of_inputs);
    _assertNum(minimum_signatures);
    const ret = wasm.masscalculator_calcSignatureMassForInputs(
      this.__wbg_ptr,
      number_of_inputs,
      minimum_signatures,
    );
    return ret >>> 0;
  }

  /**
   * @param {bigint} mass
   * @returns {number}
   */
  calcMinimumTransactionRelayFeeFromMass(mass) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertBigInt(mass);
    const ret = wasm.masscalculator_calcMinimumTransactionRelayFeeFromMass(
      this.__wbg_ptr,
      mass,
    );
    return ret >>> 0;
  }

  /**
   * @param {Transaction} transaction
   * @param {number} minimum_signatures
   * @returns {number}
   */
  calcMiniumTxRelayFee(transaction, minimum_signatures) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertClass(transaction, Transaction);
      if (transaction.__wbg_ptr === 0) {
        throw new Error("Attempt to use a moved value");
      }
      _assertNum(minimum_signatures);
      wasm.masscalculator_calcMiniumTxRelayFee(
        retptr,
        this.__wbg_ptr,
        transaction.__wbg_ptr,
        minimum_signatures,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return r0 >>> 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}

const MkdtempSyncOptionsFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_mkdtempsyncoptions_free(ptr >>> 0),
      );

/**
 */
export class MkdtempSyncOptions {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(MkdtempSyncOptions.prototype);
    obj.__wbg_ptr = ptr;
    MkdtempSyncOptionsFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    MkdtempSyncOptionsFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_mkdtempsyncoptions_free(ptr);
  }

  /**
   * @param {string | undefined} [encoding]
   */
  constructor(encoding) {
    const ret = wasm.mkdtempsyncoptions_new_with_values(
      isLikeNone(encoding) ? 0 : addHeapObject(encoding),
    );
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * @returns {MkdtempSyncOptions}
   */
  static new() {
    const ret = wasm.mkdtempsyncoptions_new();
    return MkdtempSyncOptions.__wrap(ret);
  }

  /**
   * @returns {string | undefined}
   */
  get encoding() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.mkdtempsyncoptions_encoding(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {string | undefined} [value]
   */
  set encoding(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.mkdtempsyncoptions_set_encoding(
      this.__wbg_ptr,
      isLikeNone(value) ? 0 : addHeapObject(value),
    );
  }
}

const MnemonicFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_mnemonic_free(ptr >>> 0));

/**
 * BIP39 mnemonic phrases: sequences of words representing cryptographic keys.
 * @category Wallet SDK
 */
export class Mnemonic {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Mnemonic.prototype);
    obj.__wbg_ptr = ptr;
    MnemonicFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      entropy: this.entropy,
      phrase: this.phrase,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    MnemonicFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_mnemonic_free(ptr);
  }

  /**
   * @param {string} phrase
   * @param {Language | undefined} [language]
   */
  constructor(phrase, language) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        phrase,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      if (!isLikeNone(language)) {
        _assertNum(language);
      }
      wasm.mnemonic_constructor(
        retptr,
        ptr0,
        len0,
        isLikeNone(language) ? 1 : language,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Validate mnemonic phrase. Returns `true` if the phrase is valid, `false` otherwise.
   * @param {string} phrase
   * @param {Language | undefined} [language]
   * @returns {boolean}
   */
  static validate(phrase, language) {
    const ptr0 = passStringToWasm0(
      phrase,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    if (!isLikeNone(language)) {
      _assertNum(language);
    }
    const ret = wasm.mnemonic_validate(
      ptr0,
      len0,
      isLikeNone(language) ? 1 : language,
    );
    return ret !== 0;
  }

  /**
   * @returns {string}
   */
  get entropy() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.mnemonic_entropy(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @param {string} entropy
   */
  set entropy(entropy) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      entropy,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.mnemonic_set_entropy(this.__wbg_ptr, ptr0, len0);
  }

  /**
   * @param {any} word_count
   * @returns {Mnemonic}
   */
  static random(word_count) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.mnemonic_random(retptr, addHeapObject(word_count));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Mnemonic.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @returns {string}
   */
  get phrase() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.mnemonic_phrase(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @param {string} phrase
   */
  set phrase(phrase) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      phrase,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.mnemonic_set_phrase(this.__wbg_ptr, ptr0, len0);
  }

  /**
   * @param {string | undefined} [password]
   * @returns {string}
   */
  toSeed(password) {
    let deferred2_0;
    let deferred2_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      var ptr0 = isLikeNone(password)
        ? 0
        : passStringToWasm0(
            password,
            wasm.__wbindgen_malloc,
            wasm.__wbindgen_realloc,
          );
      var len0 = WASM_VECTOR_LEN;
      wasm.mnemonic_toSeed(retptr, this.__wbg_ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred2_0 = r0;
      deferred2_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }
}

const NetServerOptionsFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_netserveroptions_free(ptr >>> 0),
      );

/**
 */
export class NetServerOptions {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    NetServerOptionsFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_netserveroptions_free(ptr);
  }

  /**
   * @returns {boolean | undefined}
   */
  get allow_half_open() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    const ptr = this.__destroy_into_raw();
    _assertNum(ptr);
    const ret = wasm.netserveroptions_allow_half_open(ptr);
    return ret === 0xffffff ? undefined : ret !== 0;
  }

  /**
   * @param {boolean | undefined} [value]
   */
  set allow_half_open(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    const ptr = this.__destroy_into_raw();
    _assertNum(ptr);
    if (!isLikeNone(value)) {
      _assertBoolean(value);
    }
    wasm.netserveroptions_set_allow_half_open(
      ptr,
      isLikeNone(value) ? 0xffffff : value ? 1 : 0,
    );
  }

  /**
   * @returns {boolean | undefined}
   */
  get pause_on_connect() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    const ptr = this.__destroy_into_raw();
    _assertNum(ptr);
    const ret = wasm.netserveroptions_pause_on_connect(ptr);
    return ret === 0xffffff ? undefined : ret !== 0;
  }

  /**
   * @param {boolean | undefined} [value]
   */
  set pause_on_connect(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    const ptr = this.__destroy_into_raw();
    _assertNum(ptr);
    if (!isLikeNone(value)) {
      _assertBoolean(value);
    }
    wasm.netserveroptions_set_pause_on_connect(
      ptr,
      isLikeNone(value) ? 0xffffff : value ? 1 : 0,
    );
  }
}

const NetworkIdFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_networkid_free(ptr >>> 0));

/**
 *
 * NetworkId is a unique identifier for a kaspa network instance.
 * It is composed of a network type and an optional suffix.
 *
 * @category Consensus
 */
export class NetworkId {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(NetworkId.prototype);
    obj.__wbg_ptr = ptr;
    NetworkIdFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      type: this.type,
      suffix: this.suffix,
      id: this.id,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    NetworkIdFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_networkid_free(ptr);
  }

  /**
   * @returns {NetworkType}
   */
  get type() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.__wbg_get_networkid_type(this.__wbg_ptr);
    return ret;
  }

  /**
   * @param {NetworkType} arg0
   */
  set type(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertNum(arg0);
    wasm.__wbg_set_networkid_type(this.__wbg_ptr, arg0);
  }

  /**
   * @returns {number | undefined}
   */
  get suffix() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.__wbg_get_networkid_suffix(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      return r0 === 0 ? undefined : r1 >>> 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {number | undefined} [arg0]
   */
  set suffix(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    if (!isLikeNone(arg0)) {
      _assertNum(arg0);
    }
    wasm.__wbg_set_networkid_suffix(
      this.__wbg_ptr,
      !isLikeNone(arg0),
      isLikeNone(arg0) ? 0 : arg0,
    );
  }

  /**
   * @param {any} value
   */
  constructor(value) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.networkid_ctor(retptr, addBorrowedObject(value));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @returns {string}
   */
  get id() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.networkid_id(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @returns {string}
   */
  toString() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.networkid_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @returns {string}
   */
  addressPrefix() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.networkid_addressPrefix(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
}

const NodeDescriptorFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_nodedescriptor_free(ptr >>> 0),
      );

/**
 *
 * Data structure representing a Node connection endpoint
 * as provided by the {@link Resolver}.
 *
 * @category Node RPC
 */
export class NodeDescriptor {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(NodeDescriptor.prototype);
    obj.__wbg_ptr = ptr;
    NodeDescriptorFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      id: this.id,
      url: this.url,
      provider_name: this.provider_name,
      provider_url: this.provider_url,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    NodeDescriptorFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_nodedescriptor_free(ptr);
  }

  /**
   * The unique identifier of the node.
   * @returns {string}
   */
  get id() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.__wbg_get_nodedescriptor_id(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * The unique identifier of the node.
   * @param {string} arg0
   */
  set id(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_nodedescriptor_id(this.__wbg_ptr, ptr0, len0);
  }

  /**
   * The URL of the node WebSocket (wRPC URL).
   * @returns {string}
   */
  get url() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.__wbg_get_nodedescriptor_url(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * The URL of the node WebSocket (wRPC URL).
   * @param {string} arg0
   */
  set url(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_nodedescriptor_url(this.__wbg_ptr, ptr0, len0);
  }

  /**
   * Optional name of the node provider.
   * @returns {string | undefined}
   */
  get provider_name() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.__wbg_get_nodedescriptor_provider_name(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      let v1;
      if (r0 !== 0) {
        v1 = getStringFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1, 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Optional name of the node provider.
   * @param {string | undefined} [arg0]
   */
  set provider_name(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    var ptr0 = isLikeNone(arg0)
      ? 0
      : passStringToWasm0(
          arg0,
          wasm.__wbindgen_malloc,
          wasm.__wbindgen_realloc,
        );
    var len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_nodedescriptor_provider_name(this.__wbg_ptr, ptr0, len0);
  }

  /**
   * Optional site URL of the node provider.
   * @returns {string | undefined}
   */
  get provider_url() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.__wbg_get_nodedescriptor_provider_url(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      let v1;
      if (r0 !== 0) {
        v1 = getStringFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1, 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Optional site URL of the node provider.
   * @param {string | undefined} [arg0]
   */
  set provider_url(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    var ptr0 = isLikeNone(arg0)
      ? 0
      : passStringToWasm0(
          arg0,
          wasm.__wbindgen_malloc,
          wasm.__wbindgen_realloc,
        );
    var len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_nodedescriptor_provider_url(this.__wbg_ptr, ptr0, len0);
  }
}

const PaymentOutputFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_paymentoutput_free(ptr >>> 0),
      );

/**
 * @category Wallet SDK
 */
export class PaymentOutput {
  toJSON() {
    return {
      address: this.address,
      amount: this.amount,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    PaymentOutputFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_paymentoutput_free(ptr);
  }

  /**
   * @returns {Address}
   */
  get address() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.__wbg_get_paymentoutput_address(this.__wbg_ptr);
    return Address.__wrap(ret);
  }

  /**
   * @param {Address} arg0
   */
  set address(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertClass(arg0, Address);
    if (arg0.__wbg_ptr === 0) {
      throw new Error("Attempt to use a moved value");
    }
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_paymentoutput_address(this.__wbg_ptr, ptr0);
  }

  /**
   * @returns {bigint}
   */
  get amount() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.__wbg_get_paymentoutput_amount(this.__wbg_ptr);
    return BigInt.asUintN(64, ret);
  }

  /**
   * @param {bigint} arg0
   */
  set amount(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertBigInt(arg0);
    wasm.__wbg_set_paymentoutput_amount(this.__wbg_ptr, arg0);
  }

  /**
   * @param {Address} address
   * @param {bigint} amount
   */
  constructor(address, amount) {
    _assertClass(address, Address);
    if (address.__wbg_ptr === 0) {
      throw new Error("Attempt to use a moved value");
    }
    var ptr0 = address.__destroy_into_raw();
    _assertBigInt(amount);
    const ret = wasm.paymentoutput_new(ptr0, amount);
    this.__wbg_ptr = ret >>> 0;
    return this;
  }
}

const PaymentOutputsFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_paymentoutputs_free(ptr >>> 0),
      );

/**
 * @category Wallet SDK
 */
export class PaymentOutputs {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    PaymentOutputsFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_paymentoutputs_free(ptr);
  }

  /**
   * @param {IPaymentOutput[]} output_array
   */
  constructor(output_array) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.paymentoutputs_constructor(retptr, addHeapObject(output_array));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}

const PendingTransactionFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_pendingtransaction_free(ptr >>> 0),
      );

/**
 * @category Wallet SDK
 */
export class PendingTransaction {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(PendingTransaction.prototype);
    obj.__wbg_ptr = ptr;
    PendingTransactionFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      id: this.id,
      paymentAmount: this.paymentAmount,
      changeAmount: this.changeAmount,
      feeAmount: this.feeAmount,
      aggregateInputAmount: this.aggregateInputAmount,
      aggregateOutputAmount: this.aggregateOutputAmount,
      type: this.type,
      transaction: this.transaction,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    PendingTransactionFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_pendingtransaction_free(ptr);
  }

  /**
   * @returns {string}
   */
  get id() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.pendingtransaction_id(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @returns {any}
   */
  get paymentAmount() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.pendingtransaction_paymentAmount(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {bigint}
   */
  get changeAmount() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.pendingtransaction_changeAmount(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {bigint}
   */
  get feeAmount() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.pendingtransaction_feeAmount(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {bigint}
   */
  get aggregateInputAmount() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.pendingtransaction_aggregateInputAmount(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {bigint}
   */
  get aggregateOutputAmount() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.pendingtransaction_aggregateOutputAmount(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {string}
   */
  get type() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.pendingtransaction_type(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * List of unique addresses used by transaction inputs.
   * This method can be used to determine addresses used by transaction inputs
   * in order to select private keys needed for transaction signing.
   * @returns {Array<any>}
   */
  addresses() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.pendingtransaction_addresses(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {Array<any>}
   */
  getUtxoEntries() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.pendingtransaction_getUtxoEntries(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {number} input_index
   * @param {PrivateKey} private_key
   * @param {SighashType | undefined} [sighash_type]
   * @returns {HexString}
   */
  signInput(input_index, private_key, sighash_type) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(input_index);
      _assertClass(private_key, PrivateKey);
      if (private_key.__wbg_ptr === 0) {
        throw new Error("Attempt to use a moved value");
      }
      if (!isLikeNone(sighash_type)) {
        _assertNum(sighash_type);
      }
      wasm.pendingtransaction_signInput(
        retptr,
        this.__wbg_ptr,
        input_index,
        private_key.__wbg_ptr,
        isLikeNone(sighash_type) ? 6 : sighash_type,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {number} input_index
   * @param {HexString | Uint8Array} signature_script
   */
  fillInput(input_index, signature_script) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(input_index);
      wasm.pendingtransaction_fillInput(
        retptr,
        this.__wbg_ptr,
        input_index,
        addHeapObject(signature_script),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Sign transaction with supplied [`Array`] or [`PrivateKey`] or an array of
   * raw private key bytes (encoded as `Uint8Array` or as hex strings)
   * @param {(PrivateKey | HexString | Uint8Array)[]} js_value
   * @param {boolean | undefined} [check_fully_signed]
   */
  sign(js_value, check_fully_signed) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      if (!isLikeNone(check_fully_signed)) {
        _assertBoolean(check_fully_signed);
      }
      wasm.pendingtransaction_sign(
        retptr,
        this.__wbg_ptr,
        addHeapObject(js_value),
        isLikeNone(check_fully_signed) ? 0xffffff : check_fully_signed ? 1 : 0,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Submit transaction to the supplied [`RpcClient`]
   * **IMPORTANT:** This method will remove UTXOs from the associated
   * {@link UtxoContext} if one was used to create the transaction
   * and will return UTXOs back to {@link UtxoContext} in case of
   * a failed submission.
   * @see {@link RpcClient.submitTransaction}
   * @param {RpcClient} wasm_rpc_client
   * @returns {Promise<string>}
   */
  submit(wasm_rpc_client) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertClass(wasm_rpc_client, RpcClient);
    if (wasm_rpc_client.__wbg_ptr === 0) {
      throw new Error("Attempt to use a moved value");
    }
    const ret = wasm.pendingtransaction_submit(
      this.__wbg_ptr,
      wasm_rpc_client.__wbg_ptr,
    );
    return takeObject(ret);
  }

  /**
   * Returns encapsulated network [`Transaction`]
   * @returns {Transaction}
   */
  get transaction() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.pendingtransaction_transaction(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Transaction.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Serializes the transaction to a pure JavaScript Object.
   * The schema of the JavaScript object is defined by {@link ISerializableTransaction}.
   * @see {@link ISerializableTransaction}
   * @see {@link Transaction}, {@link ISerializableTransaction}
   * @returns {ITransaction | Transaction}
   */
  serializeToObject() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.pendingtransaction_serializeToObject(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Serializes the transaction to a JSON string.
   * The schema of the JSON is defined by {@link ISerializableTransaction}.
   * Once serialized, the transaction can be deserialized using {@link Transaction.deserializeFromJSON}.
   * @see {@link Transaction}, {@link ISerializableTransaction}
   * @returns {string}
   */
  serializeToJSON() {
    let deferred2_0;
    let deferred2_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.pendingtransaction_serializeToJSON(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr1 = r0;
      var len1 = r1;
      if (r3) {
        ptr1 = 0;
        len1 = 0;
        throw takeObject(r2);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }

  /**
   * Serializes the transaction to a "Safe" JSON schema where it converts all `bigint` values to `string` to avoid potential client-side precision loss.
   * Once serialized, the transaction can be deserialized using {@link Transaction.deserializeFromSafeJSON}.
   * @see {@link Transaction}, {@link ISerializableTransaction}
   * @returns {string}
   */
  serializeToSafeJSON() {
    let deferred2_0;
    let deferred2_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.pendingtransaction_serializeToSafeJSON(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr1 = r0;
      var len1 = r1;
      if (r3) {
        ptr1 = 0;
        len1 = 0;
        throw takeObject(r2);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }
}

const PipeOptionsFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_pipeoptions_free(ptr >>> 0));

/**
 */
export class PipeOptions {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    PipeOptionsFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_pipeoptions_free(ptr);
  }

  /**
   * @param {boolean | undefined} [end]
   */
  constructor(end) {
    if (!isLikeNone(end)) {
      _assertBoolean(end);
    }
    const ret = wasm.pipeoptions_new(isLikeNone(end) ? 0xffffff : end ? 1 : 0);
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * @returns {boolean | undefined}
   */
  get end() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    const ptr = this.__destroy_into_raw();
    _assertNum(ptr);
    const ret = wasm.pipeoptions_end(ptr);
    return ret === 0xffffff ? undefined : ret !== 0;
  }

  /**
   * @param {boolean | undefined} [value]
   */
  set end(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    const ptr = this.__destroy_into_raw();
    _assertNum(ptr);
    if (!isLikeNone(value)) {
      _assertBoolean(value);
    }
    wasm.pipeoptions_set_end(ptr, isLikeNone(value) ? 0xffffff : value ? 1 : 0);
  }
}

const PoWFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_pow_free(ptr >>> 0));

/**
 * Represents a Kaspa header PoW manager
 * @category Mining
 */
export class PoW {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(PoW.prototype);
    obj.__wbg_ptr = ptr;
    PoWFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      target: this.target,
      prePoWHash: this.prePoWHash,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    PoWFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_pow_free(ptr);
  }

  /**
   * @param {IHeader | Header} header
   * @param {bigint | undefined} [timestamp]
   */
  constructor(header, timestamp) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      if (!isLikeNone(timestamp)) {
        _assertBigInt(timestamp);
      }
      wasm.pow_new(
        retptr,
        addHeapObject(header),
        !isLikeNone(timestamp),
        isLikeNone(timestamp) ? BigInt(0) : timestamp,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * The target based on the provided bits.
   * @returns {bigint}
   */
  get target() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.pow_target(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Checks if the computed target meets or exceeds the difficulty specified in the template.
   * @returns A boolean indicating if it reached the target and a bigint representing the reached target.
   * @param {bigint} nonce
   * @returns {[boolean, bigint]}
   */
  checkWork(nonce) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertBigInt(nonce);
      wasm.pow_checkWork(retptr, this.__wbg_ptr, nonce);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Hash of the header without timestamp and nonce.
   * @returns {string}
   */
  get prePoWHash() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.pow_get_pre_pow_hash(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * Can be used for parsing Stratum templates.
   * @param {string} pre_pow_hash
   * @param {bigint} timestamp
   * @param {number | undefined} [target_bits]
   * @returns {PoW}
   */
  static fromRaw(pre_pow_hash, timestamp, target_bits) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        pre_pow_hash,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      _assertBigInt(timestamp);
      if (!isLikeNone(target_bits)) {
        _assertNum(target_bits);
      }
      wasm.pow_fromRaw(
        retptr,
        ptr0,
        len0,
        timestamp,
        !isLikeNone(target_bits),
        isLikeNone(target_bits) ? 0 : target_bits,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return PoW.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}

const PrivateKeyFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_privatekey_free(ptr >>> 0));

/**
 * Data structure that envelops a Private Key.
 * @category Wallet SDK
 */
export class PrivateKey {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(PrivateKey.prototype);
    obj.__wbg_ptr = ptr;
    PrivateKeyFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    PrivateKeyFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_privatekey_free(ptr);
  }

  /**
   * Create a new [`PrivateKey`] from a hex-encoded string.
   * @param {string} key
   */
  constructor(key) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        key,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.privatekey_try_new(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Returns the [`PrivateKey`] key encoded as a hex string.
   * @returns {string}
   */
  toString() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.privatekey_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * Generate a [`Keypair`] from this [`PrivateKey`].
   * @returns {Keypair}
   */
  toKeypair() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.privatekey_toKeypair(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Keypair.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @returns {PublicKey}
   */
  toPublicKey() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.privatekey_toPublicKey(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return PublicKey.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Get the [`Address`] of the PublicKey generated from this PrivateKey.
   * Receives a [`NetworkType`] to determine the prefix of the address.
   * JavaScript: `let address = privateKey.toAddress(NetworkType.MAINNET);`.
   * @param {NetworkType | NetworkId | string} network
   * @returns {Address}
   */
  toAddress(network) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.privatekey_toAddress(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(network),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Address.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * Get `ECDSA` [`Address`] of the PublicKey generated from this PrivateKey.
   * Receives a [`NetworkType`] to determine the prefix of the address.
   * JavaScript: `let address = privateKey.toAddress(NetworkType.MAINNET);`.
   * @param {NetworkType | NetworkId | string} network
   * @returns {Address}
   */
  toAddressECDSA(network) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.privatekey_toAddressECDSA(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(network),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Address.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }
}

const PrivateKeyGeneratorFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_privatekeygenerator_free(ptr >>> 0),
      );

/**
 *
 * Helper class to generate private keys from an extended private key (XPrv).
 * This class accepts the master Kaspa XPrv string (e.g. `xprv1...`) and generates
 * private keys for the receive and change paths given the pre-set parameters
 * such as account index, multisig purpose and cosigner index.
 *
 * Please note that in Kaspa master private keys use `kprv` prefix.
 *
 * @see {@link PublicKeyGenerator}, {@link XPub}, {@link XPrv}, {@link Mnemonic}
 * @category Wallet SDK
 */
export class PrivateKeyGenerator {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    PrivateKeyGeneratorFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_privatekeygenerator_free(ptr);
  }

  /**
   * @param {XPrv | string} xprv
   * @param {boolean} is_multisig
   * @param {bigint} account_index
   * @param {number | undefined} [cosigner_index]
   */
  constructor(xprv, is_multisig, account_index, cosigner_index) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertBoolean(is_multisig);
      _assertBigInt(account_index);
      if (!isLikeNone(cosigner_index)) {
        _assertNum(cosigner_index);
      }
      wasm.privatekeygenerator_new(
        retptr,
        addBorrowedObject(xprv),
        is_multisig,
        account_index,
        !isLikeNone(cosigner_index),
        isLikeNone(cosigner_index) ? 0 : cosigner_index,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {number} index
   * @returns {PrivateKey}
   */
  receiveKey(index) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(index);
      wasm.privatekeygenerator_receiveKey(retptr, this.__wbg_ptr, index);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return PrivateKey.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {number} index
   * @returns {PrivateKey}
   */
  changeKey(index) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(index);
      wasm.privatekeygenerator_changeKey(retptr, this.__wbg_ptr, index);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return PrivateKey.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}

const ProcessSendOptionsFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_processsendoptions_free(ptr >>> 0),
      );

/**
 */
export class ProcessSendOptions {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    ProcessSendOptionsFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_processsendoptions_free(ptr);
  }

  /**
   * @param {boolean | undefined} [swallow_errors]
   */
  constructor(swallow_errors) {
    if (!isLikeNone(swallow_errors)) {
      _assertBoolean(swallow_errors);
    }
    const ret = wasm.processsendoptions_new(
      isLikeNone(swallow_errors) ? 0xffffff : swallow_errors ? 1 : 0,
    );
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * @returns {boolean | undefined}
   */
  get swallow_errors() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.processsendoptions_swallow_errors(this.__wbg_ptr);
    return ret === 0xffffff ? undefined : ret !== 0;
  }

  /**
   * @param {boolean | undefined} [value]
   */
  set swallow_errors(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    if (!isLikeNone(value)) {
      _assertBoolean(value);
    }
    wasm.processsendoptions_set_swallow_errors(
      this.__wbg_ptr,
      isLikeNone(value) ? 0xffffff : value ? 1 : 0,
    );
  }
}

const PrvKeyDataInfoFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_prvkeydatainfo_free(ptr >>> 0),
      );

/**
 * @category Wallet SDK
 */
export class PrvKeyDataInfo {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    PrvKeyDataInfoFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_prvkeydatainfo_free(ptr);
  }

  /**
   * @returns {string}
   */
  get id() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.prvkeydatainfo_id(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @returns {any}
   */
  get name() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.prvkeydatainfo_name(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {any}
   */
  get isEncrypted() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.prvkeydatainfo_isEncrypted(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {string} _name
   */
  setName(_name) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      const ptr0 = passStringToWasm0(
        _name,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.prvkeydatainfo_setName(retptr, this.__wbg_ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}

const PublicKeyFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_publickey_free(ptr >>> 0));

/**
 * Data structure that envelopes a PublicKey.
 * Only supports Schnorr-based addresses.
 * @category Wallet SDK
 */
export class PublicKey {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(PublicKey.prototype);
    obj.__wbg_ptr = ptr;
    PublicKeyFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    PublicKeyFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_publickey_free(ptr);
  }

  /**
   * Create a new [`PublicKey`] from a hex-encoded string.
   * @param {string} key
   */
  constructor(key) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        key,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.publickey_try_new(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @returns {string}
   */
  toString() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.publickey_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * Get the [`Address`] of this PublicKey.
   * Receives a [`NetworkType`] to determine the prefix of the address.
   * JavaScript: `let address = publicKey.toAddress(NetworkType.MAINNET);`.
   * @param {NetworkType | NetworkId | string} network
   * @returns {Address}
   */
  toAddress(network) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.publickey_toAddress(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(network),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Address.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * Get `ECDSA` [`Address`] of this PublicKey.
   * Receives a [`NetworkType`] to determine the prefix of the address.
   * JavaScript: `let address = publicKey.toAddress(NetworkType.MAINNET);`.
   * @param {NetworkType | NetworkId | string} network
   * @returns {Address}
   */
  toAddressECDSA(network) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.publickey_toAddressECDSA(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(network),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Address.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @returns {XOnlyPublicKey}
   */
  toXOnlyPublicKey() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.publickey_toXOnlyPublicKey(this.__wbg_ptr);
    return XOnlyPublicKey.__wrap(ret);
  }
}

const PublicKeyGeneratorFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_publickeygenerator_free(ptr >>> 0),
      );

/**
 *
 * Helper class to generate public keys from an extended public key (XPub)
 * that has been derived up to the co-signer index.
 *
 * Please note that in Kaspa master public keys use `kpub` prefix.
 *
 * @see {@link PrivateKeyGenerator}, {@link XPub}, {@link XPrv}, {@link Mnemonic}
 * @category Wallet SDK
 */
export class PublicKeyGenerator {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(PublicKeyGenerator.prototype);
    obj.__wbg_ptr = ptr;
    PublicKeyGeneratorFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    PublicKeyGeneratorFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_publickeygenerator_free(ptr);
  }

  /**
   * @param {XPub | string} kpub
   * @param {number | undefined} [cosigner_index]
   * @returns {PublicKeyGenerator}
   */
  static fromXPub(kpub, cosigner_index) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      if (!isLikeNone(cosigner_index)) {
        _assertNum(cosigner_index);
      }
      wasm.publickeygenerator_fromXPub(
        retptr,
        addHeapObject(kpub),
        !isLikeNone(cosigner_index),
        isLikeNone(cosigner_index) ? 0 : cosigner_index,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return PublicKeyGenerator.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {XPrv | string} xprv
   * @param {boolean} is_multisig
   * @param {bigint} account_index
   * @param {number | undefined} [cosigner_index]
   * @returns {PublicKeyGenerator}
   */
  static fromMasterXPrv(xprv, is_multisig, account_index, cosigner_index) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertBoolean(is_multisig);
      _assertBigInt(account_index);
      if (!isLikeNone(cosigner_index)) {
        _assertNum(cosigner_index);
      }
      wasm.publickeygenerator_fromMasterXPrv(
        retptr,
        addBorrowedObject(xprv),
        is_multisig,
        account_index,
        !isLikeNone(cosigner_index),
        isLikeNone(cosigner_index) ? 0 : cosigner_index,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return PublicKeyGenerator.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * Generate Receive Public Key derivations for a given range.
   * @param {number} start
   * @param {number} end
   * @returns {(PublicKey | string)[]}
   */
  receivePubkeys(start, end) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(start);
      _assertNum(end);
      wasm.publickeygenerator_receivePubkeys(
        retptr,
        this.__wbg_ptr,
        start,
        end,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Generate a single Receive Public Key derivation at a given index.
   * @param {number} index
   * @returns {PublicKey}
   */
  receivePubkey(index) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(index);
      wasm.publickeygenerator_receivePubkey(retptr, this.__wbg_ptr, index);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return PublicKey.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Generate a range of Receive Public Key derivations and return them as strings.
   * @param {number} start
   * @param {number} end
   * @returns {Array<string>}
   */
  receivePubkeysAsStrings(start, end) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(start);
      _assertNum(end);
      wasm.publickeygenerator_receivePubkeysAsStrings(
        retptr,
        this.__wbg_ptr,
        start,
        end,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Generate a single Receive Public Key derivation at a given index and return it as a string.
   * @param {number} index
   * @returns {string}
   */
  receivePubkeyAsString(index) {
    let deferred2_0;
    let deferred2_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(index);
      wasm.publickeygenerator_receivePubkeyAsString(
        retptr,
        this.__wbg_ptr,
        index,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr1 = r0;
      var len1 = r1;
      if (r3) {
        ptr1 = 0;
        len1 = 0;
        throw takeObject(r2);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }

  /**
   * Generate Receive Address derivations for a given range.
   * @param {NetworkType | NetworkId | string} networkType
   * @param {number} start
   * @param {number} end
   * @returns {Address[]}
   */
  receiveAddresses(networkType, start, end) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(start);
      _assertNum(end);
      wasm.publickeygenerator_receiveAddresses(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(networkType),
        start,
        end,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * Generate a single Receive Address derivation at a given index.
   * @param {NetworkType | NetworkId | string} networkType
   * @param {number} index
   * @returns {Address}
   */
  receiveAddress(networkType, index) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(index);
      wasm.publickeygenerator_receiveAddress(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(networkType),
        index,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Address.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * Generate a range of Receive Address derivations and return them as strings.
   * @param {NetworkType | NetworkId | string} networkType
   * @param {number} start
   * @param {number} end
   * @returns {Array<string>}
   */
  receiveAddressAsStrings(networkType, start, end) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(start);
      _assertNum(end);
      wasm.publickeygenerator_receiveAddressAsStrings(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(networkType),
        start,
        end,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * Generate a single Receive Address derivation at a given index and return it as a string.
   * @param {NetworkType | NetworkId | string} networkType
   * @param {number} index
   * @returns {string}
   */
  receiveAddressAsString(networkType, index) {
    let deferred2_0;
    let deferred2_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(index);
      wasm.publickeygenerator_receiveAddressAsString(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(networkType),
        index,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr1 = r0;
      var len1 = r1;
      if (r3) {
        ptr1 = 0;
        len1 = 0;
        throw takeObject(r2);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }

  /**
   * Generate Change Public Key derivations for a given range.
   * @param {number} start
   * @param {number} end
   * @returns {(PublicKey | string)[]}
   */
  changePubkeys(start, end) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(start);
      _assertNum(end);
      wasm.publickeygenerator_changePubkeys(retptr, this.__wbg_ptr, start, end);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Generate a single Change Public Key derivation at a given index.
   * @param {number} index
   * @returns {PublicKey}
   */
  changePubkey(index) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(index);
      wasm.publickeygenerator_changePubkey(retptr, this.__wbg_ptr, index);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return PublicKey.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Generate a range of Change Public Key derivations and return them as strings.
   * @param {number} start
   * @param {number} end
   * @returns {Array<string>}
   */
  changePubkeysAsStrings(start, end) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(start);
      _assertNum(end);
      wasm.publickeygenerator_changePubkeysAsStrings(
        retptr,
        this.__wbg_ptr,
        start,
        end,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Generate a single Change Public Key derivation at a given index and return it as a string.
   * @param {number} index
   * @returns {string}
   */
  changePubkeyAsString(index) {
    let deferred2_0;
    let deferred2_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(index);
      wasm.publickeygenerator_changePubkeyAsString(
        retptr,
        this.__wbg_ptr,
        index,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr1 = r0;
      var len1 = r1;
      if (r3) {
        ptr1 = 0;
        len1 = 0;
        throw takeObject(r2);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }

  /**
   * Generate Change Address derivations for a given range.
   * @param {NetworkType | NetworkId | string} networkType
   * @param {number} start
   * @param {number} end
   * @returns {Address[]}
   */
  changeAddresses(networkType, start, end) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(start);
      _assertNum(end);
      wasm.publickeygenerator_changeAddresses(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(networkType),
        start,
        end,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * Generate a single Change Address derivation at a given index.
   * @param {NetworkType | NetworkId | string} networkType
   * @param {number} index
   * @returns {Address}
   */
  changeAddress(networkType, index) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(index);
      wasm.publickeygenerator_changeAddress(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(networkType),
        index,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Address.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * Generate a range of Change Address derivations and return them as strings.
   * @param {NetworkType | NetworkId | string} networkType
   * @param {number} start
   * @param {number} end
   * @returns {Array<string>}
   */
  changeAddressAsStrings(networkType, start, end) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(start);
      _assertNum(end);
      wasm.publickeygenerator_changeAddressAsStrings(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(networkType),
        start,
        end,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * Generate a single Change Address derivation at a given index and return it as a string.
   * @param {NetworkType | NetworkId | string} networkType
   * @param {number} index
   * @returns {string}
   */
  changeAddressAsString(networkType, index) {
    let deferred2_0;
    let deferred2_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(index);
      wasm.publickeygenerator_changeAddressAsString(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(networkType),
        index,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr1 = r0;
      var len1 = r1;
      if (r3) {
        ptr1 = 0;
        len1 = 0;
        throw takeObject(r2);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }

  /**
   * @returns {string}
   */
  toString() {
    let deferred2_0;
    let deferred2_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.publickeygenerator_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr1 = r0;
      var len1 = r1;
      if (r3) {
        ptr1 = 0;
        len1 = 0;
        throw takeObject(r2);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }
}

const ReadStreamFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_readstream_free(ptr >>> 0));

export class ReadStream {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    ReadStreamFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_readstream_free(ptr);
  }

  /**
   * @param {Function} listener
   * @returns {any}
   */
  add_listener_with_open(listener) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.readstream_add_listener_with_open(
        this.__wbg_ptr,
        addBorrowedObject(listener),
      );
      return takeObject(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {Function} listener
   * @returns {any}
   */
  add_listener_with_close(listener) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.readstream_add_listener_with_close(
        this.__wbg_ptr,
        addBorrowedObject(listener),
      );
      return takeObject(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {Function} listener
   * @returns {any}
   */
  on_with_open(listener) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.readstream_on_with_open(
        this.__wbg_ptr,
        addBorrowedObject(listener),
      );
      return takeObject(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {Function} listener
   * @returns {any}
   */
  on_with_close(listener) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.readstream_on_with_close(
        this.__wbg_ptr,
        addBorrowedObject(listener),
      );
      return takeObject(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {Function} listener
   * @returns {any}
   */
  once_with_open(listener) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.readstream_once_with_open(
        this.__wbg_ptr,
        addBorrowedObject(listener),
      );
      return takeObject(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {Function} listener
   * @returns {any}
   */
  once_with_close(listener) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.readstream_once_with_close(
        this.__wbg_ptr,
        addBorrowedObject(listener),
      );
      return takeObject(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {Function} listener
   * @returns {any}
   */
  prepend_listener_with_open(listener) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.readstream_prepend_listener_with_open(
        this.__wbg_ptr,
        addBorrowedObject(listener),
      );
      return takeObject(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {Function} listener
   * @returns {any}
   */
  prepend_listener_with_close(listener) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.readstream_prepend_listener_with_close(
        this.__wbg_ptr,
        addBorrowedObject(listener),
      );
      return takeObject(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {Function} listener
   * @returns {any}
   */
  prepend_once_listener_with_open(listener) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.readstream_prepend_once_listener_with_open(
        this.__wbg_ptr,
        addBorrowedObject(listener),
      );
      return takeObject(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {Function} listener
   * @returns {any}
   */
  prepend_once_listener_with_close(listener) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.readstream_prepend_once_listener_with_close(
        this.__wbg_ptr,
        addBorrowedObject(listener),
      );
      return takeObject(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }
}

const ResolverFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_resolver_free(ptr >>> 0));

/**
 *
 * Resolver is a client for obtaining public Kaspa wRPC URL.
 *
 * Resolver queries a list of public Kaspa Resolver URLs using HTTP to fetch
 * wRPC endpoints for the given encoding, network identifier and other
 * parameters. It then provides this information to the {@link RpcClient}.
 *
 * Each time {@link RpcClient} disconnects, it will query the resolver
 * to fetch a new wRPC URL.
 *
 * ```javascript
 * // using integrated public URLs
 * let rpc = RpcClient({
 *     resolver: new Resolver(),
 *     networkId : "mainnet"
 * });
 *
 * // specifying custom resolver URLs
 * let rpc = RpcClient({
 *     resolver: new Resolver({urls: ["<resolver-url>",...]}),
 *     networkId : "mainnet"
 * });
 * ```
 *
 * @see {@link IResolverConfig}, {@link IResolverConnect}, {@link RpcClient}
 * @category Node RPC
 */
export class Resolver {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Resolver.prototype);
    obj.__wbg_ptr = ptr;
    ResolverFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      urls: this.urls,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    ResolverFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_resolver_free(ptr);
  }

  /**
   * List of public Kaspa Resolver URLs.
   * @returns {string[]}
   */
  get urls() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.resolver_urls(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * Fetches a public Kaspa wRPC endpoint for the given encoding and network identifier.
   * @see {@link Encoding}, {@link NetworkId}, {@link Node}
   * @param {Encoding} encoding
   * @param {NetworkId | string} network_id
   * @returns {Promise<NodeDescriptor>}
   */
  getNode(encoding, network_id) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertNum(encoding);
    const ret = wasm.resolver_getNode(
      this.__wbg_ptr,
      encoding,
      addHeapObject(network_id),
    );
    return takeObject(ret);
  }

  /**
   * Fetches a public Kaspa wRPC endpoint URL for the given encoding and network identifier.
   * @see {@link Encoding}, {@link NetworkId}
   * @param {Encoding} encoding
   * @param {NetworkId | string} network_id
   * @returns {Promise<string>}
   */
  getUrl(encoding, network_id) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertNum(encoding);
    const ret = wasm.resolver_getUrl(
      this.__wbg_ptr,
      encoding,
      addHeapObject(network_id),
    );
    return takeObject(ret);
  }

  /**
   * Connect to a public Kaspa wRPC endpoint for the given encoding and network identifier
   * supplied via {@link IResolverConnect} interface.
   * @see {@link IResolverConnect}, {@link RpcClient}
   * @param {IResolverConnect | NetworkId | string} options
   * @returns {Promise<RpcClient>}
   */
  connect(options) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.resolver_connect(this.__wbg_ptr, addHeapObject(options));
    return takeObject(ret);
  }

  /**
   * Creates a new Resolver client with the given
   * configuration supplied as {@link IResolverConfig}
   * interface. If not supplied, the default configuration
   * containing a list of community-operated resolvers
   * will be used.
   * @param {IResolverConfig | string[] | undefined} [args]
   */
  constructor(args) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.resolver_ctor(retptr, isLikeNone(args) ? 0 : addHeapObject(args));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}

const RpcClientFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_rpcclient_free(ptr >>> 0));

/**
 *
 *
 * Kaspa RPC client uses ([wRPC](https://github.com/workflow-rs/workflow-rs/tree/master/rpc))
 * interface to connect directly with Kaspa Node. wRPC supports
 * two types of encodings: `borsh` (binary, default) and `json`.
 *
 * There are two ways to connect: Directly to any Kaspa Node or to a
 * community-maintained public node infrastructure using the {@link Resolver} class.
 *
 * **Connecting to a public node using a resolver**
 *
 * ```javascript
 * let rpc = new RpcClient({
 *    resolver : new Resolver(),
 *    networkId : "mainnet",
 * });
 *
 * await rpc.connect();
 * ```
 *
 * **Connecting to a Kaspa Node directly**
 *
 * ```javascript
 * let rpc = new RpcClient({
 *    // if port is not provided it will default
 *    // to the default port for the networkId
 *    url : "127.0.0.1",
 *    networkId : "mainnet",
 * });
 * ```
 *
 * **Example usage**
 *
 * ```javascript
 *
 * // Create a new RPC client with a URL
 * let rpc = new RpcClient({ url : "wss://<node-wrpc-address>" });
 *
 * // Create a new RPC client with a resolver
 * // (networkId is required when using a resolver)
 * let rpc = new RpcClient({
 *     resolver : new Resolver(),
 *     networkId : "mainnet",
 * });
 *
 * rpc.addEventListener("connect", async (event) => {
 *     console.log("Connected to", rpc.url);
 *     await rpc.subscribeDaaScore();
 * });
 *
 * rpc.addEventListener("disconnect", (event) => {
 *     console.log("Disconnected from", rpc.url);
 * });
 *
 * try {
 *     await rpc.connect();
 * } catch(err) {
 *     console.log("Error connecting:", err);
 * }
 *
 * ```
 *
 * You can register event listeners to receive notifications from the RPC client
 * using {@link RpcClient.addEventListener} and {@link RpcClient.removeEventListener} functions.
 *
 * **IMPORTANT:** If RPC is disconnected, upon reconnection you do not need
 * to re-register event listeners, but your have to re-subscribe for Kaspa node
 * notifications:
 *
 * ```typescript
 * rpc.addEventListener("connect", async (event) => {
 *     console.log("Connected to", rpc.url);
 *     // re-subscribe each time we connect
 *     await rpc.subscribeDaaScore();
 *     // ... perform wallet address subscriptions
 * });
 *
 * ```
 *
 * If using NodeJS, it is important that {@link RpcClient.disconnect} is called before
 * the process exits to ensure that the WebSocket connection is properly closed.
 * Failure to do this will prevent the process from exiting.
 *
 * @category Node RPC
 */
export class RpcClient {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(RpcClient.prototype);
    obj.__wbg_ptr = ptr;
    RpcClientFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      url: this.url,
      resolver: this.resolver,
      isConnected: this.isConnected,
      encoding: this.encoding,
      nodeId: this.nodeId,
      providerName: this.providerName,
      providerUrl: this.providerUrl,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    RpcClientFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_rpcclient_free(ptr);
  }

  /**
   * Retrieves the current number of blocks in the Kaspa BlockDAG.
   * This is not a block count, not a "block height" and can not be
   * used for transaction validation.
   * Returned information: Current block count.
   *@see {@link IGetBlockCountRequest}, {@link IGetBlockCountResponse}
   *@throws `string` on an RPC error or a server-side error.
   * @param {IGetBlockCountRequest | undefined} [request]
   * @returns {Promise<IGetBlockCountResponse>}
   */
  getBlockCount(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getBlockCount(
      this.__wbg_ptr,
      isLikeNone(request) ? 0 : addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Provides information about the Directed Acyclic Graph (DAG)
   * structure of the Kaspa BlockDAG.
   * Returned information: Number of blocks in the DAG,
   * number of tips in the DAG, hash of the selected parent block,
   * difficulty of the selected parent block, selected parent block
   * blue score, selected parent block time.
   *@see {@link IGetBlockDagInfoRequest}, {@link IGetBlockDagInfoResponse}
   *@throws `string` on an RPC error or a server-side error.
   * @param {IGetBlockDagInfoRequest | undefined} [request]
   * @returns {Promise<IGetBlockDagInfoResponse>}
   */
  getBlockDagInfo(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getBlockDagInfo(
      this.__wbg_ptr,
      isLikeNone(request) ? 0 : addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Returns the total current coin supply of Kaspa network.
   * Returned information: Total coin supply.
   *@see {@link IGetCoinSupplyRequest}, {@link IGetCoinSupplyResponse}
   *@throws `string` on an RPC error or a server-side error.
   * @param {IGetCoinSupplyRequest | undefined} [request]
   * @returns {Promise<IGetCoinSupplyResponse>}
   */
  getCoinSupply(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getCoinSupply(
      this.__wbg_ptr,
      isLikeNone(request) ? 0 : addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Retrieves information about the peers connected to the Kaspa node.
   * Returned information: Peer ID, IP address and port, connection
   * status, protocol version.
   *@see {@link IGetConnectedPeerInfoRequest}, {@link IGetConnectedPeerInfoResponse}
   *@throws `string` on an RPC error or a server-side error.
   * @param {IGetConnectedPeerInfoRequest | undefined} [request]
   * @returns {Promise<IGetConnectedPeerInfoResponse>}
   */
  getConnectedPeerInfo(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getConnectedPeerInfo(
      this.__wbg_ptr,
      isLikeNone(request) ? 0 : addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Retrieves general information about the Kaspa node.
   * Returned information: Version of the Kaspa node, protocol
   * version, network identifier.
   * This call is primarily used by gRPC clients.
   * For wRPC clients, use {@link RpcClient.getServerInfo}.
   *@see {@link IGetInfoRequest}, {@link IGetInfoResponse}
   *@throws `string` on an RPC error or a server-side error.
   * @param {IGetInfoRequest | undefined} [request]
   * @returns {Promise<IGetInfoResponse>}
   */
  getInfo(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getInfo(
      this.__wbg_ptr,
      isLikeNone(request) ? 0 : addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Provides a list of addresses of known peers in the Kaspa
   * network that the node can potentially connect to.
   * Returned information: List of peer addresses.
   *@see {@link IGetPeerAddressesRequest}, {@link IGetPeerAddressesResponse}
   *@throws `string` on an RPC error or a server-side error.
   * @param {IGetPeerAddressesRequest | undefined} [request]
   * @returns {Promise<IGetPeerAddressesResponse>}
   */
  getPeerAddresses(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getPeerAddresses(
      this.__wbg_ptr,
      isLikeNone(request) ? 0 : addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Retrieves various metrics and statistics related to the
   * performance and status of the Kaspa node.
   * Returned information: Memory usage, CPU usage, network activity.
   *@see {@link IGetMetricsRequest}, {@link IGetMetricsResponse}
   *@throws `string` on an RPC error or a server-side error.
   * @param {IGetMetricsRequest | undefined} [request]
   * @returns {Promise<IGetMetricsResponse>}
   */
  getMetrics(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getMetrics(
      this.__wbg_ptr,
      isLikeNone(request) ? 0 : addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Retrieves the current sink block, which is the block with
   * the highest cumulative difficulty in the Kaspa BlockDAG.
   * Returned information: Sink block hash, sink block height.
   *@see {@link IGetSinkRequest}, {@link IGetSinkResponse}
   *@throws `string` on an RPC error or a server-side error.
   * @param {IGetSinkRequest | undefined} [request]
   * @returns {Promise<IGetSinkResponse>}
   */
  getSink(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getSink(
      this.__wbg_ptr,
      isLikeNone(request) ? 0 : addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Returns the blue score of the current sink block, indicating
   * the total amount of work that has been done on the main chain
   * leading up to that block.
   * Returned information: Blue score of the sink block.
   *@see {@link IGetSinkBlueScoreRequest}, {@link IGetSinkBlueScoreResponse}
   *@throws `string` on an RPC error or a server-side error.
   * @param {IGetSinkBlueScoreRequest | undefined} [request]
   * @returns {Promise<IGetSinkBlueScoreResponse>}
   */
  getSinkBlueScore(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getSinkBlueScore(
      this.__wbg_ptr,
      isLikeNone(request) ? 0 : addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Tests the connection and responsiveness of a Kaspa node.
   * Returned information: None.
   *@see {@link IPingRequest}, {@link IPingResponse}
   *@throws `string` on an RPC error or a server-side error.
   * @param {IPingRequest | undefined} [request]
   * @returns {Promise<IPingResponse>}
   */
  ping(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_ping(
      this.__wbg_ptr,
      isLikeNone(request) ? 0 : addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Gracefully shuts down the Kaspa node.
   * Returned information: None.
   *@see {@link IShutdownRequest}, {@link IShutdownResponse}
   *@throws `string` on an RPC error or a server-side error.
   * @param {IShutdownRequest | undefined} [request]
   * @returns {Promise<IShutdownResponse>}
   */
  shutdown(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_shutdown(
      this.__wbg_ptr,
      isLikeNone(request) ? 0 : addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Retrieves information about the Kaspa server.
   * Returned information: Version of the Kaspa server, protocol
   * version, network identifier.
   *@see {@link IGetServerInfoRequest}, {@link IGetServerInfoResponse}
   *@throws `string` on an RPC error or a server-side error.
   * @param {IGetServerInfoRequest | undefined} [request]
   * @returns {Promise<IGetServerInfoResponse>}
   */
  getServerInfo(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getServerInfo(
      this.__wbg_ptr,
      isLikeNone(request) ? 0 : addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Obtains basic information about the synchronization status of the Kaspa node.
   * Returned information: Syncing status.
   *@see {@link IGetSyncStatusRequest}, {@link IGetSyncStatusResponse}
   *@throws `string` on an RPC error or a server-side error.
   * @param {IGetSyncStatusRequest | undefined} [request]
   * @returns {Promise<IGetSyncStatusResponse>}
   */
  getSyncStatus(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getSyncStatus(
      this.__wbg_ptr,
      isLikeNone(request) ? 0 : addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Adds a peer to the Kaspa node's list of known peers.
   * Returned information: None.
   *@see {@link IAddPeerRequest}, {@link IAddPeerResponse}
   *@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
   * @param {IAddPeerRequest} request
   * @returns {Promise<IAddPeerResponse>}
   */
  addPeer(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_addPeer(this.__wbg_ptr, addHeapObject(request));
    return takeObject(ret);
  }

  /**
   * Bans a peer from connecting to the Kaspa node for a specified duration.
   * Returned information: None.
   *@see {@link IBanRequest}, {@link IBanResponse}
   *@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
   * @param {IBanRequest} request
   * @returns {Promise<IBanResponse>}
   */
  ban(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_ban(this.__wbg_ptr, addHeapObject(request));
    return takeObject(ret);
  }

  /**
   * Estimates the network's current hash rate in hashes per second.
   * Returned information: Estimated network hashes per second.
   *@see {@link IEstimateNetworkHashesPerSecondRequest}, {@link IEstimateNetworkHashesPerSecondResponse}
   *@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
   * @param {IEstimateNetworkHashesPerSecondRequest} request
   * @returns {Promise<IEstimateNetworkHashesPerSecondResponse>}
   */
  estimateNetworkHashesPerSecond(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_estimateNetworkHashesPerSecond(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Retrieves the balance of a specific address in the Kaspa BlockDAG.
   * Returned information: Balance of the address.
   *@see {@link IGetBalanceByAddressRequest}, {@link IGetBalanceByAddressResponse}
   *@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
   * @param {IGetBalanceByAddressRequest} request
   * @returns {Promise<IGetBalanceByAddressResponse>}
   */
  getBalanceByAddress(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getBalanceByAddress(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Retrieves balances for multiple addresses in the Kaspa BlockDAG.
   * Returned information: Balances of the addresses.
   *@see {@link IGetBalancesByAddressesRequest}, {@link IGetBalancesByAddressesResponse}
   *@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
   * @param {IGetBalancesByAddressesRequest | Address[] | string[]} request
   * @returns {Promise<IGetBalancesByAddressesResponse>}
   */
  getBalancesByAddresses(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getBalancesByAddresses(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Retrieves a specific block from the Kaspa BlockDAG.
   * Returned information: Block information.
   *@see {@link IGetBlockRequest}, {@link IGetBlockResponse}
   *@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
   * @param {IGetBlockRequest} request
   * @returns {Promise<IGetBlockResponse>}
   */
  getBlock(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getBlock(this.__wbg_ptr, addHeapObject(request));
    return takeObject(ret);
  }

  /**
   * Retrieves multiple blocks from the Kaspa BlockDAG.
   * Returned information: List of block information.
   *@see {@link IGetBlocksRequest}, {@link IGetBlocksResponse}
   *@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
   * @param {IGetBlocksRequest} request
   * @returns {Promise<IGetBlocksResponse>}
   */
  getBlocks(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getBlocks(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Generates a new block template for mining.
   * Returned information: Block template information.
   *@see {@link IGetBlockTemplateRequest}, {@link IGetBlockTemplateResponse}
   *@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
   * @param {IGetBlockTemplateRequest} request
   * @returns {Promise<IGetBlockTemplateResponse>}
   */
  getBlockTemplate(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getBlockTemplate(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Retrieves the estimated DAA (Difficulty Adjustment Algorithm)
   * score timestamp estimate.
   * Returned information: DAA score timestamp estimate.
   *@see {@link IGetDaaScoreTimestampEstimateRequest}, {@link IGetDaaScoreTimestampEstimateResponse}
   *@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
   * @param {IGetDaaScoreTimestampEstimateRequest} request
   * @returns {Promise<IGetDaaScoreTimestampEstimateResponse>}
   */
  getDaaScoreTimestampEstimate(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getDaaScoreTimestampEstimate(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Retrieves the current network configuration.
   * Returned information: Current network configuration.
   *@see {@link IGetCurrentNetworkRequest}, {@link IGetCurrentNetworkResponse}
   *@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
   * @param {IGetCurrentNetworkRequest} request
   * @returns {Promise<IGetCurrentNetworkResponse>}
   */
  getCurrentNetwork(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getCurrentNetwork(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Retrieves block headers from the Kaspa BlockDAG.
   * Returned information: List of block headers.
   *@see {@link IGetHeadersRequest}, {@link IGetHeadersResponse}
   *@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
   * @param {IGetHeadersRequest} request
   * @returns {Promise<IGetHeadersResponse>}
   */
  getHeaders(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getHeaders(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Retrieves mempool entries from the Kaspa node's mempool.
   * Returned information: List of mempool entries.
   *@see {@link IGetMempoolEntriesRequest}, {@link IGetMempoolEntriesResponse}
   *@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
   * @param {IGetMempoolEntriesRequest} request
   * @returns {Promise<IGetMempoolEntriesResponse>}
   */
  getMempoolEntries(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getMempoolEntries(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Retrieves mempool entries associated with specific addresses.
   * Returned information: List of mempool entries.
   *@see {@link IGetMempoolEntriesByAddressesRequest}, {@link IGetMempoolEntriesByAddressesResponse}
   *@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
   * @param {IGetMempoolEntriesByAddressesRequest} request
   * @returns {Promise<IGetMempoolEntriesByAddressesResponse>}
   */
  getMempoolEntriesByAddresses(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getMempoolEntriesByAddresses(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Retrieves a specific mempool entry by transaction ID.
   * Returned information: Mempool entry information.
   *@see {@link IGetMempoolEntryRequest}, {@link IGetMempoolEntryResponse}
   *@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
   * @param {IGetMempoolEntryRequest} request
   * @returns {Promise<IGetMempoolEntryResponse>}
   */
  getMempoolEntry(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getMempoolEntry(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Retrieves information about a subnetwork in the Kaspa BlockDAG.
   * Returned information: Subnetwork information.
   *@see {@link IGetSubnetworkRequest}, {@link IGetSubnetworkResponse}
   *@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
   * @param {IGetSubnetworkRequest} request
   * @returns {Promise<IGetSubnetworkResponse>}
   */
  getSubnetwork(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getSubnetwork(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Retrieves unspent transaction outputs (UTXOs) associated with
   * specific addresses.
   * Returned information: List of UTXOs.
   *@see {@link IGetUtxosByAddressesRequest}, {@link IGetUtxosByAddressesResponse}
   *@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
   * @param {IGetUtxosByAddressesRequest | Address[] | string[]} request
   * @returns {Promise<IGetUtxosByAddressesResponse>}
   */
  getUtxosByAddresses(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getUtxosByAddresses(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Retrieves the virtual chain corresponding to a specified block hash.
   * Returned information: Virtual chain information.
   *@see {@link IGetVirtualChainFromBlockRequest}, {@link IGetVirtualChainFromBlockResponse}
   *@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
   * @param {IGetVirtualChainFromBlockRequest} request
   * @returns {Promise<IGetVirtualChainFromBlockResponse>}
   */
  getVirtualChainFromBlock(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_getVirtualChainFromBlock(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Resolves a finality conflict in the Kaspa BlockDAG.
   * Returned information: None.
   *@see {@link IResolveFinalityConflictRequest}, {@link IResolveFinalityConflictResponse}
   *@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
   * @param {IResolveFinalityConflictRequest} request
   * @returns {Promise<IResolveFinalityConflictResponse>}
   */
  resolveFinalityConflict(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_resolveFinalityConflict(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Submits a block to the Kaspa network.
   * Returned information: None.
   *@see {@link ISubmitBlockRequest}, {@link ISubmitBlockResponse}
   *@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
   * @param {ISubmitBlockRequest} request
   * @returns {Promise<ISubmitBlockResponse>}
   */
  submitBlock(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_submitBlock(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Submits a transaction to the Kaspa network.
   * Returned information: None.
   *@see {@link ISubmitTransactionRequest}, {@link ISubmitTransactionResponse}
   *@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
   * @param {ISubmitTransactionRequest} request
   * @returns {Promise<ISubmitTransactionResponse>}
   */
  submitTransaction(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_submitTransaction(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   * Unbans a previously banned peer, allowing it to connect
   * to the Kaspa node again.
   * Returned information: None.
   *@see {@link IUnbanRequest}, {@link IUnbanResponse}
   *@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
   * @param {IUnbanRequest} request
   * @returns {Promise<IUnbanResponse>}
   */
  unban(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_unban(this.__wbg_ptr, addHeapObject(request));
    return takeObject(ret);
  }

  /**
   * Manage subscription for a block added notification event.
   * Block added notification event is produced when a new
   * block is added to the Kaspa BlockDAG.
   * @returns {Promise<void>}
   */
  subscribeBlockAdded() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_subscribeBlockAdded(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {Promise<void>}
   */
  unsubscribeBlockAdded() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_unsubscribeBlockAdded(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * Manage subscription for a finality conflict notification event.
   * Finality conflict notification event is produced when a finality
   * conflict occurs in the Kaspa BlockDAG.
   * @returns {Promise<void>}
   */
  subscribeFinalityConflict() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_subscribeFinalityConflict(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {Promise<void>}
   */
  unsubscribeFinalityConflict() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_unsubscribeFinalityConflict(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * Manage subscription for a finality conflict resolved notification event.
   * Finality conflict resolved notification event is produced when a finality
   * conflict in the Kaspa BlockDAG is resolved.
   * @returns {Promise<void>}
   */
  subscribeFinalityConflictResolved() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_subscribeFinalityConflictResolved(
      this.__wbg_ptr,
    );
    return takeObject(ret);
  }

  /**
   * @returns {Promise<void>}
   */
  unsubscribeFinalityConflictResolved() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_unsubscribeFinalityConflictResolved(
      this.__wbg_ptr,
    );
    return takeObject(ret);
  }

  /**
   * Manage subscription for a sink blue score changed notification event.
   * Sink blue score changed notification event is produced when the blue
   * score of the sink block changes in the Kaspa BlockDAG.
   * @returns {Promise<void>}
   */
  subscribeSinkBlueScoreChanged() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_subscribeSinkBlueScoreChanged(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {Promise<void>}
   */
  unsubscribeSinkBlueScoreChanged() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_unsubscribeSinkBlueScoreChanged(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * Manage subscription for a pruning point UTXO set override notification event.
   * Pruning point UTXO set override notification event is produced when the
   * UTXO set override for the pruning point changes in the Kaspa BlockDAG.
   * @returns {Promise<void>}
   */
  subscribePruningPointUtxoSetOverride() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_subscribePruningPointUtxoSetOverride(
      this.__wbg_ptr,
    );
    return takeObject(ret);
  }

  /**
   * @returns {Promise<void>}
   */
  unsubscribePruningPointUtxoSetOverride() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_unsubscribePruningPointUtxoSetOverride(
      this.__wbg_ptr,
    );
    return takeObject(ret);
  }

  /**
   * Manage subscription for a new block template notification event.
   * New block template notification event is produced when a new block
   * template is generated for mining in the Kaspa BlockDAG.
   * @returns {Promise<void>}
   */
  subscribeNewBlockTemplate() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_subscribeNewBlockTemplate(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {Promise<void>}
   */
  unsubscribeNewBlockTemplate() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_unsubscribeNewBlockTemplate(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * Manage subscription for a virtual DAA score changed notification event.
   * Virtual DAA score changed notification event is produced when the virtual
   * Difficulty Adjustment Algorithm (DAA) score changes in the Kaspa BlockDAG.
   * @returns {Promise<void>}
   */
  subscribeVirtualDaaScoreChanged() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_subscribeVirtualDaaScoreChanged(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * Manage subscription for a virtual DAA score changed notification event.
   * Virtual DAA score changed notification event is produced when the virtual
   * Difficulty Adjustment Algorithm (DAA) score changes in the Kaspa BlockDAG.
   * @returns {Promise<void>}
   */
  unsubscribeVirtualDaaScoreChanged() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_unsubscribeVirtualDaaScoreChanged(
      this.__wbg_ptr,
    );
    return takeObject(ret);
  }

  /**
   * Subscribe for a UTXOs changed notification event.
   * UTXOs changed notification event is produced when the set
   * of unspent transaction outputs (UTXOs) changes in the
   * Kaspa BlockDAG. The event notification will be scoped to the
   * provided list of addresses.
   * @param {(Address | string)[]} addresses
   * @returns {Promise<void>}
   */
  subscribeUtxosChanged(addresses) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_subscribeUtxosChanged(
      this.__wbg_ptr,
      addHeapObject(addresses),
    );
    return takeObject(ret);
  }

  /**
   * Unsubscribe from UTXOs changed notification event
   * for a specific set of addresses.
   * @param {(Address | string)[]} addresses
   * @returns {Promise<void>}
   */
  unsubscribeUtxosChanged(addresses) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_unsubscribeUtxosChanged(
      this.__wbg_ptr,
      addHeapObject(addresses),
    );
    return takeObject(ret);
  }

  /**
   * Manage subscription for a virtual chain changed notification event.
   * Virtual chain changed notification event is produced when the virtual
   * chain changes in the Kaspa BlockDAG.
   * @param {boolean} include_accepted_transaction_ids
   * @returns {Promise<void>}
   */
  subscribeVirtualChainChanged(include_accepted_transaction_ids) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertBoolean(include_accepted_transaction_ids);
    const ret = wasm.rpcclient_subscribeVirtualChainChanged(
      this.__wbg_ptr,
      include_accepted_transaction_ids,
    );
    return takeObject(ret);
  }

  /**
   * Manage subscription for a virtual chain changed notification event.
   * Virtual chain changed notification event is produced when the virtual
   * chain changes in the Kaspa BlockDAG.
   * @param {boolean} include_accepted_transaction_ids
   * @returns {Promise<void>}
   */
  unsubscribeVirtualChainChanged(include_accepted_transaction_ids) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertBoolean(include_accepted_transaction_ids);
    const ret = wasm.rpcclient_unsubscribeVirtualChainChanged(
      this.__wbg_ptr,
      include_accepted_transaction_ids,
    );
    return takeObject(ret);
  }

  /**
   * @param {Encoding} encoding
   * @param {NetworkType | NetworkId | string} network
   * @returns {number}
   */
  static defaultPort(encoding, network) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(encoding);
      wasm.rpcclient_defaultPort(retptr, encoding, addBorrowedObject(network));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return r0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * Constructs an WebSocket RPC URL given the partial URL or an IP, RPC encoding
   * and a network type.
   *
   * # Arguments
   *
   * * `url` - Partial URL or an IP address
   * * `encoding` - RPC encoding
   * * `network_type` - Network type
   * @param {string} url
   * @param {Encoding} encoding
   * @param {NetworkId} network
   * @returns {string}
   */
  static parseUrl(url, encoding, network) {
    let deferred4_0;
    let deferred4_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        url,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      _assertNum(encoding);
      _assertClass(network, NetworkId);
      if (network.__wbg_ptr === 0) {
        throw new Error("Attempt to use a moved value");
      }
      var ptr1 = network.__destroy_into_raw();
      wasm.rpcclient_parseUrl(retptr, ptr0, len0, encoding, ptr1);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr3 = r0;
      var len3 = r1;
      if (r3) {
        ptr3 = 0;
        len3 = 0;
        throw takeObject(r2);
      }
      deferred4_0 = ptr3;
      deferred4_1 = len3;
      return getStringFromWasm0(ptr3, len3);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
  }

  /**
   *
   * Create a new RPC client with optional {@link Encoding} and a `url`.
   *
   * @see {@link IRpcConfig} interface for more details.
   * @param {IRpcConfig | undefined} [config]
   */
  constructor(config) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.rpcclient_ctor(
        retptr,
        isLikeNone(config) ? 0 : addHeapObject(config),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * The current URL of the RPC client.
   * @returns {string | undefined}
   */
  get url() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.rpcclient_url(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      let v1;
      if (r0 !== 0) {
        v1 = getStringFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1, 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Current rpc resolver
   * @returns {Resolver | undefined}
   */
  get resolver() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_resolver(this.__wbg_ptr);
    return ret === 0 ? undefined : Resolver.__wrap(ret);
  }

  /**
   * Set the resolver for the RPC client.
   * This setting will take effect on the next connection.
   * @param {Resolver} resolver
   */
  setResolver(resolver) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertClass(resolver, Resolver);
      if (resolver.__wbg_ptr === 0) {
        throw new Error("Attempt to use a moved value");
      }
      var ptr0 = resolver.__destroy_into_raw();
      wasm.rpcclient_setResolver(retptr, this.__wbg_ptr, ptr0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Set the network id for the RPC client.
   * This setting will take effect on the next connection.
   * @param {NetworkId} network_id
   */
  setNetworkId(network_id) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertClass(network_id, NetworkId);
      if (network_id.__wbg_ptr === 0) {
        throw new Error("Attempt to use a moved value");
      }
      wasm.rpcclient_setNetworkId(retptr, this.__wbg_ptr, network_id.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * The current connection status of the RPC client.
   * @returns {boolean}
   */
  get isConnected() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_isConnected(this.__wbg_ptr);
    return ret !== 0;
  }

  /**
   * The current protocol encoding.
   * @returns {string}
   */
  get encoding() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.rpcclient_encoding(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * Optional: Resolver node id.
   * @returns {string | undefined}
   */
  get nodeId() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.rpcclient_nodeId(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      let v1;
      if (r0 !== 0) {
        v1 = getStringFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1, 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Optional: public node provider name.
   * @returns {string | undefined}
   */
  get providerName() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.rpcclient_providerName(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      let v1;
      if (r0 !== 0) {
        v1 = getStringFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1, 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Optional: public node provider URL.
   * @returns {string | undefined}
   */
  get providerUrl() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.rpcclient_providerUrl(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      let v1;
      if (r0 !== 0) {
        v1 = getStringFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1, 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Connect to the Kaspa RPC server. This function starts a background
   * task that connects and reconnects to the server if the connection
   * is terminated.  Use [`disconnect()`](Self::disconnect()) to
   * terminate the connection.
   * @see {@link IConnectOptions} interface for more details.
   * @param {IConnectOptions | undefined | undefined} [args]
   * @returns {Promise<void>}
   */
  connect(args) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_connect(
      this.__wbg_ptr,
      isLikeNone(args) ? 0 : addHeapObject(args),
    );
    return takeObject(ret);
  }

  /**
   * Disconnect from the Kaspa RPC server.
   * @returns {Promise<void>}
   */
  disconnect() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_disconnect(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * Start background RPC services (automatically started when invoking {@link RpcClient.connect}).
   * @returns {Promise<void>}
   */
  start() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_start(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * Stop background RPC services (automatically stopped when invoking {@link RpcClient.disconnect}).
   * @returns {Promise<void>}
   */
  stop() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.rpcclient_stop(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * Triggers a disconnection on the underlying WebSocket
   * if the WebSocket is in connected state.
   * This is intended for debug purposes only.
   * Can be used to test application reconnection logic.
   */
  triggerAbort() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.rpcclient_triggerAbort(this.__wbg_ptr);
  }

  /**
   *
   * Register an event listener callback.
   *
   * Registers a callback function to be executed when a specific event occurs.
   * The callback function will receive an {@link RpcEvent} object with the event `type` and `data`.
   *
   * **RPC Subscriptions vs Event Listeners**
   *
   * Subscriptions are used to receive notifications from the RPC client.
   * Event listeners are client-side application registrations that are
   * triggered when notifications are received.
   *
   * If node is disconnected, upon reconnection you do not need to re-register event listeners,
   * however, you have to re-subscribe for Kaspa node notifications. As such, it is recommended
   * to register event listeners when the RPC `open` event is received.
   *
   * ```javascript
   * rpc.addEventListener("connect", async (event) => {
   *     console.log("Connected to", rpc.url);
   *     await rpc.subscribeDaaScore();
   *     // ... perform wallet address subscriptions
   * });
   * ```
   *
   * **Multiple events and listeners**
   *
   * `addEventListener` can be used to register multiple event listeners for the same event
   * as well as the same event listener for multiple events.
   *
   * ```javascript
   * // Registering a single event listener for multiple events:
   * rpc.addEventListener(["connect", "disconnect"], (event) => {
   *     console.log(event);
   * });
   *
   * // Registering event listener for all events:
   * // (by omitting the event type)
   * rpc.addEventListener((event) => {
   *     console.log(event);
   * });
   *
   * // Registering multiple event listeners for the same event:
   * rpc.addEventListener("connect", (event) => { // first listener
   *     console.log(event);
   * });
   * rpc.addEventListener("connect", (event) => { // second listener
   *     console.log(event);
   * });
   * ```
   *
   * **Use of context objects**
   *
   * You can also register an event with a `context` object. When the event is triggered,
   * the `handleEvent` method of the `context` object will be called while `this` value
   * will be set to the `context` object.
   * ```javascript
   * // Registering events with a context object:
   *
   * const context = {
   *     someProperty: "someValue",
   *     handleEvent: (event) => {
   *         // the following will log "someValue"
   *         console.log(this.someProperty);
   *         console.log(event);
   *     }
   * };
   * rpc.addEventListener(["connect","disconnect"], context);
   *
   * ```
   *
   * **General use examples**
   *
   * In TypeScript you can use {@link RpcEventType} enum (such as `RpcEventType.Connect`)
   * or `string` (such as "connect") to register event listeners.
   * In JavaScript you can only use `string`.
   *
   * ```typescript
   * // Example usage (TypeScript):
   *
   * rpc.addEventListener(RpcEventType.Connect, (event) => {
   *     console.log("Connected to", rpc.url);
   * });
   *
   * rpc.addEventListener(RpcEventType.VirtualDaaScoreChanged, (event) => {
   *     console.log(event.type,event.data);
   * });
   * await rpc.subscribeDaaScore();
   *
   * rpc.addEventListener(RpcEventType.BlockAdded, (event) => {
   *     console.log(event.type,event.data);
   * });
   * await rpc.subscribeBlockAdded();
   *
   * // Example usage (JavaScript):
   *
   * rpc.addEventListener("virtual-daa-score-changed", (event) => {
   *     console.log(event.type,event.data);
   * });
   *
   * await rpc.subscribeDaaScore();
   * rpc.addEventListener("block-added", (event) => {
   *     console.log(event.type,event.data);
   * });
   * await rpc.subscribeBlockAdded();
   * ```
   *
   * @see {@link RpcEventType} for a list of supported events.
   * @see {@link RpcEventData} for the event data interface specification.
   * @see {@link RpcClient.removeEventListener}, {@link RpcClient.removeAllEventListeners}
   * @param {RpcEventType | string | RpcEventCallback} event
   * @param {RpcEventCallback | undefined} [callback]
   */
  addEventListener(event, callback) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.rpcclient_addEventListener(
        retptr,
        this.__wbg_ptr,
        addHeapObject(event),
        isLikeNone(callback) ? 0 : addHeapObject(callback),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   *
   * Unregister an event listener.
   * This function will remove the callback for the specified event.
   * If the `callback` is not supplied, all callbacks will be
   * removed for the specified event.
   *
   * @see {@link RpcClient.addEventListener}
   * @param {RpcEventType | string} event
   * @param {RpcEventCallback | undefined} [callback]
   */
  removeEventListener(event, callback) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.rpcclient_removeEventListener(
        retptr,
        this.__wbg_ptr,
        addHeapObject(event),
        isLikeNone(callback) ? 0 : addHeapObject(callback),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   *
   * Unregister a single event listener callback from all events.
   *
   *
   * @param {RpcEventCallback} callback
   */
  clearEventListener(callback) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.rpcclient_clearEventListener(
        retptr,
        this.__wbg_ptr,
        addHeapObject(callback),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   *
   * Unregister all notification callbacks for all events.
   */
  removeAllEventListeners() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.rpcclient_removeAllEventListeners(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}

const ScriptBuilderFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_scriptbuilder_free(ptr >>> 0),
      );

/**
 * ScriptBuilder provides a facility for building custom scripts. It allows
 * you to push opcodes, ints, and data while respecting canonical encoding. In
 * general it does not ensure the script will execute correctly, however any
 * data pushes which would exceed the maximum allowed script engine limits and
 * are therefore guaranteed not to execute will not be pushed and will result in
 * the Script function returning an error.
 *
 * @see {@link Opcode}
 * @category Consensus
 */
export class ScriptBuilder {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(ScriptBuilder.prototype);
    obj.__wbg_ptr = ptr;
    ScriptBuilderFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {};
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    ScriptBuilderFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_scriptbuilder_free(ptr);
  }

  /**
   */
  constructor() {
    const ret = wasm.scriptbuilder_new();
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * Creates a new ScriptBuilder over an existing script.
   * Supplied script can be represented as an `Uint8Array` or a `HexString`.
   * @param {HexString | Uint8Array} script
   * @returns {ScriptBuilder}
   */
  static fromScript(script) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.scriptbuilder_fromScript(retptr, addHeapObject(script));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return ScriptBuilder.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Pushes the passed opcode to the end of the script. The script will not
   * be modified if pushing the opcode would cause the script to exceed the
   * maximum allowed script engine size.
   * @param {number} op
   * @returns {ScriptBuilder}
   */
  addOp(op) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(op);
      wasm.scriptbuilder_addOp(retptr, this.__wbg_ptr, op);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return ScriptBuilder.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Adds the passed opcodes to the end of the script.
   * Supplied opcodes can be represented as an `Uint8Array` or a `HexString`.
   * @param {HexString | Uint8Array} opcodes
   * @returns {ScriptBuilder}
   */
  addOps(opcodes) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.scriptbuilder_addOps(retptr, this.__wbg_ptr, addHeapObject(opcodes));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return ScriptBuilder.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * AddData pushes the passed data to the end of the script. It automatically
   * chooses canonical opcodes depending on the length of the data.
   *
   * A zero length buffer will lead to a push of empty data onto the stack (Op0 = OpFalse)
   * and any push of data greater than [`MAX_SCRIPT_ELEMENT_SIZE`](kaspa_txscript::MAX_SCRIPT_ELEMENT_SIZE) will not modify
   * the script since that is not allowed by the script engine.
   *
   * Also, the script will not be modified if pushing the data would cause the script to
   * exceed the maximum allowed script engine size [`MAX_SCRIPTS_SIZE`](kaspa_txscript::MAX_SCRIPTS_SIZE).
   * @param {HexString | Uint8Array} data
   * @returns {ScriptBuilder}
   */
  addData(data) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.scriptbuilder_addData(retptr, this.__wbg_ptr, addHeapObject(data));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return ScriptBuilder.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {bigint} value
   * @returns {ScriptBuilder}
   */
  addI64(value) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertBigInt(value);
      wasm.scriptbuilder_addI64(retptr, this.__wbg_ptr, value);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return ScriptBuilder.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {bigint} lock_time
   * @returns {ScriptBuilder}
   */
  addLockTime(lock_time) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertBigInt(lock_time);
      wasm.scriptbuilder_addLockTime(retptr, this.__wbg_ptr, lock_time);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return ScriptBuilder.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {bigint} sequence
   * @returns {ScriptBuilder}
   */
  addSequence(sequence) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertBigInt(sequence);
      wasm.scriptbuilder_addSequence(retptr, this.__wbg_ptr, sequence);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return ScriptBuilder.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {HexString | Uint8Array} data
   * @returns {number}
   */
  static canonicalDataSize(data) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.scriptbuilder_canonicalDataSize(retptr, addHeapObject(data));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return r0 >>> 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Get script bytes represented by a hex string.
   * @returns {HexString}
   */
  toString() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.scriptbuilder_toString(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * Drains (empties) the script builder, returning the
   * script bytes represented by a hex string.
   * @returns {HexString}
   */
  drain() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.scriptbuilder_drain(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * Creates an equivalent pay-to-script-hash script.
   * Can be used to create an P2SH address.
   * @see {@link addressFromScriptPublicKey}
   * @returns {ScriptPublicKey}
   */
  createPayToScriptHashScript() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.scriptbuilder_createPayToScriptHashScript(this.__wbg_ptr);
    return ScriptPublicKey.__wrap(ret);
  }

  /**
   * Generates a signature script that fits a pay-to-script-hash script.
   * @param {HexString | Uint8Array} signature
   * @returns {HexString}
   */
  encodePayToScriptHashSignatureScript(signature) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.scriptbuilder_encodePayToScriptHashSignatureScript(
        retptr,
        this.__wbg_ptr,
        addHeapObject(signature),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {IHexViewConfig | undefined} [args]
   * @returns {string}
   */
  hexView(args) {
    let deferred2_0;
    let deferred2_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.scriptbuilder_hexView(
        retptr,
        this.__wbg_ptr,
        isLikeNone(args) ? 0 : addHeapObject(args),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr1 = r0;
      var len1 = r1;
      if (r3) {
        ptr1 = 0;
        len1 = 0;
        throw takeObject(r2);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }
}

const ScriptPublicKeyFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_scriptpublickey_free(ptr >>> 0),
      );

/**
 * Represents a Kaspad ScriptPublicKey
 * @category Consensus
 */
export class ScriptPublicKey {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(ScriptPublicKey.prototype);
    obj.__wbg_ptr = ptr;
    ScriptPublicKeyFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      version: this.version,
      script: this.script,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    ScriptPublicKeyFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_scriptpublickey_free(ptr);
  }

  /**
   * @returns {number}
   */
  get version() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.__wbg_get_scriptpublickey_version(this.__wbg_ptr);
    return ret;
  }

  /**
   * @param {number} arg0
   */
  set version(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertNum(arg0);
    wasm.__wbg_set_scriptpublickey_version(this.__wbg_ptr, arg0);
  }

  /**
   * @param {number} version
   * @param {any} script
   */
  constructor(version, script) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(version);
      wasm.scriptpublickey_constructor(retptr, version, addHeapObject(script));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @returns {string}
   */
  get script() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.scriptpublickey_script_as_hex(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
}

const SetAadOptionsFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_setaadoptions_free(ptr >>> 0),
      );

/**
 */
export class SetAadOptions {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    SetAadOptionsFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_setaadoptions_free(ptr);
  }

  /**
   * @param {Function} flush
   * @param {number} plaintext_length
   * @param {Function} transform
   */
  constructor(flush, plaintext_length, transform) {
    const ret = wasm.setaadoptions_new(
      addHeapObject(flush),
      plaintext_length,
      addHeapObject(transform),
    );
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * @returns {Function}
   */
  get flush() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.setaadoptions_flush(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {Function} value
   */
  set flush(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.setaadoptions_set_flush(this.__wbg_ptr, addHeapObject(value));
  }

  /**
   * @returns {number}
   */
  get plaintextLength() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.setaadoptions_plaintextLength(this.__wbg_ptr);
    return ret;
  }

  /**
   * @param {number} value
   */
  set plaintext_length(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.setaadoptions_set_plaintext_length(this.__wbg_ptr, value);
  }

  /**
   * @returns {Function}
   */
  get transform() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.setaadoptions_transform(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {Function} value
   */
  set transform(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.setaadoptions_set_transform(this.__wbg_ptr, addHeapObject(value));
  }
}

const SigHashTypeFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_sighashtype_free(ptr >>> 0));

/**
 */
export class SigHashType {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    SigHashTypeFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_sighashtype_free(ptr);
  }
}

const StorageFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_storage_free(ptr >>> 0));

/**
 * Wallet file storage interface
 * @category Wallet SDK
 */
export class Storage {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  toJSON() {
    return {
      filename: this.filename,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    StorageFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_storage_free(ptr);
  }

  /**
   * @returns {string}
   */
  get filename() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.storage_filename(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
}

const StreamTransformOptionsFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_streamtransformoptions_free(ptr >>> 0),
      );

/**
 */
export class StreamTransformOptions {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    StreamTransformOptionsFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_streamtransformoptions_free(ptr);
  }

  /**
   * @param {Function} flush
   * @param {Function} transform
   */
  constructor(flush, transform) {
    const ret = wasm.streamtransformoptions_new(
      addHeapObject(flush),
      addHeapObject(transform),
    );
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * @returns {Function}
   */
  get flush() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.streamtransformoptions_flush(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {Function} value
   */
  set flush(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.streamtransformoptions_set_flush(this.__wbg_ptr, addHeapObject(value));
  }

  /**
   * @returns {Function}
   */
  get transform() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.streamtransformoptions_transform(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {Function} value
   */
  set transform(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.streamtransformoptions_set_transform(
      this.__wbg_ptr,
      addHeapObject(value),
    );
  }
}

const TransactionFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_transaction_free(ptr >>> 0));

/**
 * Represents a Kaspa transaction.
 * This is an artificial construct that includes additional
 * transaction-related data such as additional data from UTXOs
 * used by transaction inputs.
 * @category Consensus
 */
export class Transaction {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Transaction.prototype);
    obj.__wbg_ptr = ptr;
    TransactionFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      id: this.id,
      inputs: this.inputs,
      outputs: this.outputs,
      version: this.version,
      lock_time: this.lock_time,
      gas: this.gas,
      subnetworkId: this.subnetworkId,
      payload: this.payload,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    TransactionFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_transaction_free(ptr);
  }

  /**
   * Serializes the transaction to a pure JavaScript Object.
   * The schema of the JavaScript object is defined by {@link ISerializableTransaction}.
   * @see {@link ISerializableTransaction}
   * @returns {ISerializableTransaction}
   */
  serializeToObject() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.transaction_serializeToObject(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Serializes the transaction to a JSON string.
   * The schema of the JSON is defined by {@link ISerializableTransaction}.
   * @returns {string}
   */
  serializeToJSON() {
    let deferred2_0;
    let deferred2_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.transaction_serializeToJSON(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr1 = r0;
      var len1 = r1;
      if (r3) {
        ptr1 = 0;
        len1 = 0;
        throw takeObject(r2);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }

  /**
   * Serializes the transaction to a "Safe" JSON schema where it converts all `bigint` values to `string` to avoid potential client-side precision loss.
   * @returns {string}
   */
  serializeToSafeJSON() {
    let deferred2_0;
    let deferred2_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.transaction_serializeToSafeJSON(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr1 = r0;
      var len1 = r1;
      if (r3) {
        ptr1 = 0;
        len1 = 0;
        throw takeObject(r2);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }

  /**
   * Deserialize the {@link Transaction} Object from a pure JavaScript Object.
   * @param {any} js_value
   * @returns {Transaction}
   */
  static deserializeFromObject(js_value) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.transaction_deserializeFromObject(
        retptr,
        addBorrowedObject(js_value),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Transaction.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * Deserialize the {@link Transaction} Object from a JSON string.
   * @param {string} json
   * @returns {Transaction}
   */
  static deserializeFromJSON(json) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        json,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.transaction_deserializeFromJSON(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Transaction.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Deserialize the {@link Transaction} Object from a "Safe" JSON schema where all `bigint` values are represented as `string`.
   * @param {string} json
   * @returns {Transaction}
   */
  static deserializeFromSafeJSON(json) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        json,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.transaction_deserializeFromSafeJSON(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Transaction.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Determines whether or not a transaction is a coinbase transaction. A coinbase
   * transaction is a special transaction created by miners that distributes fees and block subsidy
   * to the previous blocks' miners, and specifies the script_pub_key that will be used to pay the current
   * miner in future blocks.
   * @returns {boolean}
   */
  is_coinbase() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.transaction_is_coinbase(this.__wbg_ptr);
    return ret !== 0;
  }

  /**
   * Recompute and finalize the tx id based on updated tx fields
   * @returns {Hash}
   */
  finalize() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.transaction_finalize(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Hash.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Returns the transaction ID
   * @returns {string}
   */
  get id() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.transaction_id(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @param {ITransaction | Transaction} js_value
   */
  constructor(js_value) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.transaction_constructor(retptr, addBorrowedObject(js_value));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @returns {TransactionInput[]}
   */
  get inputs() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.transaction_get_inputs_as_js_array(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * Returns a list of unique addresses used by transaction inputs.
   * This method can be used to determine addresses used by transaction inputs
   * in order to select private keys needed for transaction signing.
   * @param {NetworkType | NetworkId | string} network_type
   * @returns {Address[]}
   */
  addresses(network_type) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.transaction_addresses(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(network_type),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {(ITransactionInput | TransactionInput)[]} js_value
   */
  set inputs(js_value) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      wasm.transaction_set_inputs_from_js_array(
        this.__wbg_ptr,
        addBorrowedObject(js_value),
      );
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @returns {TransactionOutput[]}
   */
  get outputs() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.transaction_get_outputs_as_js_array(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {(ITransactionOutput | TransactionOutput)[]} js_value
   */
  set outputs(js_value) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      wasm.transaction_set_outputs_from_js_array(
        this.__wbg_ptr,
        addBorrowedObject(js_value),
      );
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @returns {number}
   */
  get version() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.transaction_version(this.__wbg_ptr);
    return ret;
  }

  /**
   * @param {number} v
   */
  set version(v) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertNum(v);
    wasm.transaction_set_version(this.__wbg_ptr, v);
  }

  /**
   * @returns {bigint}
   */
  get lock_time() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.transaction_lock_time(this.__wbg_ptr);
    return BigInt.asUintN(64, ret);
  }

  /**
   * @param {bigint} v
   */
  set lock_time(v) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertBigInt(v);
    wasm.transaction_set_lock_time(this.__wbg_ptr, v);
  }

  /**
   * @returns {bigint}
   */
  get gas() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.transaction_gas(this.__wbg_ptr);
    return BigInt.asUintN(64, ret);
  }

  /**
   * @param {bigint} v
   */
  set gas(v) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertBigInt(v);
    wasm.transaction_set_gas(this.__wbg_ptr, v);
  }

  /**
   * @returns {string}
   */
  get subnetworkId() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.transaction_get_subnetwork_id_as_hex(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @param {any} js_value
   */
  set subnetworkId(js_value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.transaction_set_subnetwork_id_from_js_value(
      this.__wbg_ptr,
      addHeapObject(js_value),
    );
  }

  /**
   * @returns {string}
   */
  get payload() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.transaction_get_payload_as_hex_string(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @param {any} js_value
   */
  set payload(js_value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.transaction_set_payload_from_js_value(
      this.__wbg_ptr,
      addHeapObject(js_value),
    );
  }
}

const TransactionInputFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_transactioninput_free(ptr >>> 0),
      );

/**
 * Represents a Kaspa transaction input
 * @category Consensus
 */
export class TransactionInput {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(TransactionInput.prototype);
    obj.__wbg_ptr = ptr;
    TransactionInputFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      previousOutpoint: this.previousOutpoint,
      signatureScript: this.signatureScript,
      sequence: this.sequence,
      sigOpCount: this.sigOpCount,
      utxo: this.utxo,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    TransactionInputFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_transactioninput_free(ptr);
  }

  /**
   * @param {ITransactionInput | TransactionInput} value
   */
  constructor(value) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.transactioninput_constructor(retptr, addBorrowedObject(value));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @returns {TransactionOutpoint}
   */
  get previousOutpoint() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.transactioninput_get_previous_outpoint(this.__wbg_ptr);
    return TransactionOutpoint.__wrap(ret);
  }

  /**
   * @param {any} js_value
   */
  set previousOutpoint(js_value) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.transactioninput_set_previous_outpoint(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(js_value),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @returns {string}
   */
  get signatureScript() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.transactioninput_get_signature_script_as_hex(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @param {any} js_value
   */
  set signatureScript(js_value) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.transactioninput_set_signature_script_from_js_value(
        retptr,
        this.__wbg_ptr,
        addHeapObject(js_value),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @returns {bigint}
   */
  get sequence() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.transactioninput_get_sequence(this.__wbg_ptr);
    return BigInt.asUintN(64, ret);
  }

  /**
   * @param {bigint} sequence
   */
  set sequence(sequence) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertBigInt(sequence);
    wasm.transactioninput_set_sequence(this.__wbg_ptr, sequence);
  }

  /**
   * @returns {number}
   */
  get sigOpCount() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.transactioninput_get_sig_op_count(this.__wbg_ptr);
    return ret;
  }

  /**
   * @param {number} sig_op_count
   */
  set sigOpCount(sig_op_count) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertNum(sig_op_count);
    wasm.transactioninput_set_sig_op_count(this.__wbg_ptr, sig_op_count);
  }

  /**
   * @returns {UtxoEntryReference | undefined}
   */
  get utxo() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.transactioninput_get_utxo(this.__wbg_ptr);
    return ret === 0 ? undefined : UtxoEntryReference.__wrap(ret);
  }
}

const TransactionOutpointFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_transactionoutpoint_free(ptr >>> 0),
      );

/**
 * Represents a Kaspa transaction outpoint.
 * NOTE: This struct is immutable - to create a custom outpoint
 * use the `TransactionOutpoint::new` constructor. (in JavaScript
 * use `new TransactionOutpoint(transactionId, index)`).
 * @category Consensus
 */
export class TransactionOutpoint {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(TransactionOutpoint.prototype);
    obj.__wbg_ptr = ptr;
    TransactionOutpointFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      transactionId: this.transactionId,
      index: this.index,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    TransactionOutpointFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_transactionoutpoint_free(ptr);
  }

  /**
   * @param {Hash} transaction_id
   * @param {number} index
   */
  constructor(transaction_id, index) {
    _assertClass(transaction_id, Hash);
    if (transaction_id.__wbg_ptr === 0) {
      throw new Error("Attempt to use a moved value");
    }
    var ptr0 = transaction_id.__destroy_into_raw();
    _assertNum(index);
    const ret = wasm.transactionoutpoint_ctor(ptr0, index);
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * @returns {string}
   */
  getId() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.transactionoutpoint_getId(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @returns {string}
   */
  get transactionId() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.transactionoutpoint_transactionId(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @returns {number}
   */
  get index() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.transactionoutpoint_index(this.__wbg_ptr);
    return ret >>> 0;
  }
}

const TransactionOutputFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_transactionoutput_free(ptr >>> 0),
      );

/**
 * Represents a Kaspad transaction output
 * @category Consensus
 */
export class TransactionOutput {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(TransactionOutput.prototype);
    obj.__wbg_ptr = ptr;
    TransactionOutputFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      value: this.value,
      scriptPublicKey: this.scriptPublicKey,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    TransactionOutputFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_transactionoutput_free(ptr);
  }

  /**
   * TransactionOutput constructor
   * @param {bigint} value
   * @param {ScriptPublicKey} script_public_key
   */
  constructor(value, script_public_key) {
    _assertBigInt(value);
    _assertClass(script_public_key, ScriptPublicKey);
    if (script_public_key.__wbg_ptr === 0) {
      throw new Error("Attempt to use a moved value");
    }
    const ret = wasm.transactionoutput_ctor(value, script_public_key.__wbg_ptr);
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * @returns {bigint}
   */
  get value() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.transactionoutput_value(this.__wbg_ptr);
    return BigInt.asUintN(64, ret);
  }

  /**
   * @param {bigint} v
   */
  set value(v) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertBigInt(v);
    wasm.transactionoutput_set_value(this.__wbg_ptr, v);
  }

  /**
   * @returns {ScriptPublicKey}
   */
  get scriptPublicKey() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.transactionoutput_scriptPublicKey(this.__wbg_ptr);
    return ScriptPublicKey.__wrap(ret);
  }

  /**
   * @param {ScriptPublicKey} v
   */
  set scriptPublicKey(v) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertClass(v, ScriptPublicKey);
    if (v.__wbg_ptr === 0) {
      throw new Error("Attempt to use a moved value");
    }
    wasm.transactionoutput_set_scriptPublicKey(this.__wbg_ptr, v.__wbg_ptr);
  }
}

const TransactionRecordFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_transactionrecord_free(ptr >>> 0),
      );

/**
 * @category Wallet SDK
 */
export class TransactionRecord {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(TransactionRecord.prototype);
    obj.__wbg_ptr = ptr;
    TransactionRecordFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      id: this.id,
      unixtimeMsec: this.unixtimeMsec,
      network: this.network,
      note: this.note,
      metadata: this.metadata,
      value: this.value,
      blockDaaScore: this.blockDaaScore,
      binding: this.binding,
      data: this.data,
      type: this.type,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    TransactionRecordFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_transactionrecord_free(ptr);
  }

  /**
   * @returns {Hash}
   */
  get id() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.__wbg_get_transactionrecord_id(this.__wbg_ptr);
    return Hash.__wrap(ret);
  }

  /**
   * @param {Hash} arg0
   */
  set id(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertClass(arg0, Hash);
    if (arg0.__wbg_ptr === 0) {
      throw new Error("Attempt to use a moved value");
    }
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_transactionrecord_id(this.__wbg_ptr, ptr0);
  }

  /**
   * Unix time in milliseconds
   * @returns {bigint | undefined}
   */
  get unixtimeMsec() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.__wbg_get_transactionrecord_unixtimeMsec(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r2 = getBigInt64Memory0()[retptr / 8 + 1];
      return r0 === 0 ? undefined : BigInt.asUintN(64, r2);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Unix time in milliseconds
   * @param {bigint | undefined} [arg0]
   */
  set unixtimeMsec(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    if (!isLikeNone(arg0)) {
      _assertBigInt(arg0);
    }
    wasm.__wbg_set_transactionrecord_unixtimeMsec(
      this.__wbg_ptr,
      !isLikeNone(arg0),
      isLikeNone(arg0) ? BigInt(0) : arg0,
    );
  }

  /**
   * @returns {NetworkId}
   */
  get network() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.__wbg_get_transactionrecord_network(this.__wbg_ptr);
    return NetworkId.__wrap(ret);
  }

  /**
   * @param {NetworkId} arg0
   */
  set network(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertClass(arg0, NetworkId);
    if (arg0.__wbg_ptr === 0) {
      throw new Error("Attempt to use a moved value");
    }
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_transactionrecord_network(this.__wbg_ptr, ptr0);
  }

  /**
   * @returns {string | undefined}
   */
  get note() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.__wbg_get_transactionrecord_note(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      let v1;
      if (r0 !== 0) {
        v1 = getStringFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1, 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {string | undefined} [arg0]
   */
  set note(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    var ptr0 = isLikeNone(arg0)
      ? 0
      : passStringToWasm0(
          arg0,
          wasm.__wbindgen_malloc,
          wasm.__wbindgen_realloc,
        );
    var len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_transactionrecord_note(this.__wbg_ptr, ptr0, len0);
  }

  /**
   * @returns {string | undefined}
   */
  get metadata() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.__wbg_get_transactionrecord_metadata(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      let v1;
      if (r0 !== 0) {
        v1 = getStringFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1, 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {string | undefined} [arg0]
   */
  set metadata(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    var ptr0 = isLikeNone(arg0)
      ? 0
      : passStringToWasm0(
          arg0,
          wasm.__wbindgen_malloc,
          wasm.__wbindgen_realloc,
        );
    var len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_transactionrecord_metadata(this.__wbg_ptr, ptr0, len0);
  }

  /**
   * @returns {bigint}
   */
  get value() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.transactionrecord_value(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {bigint}
   */
  get blockDaaScore() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.transactionrecord_blockDaaScore(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {IBinding}
   */
  get binding() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.transactionrecord_binding(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {ITransactionData}
   */
  get data() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.transactionrecord_data(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {string}
   */
  get type() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.transactionrecord_type(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * Check if the transaction record has the given address within the associated UTXO set.
   * @param {Address} address
   * @returns {boolean}
   */
  hasAddress(address) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertClass(address, Address);
    if (address.__wbg_ptr === 0) {
      throw new Error("Attempt to use a moved value");
    }
    const ret = wasm.transactionrecord_hasAddress(
      this.__wbg_ptr,
      address.__wbg_ptr,
    );
    return ret !== 0;
  }

  /**
   * Serialize the transaction record to a JavaScript object.
   * @returns {any}
   */
  serialize() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.transactionrecord_serialize(this.__wbg_ptr);
    return takeObject(ret);
  }
}

const TransactionRecordNotificationFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_transactionrecordnotification_free(ptr >>> 0),
      );

/**
 */
export class TransactionRecordNotification {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(TransactionRecordNotification.prototype);
    obj.__wbg_ptr = ptr;
    TransactionRecordNotificationFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      type: this.type,
      data: this.data,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    TransactionRecordNotificationFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_transactionrecordnotification_free(ptr);
  }

  /**
   * @returns {string}
   */
  get type() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.__wbg_get_transactionrecordnotification_type(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @param {string} arg0
   */
  set type(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_transactionrecordnotification_type(
      this.__wbg_ptr,
      ptr0,
      len0,
    );
  }

  /**
   * @returns {TransactionRecord}
   */
  get data() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.__wbg_get_transactionrecordnotification_data(
      this.__wbg_ptr,
    );
    return TransactionRecord.__wrap(ret);
  }

  /**
   * @param {TransactionRecord} arg0
   */
  set data(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertClass(arg0, TransactionRecord);
    if (arg0.__wbg_ptr === 0) {
      throw new Error("Attempt to use a moved value");
    }
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_transactionrecordnotification_data(this.__wbg_ptr, ptr0);
  }
}

const TransactionSigningHashFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_transactionsigninghash_free(ptr >>> 0),
      );

/**
 * @category Wallet SDK
 */
export class TransactionSigningHash {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    TransactionSigningHashFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_transactionsigninghash_free(ptr);
  }

  /**
   */
  constructor() {
    const ret = wasm.transactionsigninghash_new();
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * @param {HexString | Uint8Array} data
   */
  update(data) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.transactionsigninghash_update(
        retptr,
        this.__wbg_ptr,
        addHeapObject(data),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @returns {string}
   */
  finalize() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.transactionsigninghash_finalize(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
}

const TransactionSigningHashECDSAFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_transactionsigninghashecdsa_free(ptr >>> 0),
      );

/**
 * @category Wallet SDK
 */
export class TransactionSigningHashECDSA {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    TransactionSigningHashECDSAFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_transactionsigninghashecdsa_free(ptr);
  }

  /**
   */
  constructor() {
    const ret = wasm.transactionsigninghashecdsa_new();
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * @param {HexString | Uint8Array} data
   */
  update(data) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.transactionsigninghashecdsa_update(
        retptr,
        this.__wbg_ptr,
        addHeapObject(data),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @returns {string}
   */
  finalize() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.transactionsigninghashecdsa_finalize(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
}

const TransactionUtxoEntryFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_transactionutxoentry_free(ptr >>> 0),
      );

/**
 * Holds details about an individual transaction output in a utxo
 * set such as whether or not it was contained in a coinbase tx, the daa
 * score of the block that accepts the tx, its public key script, and how
 * much it pays.
 * @category Consensus
 */
export class TransactionUtxoEntry {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  toJSON() {
    return {
      amount: this.amount,
      scriptPublicKey: this.scriptPublicKey,
      blockDaaScore: this.blockDaaScore,
      isCoinbase: this.isCoinbase,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    TransactionUtxoEntryFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_transactionutxoentry_free(ptr);
  }

  /**
   * @returns {bigint}
   */
  get amount() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.__wbg_get_transactionutxoentry_amount(this.__wbg_ptr);
    return BigInt.asUintN(64, ret);
  }

  /**
   * @param {bigint} arg0
   */
  set amount(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertBigInt(arg0);
    wasm.__wbg_set_transactionutxoentry_amount(this.__wbg_ptr, arg0);
  }

  /**
   * @returns {ScriptPublicKey}
   */
  get scriptPublicKey() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.__wbg_get_transactionutxoentry_scriptPublicKey(
      this.__wbg_ptr,
    );
    return ScriptPublicKey.__wrap(ret);
  }

  /**
   * @param {ScriptPublicKey} arg0
   */
  set scriptPublicKey(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertClass(arg0, ScriptPublicKey);
    if (arg0.__wbg_ptr === 0) {
      throw new Error("Attempt to use a moved value");
    }
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_transactionutxoentry_scriptPublicKey(this.__wbg_ptr, ptr0);
  }

  /**
   * @returns {bigint}
   */
  get blockDaaScore() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.__wbg_get_transactionutxoentry_blockDaaScore(
      this.__wbg_ptr,
    );
    return BigInt.asUintN(64, ret);
  }

  /**
   * @param {bigint} arg0
   */
  set blockDaaScore(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertBigInt(arg0);
    wasm.__wbg_set_transactionutxoentry_blockDaaScore(this.__wbg_ptr, arg0);
  }

  /**
   * @returns {boolean}
   */
  get isCoinbase() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.__wbg_get_transactionutxoentry_isCoinbase(this.__wbg_ptr);
    return ret !== 0;
  }

  /**
   * @param {boolean} arg0
   */
  set isCoinbase(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertBoolean(arg0);
    wasm.__wbg_set_transactionutxoentry_isCoinbase(this.__wbg_ptr, arg0);
  }
}

const UserInfoOptionsFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_userinfooptions_free(ptr >>> 0),
      );

/**
 */
export class UserInfoOptions {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(UserInfoOptions.prototype);
    obj.__wbg_ptr = ptr;
    UserInfoOptionsFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    UserInfoOptionsFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_userinfooptions_free(ptr);
  }

  /**
   * @param {string | undefined} [encoding]
   */
  constructor(encoding) {
    const ret = wasm.userinfooptions_new_with_values(
      isLikeNone(encoding) ? 0 : addHeapObject(encoding),
    );
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * @returns {UserInfoOptions}
   */
  static new() {
    const ret = wasm.userinfooptions_new();
    return UserInfoOptions.__wrap(ret);
  }

  /**
   * @returns {string | undefined}
   */
  get encoding() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.userinfooptions_encoding(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {string | undefined} [value]
   */
  set encoding(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.userinfooptions_set_encoding(
      this.__wbg_ptr,
      isLikeNone(value) ? 0 : addHeapObject(value),
    );
  }
}

const UtxoContextFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_utxocontext_free(ptr >>> 0));

/**
 *
 * UtxoContext is a class that provides a way to track addresses activity
 * on the Kaspa network.  When an address is registered with UtxoContext
 * it aggregates all UTXO entries for that address and emits events when
 * any activity against these addresses occurs.
 *
 * UtxoContext constructor accepts {@link IUtxoContextArgs} interface that
 * can contain an optional id parameter.  If supplied, this `id` parameter
 * will be included in all notifications emitted by the UtxoContext as
 * well as included as a part of {@link ITransactionRecord} emitted when
 * transactions occur. If not provided, a random id will be generated. This id
 * typically represents an account id in the context of a wallet application.
 * The integrated Wallet API uses UtxoContext to represent wallet accounts.
 *
 * **Exchanges:** if you are building an exchange wallet, it is recommended
 * to use UtxoContext for each user account.  This way you can track and isolate
 * each user activity (use address set, balances, transaction records).
 *
 * UtxoContext maintains a real-time cumulative balance of all addresses
 * registered against it and provides balance update notification events
 * when the balance changes.
 *
 * The UtxoContext balance is comprised of 3 values:
 * - `mature`: amount of funds available for spending.
 * - `pending`: amount of funds that are being received.
 * - `outgoing`: amount of funds that are being sent but are not yet accepted by the network.
 *
 * Please see {@link IBalance} interface for more details.
 *
 * UtxoContext can be supplied as a UTXO source to the transaction {@link Generator}
 * allowing the {@link Generator} to create transactions using the
 * UTXO entries it manages.
 *
 * **IMPORTANT:** UtxoContext is meant to represent a single account.  It is not
 * designed to be used as a global UTXO manager for all addresses in a very large
 * wallet (such as an exchange wallet). For such use cases, it is recommended to
 * perform manual UTXO management by subscribing to UTXO notifications using
 * {@link RpcClient.subscribeUtxosChanged} and {@link RpcClient.getUtxosByAddresses}.
 *
 * @see {@link IUtxoContextArgs},
 * {@link UtxoProcessor},
 * {@link Generator},
 * {@link createTransactions},
 * {@link IBalance},
 * {@link IBalanceEvent},
 * {@link IPendingEvent},
 * {@link IReorgEvent},
 * {@link IStasisEvent},
 * {@link IMaturityEvent},
 * {@link IDiscoveryEvent},
 * {@link IBalanceEvent},
 * {@link ITransactionRecord}
 *
 * @category Wallet SDK
 */
export class UtxoContext {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(UtxoContext.prototype);
    obj.__wbg_ptr = ptr;
    UtxoContextFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      isActive: this.isActive,
      matureLength: this.matureLength,
      balance: this.balance,
      balanceStrings: this.balanceStrings,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    UtxoContextFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_utxocontext_free(ptr);
  }

  /**
   * @param {IUtxoContextArgs} js_value
   */
  constructor(js_value) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.utxocontext_ctor(retptr, addHeapObject(js_value));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Performs a scan of the given addresses and registers them in the context for event notifications.
   * @param {(Address | string)[]} addresses
   * @param {bigint | undefined} [optional_current_daa_score]
   * @returns {Promise<void>}
   */
  trackAddresses(addresses, optional_current_daa_score) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.utxocontext_trackAddresses(
      this.__wbg_ptr,
      addHeapObject(addresses),
      isLikeNone(optional_current_daa_score)
        ? 0
        : addHeapObject(optional_current_daa_score),
    );
    return takeObject(ret);
  }

  /**
   * Unregister a list of addresses from the context. This will stop tracking of these addresses.
   * @param {(Address | string)[]} addresses
   * @returns {Promise<void>}
   */
  unregisterAddresses(addresses) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.utxocontext_unregisterAddresses(
      this.__wbg_ptr,
      addHeapObject(addresses),
    );
    return takeObject(ret);
  }

  /**
   * Clear the UtxoContext.  Unregister all addresses and clear all UTXO entries.
   * IMPORTANT: This function must be manually called when disconnecting or re-connecting to the node
   * (followed by address re-registration).
   * @returns {Promise<void>}
   */
  clear() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.utxocontext_clear(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {boolean}
   */
  get isActive() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.utxocontext_isActive(this.__wbg_ptr);
    return ret !== 0;
  }

  /**
   *
   * Returns a range of mature UTXO entries that are currently
   * managed by the UtxoContext and are available for spending.
   *
   * NOTE: This function is provided for informational purposes only.
   * **You should not manage UTXO entries manually if they are owned by UtxoContext.**
   *
   * The resulting range may be less than requested if UTXO entries
   * have been spent asynchronously by UtxoContext or by other means
   * (i.e. UtxoContext has received notification from the network that
   * UtxoEntries have been spent externally).
   *
   * UtxoEntries are kept in in the ascending sorted order by their amount.
   * @param {number} from
   * @param {number} to
   * @returns {UtxoEntryReference[]}
   */
  getMatureRange(from, to) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(from);
      _assertNum(to);
      wasm.utxocontext_getMatureRange(retptr, this.__wbg_ptr, from, to);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Obtain the length of the mature UTXO entries that are currently
   * managed by the UtxoContext.
   * @returns {number}
   */
  get matureLength() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.utxocontext_matureLength(this.__wbg_ptr);
    return ret >>> 0;
  }

  /**
   * Returns pending UTXO entries that are currently managed by the UtxoContext.
   * @returns {UtxoEntryReference[]}
   */
  getPending() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.utxocontext_getPending(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Current {@link Balance} of the UtxoContext.
   * @returns {Balance | undefined}
   */
  get balance() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.utxocontext_balance(this.__wbg_ptr);
    return ret === 0 ? undefined : Balance.__wrap(ret);
  }

  /**
   * Current {@link BalanceStrings} of the UtxoContext.
   * @returns {BalanceStrings | undefined}
   */
  get balanceStrings() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.utxocontext_balanceStrings(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return r0 === 0 ? undefined : BalanceStrings.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}

const UtxoEntriesFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_utxoentries_free(ptr >>> 0));

/**
 * A simple collection of UTXO entries. This struct is used to
 * retain a set of UTXO entries in the WASM memory for faster
 * processing. This struct keeps a list of entries represented
 * by `UtxoEntryReference` struct. This data structure is used
 * internally by the framework, but is exposed for convenience.
 * Please consider using `UtxoContext` instead.
 * @category Wallet SDK
 */
export class UtxoEntries {
  toJSON() {
    return {
      items: this.items,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    UtxoEntriesFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_utxoentries_free(ptr);
  }

  /**
   * Create a new `UtxoEntries` struct with a set of entries.
   * @param {any} js_value
   */
  constructor(js_value) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.utxoentries_js_ctor(retptr, addHeapObject(js_value));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @returns {any}
   */
  get items() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.utxoentries_get_items_as_js_array(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {any} js_value
   */
  set items(js_value) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      wasm.utxoentries_set_items_from_js_array(
        this.__wbg_ptr,
        addBorrowedObject(js_value),
      );
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * Sort the contained entries by amount. Please note that
   * this function is not intended for use with large UTXO sets
   * as it duplicates the whole contained UTXO set while sorting.
   */
  sort() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.utxoentries_sort(this.__wbg_ptr);
  }

  /**
   * @returns {bigint}
   */
  amount() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.utxoentries_amount(this.__wbg_ptr);
    return BigInt.asUintN(64, ret);
  }
}

const UtxoEntryFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_utxoentry_free(ptr >>> 0));

/**
 * @category Wallet SDK
 */
export class UtxoEntry {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(UtxoEntry.prototype);
    obj.__wbg_ptr = ptr;
    UtxoEntryFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      address: this.address,
      outpoint: this.outpoint,
      amount: this.amount,
      scriptPublicKey: this.scriptPublicKey,
      blockDaaScore: this.blockDaaScore,
      isCoinbase: this.isCoinbase,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    UtxoEntryFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_utxoentry_free(ptr);
  }

  /**
   * @returns {Address | undefined}
   */
  get address() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.__wbg_get_utxoentry_address(this.__wbg_ptr);
    return ret === 0 ? undefined : Address.__wrap(ret);
  }

  /**
   * @param {Address | undefined} [arg0]
   */
  set address(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    let ptr0 = 0;
    if (!isLikeNone(arg0)) {
      _assertClass(arg0, Address);
      if (arg0.__wbg_ptr === 0) {
        throw new Error("Attempt to use a moved value");
      }
      ptr0 = arg0.__destroy_into_raw();
    }
    wasm.__wbg_set_utxoentry_address(this.__wbg_ptr, ptr0);
  }

  /**
   * @returns {TransactionOutpoint}
   */
  get outpoint() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.__wbg_get_utxoentry_outpoint(this.__wbg_ptr);
    return TransactionOutpoint.__wrap(ret);
  }

  /**
   * @param {TransactionOutpoint} arg0
   */
  set outpoint(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertClass(arg0, TransactionOutpoint);
    if (arg0.__wbg_ptr === 0) {
      throw new Error("Attempt to use a moved value");
    }
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_utxoentry_outpoint(this.__wbg_ptr, ptr0);
  }

  /**
   * @returns {bigint}
   */
  get amount() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.__wbg_get_utxoentry_amount(this.__wbg_ptr);
    return BigInt.asUintN(64, ret);
  }

  /**
   * @param {bigint} arg0
   */
  set amount(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertBigInt(arg0);
    wasm.__wbg_set_utxoentry_amount(this.__wbg_ptr, arg0);
  }

  /**
   * @returns {ScriptPublicKey}
   */
  get scriptPublicKey() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.__wbg_get_utxoentry_scriptPublicKey(this.__wbg_ptr);
    return ScriptPublicKey.__wrap(ret);
  }

  /**
   * @param {ScriptPublicKey} arg0
   */
  set scriptPublicKey(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertClass(arg0, ScriptPublicKey);
    if (arg0.__wbg_ptr === 0) {
      throw new Error("Attempt to use a moved value");
    }
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_utxoentry_scriptPublicKey(this.__wbg_ptr, ptr0);
  }

  /**
   * @returns {bigint}
   */
  get blockDaaScore() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.__wbg_get_utxoentry_blockDaaScore(this.__wbg_ptr);
    return BigInt.asUintN(64, ret);
  }

  /**
   * @param {bigint} arg0
   */
  set blockDaaScore(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertBigInt(arg0);
    wasm.__wbg_set_utxoentry_blockDaaScore(this.__wbg_ptr, arg0);
  }

  /**
   * @returns {boolean}
   */
  get isCoinbase() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.__wbg_get_utxoentry_isCoinbase(this.__wbg_ptr);
    return ret !== 0;
  }

  /**
   * @param {boolean} arg0
   */
  set isCoinbase(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    _assertBoolean(arg0);
    wasm.__wbg_set_utxoentry_isCoinbase(this.__wbg_ptr, arg0);
  }

  /**
   * @returns {string}
   */
  toString() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.utxoentry_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}

const UtxoEntryReferenceFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_utxoentryreference_free(ptr >>> 0),
      );

/**
 * @category Wallet SDK
 */
export class UtxoEntryReference {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(UtxoEntryReference.prototype);
    obj.__wbg_ptr = ptr;
    UtxoEntryReferenceFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      entry: this.entry,
      amount: this.amount,
      isCoinbase: this.isCoinbase,
      blockDaaScore: this.blockDaaScore,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    UtxoEntryReferenceFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_utxoentryreference_free(ptr);
  }

  /**
   * @returns {string}
   */
  toString() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.utxoentryreference_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @returns {UtxoEntry}
   */
  get entry() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.utxoentryreference_entry(this.__wbg_ptr);
    return UtxoEntry.__wrap(ret);
  }

  /**
   * @returns {string}
   */
  getTransactionId() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.utxoentryreference_getTransactionId(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @returns {string}
   */
  getId() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.utxoentryreference_getId(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @returns {bigint}
   */
  get amount() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.utxoentryreference_amount(this.__wbg_ptr);
    return BigInt.asUintN(64, ret);
  }

  /**
   * @returns {boolean}
   */
  get isCoinbase() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.utxoentryreference_isCoinbase(this.__wbg_ptr);
    return ret !== 0;
  }

  /**
   * @returns {bigint}
   */
  get blockDaaScore() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.utxoentryreference_blockDaaScore(this.__wbg_ptr);
    return BigInt.asUintN(64, ret);
  }
}

const UtxoProcessorFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_utxoprocessor_free(ptr >>> 0),
      );

/**
 *
 * UtxoProcessor class is the main coordinator that manages UTXO processing
 * between multiple UtxoContext instances. It acts as a bridge between the
 * Kaspa node RPC connection, address subscriptions and UtxoContext instances.
 *
 * @see {@link IUtxoProcessorArgs},
 * {@link UtxoContext},
 * {@link RpcClient},
 * {@link NetworkId},
 * {@link IConnectEvent}
 * {@link IDisconnectEvent}
 * @category Wallet SDK
 */
export class UtxoProcessor {
  toJSON() {
    return {
      rpc: this.rpc,
      networkId: this.networkId,
      isActive: this.isActive,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    UtxoProcessorFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_utxoprocessor_free(ptr);
  }

  /**
   * @param {string | UtxoProcessorNotificationCallback} event
   * @param {UtxoProcessorNotificationCallback | undefined} [callback]
   */
  addEventListener(event, callback) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.utxoprocessor_addEventListener(
        retptr,
        this.__wbg_ptr,
        addHeapObject(event),
        isLikeNone(callback) ? 0 : addHeapObject(callback),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {UtxoProcessorEventType | UtxoProcessorEventType[] | string | string[]} event
   * @param {UtxoProcessorNotificationCallback | undefined} [callback]
   */
  removeEventListener(event, callback) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.utxoprocessor_removeEventListener(
        retptr,
        this.__wbg_ptr,
        addHeapObject(event),
        isLikeNone(callback) ? 0 : addHeapObject(callback),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * UtxoProcessor constructor.
   *
   *
   *
   * @see {@link IUtxoProcessorArgs}
   * @param {IUtxoProcessorArgs} js_value
   */
  constructor(js_value) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.utxoprocessor_ctor(retptr, addHeapObject(js_value));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Starts the UtxoProcessor and begins processing UTXO and other notifications.
   * @returns {Promise<void>}
   */
  start() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.utxoprocessor_start(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * Stops the UtxoProcessor and ends processing UTXO and other notifications.
   * @returns {Promise<void>}
   */
  stop() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.utxoprocessor_stop(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {RpcClient}
   */
  get rpc() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.utxoprocessor_rpc(this.__wbg_ptr);
    return RpcClient.__wrap(ret);
  }

  /**
   * @returns {string | undefined}
   */
  get networkId() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.utxoprocessor_networkId(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      let v1;
      if (r0 !== 0) {
        v1 = getStringFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1, 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {NetworkId | string} network_id
   */
  setNetworkId(network_id) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.utxoprocessor_setNetworkId(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(network_id),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @returns {boolean}
   */
  get isActive() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.utxoprocessor_isActive(this.__wbg_ptr);
    return ret !== 0;
  }

  /**
   *
   * Set the coinbase transaction maturity period DAA score for a given network.
   * This controls the DAA period after which the user transactions are considered mature
   * and the wallet subsystem emits the transaction maturity event.
   *
   * @see {@link TransactionRecord}
   * @see {@link IUtxoProcessorEvent}
   *
   * @category Wallet SDK
   * @param {NetworkId | string} network_id
   * @param {bigint} value
   */
  static setCoinbaseTransactionMaturityDAA(network_id, value) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertBigInt(value);
      wasm.utxoprocessor_setCoinbaseTransactionMaturityDAA(
        retptr,
        addHeapObject(network_id),
        value,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   *
   * Set the user transaction maturity period DAA score for a given network.
   * This controls the DAA period after which the user transactions are considered mature
   * and the wallet subsystem emits the transaction maturity event.
   *
   * @see {@link TransactionRecord}
   * @see {@link IUtxoProcessorEvent}
   *
   * @category Wallet SDK
   * @param {NetworkId | string} network_id
   * @param {bigint} value
   */
  static setUserTransactionMaturityDAA(network_id, value) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertBigInt(value);
      wasm.utxoprocessor_setUserTransactionMaturityDAA(
        retptr,
        addHeapObject(network_id),
        value,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}

const WalletFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_wallet_free(ptr >>> 0));

/**
 *
 * Wallet class is the main coordinator that manages integrated wallet operations.
 *
 * The Wallet class encapsulates {@link UtxoProcessor} and provides internal
 * account management using {@link UtxoContext} instances. It acts as a bridge
 * between the integrated Wallet subsystem providing a high-level interface
 * for wallet key and account management.
 *
 * The Rusty Kaspa is developed in Rust, and the Wallet class is a Rust implementation
 * exposed to the JavaScript/TypeScript environment using the WebAssembly (WASM32) interface.
 * As such, the Wallet implementation can be powered up using native Rust or built
 * as a WebAssembly module and used in the browser or Node.js environment.
 *
 * When using Rust native or NodeJS environment, all wallet data is stored on the local
 * filesystem.  When using WASM32 build in the web browser, the wallet data is stored
 * in the browser's `localStorage` and transaction records are stored in the `IndexedDB`.
 *
 * The Wallet API can create multiple wallet instances, however, only one wallet instance
 * can be active at a time.
 *
 * The wallet implementation is designed to be efficient and support a large number
 * of accounts. Accounts reside in storage and can be loaded and activated as needed.
 * A `loaded` account contains all account information loaded from the permanent storage
 * whereas an `active` account monitors the UTXO set and provides notifications for
 * incoming and outgoing transactions as well as balance updates.
 *
 * The Wallet API communicates with the client using resource identifiers. These include
 * account IDs, private key IDs, transaction IDs, etc. It is the responsibility of the
 * client to track these resource identifiers at runtime.
 *
 * @see {@link IWalletConfig},
 *
 * @category Wallet API
 */
export class Wallet {
  toJSON() {
    return {
      rpc: this.rpc,
      isOpen: this.isOpen,
      isSynced: this.isSynced,
      descriptor: this.descriptor,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    WalletFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_wallet_free(ptr);
  }

  /**
   * @param {IWalletConfig} config
   */
  constructor(config) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.wallet_constructor(retptr, addHeapObject(config));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @returns {RpcClient}
   */
  get rpc() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_rpc(this.__wbg_ptr);
    return RpcClient.__wrap(ret);
  }

  /**
   * @remarks This is a local property indicating
   * if the wallet is currently open.
   * @returns {boolean}
   */
  get isOpen() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_isOpen(this.__wbg_ptr);
    return ret !== 0;
  }

  /**
   * @remarks This is a local property indicating
   * if the node is currently synced.
   * @returns {boolean}
   */
  get isSynced() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_isSynced(this.__wbg_ptr);
    return ret !== 0;
  }

  /**
   * @returns {WalletDescriptor | undefined}
   */
  get descriptor() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_descriptor(this.__wbg_ptr);
    return ret === 0 ? undefined : WalletDescriptor.__wrap(ret);
  }

  /**
   * Check if a wallet with a given name exists.
   * @param {string | undefined} [name]
   * @returns {Promise<boolean>}
   */
  exists(name) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    var ptr0 = isLikeNone(name)
      ? 0
      : passStringToWasm0(
          name,
          wasm.__wbindgen_malloc,
          wasm.__wbindgen_realloc,
        );
    var len0 = WASM_VECTOR_LEN;
    const ret = wasm.wallet_exists(this.__wbg_ptr, ptr0, len0);
    return takeObject(ret);
  }

  /**
   * @returns {Promise<void>}
   */
  start() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_start(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @returns {Promise<void>}
   */
  stop() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_stop(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {IConnectOptions | undefined | undefined} [args]
   * @returns {Promise<void>}
   */
  connect(args) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_connect(
      this.__wbg_ptr,
      isLikeNone(args) ? 0 : addHeapObject(args),
    );
    return takeObject(ret);
  }

  /**
   * @returns {Promise<void>}
   */
  disconnect() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_disconnect(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {string | WalletNotificationCallback} event
   * @param {WalletNotificationCallback | undefined} [callback]
   */
  addEventListener(event, callback) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.wallet_addEventListener(
        retptr,
        this.__wbg_ptr,
        addHeapObject(event),
        isLikeNone(callback) ? 0 : addHeapObject(callback),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {WalletEventType | WalletEventType[] | string | string[]} event
   * @param {WalletNotificationCallback | undefined} [callback]
   */
  removeEventListener(event, callback) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.wallet_removeEventListener(
        retptr,
        this.__wbg_ptr,
        addHeapObject(event),
        isLikeNone(callback) ? 0 : addHeapObject(callback),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Ping backend
   *@see {@link IBatchRequest} {@link IBatchResponse}
   *@throws `string` in case of an error.
   * @param {IBatchRequest} request
   * @returns {Promise<IBatchResponse>}
   */
  batch(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_batch(this.__wbg_ptr, addHeapObject(request));
    return takeObject(ret);
  }

  /**
   *@see {@link IFlushRequest} {@link IFlushResponse}
   *@throws `string` in case of an error.
   * @param {IFlushRequest} request
   * @returns {Promise<IFlushResponse>}
   */
  flush(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_flush(this.__wbg_ptr, addHeapObject(request));
    return takeObject(ret);
  }

  /**
   *@see {@link IRetainContextRequest} {@link IRetainContextResponse}
   *@throws `string` in case of an error.
   * @param {IRetainContextRequest} request
   * @returns {Promise<IRetainContextResponse>}
   */
  retainContext(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_retainContext(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IGetStatusRequest} {@link IGetStatusResponse}
   *@throws `string` in case of an error.
   * @param {IGetStatusRequest} request
   * @returns {Promise<IGetStatusResponse>}
   */
  getStatus(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_getStatus(this.__wbg_ptr, addHeapObject(request));
    return takeObject(ret);
  }

  /**
   *@see {@link IWalletEnumerateRequest} {@link IWalletEnumerateResponse}
   *@throws `string` in case of an error.
   * @param {IWalletEnumerateRequest} request
   * @returns {Promise<IWalletEnumerateResponse>}
   */
  walletEnumerate(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_walletEnumerate(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IWalletCreateRequest} {@link IWalletCreateResponse}
   *@throws `string` in case of an error.
   * @param {IWalletCreateRequest} request
   * @returns {Promise<IWalletCreateResponse>}
   */
  walletCreate(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_walletCreate(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IWalletOpenRequest} {@link IWalletOpenResponse}
   *@throws `string` in case of an error.
   * @param {IWalletOpenRequest} request
   * @returns {Promise<IWalletOpenResponse>}
   */
  walletOpen(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_walletOpen(this.__wbg_ptr, addHeapObject(request));
    return takeObject(ret);
  }

  /**
   *@see {@link IWalletReloadRequest} {@link IWalletReloadResponse}
   *@throws `string` in case of an error.
   * @param {IWalletReloadRequest} request
   * @returns {Promise<IWalletReloadResponse>}
   */
  walletReload(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_walletReload(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IWalletCloseRequest} {@link IWalletCloseResponse}
   *@throws `string` in case of an error.
   * @param {IWalletCloseRequest} request
   * @returns {Promise<IWalletCloseResponse>}
   */
  walletClose(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_walletClose(this.__wbg_ptr, addHeapObject(request));
    return takeObject(ret);
  }

  /**
   *@see {@link IWalletChangeSecretRequest} {@link IWalletChangeSecretResponse}
   *@throws `string` in case of an error.
   * @param {IWalletChangeSecretRequest} request
   * @returns {Promise<IWalletChangeSecretResponse>}
   */
  walletChangeSecret(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_walletChangeSecret(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IWalletExportRequest} {@link IWalletExportResponse}
   *@throws `string` in case of an error.
   * @param {IWalletExportRequest} request
   * @returns {Promise<IWalletExportResponse>}
   */
  walletExport(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_walletExport(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IWalletImportRequest} {@link IWalletImportResponse}
   *@throws `string` in case of an error.
   * @param {IWalletImportRequest} request
   * @returns {Promise<IWalletImportResponse>}
   */
  walletImport(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_walletImport(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IPrvKeyDataEnumerateRequest} {@link IPrvKeyDataEnumerateResponse}
   *@throws `string` in case of an error.
   * @param {IPrvKeyDataEnumerateRequest} request
   * @returns {Promise<IPrvKeyDataEnumerateResponse>}
   */
  prvKeyDataEnumerate(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_prvKeyDataEnumerate(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IPrvKeyDataCreateRequest} {@link IPrvKeyDataCreateResponse}
   *@throws `string` in case of an error.
   * @param {IPrvKeyDataCreateRequest} request
   * @returns {Promise<IPrvKeyDataCreateResponse>}
   */
  prvKeyDataCreate(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_prvKeyDataCreate(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IPrvKeyDataRemoveRequest} {@link IPrvKeyDataRemoveResponse}
   *@throws `string` in case of an error.
   * @param {IPrvKeyDataRemoveRequest} request
   * @returns {Promise<IPrvKeyDataRemoveResponse>}
   */
  prvKeyDataRemove(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_prvKeyDataRemove(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IPrvKeyDataGetRequest} {@link IPrvKeyDataGetResponse}
   *@throws `string` in case of an error.
   * @param {IPrvKeyDataGetRequest} request
   * @returns {Promise<IPrvKeyDataGetResponse>}
   */
  prvKeyDataGet(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_prvKeyDataGet(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IAccountsEnumerateRequest} {@link IAccountsEnumerateResponse}
   *@throws `string` in case of an error.
   * @param {IAccountsEnumerateRequest} request
   * @returns {Promise<IAccountsEnumerateResponse>}
   */
  accountsEnumerate(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_accountsEnumerate(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IAccountsRenameRequest} {@link IAccountsRenameResponse}
   *@throws `string` in case of an error.
   * @param {IAccountsRenameRequest} request
   * @returns {Promise<IAccountsRenameResponse>}
   */
  accountsRename(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_accountsRename(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IAccountsDiscoveryRequest} {@link IAccountsDiscoveryResponse}
   *@throws `string` in case of an error.
   * @param {IAccountsDiscoveryRequest} request
   * @returns {Promise<IAccountsDiscoveryResponse>}
   */
  accountsDiscovery(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_accountsDiscovery(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IAccountsCreateRequest} {@link IAccountsCreateResponse}
   *@throws `string` in case of an error.
   * @param {IAccountsCreateRequest} request
   * @returns {Promise<IAccountsCreateResponse>}
   */
  accountsCreate(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_accountsCreate(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IAccountsEnsureDefaultRequest} {@link IAccountsEnsureDefaultResponse}
   *@throws `string` in case of an error.
   * @param {IAccountsEnsureDefaultRequest} request
   * @returns {Promise<IAccountsEnsureDefaultResponse>}
   */
  accountsEnsureDefault(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_accountsEnsureDefault(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IAccountsImportRequest} {@link IAccountsImportResponse}
   *@throws `string` in case of an error.
   * @param {IAccountsImportRequest} request
   * @returns {Promise<IAccountsImportResponse>}
   */
  accountsImport(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_accountsImport(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IAccountsActivateRequest} {@link IAccountsActivateResponse}
   *@throws `string` in case of an error.
   * @param {IAccountsActivateRequest} request
   * @returns {Promise<IAccountsActivateResponse>}
   */
  accountsActivate(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_accountsActivate(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IAccountsDeactivateRequest} {@link IAccountsDeactivateResponse}
   *@throws `string` in case of an error.
   * @param {IAccountsDeactivateRequest} request
   * @returns {Promise<IAccountsDeactivateResponse>}
   */
  accountsDeactivate(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_accountsDeactivate(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IAccountsGetRequest} {@link IAccountsGetResponse}
   *@throws `string` in case of an error.
   * @param {IAccountsGetRequest} request
   * @returns {Promise<IAccountsGetResponse>}
   */
  accountsGet(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_accountsGet(this.__wbg_ptr, addHeapObject(request));
    return takeObject(ret);
  }

  /**
   *@see {@link IAccountsCreateNewAddressRequest} {@link IAccountsCreateNewAddressResponse}
   *@throws `string` in case of an error.
   * @param {IAccountsCreateNewAddressRequest} request
   * @returns {Promise<IAccountsCreateNewAddressResponse>}
   */
  accountsCreateNewAddress(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_accountsCreateNewAddress(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IAccountsSendRequest} {@link IAccountsSendResponse}
   *@throws `string` in case of an error.
   * @param {IAccountsSendRequest} request
   * @returns {Promise<IAccountsSendResponse>}
   */
  accountsSend(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_accountsSend(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IAccountsTransferRequest} {@link IAccountsTransferResponse}
   *@throws `string` in case of an error.
   * @param {IAccountsTransferRequest} request
   * @returns {Promise<IAccountsTransferResponse>}
   */
  accountsTransfer(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_accountsTransfer(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IAccountsEstimateRequest} {@link IAccountsEstimateResponse}
   *@throws `string` in case of an error.
   * @param {IAccountsEstimateRequest} request
   * @returns {Promise<IAccountsEstimateResponse>}
   */
  accountsEstimate(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_accountsEstimate(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link ITransactionsDataGetRequest} {@link ITransactionsDataGetResponse}
   *@throws `string` in case of an error.
   * @param {ITransactionsDataGetRequest} request
   * @returns {Promise<ITransactionsDataGetResponse>}
   */
  transactionsDataGet(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_transactionsDataGet(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link ITransactionsReplaceNoteRequest} {@link ITransactionsReplaceNoteResponse}
   *@throws `string` in case of an error.
   * @param {ITransactionsReplaceNoteRequest} request
   * @returns {Promise<ITransactionsReplaceNoteResponse>}
   */
  transactionsReplaceNote(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_transactionsReplaceNote(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link ITransactionsReplaceMetadataRequest} {@link ITransactionsReplaceMetadataResponse}
   *@throws `string` in case of an error.
   * @param {ITransactionsReplaceMetadataRequest} request
   * @returns {Promise<ITransactionsReplaceMetadataResponse>}
   */
  transactionsReplaceMetadata(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_transactionsReplaceMetadata(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }

  /**
   *@see {@link IAddressBookEnumerateRequest} {@link IAddressBookEnumerateResponse}
   *@throws `string` in case of an error.
   * @param {IAddressBookEnumerateRequest} request
   * @returns {Promise<IAddressBookEnumerateResponse>}
   */
  addressBookEnumerate(request) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wallet_addressBookEnumerate(
      this.__wbg_ptr,
      addHeapObject(request),
    );
    return takeObject(ret);
  }
}

const WalletDescriptorFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_walletdescriptor_free(ptr >>> 0),
      );

/**
 * @category Wallet API
 */
export class WalletDescriptor {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(WalletDescriptor.prototype);
    obj.__wbg_ptr = ptr;
    WalletDescriptorFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  toJSON() {
    return {
      title: this.title,
      filename: this.filename,
    };
  }

  toString() {
    return JSON.stringify(this);
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    WalletDescriptorFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_walletdescriptor_free(ptr);
  }

  /**
   * @returns {string | undefined}
   */
  get title() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.__wbg_get_walletdescriptor_title(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      let v1;
      if (r0 !== 0) {
        v1 = getStringFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 1, 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {string | undefined} [arg0]
   */
  set title(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    var ptr0 = isLikeNone(arg0)
      ? 0
      : passStringToWasm0(
          arg0,
          wasm.__wbindgen_malloc,
          wasm.__wbindgen_realloc,
        );
    var len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_walletdescriptor_title(this.__wbg_ptr, ptr0, len0);
  }

  /**
   * @returns {string}
   */
  get filename() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.__wbg_get_walletdescriptor_filename(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * @param {string} arg0
   */
  set filename(arg0) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_walletdescriptor_filename(this.__wbg_ptr, ptr0, len0);
  }
}

const WasiOptionsFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_wasioptions_free(ptr >>> 0));

/**
 */
export class WasiOptions {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(WasiOptions.prototype);
    obj.__wbg_ptr = ptr;
    WasiOptionsFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    WasiOptionsFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_wasioptions_free(ptr);
  }

  /**
   * @param {any[] | undefined} args
   * @param {object | undefined} env
   * @param {object} preopens
   */
  constructor(args, env, preopens) {
    var ptr0 = isLikeNone(args)
      ? 0
      : passArrayJsValueToWasm0(args, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    const ret = wasm.wasioptions_new_with_values(
      ptr0,
      len0,
      isLikeNone(env) ? 0 : addHeapObject(env),
      addHeapObject(preopens),
    );
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * @param {object} preopens
   * @returns {WasiOptions}
   */
  static new(preopens) {
    const ret = wasm.wasioptions_new(addHeapObject(preopens));
    return WasiOptions.__wrap(ret);
  }

  /**
   * @returns {any[] | undefined}
   */
  get args() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.wasioptions_args(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      let v1;
      if (r0 !== 0) {
        v1 = getArrayJsValueFromWasm0(r0, r1).slice();
        wasm.__wbindgen_free(r0, r1 * 4, 4);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {any[] | undefined} [value]
   */
  set args(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    var ptr0 = isLikeNone(value)
      ? 0
      : passArrayJsValueToWasm0(value, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    wasm.wasioptions_set_args(this.__wbg_ptr, ptr0, len0);
  }

  /**
   * @returns {object | undefined}
   */
  get env() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wasioptions_env(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {object | undefined} [value]
   */
  set env(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.wasioptions_set_env(
      this.__wbg_ptr,
      isLikeNone(value) ? 0 : addHeapObject(value),
    );
  }

  /**
   * @returns {object}
   */
  get preopens() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.wasioptions_preopens(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {object} value
   */
  set preopens(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.wasioptions_set_preopens(this.__wbg_ptr, addHeapObject(value));
  }
}

const WriteFileSyncOptionsFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_writefilesyncoptions_free(ptr >>> 0),
      );

/**
 */
export class WriteFileSyncOptions {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    WriteFileSyncOptionsFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_writefilesyncoptions_free(ptr);
  }

  /**
   * @param {string | undefined} [encoding]
   * @param {string | undefined} [flag]
   * @param {number | undefined} [mode]
   */
  constructor(encoding, flag, mode) {
    if (!isLikeNone(mode)) {
      _assertNum(mode);
    }
    const ret = wasm.writefilesyncoptions_new(
      isLikeNone(encoding) ? 0 : addHeapObject(encoding),
      isLikeNone(flag) ? 0 : addHeapObject(flag),
      !isLikeNone(mode),
      isLikeNone(mode) ? 0 : mode,
    );
    this.__wbg_ptr = ret >>> 0;
    return this;
  }

  /**
   * @returns {string | undefined}
   */
  get encoding() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.writefilesyncoptions_encoding(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {string | undefined} [value]
   */
  set encoding(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.writefilesyncoptions_set_encoding(
      this.__wbg_ptr,
      isLikeNone(value) ? 0 : addHeapObject(value),
    );
  }

  /**
   * @returns {string | undefined}
   */
  get flag() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.writefilesyncoptions_flag(this.__wbg_ptr);
    return takeObject(ret);
  }

  /**
   * @param {string | undefined} [value]
   */
  set flag(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    wasm.writefilesyncoptions_set_flag(
      this.__wbg_ptr,
      isLikeNone(value) ? 0 : addHeapObject(value),
    );
  }

  /**
   * @returns {number | undefined}
   */
  get mode() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.writefilesyncoptions_mode(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      return r0 === 0 ? undefined : r1 >>> 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {number | undefined} [value]
   */
  set mode(value) {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    if (!isLikeNone(value)) {
      _assertNum(value);
    }
    wasm.writefilesyncoptions_set_mode(
      this.__wbg_ptr,
      !isLikeNone(value),
      isLikeNone(value) ? 0 : value,
    );
  }
}

const WriteStreamFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_writestream_free(ptr >>> 0));

export class WriteStream {
  constructor() {
    throw new Error("cannot invoke `new` directly");
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    WriteStreamFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_writestream_free(ptr);
  }

  /**
   * @param {Function} listener
   * @returns {any}
   */
  add_listener_with_open(listener) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.writestream_add_listener_with_open(
        this.__wbg_ptr,
        addBorrowedObject(listener),
      );
      return takeObject(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {Function} listener
   * @returns {any}
   */
  add_listener_with_close(listener) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.writestream_add_listener_with_close(
        this.__wbg_ptr,
        addBorrowedObject(listener),
      );
      return takeObject(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {Function} listener
   * @returns {any}
   */
  on_with_open(listener) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.writestream_on_with_open(
        this.__wbg_ptr,
        addBorrowedObject(listener),
      );
      return takeObject(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {Function} listener
   * @returns {any}
   */
  on_with_close(listener) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.writestream_on_with_close(
        this.__wbg_ptr,
        addBorrowedObject(listener),
      );
      return takeObject(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {Function} listener
   * @returns {any}
   */
  once_with_open(listener) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.writestream_once_with_open(
        this.__wbg_ptr,
        addBorrowedObject(listener),
      );
      return takeObject(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {Function} listener
   * @returns {any}
   */
  once_with_close(listener) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.writestream_once_with_close(
        this.__wbg_ptr,
        addBorrowedObject(listener),
      );
      return takeObject(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {Function} listener
   * @returns {any}
   */
  prepend_listener_with_open(listener) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.writestream_prepend_listener_with_open(
        this.__wbg_ptr,
        addBorrowedObject(listener),
      );
      return takeObject(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {Function} listener
   * @returns {any}
   */
  prepend_listener_with_close(listener) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.writestream_prepend_listener_with_close(
        this.__wbg_ptr,
        addBorrowedObject(listener),
      );
      return takeObject(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {Function} listener
   * @returns {any}
   */
  prepend_once_listener_with_open(listener) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.writestream_prepend_once_listener_with_open(
        this.__wbg_ptr,
        addBorrowedObject(listener),
      );
      return takeObject(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {Function} listener
   * @returns {any}
   */
  prepend_once_listener_with_close(listener) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      _assertNum(this.__wbg_ptr);
      const ret = wasm.writestream_prepend_once_listener_with_close(
        this.__wbg_ptr,
        addBorrowedObject(listener),
      );
      return takeObject(ret);
    } finally {
      heap[stack_pointer++] = undefined;
    }
  }
}

const XOnlyPublicKeyFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) =>
        wasm.__wbg_xonlypublickey_free(ptr >>> 0),
      );

/**
 *
 * Data structure that envelopes a XOnlyPublicKey.
 *
 * XOnlyPublicKey is used as a payload part of the {@link Address}.
 *
 * @see {@link PublicKey}
 * @category Wallet SDK
 */
export class XOnlyPublicKey {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(XOnlyPublicKey.prototype);
    obj.__wbg_ptr = ptr;
    XOnlyPublicKeyFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    XOnlyPublicKeyFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_xonlypublickey_free(ptr);
  }

  /**
   * @param {string} key
   */
  constructor(key) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        key,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.xonlypublickey_try_new(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @returns {string}
   */
  toString() {
    let deferred1_0;
    let deferred1_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.xonlypublickey_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }

  /**
   * Get the [`Address`] of this XOnlyPublicKey.
   * Receives a [`NetworkType`] to determine the prefix of the address.
   * JavaScript: `let address = xOnlyPublicKey.toAddress(NetworkType.MAINNET);`.
   * @param {NetworkType | NetworkId | string} network
   * @returns {Address}
   */
  toAddress(network) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.xonlypublickey_toAddress(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(network),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Address.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * Get `ECDSA` [`Address`] of this XOnlyPublicKey.
   * Receives a [`NetworkType`] to determine the prefix of the address.
   * JavaScript: `let address = xOnlyPublicKey.toAddress(NetworkType.MAINNET);`.
   * @param {NetworkType | NetworkId | string} network
   * @returns {Address}
   */
  toAddressECDSA(network) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.xonlypublickey_toAddressECDSA(
        retptr,
        this.__wbg_ptr,
        addBorrowedObject(network),
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return Address.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {Address} address
   * @returns {XOnlyPublicKey}
   */
  static fromAddress(address) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertClass(address, Address);
      if (address.__wbg_ptr === 0) {
        throw new Error("Attempt to use a moved value");
      }
      wasm.xonlypublickey_fromAddress(retptr, address.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return XOnlyPublicKey.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}

const XPrvFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_xprv_free(ptr >>> 0));

/**
 *
 * Extended private key (XPrv).
 *
 * This class allows accepts a master seed and provides
 * functions for derivation of dependent child private keys.
 *
 * Please note that Kaspa extended private keys use `kprv` prefix.
 *
 * @see {@link PrivateKeyGenerator}, {@link PublicKeyGenerator}, {@link XPub}, {@link Mnemonic}
 * @category Wallet SDK
 */
export class XPrv {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(XPrv.prototype);
    obj.__wbg_ptr = ptr;
    XPrvFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    XPrvFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_xprv_free(ptr);
  }

  /**
   * @param {HexString} seed
   */
  constructor(seed) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.xprv_try_new(retptr, addHeapObject(seed));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * Create {@link XPrv} from `xprvxxxx..` string
   * @param {string} xprv
   * @returns {XPrv}
   */
  static fromXPrv(xprv) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        xprv,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.xprv_fromXPrv(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return XPrv.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {number} chile_number
   * @param {boolean | undefined} [hardened]
   * @returns {XPrv}
   */
  deriveChild(chile_number, hardened) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(chile_number);
      if (!isLikeNone(hardened)) {
        _assertBoolean(hardened);
      }
      wasm.xprv_deriveChild(
        retptr,
        this.__wbg_ptr,
        chile_number,
        isLikeNone(hardened) ? 0xffffff : hardened ? 1 : 0,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return XPrv.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {any} path
   * @returns {XPrv}
   */
  derivePath(path) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.xprv_derivePath(retptr, this.__wbg_ptr, addBorrowedObject(path));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return XPrv.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {string} prefix
   * @returns {string}
   */
  intoString(prefix) {
    let deferred3_0;
    let deferred3_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      const ptr0 = passStringToWasm0(
        prefix,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.xprv_intoString(retptr, this.__wbg_ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr2 = r0;
      var len2 = r1;
      if (r3) {
        ptr2 = 0;
        len2 = 0;
        throw takeObject(r2);
      }
      deferred3_0 = ptr2;
      deferred3_1 = len2;
      return getStringFromWasm0(ptr2, len2);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
  }

  /**
   * @returns {string}
   */
  toString() {
    let deferred2_0;
    let deferred2_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.xprv_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr1 = r0;
      var len1 = r1;
      if (r3) {
        ptr1 = 0;
        len1 = 0;
        throw takeObject(r2);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
  }

  /**
   * @returns {XPub}
   */
  toXPub() {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.xprv_toXPub(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return XPub.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
}

const XPubFinalization =
  typeof FinalizationRegistry === "undefined"
    ? {
        register: () => {},
        unregister: () => {},
      }
    : new FinalizationRegistry((ptr) => wasm.__wbg_xpub_free(ptr >>> 0));

/**
 *
 * Extended public key (XPub).
 *
 * This class allows accepts another XPub and and provides
 * functions for derivation of dependent child public keys.
 *
 * Please note that Kaspa extended public keys use `kpub` prefix.
 *
 * @see {@link PrivateKeyGenerator}, {@link PublicKeyGenerator}, {@link XPrv}, {@link Mnemonic}
 * @category Wallet SDK
 */
export class XPub {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(XPub.prototype);
    obj.__wbg_ptr = ptr;
    XPubFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }

  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    XPubFinalization.unregister(this);
    return ptr;
  }

  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_xpub_free(ptr);
  }

  /**
   * @param {string} xpub
   */
  constructor(xpub) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(
        xpub,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.xpub_try_new(retptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {number} chile_number
   * @param {boolean | undefined} [hardened]
   * @returns {XPub}
   */
  deriveChild(chile_number, hardened) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      _assertNum(chile_number);
      if (!isLikeNone(hardened)) {
        _assertBoolean(hardened);
      }
      wasm.xpub_deriveChild(
        retptr,
        this.__wbg_ptr,
        chile_number,
        isLikeNone(hardened) ? 0xffffff : hardened ? 1 : 0,
      );
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return XPub.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }

  /**
   * @param {any} path
   * @returns {XPub}
   */
  derivePath(path) {
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      wasm.xpub_derivePath(retptr, this.__wbg_ptr, addBorrowedObject(path));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return XPub.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      heap[stack_pointer++] = undefined;
    }
  }

  /**
   * @param {string} prefix
   * @returns {string}
   */
  intoString(prefix) {
    let deferred3_0;
    let deferred3_1;
    try {
      if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      _assertNum(this.__wbg_ptr);
      const ptr0 = passStringToWasm0(
        prefix,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len0 = WASM_VECTOR_LEN;
      wasm.xpub_intoString(retptr, this.__wbg_ptr, ptr0, len0);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      var r3 = getInt32Memory0()[retptr / 4 + 3];
      var ptr2 = r0;
      var len2 = r1;
      if (r3) {
        ptr2 = 0;
        len2 = 0;
        throw takeObject(r2);
      }
      deferred3_0 = ptr2;
      deferred3_1 = len2;
      return getStringFromWasm0(ptr2, len2);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
  }

  /**
   * @returns {PublicKey}
   */
  toPublicKey() {
    if (this.__wbg_ptr == 0) throw new Error("Attempt to use a moved value");
    _assertNum(this.__wbg_ptr);
    const ret = wasm.xpub_toPublicKey(this.__wbg_ptr);
    return PublicKey.__wrap(ret);
  }
}

async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        if (module.headers.get("Content-Type") != "application/wasm") {
          console.warn(
            "`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",
            e,
          );
        } else {
          throw e;
        }
      }
    }

    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);

    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
}

function __wbg_get_imports() {
  const imports = {};
  imports.wbg = {};
  imports.wbg.__wbindgen_object_clone_ref = function (arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_error_58a509c5f08288c3 = function () {
    return logError(function (arg0, arg1) {
      let deferred0_0;
      let deferred0_1;
      try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        console.error(getStringFromWasm0(arg0, arg1));
      } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
      }
    }, arguments);
  };
  imports.wbg.__wbg_new_b33f3e997e286fdc = function () {
    return logError(function () {
      const ret = new Error();
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_stack_8fffa51461ec7c76 = function () {
    return logError(function (arg0, arg1) {
      const ret = getObject(arg1).stack;
      const ptr1 = passStringToWasm0(
        ret,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len1 = WASM_VECTOR_LEN;
      getInt32Memory0()[arg0 / 4 + 1] = len1;
      getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments);
  };
  imports.wbg.__wbg_instanceof_Window_f401953a2cf86220 = function () {
    return logError(function (arg0) {
      let result;
      try {
        result = getObject(arg0) instanceof Window;
      } catch (_) {
        result = false;
      }
      const ret = result;
      _assertBoolean(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_document_5100775d18896c16 = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).document;
      return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_location_2951b5ee34f19221 = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).location;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_navigator_6c8fa55c5cc8796e = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).navigator;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_localStorage_e381d34d0c40c761 = function () {
    return handleError(function (arg0) {
      const ret = getObject(arg0).localStorage;
      return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_indexedDB_7c51d9056667f4e0 = function () {
    return handleError(function (arg0) {
      const ret = getObject(arg0).indexedDB;
      return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_body_edb1908d3ceff3a1 = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).body;
      return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_createElement_8bae7856a4bb7411 = function () {
    return handleError(function (arg0, arg1, arg2) {
      const ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_innerHTML_5e7bc1b9545c80e2 = function () {
    return logError(function (arg0, arg1) {
      const ret = getObject(arg1).innerHTML;
      const ptr1 = passStringToWasm0(
        ret,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len1 = WASM_VECTOR_LEN;
      getInt32Memory0()[arg0 / 4 + 1] = len1;
      getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments);
  };
  imports.wbg.__wbg_setinnerHTML_26d69b59e1af99c7 = function () {
    return logError(function (arg0, arg1, arg2) {
      getObject(arg0).innerHTML = getStringFromWasm0(arg1, arg2);
    }, arguments);
  };
  imports.wbg.__wbg_removeAttribute_1b10a06ae98ebbd1 = function () {
    return handleError(function (arg0, arg1, arg2) {
      getObject(arg0).removeAttribute(getStringFromWasm0(arg1, arg2));
    }, arguments);
  };
  imports.wbg.__wbg_setAttribute_3c9f6c303b696daa = function () {
    return handleError(function (arg0, arg1, arg2, arg3, arg4) {
      getObject(arg0).setAttribute(
        getStringFromWasm0(arg1, arg2),
        getStringFromWasm0(arg3, arg4),
      );
    }, arguments);
  };
  imports.wbg.__wbindgen_number_new = function (arg0) {
    const ret = arg0;
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_string_new = function (arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_string_get = function (arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof obj === "string" ? obj : undefined;
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
  };
  imports.wbg.__wbg_signal_a61f78a3478fd9bc = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).signal;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_new_0d76b0581eca6298 = function () {
    return handleError(function () {
      const ret = new AbortController();
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_abort_2aa7521d5690750e = function () {
    return logError(function (arg0) {
      getObject(arg0).abort();
    }, arguments);
  };
  imports.wbg.__wbg_newwithstrsequenceandoptions_ce1f1ca2d522b8aa =
    function () {
      return handleError(function (arg0, arg1) {
        const ret = new Blob(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
      }, arguments);
    };
  imports.wbg.__wbg_protocol_b7292c581cfe1e5c = function () {
    return handleError(function (arg0, arg1) {
      const ret = getObject(arg1).protocol;
      const ptr1 = passStringToWasm0(
        ret,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len1 = WASM_VECTOR_LEN;
      getInt32Memory0()[arg0 / 4 + 1] = len1;
      getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments);
  };
  imports.wbg.__wbg_data_3ce7c145ca4fbcdc = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).data;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_newwithstrandinit_3fd6fba4083ff2d0 = function () {
    return handleError(function (arg0, arg1, arg2) {
      const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_appendChild_580ccb11a660db68 = function () {
    return handleError(function (arg0, arg1) {
      const ret = getObject(arg0).appendChild(getObject(arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_setonmessage_503809e5bb51bd33 = function () {
    return logError(function (arg0, arg1) {
      getObject(arg0).onmessage = getObject(arg1);
    }, arguments);
  };
  imports.wbg.__wbg_new_d1187ae36d662ef9 = function () {
    return handleError(function (arg0, arg1) {
      const ret = new Worker(getStringFromWasm0(arg0, arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_postMessage_7380d10e8b8269df = function () {
    return handleError(function (arg0, arg1) {
      getObject(arg0).postMessage(getObject(arg1));
    }, arguments);
  };
  imports.wbg.__wbg_open_f0d7259fd7e689ce = function () {
    return handleError(function (arg0, arg1, arg2, arg3) {
      const ret = getObject(arg0).open(
        getStringFromWasm0(arg1, arg2),
        arg3 >>> 0,
      );
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_setonblocked_eb1032a3dfaabd1c = function () {
    return logError(function (arg0, arg1) {
      getObject(arg0).onblocked = getObject(arg1);
    }, arguments);
  };
  imports.wbg.__wbg_setonupgradeneeded_ad7645373c7d5e1b = function () {
    return logError(function (arg0, arg1) {
      getObject(arg0).onupgradeneeded = getObject(arg1);
    }, arguments);
  };
  imports.wbg.__wbg_result_6cedf5f78600a79c = function () {
    return handleError(function (arg0) {
      const ret = getObject(arg0).result;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_error_685b20024dc2d6ca = function () {
    return handleError(function (arg0) {
      const ret = getObject(arg0).error;
      return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_readyState_f8d58cc9e9c4f906 = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).readyState;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_setonsuccess_632ce0a1460455c2 = function () {
    return logError(function (arg0, arg1) {
      getObject(arg0).onsuccess = getObject(arg1);
    }, arguments);
  };
  imports.wbg.__wbg_setonerror_8479b33e7568a904 = function () {
    return logError(function (arg0, arg1) {
      getObject(arg0).onerror = getObject(arg1);
    }, arguments);
  };
  imports.wbg.__wbg_setonabort_523135fd9168ae8b = function () {
    return logError(function (arg0, arg1) {
      getObject(arg0).onabort = getObject(arg1);
    }, arguments);
  };
  imports.wbg.__wbg_setoncomplete_d8e4236665cbf1e2 = function () {
    return logError(function (arg0, arg1) {
      getObject(arg0).oncomplete = getObject(arg1);
    }, arguments);
  };
  imports.wbg.__wbg_setonerror_da071ec94e148397 = function () {
    return logError(function (arg0, arg1) {
      getObject(arg0).onerror = getObject(arg1);
    }, arguments);
  };
  imports.wbg.__wbg_objectStore_da468793bd9df17b = function () {
    return handleError(function (arg0, arg1, arg2) {
      const ret = getObject(arg0).objectStore(getStringFromWasm0(arg1, arg2));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_userAgent_e94c7cbcdac01fea = function () {
    return handleError(function (arg0, arg1) {
      const ret = getObject(arg1).userAgent;
      const ptr1 = passStringToWasm0(
        ret,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len1 = WASM_VECTOR_LEN;
      getInt32Memory0()[arg0 / 4 + 1] = len1;
      getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments);
  };
  imports.wbg.__wbg_now_4e659b3d15f470d9 = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).now();
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_new_ab6fd82b10560829 = function () {
    return handleError(function () {
      const ret = new Headers();
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_append_7bfcb4937d1d5e29 = function () {
    return handleError(function (arg0, arg1, arg2, arg3, arg4) {
      getObject(arg0).append(
        getStringFromWasm0(arg1, arg2),
        getStringFromWasm0(arg3, arg4),
      );
    }, arguments);
  };
  imports.wbg.__wbg_objectStoreNames_588b5924274239fd = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).objectStoreNames;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_setonversionchange_af0457acbb949df2 = function () {
    return logError(function (arg0, arg1) {
      getObject(arg0).onversionchange = getObject(arg1);
    }, arguments);
  };
  imports.wbg.__wbg_createObjectStore_882f2f6b1b1ef040 = function () {
    return handleError(function (arg0, arg1, arg2) {
      const ret = getObject(arg0).createObjectStore(
        getStringFromWasm0(arg1, arg2),
      );
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_transaction_1e282a79e9bb7387 = function () {
    return handleError(function (arg0, arg1, arg2, arg3) {
      const ret = getObject(arg0).transaction(
        getStringFromWasm0(arg1, arg2),
        takeObject(arg3),
      );
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_instanceof_Response_849eb93e75734b6e = function () {
    return logError(function (arg0) {
      let result;
      try {
        result = getObject(arg0) instanceof Response;
      } catch (_) {
        result = false;
      }
      const ret = result;
      _assertBoolean(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_url_5f6dc4009ac5f99d = function () {
    return logError(function (arg0, arg1) {
      const ret = getObject(arg1).url;
      const ptr1 = passStringToWasm0(
        ret,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len1 = WASM_VECTOR_LEN;
      getInt32Memory0()[arg0 / 4 + 1] = len1;
      getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments);
  };
  imports.wbg.__wbg_status_61a01141acd3cf74 = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).status;
      _assertNum(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_headers_9620bfada380764a = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).headers;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_text_450a059667fd91fd = function () {
    return handleError(function (arg0) {
      const ret = getObject(arg0).text();
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_length_c2eb1c77befa5ab2 = function () {
    return handleError(function (arg0) {
      const ret = getObject(arg0).length;
      _assertNum(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_getItem_164e8e5265095b87 = function () {
    return handleError(function (arg0, arg1, arg2, arg3) {
      const ret = getObject(arg1).getItem(getStringFromWasm0(arg2, arg3));
      var ptr1 = isLikeNone(ret)
        ? 0
        : passStringToWasm0(
            ret,
            wasm.__wbindgen_malloc,
            wasm.__wbindgen_realloc,
          );
      var len1 = WASM_VECTOR_LEN;
      getInt32Memory0()[arg0 / 4 + 1] = len1;
      getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments);
  };
  imports.wbg.__wbg_key_c98cb78ec00838d8 = function () {
    return handleError(function (arg0, arg1, arg2) {
      const ret = getObject(arg1).key(arg2 >>> 0);
      var ptr1 = isLikeNone(ret)
        ? 0
        : passStringToWasm0(
            ret,
            wasm.__wbindgen_malloc,
            wasm.__wbindgen_realloc,
          );
      var len1 = WASM_VECTOR_LEN;
      getInt32Memory0()[arg0 / 4 + 1] = len1;
      getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments);
  };
  imports.wbg.__wbg_removeItem_c0321116dc514363 = function () {
    return handleError(function (arg0, arg1, arg2) {
      getObject(arg0).removeItem(getStringFromWasm0(arg1, arg2));
    }, arguments);
  };
  imports.wbg.__wbg_setItem_ba2bb41d73dac079 = function () {
    return handleError(function (arg0, arg1, arg2, arg3, arg4) {
      getObject(arg0).setItem(
        getStringFromWasm0(arg1, arg2),
        getStringFromWasm0(arg3, arg4),
      );
    }, arguments);
  };
  imports.wbg.__wbg_item_87130eb4d38ecdc5 = function () {
    return logError(function (arg0, arg1, arg2) {
      const ret = getObject(arg1).item(arg2 >>> 0);
      var ptr1 = isLikeNone(ret)
        ? 0
        : passStringToWasm0(
            ret,
            wasm.__wbindgen_malloc,
            wasm.__wbindgen_realloc,
          );
      var len1 = WASM_VECTOR_LEN;
      getInt32Memory0()[arg0 / 4 + 1] = len1;
      getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments);
  };
  imports.wbg.__wbg_target_2fc177e386c8b7b0 = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).target;
      return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_createIndex_d786564b37de8e73 = function () {
    return handleError(function (arg0, arg1, arg2, arg3, arg4) {
      const ret = getObject(arg0).createIndex(
        getStringFromWasm0(arg1, arg2),
        getObject(arg3),
        getObject(arg4),
      );
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_delete_f60bba7d0ae59a4f = function () {
    return handleError(function (arg0, arg1) {
      const ret = getObject(arg0).delete(getObject(arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_get_5361b64cac0d0826 = function () {
    return handleError(function (arg0, arg1) {
      const ret = getObject(arg0).get(getObject(arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_getAll_2782e438df699384 = function () {
    return handleError(function (arg0) {
      const ret = getObject(arg0).getAll();
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_put_22792e17580ca18b = function () {
    return handleError(function (arg0, arg1, arg2) {
      const ret = getObject(arg0).put(getObject(arg1), getObject(arg2));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_createObjectURL_ad8244759309f204 = function () {
    return handleError(function (arg0, arg1) {
      const ret = URL.createObjectURL(getObject(arg1));
      const ptr1 = passStringToWasm0(
        ret,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len1 = WASM_VECTOR_LEN;
      getInt32Memory0()[arg0 / 4 + 1] = len1;
      getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments);
  };
  imports.wbg.__wbg_indexedDB_d312f95759a15fdc = function () {
    return handleError(function (arg0) {
      const ret = getObject(arg0).indexedDB;
      return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_fetch_921fad6ef9e883dd = function () {
    return logError(function (arg0, arg1) {
      const ret = getObject(arg0).fetch(getObject(arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_new_16b304a2cfa7ff4a = function () {
    return logError(function () {
      const ret = [];
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_get_bd8e338fbd5f5cc8 = function () {
    return logError(function (arg0, arg1) {
      const ret = getObject(arg0)[arg1 >>> 0];
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_set_d4638f722068f043 = function () {
    return logError(function (arg0, arg1, arg2) {
      getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
    }, arguments);
  };
  imports.wbg.__wbg_from_89e3fc3ba5e6fb48 = function () {
    return logError(function (arg0) {
      const ret = Array.from(getObject(arg0));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_isArray_2ab64d95e09ea0ae = function () {
    return logError(function (arg0) {
      const ret = Array.isArray(getObject(arg0));
      _assertBoolean(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_length_cd7af8117672b8b8 = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).length;
      _assertNum(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_push_a5b05aedc7234f9f = function () {
    return logError(function (arg0, arg1) {
      const ret = getObject(arg0).push(getObject(arg1));
      _assertNum(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_instanceof_ArrayBuffer_836825be07d4c9d2 = function () {
    return logError(function (arg0) {
      let result;
      try {
        result = getObject(arg0) instanceof ArrayBuffer;
      } catch (_) {
        result = false;
      }
      const ret = result;
      _assertBoolean(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_new_132e2fd5dfe036c3 = function () {
    return logError(function (arg0) {
      const ret = new ArrayBuffer(arg0 >>> 0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_BigInt_f00b864098012725 = function () {
    return handleError(function (arg0) {
      const ret = BigInt(getObject(arg0));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_BigInt_42b692c18e1ac6d6 = function () {
    return logError(function (arg0) {
      const ret = BigInt(getObject(arg0));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_toString_66be3c8e1c6a7c76 = function () {
    return handleError(function (arg0, arg1) {
      const ret = getObject(arg0).toString(arg1);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_toString_0b527fce0e8f2bab = function () {
    return logError(function (arg0, arg1, arg2) {
      const ret = getObject(arg1).toString(arg2);
      const ptr1 = passStringToWasm0(
        ret,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len1 = WASM_VECTOR_LEN;
      getInt32Memory0()[arg0 / 4 + 1] = len1;
      getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments);
  };
  imports.wbg.__wbg_newnoargs_e258087cd0daa0ea = function () {
    return logError(function (arg0, arg1) {
      const ret = new Function(getStringFromWasm0(arg0, arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_call_27c0f87801dedf93 = function () {
    return handleError(function (arg0, arg1) {
      const ret = getObject(arg0).call(getObject(arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_call_b3ca7c6051f9bec1 = function () {
    return handleError(function (arg0, arg1, arg2) {
      const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_instanceof_Map_87917e0a7aaf4012 = function () {
    return logError(function (arg0) {
      let result;
      try {
        result = getObject(arg0) instanceof Map;
      } catch (_) {
        result = false;
      }
      const ret = result;
      _assertBoolean(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_delete_4021408926008f34 = function () {
    return logError(function (arg0, arg1) {
      const ret = getObject(arg0).delete(getObject(arg1));
      _assertBoolean(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_get_596396f84e7b37c4 = function () {
    return logError(function (arg0, arg1) {
      const ret = getObject(arg0).get(getObject(arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_new_d9bc3a0147634640 = function () {
    return logError(function () {
      const ret = new Map();
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_set_8417257aaedc936b = function () {
    return logError(function (arg0, arg1, arg2) {
      const ret = getObject(arg0).set(getObject(arg1), getObject(arg2));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_entries_ce844941d0c51880 = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).entries();
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_next_196c84450b364254 = function () {
    return handleError(function (arg0) {
      const ret = getObject(arg0).next();
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_next_40fc327bfc8770e6 = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).next;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_done_298b57d23c0fc80c = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).done;
      _assertBoolean(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_value_d93c65011f51a456 = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).value;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_isSafeInteger_f7b04ef02296c4d2 = function () {
    return logError(function (arg0) {
      const ret = Number.isSafeInteger(getObject(arg0));
      _assertBoolean(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_new0_7d84e5b2cd9fdc73 = function () {
    return logError(function () {
      const ret = new Date();
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_now_3014639a94423537 = function () {
    return logError(function () {
      const ret = Date.now();
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_setUTCSeconds_4c26a55881cd3685 = function () {
    return logError(function (arg0, arg1) {
      const ret = getObject(arg0).setUTCSeconds(arg1 >>> 0);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_instanceof_Object_71ca3c0a59266746 = function () {
    return logError(function (arg0) {
      let result;
      try {
        result = getObject(arg0) instanceof Object;
      } catch (_) {
        result = false;
      }
      const ret = result;
      _assertBoolean(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_entries_95cc2c823b285a09 = function () {
    return logError(function (arg0) {
      const ret = Object.entries(getObject(arg0));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_hasOwn_36bafcaab60dd49a = function () {
    return logError(function (arg0, arg1) {
      const ret = Object.hasOwn(getObject(arg0), getObject(arg1));
      _assertBoolean(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_is_010fdc0f4ab96916 = function () {
    return logError(function (arg0, arg1) {
      const ret = Object.is(getObject(arg0), getObject(arg1));
      _assertBoolean(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_keys_91e412b4b222659f = function () {
    return logError(function (arg0) {
      const ret = Object.keys(getObject(arg0));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_new_72fb9a18b5ae2624 = function () {
    return logError(function () {
      const ret = new Object();
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_iterator_2cee6dadfd956dfa = function () {
    return logError(function () {
      const ret = Symbol.iterator;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_new_81740750da40724f = function () {
    return logError(function (arg0, arg1) {
      try {
        var state0 = { a: arg0, b: arg1 };
        var cb0 = (arg0, arg1) => {
          const a = state0.a;
          state0.a = 0;
          try {
            return __wbg_adapter_295(a, state0.b, arg0, arg1);
          } finally {
            state0.a = a;
          }
        };
        const ret = new Promise(cb0);
        return addHeapObject(ret);
      } finally {
        state0.a = state0.b = 0;
      }
    }, arguments);
  };
  imports.wbg.__wbg_resolve_b0083a7967828ec8 = function () {
    return logError(function (arg0) {
      const ret = Promise.resolve(getObject(arg0));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_then_0c86a60e8fcfe9f6 = function () {
    return logError(function (arg0, arg1) {
      const ret = getObject(arg0).then(getObject(arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_then_a73caa9a87991566 = function () {
    return logError(function (arg0, arg1, arg2) {
      const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_globalThis_d1e6af4856ba331b = function () {
    return handleError(function () {
      const ret = globalThis.globalThis;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_self_ce0dbfc45cf2f5be = function () {
    return handleError(function () {
      const ret = self.self;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_window_c6fb939a7f436783 = function () {
    return handleError(function () {
      const ret = window.window;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_global_207b558942527489 = function () {
    return handleError(function () {
      const ret = global.global;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_instanceof_Uint8Array_2b3bbecd033d19f6 = function () {
    return logError(function (arg0) {
      let result;
      try {
        result = getObject(arg0) instanceof Uint8Array;
      } catch (_) {
        result = false;
      }
      const ret = result;
      _assertBoolean(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_new_63b92bc8671ed464 = function () {
    return logError(function (arg0) {
      const ret = new Uint8Array(getObject(arg0));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_newwithlength_e9b4878cebadb3d3 = function () {
    return logError(function (arg0) {
      const ret = new Uint8Array(arg0 >>> 0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_newwithbyteoffsetandlength_aa4a17c33a06e5cb = function () {
    return logError(function (arg0, arg1, arg2) {
      const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_subarray_a1f73cd4b5b42fe1 = function () {
    return logError(function (arg0, arg1, arg2) {
      const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_length_c20a40f15020d68a = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).length;
      _assertNum(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_set_a47bac70306a19a7 = function () {
    return logError(function (arg0, arg1, arg2) {
      getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    }, arguments);
  };
  imports.wbg.__wbindgen_is_function = function (arg0) {
    const ret = typeof getObject(arg0) === "function";
    _assertBoolean(ret);
    return ret;
  };
  imports.wbg.__wbindgen_is_undefined = function (arg0) {
    const ret = getObject(arg0) === undefined;
    _assertBoolean(ret);
    return ret;
  };
  imports.wbg.__wbindgen_number_get = function (arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof obj === "number" ? obj : undefined;
    if (!isLikeNone(ret)) {
      _assertNum(ret);
    }
    getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
    getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
  };
  imports.wbg.__wbindgen_is_object = function (arg0) {
    const val = getObject(arg0);
    const ret = typeof val === "object" && val !== null;
    _assertBoolean(ret);
    return ret;
  };
  imports.wbg.__wbindgen_is_string = function (arg0) {
    const ret = typeof getObject(arg0) === "string";
    _assertBoolean(ret);
    return ret;
  };
  imports.wbg.__wbg_stringify_8887fe74e1c50d81 = function () {
    return handleError(function (arg0) {
      const ret = JSON.stringify(getObject(arg0));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_get_e3c254076557e348 = function () {
    return handleError(function (arg0, arg1) {
      const ret = Reflect.get(getObject(arg0), getObject(arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_has_0af94d20077affa2 = function () {
    return handleError(function (arg0, arg1) {
      const ret = Reflect.has(getObject(arg0), getObject(arg1));
      _assertBoolean(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_set_1f9b04f170055d33 = function () {
    return handleError(function (arg0, arg1, arg2) {
      const ret = Reflect.set(
        getObject(arg0),
        getObject(arg1),
        getObject(arg2),
      );
      _assertBoolean(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_buffer_12d079cc21e14bdb = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).buffer;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbindgen_debug_string = function (arg0, arg1) {
    const ret = debugString(getObject(arg1));
    const ptr1 = passStringToWasm0(
      ret,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
  };
  imports.wbg.__wbindgen_bigint_get_as_i64 = function (arg0, arg1) {
    const v = getObject(arg1);
    const ret = typeof v === "bigint" ? v : undefined;
    if (!isLikeNone(ret)) {
      _assertBigInt(ret);
    }
    getBigInt64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? BigInt(0) : ret;
    getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
  };
  imports.wbg.__wbindgen_object_drop_ref = function (arg0) {
    takeObject(arg0);
  };
  imports.wbg.__wbindgen_throw = function (arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
  };
  imports.wbg.__wbindgen_memory = function () {
    const ret = wasm.memory;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_addListener_ef6c129bb87219d9 = function () {
    return logError(function (arg0, arg1, arg2, arg3) {
      const ret = getObject(arg0).addListener(
        getStringFromWasm0(arg1, arg2),
        getObject(arg3),
      );
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_on_5d61447a91633f13 = function () {
    return logError(function (arg0, arg1, arg2, arg3) {
      const ret = getObject(arg0).on(
        getStringFromWasm0(arg1, arg2),
        getObject(arg3),
      );
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_once_73046d9a6e68af07 = function () {
    return logError(function (arg0, arg1, arg2, arg3) {
      const ret = getObject(arg0).once(
        getStringFromWasm0(arg1, arg2),
        getObject(arg3),
      );
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_prependListener_c57792e09c18b9ac = function () {
    return logError(function (arg0, arg1, arg2, arg3) {
      const ret = getObject(arg0).prependListener(
        getStringFromWasm0(arg1, arg2),
        getObject(arg3),
      );
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_prependOnceListener_56fb1130dde3be9d = function () {
    return logError(function (arg0, arg1, arg2, arg3) {
      const ret = getObject(arg0).prependOnceListener(
        getStringFromWasm0(arg1, arg2),
        getObject(arg3),
      );
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbindgen_error_new = function (arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_as_number = function (arg0) {
    const ret = +getObject(arg0);
    return ret;
  };
  imports.wbg.__wbindgen_boolean_get = function (arg0) {
    const v = getObject(arg0);
    const ret = typeof v === "boolean" ? (v ? 1 : 0) : 2;
    _assertNum(ret);
    return ret;
  };
  imports.wbg.__wbindgen_jsval_loose_eq = function (arg0, arg1) {
    const ret = getObject(arg0) == getObject(arg1);
    _assertBoolean(ret);
    return ret;
  };
  imports.wbg.__wbindgen_bigint_from_i64 = function (arg0) {
    const ret = arg0;
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_bigint_from_u64 = function (arg0) {
    const ret = BigInt.asUintN(64, arg0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_String_b9412f8799faab3e = function () {
    return logError(function (arg0, arg1) {
      const ret = String(getObject(arg1));
      const ptr1 = passStringToWasm0(
        ret,
        wasm.__wbindgen_malloc,
        wasm.__wbindgen_realloc,
      );
      const len1 = WASM_VECTOR_LEN;
      getInt32Memory0()[arg0 / 4 + 1] = len1;
      getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    }, arguments);
  };
  imports.wbg.__wbg_getwithrefkey_edc2c8960f0f1191 = function () {
    return logError(function (arg0, arg1) {
      const ret = getObject(arg0)[getObject(arg1)];
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_set_f975102236d3c502 = function () {
    return logError(function (arg0, arg1, arg2) {
      getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
    }, arguments);
  };
  imports.wbg.__wbg_crypto_566d7465cdbb6b7a = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).crypto;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_msCrypto_0b84745e9245cdf6 = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).msCrypto;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_getRandomValues_260cc23a41afad9a = function () {
    return handleError(function (arg0, arg1) {
      getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments);
  };
  imports.wbg.__wbg_randomFillSync_290977693942bf03 = function () {
    return handleError(function (arg0, arg1) {
      getObject(arg0).randomFillSync(takeObject(arg1));
    }, arguments);
  };
  imports.wbg.__wbg_require_94a9da52636aacbf = function () {
    return handleError(function () {
      const ret = module.require;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_process_dc09a8c7d59982f6 = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).process;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_versions_d98c6400c6ca2bd8 = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).versions;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_node_caaf83d002149bd5 = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).node;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_log_a65af01b65e97817 = function () {
    return logError(function (arg0, arg1) {
      console.log(getStringFromWasm0(arg0, arg1));
    }, arguments);
  };
  imports.wbg.__wbg_warn_0a9f7b68a0818f03 = function () {
    return logError(function (arg0, arg1) {
      console.warn(getStringFromWasm0(arg0, arg1));
    }, arguments);
  };
  imports.wbg.__wbg_error_63e6c86bf24b170f = function () {
    return logError(function (arg0, arg1) {
      console.error(getStringFromWasm0(arg0, arg1));
    }, arguments);
  };
  imports.wbg.__wbindgen_cb_drop = function (arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
      obj.a = 0;
      return true;
    }
    const ret = false;
    _assertBoolean(ret);
    return ret;
  };
  imports.wbg.__wbg_queueMicrotask_481971b0d87f3dd4 = function () {
    return logError(function (arg0) {
      queueMicrotask(getObject(arg0));
    }, arguments);
  };
  imports.wbg.__wbg_queueMicrotask_3cbae2ec6b6cd3d6 = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).queueMicrotask;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_setTimeout_f8cab335553c0c76 = function () {
    return handleError(function (arg0, arg1) {
      const ret = setTimeout(getObject(arg0), arg1 >>> 0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_clearTimeout_4d079370f82c056c = function () {
    return handleError(function (arg0) {
      clearTimeout(getObject(arg0));
    }, arguments);
  };
  imports.wbg.__wbg_abortable_unwrap = function () {
    return logError(function (arg0) {
      const ret = Abortable.__unwrap(takeObject(arg0));
      _assertNum(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_requestAnimationFrame_b4486531f53379b5 = function () {
    return logError(function (arg0) {
      const ret = requestAnimationFrame(takeObject(arg0));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_cancelAnimationFrame_746c4a25429518bf = function () {
    return logError(function (arg0) {
      cancelAnimationFrame(takeObject(arg0));
    }, arguments);
  };
  imports.wbg.__wbg_require_44067fa04664ad1c = function () {
    return logError(function (arg0, arg1) {
      const ret = require(getStringFromWasm0(arg0, arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbindgen_is_falsy = function (arg0) {
    const ret = !getObject(arg0);
    _assertBoolean(ret);
    return ret;
  };
  imports.wbg.__wbindgen_jsval_eq = function (arg0, arg1) {
    const ret = getObject(arg0) === getObject(arg1);
    _assertBoolean(ret);
    return ret;
  };
  imports.wbg.__wbg_aborted_new = function () {
    return logError(function (arg0) {
      const ret = Aborted.__wrap(arg0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_setInterval_aff01f28b446837b = function () {
    return handleError(function (arg0, arg1) {
      const ret = setInterval(getObject(arg0), arg1 >>> 0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_clearInterval_08431ef9481d1937 = function () {
    return handleError(function (arg0) {
      clearInterval(getObject(arg0));
    }, arguments);
  };
  imports.wbg.__wbindgen_is_array = function (arg0) {
    const ret = Array.isArray(getObject(arg0));
    _assertBoolean(ret);
    return ret;
  };
  imports.wbg.__wbindgen_is_bigint = function (arg0) {
    const ret = typeof getObject(arg0) === "bigint";
    _assertBoolean(ret);
    return ret;
  };
  imports.wbg.__wbindgen_is_null = function (arg0) {
    const ret = getObject(arg0) === null;
    _assertBoolean(ret);
    return ret;
  };
  imports.wbg.__wbindgen_try_into_number = function (arg0) {
    let result;
    try {
      result = +getObject(arg0);
    } catch (e) {
      result = e;
    }
    const ret = result;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_address_new = function () {
    return logError(function (arg0) {
      const ret = Address.__wrap(arg0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_networkid_new = function () {
    return logError(function (arg0) {
      const ret = NetworkId.__wrap(arg0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbindgen_in = function (arg0, arg1) {
    const ret = getObject(arg0) in getObject(arg1);
    _assertBoolean(ret);
    return ret;
  };
  imports.wbg.__wbg_transactionoutput_new = function () {
    return logError(function (arg0) {
      const ret = TransactionOutput.__wrap(arg0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_utxoentryreference_new = function () {
    return logError(function (arg0) {
      const ret = UtxoEntryReference.__wrap(arg0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_transactioninput_new = function () {
    return logError(function (arg0) {
      const ret = TransactionInput.__wrap(arg0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_fetch_bc7c8e27076a5c84 = function () {
    return logError(function (arg0) {
      const ret = fetch(getObject(arg0));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_readyState_87abef1e6e226349 = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).readyState;
      _assertNum(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_setonopen_f5e97c655a209a89 = function () {
    return logError(function (arg0, arg1) {
      getObject(arg0).onopen = getObject(arg1);
    }, arguments);
  };
  imports.wbg.__wbg_setonerror_b8b615e01765b893 = function () {
    return logError(function (arg0, arg1) {
      getObject(arg0).onerror = getObject(arg1);
    }, arguments);
  };
  imports.wbg.__wbg_setonclose_b08ae1f40135ceb3 = function () {
    return logError(function (arg0, arg1) {
      getObject(arg0).onclose = getObject(arg1);
    }, arguments);
  };
  imports.wbg.__wbg_setonmessage_0e9bc3964cfce93e = function () {
    return logError(function (arg0, arg1) {
      getObject(arg0).onmessage = getObject(arg1);
    }, arguments);
  };
  imports.wbg.__wbg_setbinaryType_d50e2963d7fb53e2 = function () {
    return logError(function (arg0, arg1) {
      getObject(arg0).binaryType = takeObject(arg1);
    }, arguments);
  };
  imports.wbg.__wbg_new_71978aec337faa3c = function () {
    return handleError(function (arg0, arg1) {
      const ret = new WebSocket(getStringFromWasm0(arg0, arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_close_bad627425eafc681 = function () {
    return handleError(function (arg0) {
      getObject(arg0).close();
    }, arguments);
  };
  imports.wbg.__wbg_send_ebc92c8892568c27 = function () {
    return handleError(function (arg0, arg1, arg2) {
      getObject(arg0).send(getStringFromWasm0(arg1, arg2));
    }, arguments);
  };
  imports.wbg.__wbg_send_5d4c47194d399f87 = function () {
    return handleError(function (arg0, arg1) {
      getObject(arg0).send(getObject(arg1));
    }, arguments);
  };
  imports.wbg.__wbg_send_ace40e95225df6ac = function () {
    return handleError(function (arg0, arg1, arg2) {
      getObject(arg0).send(getArrayU8FromWasm0(arg1, arg2));
    }, arguments);
  };
  imports.wbg.__wbg_newwithnodejsconfigimpl_1b46d2fcac7ede95 = function () {
    return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
      const ret = new WebSocket(
        getStringFromWasm0(arg0, arg1),
        takeObject(arg2),
        takeObject(arg3),
        takeObject(arg4),
        takeObject(arg5),
        takeObject(arg6),
      );
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_nodedescriptor_new = function () {
    return logError(function (arg0) {
      const ret = NodeDescriptor.__wrap(arg0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_rpcclient_new = function () {
    return logError(function (arg0) {
      const ret = RpcClient.__wrap(arg0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_Window_4c97c099b03994c2 = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).Window;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_WorkerGlobalScope_b87d69ab991859f6 = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).WorkerGlobalScope;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_global_c22c39d5b60f622c = function () {
    return logError(function (arg0) {
      const ret = getObject(arg0).global;
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_indexedDB_f50e4ba5302a87c6 = function () {
    return handleError(function (arg0) {
      const ret = getObject(arg0).indexedDB;
      return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbindgen_ge = function (arg0, arg1) {
    const ret = getObject(arg0) >= getObject(arg1);
    _assertBoolean(ret);
    return ret;
  };
  imports.wbg.__wbg_publickey_new = function () {
    return logError(function (arg0) {
      const ret = PublicKey.__wrap(arg0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_existsSync_7689513d1dc323e8 = function () {
    return handleError(function (arg0, arg1, arg2) {
      const ret = getObject(arg0).existsSync(getStringFromWasm0(arg1, arg2));
      _assertBoolean(ret);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_writeFileSync_e85e99f2a13868f1 = function () {
    return handleError(function (arg0, arg1, arg2, arg3, arg4) {
      getObject(arg0).writeFileSync(
        getStringFromWasm0(arg1, arg2),
        takeObject(arg3),
        takeObject(arg4),
      );
    }, arguments);
  };
  imports.wbg.__wbg_readFileSync_7e28422c6f524d08 = function () {
    return handleError(function (arg0, arg1, arg2, arg3) {
      const ret = getObject(arg0).readFileSync(
        getStringFromWasm0(arg1, arg2),
        takeObject(arg3),
      );
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_mkdirSync_dc45d0ae017a2528 = function () {
    return handleError(function (arg0, arg1, arg2, arg3) {
      getObject(arg0).mkdirSync(
        getStringFromWasm0(arg1, arg2),
        takeObject(arg3),
      );
    }, arguments);
  };
  imports.wbg.__wbg_renameSync_547b032dae56bd71 = function () {
    return handleError(function (arg0, arg1, arg2, arg3, arg4) {
      getObject(arg0).renameSync(
        getStringFromWasm0(arg1, arg2),
        getStringFromWasm0(arg3, arg4),
      );
    }, arguments);
  };
  imports.wbg.__wbg_unlinkSync_e55a4add565df563 = function () {
    return handleError(function (arg0, arg1, arg2) {
      getObject(arg0).unlinkSync(getStringFromWasm0(arg1, arg2));
    }, arguments);
  };
  imports.wbg.__wbg_statSync_d9d0b179b99eedaa = function () {
    return handleError(function (arg0, arg1, arg2) {
      const ret = getObject(arg0).statSync(getStringFromWasm0(arg1, arg2));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_require_d5eaf0a719d044dd = function () {
    return logError(function (arg0, arg1) {
      const ret = require(getStringFromWasm0(arg0, arg1));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_from_4f2e4ab6a0660f16 = function () {
    return logError(function (arg0) {
      const ret = Buffer.from(getObject(arg0));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_get_d8f9cfb1368ca9b7 = function () {
    return handleError(function (arg0, arg1) {
      let deferred0_0;
      let deferred0_1;
      try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        const ret = chrome.storage.local.get(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
      } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
      }
    }, arguments);
  };
  imports.wbg.__wbg_set_1d630b100fb9094b = function () {
    return handleError(function (arg0) {
      const ret = chrome.storage.local.set(takeObject(arg0));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_remove_d58cbb142852d2e8 = function () {
    return handleError(function (arg0, arg1) {
      let deferred0_0;
      let deferred0_1;
      try {
        deferred0_0 = arg0;
        deferred0_1 = arg1;
        const ret = chrome.storage.local.remove(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
      } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
      }
    }, arguments);
  };
  imports.wbg.__wbg_get_396d4cb09bce1873 = function () {
    return handleError(function () {
      const ret = chrome.storage.local.get();
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_readdir_9b72765279746a11 = function () {
    return handleError(function (arg0, arg1, arg2) {
      const ret = getObject(arg0).readdir(getStringFromWasm0(arg1, arg2));
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_accountkind_new = function () {
    return logError(function (arg0) {
      const ret = AccountKind.__wrap(arg0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_walletdescriptor_new = function () {
    return logError(function (arg0) {
      const ret = WalletDescriptor.__wrap(arg0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_transactionrecordnotification_new = function () {
    return logError(function (arg0) {
      const ret = TransactionRecordNotification.__wrap(arg0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_generatorsummary_new = function () {
    return logError(function (arg0) {
      const ret = GeneratorSummary.__wrap(arg0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_pendingtransaction_new = function () {
    return logError(function (arg0) {
      const ret = PendingTransaction.__wrap(arg0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_balancestrings_new = function () {
    return logError(function (arg0) {
      const ret = BalanceStrings.__wrap(arg0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_balance_new = function () {
    return logError(function (arg0) {
      const ret = Balance.__wrap(arg0);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbindgen_closure_wrapper9424 = function () {
    return logError(function (arg0, arg1, arg2) {
      const ret = makeMutClosure(arg0, arg1, 322, __wbg_adapter_60);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbindgen_closure_wrapper9856 = function () {
    return logError(function (arg0, arg1, arg2) {
      const ret = makeMutClosure(arg0, arg1, 345, __wbg_adapter_63);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbindgen_closure_wrapper10039 = function () {
    return logError(function (arg0, arg1, arg2) {
      const ret = makeMutClosure(arg0, arg1, 389, __wbg_adapter_66);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbindgen_closure_wrapper10041 = function () {
    return logError(function (arg0, arg1, arg2) {
      const ret = makeMutClosure(arg0, arg1, 385, __wbg_adapter_69);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbindgen_closure_wrapper10043 = function () {
    return logError(function (arg0, arg1, arg2) {
      const ret = makeMutClosure(arg0, arg1, 387, __wbg_adapter_72);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbindgen_closure_wrapper30644 = function () {
    return logError(function (arg0, arg1, arg2) {
      const ret = makeMutClosure(arg0, arg1, 1467, __wbg_adapter_75);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbindgen_closure_wrapper30646 = function () {
    return logError(function (arg0, arg1, arg2) {
      const ret = makeMutClosure(arg0, arg1, 1469, __wbg_adapter_78);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbindgen_closure_wrapper54465 = function () {
    return logError(function (arg0, arg1, arg2) {
      const ret = makeClosure(arg0, arg1, 3936, __wbg_adapter_81);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbindgen_closure_wrapper54467 = function () {
    return logError(function (arg0, arg1, arg2) {
      const ret = makeClosure(arg0, arg1, 3940, __wbg_adapter_84);
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbindgen_closure_wrapper63610 = function () {
    return logError(function (arg0, arg1, arg2) {
      const ret = makeMutClosure(arg0, arg1, 5486, __wbg_adapter_87);
      return addHeapObject(ret);
    }, arguments);
  };

  return imports;
}

function __wbg_init_memory(imports, maybe_memory) {}

function __wbg_finalize_init(instance, module) {
  wasm = instance.exports;
  __wbg_init.__wbindgen_wasm_module = module;
  cachedBigInt64Memory0 = null;
  cachedFloat64Memory0 = null;
  cachedInt32Memory0 = null;
  cachedUint32Memory0 = null;
  cachedUint8Memory0 = null;

  return wasm;
}

function initSync(module) {
  if (wasm !== undefined) return wasm;

  const imports = __wbg_get_imports();

  __wbg_init_memory(imports);

  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module);
  }

  const instance = new WebAssembly.Instance(module, imports);

  return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input) {
  if (wasm !== undefined) return wasm;

  if (typeof input === "undefined") {
    input = new URL("kaspa_bg.wasm", import.meta.url);
  }
  const imports = __wbg_get_imports();

  if (
    typeof input === "string" ||
    (typeof Request === "function" && input instanceof Request) ||
    (typeof URL === "function" && input instanceof URL)
  ) {
    input = fetch(input);
  }

  __wbg_init_memory(imports);

  const { instance, module } = await __wbg_load(await input, imports);

  return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
