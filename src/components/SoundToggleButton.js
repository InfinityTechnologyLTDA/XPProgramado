import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AudioContext from './AudioContext';

const SoundToggleButton = () => {
  const { muted, setMuted } = useContext(AudioContext);

  return (
    <View style={{ alignItems: 'center', marginTop: 50 }}>
      <TouchableOpacity
        onPress={() => setMuted(!muted)}
        style={{
          backgroundColor: muted ? 'red' : 'green',
          padding: 10,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: 'white', fontSize: 18 }}>
          {muted ? 'Som Off' : 'Som On'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SoundToggleButton;
