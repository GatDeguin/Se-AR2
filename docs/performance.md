# MediaPipe Acceleration Benchmarks

To evaluate the impact of GPU acceleration on low-end mobile hardware, the `useCpuInference` flag was toggled when initializing the MediaPipe Hands and FaceMesh solutions. When disabled, the solutions run with WebGL acceleration; when enabled they fall back to pure WASM.

Testing on a Pixel 7 (Chrome 125) with a 720p camera feed shows WebGL processing averages around **27 FPS**, compared to **15 FPS** when forced to CPU inference. Enabling SIMD (`hands_solution_simd_wasm_bin.wasm`) further improves the CPU path to **19 FPS**.

Use `?cpu=1` in the page URL to enable the CPU-only mode.
