# Build WarungOS APK

## Prasyarat
- Node.js LTS
- pnpm
- Android Studio + Android SDK
- JDK 17+

## Build

```bash
pnpm install
pnpm --filter @workspace/warung-os build
pnpm exec cap add android
pnpm exec cap sync android
pnpm exec cap open android
```

Di Android Studio pilih **Build > Generate App Bundles or APKs > Generate APKs**.

Untuk backend online:

```bash
VITE_API_URL=https://api.example.com pnpm --filter @workspace/warung-os build
pnpm exec cap sync android
```

APK debug biasanya berada di:

```text
android/app/build/outputs/apk/debug/
```

APK adalah client Android; Express API dan PostgreSQL tetap harus dideploy untuk data online/multi-perangkat.
