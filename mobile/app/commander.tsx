import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, colors, Field, sans, Screen, serif } from "@/components/ui";
import { euro, uid } from "@/lib/format";
import { purchaseShipping } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import type { Address, Order, Profile } from "@/lib/types";

export default function Commander() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cart, products, profile, clearCart, confirmPurchase, saveProfile } = useStore();
  const purchases = cart.filter((line) => line.mode === "achat");
  const [customer, setCustomer] = useState<Profile>(profile);
  const [delivery, setDelivery] = useState<Address>({
    id: uid("adr"),
    label: "Maison",
    fullName: "",
    line1: "",
    line2: "",
    postalCode: "",
    city: "",
    country: "France",
    phone: "",
  });
  const [note, setNote] = useState("");
  const [promo, setPromo] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<Order | null>(null);

  if (cart.length === 0 && !done) {
    return (
      <Screen>
        <View style={{ padding: 22, paddingTop: insets.top + 20, gap: 12 }}>
          <Text style={{ fontFamily: serif, fontSize: 40 }}>Rien à confirmer pour le moment.</Text>
          <Button label="Voir le catalogue" href="/catalogue" />
        </View>
      </Screen>
    );
  }

  if (done) {
    return (
      <Screen>
        <View style={{ padding: 22, paddingTop: insets.top + 20, gap: 12 }}>
          <Text style={{ fontFamily: serif, fontSize: 46 }}>C'est noté.</Text>
          <Text style={{ fontFamily: "Outfit_300Light", fontSize: 16, lineHeight: 24 }}>
            Merci {customer.firstName}. Votre demande est enregistrée dans votre espace.
          </Text>
          {done ? <Text style={{ fontFamily: sans }}>Commande {done.id} · {euro(done.total)}</Text> : null}
          <Button label="Voir l'historique" href="/espace/historique" />
        </View>
      </Screen>
    );
  }

  const purchaseSubtotal = purchases.reduce((sum, line) => {
    const product = products.find((item) => item.id === line.productId);
    return sum + (product ? product.price * line.quantity : 0);
  }, 0);
  const shipping = purchases.length ? purchaseShipping(purchaseSubtotal) : 0;

  function addressOf(source: Address): Address {
    return { ...source, fullName: source.fullName || `${customer.firstName} ${customer.lastName}`.trim(), phone: source.phone || customer.phone };
  }

  return (
    <Screen>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 22, gap: 12 }}>
        <Pressable onPress={() => router.back()}><Text style={{ fontFamily: sans }}>Retour</Text></Pressable>
        <Text style={{ fontFamily: serif, fontSize: 46 }}>Confirmer</Text>
        <Text style={{ fontFamily: "Outfit_300Light", color: "rgba(23,23,23,0.7)" }}>
          Vérifiez les pièces et l'adresse. L'atelier vous recontacte pour le règlement.
        </Text>
        <Field label="Prénom" value={customer.firstName} onChangeText={(firstName) => setCustomer({ ...customer, firstName })} />
        <Field label="Nom" value={customer.lastName} onChangeText={(lastName) => setCustomer({ ...customer, lastName })} />
        <Field label="E-mail" value={customer.email} onChangeText={(email) => setCustomer({ ...customer, email })} keyboardType="email-address" />
        <Field label="Téléphone" value={customer.phone} onChangeText={(phone) => setCustomer({ ...customer, phone })} keyboardType="phone-pad" />
        <Field label="Entreprise (facultatif)" value={customer.company} onChangeText={(company) => setCustomer({ ...customer, company })} />
        <Text style={{ fontFamily: serif, fontSize: 28 }}>Adresse de livraison</Text>
        <Field label="Adresse" value={delivery.line1} onChangeText={(line1) => setDelivery({ ...delivery, line1 })} />
        <Field label="Code postal" value={delivery.postalCode} onChangeText={(postalCode) => setDelivery({ ...delivery, postalCode })} />
        <Field label="Ville" value={delivery.city} onChangeText={(city) => setDelivery({ ...delivery, city })} />
        <Field label="Informations complémentaires" value={note} onChangeText={setNote} multiline />
        {purchases.length ? <Field label="Un code maison, si vous en avez un" value={promo} onChangeText={setPromo} /> : null}
        <View style={{ backgroundColor: "rgba(231,222,209,0.45)", borderRadius: 20, padding: 16, gap: 6 }}>
          <Text style={{ fontFamily: serif, fontSize: 28 }}>Récapitulatif</Text>
          <Text style={{ fontFamily: sans }}>Pièces {euro(purchaseSubtotal)}</Text>
          <Text style={{ fontFamily: sans }}>Livraison {shipping === 0 ? "offerte" : euro(shipping)}</Text>
          <Text style={{ fontFamily: sans }}>Total estimé {euro(purchaseSubtotal + shipping)}</Text>
        </View>
        {error ? <Text style={{ color: colors.wood, fontFamily: sans }}>{error}</Text> : null}
        <Button
          label="Confirmer"
          onPress={() => {
            setError("");
            try {
              const shipTo = addressOf(delivery);
              const result = confirmPurchase({ customer, delivery: shipTo, note, promoCode: promo, items: purchases });
              clearCart(purchases.map((line) => line.lineId));
              saveProfile(customer);
              setDone(result);
            } catch (caught) {
              setError(caught instanceof Error ? caught.message : "La confirmation n'a pas abouti.");
            }
          }}
        />
      </View>
    </Screen>
  );
}
