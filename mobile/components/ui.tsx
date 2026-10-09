import { Image } from "expo-image";
import { Link, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { availabilityLabel, categoryLabel, euro } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useStore } from "@/lib/store";

export const colors = {
  ink: "#171717",
  ivory: "#FAF8F4",
  sand: "#E7DED1",
  wood: "#8A6F55",
  gold: "#C5A46D",
  white: "#FFFFFF",
};

export const serif = "CormorantGaramond_500Medium";
export const sans = "Outfit_400Regular";
export const sansLight = "Outfit_300Light";

export function Mark({ size = 28 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "flex-end" }}>
      <View
        style={{
          width: size * 0.72,
          height: size * 0.46,
          borderTopLeftRadius: size,
          borderTopRightRadius: size,
          borderWidth: 1.6,
          borderBottomWidth: 0,
          borderColor: colors.ink,
        }}
      />
      <View style={{ width: size * 0.46, height: 1.6, backgroundColor: colors.ink, marginTop: -1 }} />
      <View style={{ width: size * 0.26, height: 1.6, backgroundColor: colors.gold, marginTop: size * 0.12 }} />
    </View>
  );
}

export function Wordmark() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Mark />
      <Text style={{ fontFamily: serif, fontSize: 28, letterSpacing: 6, color: colors.ink }}>LUMA</Text>
    </View>
  );
}

export function Screen({ children, bottom = true }: { children: React.ReactNode; bottom?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.ivory }}
      contentContainerStyle={{ paddingBottom: bottom ? insets.bottom + 28 : 28 }}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function Button({
  label,
  onPress,
  href,
  variant = "primary",
}: {
  label: string;
  onPress?: () => void;
  href?: Href;
  variant?: "primary" | "ghost" | "gold" | "quiet";
}) {
  const style = [
    styles.button,
    variant === "ghost" && styles.ghost,
    variant === "gold" && styles.gold,
    variant === "quiet" && styles.quiet,
  ];
  const text = (
    <Text style={[styles.buttonText, variant === "primary" && { color: colors.ivory }, variant === "quiet" && styles.quietText]}>
      {label}
    </Text>
  );
  if (href) {
    return (
      <Link href={href} asChild>
        <Pressable style={style}>{text}</Pressable>
      </Link>
    );
  }
  return (
    <Pressable onPress={onPress} style={style}>
      {text}
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "number-pad";
  multiline?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(23,23,23,0.35)"
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
        style={[styles.input, multiline && { minHeight: 110, textAlignVertical: "top" }]}
      />
    </View>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, favorites, toggleFavorite } = useStore();
  const loved = favorites.includes(product.id);
  return (
    <View style={{ gap: 12 }}>
      <View>
        <Image source={{ uri: product.images[0] }} style={styles.cardImage} contentFit="cover" />
        <Pressable onPress={() => toggleFavorite(product.id)} style={styles.heart} accessibilityLabel="Favori">
          <Text style={{ color: loved ? colors.wood : colors.ink }}>{loved ? "♥" : "♡"}</Text>
        </Pressable>
      </View>
      <Text style={styles.kicker}>{categoryLabel[product.category]}</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
        <Text style={styles.cardTitle}>{product.name}</Text>
        <Text style={styles.price}>{euro(product.price)}</Text>
      </View>
      <Text style={styles.meta}>{availabilityLabel[product.availability]}</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Button label="Voir le produit" href={`/produit/${product.slug}`} variant="ghost" />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            label="Ajouter au panier"
            onPress={() =>
              product.availability !== "indisponible" &&
              addToCart({ productId: product.id, mode: "achat", quantity: 1, color: product.colors[0]?.name ?? "" }, product.name)
            }
          />
        </View>
      </View>
      <Button label="Demander un devis" href={`/devis?produit=${product.slug}`} variant="quiet" />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(23,23,23,0.15)" },
  gold: { backgroundColor: colors.gold },
  quiet: { backgroundColor: "transparent", minHeight: 36, alignItems: "flex-start", paddingHorizontal: 0 },
  buttonText: { fontFamily: sans, fontSize: 14, color: colors.ink },
  quietText: { textDecorationLine: "underline", color: "rgba(23,23,23,0.75)" },
  label: { fontFamily: sans, fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: "rgba(23,23,23,0.55)" },
  input: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    fontFamily: sans,
    color: colors.ink,
  },
  cardImage: { width: "100%", aspectRatio: 3 / 4, borderRadius: 22, backgroundColor: colors.sand },
  heart: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(250,248,244,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  kicker: { fontFamily: sans, fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: colors.wood },
  cardTitle: { fontFamily: serif, fontSize: 28, color: colors.ink, flex: 1 },
  price: { fontFamily: sans, fontSize: 14, color: colors.ink },
  meta: { fontFamily: sans, fontSize: 12, color: "rgba(23,23,23,0.55)" },
});
