import React, { useState, useEffect } from "react";
import api from "../api";

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    expense_date: "",
    description: "",
  });

  const fetchExpenses = () => {
    api
      .get("/expenses")
      .then((res) => setExpenses(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/expenses", formData);
      alert("Pengeluaran berhasil dicatat!");
      setFormData({ title: "", amount: "", expense_date: "", description: "" });
      fetchExpenses();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan pengeluaran.");
    }
  };

  return (
    <div>
      <h3>Kelola Pengeluaran Kas RT</h3>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "15px",
          marginBottom: "20px",
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label>Judul Pengeluaran: </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Nominal (Rp): </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              required
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Tanggal: </label>
            <input
              type="date"
              value={formData.expense_date}
              onChange={(e) =>
                setFormData({ ...formData, expense_date: e.target.value })
              }
              required
            />
          </div>
          <button type="submit">Simpan Pengeluaran</button>
        </form>
      </div>

      <table
        border="1"
        cellPadding="8"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Judul Pengeluaran</th>
            <th>Nominal</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id}>
              <td>{exp.expense_date}</td>
              <td>{exp.title}</td>
              <td>Rp {parseInt(exp.amount).toLocaleString("id-ID")}</td>
            </tr>
          ))}
          {expenses.length === 0 && (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                Belum ada pengeluaran.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExpensesPage;
