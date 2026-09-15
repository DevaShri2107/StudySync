import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      default:
        return android;
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyB_JfXUPzZOHgkn08n177lXy-zkfmP9Cm0',
    appId: '1:739108460045:web:c2edb1d8e2b3660db82744',
    messagingSenderId: '739108460045',
    projectId: 'spry-altar-bxhgq',
    authDomain: 'spry-altar-bxhgq.firebaseapp.com',
    storageBucket: 'spry-altar-bxhgq.firebasestorage.app',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyB_JfXUPzZOHgkn08n177lXy-zkfmP9Cm0',
    appId: '1:739108460045:android:c2edb1d8e2b3660db82744',
    messagingSenderId: '739108460045',
    projectId: 'spry-altar-bxhgq',
    storageBucket: 'spry-altar-bxhgq.firebasestorage.app',
  );
}
