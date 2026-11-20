import { useEffect, useState } from "react";

import ProductGrid from "../component/ProductGrid.jsx";
import ProductModal from "../component/ProductModal.jsx";
import Searchbar from "../component/SearchBar.jsx";

import { getCategories } from "../api/categories.js";

import Imglogo1 from "../assets/logo1.png";
import Imglogo2 from "../assets/logo2.png";
import Imglogo3 from "../assets/logo3.png";
import Imglogo4 from "../assets/logo4.png";

import Navbar from "../layout/Navbar.jsx";

export default function ProductShow() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectProduct, setSelectProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ---------- Fetch Categories ----------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.categories)
              ? data.categories
              : [];
        setCategories(list);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // ---------- Brand Logos ----------
  const brandLogos = [
    { src: Imglogo1, alt: "Brand 1" },
    { src: Imglogo2, alt: "Brand 2" },
    { src: Imglogo3, alt: "Brand 3" },
    { src: Imglogo4, alt: "Brand 4" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-16 overflow-x-hidden">
      {/* ---------- Navbar ---------- */}
      <Navbar />

      {/* ---------- Hero Banner ---------- */}
      <section className="bg-black text-white px-5 sm:px-8 md:px-12 lg:px-16 py-10 md:py-14 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12">
          {/* Hero Text */}
          <div className="w-full lg:flex-1 text-center lg:text-left">
            <span className="text-xs sm:text-sm uppercase tracking-widest text-gray-400 font-semibold">
              Buy Now
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-bold mt-3 mb-4 leading-tight">
              A Collection of Luxury Watches
            </h1>

            <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
              นาฬิกาหรู ดีไซน์สวย พร้อมบริการที่คุณวางใจ
            </p>
          </div>

          {/* Brand Logos */}
          <div className="w-full lg:flex-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 items-center justify-items-center gap-8 sm:gap-6 lg:gap-10">
            {brandLogos.map((logo, index) => (
              <div
                key={index}
                className="w-full flex items-center justify-center"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="h-10 sm:h-12 md:h-16 lg:h-14 xl:h-16 max-w-full object-contain brightness-0 invert"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Main Container ---------- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* ---------- Search Bar ---------- */}
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-2xl">
            <Searchbar
              onSearch={(keyword) => setSearchQuery(keyword)}
              placeholder="ค้นหานาฬิกา รุ่น หรือแบรนด์..."
            />
          </div>
        </div>

        {/* ---------- Main Layout ---------- */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
          {/* ---------- Category Sidebar ---------- */}
          <aside className="w-full md:w-64 shrink-0 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 md:sticky md:top-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex justify-between items-center">
              หมวดหมู่
              <span className="text-xs text-gray-400 font-normal">▼</span>
            </h3>

            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                  selectedCategory === "all"
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 cursor-pointer"
                }`}
              >
                ทั้งหมด (All)
              </button>

              {categories.map((cat) => {
                const categoryValue = String(cat.id);
                return (
                  <button
                    type="button"
                    key={categoryValue}
                    onClick={() => {
                      setSelectedCategory(categoryValue);
                      setSearchQuery("");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition truncate ${
                      selectedCategory === categoryValue
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-100 cursor-pointer"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ---------- Product Grid ---------- */}
          <div className="flex-1 min-w-0 w-full">
            <ProductGrid
              onCardClick={(product) => {
                setSelectProduct(product);
                setIsModalOpen(true);
              }}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </main>

      {/* ---------- Product Modal ---------- */}
      <ProductModal
        product={selectProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}