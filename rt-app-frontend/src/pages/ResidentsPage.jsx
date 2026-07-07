// src/pages/ResidentsPage.jsx
import { useState, useEffect, useRef } from "react";

const API_BASE = "/api";
const STORAGE_BASE = "http://localhost:8000/storage";

export default function ResidentsPage() {
  const [residents, setResidents] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingResident, setEditingResident] = useState(null);

  const [prevPageUrl, setPrevPageUrl] = useState(null);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Atribut sesuai soal: Nama Lengkap, Foto KTP, Status Penghuni, Telepon, Menikah, + Rumah
  const initialForm = {
    name: "",
    ktp_photo: null,
    resident_type: "tetap",
    phone: "",
    is_married: false,
    house_id: "",
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

  const fetchResidents = async (
    url = `${API_BASE}/residents?page=${currentPage}`,
  ) => {
    try {
      setLoading(true);
      const json = await safeFetchJson(url);
      if (isMounted.current) {
        setResidents(json.data);
        setPrevPageUrl(json.prev_page_url);
        setNextPageUrl(json.next_page_url);
        setCurrentPage(json.current_page);
        setLastPage(json.last_page);
      }
    } catch (err) {
      if (err.name !== "AbortError" && isMounted.current) {
        setError(err.message);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [resResidents, resHouses] = await Promise.all([
          safeFetchJson(`${API_BASE}/residents`, { signal: controller.signal }),
          safeFetchJson(`${API_BASE}/houses`, { signal: controller.signal }),
        ]);

        if (isMounted.current) {
          setResidents(resResidents.data);
          setPrevPageUrl(resResidents.prev_page_url);
          setNextPageUrl(resResidents.next_page_url);
          setCurrentPage(resResidents.current_page);
          setLastPage(resResidents.last_page);
          setHouses(resHouses);
        }
      } catch (err) {
        if (err.name !== "AbortError" && isMounted.current) {
          setError(err.message);
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === "ktp_photo") {
      setForm((prev) => ({ ...prev, ktp_photo: files[0] || null }));
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingResident(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (resident) => {
    setEditingResident(resident);
    setForm({
      name: resident.name || "",
      ktp_photo: null,
      resident_type: resident.resident_type || "tetap",
      phone: resident.phone || "",
      is_married: resident.is_married || false,
      house_id: resident.house_id || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("resident_type", form.resident_type);
    formData.append("phone", form.phone);
    formData.append("is_married", form.is_married ? "1" : "0");
    formData.append("house_id", form.house_id);
    if (form.ktp_photo) {
      formData.append("ktp_photo", form.ktp_photo);
    }

    let url = `${API_BASE}/residents`;
    if (editingResident) {
      url = `${API_BASE}/residents/${editingResident.id}`;
      formData.append("_method", "PUT");
    }

    try {
      const res = await fetch(url, { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ message: "Gagal menyimpan" }));
        throw new Error(err.message || "Gagal menyimpan");
      }
      alert("Data berhasil disimpan!");
      resetForm();
      if (isMounted.current) {
        fetchResidents(`${API_BASE}/residents?page=${currentPage}`);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus data ini?")) return;
    try {
      const res = await fetch(`${API_BASE}/residents/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ message: "Gagal menghapus" }));
        throw new Error(err.message || "Gagal menghapus");
      }
      alert("Data dihapus");
      if (isMounted.current) {
        fetchResidents(`${API_BASE}/residents?page=${currentPage}`);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Data Penghuni</h2>
      <button onClick={openAddForm}>+ Tambah Penghuni</button>

      <table
        border="1"
        cellPadding="8"
        style={{ width: "100%", marginTop: "20px" }}
      >
        <thead>
          <tr>
            <th>Nama</th>
            <th>Foto KTP</th>
            <th>Status Penghuni</th>
            <th>Telepon</th>
            <th>Menikah</th>
            <th>Rumah</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {residents.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>
                {r.ktp_photo && (
                  <img
                    src={`${STORAGE_BASE}/${r.ktp_photo}`}
                    alt="KTP"
                    style={{ width: "50px" }}
                  />
                )}
              </td>
              <td>{r.resident_type === "tetap" ? "Tetap" : "Kontrak"}</td>
              <td>{r.phone}</td>
              <td>{r.is_married ? "Menikah" : "Belum"}</td>
              <td>
                {houses.find((h) => h.id === r.house_id)?.house_number || "-"}
              </td>
              <td>
                <button onClick={() => openEditForm(r)}>Edit</button>
                <button onClick={() => handleDelete(r.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          marginTop: "15px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <button
          disabled={!prevPageUrl}
          onClick={() => fetchResidents(prevPageUrl)}
        >
          &laquo; Previous
        </button>
        <span>
          Halaman {currentPage} dari {lastPage}
        </span>
        <button
          disabled={!nextPageUrl}
          onClick={() => fetchResidents(nextPageUrl)}
        >
          Next &raquo;
        </button>
      </div>

      {showForm && (
        <div
          style={{
            marginTop: "30px",
            border: "1px solid #ccc",
            padding: "15px",
          }}
        >
          <h3>{editingResident ? "Edit Penghuni" : "Tambah Penghuni"}</h3>
          <form onSubmit={handleSubmit}>
            <div>
              <label>Nama Lengkap:</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Foto KTP:</label>
              {editingResident?.ktp_photo && (
                <div>
                  <img
                    src={`${STORAGE_BASE}/${editingResident.ktp_photo}`}
                    alt="current"
                    style={{ width: "80px" }}
                  />
                  <span> (foto saat ini)</span>
                </div>
              )}
              <input
                type="file"
                name="ktp_photo"
                onChange={handleChange}
                accept="image/*"
              />
            </div>
            <div>
              <label>Status Penghuni:</label>
              <select
                name="resident_type"
                value={form.resident_type}
                onChange={handleChange}
              >
                <option value="tetap">Tetap</option>
                <option value="kontrak">Kontrak</option>
              </select>
            </div>
            <div>
              <label>Nomor Telepon:</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  name="is_married"
                  checked={form.is_married}
                  onChange={handleChange}
                />{" "}
                Sudah Menikah
              </label>
            </div>
            <div>
              <label>Rumah:</label>
              <select
                name="house_id"
                value={form.house_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Pilih Rumah --</option>
                {houses.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.house_number} (
                    {h.status === "dihuni" ? "Dihuni" : "Kosong"})
                  </option>
                ))}
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
