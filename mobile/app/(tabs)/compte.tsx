import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, sans, Screen, serif } from "@/components/ui";
import { useStore } from "@/lib/store";

const links = [
  ["/espace/profil", "Profil"],
  ["/espace/commandes", "Commandes"],
  ["/espace/devis", "Devis"],
  ["/espace/adresses", "Adresses"],
  ["/espace/historique", "Historique"],
] as const;

export default function Compte() {
  const insets = useSafeAreaInsets();
  const { profile, orders, quotes, favorites } = useStore();
  return (
    <Screen>
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 22, gap: 8 }}>
        <Text style={{ fontFamily: sans, letterSpacing: 2, textTransform: "uppercase", color: colors.wood, fontSize: 11 }}>Espace client</Text>
        <Text style={{ fontFamily: serif, fontSize: 46 }}>Bonjour {profile.firstName || "vous"}.</Text>
        <Text style={{ fontFamily: "Outfit_300Light", fontSize: 16, color: "rgba(23,23,23,0.7)", marginBottom: 12 }}>
          {orders.length} commandes · {quotes.length} devis · {favorites.length} favoris
        </Text>
        {links.map(([href, label]) => (
          <Link key={href} href={href} asChild>
            <Pressable style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.sand }}>
              <Text style={{ fontFamily: serif, fontSize: 28 }}>{label}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </Screen>
  );
}
