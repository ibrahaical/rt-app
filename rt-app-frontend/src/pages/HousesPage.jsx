// src/pages/HousesPage.jsx
import { useState, useEffect, useRef } from "react";

const API_BASE = "/api";

export default function HousesPage() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHouse, setEditingHouse] = useState(null);

  const initialForm = {
    house_number: "",
    status: "tidak_dihuni",
  };
  const [form, setForm] = useState(initialForm);

  const isMounted = useRef(false);

  const safeFetchJson = async (url, options = {}) => {
    const res = await fetch(url, options);
    if (!res.ok) {
      const contentType = res.headers.get("content-type");
      let errorMessage = `HTTP ${res.status} ${res.statusText}`;
      if (contentType && contentType.includes("application/json")) {
        const errData = await res.json();
        errorMessage = errData.message || JSON.stringify(errData);
      } else {
        const text = await res.text();
        if (text) errorMessage += `: ${text}`;
      }
      throw new Error(errorMessage);
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error(`Response bukan JSON: ${text.substring(0, 100)}`);
    }

    return res.json();
  };

  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();

    const fetchHouses = async () => {
      try {
        setLoading(true);
        const json = await safeFetchJson(`${API_BASE}/houses`, {
          signal: controller.signal,
        });
        if (isMounted.current) {
          setHouses(json);
        }
      } catch (err) {
        if (err.name !== "AbortError" && isMounted.current) {
          setError(err.message);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchHouses();

    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingHouse(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (house) => {
    setEditingHouse(house);
    setForm({
      house_number: house.house_number || "",
      status: house.status || "tidak_dihuni",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/houses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ message: "Gagal menyimpan" }));
        throw new Error(err.message || "Gagal menyimpan");
      }
      alert("Data rumah berhasil disimpan!");
      resetForm();
      const refreshRes = await safeFetchJson(`${API_BASE}/houses`);
      if (isMounted.current) setHouses(refreshRes);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/houses/${editingHouse.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ message: "Gagal menyimpan" }));
        throw new Error(err.message || "Gagal menyimpan");
      }
      alert("Data rumah berhasil diubah!");
      resetForm();
      const refreshRes = await safeFetchJson(`${API_BASE}/houses`);
      if (isMounted.current) setHouses(refreshRes);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus rumah ini?")) return;
    try {
      const res = await fetch(`${API_BASE}/houses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ message: "Gagal menghapus" }));
        throw new Error(err.message || "Gagal menghapus");
      }
      alert("Rumah berhasil dihapus");
      const refreshRes = await safeFetchJson(`${API_BASE}/houses`);
      if (isMounted.current) setHouses(refreshRes);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Data Rumah</h2>
      <button onClick={openAddForm}>+ Tambah Rumah</button>

      <table
        border="1"
        cellPadding="8"
        style={{ width: "100%", marginTop: "20px" }}
      >
        <thead>
          <tr>
            <th>No. Rumah</th>
            <th>Status</th>
            <th>Penghuni Saat Ini</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {houses.map((house) => (
            <tr key={house.id}>
              <td>{house.house_number}</td>
              <td>{house.status === "dihuni" ? "Dihuni" : "Tidak Dihuni"}</td>
              <td>
                {house.current_resident_history
                  ? house.current_resident_history.name
                  : "-"}
              </td>
              <td>
                <button onClick={() => openEditForm(house)}>Edit</button>
                <button onClick={() => handleDelete(house.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div
          style={{
            marginTop: "30px",
            border: "1px solid #ccc",
            padding: "15px",
          }}
        >
          <h3>{editingHouse ? "Edit Rumah" : "Tambah Rumah"}</h3>
          <form onSubmit={editingHouse ? handleEdit : handleSubmit}>
            <div>
              <label>Nomor Rumah:</label>
              <input
                name="house_number"
                value={form.house_number}
                onChange={handleChange}
                required
                placeholder="Contoh: A1"
              />
            </div>
            <div>
              <label>Status:</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="dihuni">Dihuni</option>
                <option value="tidak_dihuni">Tidak Dihuni</option>
              </select>
            </div>
            <div style={{ marginTop: "10px" }}>
              <button type="submit">Simpan</button>
              <button type="button" onClick={resetForm}>
                Batal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
