import { useEffect, useState } from "react";

import { auth, db } from "../firebase";

import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

export default function EmployeeDashboard() {
  /* EMPLOYEE */

  const [employeeData, setEmployeeData] =
    useState(null);

  /* HISTORY */

  const [salaryHistory, setSalaryHistory] =
    useState([]);

  /* LOADING */

  const [loading, setLoading] =
    useState(true);

  /* FETCH EMPLOYEE */

  const fetchEmployeeData =
    async () => {
      try {
        const snapshot =
          await getDocs(
            collection(db, "users")
          );

        let currentEmployee =
          null;

        snapshot.forEach(
          (docSnap) => {
            const data =
              docSnap.data();

            if (
              data.email ===
              auth.currentUser
                ?.email
            ) {
              currentEmployee =
                {
                  id: docSnap.id,
                  ...data,
                };
            }
          }
        );

        setEmployeeData(
          currentEmployee
        );
      } catch (error) {
        console.log(error);
      }
    };

  /* FETCH HISTORY */

  const fetchSalaryHistory =
    async (employeeId) => {
      try {
        const q = query(
          collection(
            db,
            "salaryHistory"
          ),
          orderBy(
            "appliedAt",
            "desc"
          )
        );

        const snapshot =
          await getDocs(q);

        const list = [];

        snapshot.forEach(
          (docSnap) => {
            const data =
              docSnap.data();

            if (
              data.employeeId ===
              employeeId
            ) {
              list.push({
                id: docSnap.id,
                ...data,
              });
            }
          }
        );

        setSalaryHistory(list);
      } catch (error) {
        console.log(error);
      }
    };

  /* INITIAL LOAD */

  useEffect(() => {
    const loadData =
      async () => {
        setLoading(true);

        try {
          const snapshot =
            await getDocs(
              collection(
                db,
                "users"
              )
            );

          let employee =
            null;

          snapshot.forEach(
            (docSnap) => {
              const data =
                docSnap.data();

              if (
                data.email ===
                auth.currentUser
                  ?.email
              ) {
                employee =
                  {
                    id: docSnap.id,
                    ...data,
                  };
              }
            }
          );

          setEmployeeData(
            employee
          );

          if (employee) {
            await fetchSalaryHistory(
              employee.id
            );
          }
        } catch (error) {
          console.log(error);
        }

        setLoading(false);
      };

    loadData();
  }, []);

  /* AUTO REFRESH */

  useEffect(() => {
    const interval =
      setInterval(async () => {
        await fetchEmployeeData();
      }, 3000);

    return () =>
      clearInterval(interval);
  }, []);

  /* RELOAD HISTORY WHEN SALARY UPDATES */

  useEffect(() => {
    if (employeeData?.id) {
      fetchSalaryHistory(
        employeeData.id
      );
    }
  }, [employeeData]);

  /* LOADING */

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="glass-card">
          <h2>
            Loading Employee
            Dashboard...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* HEADER */}

      <div className="glass-card">
        <h1>
          Employee Dashboard
        </h1>

        <p>
          Welcome back,{" "}
          {
            employeeData?.email
          }
        </p>
      </div>

      {/* CURRENT SALARY */}

      <div className="glass-card">
        <h2>
          Current Salary
        </h2>

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            flexDirection:
              "column",
            gap: "12px",
          }}
        >
          <p>
            <strong>
              Base Salary:
            </strong>{" "}
            ₹
            {employeeData?.currentSalary?.toLocaleString()}
          </p>

          <p>
            <strong>
              Effective Date:
            </strong>{" "}
            {employeeData?.effectiveDate
              ? new Date(
                  employeeData.effectiveDate
                ).toLocaleDateString()
              : "N/A"}
          </p>

          <p>
            <strong>
              Role:
            </strong>{" "}
            {
              employeeData?.role
            }
          </p>
        </div>
      </div>

      {/* SALARY HISTORY */}

      <div className="glass-card">
        <h2>
          Salary Change
          History
        </h2>

        {salaryHistory.length ===
        0 ? (
          <div
            style={{
              marginTop: "20px",
            }}
          >
            <p>
              No salary
              history found.
            </p>
          </div>
        ) : (
          <div className="cycles-list">
            {salaryHistory.map(
              (history) => (
                <div
                  key={history.id}
                  className="cycle-card"
                >
                  <h3>
                    {
                      history.changeType
                    }
                  </h3>

                  <p>
                    <strong>
                      Previous Salary:
                    </strong>{" "}
                    ₹
                    {history.previousSalary?.toLocaleString()}
                  </p>

                  <p>
                    <strong>
                      New Salary:
                    </strong>{" "}
                    ₹
                    {history.newSalary?.toLocaleString()}
                  </p>

                  <p>
                    <strong>
                      Effective Date:
                    </strong>{" "}
                    {history.effectiveDate
                      ? new Date(
                          history.effectiveDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>

                  <p>
                    <strong>
                      Applied At:
                    </strong>{" "}
                    {history.appliedAt
                      ?.seconds
                      ? new Date(
                          history.appliedAt.seconds *
                            1000
                        ).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}