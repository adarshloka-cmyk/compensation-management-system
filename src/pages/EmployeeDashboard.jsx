import { useEffect, useState } from "react";

import { auth, db } from "../firebase";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export default function EmployeeDashboard({
  activeSection,
}) {
  const [userData, setUserData] =
    useState(null);

  const [salaryHistory, setSalaryHistory] =
    useState([]);

  /* FETCH EMPLOYEE DATA */

  const fetchUserData =
    async () => {
      try {
        const snapshot =
          await getDocs(
            query(
              collection(
                db,
                "users"
              ),
              where(
                "email",
                "==",
                auth.currentUser.email
              )
            )
          );

        snapshot.forEach(
          (docSnap) => {
            setUserData({
              id: docSnap.id,
              ...docSnap.data(),
            });
          }
        );
      } catch (error) {
        console.log(error);
      }
    };

  /* FETCH SALARY HISTORY */

  const fetchSalaryHistory =
    async () => {
      try {
        const userSnapshot =
          await getDocs(
            query(
              collection(
                db,
                "users"
              ),
              where(
                "email",
                "==",
                auth.currentUser.email
              )
            )
          );

        let employeeId = "";

        userSnapshot.forEach(
          (docSnap) => {
            employeeId =
              docSnap.id;
          }
        );

        if (!employeeId) return;

        const historySnapshot =
          await getDocs(
            query(
              collection(
                db,
                "salaryHistory"
              ),
              where(
                "employeeId",
                "==",
                employeeId
              )
            )
          );

        const historyList = [];

        historySnapshot.forEach(
          (docSnap) => {
            historyList.push({
              id: docSnap.id,
              ...docSnap.data(),
            });
          }
        );

        setSalaryHistory(
          historyList
        );
      } catch (error) {
        console.log(error);
      }
    };

  useEffect(() => {
    fetchUserData();

    fetchSalaryHistory();
  }, []);

  if (!userData) {
    return (
      <div
        className="glass-card"
        style={{
          textAlign: "center",
        }}
      >
        Loading Employee Data...
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* DASHBOARD */}

      {activeSection ===
        "dashboard" && (
        <>
          <div className="glass-card">
            <h1
              style={{
                marginBottom:
                  "25px",

                fontSize: "40px",
              }}
            >
              Welcome Back
            </h1>

            <p
              style={{
                marginBottom:
                  "14px",
              }}
            >
              <strong>
                Employee Email:
              </strong>{" "}
              {userData.email}
            </p>

            <p
              style={{
                marginBottom:
                  "14px",
              }}
            >
              <strong>
                Role:
              </strong>{" "}
              {userData.role}
            </p>

            <p
              style={{
                marginBottom:
                  "14px",
              }}
            >
              <strong>
                Current Salary:
              </strong>{" "}
              ₹
              {
                userData.currentSalary
              }
            </p>

            <p>
              <strong>
                Effective Date:
              </strong>{" "}
              {new Date(
                userData.effectiveDate
              ).toLocaleDateString()}
            </p>
          </div>

          {/* QUICK STATS */}

          <div className="cycles-list">
            <div className="cycle-card">
              <h3>
                Total Salary
              </h3>

              <p
                style={{
                  fontSize: "30px",

                  fontWeight:
                    "700",
                }}
              >
                ₹
                {
                  userData.currentSalary
                }
              </p>
            </div>

            <div className="cycle-card">
              <h3>
                Salary Changes
              </h3>

              <p
                style={{
                  fontSize: "30px",

                  fontWeight:
                    "700",
                }}
              >
                {
                  salaryHistory.length
                }
              </p>
            </div>

            <div className="cycle-card">
              <h3>
                Account Type
              </h3>

              <p
                style={{
                  fontSize: "30px",

                  fontWeight:
                    "700",

                  textTransform:
                    "capitalize",
                }}
              >
                {userData.role}
              </p>
            </div>
          </div>
        </>
      )}

      {/* SALARY HISTORY */}

      {activeSection ===
        "history" && (
        <>
          <div className="glass-card">
            <h1
              style={{
                marginBottom:
                  "25px",

                fontSize: "38px",
              }}
            >
              Salary Change History
            </h1>

            {salaryHistory.length ===
            0 ? (
              <p>
                No salary history
                available yet.
              </p>
            ) : (
              <div className="cycles-list">
                {salaryHistory.map(
                  (history) => (
                    <div
                      className="cycle-card"
                      key={
                        history.id
                      }
                    >
                      <h3>
                        {
                          history.changeType
                        }
                      </h3>

                      <p>
                        <strong>
                          Previous
                          Salary:
                        </strong>{" "}
                        ₹
                        {
                          history.previousSalary
                        }
                      </p>

                      <p>
                        <strong>
                          New
                          Salary:
                        </strong>{" "}
                        ₹
                        {
                          history.newSalary
                        }
                      </p>

                      <p>
                        <strong>
                          Effective
                          Date:
                        </strong>{" "}
                        {new Date(
                          history.effectiveDate
                        ).toLocaleDateString()}
                      </p>

                      <p>
                        <strong>
                          Applied
                          Date:
                        </strong>{" "}
                        {new Date(
                          history.appliedAt?.seconds *
                            1000
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}