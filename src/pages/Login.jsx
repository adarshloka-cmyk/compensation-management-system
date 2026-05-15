import { useState } from "react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

export default function Login() {
  /* LOGIN / REGISTER MODE */

  const [isRegister, setIsRegister] =
    useState(false);

  /* FORM STATES */

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [role, setRole] =
    useState("employee");

  const [salary, setSalary] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /* VALIDATE EMAIL */

  const isValidEmail = (
    value
  ) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value
    );
  };

  /* HANDLE REGISTER */

  const handleRegister =
    async () => {
      try {
        /* VALIDATION */

        if (!email.trim()) {
          alert(
            "Email is required"
          );

          return;
        }

        if (
          !isValidEmail(email)
        ) {
          alert(
            "Enter valid email address"
          );

          return;
        }

        if (
          password.length < 6
        ) {
          alert(
            "Password must contain at least 6 characters"
          );

          return;
        }

        if (
          role ===
            "employee" &&
          (!salary ||
            Number(salary) <=
              0)
        ) {
          alert(
            "Enter valid starting salary"
          );

          return;
        }

        setLoading(true);

        /* CREATE AUTH USER */

        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        const user =
          userCredential.user;

        /* CREATE FIRESTORE USER */

        await setDoc(
          doc(
            db,
            "users",
            user.uid
          ),
          {
            email,

            role,

            currentSalary:
              role ===
              "employee"
                ? Number(
                    salary
                  )
                : 0,

            effectiveDate:
              new Date().toISOString(),
          }
        );

        alert(
          "Account created successfully"
        );

        /* RESET FORM */

        setEmail("");

        setPassword("");

        setSalary("");

        setRole(
          "employee"
        );
      } catch (error) {
        console.log(error);

        if (
          error.code ===
          "auth/email-already-in-use"
        ) {
          alert(
            "Email already exists"
          );
        } else {
          alert(
            "Registration failed"
          );
        }
      } finally {
        setLoading(false);
      }
    };

  /* HANDLE LOGIN */

  const handleLogin =
    async () => {
      try {
        if (!email.trim()) {
          alert(
            "Email is required"
          );

          return;
        }

        if (
          !password.trim()
        ) {
          alert(
            "Password is required"
          );

          return;
        }

        setLoading(true);

        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        alert(
          "Login successful"
        );
      } catch (error) {
        console.log(error);

        alert(
          "Invalid email or password"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* HEADER */}

        <div
          style={{
            textAlign: "center",
            marginBottom:
              "15px",
          }}
        >
          <h1>
            Compensation
            Management
          </h1>

          <p
            style={{
              marginTop:
                "10px",

              opacity: 0.75,

              lineHeight:
                "1.6",
            }}
          >
            Secure compensation
            review and salary
            management platform
          </p>
        </div>

        {/* FORM */}

        <div
          style={{
            display: "flex",

            flexDirection:
              "column",

            gap: "18px",
          }}
        >
          {/* EMAIL */}

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
          />

          {/* PASSWORD */}

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />

          {/* REGISTER FIELDS */}

          {isRegister && (
            <>
              {/* ROLE */}

              <select
                value={role}
                onChange={(e) =>
                  setRole(
                    e.target.value
                  )
                }
              >
                <option value="employee">
                  Employee
                </option>

                <option value="admin">
                  Admin
                </option>
              </select>

              {/* SALARY */}

              {role ===
                "employee" && (
                <input
                  type="number"
                  placeholder="Starting Salary"
                  value={salary}
                  onChange={(
                    e
                  ) =>
                    setSalary(
                      e.target
                        .value
                    )
                  }
                />
              )}
            </>
          )}

          {/* ACTION BUTTON */}

          <button
            onClick={
              isRegister
                ? handleRegister
                : handleLogin
            }
            disabled={loading}
          >
            {loading
              ? "Please Wait..."
              : isRegister
              ? "Create Account"
              : "Login"}
          </button>

          {/* SWITCH MODE */}

          <p
            style={{
              textAlign:
                "center",

              marginTop:
                "8px",

              lineHeight:
                "1.7",
            }}
          >
            {isRegister
              ? "Already have an account?"
              : "Don't have an account?"}

            <span
              onClick={() =>
                setIsRegister(
                  !isRegister
                )
              }
              style={{
                color:
                  "#60a5fa",

                marginLeft:
                  "8px",

                cursor:
                  "pointer",

                fontWeight:
                  "600",
              }}
            >
              {isRegister
                ? "Login"
                : "Register"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}