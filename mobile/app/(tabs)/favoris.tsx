import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, ProductCard, Screen, serif } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function Favoris() {
  const insets = useSafeAreaInsets();
  const { products, favorites } = useStore();
  const loved = products.filter((product) => favorites.includes(product.id));
  return (
    <Screen>
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 22, gap: 20 }}>
        <Text style={{ fontFamily: serif, fontSize: 46 }}>Favoris</Text>
        {loved.length === 0 ? (
          <View style={{ gap: 16 }}>
            <Text style={{ fontFamily: serif, fontSize: 30 }}>Vos favoris sont encore vides.</Text>
            <Button label="Voir le catalogue" href="/catalogue" />
          </View>
        ) : (
          loved.map((product) => <ProductCard key={product.id} product={product} />)
        )}
      </View>
    </Screen>
  );
}
