import firebase from 'FirebaseConfig';

export const signupWithEmailAndPassword = async (email, password) => {
    try {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      return userCredential.user.uid;
    } catch (error) {
      throw error;
    }
  };