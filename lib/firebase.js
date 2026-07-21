// Firebase's web configuration is intentionally public. Access to the data is
// protected by the Firestore rules in the Firebase project, not by this value.
const firebaseConfig = {
  apiKey: 'AIzaSyCI1aAsOsS5fA6w3jmNklsZvOIs0R4Q8hs',
  authDomain: 'jiu-jitsu-app-8200a.firebaseapp.com',
  projectId: 'jiu-jitsu-app-8200a',
  storageBucket: 'jiu-jitsu-app-8200a.firebasestorage.app',
  messagingSenderId: '985383355310',
  appId: '1:985383355310:web:7a0128e4f02ba30f4a7e3f',
}

const FIREBASE_VERSION = '12.16.0'
let servicesPromise

// The app is a static GitHub Page, so we load Firebase's browser modules at
// runtime. This keeps deployment simple while using Firebase's official SDK.
function loadFirebaseModule(service) {
  const moduleUrl = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-${service}.js`
  return import(/* @vite-ignore */ moduleUrl)
}

export function getFirebaseServices() {
  if (!servicesPromise) {
    servicesPromise = Promise.all([
      loadFirebaseModule('app'),
      loadFirebaseModule('auth'),
      loadFirebaseModule('firestore'),
    ]).then(([appApi, authApi, firestoreApi]) => {
      const app = appApi.initializeApp(firebaseConfig)

      return {
        auth: authApi.getAuth(app),
        db: firestoreApi.getFirestore(app),
        authApi,
        firestoreApi,
      }
    })
  }

  return servicesPromise
}
