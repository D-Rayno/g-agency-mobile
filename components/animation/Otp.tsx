import { useTheme } from "@/hooks/use-theme";
import Anim from "./Anim";

export default () => {
  const { colors } = useTheme();
  return (
    <Anim
      source="one-time-password"
      loop
      width={160}
      height={160}
      colorFilters={[
        // fills -> blue family
        {
          keypath: "Shapes on screen 2.Group 7.Group 4.Fill 1",
          color: colors.primary,
        },
        {
          keypath: "Shapes on screen 2.Group 7.Group 6.Group 2.Fill 1",
          color: colors.primary,
        },
        {
          keypath: "Shapes on screen 2.Group 7.Group 6.Group 4.Fill 1",
          color: colors.primary,
        },

        // strokes -> orange / accent
        {
          keypath: "Shapes on screen 2.Group 7.Group 5.Group 1.Stroke 1",
          color: colors.primary + "50",
        },
        {
          keypath: "Shapes on screen 2.Group 7.Group 6.Group 1.Stroke 1",
          color: colors.primary,
        },
        {
          keypath: "Shapes on screen 2.Group 7.Group 6.Group 3.Stroke 1",
          color: colors.primary,
        },
        {
          keypath: "Shapes on screen.Group 1.Group 5.Stroke 1",
          color: colors.primary + "50",
        },
        {
          keypath: "Shapes on screen.Gup 1.Group 7.Stroke 1",
          color: colors.primary,
        },
        {
          keypath: "Shapes on screen.Group 1.Group 11.Stroke 1",
          color: colors.primary + "50",
        },
        {
          keypath: "Shapes on screen.Group 1.Group 12.Stroke 1",
          color: colors.primary + "50",
        },
        {
          keypath: "Shapes on screen.Group 2.Group 6.Stroke 1",
          color: colors.primary,
        },
        {
          keypath: "Shapes on screen.Group 2.Group 5.Stroke 1",
          color: colors.primary + "50",
        },
        {
          keypath: "Shapes on screen.Group 1.Group 3.Stroke 1",
          color: colors.primary,
        },
      ]}
    />
  );
};
