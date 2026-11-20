import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../layout/Navbar.jsx';


const services = [
  {
    title: 'การดูแลกลไก (Movement servicing)',
    text: 'ถอดแยกชิ้นส่วนทั้งหมด ล้างด้วยคลื่นอัลตราโซนิก หยอดน้ำมันหล่อลื่นใหม่ และตั้งเวลาให้เที่ยงตรงสำหรับกลไกไขลานและออโตเมติก',
  },
  {
    title: 'การทดสอบการกันน้ำ (Water-resistance testing)',
    text: 'ทดสอบแรงดันและเปลี่ยนยางกันน้ำ (gasket) เพื่อให้นาฬิกาดำน้ำของคุณพร้อมใช้งานตามระดับความลึกที่ออกแบบไว้',
  },
  {
    title: 'การตรวจสอบของแท้ (Authentication)',
    text: 'ตรวจสอบตัวเรือน หน้าปัด และกลไกโดยช่างนาฬิกาที่ได้รับการรับรอง พร้อมใบรายงานเป็นลายลักษณ์อักษรให้เก็บไว้',
  },
  {
    title: 'การขัดแต่งและฟื้นฟูตัวเรือน (Polishing and case restoration)',
    text: 'ลบรอยขีดข่วนตื้น ๆ ออก โดยยังคงรักษามุมเหลี่ยม (bevels) และผิวปัดด้าน (brushed finishes) เดิมไว้อย่างครบถ้วน',
  },
  {
    title: 'สายนาฬิกาและสายหนัง/ยาง (Bracelet and strap)',
    text: 'ปรับขนาดสาย เปลี่ยนข้อต่อ และติดตั้งสายหนังหรือสายยางเส้นใหม่ให้พอดีกับข้อมือของคุณ',
  },
  {
    title: 'ระบบควอตซ์และเปลี่ยนถ่าน (Quartz and battery)',
    text: 'เปลี่ยนถ่านพร้อมเปลี่ยนซีลใหม่ และตรวจสอบแรงดันก่อนส่งกลับสู่มือคุณ',
  },
];

const steps = [
  {
    title: 'นำนาฬิกาของคุณมาด้วย',
    text: 'นำมาฝากไว้ที่เวิร์กชอปได้เลย เราจะบันทึกสภาพของมันไว้พร้อมถ่ายรูปประกอบ',
  },
  {
    title: 'การตรวจสอบและเสนอราคา',
    text: 'ช่างนาฬิกาจะเปิดตัวเรือนและส่งใบเสนอราคาให้คุณ ไม่มีการเริ่มงานใด ๆ โดยไม่มีการอนุมัติจากคุณ',
  },
  {
    title: 'การซ่อมแซมและการทดสอบ',
    text: 'บริการ แล้วตามด้วยการทดสอบเวลาและความต้านทานน้ำบนโต๊ะทำงาน',
  },
  {
    title: 'รับนาฬิกา',
    text: 'รวบรวมได้พร้อมรายงานบริการและประกัน 12 เดือนสำหรับงานซ่อมแซม',
  },
];

const address = '123 Sukhumvit Rd., Khlong Toei, Bangkok 10110';
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

const MapMockup = () => (
  <svg
    viewBox="0 0 640 440"
    className="w-full h-full block"
    role="img"
    aria-label="Map mockup showing the Grand Service workshop on Sukhumvit Road"
  >
    <rect width="640" height="440" fill="#121214" />

    {/* แม่น้ำ */}
    <path
      d="M-20 360 C120 330 200 420 340 390 S560 330 660 360"
      fill="none"
      stroke="#18222e"
      strokeWidth="46"
    />

    {/* สวน */}
    <rect x="40" y="48" width="150" height="96" rx="10" fill="#13201a" />
    <rect x="470" y="250" width="120" height="70" rx="10" fill="#13201a" />

    {/* บล็อกอาคาร */}
    {[
      [230, 40, 90, 70],
      [340, 40, 110, 70],
      [470, 40, 130, 70],
      [40, 170, 110, 60],
      [170, 170, 100, 60],
      [440, 160, 70, 50],
      [530, 160, 80, 50],
      [40, 260, 120, 60],
      [180, 260, 90, 60],
    ].map(([x, y, w, h], i) => (
      <rect key={i} x={x} y={y} width={w} height={h} rx="4" fill="#19191c" />
    ))}

    {/* ถนนสายรอง */}
    <path d="M205 0 V440" stroke="#232327" strokeWidth="8" />
    <path d="M425 0 V440" stroke="#232327" strokeWidth="8" />
    <path d="M0 125 H640" stroke="#232327" strokeWidth="6" />
    <path d="M0 240 H640" stroke="#232327" strokeWidth="6" />

    {/* ถนนสายหลัก */}
    <path
      d="M-10 190 C160 175 300 215 460 195 S600 180 650 190"
      fill="none"
      stroke="#303036"
      strokeWidth="16"
    />
    <path
      d="M-10 190 C160 175 300 215 460 195 S600 180 650 190"
      fill="none"
      stroke="#4a4a52"
      strokeWidth="1.5"
      strokeDasharray="10 10"
    />

    {/* ป้ายชื่อ */}
    <text x="70" y="182" fill="#6e6e78" fontSize="12" letterSpacing="1">
      Sukhumvit Rd.
    </text>
    <text x="214" y="30" fill="#55555e" fontSize="11">
      Soi 21
    </text>
    <text x="434" y="30" fill="#55555e" fontSize="11">
      Soi 23
    </text>
    <text x="60" y="100" fill="#4f6a58" fontSize="11">
      Benjasiri Park
    </text>
    <text x="250" y="398" fill="#41566b" fontSize="11">
      Chao Phraya River
    </text>

    {/* หมุด */}
    <g transform="translate(320 200)">
      <circle
        r="22"
        fill="#fca5a5"
        opacity="0.18"
        className="motion-safe:animate-ping"
        style={{ transformOrigin: 'center' }}
      />
      <circle r="22" fill="#fca5a5" opacity="0.15" />
      <path
        d="M0 -34 C-13 -34 -22 -24 -22 -12 C-22 4 0 26 0 26 C0 26 22 4 22 -12 C22 -24 13 -34 0 -34Z"
        fill="#fca5a5"
      />
      <circle cx="0" cy="-12" r="8" fill="#0B0B0C" />
    </g>

    {/* ป้ายร้าน */}
    <g transform="translate(352 138)">
      <rect width="132" height="34" rx="8" fill="#0B0B0C" stroke="rgba(252,165,165,0.6)" />
      <text
        x="12"
        y="15"
        fill="#ffffff"
        fontSize="12"
        fontWeight="bold"
        fontFamily="serif"
        letterSpacing="1"
      >
        GRAND SERVICE
      </text>
      <text x="12" y="28" fill="#9b9ba5" fontSize="9">
        Watch workshop
      </text>
    </g>
  </svg>
);

