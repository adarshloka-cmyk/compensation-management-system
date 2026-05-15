import { useEffect, useMemo, useState } from "react";

import { auth, db } from "../firebase";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

export default function AdminDashboard({
  activeSection,
}) {
  /* REVIEW CYCLE */

  const [title, setTitle] =
    useState("");

  const [effectiveDate, setEffectiveDate] =
    useState("");

  const [budget, setBudget] =
    useState("");

  const [cycles, setCycles] =
    useState([]);

  /* EMPLOYEES */

  const [employees, setEmployees] =
    useState([]);

  /* PROPOSAL */

  const [selectedEmployee, setSelectedEmployee] =
    useState("");

  const [selectedCycle, setSelectedCycle] =
    useState("");

  const [changeType, setChangeType] =
    useState("Salary Increase");

  const [newSalary, setNewSalary] =
    useState("");

  const [justification, setJustification] =
    useState("");

  /* PROPOSALS */

  const [proposals, setProposals] =
    useState([]);

  /* FILTERS */

  const [filterStatus, setFilterStatus] =
    useState("");

  const [filterEmployee, setFilterEmployee] =
    useState("");

  const [filterCycle, setFilterCycle] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState("desc");

  /* PAGINATION */

  const ITEMS_PER_PAGE = 5;

  const [currentPage, setCurrentPage] =
    useState(1);

  /* SELECTED EMPLOYEE */

  const selectedEmployeeData =
    employees.find(
      (emp) =>
        emp.id === selectedEmployee
    );

  /* FETCH CYCLES */

  const fetchCycles = async () => {
    try {
      const q = query(
        collection(db, "reviewCycles"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const list = [];

      snapshot.forEach((docSnap) => {
        list.push({
          id: docSnap.id,
          ...docSnap.data(),
        });
      });

      setCycles(list);
    } catch (error) {
      console.log(error);
    }
  };

  /* FETCH EMPLOYEES */

  const fetchEmployees = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "users")
      );

      const list = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();

        if (data.role === "employee") {
          list.push({
            id: docSnap.id,
            ...data,
          });
        }
      });

      setEmployees(list);
    } catch (error) {
      console.log(error);
    }
  };

  /* FETCH PROPOSALS */

  const fetchProposals = async () => {
    try {
      const q = query(
        collection(db, "proposals"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const list = [];

      snapshot.forEach((docSnap) => {
        list.push({
          id: docSnap.id,
          ...docSnap.data(),
        });
      });

      setProposals(list);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCycles();

    fetchEmployees();

    fetchProposals();
  }, []);

  /* FILTER + SORT */

  const filteredProposals = useMemo(() => {
    let updated = [...proposals];

    if (filterStatus) {
      updated = updated.filter(
        (p) => p.status === filterStatus
      );
    }

    if (filterEmployee) {
      updated = updated.filter((p) =>
        p.employeeEmail
          .toLowerCase()
          .includes(
            filterEmployee.toLowerCase()
          )
      );
    }

    if (filterCycle) {
      updated = updated.filter(
        (p) => p.cycleId === filterCycle
      );
    }

    updated.sort((a, b) => {
      if (sortOrder === "asc") {
        return (
          a.costOfChange -
          b.costOfChange
        );
      }

      return (
        b.costOfChange -
        a.costOfChange
      );
    });

    return updated;
  }, [
    proposals,
    filterStatus,
    filterEmployee,
    filterCycle,
    sortOrder,
  ]);

  /* PAGINATION */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProposals.length /
        ITEMS_PER_PAGE
    )
  );

  const paginatedProposals =
    filteredProposals.slice(
      (currentPage - 1) *
        ITEMS_PER_PAGE,

      currentPage * ITEMS_PER_PAGE
    );

  /* CREATE CYCLE */

  const handleCreateCycle = async () => {
    try {
      if (!title.trim()) {
        alert("Cycle title required");

        return;
      }

      if (
        !budget ||
        Number(budget) <= 0
      ) {
        alert(
          "Budget must be positive"
        );

        return;
      }

      await addDoc(
        collection(db, "reviewCycles"),
        {
          title,

          effectiveDate,

          totalBudget:
            Number(budget),

          status: "Open",

          createdBy:
            auth.currentUser.email,

          createdAt: new Date(),
        }
      );

      alert("Cycle created");

      setTitle("");

      setEffectiveDate("");

      setBudget("");

      fetchCycles();
    } catch (error) {
      console.log(error);
    }
  };

  /* CREATE PROPOSAL */

  const handleCreateProposal =
    async () => {
      try {
        if (
          !selectedEmployee ||
          !selectedCycle ||
          !newSalary ||
          !justification.trim()
        ) {
          alert("Fill all fields");

          return;
        }

        const employee =
          employees.find(
            (emp) =>
              emp.id ===
              selectedEmployee
          );

        const cycle =
          cycles.find(
            (c) =>
              c.id ===
              selectedCycle
          );

        const currentSalary =
          employee.currentSalary;

        if (
          Number(newSalary) <=
          currentSalary
        ) {
          alert(
            "New salary must be greater than current salary"
          );

          return;
        }

        const costOfChange =
          Number(newSalary) -
          currentSalary;

        await addDoc(
          collection(db, "proposals"),
          {
            employeeId:
              selectedEmployee,

            employeeEmail:
              employee.email,

            cycleId:
              selectedCycle,

            cycleTitle:
              cycle.title,

            changeType,

            currentSalarySnapshot:
              currentSalary,

            proposedNewSalary:
              Number(newSalary),

            costOfChange,

            justification,

            status: "Proposed",

            proposedBy:
              auth.currentUser.email,

            createdAt:
              new Date(),
          }
        );

        alert("Proposal created");

        setSelectedEmployee("");

        setSelectedCycle("");

        setChangeType(
          "Salary Increase"
        );

        setNewSalary("");

        setJustification("");

        fetchProposals();
      } catch (error) {
        console.log(error);
      }
    };

  /* APPROVE */

  const handleApprove = async (
    proposal
  ) => {
    try {
      if (
        proposal.proposedBy ===
        auth.currentUser.email
      ) {
        alert(
          "You cannot approve your own proposal"
        );

        return;
      }

      const cycleRef = doc(
        db,
        "reviewCycles",
        proposal.cycleId
      );

      const cycleSnap =
        await getDoc(cycleRef);

      const cycleData =
        cycleSnap.data();

      const allProposals =
        await getDocs(
          collection(db, "proposals")
        );

      let approvedTotal = 0;

      allProposals.forEach(
        (docSnap) => {
          const data =
            docSnap.data();

          if (
            data.cycleId ===
              proposal.cycleId &&
            data.status ===
              "Approved"
          ) {
            approvedTotal +=
              data.costOfChange;
          }
        }
      );

      const remainingBudget =
        cycleData.totalBudget -
        approvedTotal;

      if (
        proposal.costOfChange >
        remainingBudget
      ) {
        alert(
          `Budget exceeded. Remaining Budget: ₹${remainingBudget}`
        );

        return;
      }

      await updateDoc(
        doc(
          db,
          "proposals",
          proposal.id
        ),
        {
          status: "Approved",

          decidedBy:
            auth.currentUser.email,

          decidedAt:
            new Date(),
        }
      );

      alert("Proposal approved");

      fetchProposals();
    } catch (error) {
      console.log(error);
    }
  };

  /* REJECT */

  const handleReject = async (
    proposal
  ) => {
    try {
      if (
        proposal.proposedBy ===
        auth.currentUser.email
      ) {
        alert(
          "You cannot reject your own proposal"
        );

        return;
      }

      const note = prompt(
        "Enter rejection note"
      );

      await updateDoc(
        doc(
          db,
          "proposals",
          proposal.id
        ),
        {
          status: "Rejected",

          decisionNote:
            note || "",

          decidedBy:
            auth.currentUser.email,

          decidedAt:
            new Date(),
        }
      );

      alert("Proposal rejected");

      fetchProposals();
    } catch (error) {
      console.log(error);
    }
  };

  /* DELETE */

  const handleDeleteProposal =
    async (proposal) => {
      try {
        if (
          proposal.proposedBy !==
          auth.currentUser.email
        ) {
          alert(
            "Delete only your own proposals"
          );

          return;
        }

        if (
          proposal.status !==
          "Proposed"
        ) {
          alert(
            "Only proposed proposals can be deleted"
          );

          return;
        }

        await deleteDoc(
          doc(
            db,
            "proposals",
            proposal.id
          )
        );

        alert("Proposal deleted");

        fetchProposals();
      } catch (error) {
        console.log(error);
      }
    };

  /* CLOSE CYCLE */

  const handleCloseCycle = async (
    cycle
  ) => {
    try {
      const snapshot =
        await getDocs(
          collection(db, "proposals")
        );

      const cycleProposals = [];

      snapshot.forEach(
        (docSnap) => {
          const data =
            docSnap.data();

          if (
            data.cycleId ===
            cycle.id
          ) {
            cycleProposals.push({
              id: docSnap.id,
              ...data,
            });
          }
        }
      );

      const pending =
        cycleProposals.filter(
          (p) =>
            p.status ===
            "Proposed"
        );

      if (pending.length > 0) {
        alert(
          `${pending.length} unresolved proposals remaining`
        );

        return;
      }

      const approved =
        cycleProposals.filter(
          (p) =>
            p.status ===
            "Approved"
        );

      for (const proposal of approved) {
        await updateDoc(
          doc(
            db,
            "users",
            proposal.employeeId
          ),
          {
            currentSalary:
              proposal.proposedNewSalary,

            effectiveDate:
              cycle.effectiveDate,
          }
        );

        await addDoc(
          collection(
            db,
            "salaryHistory"
          ),
          {
            employeeId:
              proposal.employeeId,

            proposalId:
              proposal.id,

            changeType:
              proposal.changeType,

            previousSalary:
              proposal.currentSalarySnapshot,

            newSalary:
              proposal.proposedNewSalary,

            effectiveDate:
              cycle.effectiveDate,

            appliedAt:
              new Date(),
          }
        );
      }

      await updateDoc(
        doc(
          db,
          "reviewCycles",
          cycle.id
        ),
        {
          status: "Closed",
        }
      );

      alert(
        "Cycle closed successfully"
      );

      fetchCycles();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="dashboard-container">
      {/* DASHBOARD */}

      {activeSection ===
        "dashboard" && (
        <>
          <div className="glass-card">
            <h1
              style={{
                fontSize: "42px",
                marginBottom:
                  "18px",
              }}
            >
              Welcome Admin
            </h1>

            <p>
              Manage salary review
              cycles, proposals,
              approvals, budgets,
              and employee
              compensation securely.
            </p>
          </div>

          <div className="cycles-list">
            <div className="cycle-card">
              <h3>
                Total Cycles
              </h3>

              <p
                style={{
                  fontSize: "36px",
                  fontWeight:
                    "700",
                }}
              >
                {cycles.length}
              </p>
            </div>

            <div className="cycle-card">
              <h3>
                Total Proposals
              </h3>

              <p
                style={{
                  fontSize: "36px",
                  fontWeight:
                    "700",
                }}
              >
                {
                  proposals.length
                }
              </p>
            </div>

            <div className="cycle-card">
              <h3>
                Employees
              </h3>

              <p
                style={{
                  fontSize: "36px",
                  fontWeight:
                    "700",
                }}
              >
                {
                  employees.length
                }
              </p>
            </div>
          </div>
        </>
      )}

      {/* REVIEW CYCLES */}

      {activeSection ===
        "cycles" && (
        <>
          <div className="cycle-form">
            <h2>
              Create Review Cycle
            </h2>

            <input
              type="text"
              placeholder="Cycle Title"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
            />

            <input
              type="date"
              value={
                effectiveDate
              }
              onChange={(e) =>
                setEffectiveDate(
                  e.target.value
                )
              }
            />

            <input
              type="number"
              placeholder="Budget"
              value={budget}
              onChange={(e) =>
                setBudget(
                  e.target.value
                )
              }
            />

            <button
              onClick={
                handleCreateCycle
              }
            >
              Create Cycle
            </button>
          </div>

          <div className="cycles-list">
            {cycles.map((cycle) => (
              <div
                className="cycle-card"
                key={cycle.id}
              >
                <h3>
                  {cycle.title}
                </h3>

                <p>
                  <strong>
                    Status:
                  </strong>{" "}
                  {
                    cycle.status
                  }
                </p>

                <p>
                  <strong>
                    Budget:
                  </strong>{" "}
                  ₹
                  {
                    cycle.totalBudget
                  }
                </p>

                <p>
                  <strong>
                    Effective:
                  </strong>{" "}
                  {
                    cycle.effectiveDate
                  }
                </p>

                <p>
                  <strong>
                    Created By:
                  </strong>{" "}
                  {
                    cycle.createdBy
                  }
                </p>

                {cycle.status ===
                  "Open" && (
                  <button
                    onClick={() =>
                      handleCloseCycle(
                        cycle
                      )
                    }
                  >
                    Close Cycle
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* PROPOSALS */}

      {activeSection ===
        "proposals" && (
        <>
          <div className="cycle-form">
            <h2>
              Create Salary
              Proposal
            </h2>

            <select
              value={
                selectedEmployee
              }
              onChange={(e) =>
                setSelectedEmployee(
                  e.target.value
                )
              }
            >
              <option value="">
                Select Employee
              </option>

              {employees.map(
                (emp) => (
                  <option
                    key={emp.id}
                    value={
                      emp.id
                    }
                  >
                    {emp.email}
                  </option>
                )
              )}
            </select>

            {selectedEmployeeData && (
              <div className="glass-card">
                <p>
                  <strong>
                    Current
                    Salary:
                  </strong>{" "}
                  ₹
                  {
                    selectedEmployeeData.currentSalary
                  }
                </p>

                <p>
                  <strong>
                    Effective
                    Date:
                  </strong>{" "}
                  {new Date(
                    selectedEmployeeData.effectiveDate
                  ).toLocaleDateString()}
                </p>
              </div>
            )}

            <select
              value={
                selectedCycle
              }
              onChange={(e) =>
                setSelectedCycle(
                  e.target.value
                )
              }
            >
              <option value="">
                Select Cycle
              </option>

              {cycles.map(
                (cycle) => (
                  <option
                    key={
                      cycle.id
                    }
                    value={
                      cycle.id
                    }
                  >
                    {
                      cycle.title
                    }
                  </option>
                )
              )}
            </select>

            <select
              value={
                changeType
              }
              onChange={(e) =>
                setChangeType(
                  e.target.value
                )
              }
            >
              <option>
                Salary Increase
              </option>

              <option>
                Promotion
              </option>

              <option>
                Market
                Adjustment
              </option>
            </select>

            <input
              type="number"
              placeholder="New Salary"
              value={
                newSalary
              }
              onChange={(e) =>
                setNewSalary(
                  e.target.value
                )
              }
            />

            <textarea
              placeholder="Justification"
              value={
                justification
              }
              onChange={(e) =>
                setJustification(
                  e.target.value
                )
              }
            />

            <button
              onClick={
                handleCreateProposal
              }
            >
              Create Proposal
            </button>
          </div>

          <div className="cycles-list">
            {paginatedProposals.map(
              (proposal) => (
                <div
                  className="cycle-card"
                  key={
                    proposal.id
                  }
                >
                  <h3>
                    {
                      proposal.employeeEmail
                    }
                  </h3>

                  <p>
                    <strong>
                      Cycle:
                    </strong>{" "}
                    {
                      proposal.cycleTitle
                    }
                  </p>

                  <p>
                    <strong>
                      Status:
                    </strong>{" "}
                    {
                      proposal.status
                    }
                  </p>

                  <p>
                    <strong>
                      Current:
                    </strong>{" "}
                    ₹
                    {
                      proposal.currentSalarySnapshot
                    }
                  </p>

                  <p>
                    <strong>
                      Proposed:
                    </strong>{" "}
                    ₹
                    {
                      proposal.proposedNewSalary
                    }
                  </p>

                  <p>
                    <strong>
                      Cost:
                    </strong>{" "}
                    ₹
                    {
                      proposal.costOfChange
                    }
                  </p>

                  <p>
                    <strong>
                      Proposed
                      By:
                    </strong>{" "}
                    {
                      proposal.proposedBy
                    }
                  </p>

                  {proposal.status ===
                    "Proposed" && (
                    <div
                      style={{
                        display:
                          "flex",

                        gap: "10px",

                        flexWrap:
                          "wrap",

                        marginTop:
                          "14px",
                      }}
                    >
                      <button
                        onClick={() =>
                          handleApprove(
                            proposal
                          )
                        }
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          handleReject(
                            proposal
                          )
                        }
                      >
                        Reject
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteProposal(
                            proposal
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )
            )}
          </div>

          <div className="pagination">
            <button
              disabled={
                currentPage ===
                1
              }
              onClick={() =>
                setCurrentPage(
                  currentPage -
                    1
                )
              }
            >
              Prev
            </button>

            <p>
              Page{" "}
              {currentPage} of{" "}
              {totalPages}
            </p>

            <button
              disabled={
                currentPage ===
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  currentPage +
                    1
                )
              }
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* FILTERS */}

      {activeSection ===
        "filters" && (
        <>
          <div className="glass-card">
            <h2
              style={{
                marginBottom:
                  "20px",
              }}
            >
              Proposal Filters &
              Sorting
            </h2>

            <div className="filters-bar">
              <select
                value={
                  filterStatus
                }
                onChange={(
                  e
                ) =>
                  setFilterStatus(
                    e.target
                      .value
                  )
                }
              >
                <option value="">
                  All Status
                </option>

                <option value="Proposed">
                  Proposed
                </option>

                <option value="Approved">
                  Approved
                </option>

                <option value="Rejected">
                  Rejected
                </option>
              </select>

              <input
                type="text"
                placeholder="Search Employee Email"
                value={
                  filterEmployee
                }
                onChange={(
                  e
                ) =>
                  setFilterEmployee(
                    e.target
                      .value
                  )
                }
              />

              <select
                value={
                  filterCycle
                }
                onChange={(
                  e
                ) =>
                  setFilterCycle(
                    e.target
                      .value
                  )
                }
              >
                <option value="">
                  All Cycles
                </option>

                {cycles.map(
                  (
                    cycle
                  ) => (
                    <option
                      key={
                        cycle.id
                      }
                      value={
                        cycle.id
                      }
                    >
                      {
                        cycle.title
                      }
                    </option>
                  )
                )}
              </select>

              <select
                value={
                  sortOrder
                }
                onChange={(
                  e
                ) =>
                  setSortOrder(
                    e.target
                      .value
                  )
                }
              >
                <option value="desc">
                  Highest
                  Cost
                </option>

                <option value="asc">
                  Lowest
                  Cost
                </option>
              </select>
            </div>
          </div>

          <div className="cycles-list">
            {paginatedProposals.map(
              (proposal) => (
                <div
                  className="cycle-card"
                  key={
                    proposal.id
                  }
                >
                  <h3>
                    {
                      proposal.employeeEmail
                    }
                  </h3>

                  <p>
                    <strong>
                      Status:
                    </strong>{" "}
                    {
                      proposal.status
                    }
                  </p>

                  <p>
                    <strong>
                      Cost:
                    </strong>{" "}
                    ₹
                    {
                      proposal.costOfChange
                    }
                  </p>

                  <p>
                    <strong>
                      Cycle:
                    </strong>{" "}
                    {
                      proposal.cycleTitle
                    }
                  </p>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}