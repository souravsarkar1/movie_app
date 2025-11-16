import { Stack } from 'expo-router';
import React from 'react';

const LayoutOfMovies = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name='index' 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name='[id]' 
        options={{ 
          headerShown: false,
          presentation: 'card',
          animation: 'slide_from_right',
        }} 
      />
    </Stack>
  );
};

export default LayoutOfMovies;