const About = () => {
  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white">
      <Navbar />

      {/* ---------- Hero ---------- */}
      <section className="px-4 md:px-8 lg:px-[150px] pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-[760px]">
          <p className="text-sm tracking-[0.2em] text-blue-300/80 font-light">
            ABOUT GRAND SERVICE
          </p>
          <h1 className="mt-6 text-5xl md:text-7xl font-light leading-[1.15]">
            Grand Service
            <br />
            <span className="font-normal">บริการนาฬิกา ทันใจ</span>
          </h1>
          <p className="mt-8 max-w-[560px] text-lg font-light leading-relaxed text-blue-200/80">
           แกรนด์เซอร์วิสเป็นร้านซ่อมนาฬิกาในกรุงเทพฯ ช่างซ่อมนาฬิกาของเราให้บริการ ซ่อมแซม และตรวจสอบความแท้ของนาฬิกาชั้นดี ตั้งแต่นาฬิกาอัตโนมัติสำหรับใช้ในชีวิตประจำวันไปจนถึงนาฬิกาดำน้ำที่กันน้ำได้หลายพันเมตร
          </p>
          <Link
            to="/product"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-medium text-black shadow-lg transition-colors hover:bg-gray-200"
          >
           เลือกดูสินค้า
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 12h14M13 6l6 6-6 6"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* ---------- Services ---------- */}
      <section className="px-4 md:px-8 lg:px-[150px] py-16 md:py-24 border-t border-white/10">
        <h2 className="text-3xl md:text-5xl font-light">บริการของเรา</h2>
        <p className="mt-4 max-w-[560px] font-light text-gray-400 leading-relaxed">
          ทุกงานซ่อมทำที่โต๊ะช่างนาฬิกาโดยตรง ไม่ส่งต่อให้ที่อื่น
          และคุณจะได้รับใบเสนอราคาแบบคงที่ก่อนเริ่มงาน
        </p>

        <ul className="mt-12 border-t border-white/10">
          {services.map((s) => (
            <li
              key={s.title}
              className="grid gap-2 md:grid-cols-[1fr_1.4fr] md:gap-12 py-7 border-b border-white/10 transition-colors hover:bg-white/[0.02]"
            >
              <h3 className="text-xl font-serif tracking-wide">{s.title}</h3>
              <p className="font-light text-gray-400 leading-relaxed">{s.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Steps ---------- */}
      <section className="px-4 md:px-8 lg:px-[150px] py-16 md:py-24 border-t border-white/10">
        <h2 className="text-3xl md:text-5xl font-light">วิธีการทำงานของบริการ</h2>

        <ol className="mt-12 grid gap-10 md:grid-cols-4 md:gap-8">
          {steps.map((s, i) => (
            <li key={s.title} className="relative md:pr-4">
              <span className="font-serif text-5xl text-red-300/90">{i + 1}</span>
              <h3 className="mt-4 text-lg font-medium">{s.title}</h3>
              <p className="mt-2 font-light text-gray-400 leading-relaxed">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Location ---------- */}
      <section className="px-4 md:px-8 lg:px-[150px] py-16 md:py-24 border-t border-white/10">
        <h2 className="text-3xl md:text-5xl font-light">เยี่ยมชมเวิร์กชอป</h2>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          {/* แผนที่ */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#121214] aspect-[16/11]">
            <MapMockup />
          </div>

          {/* รายละเอียด */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 p-6 md:p-8">
            <dl className="space-y-6">
              <div>
                <dt className="text-sm text-gray-500">Address</dt>
                <dd className="mt-1 font-light leading-relaxed">{address}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Opening hours</dt>
                <dd className="mt-1 font-light leading-relaxed">
                  Monday to Saturday, 08:00 to 17:00
                  <br />
                  Sunday by appointment
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Phone</dt>
                <dd className="mt-1 font-light">
                  <a href="tel:021234567" className="hover:text-red-300 transition-colors">
                    02-123-4567
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="mt-1 font-light">
                  <a
                    href="mailto:service@grandservice.example"
                    className="hover:text-red-300 transition-colors"
                  >
                    service@grandservice.example
                  </a>
                </dd>
              </div>
            </dl>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center gap-3 rounded-full border border-white px-6 py-3 font-medium transition-colors hover:bg-white hover:text-black"
            >
              Open in Google Maps
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 17L17 7M9 7h8v8"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

    
    </div>
  );
};

export default About;