# Sketchbook Data Sharing Technology

## Overview

The Sketchbook app uses a URL-based data sharing technique that encodes entire drawings into query parameters. This enables sharing drawings via QR codes or links without requiring a backend server or database.

## How It Works

### Encoding Pipeline

1. **Point Sampling** (app/sketchbook/utils.ts:36-46)
   - Reduces stroke density by taking every 3rd point
   - Preserves first and last points of each stroke
   - Reduces data size by ~67% with minimal visual quality loss

2. **Delta Encoding** (app/sketchbook/utils.ts:4-17)
   - Stores first point as absolute coordinates
   - Subsequent points stored as deltas (dx, dy) from previous point
   - Exploits spatial coherence in drawing strokes
   - Reduces magnitude of numbers for better compression

3. **Compression** (app/sketchbook/utils.ts:50)
   - Uses pako (zlib/DEFLATE) to compress JSON data
   - Achieves high compression ratios on repetitive coordinate patterns

4. **URL-Safe Encoding** (app/sketchbook/utils.ts:51-54)
   - Base64 encoding of compressed binary data
   - Replaces `+` with `-`, `/` with `_` (URL-safe)
   - Strips padding `=` characters

### Decoding Pipeline

1. **URL-Safe Decoding** (app/sketchbook/utils.ts:61-63)
   - Reverses URL-safe substitutions
   - Restores Base64 padding

2. **Decompression** (app/sketchbook/utils.ts:65-68)
   - Inflates compressed data using pako
   - Falls back to legacy uncompressed format for backward compatibility

3. **Delta Decoding** (app/sketchbook/utils.ts:19-34)
   - Reconstructs absolute coordinates from deltas
   - Accumulates dx/dy values to restore original stroke paths

4. **Rendering** (app/sketchbook/page.tsx:21-27)
   - Parsed from URL query parameter `?data=...`
   - Rendered to canvas on load

## Technical Limits

### QR Code Capacity (Primary Constraint)

**Hard Limit: 3,391 characters** (app/sketchbook/page.tsx:45)

- QR Code version 40 (177x177 modules) with alphanumeric mode
- Low error correction level (7% recovery)
- URL structure: `https://domain.com/sketchbook?data=<encoded>`
- Effective payload: ~3,300 characters after domain/path overhead

**Practical Drawing Capacity:**
- Simple sketch: 50-200 characters
- Moderate detail: 200-1,000 characters
- Complex drawing: 1,000-3,300 characters
- Very detailed: Exceeds QR limit, requires URL sharing only

### URL Length Limits (Secondary Constraint)

- **Browsers**: 2,048+ characters (Chrome/Firefox support 100k+)
- **Servers**: Varies (Apache default 8KB, Nginx 4-8KB)
- **CDNs/Proxies**: May have stricter limits (2KB-16KB)

For this app, QR capacity is the bottleneck.

### Compression Effectiveness

**Best Case** (repetitive patterns, straight lines):
- Compression ratio: 5:1 to 10:1
- ~15,000-30,000 points before hitting QR limit

**Worst Case** (chaotic, random strokes):
- Compression ratio: 2:1 to 3:1
- ~6,000-10,000 points before hitting QR limit

**Overhead:**
- JSON structure: `[[x,y,dx,dy,...],[...]]`
- Brackets, commas add ~10-20% overhead

### Performance Constraints

1. **Encoding Time**: O(n) where n = total points
   - Point sampling: ~0.1ms per 1000 points
   - Delta encoding: ~0.2ms per 1000 points
   - Compression: ~5-10ms per 1000 points (CPU-bound)

2. **QR Generation**: O(data²) complexity
   - Large payloads (>2KB): 50-200ms
   - Near limit (3KB): 200-500ms
   - May cause UI lag on slow devices

3. **Decoding Time**: Similar to encoding
   - Decompression: ~3-8ms per 1000 points
   - Negligible impact on UX

### Memory Constraints

- Each point: ~16 bytes (2 floats in-memory)
- 10,000 points: ~160KB in-memory
- Compressed: ~2-3KB in URL
- Canvas rendering: 600x700 = 420,000 pixels (~1.7MB RGBA)

### User Experience Limits

**Error Handling** (app/sketchbook/page.tsx:46-50):
```typescript
if (url.length > QR_CAPACITY) {
  setError(`Drawing is too detailed (${url.length} chars, max ${QR_CAPACITY})`);
}
```

**Typical User Journey:**
- Drawing 10-30 strokes: ✅ Works well
- Drawing 50-100 strokes: ⚠️ May approach limit with detailed strokes
- Drawing 200+ strokes: ❌ Likely exceeds QR capacity

## Advantages

1. **Zero Backend** - No server, database, or API required
2. **Privacy** - Drawing data never leaves client device
3. **Simplicity** - Standard web technologies (URL, Base64, compression)
4. **Portability** - QR codes work offline, cross-platform
5. **Cost** - Zero infrastructure or storage costs
6. **Instant** - No upload/download delays

## Disadvantages

1. **Size Limits** - Complex drawings cannot be shared via QR
2. **URL Pollution** - Long URLs in browser history/bookmarks
3. **No Versioning** - Cannot update shared drawings
4. **No Analytics** - Cannot track views/usage
5. **No Collaboration** - Single-direction sharing only
6. **QR Degradation** - Large QR codes harder to scan

## Potential Improvements

### Compression Optimizations

1. **Variable-Length Encoding** - Use fewer bytes for small deltas
2. **Stroke Simplification** - Douglas-Peucker algorithm (better than sampling)
3. **Quantization** - Reduce coordinate precision (0.5px increments)
4. **Dictionary Compression** - Deduplicate common stroke patterns

### Fallback Strategies

1. **Hybrid Mode** - QR for small drawings, URL-only for large
2. **Progressive QR** - Multiple QR codes for very large drawings
3. **Backend Fallback** - Upload to temporary storage if too large
4. **Lossy Compression** - Optional quality reduction slider

### Alternative Encoding

1. **Binary Format** - Skip JSON, use typed arrays
2. **SVG Path** - Use SVG path commands (more compact for curves)
3. **Protobuf** - Binary protocol buffers instead of JSON

## Real-World Analogues

- **Tiny URL shorteners** - But without server round-trip
- **Data URIs** - Similar concept for images (RFC 2397)
- **Bitcoin paper wallets** - QR codes encoding private keys
- **WiFi QR codes** - Encoding network credentials

## Conclusion

URL-based data sharing is elegant for lightweight, ephemeral content. The 3,391-character QR limit constrains drawing complexity, but for casual sketches (the app's primary use case), the technique works remarkably well. The zero-backend architecture prioritizes privacy and simplicity over features like persistence and collaboration.
