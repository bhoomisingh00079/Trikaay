import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";
import VolunteerForm from "../components/VolunteerForm";

export default function Volunteers() {
  return (
    <>
      <Navbar />

      <main className="px-6 py-16 bg-slate-50">
        <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-lg">

          <h1 className="text-center text-4xl font-bold text-slate-900">
            Volunteers
          </h1>

          <p className="mt-6 text-center text-lg text-slate-600 max-w-2xl mx-auto">
            Thank you for your interest in volunteering with us. Fill the form below to get started.
          </p>

          <div className="mt-8 rounded-xl bg-indigo-50 p-5 text-indigo-700">
            <ul className="list-disc pl-5 space-y-1">
              <li>Complete the volunteer form</li>
              <li>Our team will review your application</li>
              <li>You will receive confirmation via email</li>
            </ul>
          </div>

          {/* 🔥 Form Section */}
          <div className="mt-12">
            <div className="rounded-2xl bg-slate-50 border p-6 sm:p-8 shadow-inner">
              <VolunteerForm />
            </div>
          </div>

        </section>
      </main>

      <SiteFooter />
    </>
  );
}