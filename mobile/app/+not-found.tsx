import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";
import { colors, serif } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "LUMA" }} />
      <View style={{ flex: 1, backgroundColor: colors.ivory, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ fontFamily: serif, fontSize: 40, textAlign: "center" }}>Cette page s'est égarée.</Text>
        <Link href="/" style={{ marginTop: 16, color: colors.ink }}>
          Retour à l'accueil
        </Link>
      </View>
    </>
  );
}
