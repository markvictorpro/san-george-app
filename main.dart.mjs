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
      AI: x0 => x0.offsetWidth,
      AJ: x0 => new window.ImageDecoder(x0),
      AK: (x0,x1,x2) => x0.transaction(x1,x2),
      AL: (x0,x1,x2,x3,x4) => x0.sqlite3_result_text(x1,x2,x3,x4),
      AM: x0 => new FinalizationRegistry(x0),
      AN: x0 => x0.continue(),
      AO: x0 => x0.remove(),
      AP: (x0,x1,x2) => x0.addEventListener(x1,x2),
      AQ: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      AR: (x0,x1) => x0.canShare(x1),
      AS: x0 => x0.text,
      AT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      B: s => printToConsole(s),
      BB: b => !!b,
      BC: Function.prototype.call.bind(DataView.prototype.setUint16),
      BD: x0 => x0.width,
      BE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      BF: x0 => x0.wheelDeltaX,
      BG: () => globalThis.Intl,
      BH: x0 => x0.selectionStart,
      BI: x0 => x0.stopPropagation(),
      BJ: x0 => x0.name,
      BK: x0 => x0.close(),
      BL: (x0,x1,x2) => x0.sqlite3_result_double(x1,x2),
      BM: () => globalThis.FinalizationRegistry,
      BN: x0 => x0.error,
      BO: x0 => x0.head,
      BP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      BQ: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      BR: (x0,x1) => x0.share(x1),
      BS: x0 => x0.barcodeFormat,
      BT: (x0,x1,x2,x3) => x0.toBlob(x1,x2,x3),
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CC: Function.prototype.call.bind(DataView.prototype.setUint8),
      CD: x0 => x0.screen,
      CE: x0 => new ResizeObserver(x0),
      CF: x0 => x0.key,
      CG: (x0,x1) => x0.segment(x1),
      CH: x0 => x0.selectionEnd,
      CI: x0 => x0.disabled,
      CJ: x0 => x0.repetitionCount,
      CK: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      CL: (x0,x1,x2) => x0.sqlite3_result_int64(x1,x2),
      CM: (x0,x1) => x0.sqlite3changeset_finalize(x1),
      CN: x0 => x0.result,
      CO: (x0,x1) => { x0.onerror = x1 },
      CP: x0 => x0.send(),
      CQ: x0 => x0.state,
      CR: x0 => x0.message,
      CS: x0 => x0.rawBytes,
      CT: x0 => x0.size,
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
      DI: (x0,x1) => { x0.min = x1 },
      DJ: x0 => x0.frameCount,
      DK: () => globalThis.Promise.resolve(),
      DL: (x0,x1) => x0.sqlite3_result_null(x1),
      DM: x0 => x0.exports,
      DN: (x0,x1) => globalThis.IDBKeyRange.bound(x0,x1),
      DO: (x0,x1) => { x0.onload = x1 },
      DP: x0 => x0.status,
      DQ: x0 => x0.history,
      DR: x0 => ({files: x0}),
      DS: x0 => x0.y,
      DT: x0 => x0.height,
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
      EI: (x0,x1) => { x0.max = x1 },
      EJ: x0 => x0.selectedTrack,
      EK: (x0,x1) => x0.then(x1),
      EL: (x0,x1) => x0.sqlite3_value_blob(x1),
      EM: x0 => x0.call(),
      EN: x0 => x0.length,
      EO: (x0,x1) => { x0.src = x1 },
      EP: x0 => x0.response,
      EQ: (x0,x1) => x0.getItem(x1),
      ER: () => ({}),
      ES: x0 => x0.x,
      ET: x0 => x0.width,
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
      FI: (x0,x1) => { x0.disabled = x1 },
      FJ: x0 => x0.completed,
      FK: x0 => x0.abort(),
      FL: (x0,x1) => x0.sqlite3_value_bytes(x1),
      FM: x0 => x0.instance,
      FN: (x0,x1) => x0.get(x1),
      FO: x0 => x0.baseURI,
      FP: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      FQ: x0 => x0.localStorage,
      FR: (x0,x1,x2) => new File(x0,x1,x2),
      FS: x0 => x0.resultPoints,
      FT: (x0,x1) => { x0.src = x1 },
      G: s => JSON.stringify(s),
      GB: () => [],
      GC: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      GD: x0 => x0.activeElement,
      GE: x0 => x0.documentElement,
      GF: x0 => x0.tiltY,
      GG: x0 => x0.done,
      GH: x0 => x0.selectionEnd,
      GI: (x0,x1) => { x0.scrollLeft = x1 },
      GJ: x0 => x0.ready,
      GK: x0 => x0.commit(),
      GL: (x0,x1) => x0.sqlite3_value_text(x1),
      GM: (x0,x1,x2) => x0.instantiateStreaming(x1,x2),
      GN: (x0,x1) => x0.index(x1),
      GO: () => globalThis.document,
      GP: (x0,x1) => { x0.responseType = x1 },
      GQ: x0 => x0.href,
      GR: (x0,x1) => { x0.type = x1 },
      GS: x0 => x0.message,
      GT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (a, i) => a.push(i),
      HC: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      HD: x0 => x0.parentNode,
      HE: x0 => x0.computedStyleMap(),
      HF: x0 => x0.tiltX,
      HG: (o, m, a) => o[m].apply(o, a),
      HH: x0 => x0.keyCode,
      HI: (x0,x1) => { x0.spellcheck = x1 },
      HJ: x0 => x0.tracks,
      HK: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      HL: (x0,x1) => x0.sqlite3_value_double(x1),
      HM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      HN: x0 => x0.openKeyCursor(),
      HO: (x0,x1) => { x0.type = x1 },
      HP: () => new XMLHttpRequest(),
      HQ: x0 => x0.location,
      HR: (x0,x1) => x0.append(x1),
      HS: x0 => x0.videoElement,
      HT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Int8Array(x0),
      IC: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      ID: x0 => x0.tagName,
      IE: (x0,x1) => x0.get(x1),
      IF: x0 => x0.pointerType,
      IG: x0 => x0.iterator,
      IH: (x0,x1) => x0.scrollIntoView(x1),
      II: (x0,x1) => { x0.disabled = x1 },
      IJ: () => globalThis.window.ImageDecoder,
      IK: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      IL: (x0,x1) => x0.sqlite3_value_int64(x1),
      IM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      IN: x0 => x0.primaryKey,
      IO: (x0,x1) => x0.createElement(x1),
      IP: (x0,x1) => x0.querySelector(x1),
      IQ: (x0,x1) => x0.removeItem(x1),
      IR: x0 => x0.click(),
      IS: x0 => x0.decodeContinuously,
      IT: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
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
      JI: (x0,x1) => x0.getRandomValues(x1),
      JJ: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      JK: (x0,x1) => { x0.onerror = x1 },
      JL: (x0,x1) => x0.sqlite3_value_type(x1),
      JM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      JN: (x0,x1,x2) => x0.open(x1,x2),
      JO: Function.prototype.call.bind(DataView.prototype.getBigUint64),
      JP: (x0,x1,x2,x3,x4) => x0.getImageData(x1,x2,x3,x4),
      JQ: (x0,x1,x2) => x0.setItem(x1,x2),
      JR: x0 => x0.body,
      JS: (x0,x1) => new ZXing.BrowserMultiFormatReader(x0,x1),
      JT: (x0,x1) => { x0.oncancel = x1 },
      K: o => o,
      KB: x0 => new Uint8Array(x0),
      KC: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      KD: x0 => x0.clientY,
      KE: (x0,x1) => { x0.textContent = x1 },
      KF: x0 => x0.getCoalescedEvents(),
      KG: (x0,x1) => new Intl.Segmenter(x0,x1),
      KH: (x0,x1) => x0.replaceWith(x1),
      KI: () => globalThis.crypto,
      KJ: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      KK: x0 => new DOMException(x0),
      KL: (x0,x1,x2) => x0.sqlite3_extended_result_codes(x1,x2),
      KM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      KN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      KO: () => new FileReader(),
      KP: x0 => x0.data,
      KQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      KR: (x0,x1) => { x0.target = x1 },
      KS: (x0,x1) => ({width: x0,height: x1}),
      KT: (x0,x1) => { x0.onchange = x1 },
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
      LI: l => new DataView(new ArrayBuffer(l)),
      LJ: (o, p) => p in o,
      LK: x0 => x0.error,
      LL: (x0,x1,x2,x3,x4) => x0.sqlite3_open_v2(x1,x2,x3,x4),
      LM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      LN: (x0,x1) => { x0.onupgradeneeded = x1 },
      LO: (x0,x1) => x0.readAsArrayBuffer(x1),
      LP: (x0,x1) => x0.getElementById(x1),
      LQ: (x0,x1) => { x0.onmessage = x1 },
      LR: (x0,x1) => { x0.download = x1 },
      LS: (x0,x1,x2) => ({width: x0,height: x1,facingMode: x2}),
      LT: x0 => x0.type,
      M: x0 => x0.index,
      MB: x0 => new Int16Array(x0),
      MC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      MD: (x0,x1,x2) => x0.setAttribute(x1,x2),
      ME: x0 => x0.matches,
      MF: s => s.trimLeft(),
      MG: x0 => x0.buffer,
      MH: (x0,x1) => { x0.className = x1 },
      MI: (a, i) => a.splice(i, 1),
      MJ: x0 => x0.groups,
      MK: (x0,x1) => { x0.onabort = x1 },
      ML: x0 => x0.sqlite3_initialize(),
      MM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      MN: x0 => ({autoIncrement: x0}),
      MO: x0 => x0.result,
      MP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      MQ: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      MR: (x0,x1) => { x0.href = x1 },
      MS: x0 => x0.facingMode,
      MT: x0 => x0.lastModified,
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
      NI: (a, l) => a.length = l,
      NJ: () => new MessageChannel(),
      NK: (x0,x1) => { x0.oncomplete = x1 },
      NL: (x0,x1,x2,x3) => x0.dart_sqlite3_register_vfs(x1,x2,x3),
      NM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      NN: (x0,x1,x2) => x0.createObjectStore(x1,x2),
      NO: () => new XMLHttpRequest(),
      NP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      NQ: (x0,x1) => globalThis.fetch(x0,x1),
      NR: x0 => x0.document,
      NS: x0 => x0.height,
      NT: x0 => x0.name,
      O: o => o === undefined,
      OB: x0 => new Uint16Array(x0),
      OC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      OD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      OE: x0 => x0.matches,
      OF: x0 => x0.pop(),
      OG: () => globalThis.window._flutter_skwasmInstance,
      OH: (x0,x1) => { x0.name = x1 },
      OI: a => a.pop(),
      OJ: x0 => new BroadcastChannel(x0),
      OK: (x0,x1) => x0.objectStore(x1),
      OL: (x0,x1) => globalThis.Atomics.load(x0,x1),
      OM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      ON: x0 => ({unique: x0}),
      OO: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      OP: (x0,x1) => { x0.crossOrigin = x1 },
      OQ: (x0,x1) => x0.get(x1),
      OR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      OS: x0 => x0.width,
      OT: (x0,x1) => x0.item(x1),
      P: (x0,x1) => x0.exec(x1),
      PB: x0 => new Int32Array(x0),
      PC: (x0,x1) => x0.querySelector(x1),
      PD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      PE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      PF: x0 => x0.flags,
      PG: () => new TextDecoder(),
      PH: (x0,x1) => { x0.placeholder = x1 },
      PI: (map, o, v) => map.set(o, v),
      PJ: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      PK: x0 => x0.buffer,
      PL: (x0,x1,x2) => globalThis.Atomics.wait(x0,x1,x2),
      PM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      PN: (x0,x1,x2,x3) => x0.createIndex(x1,x2,x3),
      PO: x0 => x0.send(),
      PP: (x0,x1) => { x0.async = x1 },
      PQ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      PR: (x0,x1) => { x0.innerHTML = x1 },
      PS: x0 => x0.attachStreamToVideo,
      PT: x0 => x0.length,
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
      QG: (d, digits) => d.toFixed(digits),
      QH: (x0,x1) => { x0.autocomplete = x1 },
      QI: (map, o) => map.get(o),
      QJ: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      QK: (x0,x1) => x0.sqlite3_errstr(x1),
      QL: (x0,x1,x2) => globalThis.Atomics.notify(x0,x1,x2),
      QM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      QN: (x0,x1) => x0.createObjectStore(x1),
      QO: x0 => x0.type,
      QP: (x0,x1) => { x0.id = x1 },
      QQ: (x0,x1) => x0.forEach(x1),
      QR: (x0,x1) => { x0.transform = x1 },
      QS: () => new Map(),
      QT: x0 => x0.files,
      R: o => o,
      RB: x0 => new Uint32Array(x0),
      RC: x0 => x0.length,
      RD: (handle) => clearTimeout(handle),
      RE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      RF: (x0,x1) => x0.error(x1),
      RG: x0 => x0.maxHeight,
      RH: (x0,x1) => { x0.name = x1 },
      RI: () => new WeakMap(),
      RJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      RK: (x0,x1) => x0.sqlite3_errmsg(x1),
      RL: (x0,x1,x2) => globalThis.Atomics.store(x0,x1,x2),
      RM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      RN: x0 => x0.oldVersion,
      RO: x0 => x0.response,
      RP: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      RQ: x0 => x0.statusText,
      RR: x0 => x0.getVideoTracks(),
      RS: (x0,x1,x2) => x0.set(x1,x2),
      RT: x0 => x0.target,
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
      SG: x0 => x0.maxWidth,
      SH: (x0,x1) => { x0.placeholder = x1 },
      SI: x0 => new WeakRef(x0),
      SJ: x0 => globalThis.Array.isArray(x0),
      SK: (x0,x1) => x0.sqlite3_error_offset(x1),
      SL: (x0,x1,x2) => x0.setInt32(x1,x2),
      SM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      SN: () => globalThis.indexedDB,
      SO: (x0,x1) => { x0.responseType = x1 },
      SP: x0 => ({locateFile: x0}),
      SQ: x0 => x0.url,
      SR: x0 => x0.getSettings(),
      SS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      ST: (x0,x1) => x0.replaceChildren(x1),
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
      TG: x0 => x0.minHeight,
      TH: (x0,x1) => { x0.action = x1 },
      TI: x0 => x0.deref(),
      TJ: x0 => x0.table,
      TK: (x0,x1) => x0.sqlite3_extended_errcode(x1),
      TL: (x0,x1,x2) => x0.setBigInt64(x1,x2),
      TM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      TN: (x0,x1) => ({name: x0,length: x1}),
      TO: x0 => x0.vendor,
      TP: (x0,x1) => ({overrides: x0,fireImmediately: x1}),
      TQ: x0 => x0.status,
      TR: x0 => x0.facingMode,
      TS: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      TT: (x0,x1) => { x0.accept = x1 },
      U: (string, times) => string.repeat(times),
      UB: x0 => new Float64Array(x0),
      UC: x0 => x0.remove(),
      UD: x0 => x0.top,
      UE: (o, i) => o[i],
      UF: x0 => x0.blur(),
      UG: x0 => x0.minWidth,
      UH: (x0,x1) => { x0.method = x1 },
      UI: () => globalThis.WeakRef,
      UJ: x0 => x0.kind,
      UK: (x0,x1) => x0.sqlite3_close_v2(x1),
      UL: x0 => new Worker(x0),
      UM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      UN: (x0,x1) => x0.update(x1),
      UO: x0 => x0.navigator,
      UP: x0 => globalThis.ZXingWASM.prepareZXingModule(x0),
      UQ: x0 => x0.getReader(),
      UR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      US: (x0,x1) => x0.removeChild(x1),
      UT: (x0,x1) => { x0.multiple = x1 },
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
      VG: x0 => x0.debugSkipFontRetryDelay,
      VH: (x0,x1) => { x0.noValidate = x1 },
      VI: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      VJ: x0 => x0.data,
      VK: (x0,x1) => x0.sqlite3_finalize(x1),
      VL: (x0,x1,x2) => new DataView(x0,x1,x2),
      VM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      VN: x0 => x0.name,
      VO: () => globalThis.window,
      VP: (x0,x1,x2,x3,x4) => x0.fillRect(x1,x2,x3,x4),
      VQ: x0 => x0.read(),
      VR: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      VS: (x0,x1) => { x0.lang = x1 },
      VT: (x0,x1) => { x0.type = x1 },
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
      WG: x0 => x0.status,
      WH: (x0,x1) => x0.removeAttribute(x1),
      WI: (a, s, e) => a.slice(s, e),
      WJ: x0 => x0.close(),
      WK: (x0,x1) => x0.sqlite3_reset(x1),
      WL: () => globalThis.Uint8Array,
      WM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      WN: x0 => globalThis.IDBKeyRange.only(x0),
      WO: (x0,x1) => ({video: x0,audio: x1}),
      WP: x0 => ({formats: x0}),
      WQ: x0 => x0.value,
      WR: (x0,x1) => { x0.onpause = x1 },
      WS: (x0,x1) => { x0.defer = x1 },
      WT: x0 => x0.length,
      X: x0 => x0.dotAll,
      XB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      XC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      XD: x0 => x0.clientY,
      XE: x0 => x0.language,
      XF: x0 => x0.innerWidth,
      XG: (x0,x1,x2) => x0.set(x1,x2),
      XH: x0 => x0.isConnected,
      XI: x0 => x0.naturalHeight,
      XJ: (x0,x1) => x0.postMessage(x1),
      XK: (x0,x1) => x0.sqlite3_get_autocommit(x1),
      XL: x0 => x0.communicationBuffer,
      XM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      XN: (x0,x1,x2) => x0.put(x1,x2),
      XO: (x0,x1) => x0.getUserMedia(x1),
      XP: x0 => new BarcodeDetector(x0),
      XQ: x0 => x0.done,
      XR: (x0,x1) => { x0.onplay = x1 },
      XS: x0 => x0.stream,
      XT: x0 => x0.getReader(),
      Y: x0 => x0.unicode,
      YB: (x0,x1,x2) => new DataView(x0,x1,x2),
      YC: x0 => x0.style,
      YD: x0 => x0.clientX,
      YE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      YF: x0 => x0.height,
      YG: x0 => x0.arrayBuffer(),
      YH: x0 => x0.click(),
      YI: x0 => x0.naturalWidth,
      YJ: (x0,x1) => ({kind: x0,table: x1}),
      YK: (x0,x1) => x0.sqlite3_step(x1),
      YL: () => globalThis.Int32Array,
      YM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      YN: (x0,x1) => x0.getKey(x1),
      YO: (x0,x1,x2) => x0.setAttribute(x1,x2),
      YP: (x0,x1) => x0.detect(x1),
      YQ: x0 => x0.cancel(),
      YR: (x0,x1) => { x0.controls = x1 },
      YS: x0 => x0.paused,
      YT: x0 => x0.value,
      Z: x0 => x0.ignoreCase,
      ZB: (o, p) => o[p],
      ZC: x0 => x0.debugShowSemanticsNodes,
      ZD: x0 => x0.changedTouches,
      ZE: () => globalThis.window.FinalizationRegistry,
      ZF: x0 => x0.width,
      ZG: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      ZH: (x0,x1) => x0.getElementsByClassName(x1),
      ZI: (x0,x1) => x0.createElement(x1),
      ZJ: () => new AbortController(),
      ZK: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_blob(x1,x2,x3,x4),
      ZL: x0 => x0.byteLength,
      ZM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      ZN: (x0,x1) => x0.delete(x1),
      ZO: x0 => x0.play(),
      ZP: (x0,x1) => ({formats: x0,tryHarder: x1}),
      ZQ: x0 => x0.body,
      ZR: (x0,x1) => { x0.pointerEvents = x1 },
      ZS: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      ZT: x0 => x0.done,
      a: x0 => x0.multiline,
      aB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      aC: (x0,x1) => x0.warn(x1),
      aD: x0 => x0.offsetY,
      aE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      aF: x0 => x0.clientHeight,
      aG: (x0,x1) => x0.fetch(x1),
      aH: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      aI: (x0,x1) => { x0.pointerEvents = x1 },
      aJ: () => ({}),
      aK: (x0,x1) => x0.dart_sqlite3_malloc(x1),
      aL: x0 => x0.synchronizationBuffer,
      aM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      aN: (x0,x1) => x0.put(x1),
      aO: (x0,x1) => { x0.srcObject = x1 },
      aP: (x0,x1) => globalThis.ZXingWASM.readBarcodes(x0,x1),
      aQ: x0 => x0.headers,
      aR: (x0,x1) => { x0.transformOrigin = x1 },
      aS: (x0,x1,x2) => x0.readBarcodes(x1,x2),
      aT: x0 => x0.read(),
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
      bG: x0 => x0.fontFallbackBaseUrl,
      bH: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      bI: (x0,x1) => { x0.height = x1 },
      bJ: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      bK: (x0,x1,x2,x3,x4) => x0.dart_sqlite3_bind_text(x1,x2,x3,x4),
      bL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      bM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      bN: (x0,x1,x2) => x0.postMessage(x1,x2),
      bO: (x0,x1) => { x0.objectFit = x1 },
      bP: () => new ZXing.MultiFormatReader(),
      bQ: x0 => x0.signal,
      bR: x0 => x0.getSupportedConstraints(),
      bS: x0 => x0.text,
      bT: x0 => x0.body,
      c: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      cB: o => o.byteOffset,
      cC: () => globalThis.window,
      cD: x0 => x0.type,
      cE: (x0,x1) => x0.unregister(x1),
      cF: (x0,x1) => { x0.content = x1 },
      cG: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      cH: (x0,x1) => x0.dispatchEvent(x1),
      cI: (x0,x1) => { x0.width = x1 },
      cJ: (x0,x1,x2,x3) => x0.request(x1,x2,x3),
      cK: (x0,x1,x2,x3) => x0.sqlite3_bind_double(x1,x2,x3),
      cL: (x0,x1,x2) => x0.postMessage(x1,x2),
      cM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      cN: x0 => x0.randomUUID(),
      cO: (x0,x1) => { x0.height = x1 },
      cP: x0 => new ZXing.HTMLCanvasElementLuminanceSource(x0),
      cQ: (x0,x1) => x0.transferFromImageBitmap(x1),
      cR: x0 => ({ideal: x0}),
      cS: x0 => x0.format,
      cT: (x0,x1) => new OffscreenCanvas(x0,x1),
      d: (x0,x1) => x0.didCreateEngineInitializer(x1),
      dB: o => o.buffer,
      dC: (o, c) => o instanceof c,
      dD: x0 => x0.maxTouchPoints,
      dE: (x0,x1) => x0.contains(x1),
      dF: (x0,x1) => { x0.name = x1 },
      dG: x0 => x0.history,
      dH: (x0,x1) => x0.createEvent(x1),
      dI: x0 => x0.style,
      dJ: x0 => x0.name,
      dK: (x0,x1,x2,x3) => x0.sqlite3_bind_int64(x1,x2,x3),
      dL: x0 => new SharedArrayBuffer(x0),
      dM: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      dN: () => globalThis.crypto,
      dO: (x0,x1) => { x0.width = x1 },
      dP: x0 => new ZXing.HybridBinarizer(x0),
      dQ: (x0,x1) => x0.getContext(x1),
      dR: (x0,x1,x2) => ({width: x0,height: x1,deviceId: x2}),
      dS: x0 => x0.bytes,
      dT: x0 => x0.assetBase,
      e: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eB: Function.prototype.call.bind(DataView.prototype.getUint8),
      eC: (x0,x1) => x0[x1],
      eD: x0 => x0.platform,
      eE: (s) => +s,
      eF: x0 => x0.head,
      eG: x0 => x0.search,
      eH: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      eI: (x0,x1) => { x0.src = x1 },
      eJ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      eK: x0 => globalThis.BigInt(x0),
      eL: (x0,x1,x2,x3) => ({clientVersion: x0,root: x1,synchronizationBuffer: x2,communicationBuffer: x3}),
      eM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      eN: x0 => x0.port2,
      eO: x0 => x0.style,
      eP: x0 => new ZXing.BinaryBitmap(x0),
      eQ: (x0,x1) => { x0.height = x1 },
      eR: (x0,x1) => ({width: x0,height: x1}),
      eS: x0 => x0.y,
      eT: x0 => x0.loader,
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
      fG: x0 => x0.location,
      fH: x0 => x0.readText(),
      fI: () => globalThis.document,
      fJ: (o, p, v) => o[p] = v,
      fK: (x0,x1,x2) => x0.sqlite3_bind_null(x1,x2),
      fL: x0 => x0.close(),
      fM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      fN: x0 => x0.terminate(),
      fO: (x0,x1) => { x0.muted = x1 },
      fP: (x0,x1) => x0.decode(x1),
      fQ: (x0,x1) => { x0.width = x1 },
      fR: (x0,x1,x2) => ({width: x0,height: x1,facingMode: x2}),
      fS: x0 => x0.x,
      fT: () => globalThis._flutter,
      g: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      gB: (b, o, l) => new DataView(b, o, l),
      gC: (string, token) => string.split(token),
      gD: () => globalThis.document,
      gE: s => s.trim(),
      gF: x0 => x0.firstChild,
      gG: x0 => x0.pathname,
      gH: x0 => x0.clipboard,
      gI: x0 => x0.src,
      gJ: (o,s,v) => o[s] = v,
      gK: (x0,x1) => x0.sqlite3_bind_parameter_count(x1),
      gL: x0 => x0.getSize(),
      gM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      gN: (x0,x1) => new SharedWorker(x0,x1),
      gO: (x0,x1) => { x0.autoplay = x1 },
      gP: x0 => x0.text,
      gQ: x0 => x0.height,
      gR: x0 => x0.deviceId,
      gS: x0 => x0.bottomLeft,
      h: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      hC: o => o instanceof Array,
      hD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      hE: x0 => x0.classList,
      hF: x0 => x0.viewConstraints,
      hG: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      hH: (x0,x1) => x0.writeText(x1),
      hI: (x0,x1) => x0.revokeObjectURL(x1),
      hJ: () => Symbol("jsBoxedDartObjectProperty"),
      hK: (x0,x1) => x0.dart_sqlite3_free(x1),
      hL: (x0,x1) => x0.truncate(x1),
      hM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3) { return wasmFunction(f,arguments.length,x0,x1,x2,x3) }),
      hN: x0 => x0.start(),
      hO: x0 => x0.getTracks(),
      hP: x0 => x0.text,
      hQ: x0 => x0.width,
      hR: x0 => x0.getCapabilities(),
      hS: x0 => x0.bottomRight,
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
      iG: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      iH: x0 => x0.unlock(),
      iI: (x0,x1) => { x0.src = x1 },
      iJ: (x0,x1) => x0.call(x1),
      iK: (x0,x1,x2,x3,x4,x5,x6) => x0.sqlite3_prepare_v3(x1,x2,x3,x4,x5,x6),
      iL: x0 => ({at: x0}),
      iM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      iN: x0 => x0.port,
      iO: x0 => x0.stop(),
      iP: x0 => x0.isValid,
      iQ: x0 => x0.rasterEndMilliseconds,
      iR: () => ({}),
      iS: x0 => x0.topRight,
      j: (x0,x1,x2) => x0.call(x1,x2),
      jB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      jC: a => a.length,
      jD: x0 => x0.relatedTarget,
      jE: x0 => x0.parent,
      jF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jG: o => Object.keys(o),
      jH: (x0,x1) => x0.lock(x1),
      jI: (x0,x1,x2,x3,x4) => globalThis.createImageBitmap(x0,x1,x2,x3,x4),
      jJ: x0 => x0.abort(),
      jK: (x0,x1,x2) => x0.sqlite3_column_name(x1,x2),
      jL: (x0,x1) => x0.write(x1),
      jM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      jN: (x0,x1) => new WebSocket(x0,x1),
      jO: x0 => x0.mediaDevices,
      jP: x0 => x0.rawValue,
      jQ: x0 => x0.rasterStartMilliseconds,
      jR: (x0,x1) => x0.applyConstraints(x1),
      jS: x0 => x0.topLeft,
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
      kG: x0 => x0.state,
      kH: x0 => x0.orientation,
      kI: x0 => x0.naturalHeight,
      kJ: x0 => x0.locks,
      kK: (x0,x1,x2) => x0.sqlite3_column_blob(x1,x2),
      kL: (x0,x1,x2) => x0.write(x1,x2),
      kM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2,x3,x4) { return wasmFunction(f,arguments.length,x0,x1,x2,x3,x4) }),
      kN: x0 => x0.reason,
      kO: x0 => ({video: x0}),
      kP: (x0,x1) => { x0.fillStyle = x1 },
      kQ: x0 => x0.imageBitmaps,
      kR: (x0,x1) => { x0.whiteBalanceMode = x1 },
      kS: x0 => x0.position,
      l: x0 => new Array(x0),
      lB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      lC: x0 => x0.userAgent,
      lD: (decoder, codeUnits) => decoder.decode(codeUnits),
      lE: (x0,x1) => x0.hasAttribute(x1),
      lF: () => typeof dartUseDateNowForTicks !== "undefined",
      lG: x0 => x0.hash,
      lH: (x0,x1) => x0.querySelector(x1),
      lI: x0 => x0.naturalWidth,
      lJ: () => globalThis.navigator,
      lK: (x0,x1,x2) => x0.sqlite3_column_bytes(x1,x2),
      lL: x0 => x0.createSyncAccessHandle(),
      lM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      lN: x0 => x0.code,
      lO: (x0,x1) => x0.getContext(x1),
      lP: () => globalThis.BarcodeDetector.getSupportedFormats(),
      lQ: x0 => x0.canvasKitMaximumSurfaces,
      lR: x0 => x0.whiteBalanceMode,
      lS: x0 => x0.isValid,
      m: o => [o],
      mB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      mC: x0 => x0.navigator,
      mD: () => new TextDecoder("utf-8", {fatal: true}),
      mE: x0 => x0.buttons,
      mF: () => Date.now(),
      mG: x0 => x0.state,
      mH: (x0,x1) => { x0.title = x1 },
      mI: x0 => x0.decode(),
      mJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      mK: (x0,x1,x2) => x0.sqlite3_column_text(x1,x2),
      mL: x0 => ({create: x0}),
      mM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      mN: (x0,x1,x2) => x0.close(x1,x2),
      mO: (x0,x1,x2,x3,x4,x5) => x0.drawImage(x1,x2,x3,x4,x5),
      mP: (x0,x1,x2) => x0.open(x1,x2),
      mQ: x0 => x0.nextSibling,
      mR: (x0,x1) => { x0.exposureMode = x1 },
      mS: (x0,x1,x2,x3) => ({formats: x0,tryHarder: x1,tryRotate: x2,tryInvert: x3}),
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
      nG: (x0,x1) => x0.go(x1),
      nH: (x0,x1) => x0.vibrate(x1),
      nI: (x0,x1) => { x0.decoding = x1 },
      nJ: (x0,x1) => x0.postMessage(x1),
      nK: (x0,x1,x2) => x0.sqlite3_column_double(x1,x2),
      nL: (x0,x1,x2) => x0.getFileHandle(x1,x2),
      nM: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      nN: (x0,x1) => x0.close(x1),
      nO: (x0,x1,x2) => x0.toDataURL(x1,x2),
      nP: () => globalThis.sgPrint.print(),
      nQ: (x0,x1) => x0.debug(x1),
      nR: x0 => x0.exposureMode,
      nS: (x0,x1,x2) => ({tryHarder: x0,tryRotate: x1,tryInvert: x2}),
      o: (o0, o1, o2) => [o0, o1, o2],
      oB: Function.prototype.call.bind(DataView.prototype.getUint32),
      oC: Object.is,
      oD: (a, i, v) => a[i] = v,
      oE: x0 => x0.y,
      oF: (x0,x1) => x0.requestAnimationFrame(x1),
      oG: x0 => x0.parentElement,
      oH: x0 => x0.content,
      oI: (x0,x1) => { x0.crossOrigin = x1 },
      oJ: x0 => x0.close(),
      oK: x0 => globalThis.Number(x0),
      oL: x0 => ({create: x0}),
      oM: (x0,x1) => x0.getBigInt64(x1),
      oN: x0 => x0.close(),
      oO: x0 => x0.height,
      oP: () => globalThis.sgPrint,
      oQ: x0 => x0.hostElement,
      oR: (x0,x1) => { x0.focusMode = x1 },
      oS: () => globalThis.ZXingWASM,
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
      pG: (x0,x1) => x0.querySelectorAll(x1),
      pH: x0 => x0.document,
      pI: (x0,x1) => x0.createObjectURL(x1),
      pJ: (x0,x1) => ({i: x0,p: x1}),
      pK: (x0,x1,x2) => x0.sqlite3_column_int64(x1,x2),
      pL: (x0,x1,x2) => x0.getDirectoryHandle(x1,x2),
      pM: (x0,x1) => x0.getInt32(x1),
      pN: (x0,x1) => x0.send(x1),
      pO: x0 => x0.width,
      pP: x0 => ({type: x0}),
      pQ: x0 => x0.location,
      pR: x0 => x0.focusMode,
      pS: x0 => ({willReadFrequently: x0}),
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
      qH: (handle) => clearInterval(handle),
      qI: x0 => x0.URL,
      qJ: () => new Array(),
      qK: (x0,x1,x2) => x0.sqlite3_column_type(x1,x2),
      qL: (x0,x1) => new URL(x0,x1),
      qM: (x0,x1) => x0.read(x1),
      qN: x0 => x0.readyState,
      qO: (x0,x1) => { x0.height = x1 },
      qP: (x0,x1) => new Blob(x0,x1),
      qQ: (x0,x1) => x0.getModifierState(x1),
      qR: x0 => x0.enumerateDevices(),
      qS: (x0,x1,x2) => x0.getContext(x1,x2),
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
      rH: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      rI: x0 => new Blob(x0),
      rJ: (x0,x1) => ({c: x0,r: x1}),
      rK: (x0,x1) => x0.sqlite3_column_count(x1),
      rL: x0 => x0.pathname,
      rM: (x0,x1,x2) => x0.read(x1,x2),
      rN: (x0,x1) => { x0.binaryType = x1 },
      rO: (x0,x1) => { x0.width = x1 },
      rP: x0 => globalThis.URL.createObjectURL(x0),
      rQ: x0 => x0.metaKey,
      rR: x0 => x0.deviceId,
      rS: () => new BarcodeDetector(),
      s: () => globalThis,
      sB: o => o instanceof Uint16Array,
      sC: (x0,x1) => { x0.nonce = x1 },
      sD: x0 => x0.visibilityState,
      sE: x0 => x0.scrollLeft,
      sF: x0 => new Uint8Array(x0),
      sG: x0 => x0.data,
      sH: () => Date.now(),
      sI: x0 => x0.close(),
      sJ: (x0,x1) => { x0.onmessage = x1 },
      sK: (x0,x1) => x0.sqlite3_stmt_isexplain(x1),
      sL: x0 => x0.getDirectory(),
      sM: x0 => x0.flush(),
      sN: (a, l) => a.length = l,
      sO: x0 => x0.videoHeight,
      sP: (x0,x1) => globalThis.sgPrint.prepare(x0,x1),
      sQ: x0 => x0.altKey,
      sR: x0 => x0.kind,
      sS: x0 => ({formats: x0}),
      t: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tB: Function.prototype.call.bind(DataView.prototype.getUint16),
      tC: x0 => x0.nonce,
      tD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      tE: x0 => x0.offsetLeft,
      tF: (x0,x1,x2) => x0.slice(x1,x2),
      tG: (x0,x1) => { x0.scrollTop = x1 },
      tH: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      tI: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      tJ: (o, a) => o == a,
      tK: (x0,x1) => x0.sqlite3_last_insert_rowid(x1),
      tL: x0 => x0.storage,
      tM: () => globalThis.WebAssembly,
      tN: x0 => globalThis.sgVision.fingerprint(x0),
      tO: x0 => x0.videoWidth,
      tP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tQ: x0 => x0.ctrlKey,
      tR: x0 => x0.facingMode,
      tS: x0 => new BarcodeDetector(x0),
      u: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uB: o => o instanceof Int16Array,
      uC: () => globalThis.window.flutterConfiguration,
      uD: x0 => x0.disconnect(),
      uE: x0 => x0.offsetParent,
      uF: (x0,x1) => x0.decode(x1),
      uG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      uH: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      uI: (x0,x1) => x0.decode(x1),
      uJ: (o, t) => typeof o === t,
      uK: (x0,x1,x2,x3,x4,x5) => x0.sqlite3_exec(x1,x2,x3,x4,x5),
      uL: () => globalThis.navigator,
      uM: x0 => x0.href,
      uN: x0 => x0.colour,
      uO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uQ: x0 => x0.isComposing,
      uR: x0 => x0.mediaDevices,
      uS: (x0,x1) => x0.detect(x1),
      v: (x0,x1) => ({addView: x0,removeView: x1}),
      vB: Function.prototype.call.bind(DataView.prototype.getInt16),
      vC: (x0,x1) => x0.attachShadow(x1),
      vD: x0 => new Intl.Locale(x0),
      vE: (o, p, r) => o.replace(p, () => r),
      vF: (x0,x1) => x0.adoptText(x1),
      vG: (x0,x1) => { x0.value = x1 },
      vH: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      vI: x0 => x0.displayHeight,
      vJ: x0 => x0.r,
      vK: (x0,x1) => x0.sqlite3_changes(x1),
      vL: (x0,x1) => globalThis.fetch(x0,x1),
      vM: (x0,x1) => x0.openCursor(x1),
      vN: x0 => x0.embeddings,
      vO: (x0,x1,x2) => x0.addEventListener(x1,x2),
      vP: () => globalThis.sgPrint.clear(),
      vQ: x0 => x0.code,
      vR: () => globalThis.BarcodeDetector.getSupportedFormats(),
      vS: x0 => x0.rawValue,
      w: (l, r) => l === r,
      wB: o => o instanceof Uint8ClampedArray,
      wC: (x0,x1) => x0.createElement(x1),
      wD: x0 => x0.region,
      wE: (o, p, r) => o.replaceAll(p, () => r),
      wF: x0 => x0.first(),
      wG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      wH: o => o.byteLength,
      wI: x0 => x0.displayWidth,
      wJ: x0 => x0.c,
      wK: (x0,x1,x2,x3,x4,x5,x6) => x0.dart_sqlite3_create_function_v2(x1,x2,x3,x4,x5,x6),
      wL: (x0,x1) => x0.sqlite3session_delete(x1),
      wM: x0 => x0.arrayBuffer(),
      wN: () => globalThis.sgVision.load(),
      wO: x0 => x0.hidden,
      wP: x0 => globalThis.URL.revokeObjectURL(x0),
      wQ: x0 => x0.repeat,
      wR: x0 => x0.reset,
      wS: x0 => x0.format,
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
      xH: (x0,x1,x2) => x0.insertBefore(x1,x2),
      xI: x0 => x0.duration,
      xJ: x0 => x0.p,
      xK: (x0,x1,x2,x3) => x0.sqlite3_result_error(x1,x2,x3),
      xL: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      xM: () => globalThis.Blob,
      xN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      xO: x0 => x0.decode(),
      xP: x0 => x0.maxTouchPoints,
      xQ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      xR: x0 => x0.stopContinuousDecode,
      xS: x0 => x0.y,
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
      yH: x0 => x0.id,
      yI: x0 => x0.image,
      yJ: x0 => x0.i,
      yK: (x0,x1,x2) => x0.sqlite3_result_subtype(x1,x2),
      yL: (x0,x1) => x0.unregister(x1),
      yM: x0 => x0.value,
      yN: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      yO: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      yP: x0 => x0.userAgent,
      yQ: (x0,x1) => x0.key(x1),
      yR: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      yS: x0 => x0.x,
      z: (x0,x1) => x0.prepend(x1),
      zB: Function.prototype.call.bind(DataView.prototype.setUint32),
      zC: x0 => x0.devicePixelRatio,
      zD: x0 => x0.languages,
      zE: x0 => x0.deltaX,
      zF: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      zG: x0 => x0.value,
      zH: x0 => x0.offsetHeight,
      zI: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      zJ: x0 => x0.port1,
      zK: (x0,x1,x2,x3,x4) => x0.sqlite3_result_blob64(x1,x2,x3,x4),
      zL: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      zM: x0 => x0.key,
      zN: (x0,x1) => x0.appendChild(x1),
      zO: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      zP: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      zQ: x0 => x0.length,
      zR: (x0,x1,x2,x3) => x0.call(x1,x2,x3),
      zS: x0 => x0.cornerPoints,

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
