import {StyleSheet, Text, View, StatusBar} from 'react-native';
import React from 'react';
import Player from './Element/Player';
const App = () => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={'black'} />
      <Player />
    </>
  );
};

export default App;

const styles = StyleSheet.create({});
