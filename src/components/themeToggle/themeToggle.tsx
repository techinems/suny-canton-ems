'use client';

import { ActionIcon, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

export function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');
  
  const toggleColorScheme = () => {
    const nextScheme = computedColorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(nextScheme);
  };

  return (
    <ActionIcon
      onClick={toggleColorScheme}
      variant="transparent"
      size="md"
      aria-label="Toggle theme"
    >
      {computedColorScheme === 'dark' ? (
        <IconSun size="1.2rem" />
      ) : (
        <IconMoon size="1.2rem" />
      )}
    </ActionIcon>
  );
}