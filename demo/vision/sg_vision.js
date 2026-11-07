// Loaded only when photo search is first used.
let loading;
let embedder;
const asset = (path) => new URL(`vision/${path}`, document.baseURI).href;

async function load() {
  if (loading) return loading;
  loading = (async () => {
    const canvas = document.createElement('canvas');
    if (!canvas.getContext('webgl2') && !canvas.getContext('webgl')) {
      throw 'no-webgl';
    }
    try {
      const vision = await import(asset('vision_bundle.mjs'));
      const files = await vision.FilesetResolver.forVisionTasks(asset('wasm'));
      embedder = await vision.ImageEmbedder.createFromOptions(files, {
        baseOptions: {modelAssetPath: asset('mobilenet_v3_large.tflite'), delegate: 'CPU'},
        quantize: true,
        l2Normalize: true,
      });
    } catch (error) {
      throw `load-failed:${error.message || error}`;
    }
  })();
  try {
    await loading;
  } catch (error) {
    loading = undefined;
    throw error;
  }
}

async function decode(bytes) {
  const blob = new Blob([bytes]);
  if (window.createImageBitmap) {
    try {
      return await createImageBitmap(blob, {imageOrientation: 'from-image'});
    } catch (_) {
      // Some browsers cannot decode a particular format with createImageBitmap.
    }
  }
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function draw(image, x, y, width, height, maxSide) {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  canvas.getContext('2d').drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function colourSignature(image, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const context = canvas.getContext('2d');
  context.drawImage(image, width * 0.2, height * 0.2, width * 0.6, height * 0.6, 0, 0, 64, 64);
  const pixels = context.getImageData(0, 0, 64, 64).data;
  const bins = new Uint32Array(28);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i] / 255, g = pixels[i + 1] / 255, b = pixels[i + 2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
    const saturation = max === 0 ? 0 : delta / max;
    let bin;
    if (saturation >= 0.25 && max >= 0.2) {
      let hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
      hue = (hue + 6) % 6;
      bin = Math.floor(hue * 2) * 2 + (max >= 0.6 ? 1 : 0);
    } else {
      bin = 24 + Math.min(3, Math.floor(max * 4));
    }
    bins[bin]++;
  }
  return Uint8Array.from(bins, (count) => Math.round(count * 255 / (64 * 64)));
}

async function fingerprint(bytes) {
  await load();
  const image = await decode(bytes);
  try {
    const width = image.width, height = image.height;
    const short = Math.min(width, height);
    const views = [[0, 0, width, height]];
    for (const fraction of [0.75, 0.5]) {
      const side = short * fraction;
      views.push([(width - side) / 2, (height - side) / 2, side, side]);
    }
    const embeddings = new Uint8Array(views.length * 1280);
    views.forEach((view, index) => {
      const result = embedder.embed(draw(image, ...view, 448));
      embeddings.set(result.embeddings[0].quantizedEmbedding, index * 1280);
    });
    return {embeddings, colour: colourSignature(image, width, height), width, height};
  } finally {
    if (image.close) image.close();
  }
}

window.sgVision = {load, fingerprint, modelId: 'mnv3l-q1'};
