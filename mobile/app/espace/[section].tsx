import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, colors, Field, sans, Screen, serif } from "@/components/ui";
import { euro, formatDate, formatDateTime, orderStatusLabel, quoteStatusLabel, rentalStatusLabel, reservationStatusLabel, uid } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Address } from "@/lib/types";

export default function Espace() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const titles: Record<string, string> = {
    profil: "Profil",
    commandes: "Commandes",
    locations: "Locations",
    reservations: "Réservations",
    devis: "Devis",
    adresses: "Adresses",
    historique: "Historique",
  };

  return (
    <Screen>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 22, gap: 14 }}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ fontFamily: sans }}>Retour</Text>
        </Pressable>
        <Text style={{ fontFamily: serif, fontSize: 44 }}>{titles[section] ?? "Espace"}</Text>
        {section === "profil" ? <Profile /> : null}
        {section === "commandes" ? <Orders /> : null}
        {section === "locations" || section === "reservations" ? (
          <Text style={{ fontFamily: "Outfit_300Light", fontSize: 16 }}>LUMA vend uniquement du mobilier neuf.</Text>
        ) : null}
        {section === "devis" ? <Quotes /> : null}
        {section === "adresses" ? <Addresses /> : null}
        {section === "historique" ? <History /> : null}
      </View>
    </Screen>
  );
}

function Profile() {
  const { profile, saveProfile } = useStore();
  const [form, setForm] = useState(profile);
  return (
    <View style={{ gap: 10 }}>
      <Field label="Prénom" value={form.firstName} onChangeText={(firstName) => setForm({ ...form, firstName })} />
      <Field label="Nom" value={form.lastName} onChangeText={(lastName) => setForm({ ...form, lastName })} />
      <Field label="E-mail" value={form.email} onChangeText={(email) => setForm({ ...form, email })} keyboardType="email-address" />
      <Field label="Téléphone" value={form.phone} onChangeText={(phone) => setForm({ ...form, phone })} keyboardType="phone-pad" />
      <Field label="Entreprise (facultatif)" value={form.company} onChangeText={(company) => setForm({ ...form, company })} />
      <Button label="Enregistrer" onPress={() => saveProfile(form)} />
    </View>
  );
}

function Card({ title, text }: { title: string; text: string }) {
  return (
    <View style={{ borderWidth: 1, borderColor: colors.sand, borderRadius: 18, padding: 14, gap: 4 }}>
      <Text style={{ fontFamily: serif, fontSize: 24 }}>{title}</Text>
      <Text style={{ fontFamily: sans, color: "rgba(23,23,23,0.7)" }}>{text}</Text>
    </View>
  );
}

function Orders() {
  const { orders } = useStore();
  if (!orders.length) return <Text style={{ fontFamily: serif, fontSize: 28 }}>Aucune commande pour le moment.</Text>;
  return (
    <View style={{ gap: 10 }}>
      {orders.map((order) => (
        <Card key={order.id} title={order.id} text={`${formatDateTime(order.createdAt)} · ${orderStatusLabel[order.status]} · ${euro(order.total)}\n${order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}`} />
      ))}
    </View>
  );
}

function Rentals() {
  const { rentals } = useStore();
  if (!rentals.length) return <Text style={{ fontFamily: serif, fontSize: 28 }}>Aucune location pour le moment.</Text>;
  return (
    <View style={{ gap: 10 }}>
      {rentals.map((rental) => (
        <Card
          key={rental.id}
          title={rental.id}
          text={`${rentalStatusLabel[rental.status]} · ${euro(rental.total)}\n${rental.items.map((item) => `${item.name} · ${formatDate(item.start)} — ${formatDate(item.end)}`).join("\n")}\nLivraison : ${rental.delivery.city}\nRécupération : ${rental.pickup.city}`}
        />
      ))}
    </View>
  );
}

function Reservations() {
  const { reservations } = useStore();
  if (!reservations.length) return <Text style={{ fontFamily: serif, fontSize: 28 }}>Aucune réservation pour le moment.</Text>;
  return (
    <View style={{ gap: 10 }}>
      {reservations.map((item) => (
        <Card key={item.id} title={item.productName} text={`${formatDate(item.date)} · qté ${item.quantity} · ${reservationStatusLabel[item.status]}${item.note ? `\n${item.note}` : ""}`} />
      ))}
    </View>
  );
}

function Quotes() {
  const { quotes } = useStore();
  if (!quotes.length) return <Text style={{ fontFamily: serif, fontSize: 28 }}>Aucun devis pour le moment.</Text>;
  return (
    <View style={{ gap: 10 }}>
      {quotes.map((quote) => (
        <Card key={quote.id} title={quote.id} text={`${quoteStatusLabel[quote.status]}\n${quote.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}`} />
      ))}
    </View>
  );
}

function Addresses() {
  const { addresses, saveAddress, removeAddress, profile } = useStore();
  const [form, setForm] = useState<Address>({
    id: uid("adr"),
    label: "Maison",
    fullName: `${profile.firstName} ${profile.lastName}`.trim(),
    line1: "",
    line2: "",
    postalCode: "",
    city: "",
    country: "France",
    phone: profile.phone,
  });
  return (
    <View style={{ gap: 12 }}>
      {addresses.map((address) => (
        <View key={address.id} style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <Text style={{ fontFamily: sans, flex: 1 }}>{address.label} · {address.line1}, {address.postalCode} {address.city}</Text>
          <Pressable onPress={() => removeAddress(address.id)}><Text style={{ fontFamily: sans, color: "rgba(23,23,23,0.5)" }}>Retirer</Text></Pressable>
        </View>
      ))}
      <Field label="Libellé" value={form.label} onChangeText={(label) => setForm({ ...form, label })} />
      <Field label="Adresse" value={form.line1} onChangeText={(line1) => setForm({ ...form, line1 })} />
      <Field label="Code postal" value={form.postalCode} onChangeText={(postalCode) => setForm({ ...form, postalCode })} />
      <Field label="Ville" value={form.city} onChangeText={(city) => setForm({ ...form, city })} />
      <Button
        label="Enregistrer l'adresse"
        onPress={() => {
          saveAddress(form);
          setForm({ ...form, id: uid("adr"), line1: "", postalCode: "", city: "" });
        }}
      />
    </View>
  );
}

function History() {
  const { orders, rentals, reservations, quotes } = useStore();
  const events = [
    ...orders.map((item) => ({ id: item.id, date: item.createdAt, label: `Commande · ${euro(item.total)}` })),
    ...rentals.map((item) => ({ id: item.id, date: item.createdAt, label: `Location · ${euro(item.total)}` })),
    ...reservations.map((item) => ({ id: item.id, date: item.createdAt, label: `Réservation · ${item.productName}` })),
    ...quotes.map((item) => ({ id: item.id, date: item.createdAt, label: "Demande de devis" })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  if (!events.length) return <Text style={{ fontFamily: serif, fontSize: 28 }}>L'historique est encore vide.</Text>;
  return (
    <View style={{ gap: 14 }}>
      {events.map((event) => (
        <View key={event.id}>
          <Text style={{ fontFamily: sans, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: colors.wood }}>{formatDateTime(event.date)}</Text>
          <Text style={{ fontFamily: serif, fontSize: 24 }}>{event.label}</Text>
        </View>
      ))}
    </View>
  );
}
