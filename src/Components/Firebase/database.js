import firebase from 'FirebaseConfig.js';

export const addUserDetails = async (userId, userDetails) => {
  try {
    await firebase.firestore().collection('users').doc(userId).set(userDetails);
  } catch (error) {
    throw error;
  }
};