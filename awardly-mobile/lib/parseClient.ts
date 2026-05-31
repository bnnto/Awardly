import Parse from 'parse/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Parse.setAsyncStorage(AsyncStorage);

Parse.initialize(
  process.env.EXPO_PUBLIC_PARSE_APP_ID ?? '',
  process.env.EXPO_PUBLIC_PARSE_JS_KEY ?? ''
);

Parse.serverURL =
  process.env.EXPO_PUBLIC_PARSE_SERVER_URL ?? 'https://parseapi.back4app.com';

export default Parse;