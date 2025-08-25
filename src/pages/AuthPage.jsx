import { useState } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const toggleMode = () => setIsSignup((s) => !s);

const handleSubmit = async () => {
  try {
    if (isSignup) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      const displayName = name || email.split("@")[0];
      await updateProfile(cred.user, { displayName });

      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        name: displayName,
        email: cred.user.email,
        createdAt: serverTimestamp(),
      });
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (e) {
    console.error("Auth/Firestore error:", e);
    alert(e.message);
  }
};


  const handleGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        name: cred.user.displayName,
        email: cred.user.email,
        photoURL: cred.user.photoURL,
        createdAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0b1020] to-[#141a3f] text-white">
      <div className="w-full max-w-md bg-white/5 rounded-2xl p-6 shadow-lg border border-white/10">
        <h2 className="text-xl font-bold mb-4">{isSignup ? "Create Account" : "Sign In"}</h2>

        {isSignup && (
          <input
            className="w-full mb-3 p-3 rounded-xl bg-black/30 border border-white/20"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          className="w-full mb-3 p-3 rounded-xl bg-black/30 border border-white/20"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full mb-3 p-3 rounded-xl bg-black/30 border border-white/20"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700"
          onClick={handleSubmit}
        >
          {isSignup ? "Sign Up" : "Sign In"}
        </button>

        <button
          className="w-full py-3 mt-2 rounded-xl bg-white/10 border border-white/20"
          onClick={handleGoogle}
        >
          Continue with Google
        </button>

        <p className="mt-4 text-sm text-center">
          {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
          <button className="text-indigo-400 underline" onClick={toggleMode}>
            {isSignup ? "Sign in" : "Create one"}
          </button>
        </p>
      </div>
    </div>
  );
}
