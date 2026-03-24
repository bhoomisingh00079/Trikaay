import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";

export default function Contact() {
  return (
    <>
      <Navbar />

      <main className="px-6 py-16 text-lg leading-7">
        <section className="mx-auto max-w-6xl">
          <h1 className="text-center text-4xl font-bold text-slate-900">Contact Us Page</h1>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}