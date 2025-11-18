import { useTheme } from "@/hooks/use-theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export const BackButton = () => {
  const router = useRouter();
  const {
    colors: { primary },
  } = useTheme();
  return (
    <TouchableOpacity
      onPress={() =>
        router.canGoBack() ? router.back() : router.replace("/(auth)/login")
      }
      style={{ padding: 8 }}
    >
      <Ionicons name="chevron-back" size={24} color={primary} />
    </TouchableOpacity>
  );
};
