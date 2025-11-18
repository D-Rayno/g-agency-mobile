import { useTheme } from "@/hooks/use-theme";
import { ActivityIndicator, Text, View } from "react-native";

export default ({ message }: { message: string }) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ color: colors.text, marginTop: 16 }}>{message}</Text>
    </View>
  );
};
