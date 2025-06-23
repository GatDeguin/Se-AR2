# Deploying SeñAR to Mobile Stores

This project can be packaged and submitted to major app stores using **PWABuilder**.

1. Navigate to <https://www.pwabuilder.com/> and enter the URL where the PWA is hosted.
2. Verify the manifest and service worker pass all tests. Adjust `manifest.json` and `sw.js` if needed. Provide **192x192** and **512x512** icons referenced by the manifest; these icons are not stored in this repository.
3. Generate the **Android** package and download the `.aab` bundle.
   - Test the bundle locally with [`bundletool`](https://developer.android.com/studio/command-line/bundletool) or an emulator.
   - Sign it with your release keystore: `jarsigner -keystore mykey.jks app-release.aab alias`.
   - Verify the signature using `jarsigner -verify app-release.aab`.
   - Upload the signed bundle through the **Google Play Console** and complete the store listing (screenshots, privacy policy, content rating).
   - Review Google's [launch checklist](https://developer.android.com/console/about/guides/releasewithconfidence) to ensure the app meets Play Store requirements.
4. For **iOS**, follow PWABuilder's instructions to produce an Xcode project.
   - Open the project in Xcode, set your bundle identifier and select a distribution certificate with a provisioning profile.
   - Build and archive the app, testing with **TestFlight** when possible.
   - Submit the archive through **App Store Connect** and provide the required metadata.
   - Apple's [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) list all submission requirements.
5. After publishing, updates are delivered automatically thanks to the service worker.

See the main [README](../README.md#deployment) for generic hosting notes.
