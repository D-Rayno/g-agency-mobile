// components/password-strength-indicator.tsx
import { useTheme } from "@/hooks/use-theme";
import { memo, useEffect, useMemo, useRef } from "react";
import { Animated, Text, View } from "react-native";

export const PasswordStrengthIndicator = memo(({ password }: { password?: string }) => {
  const { colors, spacing, typography } = useTheme();
  const animatedWidth = useRef(new Animated.Value(0)).current;

  const passwordStrength = useMemo(() => {
    // Handle undefined or null password
    if (!password) return { level: 0, label: "", color: colors.border };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    const levels = [
      { level: 0, label: "", color: colors.border },
      { level: 1, label: "Weak", color: colors.danger },
      { level: 2, label: "Fair", color: colors.warning || "#FFA500" },
      { level: 3, label: "Good", color: colors.info },
      { level: 4, label: "Strong", color: colors.success },
      { level: 5, label: "Very Strong", color: colors.success },
    ];

    return levels[Math.min(strength, 5)];
  }, [password, colors]);

  const passwordRequirements = useMemo(
    () => [
      { met: password && password.length >= 8, text: "At least 8 characters" },
      { met: password && /[a-z]/.test(password), text: "One lowercase letter" },
      { met: password && /[A-Z]/.test(password), text: "One uppercase letter" },
      { met: password && /[0-9]/.test(password), text: "One number" },
      {
        met: password && /[@$!%*?&]/.test(password),
        text: "One special character (@$!%*?&)",
      },
    ],
    [password]
  );

  // Create ultra-stable styles
  const strengthStyles = useMemo(
    () => ({
      container: {
        marginTop: -spacing.sm,
        marginBottom: spacing.md,
      },
      header: {
        flexDirection: "row" as const,
        justifyContent: "space-between" as const,
        alignItems: "center" as const,
        marginBottom: spacing.xs,
      },
      label: {
        fontSize: typography.caption.fontSize,
        color: colors.text,
        fontWeight: "600" as const,
      },
      level: {
        fontSize: typography.caption.fontSize,
        fontWeight: "700" as const,
        color: passwordStrength.color,
      },
      barContainer: {
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        overflow: "hidden" as const,
        marginBottom: spacing.sm,
      },
      requirementsContainer: {
        backgroundColor: colors.card,
        borderRadius: 8,
        padding: spacing.md,
      },
      requirementsTitle: {
        fontSize: typography.body.fontSize,
        fontWeight: "600" as const,
        color: colors.text,
        marginBottom: spacing.sm,
      },
      requirement: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        marginBottom: spacing.xs,
      },
      requirementIcon: {
        marginRight: spacing.sm,
        width: 16,
        textAlign: "center" as const,
      },
      requirementText: {
        flex: 1,
        fontSize: typography.caption.fontSize,
        color: colors.muted,
      },
      requirementMet: {
        color: colors.text,
      },
    }),
    [colors, spacing, typography, passwordStrength.color]
  );

  // Animate the strength bar only when needed
  useEffect(() => {
    const targetWidth = (passwordStrength.level / 5) * 100;
    Animated.timing(animatedWidth, {
      toValue: targetWidth,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [passwordStrength.level, animatedWidth]);

  // Return null if no password is provided
  if (!password) return null;

  return (
    <View style={strengthStyles.container}>
      <View style={strengthStyles.header}>
        <Text style={strengthStyles.label}>Password Strength</Text>
        <Text style={strengthStyles.level}>{passwordStrength.label}</Text>
      </View>

      <View style={strengthStyles.barContainer}>
        <Animated.View
          style={{
            height: "100%",
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
              extrapolate: "clamp",
            }),
            backgroundColor: passwordStrength.color,
            borderRadius: 2,
          }}
        />
      </View>

      <View style={strengthStyles.requirementsContainer}>
        <Text style={strengthStyles.requirementsTitle}>Password Requirements</Text>
        {passwordRequirements.map((req, index) => (
          <View key={index} style={strengthStyles.requirement}>
            <Text
              style={[
                strengthStyles.requirementIcon,
                { color: req.met ? colors.success : colors.muted },
              ]}
            >
              {req.met ? "✓" : "○"}
            </Text>
            <Text
              style={[
                strengthStyles.requirementText,
                req.met && strengthStyles.requirementMet,
              ]}
            >
              {req.text}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // Only re-render if password actually changed
  return prevProps.password === nextProps.password;
});

PasswordStrengthIndicator.displayName = "PasswordStrengthIndicator";