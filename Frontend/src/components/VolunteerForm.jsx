import { useState } from "react";

export default function VolunteerForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    position: "",
    experience: "",
    availability: "",
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.name || !form.phone || !form.email || !form.position || !form.availability) {
      setError("Please fill all required fields.");
      return;
    }

    setError("");
    setSuccess(false); // Reset success state

    try {
      const response = await fetch('http://localhost:5000/api/register-volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        // Reset form
        setForm({
          name: "",
          phone: "",
          email: "",
          position: "",
          experience: "",
          availability: "",
        });
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">Volunteer Registration Form</h2>

      {/* Success */}
      {success && (
        <div className="mb-6 rounded-lg border border-green-300 bg-green-100 p-4 text-green-700">
          Registration successful! We will contact you soon.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <input
          type="text"
          name="name"
          placeholder="Full Name *"
          value={form.name}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
        />

        {/* Phone */}
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number *"
          value={form.phone}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email Address *"
          value={form.email}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
        />

        {/* Position */}
        <input
          type="text"
          name="position"
          placeholder="Role *"
          value={form.position}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
        />

        {/* Experience */}
        <textarea
          name="experience"
          rows="3"
          placeholder="Experience (Optional)"
          value={form.experience}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
        />

        {/* Availability */}
        <select
          name="availability"
          value={form.availability}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="">Select Availability *</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Weekend">Weekend</option>
        </select>

        {/* Button */}
        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white transition hover:bg-indigo-700 hover:scale-[1.02]"
        >
          Submit Registration
        </button>
      </form>
    </div>
  );
}