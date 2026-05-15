import { useState } from "react";

import { auth, db } from "../firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDocs,
  collection,
} from "firebase/firestore";

export default function Login() {
  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [salary, setSalary] =
    useState("");

  const [role, setRole] =
    useState("employee");

  const [isRegister, setIsRegister] =
    useState(false);

  const handleAuth = async () => {
    try {
      if (isRegister) {
        if (!salary || Number(salary) <= 0) {
          alert(
            "Please enter valid salary"
          );

          return;
        }

        const existingUsers =
          await getDocs(
            collection(db, "users")
          );

        let duplicateEmail = false;

        existingUsers.forEach((docSnap) => {
          const data = docSnap.data();

          if (data.email === email) {
            duplicateEmail = true;
          }
        });

        if (duplicateEmail) {
          alert(
            "Email already registered"
          );

          return;
        }

        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        const user = userCredential.user;

        await setDoc(
          doc(db, "users", user.uid),
          {
            email,

            role,

            currentSalary:
              Number(salary),

            effectiveDate:
              new Date().toISOString(),

            createdAt: new Date(),
          }
        );

        alert("Registration successful");
      } else {
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        alert("Login successful");
      }
    } catch (error) {
      console.log(error);

      alert(error.message);
    }
  };

  return (
    <div className="login-container">
      <h1>
        Compensation Management App
      </h1>

      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      {isRegister && (
        <>
          <input
            type="number"
            placeholder="Enter Current Salary"
            value={salary}
            onChange={(e) =>
              setSalary(e.target.value)
            }
          />

          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
          >
            <option value="employee">
              Employee
            </option>

            <option value="admin">
              Administrator
            </option>
          </select>
        </>
      )}

      <button onClick={handleAuth}>
        {isRegister
          ? "Register"
          : "Login"}
      </button>

      <p
        onClick={() =>
          setIsRegister(!isRegister)
        }
      >
        {isRegister
          ? "Already have an account? Login"
          : "Create New Account"}
      </p>
    </div>
  );
}