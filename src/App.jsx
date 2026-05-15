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
  /* AUTH STATES */

  const [user, setUser] =
    useState(null);

  const [role, setRole] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  /* SIDEBAR SECTION */

  const [activeSection, setActiveSection] =
    useState("dashboard");

  /* ADMIN MENU */

  const adminMenu = [
    {
      key: "dashboard",
      label: "Dashboard",
    },

    {
      key: "cycles",
      label: "Review Cycles",
    },

    {
      key: "proposals",
      label: "Salary Proposals",
    },

    {
      key: "filters",
      label:
        "Filters & Sorting",
    },
  ];

  /* EMPLOYEE MENU */

  const employeeMenu = [
    {
      key: "dashboard",
      label: "Dashboard",
    },

    {
      key: "history",
      label:
        "Salary History",
    },
  ];

  /* AUTH LISTENER */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (
          currentUser
        ) => {
          try {
            if (currentUser) {
              setUser(
                currentUser
              );

              const userRef =
                doc(
                  db,
                  "users",
                  currentUser.uid
                );

              const userSnap =
                await getDoc(
                  userRef
                );

              if (
                userSnap.exists()
              ) {
                const userData =
                  userSnap.data();

                setRole(
                  userData.role
                );
              } else {
                setRole(null);
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

    return () =>
      unsubscribe();
  }, []);

  /* LOGOUT */

  const handleLogout =
    async () => {
      try {
        await signOut(auth);

        setUser(null);

        setRole(null);

        setActiveSection(
          "dashboard"
        );
      } catch (error) {
        console.log(error);
      }
    };

  /* LOADING */

  if (loading) {
    return (
      <div
        className="loading-screen"
      >
        Loading...
      </div>
    );
  }

  /* LOGIN */

  if (!user) {
    return <Login />;
  }

  /* MENU */

  const menuItems =
    role === "admin"
      ? adminMenu
      : employeeMenu;

  return (
    <div className="app-layout">
      {/* SIDEBAR */}

      <div className="sidebar">
        <div className="sidebar-top">
          {/* LOGO */}

          <div className="logo">
            Compensation
            <br />
            Management
          </div>

          {/* MENU ITEMS */}

          {menuItems.map(
            (item) => (
              <div
                key={item.key}
                className={`sidebar-btn ${
                  activeSection ===
                  item.key
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveSection(
                    item.key
                  )
                }
              >
                {item.label}
              </div>
            )
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
          <div>
            <h2>
              {role ===
              "admin"
                ? "Admin Dashboard"
                : "Employee Dashboard"}
            </h2>

            <p
              style={{
                marginTop:
                  "6px",

                opacity: 0.7,

                fontSize:
                  "14px",
              }}
            >
              Welcome back,{" "}
              {user.email}
            </p>
          </div>

          <div className="user-box">
            <div
              className="role-badge"
            >
              {role}
            </div>
          </div>
        </div>

        {/* DASHBOARD CONTENT */}

        <div className="dashboard-container">
          {role ===
          "admin" ? (
            <AdminDashboard
              activeSection={
                activeSection
              }
            />
          ) : (
            <EmployeeDashboard
              activeSection={
                activeSection
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;