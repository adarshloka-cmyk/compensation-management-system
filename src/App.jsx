import "./App.css";

import { useEffect, useState } from "react";

import { auth, db } from "./firebase";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import Login from "./pages/Login";

import AdminDashboard from "./pages/AdminDashboard";

import EmployeeDashboard from "./pages/EmployeeDashboard";

function App() {
  const [user, setUser] =
    useState(null);

  const [role, setRole] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  /* SIDEBAR ACTIVE SECTION */

  const [activeSection, setActiveSection] =
    useState("dashboard");

  /* AUTH */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {
          try {
            if (currentUser) {
              setUser(currentUser);

              const userRef = doc(
                db,
                "users",
                currentUser.uid
              );

              const userSnap =
                await getDoc(userRef);

              if (
                userSnap.exists()
              ) {
                const userData =
                  userSnap.data();

                setRole(
                  userData.role
                );
              }
            } else {
              setUser(null);

              setRole(null);
            }
          } catch (error) {
            console.log(error);
          } finally {
            setLoading(false);
          }
        }
      );

    return () => unsubscribe();
  }, []);

  /* LOGOUT */

  const handleLogout =
    async () => {
      try {
        await signOut(auth);

        setUser(null);

        setRole(null);
      } catch (error) {
        console.log(error);
      }
    };

  /* LOADING */

  if (loading) {
    return (
      <div
        style={{
          display: "flex",

          justifyContent:
            "center",

          alignItems:
            "center",

          height: "100vh",

          color: "white",

          fontSize: "24px",
        }}
      >
        Loading...
      </div>
    );
  }

  /* LOGIN */

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-layout">
      {/* SIDEBAR */}

      <div className="sidebar">
        <div className="sidebar-top">
          <div className="logo">
            Compensation
            <br />
            Management
          </div>

          {/* ADMIN SIDEBAR */}

          {role === "admin" && (
            <>
              <div
                className={`sidebar-btn ${
                  activeSection ===
                  "dashboard"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveSection(
                    "dashboard"
                  )
                }
              >
                Dashboard
              </div>

              <div
                className={`sidebar-btn ${
                  activeSection ===
                  "cycles"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveSection(
                    "cycles"
                  )
                }
              >
                Review Cycles
              </div>

              <div
                className={`sidebar-btn ${
                  activeSection ===
                  "proposals"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveSection(
                    "proposals"
                  )
                }
              >
                Salary Proposals
              </div>

              <div
                className={`sidebar-btn ${
                  activeSection ===
                  "filters"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveSection(
                    "filters"
                  )
                }
              >
                Filters & Sorting
              </div>
            </>
          )}

          {/* EMPLOYEE SIDEBAR */}

          {role ===
            "employee" && (
            <>
              <div
                className={`sidebar-btn ${
                  activeSection ===
                  "dashboard"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveSection(
                    "dashboard"
                  )
                }
              >
                Dashboard
              </div>

              <div
                className={`sidebar-btn ${
                  activeSection ===
                  "history"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveSection(
                    "history"
                  )
                }
              >
                Salary History
              </div>
            </>
          )}
        </div>

        {/* LOGOUT */}

        <button
          className="logout-btn"
          onClick={
            handleLogout
          }
        >
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}

      <div className="main-content">
        {/* TOPBAR */}

        <div className="topbar">
          <h2>
            {role === "admin"
              ? "Admin Dashboard"
              : "Employee Dashboard"}
          </h2>

          <div className="user-box">
            <div className="user-email">
              {user.email}
            </div>
          </div>
        </div>

        {/* ADMIN CONTENT */}

        {role === "admin" && (
          <AdminDashboard
            activeSection={
              activeSection
            }
          />
        )}

        {/* EMPLOYEE CONTENT */}

        {role ===
          "employee" && (
          <EmployeeDashboard
            activeSection={
              activeSection
            }
          />
        )}
      </div>
    </div>
  );
}

export default App;