import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

const initialForm = {
  cause: "education",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  amount: "",
  transactionId: "",
  adhar: "",
  pan: "",
};

export default function SupportUs() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [certificate, setCertificate] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!form.firstName || !form.lastName || !form.email || !form.amount) {
      setStatus({ type: "error", message: "Please fill all required fields (Name, Email, Amount)." });
      return;
    }

    setIsSubmitting(true);

    try {
      const donationPayload = {
        ...form,
        transactionId: form.transactionId || `TXN_${Date.now()}`,
        paymentStatus: "SUCCESS",
      };

      const response = await fetch(`${API_URL}/donate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donationPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Donation failed. Please try again.");
      }

      const responseData = await response.json();
      setCertificate(responseData.certificate);
      setShowPopup(true);
      setStatus({ type: "success", message: "Donation successful. Certificate is generated and email is queued." });
      resetForm();
    } catch (error) {
      console.error("SupportUs submit error:", error);
      setStatus({ type: "error", message: error.message || "Something went wrong." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    navigate("/");
  };

  const renderCertificate = () => {
    if (!certificate) return null;

    return (
      <section className="mx-auto mt-8 max-w-4xl rounded-xl border border-indigo-200 bg-white p-6 text-center shadow-md">
        <h2 className="mb-4 text-3xl font-bold text-indigo-900">Donation Certificate</h2>
        <p className="text-left text-lg text-brand-primary">
          <strong>Name: </strong> {certificate.name}<br />
          <strong>Cause: </strong> {certificate.cause}<br />
          <strong>Donation Amount: </strong> ₹{certificate.amount}<br />
          <strong>Transaction ID: </strong> {certificate.transactionId}<br />
        </p>
        <p className="mt-4 rounded-md bg-violet-50 p-4 text-left text-base text-brand-primary">
          {certificate.message}
        </p>
        <p className="caption-copy mt-4">A copy has been sent to your email: {certificate.email}</p>
      </section>
    );
  };

  return (
    <>
      <Navbar />

      <main className="min-h-[calc(100vh-3.5rem)] support-bg px-4 py-8 text-brand-primary sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur">
          <h1 className="heading-page mb-4 text-center font-extrabold">Support Us</h1>
          <p className="body-copy mb-6 text-center">
            Please fill the form below to donate. Your donation will be processed securely.
          </p>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="col-span-2">
              <label className="form-label">Select Cause</label>
              <select
                name="cause"
                value={form.cause}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/30 bg-white/80 px-3 py-2 text-brand-primary focus:outline-none"
                required
              >
                <option value="education">Education Support</option>
                <option value="health">Health & Wellness</option>
                <option value="livelihood">Livelihood Training</option>
                <option value="women_empowerment">Women Empowerment</option>
              </select>
            </div>

            <div>
              <label className="form-label">First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Enter first name" className="w-full rounded-lg border border-white/30 bg-white/80 px-3 py-2 text-brand-primary" required />
            </div>
            <div>
              <label className="form-label">Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Enter last name" className="w-full rounded-lg border border-white/30 bg-white/80 px-3 py-2 text-brand-primary" required />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" className="w-full rounded-lg border border-white/30 bg-white/80 px-3 py-2 text-brand-primary" required />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Enter your phone" className="w-full rounded-lg border border-white/30 bg-white/80 px-3 py-2 text-brand-primary" />
            </div>

            <div>
              <label className="form-label">Donation Amount (₹)</label>
              <input type="number" min="1" name="amount" value={form.amount} onChange={handleChange} placeholder="500" className="w-full rounded-lg border border-white/30 bg-white/80 px-3 py-2 text-brand-primary" required />
            </div>
            <div>
              <label className="form-label">Transaction ID (optional)</label>
              <input name="transactionId" value={form.transactionId} onChange={handleChange} placeholder="Leave empty to auto generate" className="w-full rounded-lg border border-white/30 bg-white/80 px-3 py-2 text-brand-primary" />
            </div>

            <div>
              <label className="form-label">Aadhar Card Number</label>
              <input name="adhar" value={form.adhar} onChange={handleChange} placeholder="1234 5678 9012" className="w-full rounded-lg border border-white/30 bg-white/80 px-3 py-2 text-brand-primary" />
            </div>
            <div>
              <label className="form-label">PAN Card Number</label>
              <input name="pan" value={form.pan} onChange={handleChange} placeholder="ABCDE1234F" className="w-full rounded-lg border border-white/30 bg-white/80 px-3 py-2 text-brand-primary" />
            </div>

            {status.message && (
              <div className={`col-span-2 rounded-lg px-3 py-2 ${status.type === "success" ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"}`}>
                {status.message}
              </div>
            )}

            <div className="col-span-2 flex justify-center">
              <button type="submit" disabled={isSubmitting} className="rounded-full bg-blue-800 px-6 py-2 text-brand-inverse transition disabled:cursor-not-allowed disabled:opacity-50">
                {isSubmitting ? "Processing..." : "Donate Now"}
              </button>
            </div>
          </form>

          {renderCertificate()}
        </div>
      </main>

      <SiteFooter />

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center text-brand-heading shadow-lg">
            <h2 className="text-2xl font-bold text-indigo-800">Thank you for supporting us!</h2>
            <p className="caption-copy mt-3 leading-6 text-brand-primary">
              Thanks for supporting us and Certificate will be shared with you on email soon.
            </p>
            <button
              onClick={handlePopupClose}
              className="mt-5 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-2 font-semibold text-brand-inverse"
            >
              Close and go to Home
            </button>
          </div>
        </div>
      )}
    </>
  );
}
