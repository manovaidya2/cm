import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";
import * as XLSX from "xlsx";

/* =======================
   Add Patient Form
======================= */
const AddPatientForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    contact: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.age || !formData.contact) {
      alert("❗ Name, Age, and Contact are required");
      return;
    }

    try {
      setLoading(true);
      await onAdd(formData);
      setFormData({ name: "", age: "", contact: "", email: "" });
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="add-patient-form1"
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "500px",
        margin: "auto",
      }}
    >
      <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
      <input name="age" type="number" placeholder="Age" value={formData.age} onChange={handleChange} required />
      <input name="contact" placeholder="Contact" value={formData.contact} onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email (optional)" value={formData.email} onChange={handleChange} />

      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "➕ Add Patient"}
      </button>
    </form>
  );
};

/* =======================
   Patients Section
======================= */
const PatientsSection = ({ patients, fetchData }) => {
  const { user } = useAuth();
  const [selectedPatients, setSelectedPatients] = useState([]);

  /* ---------- Selection ---------- */
  const handleSelect = (id) => {
    setSelectedPatients((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  /* ---------- Delete Selected ---------- */
  const handleDeleteSelected = async () => {
    if (selectedPatients.length === 0) return alert("No patients selected");

    if (!window.confirm("Delete selected patients?")) return;

    try {
      await Promise.all(
        selectedPatients.map((id) =>
          axios.delete(`api/patients/delete/${id}`)
        )
      );
      await fetchData();
      setSelectedPatients([]);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete patients");
    }
  };

  /* ---------- Edit Patient ---------- */
  const handleEdit = async (p) => {
    const name = prompt("Edit Name", p.name);
    const age = prompt("Edit Age", p.age);
    const contact = prompt("Edit Contact", p.contact);
    const email = prompt("Edit Email", p.email || "");

    if (!name || !age || !contact) {
      alert("Name, Age, Contact required");
      return;
    }

    try {
      await axios.put(`api/patients/update/${p._id}`, {
        name,
        age,
        contact,
        email,
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("❌ Update failed");
    }
  };

  /* ---------- Import Excel ---------- */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = new Uint8Array(ev.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        for (const row of rows) {
          if (!row.name || !row.age || !row.contact) continue;

          await axios.post("api/patients/add", row, {
            headers: { username: user?.username },
          });
        }

        await fetchData();
        alert("✅ Patients imported successfully");
      } catch (err) {
        console.error(err);
        alert("❌ Import failed");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      {/* Add Patient */}
      <div className="card">
        <h2>➕ Add New Patient</h2>

        <AddPatientForm
          onAdd={async (data) => {
            await axios.post("api/patients/add", data, {
              headers: { username: user?.username },
            });
            await fetchData();
          }}
        />

        <h4>📁 Import Excel / CSV</h4>
        <input type="file" accept=".csv,.xls,.xlsx" onChange={handleFileUpload} />
      </div>

      {/* Patients Table */}
      <div className="table-card">
        <h2>🧾 Patient Details</h2>

        {user?.role === "admin" && (
          <button onClick={handleDeleteSelected}>🗑️ Delete Selected</button>
        )}

        <table className="patients-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedPatients.length === patients.length && patients.length > 0}
                  onChange={(e) =>
                    setSelectedPatients(e.target.checked ? patients.map((p) => p._id) : [])
                  }
                />
              </th>
              <th>Name</th>
              <th>Age</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan="7">No patients found</td>
              </tr>
            ) : (
              patients.map((p) => (
                <tr key={p._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedPatients.includes(p._id)}
                      onChange={() => handleSelect(p._id)}
                    />
                  </td>
                  <td>{p.name}</td>
                  <td>{p.age}</td>
                  <td>{p.contact}</td>
                  <td>{p.email || "—"}</td>
                  <td>
                    <select
                      value={p.status || "In Progress"}
                      onChange={async (e) => {
                        try {
                          await axios.put(`api/patients/update-status/${p._id}`, {
                            status: e.target.value,
                          });
                          fetchData();
                        } catch {
                          alert("❌ Status update failed");
                        }
                      }}
                    >
                      <option>In Progress</option>
                      <option>Call</option>
                      <option>Ready for Consultation</option>
                      <option>Payment Done</option>
                      <option>Scheduled</option>
                    </select>
                  </td>
                  <td>
                    {user?.role === "admin" && (
                      <>
                        <button onClick={() => handleEdit(p)}>✏️ Edit</button>
                        <button
                          onClick={async () => {
                            if (window.confirm("Delete this patient?")) {
                              await axios.delete(`api/patients/delete/${p._id}`);
                              fetchData();
                            }
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PatientsSection;