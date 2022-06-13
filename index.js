/**
 * @format
 */
// This needs to go right after you register the main component of your app
// AppRegistry.registerComponent(...)
import {AppRegistry} from 'react-native';
import { TrackType } from 'react-native-track-player';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
