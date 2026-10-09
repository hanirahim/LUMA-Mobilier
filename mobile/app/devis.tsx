import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, colors, Field, sans, Screen, serif } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function Devis() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ produit?: string }>();
  const { products, profile, confirmQuote } = useStore();
  const preset = products.find((product) => product.slug === params.produit || product.id === params.produit);
  const [lines, setLines] = useState([{ productId: preset?.id ?? products[0]?.id ?? "", quantity: "1" }]);
  const [form, setForm] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
    company: profile.company,
    desiredDate: "",
    message: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  if (done) {
    return (
      <Screen>
        <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 22, gap: 12 }}>
          <Text style={{ fontFamily: serif, fontSize: 42 }}>Votre demande est entre nos mains.</Text>
          <Text style={{ fontFamily: "Outfit_300Light", fontSize: 16, lineHeight: 24 }}>Référence {done}. Vous la retrouverez dans votre espace.</Text>
          <Button label="Voir mes devis" href="/espace/devis" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 22, gap: 12 }}>
        <Pressable onPress={() => router.back()}><Text style={{ fontFamily: sans }}>Retour</Text></Pressable>
        <Text style={{ fontFamily: serif, fontSize: 46 }}>Demander un devis</Text>
        <Text style={{ fontFamily: "Outfit_300Light", fontSize: 16, color: "rgba(23,23,23,0.7)" }}>
          Pour plusieurs pièces, un lieu, un événement. Nous répondons simplement.
        </Text>
        <Field label="Nom" value={form.lastName} onChangeText={(lastName) => setForm({ ...form, lastName })} />
        <Field label="Prénom" value={form.firstName} onChangeText={(firstName) => setForm({ ...form, firstName })} />
        <Field label="E-mail" value={form.email} onChangeText={(email) => setForm({ ...form, email })} keyboardType="email-address" />
        <Field label="Téléphone" value={form.phone} onChangeText={(phone) => setForm({ ...form, phone })} keyboardType="phone-pad" />
        <Field label="Entreprise (facultatif)" value={form.company} onChangeText={(company) => setForm({ ...form, company })} />
        <Text style={{ fontFamily: serif, fontSize: 28, marginTop: 8 }}>Produits souhaités</Text>
        {lines.map((line, index) => (
          <View key={index} style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {products.map((product) => {
                const active = line.productId === product.id;
                return (
                  <Pressable key={product.id} onPress={() => setLines((current) => current.map((item, i) => (i === index ? { ...item, productId: product.id } : item)))} style={{ borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: active ? colors.ink : colors.white, borderWidth: 1, borderColor: colors.sand }}>
                    <Text style={{ fontFamily: sans, fontSize: 13, color: active ? colors.ivory : colors.ink }}>{product.name}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Field label="Quantité" value={line.quantity} onChangeText={(quantity) => setLines((current) => current.map((item, i) => (i === index ? { ...item, quantity } : item)))} keyboardType="number-pad" />
          </View>
        ))}
        <Pressable onPress={() => setLines((current) => [...current, { productId: products[0]?.id ?? "", quantity: "1" }])}>
          <Text style={{ fontFamily: sans, textDecorationLine: "underline" }}>Ajouter une pièce</Text>
        </Pressable>
        <Field label="Date souhaitée (AAAA-MM-JJ)" value={form.desiredDate} onChangeText={(desiredDate) => setForm({ ...form, desiredDate })} placeholder="2026-11-06" />
        <Field label="Message" value={form.message} onChangeText={(message) => setForm({ ...form, message })} multiline />
        <Field label="Adresse" value={form.address} onChangeText={(address) => setForm({ ...form, address })} multiline />
        {error ? <Text style={{ color: colors.wood, fontFamily: sans }}>{error}</Text> : null}
        <Button
          label="Envoyer la demande"
          onPress={() => {
            try {
              const quote = confirmQuote({
                ...form,
                items: lines.map((line) => ({
                  productId: line.productId,
                  name: products.find((product) => product.id === line.productId)?.name ?? "",
                  quantity: Math.max(1, Number(line.quantity) || 1),
                })),
              });
              setDone(quote.id);
            } catch (caught) {
              setError(caught instanceof Error ? caught.message : "La demande n'a pas abouti.");
            }
          }}
        />
      </View>
    </Screen>
  );
}
