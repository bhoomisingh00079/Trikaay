import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";

const teamMembers = [
  {
    name: "Shilpa Bambarkar",
    role: "Director",
    image: "https://trikay.org/admin/upload/2110230607244.png",
  },
  {
    name: "Mr. Jayesh Bambarkar",
    role: "Director",
    image: "https://trikay.org/admin/upload/301023033946Untitled%20design.png",
  },
  {
    name: "Mr. Dinesh Mishra",
    role: "Founder",
    image: "https://trikay.org/admin/upload/2110230606323.png",
  },
  {
    name: "Adv. Roshani Thakur",
    role: "Legal Advisor",
    image:
      "https://trikay.org/admin/upload/2212230333068015bbcd-1f63-4025-9075-c60327f1b902.jpeg",
  },
  {
    name: "Mrs. Snehal Jadhav",
    role: "Counsellor",
    image: "https://trikay.org/admin/upload/2110230606422.png",
  },
  {
    name: "Mrs. Shweta Damle",
    role: "Our Mentor",
    image: "https://trikay.org/admin/upload/251023045307Untitled%20design%20(2).png",
  },
  {
    name: "Mr. Santosh Shinde",
    role: "Our Mentor",
    image: "https://trikay.org/admin/upload/251023045319Untitled%20design%20(1).png",
  },
  {
    name: "Porav Enterprises",
    role: "Web Developer Partner",
    image: "https://trikay.org/admin/upload/2110230606526.png",
  },
  {
    name: "Professional Utilities Company",
    role: "Legal & Compliance Partner",
    image: "https://trikay.org/admin/upload/2110230616395.png",
  },
];

export default function OurTeam() {
  const firstRow = teamMembers.slice(0, 5);
  const secondRow = teamMembers.slice(5);

  const cardClasses =
    "group relative w-[160px] cursor-pointer overflow-hidden rounded-2xl border border-[#6b3fa040] bg-[#fab7ff] p-3 text-center shadow-[0_4px_15px_rgba(107,63,160,0.12)] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03] hover:border-[#6b3fa0] hover:shadow-[0_12px_30px_rgba(107,63,160,0.25)] sm:w-[130px] min-[481px]:w-[160px] max-[480px]:w-[110px]";

  const cardImageClasses =
    "mb-2.5 aspect-square w-full rounded-[10px] object-cover shadow-[0_4px_12px_rgba(107,63,160,0.16)] transition-all duration-300 group-hover:-translate-y-[1px] group-hover:shadow-[0_8px_18px_rgba(107,63,160,0.24)] group-hover:outline group-hover:outline-3 group-hover:outline-[#9b59b6] group-hover:outline-offset-3";

  return (
    <>
      <Navbar />

      <div className="support-bg font-sans">

      <section className="w-full bg-white">
        <h1 className="border-b border-gray-300 px-5 py-4 text-[1.8rem] font-bold text-gray-800">
          Our Team
        </h1>
      </section>

      <section className="mx-auto max-w-[1100px] px-5 py-10">
        <div className="relative flex flex-wrap justify-center gap-6 rounded-[18px] bg-gradient-to-b from-[rgba(255,255,255,0.72)] to-[rgba(243,238,251,0.78)] px-2 py-2.5 max-[768px]:gap-4">
          <div className="pointer-events-none absolute inset-[-1px] rounded-[18px] shadow-[inset_0_0_0_1px_rgba(107,63,160,0.06)]" />
          {firstRow.map((member) => (
            <article className={cardClasses} key={member.name}>
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-br from-[#6b3fa0] to-[#9b59b6]" />
              <img
                src={member.image}
                alt={member.name}
                className={cardImageClasses}
                loading="lazy"
              />
              <h2 className="mb-1.5 text-[0.82rem] font-bold leading-[1.3] text-[#2d2d2d] max-[480px]:text-[0.7rem]">
                {member.name}
              </h2>
              <p className="m-0 text-[0.74rem] font-medium tracking-[0.3px] text-[#9b59b6] max-[480px]:text-[0.65rem]">
                {member.role}
              </p>
            </article>
          ))}
        </div>

        <div className="relative mt-7 flex flex-wrap justify-center gap-6 rounded-[18px] bg-gradient-to-b from-[rgba(255,255,255,0.72)] to-[rgba(243,238,251,0.78)] px-2 py-2.5 max-[768px]:gap-4">
          <div className="pointer-events-none absolute inset-[-1px] rounded-[18px] shadow-[inset_0_0_0_1px_rgba(107,63,160,0.06)]" />
          {secondRow.map((member) => (
            <article className={cardClasses} key={member.name}>
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-br from-[#6b3fa0] to-[#9b59b6]" />
              <img
                src={member.image}
                alt={member.name}
                className={cardImageClasses}
                loading="lazy"
              />
              <h2 className="mb-1.5 text-[0.82rem] font-bold leading-[1.3] text-[#2d2d2d] max-[480px]:text-[0.7rem]">
                {member.name}
              </h2>
              <p className="m-0 text-[0.74rem] font-medium tracking-[0.3px] text-[#9b59b6] max-[480px]:text-[0.65rem]">
                {member.role}
              </p>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter  />
      </div>
    </>
  );
}
