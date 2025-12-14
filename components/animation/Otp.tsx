// components/animation/Otp.tsx
/**
 * OTP Lottie Animation with Color Filters
 * Simplified - removed theme dependency
 */

import Anim from './Anim';

const PRIMARY_COLOR = '#4F46E5'; // Indigo primary
const PRIMARY_LIGHT = '#4F46E580'; // 50% opacity

export default () => {
  return (
    <Anim
      source="one-time-password"
      loop
      width={160}
      height={160}
      colorFilters={[
        // fills -> indigo
        {
          keypath: 'Shapes on screen 2.Group 7.Group 4.Fill 1',
          color: PRIMARY_COLOR,
        },
        {
          keypath: 'Shapes on screen 2.Group 7.Group 6.Group 2.Fill 1',
          color: PRIMARY_COLOR,
        },
        {
          keypath: 'Shapes on screen 2.Group 7.Group 6.Group 4.Fill 1',
          color: PRIMARY_COLOR,
        },

        // strokes -> indigo with opacity
        {
          keypath: 'Shapes on screen 2.Group 7.Group 5.Group 1.Stroke 1',
          color: PRIMARY_LIGHT,
        },
        {
          keypath: 'Shapes on screen 2.Group 7.Group 6.Group 1.Stroke 1',
          color: PRIMARY_COLOR,
        },
        {
          keypath: 'Shapes on screen 2.Group 7.Group 6.Group 3.Stroke 1',
          color: PRIMARY_COLOR,
        },
        {
          keypath: 'Shapes on screen.Group 1.Group 5.Stroke 1',
          color: PRIMARY_LIGHT,
        },
        {
          keypath: 'Shapes on screen.Gup 1.Group 7.Stroke 1',
          color: PRIMARY_COLOR,
        },
        {
          keypath: 'Shapes on screen.Group 1.Group 11.Stroke 1',
          color: PRIMARY_LIGHT,
        },
        {
          keypath: 'Shapes on screen.Group 1.Group 12.Stroke 1',
          color: PRIMARY_LIGHT,
        },
        {
          keypath: 'Shapes on screen.Group 2.Group 6.Stroke 1',
          color: PRIMARY_COLOR,
        },
        {
          keypath: 'Shapes on screen.Group 2.Group 5.Stroke 1',
          color: PRIMARY_LIGHT,
        },
        {
          keypath: 'Shapes on screen.Group 1.Group 3.Stroke 1',
          color: PRIMARY_COLOR,
        },
      ]}
    />
  );
};
