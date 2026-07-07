import React, { useState, useEffect } from "react";
import api from "../api";

const PaymentsPage = () => {
  const [residents, setResidents] = useState([]);
  const [selectedResident, setSelectedResident] = useState("");
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [selectedBills, setSelectedBills] = useState([]);

  useEffect(() => {
    api.get("/residents").then((res) => setResidents(res.data.data));
  }, []);

  // Fetch tagihan belum lunas setiap kali memilih resident
  useEffect(() => {
    if (selectedResident) {
      api
        .get(`/bills?resident_id=${selectedResident}&status=belum_lunas`)
        .then((res) => setUnpaidBills(res.data))
        .catch((err) => console.error(err));
      setSelectedBills([]); // Reset checkbox
    } else {
      setUnpaidBills([]);
    }
  }, [selectedResident]);

  const handleCheckboxChange = (billId) => {
    setSelectedBills((prev) =>
      prev.includes(billId)
        ? prev.filter((id) => id !== billId)
        : [...prev, billId],
    );
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (selectedBills.length === 0) return alert("Pilih minimal 1 tagihan!");

    // Ambil house_id dari tagihan pertama yang dipilih (asumsi 1 warga 1 rumah aktif)
    const firstSelectedBill = unpaidBills.find(
      (b) => b.id === selectedBills[0],
    );

    try {
      await api.post("/payment-transactions", {
        resident_id: selectedResident,
        house_id: firstSelectedBill.house_id,
        bill_ids: selectedBills,
        notes: "Pembayaran Iuran Kolektif",
      });
      alert("Pembayaran berhasil!");
      setSelectedResident("");
      setUnpaidBills([]);
      setSelectedBills([]);
    } catch (error) {
      console.error(error);
      alert("Pembayaran gagal!");
    }
  };

  const totalAmount = unpaidBills
    .filter((b) => selectedBills.includes(b.id))
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div>
      <h3>Bayar Iuran Warga</h3>
      <div style={{ marginBottom: "20px" }}>
        <label>Pilih Warga: </label>
        <select
          value={selectedResident}
          onChange={(e) => setSelectedResident(e.target.value)}
        >
          <option value="">-- Pilih Warga --</option>
          {residents.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {selectedResident && (
        <form
          onSubmit={handlePayment}
          style={{ border: "1px solid #ccc", padding: "15px" }}
        >
          <h4>Checklist Tagihan Belum Lunas</h4>
          {unpaidBills.length === 0 ? (
            <p>Tidak ada tagihan tertunggak.</p>
          ) : (
            unpaidBills.map((bill) => (
              <div key={bill.id} style={{ marginBottom: "8px" }}>
                <label>
                  <input
                    type="checkbox"
                    value={bill.id}
                    checked={selectedBills.includes(bill.id)}
                    onChange={() => handleCheckboxChange(bill.id)}
                    style={{ marginRight: "10px" }}
                  />
                  {bill.fee_type.name} - Periode {bill.period_month}/
                  {bill.period_year} (Rp {bill.amount.toLocaleString("id-ID")})
                </label>
              </div>
            ))
          )}
          <h4 style={{ color: "blue" }}>
            Total Bayar: Rp {totalAmount.toLocaleString("id-ID")}
          </h4>
          <button type="submit" disabled={selectedBills.length === 0}>
            Simpan Pembayaran
          </button>
        </form>
      )}
    </div>
  );
};

export default PaymentsPage;
