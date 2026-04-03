import { Redirect, Tabs } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import { View, StyleSheet } from "react-native";
import { Header } from "../../src/components/Header";
import { useEffect, useState } from "react";
import { getAuthToken } from "../../src/services/authStorage";

export default function TabLayout() {
  const [ready, setReady] = useState(false);
  const [hasAuth, setHasAuth] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await getAuthToken();
      setHasAuth(Boolean(token));
      setReady(true);
    })();
  }, []);

  if (!ready) return null;
  if (!hasAuth) return <Redirect href="/auth/email" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 70,
          paddingBottom: SPACING.md,
        },
        tabBarLabelStyle: {
          fontWeight: "600",
          fontSize: 10,
        },
        header: () => <Header />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <FontAwesome5 name="home" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ color }) => <FontAwesome5 name="users" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={[styles.scanButton, focused && styles.scanButtonActive]}>
              <FontAwesome5 name="expand" size={20} color={COLORS.white} />
            </View>
          ),
          tabBarLabel: "Scan",
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => <FontAwesome5 name="history" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <FontAwesome5 name="user" size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scanButton: {
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: RADIUS.pill,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20, // Elevate it
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  scanButtonActive: {
    backgroundColor: COLORS.textPrimary,
  },
});
