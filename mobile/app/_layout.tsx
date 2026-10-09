import { useFonts, CormorantGaramond_500Medium, CormorantGaramond_600SemiBold } from "@expo-google-fonts/cormorant-garamond";
import { Outfit_300Light, Outfit_400Regular, Outfit_500Medium } from "@expo-google-fonts/outfit";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "@/components/ui";
import { useStore, StoreProvider } from "@/lib/store";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ivory } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="produit/[slug]" />
          <Stack.Screen name="devis" />
          <Stack.Screen name="commander" />
          <Stack.Screen name="espace/[section]" />
        </Stack>
        <Toast />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

function Toast() {
  const { notice } = useStore();
  if (!notice) return null;
  return (
    <View style={{ position: "absolute", left: 24, right: 24, bottom: 96, backgroundColor: colors.ink, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 18 }}>
      <Text style={{ color: colors.ivory, textAlign: "center", fontFamily: "Outfit_400Regular" }}>{notice}</Text>
    </View>
  );
}
