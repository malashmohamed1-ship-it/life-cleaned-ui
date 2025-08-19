import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const submitFeedback = async (userId, feedbackText) => {
  try {
    const docRef = await addDoc(collection(db, "feedback"), {
      userId,
      feedback: feedbackText,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (err) {
    console.error("Error adding feedback:", err);
    return { success: false, error: err.message };
  }
};
