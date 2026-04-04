import { Redirect, Tabs } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import { View, StyleSheet } from "react-native";
import { Header } from "../../src/components/Header";
import { useEffect, useState } from "react";
import { getAuthToken } from "../../src/services/authStorage";

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  return (
    <View style={[styles.tabIconWrapper, focused && styles.activeTabIcon]}>
      <FontAwesome5 name={name} size={18} color={focused ? COLORS.white : color} />
    </View>
  );
}

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
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.background,
          height: 80,
          paddingBottom: SPACING.md,
          paddingTop: SPACING.sm,
        },
        tabBarLabelStyle: {
          fontWeight: "600",
          fontSize: 11,
          marginTop: -5,
        },
        header: () => <Header />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => <TabIcon name="home" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          headerShown: false,
          title: "Community",
          tabBarIcon: ({ focused, color }) => <TabIcon name="users" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => <TabIcon name="expand" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ focused, color }) => <TabIcon name="history" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => <TabIcon name="user" focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconWrapper: {
    width: 44,
    height: 32,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  activeTabIcon: {
    backgroundColor: COLORS.primary,
  },
});
