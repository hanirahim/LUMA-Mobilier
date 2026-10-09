import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, colors, sans, serif } from "@/components/ui";
import { availabilityLabel, categoryLabel, euro } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products, reviews, addToCart, favorites, toggleFavorite } = useStore();
  const product = products.find((item) => item.slug === slug);
  const [image, setImage] = useState(0);
  const [color, setColor] = useState(product?.colors[0]?.name ?? "");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ivory, padding: 24, paddingTop: insets.top + 24 }}>
        <Text style={{ fontFamily: serif, fontSize: 36 }}>Cette pièce n'est plus au catalogue.</Text>
        <Button label="Retour" onPress={() => router.back()} />
      </View>
    );
  }

  const loved = favorites.includes(product.id);

  function add() {
    setError("");
    if (product!.availability === "indisponible") {
      setError("Cette pièce n'est pas disponible.");
      return;
    }
    addToCart({ productId: product!.id, mode: "achat", quantity, color }, product!.name);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ivory }} contentContainerStyle={{ paddingBottom: 40 }}>
      <Image source={{ uri: product.images[image] ?? product.images[0] }} style={{ height: 460, backgroundColor: colors.sand }} contentFit="cover" />
      <Pressable onPress={() => router.back()} style={{ position: "absolute", top: insets.top + 10, left: 16, backgroundColor: colors.ivory, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}>
        <Text style={{ fontFamily: sans }}>Retour</Text>
      </Pressable>
      <View style={{ padding: 22, gap: 12 }}>
        <Text style={{ fontFamily: sans, fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: colors.wood }}>{categoryLabel[product.category]}</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: serif, fontSize: 44, flex: 1 }}>{product.name}</Text>
          <Pressable onPress={() => toggleFavorite(product.id)}>
            <Text style={{ fontSize: 22 }}>{loved ? "♥" : "♡"}</Text>
          </Pressable>
        </View>
        <Text style={{ fontFamily: "Outfit_300Light", fontSize: 16, lineHeight: 24, color: "rgba(23,23,23,0.75)" }}>{product.description}</Text>
        <Text style={{ fontFamily: serif, fontSize: 34 }}>{euro(product.price)}</Text>
        <Text style={{ fontFamily: sans, color: "rgba(23,23,23,0.6)" }}>{availabilityLabel[product.availability]}</Text>
        <Text style={{ fontFamily: "Outfit_300Light", color: "rgba(23,23,23,0.65)" }}>Pour qu'elle reste avec vous.</Text>
        <Text style={label}>Couleurs disponibles</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {product.colors.map((item) => (
            <Pressable key={item.name} onPress={() => setColor(item.name)} style={{ flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: color === item.name ? colors.ink : colors.sand, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: item.hex }} />
              <Text style={{ fontFamily: sans }}>{item.name}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <Pressable onPress={() => setQuantity(Math.max(1, quantity - 1))}><Text style={{ fontSize: 24 }}>–</Text></Pressable>
          <Text style={{ fontFamily: sans, fontSize: 16 }}>{quantity}</Text>
          <Pressable onPress={() => setQuantity(quantity + 1)}><Text style={{ fontSize: 24 }}>+</Text></Pressable>
          <Text style={{ fontFamily: sans, color: "rgba(23,23,23,0.5)" }}>Quantité</Text>
        </View>
        {error ? <Text style={{ color: colors.wood, fontFamily: sans }}>{error}</Text> : null}
        <Button label="Ajouter au panier" onPress={add} />
        <Button label="Demander un devis professionnel" href="/devis" variant="quiet" />
        <View style={{ borderTopWidth: 1, borderTopColor: colors.sand, paddingTop: 14, gap: 8 }}>
          {product.dimensions.largeur || product.dimensions.hauteur || product.dimensions.profondeur ? (
            <>
              <Text style={{ fontFamily: sans, color: "rgba(23,23,23,0.5)" }}>Dimensions</Text>
              <Text style={{ fontFamily: sans }}>L {product.dimensions.largeur} × H {product.dimensions.hauteur} × P {product.dimensions.profondeur} cm</Text>
            </>
          ) : null}
          <Text style={{ fontFamily: sans, color: "rgba(23,23,23,0.5)" }}>Matières</Text>
          <Text style={{ fontFamily: sans }}>{product.materials.join(", ")}</Text>
          <Text style={{ fontFamily: "Outfit_300Light", lineHeight: 22 }}>{product.details}</Text>
        </View>
        <Text style={{ fontFamily: serif, fontSize: 32, marginTop: 8 }}>Avis</Text>
        {reviews.filter((review) => review.productId === product.id).map((review) => (
          <Text key={review.id} style={{ fontFamily: serif, fontSize: 20 }}>« {review.text} » — {review.author}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

const label = { fontFamily: sans, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase" as const, color: "rgba(23,23,23,0.5)" };
