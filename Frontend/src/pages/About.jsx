import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";
import {
  FaHome,
  FaBookOpen,
  FaHeartbeat,
  FaRupeeSign,
  FaBriefcase,
  FaUsers,
  FaHandsHelping,
  FaBullhorn,
} from "react-icons/fa";

const objectiveItems = [
  {
    title: "Safe Housing and Basic Facilities",
    icon: <FaHome />,
  },
  {
    title: "Educational and Vocational Development",
    icon: <FaBookOpen />,
  },
  {
    title: "Physical and Mental Well-being",
    icon: <FaHeartbeat />,
  },
  {
    title: "Life Skills and Financial Literacy",
    icon: <FaRupeeSign />,
  },
  {
    title: "Employment and Self-Reliance",
    icon: <FaBriefcase />,
  },
  {
    title: "Social Inclusion and Dignity",
    icon: <FaUsers />,
  },
  {
    title: "Continuous Support and Mentorship",
    icon: <FaHandsHelping />,
  },
  {
    title: "Social Awareness and Community Sensitization",
    icon: <FaBullhorn />,
  },
];

export default function About() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen support-bg">
        <section className="mx-auto w-full max-w-6xl px-5 py-14">
          <h1 className="heading-display">About Us</h1>

          <section className="mt-10 grid min-h-[118px] grid-cols-[180px_1fr] overflow-hidden rounded-t-xl border border-gray-300 max-md:grid-cols-1">
            <div className="grid place-content-center bg-[#e7e7e7] text-3xl font-medium text-brand-heading">
              Vision
            </div>
            <div className="grid place-content-center bg-[#f4f4f0] px-6 py-4 text-center text-[1.05rem] leading-[1.45] text-brand-secondary">
              To empower every girl who transitions out of institutional care by
              ensuring her access to safety, dignity, and equal opportunities,
              enabling her to become a self-reliant, capable, and confident
              citizen.
            </div>
          </section>

          <section className="grid min-h-[118px] grid-cols-[1fr_180px] overflow-hidden rounded-b-xl border border-t-0 border-gray-300 max-md:grid-cols-1">
            <div className="grid place-content-center bg-[#f4f4f0] px-6 py-4 text-center text-[1.05rem] leading-[1.45] text-brand-secondary">
              To create a safe, nurturing, and joyful space for orphaned,
              abandoned, exploited, and neglected girls transitioning out of
              institutional care at 18, empowering them to lead independent,
              dignified lives through education, healthcare, skills training,
              guidance, and ongoing mentorship.
            </div>
            <div className="grid place-content-center bg-[#e7e7e7] text-3xl font-medium text-brand-heading">
              Mission
            </div>
          </section>

          <section className="mt-10 rounded-xl bg-[#efefef] px-4 py-12">
            <h2 className="heading-display mb-6 text-center">Objectives</h2>

            <div className="mx-auto hidden max-w-[820px] md:block">
              <div className="relative mx-auto h-[760px] w-[760px]">
                <svg
                  viewBox="0 0 100 100"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  aria-hidden="true"
                >
                  <line x1="50" y1="50" x2="20.1" y2="20.1" className="stroke-gray-500" strokeWidth="0.22" />
                  <line x1="50" y1="50" x2="50" y2="16.7" className="stroke-gray-500" strokeWidth="0.22" />
                  <line x1="50" y1="50" x2="79.9" y2="20.1" className="stroke-gray-500" strokeWidth="0.22" />
                  <line x1="50" y1="50" x2="16.7" y2="50" className="stroke-gray-500" strokeWidth="0.22" />
                  <line x1="50" y1="50" x2="83.3" y2="50" className="stroke-gray-500" strokeWidth="0.22" />
                  <line x1="50" y1="50" x2="20.1" y2="79.9" className="stroke-gray-500" strokeWidth="0.22" />
                  <line x1="50" y1="50" x2="50" y2="83.3" className="stroke-gray-500" strokeWidth="0.22" />
                  <line x1="50" y1="50" x2="79.9" y2="79.9" className="stroke-gray-500" strokeWidth="0.22" />
                </svg>

                <div className="absolute left-[65px] top-[65px] flex h-40 w-40 flex-col items-center justify-center rounded-[2.9rem] border-2 border-[#2a1d33] bg-[#8b5aa8] p-4 text-center text-brand-inverse shadow">
                  <span className="mb-2 text-5xl text-brand-inverse">{objectiveItems[0].icon}</span>
                  <p className="text-[1.03rem] leading-tight text-brand-inverse">{objectiveItems[0].title}</p>
                </div>

                <div className="absolute left-1/2 top-[40px] flex h-40 w-40 -translate-x-1/2 flex-col items-center justify-center rounded-[2.9rem] border-2 border-[#2a1d33] bg-[#8b5aa8] p-4 text-center text-brand-inverse shadow">
                  <span className="mb-2 text-5xl text-brand-inverse">{objectiveItems[1].icon}</span>
                  <p className="text-[1.03rem] leading-tight text-brand-inverse">{objectiveItems[1].title}</p>
                </div>

                <div className="absolute right-[65px] top-[65px] flex h-40 w-40 flex-col items-center justify-center rounded-[2.9rem] border-2 border-[#2a1d33] bg-[#8b5aa8] p-4 text-center text-brand-inverse shadow">
                  <span className="mb-2 text-5xl text-brand-inverse">{objectiveItems[2].icon}</span>
                  <p className="text-[1.03rem] leading-tight text-brand-inverse">{objectiveItems[2].title}</p>
                </div>

                <div className="absolute left-[40px] top-1/2 flex h-40 w-40 -translate-y-1/2 flex-col items-center justify-center rounded-[2.9rem] border-2 border-[#2a1d33] bg-[#8b5aa8] p-4 text-center text-brand-inverse shadow">
                  <span className="mb-2 text-5xl text-brand-inverse">{objectiveItems[3].icon}</span>
                  <p className="text-[1.03rem] leading-tight text-brand-inverse">{objectiveItems[3].title}</p>
                </div>

                <div className="absolute right-[40px] top-1/2 flex h-40 w-40 -translate-y-1/2 flex-col items-center justify-center rounded-[2.9rem] border-2 border-[#2a1d33] bg-[#8b5aa8] p-4 text-center text-brand-inverse shadow">
                  <span className="mb-2 text-5xl text-brand-inverse">{objectiveItems[4].icon}</span>
                  <p className="text-[1.03rem] leading-tight text-brand-inverse">{objectiveItems[4].title}</p>
                </div>

                <div className="absolute bottom-[65px] left-[65px] flex h-40 w-40 flex-col items-center justify-center rounded-[2.9rem] border-2 border-[#2a1d33] bg-[#8b5aa8] p-4 text-center text-brand-inverse shadow">
                  <span className="mb-2 text-5xl text-brand-inverse">{objectiveItems[5].icon}</span>
                  <p className="text-[1.03rem] leading-tight text-brand-inverse">{objectiveItems[5].title}</p>
                </div>

                <div className="absolute bottom-[40px] left-1/2 flex h-40 w-40 -translate-x-1/2 flex-col items-center justify-center rounded-[2.9rem] border-2 border-[#2a1d33] bg-[#8b5aa8] p-4 text-center text-brand-inverse shadow">
                  <span className="mb-2 text-5xl text-brand-inverse">{objectiveItems[6].icon}</span>
                  <p className="text-[1.03rem] leading-tight text-brand-inverse">{objectiveItems[6].title}</p>
                </div>

                <div className="absolute bottom-[65px] right-[65px] flex h-40 w-40 flex-col items-center justify-center rounded-[2.9rem] border-2 border-[#2a1d33] bg-[#8b5aa8] p-4 text-center text-brand-inverse shadow">
                  <span className="mb-2 text-5xl text-brand-inverse">{objectiveItems[7].icon}</span>
                  <p className="text-[1.03rem] leading-tight text-brand-inverse">{objectiveItems[7].title}</p>
                </div>

                <div className="absolute left-1/2 top-1/2 flex h-52 w-52 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 border-[#5a2a7a] bg-[#8b5aa8] p-5 text-center text-brand-inverse shadow">
                  <p className="text-[1.85rem] leading-[1.1] text-brand-inverse">
                    Holistic
                    <br />
                    Development
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-auto grid max-w-3xl gap-4 md:hidden">
              <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full border border-[#5a2a7a] bg-[#8b5aa8] p-5 text-center text-brand-inverse shadow">
                <p className="text-xl leading-tight">Holistic Development</p>
              </div>
              <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                {objectiveItems.map((item) => (
                  <div
                    key={item.title}
                    className="flex min-h-[150px] flex-col items-center justify-center rounded-[2rem] border-2 border-[#2a1d33] bg-[#8b5aa8] p-4 text-center text-brand-inverse shadow"
                  >
                    <span className="mb-2 text-4xl">{item.icon}</span>
                    <p className="text-sm leading-tight">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}