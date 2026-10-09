import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, colors, ProductCard, sansLight, serif, Wordmark } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function Home() {
  const insets = useSafeAreaInsets();
  const { products, categories, reviews } = useStore();
  const popular = products.filter((product) => product.popular).slice(0, 4);
  const fresh = products.filter((product) => product.isNew).slice(0, 3);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ivory }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 22 }}>
        <Wordmark />
        <Text style={{ marginTop: 28, fontFamily: "Outfit_400Regular", fontSize: 11, letterSpacing: 2.4, textTransform: "uppercase", color: colors.wood }}>
          Maison française
        </Text>
        <Text style={{ marginTop: 12, fontFamily: serif, fontSize: 52, lineHeight: 50, color: colors.ink }}>
          Le mobilier qui vous ressemble.
        </Text>
        <Text style={{ marginTop: 16, fontFamily: sansLight, fontSize: 17, lineHeight: 26, color: "rgba(23,23,23,0.7)" }}>
          Des meubles pensés pour vivre avec vous. Pour la maison, les professionnels et les moments qui rassemblent.
        </Text>
        <View style={{ marginTop: 22, gap: 10 }}>
          <Button label="Découvrir nos collections" href="/catalogue" />
          <Button label="Demander un devis" href="/devis" variant="ghost" />
        </View>
      </View>
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1400&q=80" }}
        style={{ marginTop: 28, height: 420, backgroundColor: colors.sand }}
        contentFit="cover"
        accessibilityLabel="Intérieur contemporain avec chaises, table et mobilier"
      />
      <View style={{ paddingHorizontal: 22, paddingTop: 36, gap: 16 }}>
        <Text style={{ fontFamily: serif, fontSize: 36, color: colors.ink }}>Les collections</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {categories.map((category) => (
            <Link key={category.id} href={`/catalogue?categorie=${category.id}`} asChild>
              <Pressable style={{ width: 180 }}>
                <Image source={{ uri: category.image }} style={{ width: 180, height: 230, borderRadius: 20, backgroundColor: colors.sand }} contentFit="cover" />
                <Text style={{ marginTop: 8, fontFamily: serif, fontSize: 26 }}>{category.name}</Text>
                <Text style={{ fontFamily: sansLight, color: "rgba(23,23,23,0.65)" }}>{category.tagline}</Text>
              </Pressable>
            </Link>
          ))}
        </ScrollView>
      </View>
      <View style={{ paddingHorizontal: 22, paddingTop: 36, gap: 28 }}>
        <Text style={{ fontFamily: serif, fontSize: 36 }}>Produits populaires</Text>
        {popular.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </View>
      <View style={{ paddingHorizontal: 22, paddingTop: 40, gap: 18 }}>
        <Text style={{ fontFamily: serif, fontSize: 36 }}>Nouvelles collections</Text>
        <Text style={{ fontFamily: sansLight, fontSize: 16, lineHeight: 24, color: "rgba(23,23,23,0.7)" }}>
          Découvrez l'univers LUMA.
        </Text>
        {fresh.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </View>
      <View style={{ marginTop: 40, paddingHorizontal: 22, paddingVertical: 28, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.sand, gap: 18 }}>
        <Text style={{ fontFamily: serif, fontSize: 36 }}>Pourquoi choisir LUMA ?</Text>
        {[
          ["01", "Le confort, sans démonstration"],
          ["02", "Des matières qui se patinent"],
          ["03", "Acheter ou louer, selon le moment"],
          ["04", "Une maison à votre écoute"],
        ].map(([index, title]) => (
          <View key={index}>
            <Text style={{ fontFamily: serif, fontSize: 22, color: colors.gold }}>{index}</Text>
            <Text style={{ fontFamily: serif, fontSize: 24 }}>{title}</Text>
          </View>
        ))}
      </View>
      <View style={{ padding: 22, gap: 14 }}>
        <Text style={{ fontFamily: serif, fontSize: 36 }}>Avis clients</Text>
        {reviews.slice(0, 3).map((review) => (
          <View key={review.id} style={{ backgroundColor: "rgba(231,222,209,0.55)", borderRadius: 20, padding: 18 }}>
            <Text style={{ fontFamily: serif, fontSize: 22, lineHeight: 28 }}>« {review.text} »</Text>
            <Text style={{ marginTop: 10, fontFamily: "Outfit_400Regular", color: "rgba(23,23,23,0.6)" }}>
              {review.author} · {review.city}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ marginTop: 12, backgroundColor: colors.ink, padding: 28, gap: 14 }}>
        <Text style={{ fontFamily: serif, fontSize: 40, lineHeight: 42, color: colors.ivory }}>Votre intérieur mérite du beau.</Text>
        <Button label="Demander un devis" href="/devis" variant="gold" />
      </View>
    </ScrollView>
  );
}
