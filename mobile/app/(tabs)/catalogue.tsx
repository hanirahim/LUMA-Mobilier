import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, ProductCard, sans, Screen, serif } from "@/components/ui";
import { availabilityLabel, categoryLabel } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Availability, Product } from "@/lib/types";

const prices = [
  ["", "Tous les prix"],
  ["0-500", "Moins de 500 €"],
  ["500-1000", "500 à 1 000 €"],
  ["1000-2000", "1 000 à 2 000 €"],
  ["2000+", "Plus de 2 000 €"],
] as const;

export default function Catalogue() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ categorie?: string }>();
  const { products } = useStore();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState(typeof params.categorie === "string" ? params.categorie : "");
  const [price, setPrice] = useState("");
  const [color, setColor] = useState("");
  const [material, setMaterial] = useState("");
  const [availability, setAvailability] = useState("");

  const colorsList = useMemo(
    () => [...new Set(products.flatMap((product) => product.colors.map((item) => item.name)))],
    [products],
  );
  const materials = useMemo(() => [...new Set(products.flatMap((product) => product.materials))], [products]);

  const list = products.filter((product) => matches(product, { q, category, price, color, material, availability }));

  return (
    <Screen>
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 22, gap: 14 }}>
        <Text style={{ fontFamily: serif, fontSize: 46 }}>Catalogue</Text>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Rechercher une pièce, une matière…"
          placeholderTextColor="rgba(23,23,23,0.35)"
          style={{ height: 48, borderRadius: 999, borderWidth: 1, borderColor: colors.sand, backgroundColor: colors.white, paddingHorizontal: 16, fontFamily: sans }}
        />
        <Chips label="Catégorie" value={category} onChange={setCategory} options={[["", "Toutes"], ...Object.entries(categoryLabel)]} />
        <Chips label="Prix" value={price} onChange={setPrice} options={prices.map(([id, label]) => [id, label])} />
        <Chips label="Couleur" value={color} onChange={setColor} options={[["", "Toutes"], ...colorsList.map((item) => [item, item] as [string, string])]} />
        <Chips label="Matière" value={material} onChange={setMaterial} options={[["", "Toutes"], ...materials.map((item) => [item, item] as [string, string])]} />
        <Chips
          label="Disponibilité"
          value={availability}
          onChange={setAvailability}
          options={[["", "Toutes"], ...Object.entries(availabilityLabel)]}
        />
        <Text style={{ fontFamily: sans, color: "rgba(23,23,23,0.55)" }}>{list.length} pièce{list.length > 1 ? "s" : ""}</Text>
      </View>
      <View style={{ paddingHorizontal: 22, paddingTop: 18, gap: 32 }}>
        {list.length === 0 ? (
          <Text style={{ fontFamily: serif, fontSize: 32 }}>Aucune pièce ne correspond.</Text>
        ) : (
          list.map((product) => <ProductCard key={product.id} product={product} />)
        )}
      </View>
    </Screen>
  );
}

function Chips({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontFamily: sans, fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: "rgba(23,23,23,0.5)" }}>{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map(([id, name]) => {
          const active = value === id;
          return (
            <Pressable
              key={label + id}
              onPress={() => onChange(id)}
              style={{
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: active ? colors.ink : colors.white,
                borderWidth: 1,
                borderColor: active ? colors.ink : colors.sand,
              }}
            >
              <Text style={{ fontFamily: sans, fontSize: 13, color: active ? colors.ivory : colors.ink }}>{name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function matches(
  product: Product,
  filters: { q: string; category: string; price: string; color: string; material: string; availability: string },
) {
  const haystack = `${product.name} ${product.description} ${product.materials.join(" ")}`.toLowerCase();
  if (filters.q && !haystack.includes(filters.q.trim().toLowerCase())) return false;
  if (filters.category && product.category !== filters.category) return false;
  if (filters.color && !product.colors.some((item) => item.name === filters.color)) return false;
  if (filters.material && !product.materials.includes(filters.material)) return false;
  if (filters.availability && product.availability !== (filters.availability as Availability)) return false;
  if (filters.price === "0-500" && product.price >= 500) return false;
  if (filters.price === "500-1000" && (product.price < 500 || product.price >= 1000)) return false;
  if (filters.price === "1000-2000" && (product.price < 1000 || product.price >= 2000)) return false;
  if (filters.price === "2000+" && product.price < 2000) return false;
  return true;
}
