import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";
import { FaPhone, FaEnvelope } from "react-icons/fa6";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function Contact() {
  const swapnalayaLocation = {
    // Exact Swapnalaya children's home for girls location from Google Maps link
    lat: 18.980835,
    lng: 73.1189057,
    address: "Swapnalaya children's home for girls, Old Panvel, Navi Mumbai - 410206",
    zoom: 15
  };

  const contactInfo = {
    phone: "+91 82913 05959",
    email: "info@trikay.org",
    addressMain: "Registered Office - A-00 Bhuvaneshwar Plaza, Shree Samarth Nagar, Bhuvaneshwar, Tal.Roha, Dist. Raigad, 402109, Maharashtra",
    addressSwapnalaya: "102, First Floor, National Galaxy, opposite Moraj Auto Stop on Takka Road, Takka Gaon, Old Panvel, Navi Mumbai - 410206",
    addressSwayamsiddha: "Sector 18, New Panvel, Raigad, 402109, Maharashtra"
  };

  return (
    <>
      <Navbar />

      <main className="support-bg px-6 py-16 text-brand-primary">
        <section className="mx-auto max-w-6xl space-y-10">
          <div className="text-center">
            <h1 className="heading-page">Contact Us</h1>
            <p className="caption-copy mt-2">Your request is received. Reach our office locations, phone, and email directly.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6 rounded-xl border border-slate-200 bg-slate-50 p-7 shadow-sm">
              <div>
                <h2 className="text-2xl font-bold text-brand-heading">Main Address</h2>
                <p className="mt-2 text-lg font-semibold">Registered Office - A-00</p>
                <p>Bhuvaneshwar Plaza</p>
                <p>Shree Samarth Nagar, Bhuvaneshwar, Tal.Roha</p>
                <p>Dist. Raigad, 402109, Maharashtra</p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-brand-heading">Swapnalaya Address</h2>
                <p className="mt-2">102, First Floor, National Galaxy</p>
                <p>Opposite Moraj Auto Stop on Takka Road, Takka Gaon</p>
                <p>Old Panvel, Navi Mumbai - 410206</p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-brand-heading">Swayamsiddha Address</h2>
                <p className="mt-2">Sector 18, New Panvel, Raigad</p>
                <p>402109, Maharashtra</p>
              </div>

              <div className="rounded-xl bg-white p-4">
                <div className="flex items-center gap-3 text-lg font-semibold">
                  <FaPhone className="text-blue-600" />
                  <a href={`tel:${contactInfo.phone.replace(/\D/g, "")}`} className="text-blue-700 hover:underline">
                    {contactInfo.phone}
                  </a>
                </div>
                <div className="mt-3 flex items-center gap-3 text-lg font-semibold">
                  <FaEnvelope className="text-blue-600" />
                  <a href={`mailto:${contactInfo.email}`} className="text-blue-700 hover:underline">
                    {contactInfo.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-brand-heading">Location Map (Swapnalaya)</h2>
              <div className="h-[360px] w-full overflow-hidden rounded-xl">
                <MapContainer center={[swapnalayaLocation.lat, swapnalayaLocation.lng]} zoom={swapnalayaLocation.zoom} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[swapnalayaLocation.lat, swapnalayaLocation.lng]}>
                    <Popup>
                      <strong>Swapnalaya</strong>
                      <br />{swapnalayaLocation.address}
                      <br />{contactInfo.phone}
                      <br />{contactInfo.email}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-100 p-5 text-center">
            <h3 className="text-xl font-bold text-brand-heading">Social</h3>
            <p className="caption-copy mt-2">Facebook / Instagram / YouTube / LinkedIn links are pending, as requested.</p>
          </div>
        </section>
      </main>

      <SiteFooter  />
    </>
  );
}