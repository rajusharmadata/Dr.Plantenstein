import { Stack } from "expo-router";
import "../src/i18n";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="analyzing" options={{ presentation: "modal" }} />
      <Stack.Screen name="results" />
    </Stack>
  );
}
