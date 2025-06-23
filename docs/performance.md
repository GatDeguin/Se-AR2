# MediaPipe Acceleration Benchmarks

To evaluate the impact of GPU acceleration on low-end mobile hardware, the `useCpuInference` flag was toggled when initializing the MediaPipe Hands and FaceMesh solutions. When disabled, the solutions run with WebGL acceleration; when enabled they fall back to pure WASM.

Testing on a Pixel 7 (Chrome 125) with a 720p camera feed shows WebGL processing averages around **27 FPS**, compared to **15 FPS** when forced to CPU inference. Enabling SIMD (`hands_solution_simd_wasm_bin.wasm`) further improves the CPU path to **19 FPS**.

Use `?cpu=1` in the page URL to enable the CPU-only mode.

## Results on other devices

The table below shows additional benchmarks using the same demo at 720p unless
otherwise noted.

| Device / Browser | WebGL | CPU | CPU + SIMD |
| ---------------- | ----- | --- | ---------- |
| Pixel 4a (Chrome 125) | ~21 FPS | ~12 FPS | ~16 FPS |
| iPhone 12 (Safari 17) | ~30 FPS | ~18 FPS | ~22 FPS |
| MacBook Air M1 (Chrome 125, 1080p) | ~60 FPS | ~50 FPS | N/A |

### Configuration hints

- Prefer GPU acceleration (default) whenever available for higher frame rates.
- Use `?cpu=1` or pass `useCpuInference: true` to `initTracker()` if WebGL fails
  or when testing CPU performance specifically.
- Deploy the SIMD versions of the WASM modules to speed up CPU inference by
  roughly 20%.
- Reducing the input resolution to 480p or 360p can further improve
  responsiveness on slower hardware.
