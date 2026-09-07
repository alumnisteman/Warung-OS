import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "id.warungos.app",
  appName: "WarungOS",
  webDir: "artifacts/warung-os/dist/public",
  android: {
    backgroundColor: "#f7f5ef",
  },
};

export default config;
