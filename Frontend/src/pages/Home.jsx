import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";
import img1 from "../assets/img1.jpg";
import img2 from "../assets/img2.jpg";
import img3 from "../assets/img3.jpg";

export default function Home() {
  const buttonClasses =
    "rounded-full bg-blue-600 px-6 py-2 font-medium text-white transition hover:scale-105 hover:bg-blue-700 hover:shadow-lg";

  const inputClasses = "w-full rounded border border-slate-300 p-3 text-base";

  return (
    <>
      <Navbar />

      <div className="text-lg leading-7">
        <section className="mt-[-10px] grid gap-8 bg-green-100 px-6 pb-10 pt-10 text-center md:grid-cols-3">
          <article className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-md transition hover:shadow-xl">
            <img
              src={img1}
              alt="Education support"
              className="h-64 w-48 rounded-xl object-cover shadow-md transition duration-300 hover:scale-105"
            />
            <p className="text-base leading-relaxed text-gray-700">
              <b>Dreams Without Limits —</b>
              <br />
              Supporting the next generation of female leaders and innovators
              through education.
            </p>
          </article>

          <article className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-md transition hover:shadow-xl">
            <img
              src={img2}
              alt="Direct impact support"
              className="h-64 w-48 rounded-xl object-cover shadow-md transition duration-300 hover:scale-105"
            />
            <p className="text-base leading-relaxed text-gray-700">
              <b>Direct Impact Support —</b>
              <br />
              Transparency is our priority:
              <br />
              every rupee donated goes
              <br />
              straight to community upliftment and essential resources.
            </p>
          </article>

          <article className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-md transition hover:shadow-xl">
            <img
              src={img3}
              alt="Social transformation"
              className="h-64 w-48 rounded-xl object-cover shadow-md transition duration-300 hover:scale-105"
            />
            <p className="text-base leading-relaxed text-gray-700">
              <b>Social Transformation —</b>
              <br />
              Showcasing the measurable progress
              <br />
              of our initiatives in creating a more
              <br />
              equitable society for all.
            </p>
          </article>
        </section>

        <section className="mx-auto max-w-5xl px-10 py-16">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold">About Us</h1>
              <h2 className="mt-1 text-lg font-medium text-gray-600">We are work in India</h2>
            </div>

          
          </div>

          <p className="mt-4 text-base leading-relaxed text-gray-700">
            Trikay Care and Creation Association is registered under section 8
            of the Companies Act, 2013. It is a non-profit organization
            dedicated to creating positive change in the Raigad District of
            Maharashtra. We focus on childcare, education, health, employment,
            finance, and livelihood awareness programs.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-6 bg-purple-300 py-12 text-center md:grid-cols-4">
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">😊</span>
            <h2 className="text-2xl font-bold text-black">754</h2>
            <p className="text-base text-black">Global Supporters</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">🚀</span>
            <h2 className="text-2xl font-bold text-black">675</h2>
            <p className="text-base text-black">Successful Missions</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">👤</span>
            <h2 className="text-2xl font-bold text-black">1248</h2>
            <p className="text-base text-black">Dedicated Volunteers</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">🌍</span>
            <h2 className="text-2xl font-bold text-black">24</h2>
            <p className="text-base text-black">Cities Impacted</p>
          </div>
        </section>

        <section className="mt-[-20px] flex flex-col items-center gap-5 bg-green-50 px-6 py-16 text-center">
          <h1 className="text-3xl font-bold">OUR SHARED MISSION</h1>

          <h2 className="text-2xl font-semibold">
            Compassion in Action:{" "}
            <span className="font-medium text-green-700">Changing Lives Every Day! ✨</span>
          </h2>

          <p className="mt-2 max-w-2xl text-base leading-relaxed text-gray-700">
            “If you knew what I know about the power of giving, you would not
            let a single meal pass without sharing it in some way.”
          </p>

          <button className={buttonClasses}>Donate Now!</button>
        </section>

        <section className="grid gap-10 bg-white px-10 py-16 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 className="mb-2 text-2xl font-bold">Get In Touch Now!</h2>

            <input placeholder="Your Name..." className={inputClasses} />
            <input placeholder="Your Phone No..." className={inputClasses} />
            <input placeholder="Your Email..." className={inputClasses} />
            <input placeholder="Subject..." className={inputClasses} />

            <button className={buttonClasses}>Submit</button>
          </div>

          <div className="flex flex-col justify-center gap-3 rounded-lg bg-gray-100 p-6">
            <h2 className="mb-2 text-2xl font-bold">Client Testimonials</h2>

            <p className="text-base italic text-gray-700">
              “This NGO is a true force for positive change. Their dedication to
              make a difference in the world is really inspiring. Support their
              impactful work today!”
            </p>

            <p className="mt-2 font-semibold text-gray-900">Pritam Singh</p>
            <p className="text-base text-gray-500">- Mumbai</p>
          </div>
        </section>
      </div>

      <SiteFooter showVolunteer />
    </>
  );
}
