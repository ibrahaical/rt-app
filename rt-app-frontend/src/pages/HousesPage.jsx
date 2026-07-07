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

  // Ref untuk melacak apakah komponen masih mounted
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchHouses = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/houses`, { signal });
        if (!res.ok) throw new Error("Gagal mengambil data rumah");
        const json = await res.json();
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

    // Cleanup: batalkan request dan tandai unmounted
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
    let url = `${API_BASE}/houses`;
    let options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    };

    if (editingHouse) {
      url = `${API_BASE}/houses/${editingHouse.id}`;
      options.method = "PUT";
    }

    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error("Gagal menyimpan");
      alert("Data rumah berhasil disimpan!");
      resetForm();
      // Refresh daftar rumah dengan controller baru
      const refreshController = new AbortController();
      const refreshRes = await fetch(`${API_BASE}/houses`, {
        signal: refreshController.signal,
      });
      if (refreshRes.ok && isMounted.current) {
        const json = await refreshRes.json();
        setHouses(json);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus rumah ini?")) return;
    try {
      const res = await fetch(`${API_BASE}/houses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      alert("Rumah berhasil dihapus");
      // Refresh daftar
      const refreshRes = await fetch(`${API_BASE}/houses`);
      if (refreshRes.ok && isMounted.current) {
        const json = await refreshRes.json();
        setHouses(json);
      }
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
            <th>ID</th>
            <th>No. Rumah</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {houses.map((house) => (
            <tr key={house.id}>
              <td>{house.id}</td>
              <td>{house.house_number}</td>
              <td>{house.status === "dihuni" ? "Dihuni" : "Tidak Dihuni"}</td>
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
          <form onSubmit={handleSubmit}>
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
