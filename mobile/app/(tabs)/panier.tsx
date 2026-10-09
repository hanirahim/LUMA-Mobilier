import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, colors, sans, Screen, serif } from "@/components/ui";
import { euro } from "@/lib/format";
import { purchaseShipping } from "@/lib/pricing";
import { useStore } from "@/lib/store";

export default function Panier() {
  const insets = useSafeAreaInsets();
  const { cart, products, updateCart, removeFromCart } = useStore();
  const lines = cart
    .filter((line) => line.mode === "achat")
    .map((line) => ({ line, product: products.find((item) => item.id === line.productId) }))
    .filter((entry) => entry.product);
  const purchase = lines.reduce((sum, entry) => sum + entry.product!.price * entry.line.quantity, 0);
  const shipping = lines.length ? purchaseShipping(purchase) : 0;

  return (
    <Screen>
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 22, gap: 18 }}>
        <Text style={{ fontFamily: serif, fontSize: 46 }}>Panier</Text>
        {lines.length === 0 ? (
          <View style={{ gap: 12 }}>
            <Text style={{ fontFamily: serif, fontSize: 32 }}>Votre panier est encore léger.</Text>
            <Text style={{ fontFamily: "Outfit_300Light", fontSize: 16, color: "rgba(23,23,23,0.7)" }}>Découvrez l'univers LUMA.</Text>
            <Button label="Voir le catalogue" href="/catalogue" />
          </View>
        ) : (
          <>
            {lines.map(({ line, product }) => {
              const amount = product!.price * line.quantity;
              return (
                <View key={line.lineId} style={{ flexDirection: "row", gap: 12, borderBottomWidth: 1, borderBottomColor: colors.sand, paddingBottom: 16 }}>
                  <Image source={{ uri: product!.images[0] }} style={{ width: 92, height: 112, borderRadius: 16, backgroundColor: colors.sand }} contentFit="cover" />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ fontFamily: serif, fontSize: 26 }}>{product!.name}</Text>
                    <Text style={{ fontFamily: sans, color: "rgba(23,23,23,0.6)" }}>{line.color}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6 }}>
                      <Pressable onPress={() => updateCart(line.lineId, line.quantity - 1)}><Text style={{ fontSize: 20 }}>–</Text></Pressable>
                      <Text style={{ fontFamily: sans }}>{line.quantity}</Text>
                      <Pressable onPress={() => updateCart(line.lineId, line.quantity + 1)}><Text style={{ fontSize: 20 }}>+</Text></Pressable>
                      <Pressable onPress={() => removeFromCart(line.lineId)}><Text style={{ fontFamily: sans, color: "rgba(23,23,23,0.5)" }}>Retirer</Text></Pressable>
                    </View>
                    <Text style={{ fontFamily: sans }}>{euro(amount)}</Text>
                  </View>
                </View>
              );
            })}
            <View style={{ backgroundColor: "rgba(231,222,209,0.45)", borderRadius: 22, padding: 18, gap: 8 }}>
              <Row label="Sous-total" value={euro(purchase)} />
              <Row label="Livraison" value={shipping === 0 ? "Offerte" : euro(shipping)} />
              <Row label="Total" value={euro(purchase + shipping)} />
              <Button label="Passer commande" href="/commander" />
              <Button label="Vous préférez un devis ?" href="/devis" variant="quiet" />
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ fontFamily: sans }}>{label}</Text>
      <Text style={{ fontFamily: sans }}>{value}</Text>
    </View>
  );
}
