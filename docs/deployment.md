# Deploying SeñAR to Mobile Stores

This project can be packaged and submitted to major app stores using **PWABuilder**.

1. Navigate to <https://www.pwabuilder.com/> and enter the URL where the PWA is hosted.
2. Verify the manifest and service worker pass all tests. Adjust `manifest.json` and `sw.js` if needed.
   Provide 192x192 and 512x512 icons referenced by the manifest; these are not stored in this repository.
3. Generate the **Android** package and download the resulting `.aab` file.
4. Sign the bundle using your keystore and upload it through the **Google Play Console**.
5. For **iOS**, use the provided instructions to create an App Store package. PWABuilder wraps the PWA using a WebView so it can be submitted through **App Store Connect**.
6. After publishing, users will receive updates automatically thanks to the service worker.

See the main [README](../README.md#deployment) for generic hosting notes.
