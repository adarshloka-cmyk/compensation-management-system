import { useEffect, useMemo, useState } from "react";

import { auth, db } from "../firebase";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
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

  /* CREATE PROPOSAL */

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

  /* EDIT */

  const [editingProposalId, setEditingProposalId] =
    useState(null);

  const [editNewSalary, setEditNewSalary] =
    useState("");

  const [editChangeType, setEditChangeType] =
    useState("Salary Increase");

  const [editJustification, setEditJustification] =
    useState("");

  const [filterStatus, setFilterStatus] =
    useState("");

  const [filterEmployee, setFilterEmployee] =
    useState("");

  const [filterChangeType, setFilterChangeType] =
    useState("");

  const [filterCycle, setFilterCycle] =
    useState("");

  /* SORT */

  const [sortField, setSortField] =
    useState("createdAt");

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
        const data = docSnap.data();

        /* REMOVE DELETED / INVALID */

        if (
          data.title &&
          data.status
        ) {
          list.push({
            id: docSnap.id,
            ...data,
          });
        }
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

    if (filterChangeType) {
      updated = updated.filter(
        (p) =>
          p.changeType ===
          filterChangeType
      );
    }

    if (filterCycle) {
      updated = updated.filter(
        (p) =>
          p.cycleId ===
          filterCycle
      );
    }

    updated.sort((a, b) => {
      let valueA;
      let valueB;

      if (sortField === "cost") {
        valueA =
          Number(a.costOfChange);

        valueB =
          Number(b.costOfChange);
      } else if (
        sortField === "employee"
      ) {
        valueA =
          a.employeeEmail
            ?.toLowerCase() || "";

        valueB =
          b.employeeEmail
            ?.toLowerCase() || "";

        if (sortOrder === "asc") {
          return valueA.localeCompare(
            valueB
          );
        }

        return valueB.localeCompare(
          valueA
        );
      } else {
        valueA =
          a.createdAt?.seconds || 0;

        valueB =
          b.createdAt?.seconds || 0;
      }

      if (sortOrder === "asc") {
        return valueA - valueB;
      }

      return valueB - valueA;
    });

    return updated;
  }, [
    proposals,
    filterStatus,
    filterEmployee,
    filterChangeType,
    filterCycle,
    sortField,
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

  const handleCreateCycle =
    async () => {
      try {
        if (!title.trim()) {
          alert(
            "Cycle title required"
          );

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

        alert(
          "Cycle created"
        );

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
          alert(
            "Fill all fields"
          );

          return;
        }

        const employee =
          employees.find(
            (emp) =>
              emp.id ===
              selectedEmployee
          );

        if (
          Number(newSalary) <=
          employee.currentSalary
        ) {
          alert(
            "New salary must be greater than current salary"
          );

          return;
        }

        await addDoc(
          collection(db, "proposals"),
          {
            employeeId:
              employee.id,

            employeeEmail:
              employee.email,

            cycleId:
              selectedCycle,

            changeType,

            currentSalarySnapshot:
              employee.currentSalary,

            proposedNewSalary:
              Number(newSalary),

            costOfChange:
              Number(newSalary) -
              employee.currentSalary,

            justification,

            status: "Proposed",

            proposedBy:
              auth.currentUser.email,

            createdAt:
              new Date(),

            updatedAt:
              new Date(),
          }
        );

        alert(
          "Proposal created"
        );

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

  /* EDIT */

  const handleEditProposal =
    async (proposalId) => {
      try {
        const proposal =
          proposals.find(
            (p) =>
              p.id === proposalId
          );

        if (proposal.status !== "Proposed") {
          alert("Cannot edit proposal that is already decided.");
          return;
        }

        const cycle = cycles.find((c) => c.id === proposal.cycleId);
        if (!cycle || cycle.status !== "Open") {
          alert("Cannot edit proposal for a closed cycle.");
          return;
        }

        if (
          Number(editNewSalary) <=
          proposal.currentSalarySnapshot
        ) {
          alert(
            "New salary must be greater than current salary"
          );

          return;
        }

        await updateDoc(
          doc(
            db,
            "proposals",
            proposalId
          ),
          {
            proposedNewSalary:
              Number(
                editNewSalary
              ),

            changeType:
              editChangeType,

            justification:
              editJustification,

            costOfChange:
              Number(
                editNewSalary
              ) -
              proposal.currentSalarySnapshot,

            updatedAt:
              new Date(),
          }
        );

        alert(
          "Proposal updated"
        );

        setEditingProposalId(
          null
        );

        fetchProposals();
      } catch (error) {
        console.log(error);
      }
    };

  const handleApprove = async (
    proposal
  ) => {
    try {
      if (proposal.status !== "Proposed") {
        alert("Proposal is already decided.");
        return;
      }

      if (
        proposal.proposedBy ===
        auth.currentUser.email
      ) {
        alert(
          "You cannot approve your own proposal."
        );

        return;
      }

      const cycle = cycles.find((c) => c.id === proposal.cycleId);
      if (!cycle) return;

      const approvedProposalsForCycle = proposals.filter(
        (p) => p.cycleId === proposal.cycleId && p.status === "Approved"
      );

      const currentApprovedCost = approvedProposalsForCycle.reduce(
        (sum, p) => sum + Number(p.costOfChange),
        0
      );

      if (currentApprovedCost + Number(proposal.costOfChange) > cycle.totalBudget) {
        const remaining = cycle.totalBudget - currentApprovedCost;
        alert(`Approval blocked! Remaining budget is ₹${remaining}, but this change costs ₹${proposal.costOfChange}.`);
        return;
      }

      const decisionNote = window.prompt("Enter a decision note (optional):");

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

          decisionNote: decisionNote || null,

          decidedAt:
            new Date(),

          updatedAt:
            new Date(),
        }
      );

      alert(
        "Proposal approved"
      );

        // Add functionality to update employee directly if approved immediately (user request)
        const cycleToUpdate = cycles.find((c) => c.id === proposal.cycleId);
        if (cycleToUpdate && cycleToUpdate.status === "Open") {
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
                cycleToUpdate.effectiveDate,
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
                cycleToUpdate.effectiveDate,

              appliedAt:
                new Date(),
            }
          );
        }

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
      if (proposal.status !== "Proposed") {
        alert("Proposal is already decided.");
        return;
      }

      if (
        proposal.proposedBy ===
        auth.currentUser.email
      ) {
        alert(
          "You cannot reject your own proposal."
        );

        return;
      }

      const decisionNote = window.prompt("Enter a decision note (optional):");

      await updateDoc(
        doc(
          db,
          "proposals",
          proposal.id
        ),
        {
          status: "Rejected",

          decidedBy:
            auth.currentUser.email,

          decisionNote: decisionNote || null,

          decidedAt:
            new Date(),

          updatedAt:
            new Date(),
        }
      );

      alert(
        "Proposal rejected"
      );

      fetchProposals();
    } catch (error) {
      console.log(error);
    }
  };

  /* DELETE */

  const handleDeleteProposal =
    async (proposalId) => {
      try {
        const proposal = proposals.find(p => p.id === proposalId);
        if (proposal.status !== "Proposed") {
          alert("Cannot delete a decided proposal.");
          return;
        }

        const cycle = cycles.find(c => c.id === proposal.cycleId);
        if (!cycle || cycle.status !== "Open") {
          alert("Cannot delete proposal for a closed cycle.");
          return;
        }

        await deleteDoc(
          doc(
            db,
            "proposals",
            proposalId
          )
        );

        alert(
          "Proposal deleted"
        );

        fetchProposals();
      } catch (error) {
        console.log(error);
      }
    };

  /* CLOSE CYCLE */

  const handleCloseCycle =
    async (cycle) => {
      try {
        const cycleProposals =
          proposals.filter(
            (p) =>
              p.cycleId ===
              cycle.id
          );

      const unresolved =
        cycleProposals.filter(
          (p) =>
            p.status ===
            "Proposed"
        );

      if (
        unresolved.length > 0
      ) {
        alert(
          `${unresolved.length} unresolved proposal(s)`
        );

        return;
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
    {activeSection ===
      "dashboard" && (
        <div className="glass-card">
          <h1>
            Admin Dashboard
          </h1>

          <p>
            Welcome back,{" "}
            {
              auth.currentUser
                ?.email
            }
          </p>
        </div>
      )}

    {activeSection ===
      "cycles" && (
        <>
          <div className="cycle-form">
            <h2>
              Create Review
              Cycle
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
                key={cycle.id}
                className="cycle-card"
              >
                <h3>
                  {cycle.title}
                </h3>

                <p>
                  Budget: ₹
                  {
                    cycle.totalBudget
                  }
                </p>

                {(() => {
                  const approvedProposalsForCycle = proposals.filter(
                    (p) => p.cycleId === cycle.id && p.status === "Approved"
                  );
                  const currentApprovedCost = approvedProposalsForCycle.reduce(
                    (sum, p) => sum + Number(p.costOfChange),
                    0
                  );
                  return (
                    <>
                      <p>Used: ₹{currentApprovedCost}</p>
                      <p>Remaining: ₹{cycle.totalBudget - currentApprovedCost}</p>
                    </>
                  );
                })()}

                <p>
                  Status:{" "}
                  {
                    cycle.status
                  }
                </p>

                <p>
                  Effective Date:
                  {" "}
                  {
                    cycle.effectiveDate
                  }
                </p>

                {cycle.status ===
                  "Open" && (
                    <button
                      style={{
                        marginTop:
                          "15px",
                      }}
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

    {activeSection ===
      "proposals" && (
        <>
          <div className="cycle-form">
            <h2>
              Create Proposal
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

            {/* CURRENT SALARY DISPLAY */}

            {selectedEmployeeData && (
              <div className="glass-card">
                <p>
                  <strong>
                    Current Salary:
                  </strong>{" "}
                  ₹
                  {
                    selectedEmployeeData.currentSalary
                  }
                </p>

                <p>
                  <strong>
                    Effective Date:
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

              {cycles
                .filter(
                  (cycle) =>
                    cycle.status ===
                    "Open"
                )
                .map((cycle) => (
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
                ))}
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
                Market Adjustment
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
                  key={
                    proposal.id
                  }
                  className="cycle-card"
                >
                  <h3>
                    {
                      proposal.employeeEmail
                    }
                  </h3>

                  <p>
                    Type:{" "}
                    {
                      proposal.changeType
                    }
                  </p>

                  <p>
                    Current Salary:
                    ₹
                    {
                      proposal.currentSalarySnapshot
                    }
                  </p>

                  <p>
                    Proposed Salary:
                    ₹
                    {
                      proposal.proposedNewSalary
                    }
                  </p>

                  <p>
                    Cost: ₹
                    {
                      proposal.costOfChange
                    }
                  </p>

                  <p>
                  Status:{" "}
                  <span className={proposal.status === "Approved" ? "status-approved" : proposal.status === "Rejected" ? "status-rejected" : "status-proposed"}>
                    {
                      proposal.status
                    }
                  </span>
                  </p>

                  <p>
                    Proposed By:{" "}
                    {proposal.proposedBy}
                  </p>

                  <p>
                    Created At:{" "}
                    {proposal.createdAt && new Date(proposal.createdAt.seconds * 1000).toLocaleDateString()}
                  </p>

                  {proposal.decisionNote && (
                    <div style={{ padding: "10px", marginTop: "10px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                      <strong>Note from {proposal.decidedBy}:</strong>
                      <p>{proposal.decisionNote}</p>
                    </div>
                  )}

                  <div
                    style={{
                      display:
                        "flex",

                      gap: "10px",

                      flexWrap:
                        "wrap",

                      marginTop:
                        "15px",
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
                          proposal.id
                        )
                      }
                    >
                      Delete
                    </button>

                    <button
                      onClick={() => {
                        setEditingProposalId(
                          proposal.id
                        );

                        setEditNewSalary(
                          proposal.proposedNewSalary
                        );

                        setEditChangeType(
                          proposal.changeType
                        );

                        setEditJustification(
                          proposal.justification
                        );
                      }}
                    >
                      Edit
                    </button>
                  </div>

                  {editingProposalId ===
                    proposal.id && (
                      <div
                        className="glass-card"
                        style={{
                          marginTop:
                            "20px",
                        }}
                      >
                        <select
                          value={
                            editChangeType
                          }
                          onChange={(
                            e
                          ) =>
                            setEditChangeType(
                              e
                                .target
                                .value
                            )
                          }
                        >
                          <option>
                            Salary
                            Increase
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
                          value={
                            editNewSalary
                          }
                          onChange={(
                            e
                          ) =>
                            setEditNewSalary(
                              e
                                .target
                                .value
                            )
                          }
                        />

                        <textarea
                          value={
                            editJustification
                          }
                          onChange={(
                            e
                          ) =>
                            setEditJustification(
                              e
                                .target
                                .value
                            )
                          }
                        />

                        <button
                          onClick={() =>
                            handleEditProposal(
                              proposal.id
                            )
                          }
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                </div>
              )
            )}
          </div>
        </>
      )}

    {activeSection ===
      "filters" && (
        <>
          <div className="glass-card">
            <h2>
              Filters &
              Sorting
            </h2>

            <div className="filters-bar">
              <select
                value={
                  filterStatus
                }
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value
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
                placeholder="Employee"
                value={
                  filterEmployee
                }
                onChange={(e) =>
                  setFilterEmployee(
                    e.target.value
                  )
                }
              />

              <select
                value={
                  filterChangeType
                }
                onChange={(e) =>
                  setFilterChangeType(
                    e.target.value
                  )
                }
              >
                <option value="">
                  All Types
                </option>

                <option value="Salary Increase">
                  Salary Increase
                </option>

                <option value="Promotion">
                  Promotion
                </option>

                <option value="Market Adjustment">
                  Market Adjustment
                </option>
              </select>

              <select
                value={
                  sortField
                }
                onChange={(e) =>
                  setSortField(
                    e.target.value
                  )
                }
              >
                <option value="createdAt">
                  Created Date
                </option>

                <option value="cost">
                  Cost
                </option>

                <option value="employee">
                  Employee
                </option>
              </select>

              <select
                value={
                  sortOrder
                }
                onChange={(e) =>
                  setSortOrder(
                    e.target.value
                  )
                }
              >
                <option value="desc">
                  Desc
                </option>

                <option value="asc">
                  Asc
                </option>
              </select>
            </div>
          </div>

          <div className="cycles-list">
            {paginatedProposals.map(
              (proposal) => (
                <div
                  key={
                    proposal.id
                  }
                  className="cycle-card"
                >
                  <h3>
                    {
                      proposal.employeeEmail
                    }
                  </h3>

                  <p>
                    Type:{" "}
                    {
                      proposal.changeType
                    }
                  </p>

                  <p>
                    Current Salary:
                    ₹
                    {
                      proposal.currentSalarySnapshot
                    }
                  </p>

                  <p>
                    Proposed Salary:
                    ₹
                    {
                      proposal.proposedNewSalary
                    }
                  </p>

                  <p>
                    Cost: ₹
                    {
                      proposal.costOfChange
                    }
                  </p>

                  <p>
                    Status:{" "}
                    {
                      proposal.status
                    }
                  </p>
                </div>
              )
            )}
          </div>

          <div className="pagination">
            <button
              disabled={
                currentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  currentPage - 1
                )
              }
            >
              Previous
            </button>

            <span>
              Page{" "}
              {currentPage} of{" "}
              {totalPages}
            </span>

            <button
              disabled={
                currentPage ===
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  currentPage + 1
                )
              }
            >
              Next
            </button>
          </div>
        </>
      )}
  </div>
  );
}
