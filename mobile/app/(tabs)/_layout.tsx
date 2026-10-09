import { Tabs } from "expo-router";
import { ColorValue, Text } from "react-native";
import { colors, sans } from "@/components/ui";

function Icon({ glyph, color }: { glyph: string; color: ColorValue }) {
  return <Text style={{ color, fontSize: 16 }}>{glyph}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.wood,
        tabBarStyle: {
          backgroundColor: colors.ivory,
          borderTopColor: colors.sand,
          height: 64,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: sans, fontSize: 11 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Accueil", tabBarIcon: ({ color }) => <Icon glyph="⌂" color={color} /> }} />
      <Tabs.Screen name="catalogue" options={{ title: "Catalogue", tabBarIcon: ({ color }) => <Icon glyph="▣" color={color} /> }} />
      <Tabs.Screen name="favoris" options={{ title: "Favoris", tabBarIcon: ({ color }) => <Icon glyph="♡" color={color} /> }} />
      <Tabs.Screen name="panier" options={{ title: "Panier", tabBarIcon: ({ color }) => <Icon glyph="▢" color={color} /> }} />
      <Tabs.Screen name="compte" options={{ title: "Compte", tabBarIcon: ({ color }) => <Icon glyph="○" color={color} /> }} />
    </Tabs>
  );
}
