// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      AC: Function.prototype.call.bind(DataView.prototype.setInt16),
      AD: x0 => x0.height,
      AE: (x0,x1) => x0.observe(x1),
      AF: x0 => x0.wheelDeltaY,
      AG: x0 => x0.v8BreakIterator,
      AH: x0 => x0.selectionDirection,
      AI: x0 => x0.debugSkipFontRetryDelay,
      AJ: x0 => x0.groups,
      AK: (x0,x1) => { x0.onabort = x1 },
      AL: x0 => x0.sqlite3_initialize(),
      AM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      AN: x0 => ({autoIncrement: x0}),
      AO: x0 => x0.result,
      AP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      AQ: x0 => x0.location,
      AR: (x0,x1) => x0.append(x1),
      AS: x0 => x0.resultPoints,
      AT: x0 => x0.width,
      B: s => printToConsole(s),
      BB: b => !!b,
      BC: Function.prototype.call.bind(DataView.prototype.setUint16),
      BD: x0 => x0.width,
      BE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      BF: x0 => x0.wheelDeltaX,
      BG: () => globalThis.Intl,
      BH: x0 => x0.selectionStart,
      BI: (x0,x1,x2) => x0.set(x1,x2),
      BJ: () => new MessageChannel(),
      BK: (x0,x1) => { x0.oncomplete = x1 },
      BL: (x0,x1,x2,x3) => x0.dart_sqlite3_register_vfs(x1,x2,x3),
      BM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      BN: (x0,x1,x2) => x0.createObjectStore(x1,x2),
      BO: () => new XMLHttpRequest(),
      BP: x0 => ({locateFile: x0}),
      BQ: (x0,x1) => x0.removeItem(x1),
      BR: x0 => x0.click(),
      BS: x0 => x0.message,
      BT: (x0,x1) => { x0.src = x1 },
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CC: Function.prototype.call.bind(DataView.prototype.setUint8),
      CD: x0 => x0.screen,
      CE: x0 => new ResizeObserver(x0),
      CF: x0 => x0.key,
      CG: (x0,x1) => x0.segment(x1),
      CH: x0 => x0.selectionEnd,
      CI: x0 => x0.fontFallbackBaseUrl,
      CJ: x0 => new BroadcastChannel(x0),
      CK: (x0,x1) => x0.objectStore(x1),
      CL: (x0,x1) => globalThis.Atomics.load(x0,x1),
      CM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      CN: x0 => ({unique: x0}),
      CO: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      CP: (x0,x1) => ({overrides: x0,fireImmediately: x1}),
      CQ: (x0,x1,x2) => x0.setItem(x1,x2),
      CR: x0 => x0.body,
      CS: x0 => x0.videoElement,
      CT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: (x0,x1) => x0.focus(x1),
      DC: Function.prototype.call.bind(DataView.prototype.setInt8),
      DD: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      DE: (x0,x1) => x0.getPropertyValue(x1),
      DF: x0 => x0.identifier,
      DG: x0 => x0.index,
      DH: x0 => x0.value,
      DI: (handle) => clearInterval(handle),
      DJ: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      DK: x0 => x0.buffer,
      DL: (x0,x1,x2) => globalThis.Atomics.wait(x0,x1,x2),
      DM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      DN: (x0,x1,x2,x3) => x0.createIndex(x1,x2,x3),
      DO: x0 => x0.send(),
      DP: x0 => globalThis.ZXingWASM.prepareZXingModule(x0),
      DQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      DR: (x0,x1) => { x0.target = x1 },
      DS: x0 => x0.decodeContinuously,
      DT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: () => ({}),
      EC: Function.prototype.call.bind(DataView.prototype.getInt8),
      ED: x0 => x0.tabIndex,
      EE: x0 => globalThis.parseFloat(x0),
      EF: x0 => x0.touches,
      EG: x0 => x0.next(),
      EH: x0 => x0.selectionDirection,
      EI: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      EJ: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      EK: (x0,x1) => x0.sqlite3_errstr(x1),
      EL: (x0,x1,x2) => globalThis.Atomics.notify(x0,x1,x2),
      EM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      EN: (x0,x1) => x0.createObjectStore(x1),
      EO: x0 => x0.type,
      EP: (x0,x1,x2,x3,x4) => x0.fillRect(x1,x2,x3,x4),
      EQ: (x0,x1) => { x0.onmessage = x1 },
      ER: (x0,x1) => { x0.download = x1 },
      ES: (x0,x1) => new ZXing.BrowserMultiFormatReader(x0,x1),
      ET: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      F: () => new Error().stack,
      FB: (o, p, v) => o[p] = v,
      FC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      FD: (x0,x1) => x0.contains(x1),
      FE: (x0,x1) => x0.getComputedStyle(x1),
      FF: x0 => x0.pressure,
      FG: x0 => x0.value,
      FH: x0 => x0.selectionStart,
      FI: () => Date.now(),
      FJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      FK: (x0,x1) => x0.sqlite3_errmsg(x1),
      FL: (x0,x1,x2) => globalThis.Atomics.store(x0,x1,x2),
      FM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      FN: x0 => x0.oldVersion,
      FO: x0 => x0.response,
      FP: x0 => ({formats: x0}),
      FQ: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      FR: (x0,x1) => { x0.href = x1 },
      FS: (x0,x1) => ({width: x0,height: x1}),
      FT: (x0,x1) => { x0.oncancel = x1 },
      G: s => JSON.stringify(s),
      GB: () => [],
      GC: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      GD: x0 => x0.activeElement,
      GE: x0 => x0.documentElement,
      GF: x0 => x0.tiltY,
      GG: x0 => x0.done,
      GH: x0 => x0.selectionEnd,
      GI: x0 => new WeakRef(x0),
      GJ: x0 => globalThis.Array.isArray(x0),
      GK: (x0,x1) => x0.sqlite3_error_offset(x1),
      GL: (x0,x1,x2) => x0.setInt32(x1,x2),
      GM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      GN: () => globalThis.indexedDB,
      GO: (x0,x1) => { x0.responseType = x1 },
      GP: x0 => new BarcodeDetector(x0),
      GQ: (x0,x1) => globalThis.fetch(x0,x1),
      GR: x0 => x0.document,
      GS: (x0,x1,x2) => ({width: x0,height: x1,facingMode: x2}),
      GT: (x0,x1) => { x0.onchange = x1 },
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (a, i) => a.push(i),
      HC: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      HD: x0 => x0.parentNode,
      HE: x0 => x0.computedStyleMap(),
      HF: x0 => x0.tiltX,
      HG: (o, m, a) => o[m].apply(o, a),
      HH: x0 => x0.keyCode,
      HI: x0 => x0.deref(),
      HJ: x0 => x0.table,
      HK: (x0,x1) => x0.sqlite3_extended_errcode(x1),
      HL: (x0,x1,x2) => x0.setBigInt64(x1,x2),
      HM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      HN: (x0,x1) => ({name: x0,length: x1}),
      HO: x0 => x0.vendor,
      HP: (x0,x1) => x0.detect(x1),
      HQ: (x0,x1) => x0.get(x1),
      HR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      HS: x0 => x0.facingMode,
      HT: x0 => x0.type,
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Int8Array(x0),
      IC: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      ID: x0 => x0.tagName,
      IE: (x0,x1) => x0.get(x1),
      IF: x0 => x0.pointerType,
      IG: x0 => x0.iterator,
      IH: (x0,x1) => x0.scrollIntoView(x1),
      II: () => globalThis.WeakRef,
      IJ: x0 => x0.kind,
      IK: (x0,x1) => x0.sqlite3_close_v2(x1),
      IL: x0 => new Worker(x0),
      IM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      IN: (x0,x1) => x0.update(x1),
      IO: x0 => x0.navigator,
      IP: (x0,x1) => ({formats: x0,tryHarder: x1}),
      IQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      IR: (x0,x1,x2) => x0.addEventListener(x1,x2),
      IS: x0 => x0.height,
      IT: x0 => x0.lastModified,
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      JC: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      JD: x0 => x0.target,
      JE: (o, p) => p in o,
      JF: x0 => x0.pointerId,
      JG: () => globalThis.Symbol,
      JH: x0 => x0.multiViewEnabled,
      JI: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      JJ: x0 => x0.data,
      JK: (x0,x1) => x0.sqlite3_finalize(x1),
      JL: (x0,x1,x2) => new DataView(x0,x1,x2),
      JM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      JN: x0 => x0.name,
      JO: () => globalThis.window,
      JP: (x0,x1) => globalThis.ZXingWASM.readBarcodes(x0,x1),
      JQ: (x0,x1) => x0.forEach(x1),
      JR: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      JS: x0 => x0.width,
      JT: x0 => x0.name,
      K: o => o,
      KB: x0 => new Uint8Array(x0),
      KC: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      KD: x0 => x0.clientY,
      KE: (x0,x1) => { x0.textContent = x1 },
      KF: x0 => x0.getCoalescedEvents(),
      KG: (x0,x1) => new Intl.Segmenter(x0,x1),
      KH: (x0,x1) => x0.replaceWith(x1),
      KI: (a, s, e) => a.slice(s, e),
      KJ: x0 => x0.close(),
      KK: (x0,x1) => x0.sqlite3_reset(x1),
      KL: () => globalThis.Uint8Array,
      KM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      KN: x0 => globalThis.IDBKeyRange.only(x0),
      KO: x0 => ({video: x0}),
      KP: () => new ZXing.MultiFormatReader(),
      KQ: x0 => x0.statusText,
      KR: (x0,x1) => { x0.innerHTML = x1 },
      KS: x0 => x0.attachStreamToVideo,
      KT: (x0,x1) => x0.item(x1),
      L: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      LB: x0 => new Uint8ClampedArray(x0),
      LC: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      LD: x0 => x0.clientX,
      LE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      LF: (x0,x1) => x0.getModifierState(x1),
      LG: x0 => x0.Segmenter,
      LH: (x0,x1) => { x0.type = x1 },
      LI: x0 => x0.naturalHeight,
      LJ: (x0,x1) => x0.postMessage(x1),
      LK: (x0,x1) => x0.sqlite3_get_autocommit(x1),
      LL: x0 => x0.communicationBuffer,
      LM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      LN: (x0,x1,x2) => x0.put(x1,x2),
      LO: (x0,x1) => x0.getUserMedia(x1),
      LP: x0 => new ZXing.HTMLCanvasElementLuminanceSource(x0),
      LQ: x0 => x0.url,
      LR: (x0,x1) => { x0.transform = x1 },
      LS: () => new Map(),
      LT: x0 => x0.length,
      M: x0 => x0.index,
      MB: x0 => new Int16Array(x0),
      MC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      MD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      ME: x0 => x0.matches,
      MF: s => s.trimLeft(),
      MG: x0 => x0.buffer,
      MH: (x0,x1) => { x0.className = x1 },
      MI: x0 => x0.naturalWidth,
      MJ: (x0,x1) => ({kind: x0,table: x1}),
      MK: (x0,x1) => x0.sqlite3_step(x1),
      ML: () => globalThis.Int32Array,
      MM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      MN: (x0,x1) => x0.getKey(x1),
      MO: (x0,x1,x2) => x0.setAttribute(x1,x2),
      MP: x0 => new ZXing.HybridBinarizer(x0),
      MQ: x0 => x0.status,
      MR: x0 => x0.getVideoTracks(),
      MS: (x0,x1,x2) => x0.set(x1,x2),
      MT: x0 => x0.files,
      N: o => String(o),
      NB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      NC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      ND: x0 => x0.getBoundingClientRect(),
      NE: (x0,x1) => x0.matchMedia(x1),
      NF: s => s.toUpperCase(),
      NG: x0 => x0.wasmMemory,
      NH: (x0,x1) => { x0.tabIndex = x1 },
      NI: (x0,x1) => x0.createElement(x1),
      NJ: () => new AbortController(),
      NK: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_blob(x1,x2,x3,x4),
      NL: x0 => x0.byteLength,
      NM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      NN: (x0,x1) => x0.delete(x1),
      NO: x0 => x0.getTracks(),
      NP: x0 => new ZXing.BinaryBitmap(x0),
      NQ: x0 => x0.getReader(),
      NR: x0 => x0.getSettings(),
      NS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      NT: x0 => x0.target,
      O: o => o === undefined,
      OB: x0 => new Uint16Array(x0),
      OC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      OD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      OE: x0 => x0.matches,
      OF: x0 => x0.pop(),
      OG: () => globalThis.window._flutter_skwasmInstance,
      OH: (x0,x1) => { x0.name = x1 },
      OI: (x0,x1) => { x0.pointerEvents = x1 },
      OJ: () => ({}),
      OK: (x0,x1) => x0.dart_sqlite3_malloc(x1),
      OL: x0 => x0.synchronizationBuffer,
      OM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      ON: (x0,x1) => x0.put(x1),
      OO: x0 => x0.stop(),
      OP: (x0,x1) => x0.decode(x1),
      OQ: x0 => x0.read(),
      OR: x0 => x0.facingMode,
      OS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      OT: (x0,x1) => x0.replaceChildren(x1),
      P: (x0,x1) => x0.exec(x1),
      PB: x0 => new Int32Array(x0),
      PC: (x0,x1) => x0.querySelector(x1),
      PD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      PE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      PF: x0 => x0.flags,
      PG: () => new TextDecoder(),
      PH: (x0,x1) => { x0.placeholder = x1 },
      PI: (x0,x1) => { x0.height = x1 },
      PJ: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      PK: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_text(x1,x2,x3,x4),
      PL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PN: (x0,x1,x2) => x0.postMessage(x1,x2),
      PO: (x0,x1) => x0.getContext(x1),
      PP: x0 => x0.text,
      PQ: x0 => x0.value,
      PR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      PS: (x0,x1) => x0.removeChild(x1),
      PT: (x0,x1) => { x0.accept = x1 },
      Q: (x0,x1) => { x0.lastIndex = x1 },
      QB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      QC: (x0,x1) => x0.item(x1),
      QD: Date.now,
      QE: f => f.dartFunction,
      QF: (a, s) => a.join(s),
      QG: (x0,x1) => x0.getRandomValues(x1),
      QH: (x0,x1) => { x0.autocomplete = x1 },
      QI: (x0,x1) => { x0.width = x1 },
      QJ: (x0,x1,x2,x3) => x0.request(x1,x2,x3),
      QK: (x0,x1,x2,x3) => x0.sqlite3_bind_double(x1,x2,x3),
      QL: (x0,x1,x2) => x0.postMessage(x1,x2),
      QM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      QN: x0 => x0.randomUUID(),
      QO: (x0,x1,x2,x3,x4,x5) => x0.drawImage(x1,x2,x3,x4,x5),
      QP: x0 => x0.text,
      QQ: x0 => x0.done,
      QR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      QS: (x0,x1) => { x0.lang = x1 },
      QT: (x0,x1) => { x0.multiple = x1 },
      R: o => o,
      RB: x0 => new Uint32Array(x0),
      RC: x0 => x0.length,
      RD: (handle) => clearTimeout(handle),
      RE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      RF: (x0,x1) => x0.error(x1),
      RG: () => globalThis.crypto,
      RH: (x0,x1) => { x0.name = x1 },
      RI: x0 => x0.style,
      RJ: x0 => x0.name,
      RK: (x0,x1,x2,x3) => x0.sqlite3_bind_int64(x1,x2,x3),
      RL: x0 => new SharedArrayBuffer(x0),
      RM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      RN: () => globalThis.crypto,
      RO: (x0,x1,x2) => x0.toDataURL(x1,x2),
      RP: x0 => x0.isValid,
      RQ: x0 => x0.cancel(),
      RR: (x0,x1) => { x0.onpause = x1 },
      RS: (x0,x1) => { x0.defer = x1 },
      RT: (x0,x1) => { x0.type = x1 },
      S: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      SB: x0 => new Float32Array(x0),
      SC: (x0,x1) => x0.querySelectorAll(x1),
      SD: (x0,x1) => x0.closest(x1),
      SE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      SF: () => globalThis.console,
      SG: l => new DataView(new ArrayBuffer(l)),
      SH: (x0,x1) => { x0.placeholder = x1 },
      SI: (x0,x1) => { x0.src = x1 },
      SJ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      SK: x0 => globalThis.BigInt(x0),
      SL: (x0,x1,x2,x3) => ({clientVersion: x0,root: x1,synchronizationBuffer: x2,communicationBuffer: x3}),
      SM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      SN: x0 => x0.port2,
      SO: x0 => x0.height,
      SP: x0 => x0.rawValue,
      SQ: x0 => x0.body,
      SR: (x0,x1) => { x0.onplay = x1 },
      SS: x0 => x0.stream,
      ST: x0 => x0.length,
      T: o => o instanceof RegExp,
      TB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      TC: (x0,x1) => x0.getAttribute(x1),
      TD: x0 => x0.bottom,
      TE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      TF: s => s.trimRight(),
      TG: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      TH: (x0,x1) => { x0.action = x1 },
      TI: () => globalThis.document,
      TJ: (o, p, v) => o[p] = v,
      TK: (x0,x1,x2) => x0.sqlite3_bind_null(x1,x2),
      TL: x0 => x0.close(),
      TM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      TN: x0 => x0.terminate(),
      TO: x0 => x0.width,
      TP: (x0,x1) => { x0.fillStyle = x1 },
      TQ: x0 => x0.headers,
      TR: (x0,x1) => { x0.controls = x1 },
      TS: x0 => x0.play(),
      TT: x0 => x0.getReader(),
      U: (string, times) => string.repeat(times),
      UB: x0 => new Float64Array(x0),
      UC: x0 => x0.remove(),
      UD: x0 => x0.top,
      UE: (o, i) => o[i],
      UF: x0 => x0.blur(),
      UG: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      UH: (x0,x1) => { x0.method = x1 },
      UI: x0 => x0.src,
      UJ: (o,s,v) => o[s] = v,
      UK: (x0,x1) => x0.sqlite3_bind_parameter_count(x1),
      UL: x0 => x0.getSize(),
      UM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      UN: (x0,x1) => new SharedWorker(x0,x1),
      UO: (x0,x1) => { x0.height = x1 },
      UP: () => globalThis.BarcodeDetector.getSupportedFormats(),
      UQ: x0 => x0.signal,
      UR: (x0,x1) => { x0.pointerEvents = x1 },
      US: x0 => x0.paused,
      UT: x0 => x0.value,
      V: o => o,
      VB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      VC: (x0,x1) => x0.appendChild(x1),
      VD: x0 => x0.right,
      VE: o => o.length,
      VF: x0 => x0.button,
      VG: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      VH: (x0,x1) => { x0.noValidate = x1 },
      VI: (x0,x1) => x0.revokeObjectURL(x1),
      VJ: () => Symbol("jsBoxedDartObjectProperty"),
      VK: (x0,x1) => x0.dart_sqlite3_free(x1),
      VL: (x0,x1) => x0.truncate(x1),
      VM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      VN: x0 => x0.start(),
      VO: (x0,x1) => { x0.width = x1 },
      VP: (x0,x1,x2) => x0.open(x1,x2),
      VQ: (x0,x1) => x0.transferFromImageBitmap(x1),
      VR: (x0,x1) => { x0.transformOrigin = x1 },
      VS: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      VT: x0 => x0.done,
      W: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      WB: x0 => new ArrayBuffer(x0),
      WC: (x0,x1) => x0.append(x1),
      WD: x0 => x0.left,
      WE: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      WF: x0 => x0.innerHeight,
      WG: o => o.byteLength,
      WH: (x0,x1) => x0.removeAttribute(x1),
      WI: (x0,x1) => { x0.src = x1 },
      WJ: (x0,x1) => x0.call(x1),
      WK: (x0,x1,x2,x3,x4,x5,x6) => x0.sqlite3_prepare_v3(x1,x2,x3,x4,x5,x6),
      WL: x0 => ({at: x0}),
      WM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      WN: x0 => x0.port,
      WO: x0 => x0.videoHeight,
      WP: () => globalThis.sgPrint.print(),
      WQ: (x0,x1) => x0.getContext(x1),
      WR: x0 => x0.getSupportedConstraints(),
      WS: (x0,x1,x2) => x0.readBarcodes(x1,x2),
      WT: x0 => x0.read(),
      X: x0 => x0.dotAll,
      XB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      XC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      XD: x0 => x0.clientY,
      XE: x0 => x0.language,
      XF: x0 => x0.innerWidth,
      XG: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      XH: x0 => x0.isConnected,
      XI: (x0,x1,x2,x3,x4) => globalThis.createImageBitmap(x0,x1,x2,x3,x4),
      XJ: x0 => x0.abort(),
      XK: (x0,x1,x2) => x0.sqlite3_column_name(x1,x2),
      XL: (x0,x1) => x0.write(x1),
      XM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      XN: (x0,x1) => new WebSocket(x0,x1),
      XO: x0 => x0.videoWidth,
      XP: () => globalThis.sgPrint,
      XQ: (x0,x1) => { x0.height = x1 },
      XR: x0 => ({ideal: x0}),
      XS: x0 => x0.text,
      XT: x0 => x0.body,
      Y: x0 => x0.unicode,
      YB: (x0,x1,x2) => new DataView(x0,x1,x2),
      YC: x0 => x0.style,
      YD: x0 => x0.clientX,
      YE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      YF: x0 => x0.height,
      YG: x0 => x0.history,
      YH: x0 => x0.click(),
      YI: x0 => x0.naturalHeight,
      YJ: x0 => x0.locks,
      YK: (x0,x1,x2) => x0.sqlite3_column_blob(x1,x2),
      YL: (x0,x1,x2) => x0.write(x1,x2),
      YM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      YN: x0 => x0.reason,
      YO: (x0,x1) => { x0.srcObject = x1 },
      YP: x0 => ({type: x0}),
      YQ: (x0,x1) => { x0.width = x1 },
      YR: (x0,x1,x2) => ({width: x0,height: x1,deviceId: x2}),
      YS: x0 => x0.format,
      YT: (x0,x1) => new OffscreenCanvas(x0,x1),
      Z: x0 => x0.ignoreCase,
      ZB: (o, p) => o[p],
      ZC: x0 => x0.debugShowSemanticsNodes,
      ZD: x0 => x0.changedTouches,
      ZE: () => globalThis.window.FinalizationRegistry,
      ZF: x0 => x0.width,
      ZG: x0 => x0.search,
      ZH: (x0,x1) => x0.getElementsByClassName(x1),
      ZI: x0 => x0.naturalWidth,
      ZJ: () => globalThis.navigator,
      ZK: (x0,x1,x2) => x0.sqlite3_column_bytes(x1,x2),
      ZL: x0 => x0.createSyncAccessHandle(),
      ZM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      ZN: x0 => x0.code,
      ZO: (x0,x1) => { x0.objectFit = x1 },
      ZP: (x0,x1) => new Blob(x0,x1),
      ZQ: x0 => x0.height,
      ZR: (x0,x1) => ({width: x0,height: x1}),
      ZS: x0 => x0.bytes,
      ZT: x0 => x0.assetBase,
      a: x0 => x0.multiline,
      aB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      aC: (x0,x1) => x0.warn(x1),
      aD: x0 => x0.offsetY,
      aE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      aF: x0 => x0.clientHeight,
      aG: x0 => x0.location,
      aH: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      aI: x0 => x0.decode(),
      aJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      aK: (x0,x1,x2) => x0.sqlite3_column_text(x1,x2),
      aL: x0 => ({create: x0}),
      aM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      aN: (x0,x1,x2) => x0.close(x1,x2),
      aO: (x0,x1) => { x0.height = x1 },
      aP: x0 => globalThis.URL.createObjectURL(x0),
      aQ: x0 => x0.width,
      aR: (x0,x1,x2) => ({width: x0,height: x1,facingMode: x2}),
      aS: x0 => x0.y,
      aT: x0 => x0.loader,
      b: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      bB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      bC: x0 => x0.console,
      bD: x0 => x0.offsetX,
      bE: x0 => new window.FinalizationRegistry(x0),
      bF: x0 => x0.clientWidth,
      bG: x0 => x0.pathname,
      bH: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      bI: (x0,x1) => { x0.decoding = x1 },
      bJ: (x0,x1) => x0.postMessage(x1),
      bK: (x0,x1,x2) => x0.sqlite3_column_double(x1,x2),
      bL: (x0,x1,x2) => x0.getFileHandle(x1,x2),
      bM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      bN: (x0,x1) => x0.close(x1),
      bO: (x0,x1) => { x0.width = x1 },
      bP: (x0,x1) => globalThis.sgPrint.prepare(x0,x1),
      bQ: x0 => x0.rasterEndMilliseconds,
      bR: x0 => x0.deviceId,
      bS: x0 => x0.x,
      bT: () => globalThis._flutter,
      c: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      cB: o => o.byteOffset,
      cC: () => globalThis.window,
      cD: x0 => x0.type,
      cE: (x0,x1) => x0.unregister(x1),
      cF: (x0,x1) => { x0.content = x1 },
      cG: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      cH: (x0,x1) => x0.dispatchEvent(x1),
      cI: (x0,x1) => { x0.crossOrigin = x1 },
      cJ: x0 => x0.close(),
      cK: x0 => globalThis.Number(x0),
      cL: x0 => ({create: x0}),
      cM: (x0,x1) => x0.getBigInt64(x1),
      cN: x0 => x0.close(),
      cO: x0 => x0.style,
      cP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      cQ: x0 => x0.rasterStartMilliseconds,
      cR: x0 => x0.getCapabilities(),
      cS: x0 => x0.bottomLeft,
      d: (x0,x1) => x0.didCreateEngineInitializer(x1),
      dB: o => o.buffer,
      dC: (o, c) => o instanceof c,
      dD: x0 => x0.maxTouchPoints,
      dE: (x0,x1) => x0.contains(x1),
      dF: (x0,x1) => { x0.name = x1 },
      dG: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      dH: (x0,x1) => x0.createEvent(x1),
      dI: (x0,x1) => x0.createObjectURL(x1),
      dJ: (x0,x1) => ({i: x0,p: x1}),
      dK: (x0,x1,x2) => x0.sqlite3_column_int64(x1,x2),
      dL: (x0,x1,x2) => x0.getDirectoryHandle(x1,x2),
      dM: (x0,x1) => x0.getInt32(x1),
      dN: (x0,x1) => x0.send(x1),
      dO: (x0,x1) => { x0.muted = x1 },
      dP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      dQ: x0 => x0.imageBitmaps,
      dR: () => ({}),
      dS: x0 => x0.bottomRight,
      e: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eB: Function.prototype.call.bind(DataView.prototype.getUint8),
      eC: (x0,x1) => x0[x1],
      eD: x0 => x0.platform,
      eE: (s) => +s,
      eF: x0 => x0.head,
      eG: o => Object.keys(o),
      eH: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      eI: x0 => x0.URL,
      eJ: () => new Array(),
      eK: (x0,x1,x2) => x0.sqlite3_column_type(x1,x2),
      eL: (x0,x1) => new URL(x0,x1),
      eM: (x0,x1) => x0.read(x1),
      eN: x0 => x0.readyState,
      eO: (x0,x1) => { x0.autoplay = x1 },
      eP: () => globalThis.sgPrint.clear(),
      eQ: x0 => x0.canvasKitMaximumSurfaces,
      eR: (x0,x1) => x0.applyConstraints(x1),
      eS: x0 => x0.topRight,
      f: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      fB: (b, o) => new DataView(b, o),
      fC: x0 => x0.length,
      fD: x0 => x0.body,
      fE: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      fF: (x0,x1) => x0.removeChild(x1),
      fG: x0 => x0.state,
      fH: x0 => x0.readText(),
      fI: x0 => new Blob(x0),
      fJ: (x0,x1) => ({c: x0,r: x1}),
      fK: (x0,x1) => x0.sqlite3_column_count(x1),
      fL: x0 => x0.pathname,
      fM: (x0,x1,x2) => x0.read(x1,x2),
      fN: (x0,x1) => { x0.binaryType = x1 },
      fO: x0 => x0.mediaDevices,
      fP: x0 => globalThis.URL.revokeObjectURL(x0),
      fQ: x0 => x0.nextSibling,
      fR: (x0,x1) => { x0.whiteBalanceMode = x1 },
      fS: x0 => x0.topLeft,
      g: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      gB: (b, o, l) => new DataView(b, o, l),
      gC: (string, token) => string.split(token),
      gD: () => globalThis.document,
      gE: s => s.trim(),
      gF: x0 => x0.firstChild,
      gG: x0 => x0.hash,
      gH: x0 => x0.clipboard,
      gI: x0 => x0.close(),
      gJ: (x0,x1) => { x0.onmessage = x1 },
      gK: (x0,x1) => x0.sqlite3_stmt_isexplain(x1),
      gL: x0 => x0.getDirectory(),
      gM: x0 => x0.flush(),
      gN: (a, l) => a.length = l,
      gO: x0 => x0.decode(),
      gP: x0 => x0.maxTouchPoints,
      gQ: (x0,x1) => x0.debug(x1),
      gR: x0 => x0.whiteBalanceMode,
      gS: x0 => x0.position,
      h: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      hC: o => o instanceof Array,
      hD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      hE: x0 => x0.classList,
      hF: x0 => x0.viewConstraints,
      hG: x0 => x0.state,
      hH: (x0,x1) => x0.writeText(x1),
      hI: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      hJ: (o, a) => o == a,
      hK: (x0,x1) => x0.sqlite3_last_insert_rowid(x1),
      hL: x0 => x0.storage,
      hM: () => globalThis.WebAssembly,
      hN: x0 => globalThis.sgVision.fingerprint(x0),
      hO: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      hP: x0 => x0.userAgent,
      hQ: x0 => x0.hostElement,
      hR: (x0,x1) => { x0.exposureMode = x1 },
      hS: x0 => x0.isValid,
      i: x0 => new Promise(x0),
      iB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      iC: (a, i) => a[i],
      iD: x0 => x0.hasFocus(),
      iE: x0 => x0.preventDefault(),
      iF: x0 => x0.hostElement,
      iG: (x0,x1) => x0.go(x1),
      iH: x0 => x0.unlock(),
      iI: (x0,x1) => x0.decode(x1),
      iJ: (o, t) => typeof o === t,
      iK: (x0,x1,x2,x3,x4,x5) => x0.sqlite3_exec(x1,x2,x3,x4,x5),
      iL: () => globalThis.navigator,
      iM: x0 => x0.href,
      iN: x0 => x0.colour,
      iO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      iP: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      iQ: x0 => x0.location,
      iR: x0 => x0.exposureMode,
      iS: (x0,x1,x2,x3) => ({formats: x0,tryHarder: x1,tryRotate: x2,tryInvert: x3}),
      j: (x0,x1,x2) => x0.call(x1,x2),
      jB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      jC: a => a.length,
      jD: x0 => x0.relatedTarget,
      jE: x0 => x0.parent,
      jF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jG: x0 => x0.parentElement,
      jH: (x0,x1) => x0.lock(x1),
      jI: x0 => x0.displayHeight,
      jJ: x0 => x0.r,
      jK: (x0,x1) => x0.sqlite3_changes(x1),
      jL: (x0,x1) => globalThis.fetch(x0,x1),
      jM: (x0,x1) => x0.openCursor(x1),
      jN: x0 => x0.embeddings,
      jO: (x0,x1,x2) => x0.addEventListener(x1,x2),
      jP: x0 => x0.state,
      jQ: (x0,x1) => x0.getModifierState(x1),
      jR: (x0,x1) => { x0.focusMode = x1 },
      jS: (x0,x1,x2) => ({tryHarder: x0,tryRotate: x1,tryInvert: x2}),
      k: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      kB: (t, s) => t.set(s),
      kC: (x0,x1) => x0.test(x1),
      kD: x0 => x0.shiftKey,
      kE: x0 => x0.timeStamp,
      kF: x0 => ({runApp: x0}),
      kG: (x0,x1) => x0.querySelectorAll(x1),
      kH: x0 => x0.orientation,
      kI: x0 => x0.displayWidth,
      kJ: x0 => x0.c,
      kK: (x0,x1,x2,x3,x4,x5,x6) => x0.dart_sqlite3_create_function_v2(x1,x2,x3,x4,x5,x6),
      kL: (x0,x1) => x0.sqlite3session_delete(x1),
      kM: x0 => x0.arrayBuffer(),
      kN: () => globalThis.sgVision.load(),
      kO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      kP: x0 => x0.history,
      kQ: x0 => x0.metaKey,
      kR: x0 => x0.focusMode,
      kS: () => globalThis.ZXingWASM,
      l: x0 => new Array(x0),
      lB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      lC: x0 => x0.userAgent,
      lD: (decoder, codeUnits) => decoder.decode(codeUnits),
      lE: (x0,x1) => x0.hasAttribute(x1),
      lF: () => typeof dartUseDateNowForTicks !== "undefined",
      lG: (d, digits) => d.toFixed(digits),
      lH: (x0,x1) => x0.querySelector(x1),
      lI: x0 => x0.duration,
      lJ: x0 => x0.p,
      lK: (x0,x1,x2,x3) => x0.sqlite3_result_error(x1,x2,x3),
      lL: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      lM: () => globalThis.Blob,
      lN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      lO: x0 => x0.send(),
      lP: (x0,x1,x2) => x0.insertBefore(x1,x2),
      lQ: x0 => x0.altKey,
      lR: x0 => x0.enumerateDevices(),
      lS: x0 => ({willReadFrequently: x0}),
      m: o => [o],
      mB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      mC: x0 => x0.navigator,
      mD: () => new TextDecoder("utf-8", {fatal: true}),
      mE: x0 => x0.buttons,
      mF: () => Date.now(),
      mG: x0 => x0.maxHeight,
      mH: (x0,x1) => { x0.title = x1 },
      mI: x0 => x0.image,
      mJ: x0 => x0.i,
      mK: (x0,x1,x2) => x0.sqlite3_result_subtype(x1,x2),
      mL: (x0,x1) => x0.unregister(x1),
      mM: x0 => x0.value,
      mN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      mO: x0 => x0.status,
      mP: x0 => x0.id,
      mQ: x0 => x0.ctrlKey,
      mR: x0 => x0.deviceId,
      mS: (x0,x1,x2) => x0.getContext(x1,x2),
      n: (o0, o1) => [o0, o1],
      nB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      nC: Function.prototype.call.bind(String.prototype.toLowerCase),
      nD: () => new TextDecoder("utf-8", {fatal: false}),
      nE: x0 => x0.ctrlKey,
      nF: () => 1000 * performance.now(),
      nG: x0 => x0.maxWidth,
      nH: (x0,x1) => x0.vibrate(x1),
      nI: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      nJ: x0 => x0.port1,
      nK: (x0,x1,x2,x3,x4) => x0.sqlite3_result_blob64(x1,x2,x3,x4),
      nL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      nM: x0 => x0.key,
      nN: (x0,x1) => x0.appendChild(x1),
      nO: x0 => x0.response,
      nP: x0 => x0.offsetHeight,
      nQ: x0 => x0.isComposing,
      nR: x0 => x0.kind,
      nS: () => new BarcodeDetector(),
      o: (o0, o1, o2) => [o0, o1, o2],
      oB: Function.prototype.call.bind(DataView.prototype.getUint32),
      oC: Object.is,
      oD: (a, i, v) => a[i] = v,
      oE: x0 => x0.y,
      oF: (x0,x1) => x0.requestAnimationFrame(x1),
      oG: x0 => x0.minHeight,
      oH: x0 => x0.arrayBuffer(),
      oI: x0 => new window.ImageDecoder(x0),
      oJ: (x0,x1,x2) => x0.transaction(x1,x2),
      oK: (x0,x1,x2,x3,x4) => x0.sqlite3_result_text(x1,x2,x3,x4),
      oL: x0 => new FinalizationRegistry(x0),
      oM: x0 => x0.continue(),
      oN: x0 => x0.remove(),
      oO: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      oP: x0 => x0.offsetWidth,
      oQ: x0 => x0.code,
      oR: x0 => x0.facingMode,
      oS: x0 => ({formats: x0}),
      p: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      pB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      pC: x0 => x0.vendor,
      pD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      pE: x0 => x0.x,
      pF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      pG: x0 => x0.minWidth,
      pH: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      pI: x0 => x0.name,
      pJ: x0 => x0.close(),
      pK: (x0,x1,x2) => x0.sqlite3_result_double(x1,x2),
      pL: () => globalThis.FinalizationRegistry,
      pM: x0 => x0.error,
      pN: x0 => x0.head,
      pO: (x0,x1) => { x0.responseType = x1 },
      pP: x0 => x0.stopPropagation(),
      pQ: x0 => x0.repeat,
      pR: x0 => x0.mediaDevices,
      pS: x0 => new BarcodeDetector(x0),
      q: (x0,x1,x2) => { x0[x1] = x2 },
      qB: Function.prototype.call.bind(DataView.prototype.getInt32),
      qC: (x0,x1) => x0.createTextNode(x1),
      qD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      qE: x0 => x0.scrollTop,
      qF: x0 => x0.now(),
      qG: (x0,x1) => x0.removeProperty(x1),
      qH: x0 => x0.status,
      qI: x0 => x0.repetitionCount,
      qJ: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      qK: (x0,x1,x2) => x0.sqlite3_result_int64(x1,x2),
      qL: (x0,x1) => x0.sqlite3changeset_finalize(x1),
      qM: x0 => x0.result,
      qN: (x0,x1) => { x0.onerror = x1 },
      qO: () => new XMLHttpRequest(),
      qP: x0 => x0.disabled,
      qQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qR: () => globalThis.BarcodeDetector.getSupportedFormats(),
      qS: (x0,x1) => x0.detect(x1),
      r: (o, p) => o[p],
      rB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      rC: (x0,x1) => { x0.id = x1 },
      rD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      rE: x0 => x0.offsetTop,
      rF: x0 => x0.performance,
      rG: (x0,x1) => x0.add(x1),
      rH: (x0,x1) => x0.fetch(x1),
      rI: x0 => x0.frameCount,
      rJ: () => globalThis.Promise.resolve(),
      rK: (x0,x1) => x0.sqlite3_result_null(x1),
      rL: x0 => x0.exports,
      rM: (x0,x1) => globalThis.IDBKeyRange.bound(x0,x1),
      rN: (x0,x1) => { x0.onload = x1 },
      rO: (x0,x1) => x0.querySelector(x1),
      rP: (x0,x1) => { x0.min = x1 },
      rQ: (x0,x1) => x0.key(x1),
      rR: x0 => x0.reset,
      rS: x0 => x0.rawValue,
      s: () => globalThis,
      sB: o => o instanceof Uint16Array,
      sC: (x0,x1) => { x0.nonce = x1 },
      sD: x0 => x0.visibilityState,
      sE: x0 => x0.scrollLeft,
      sF: x0 => new Uint8Array(x0),
      sG: x0 => x0.data,
      sH: x0 => x0.content,
      sI: x0 => x0.selectedTrack,
      sJ: (x0,x1) => x0.then(x1),
      sK: (x0,x1) => x0.sqlite3_value_blob(x1),
      sL: x0 => x0.call(),
      sM: x0 => x0.length,
      sN: (x0,x1) => { x0.src = x1 },
      sO: (x0,x1,x2,x3,x4) => x0.getImageData(x1,x2,x3,x4),
      sP: (x0,x1) => { x0.max = x1 },
      sQ: x0 => x0.length,
      sR: x0 => x0.stopContinuousDecode,
      sS: x0 => x0.format,
      t: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tB: Function.prototype.call.bind(DataView.prototype.getUint16),
      tC: x0 => x0.nonce,
      tD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      tE: x0 => x0.offsetLeft,
      tF: (x0,x1,x2) => x0.slice(x1,x2),
      tG: (x0,x1) => { x0.scrollTop = x1 },
      tH: x0 => x0.document,
      tI: x0 => x0.completed,
      tJ: x0 => x0.abort(),
      tK: (x0,x1) => x0.sqlite3_value_bytes(x1),
      tL: x0 => x0.instance,
      tM: (x0,x1) => x0.get(x1),
      tN: x0 => x0.baseURI,
      tO: x0 => x0.data,
      tP: (x0,x1) => { x0.disabled = x1 },
      tQ: (x0,x1) => x0.canShare(x1),
      tR: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      tS: x0 => x0.y,
      u: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uB: o => o instanceof Int16Array,
      uC: () => globalThis.window.flutterConfiguration,
      uD: x0 => x0.disconnect(),
      uE: x0 => x0.offsetParent,
      uF: (x0,x1) => x0.decode(x1),
      uG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      uH: (a, i) => a.splice(i, 1),
      uI: x0 => x0.ready,
      uJ: x0 => x0.commit(),
      uK: (x0,x1) => x0.sqlite3_value_text(x1),
      uL: (x0,x1,x2) => x0.instantiateStreaming(x1,x2),
      uM: (x0,x1) => x0.index(x1),
      uN: () => globalThis.document,
      uO: (x0,x1) => x0.getElementById(x1),
      uP: (x0,x1) => { x0.scrollLeft = x1 },
      uQ: (x0,x1) => x0.share(x1),
      uR: (x0,x1,x2,x3) => x0.call(x1,x2,x3),
      uS: x0 => x0.x,
      v: (x0,x1) => ({addView: x0,removeView: x1}),
      vB: Function.prototype.call.bind(DataView.prototype.getInt16),
      vC: (x0,x1) => x0.attachShadow(x1),
      vD: x0 => new Intl.Locale(x0),
      vE: (o, p, r) => o.replace(p, () => r),
      vF: (x0,x1) => x0.adoptText(x1),
      vG: (x0,x1) => { x0.value = x1 },
      vH: (a, l) => a.length = l,
      vI: x0 => x0.tracks,
      vJ: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      vK: (x0,x1) => x0.sqlite3_value_double(x1),
      vL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      vM: x0 => x0.openKeyCursor(),
      vN: (x0,x1) => { x0.type = x1 },
      vO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      vP: (x0,x1) => { x0.spellcheck = x1 },
      vQ: x0 => x0.message,
      vR: x0 => x0.text,
      vS: x0 => x0.cornerPoints,
      w: (l, r) => l === r,
      wB: o => o instanceof Uint8ClampedArray,
      wC: (x0,x1) => x0.createElement(x1),
      wD: x0 => x0.region,
      wE: (o, p, r) => o.replaceAll(p, () => r),
      wF: x0 => x0.first(),
      wG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      wH: a => a.pop(),
      wI: () => globalThis.window.ImageDecoder,
      wJ: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      wK: (x0,x1) => x0.sqlite3_value_int64(x1),
      wL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      wM: x0 => x0.primaryKey,
      wN: (x0,x1) => x0.createElement(x1),
      wO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      wP: (x0,x1) => { x0.disabled = x1 },
      wQ: x0 => ({files: x0}),
      wR: x0 => x0.barcodeFormat,
      wS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      x: x0 => x0.random(),
      xB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      xC: x0 => x0.scale,
      xD: x0 => x0.script,
      xE: x0 => x0.deltaMode,
      xF: x0 => x0.next(),
      xG: (x0,x1) => { x0.value = x1 },
      xH: (map, o, v) => map.set(o, v),
      xI: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      xJ: (x0,x1) => { x0.onerror = x1 },
      xK: (x0,x1) => x0.sqlite3_value_type(x1),
      xL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      xM: (x0,x1,x2) => x0.open(x1,x2),
      xN: Function.prototype.call.bind(DataView.prototype.getBigUint64),
      xO: (x0,x1) => { x0.crossOrigin = x1 },
      xP: (x0,x1) => x0.getItem(x1),
      xQ: () => ({}),
      xR: x0 => x0.rawBytes,
      xS: (x0,x1,x2,x3) => x0.toBlob(x1,x2,x3),
      y: () => globalThis.Math,
      yB: Function.prototype.call.bind(DataView.prototype.setInt32),
      yC: x0 => x0.visualViewport,
      yD: x0 => x0.language,
      yE: x0 => x0.deltaY,
      yF: x0 => x0.current(),
      yG: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      yH: (map, o) => map.get(o),
      yI: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      yJ: x0 => new DOMException(x0),
      yK: (x0,x1,x2) => x0.sqlite3_extended_result_codes(x1,x2),
      yL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      yM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      yN: () => new FileReader(),
      yO: (x0,x1) => { x0.async = x1 },
      yP: x0 => x0.localStorage,
      yQ: (x0,x1,x2) => new File(x0,x1,x2),
      yR: x0 => x0.y,
      yS: x0 => x0.size,
      z: (x0,x1) => x0.prepend(x1),
      zB: Function.prototype.call.bind(DataView.prototype.setUint32),
      zC: x0 => x0.devicePixelRatio,
      zD: x0 => x0.languages,
      zE: x0 => x0.deltaX,
      zF: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      zG: x0 => x0.value,
      zH: () => new WeakMap(),
      zI: (o, p) => p in o,
      zJ: x0 => x0.error,
      zK: (x0,x1,x2,x3,x4) => x0.sqlite3_open_v2(x1,x2,x3,x4),
      zL: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      zM: (x0,x1) => { x0.onupgradeneeded = x1 },
      zN: (x0,x1) => x0.readAsArrayBuffer(x1),
      zO: (x0,x1) => { x0.id = x1 },
      zP: x0 => x0.href,
      zQ: (x0,x1) => { x0.type = x1 },
      zR: x0 => x0.x,
      zS: x0 => x0.height,

    };

    const baseImports = {
      _: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      "intoCharCodeArray": (s, a, start) => {
        if (s === '') return 0;

        const write = dartInstance.exports.$wasmI16ArraySet;
        for (var i = 0; i < s.length; ++i) {
          write(a, start++, s.charCodeAt(i));
        }
        return s.length;
      },
      "test": (s) => typeof s == "string",
    };


    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
