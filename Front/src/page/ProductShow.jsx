import { useEffect, useState } from "react";
import ProductGrid from "../component/ProductGrid";
import ProductModal from "../component/ProductModal.jsx";
import Searchbar from "../component/SearchBar.jsx";
import { getCategories } from "../api/categories.js";


import Imglogo1 from "../assets/logo1.png";
import Imglogo2 from "../assets/logo2.png";
import Imglogo3 from "../assets/logo3.png";
import Imglogo4 from "../assets/logo4.png";
import Navbar from "../layout/Navbar..jsx";

export default function ProductShow() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectProduct, setSelectProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                if (Array.isArray(data)) {
                    setCategories(data);
                } else if (data && Array.isArray(data.data)) {
                    setCategories(data.data);
                } else if (data && Array.isArray(data.categories)) {
                    setCategories(data.categories);
                } else {
                    setCategories([]);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 pb-16">

            <Navbar />
            
            {/* 1. Hero Banner ด้านบนสุด */}
            <div className=" bg-black text-white py-12 px-6 md:px-16 mb-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
                <div className="max-w-xl px-15 z-10">
                    <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Buy Now</span>
                    <h1 className="text-3xl md:text-5xl font-bold mt-2 mb-4">A Collection of Luxury Watches</h1>
                    <p className="text-gray-300 text-sm md:text-base mb-6">นาฬิกาหรู ดีไซน์สวย  พร้อมบริการที่คุณวางใจ</p>
                    
                </div>
                {/* โลโก้แบรนด์ด้านบนสุด (ปรับให้เป็นสีขาวสะอาดตา) */}
               <div className="px-60 flex gap-20">
                    <img src={Imglogo1} alt="Brand 1" className="h-12 md:h-20 w-auto object-contain brightness-0 invert" />
                    <img src={Imglogo2} alt="Brand 2" className="h-12 md:h-20 w-auto object-contain brightness-0 invert" />
                    <img src={Imglogo3} alt="Brand 3" className="h-12 md:h-20 w-auto object-contain brightness-0 invert" />
                    <img src={Imglogo4} alt="Brand 4" className="h-12 md:h-20 w-auto object-contain brightness-0 invert" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8">
                
                {/* 2. Search Bar ตรงกลาง */}
                <div className="mb-8 flex justify-center">
                    <div className="w-full max-w-2xl">
                        <Searchbar 
                            onSearch={(keyword) => setSearchQuery(keyword)} 
                            placeholder="ค้นหานาฬิกา รุ่น แบรนด์ หรือประเภท..."
                        />
                    </div>
                </div>

                {/* Main Content Layout (Sidebar ซ้าย + Product Grid ขวา) */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    
                    {/* Category Sidebar (ฝั่งซ้าย) */}
                    <aside className="w-full md:w-64 shrink-0 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 md:sticky md:top-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex justify-between items-center">
                            หมวดหมู่
                            <span className="text-xs text-gray-400 font-normal">▼</span>
                        </h3>
                        <div className="flex flex-col gap-1.5">
                            <button
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
                                const categoryValue = cat.id || cat.slug || cat.name;
                                return (
                                    <button
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

                    {/* Product Grid & Content (ฝั่งขวา) */}
                    <div className="flex-1 w-full">
                        <ProductGrid
                            onCardClick={(product) => {
                                setSelectProduct(product);
                                setIsModalOpen(true);
                            }}
                            selectedCategory={selectedCategory}
                            searchQuery={searchQuery}
                            selectedProduct={selectProduct}
                            isModalOpen={isModalOpen}
                            setIsModalOpen={setIsModalOpen}
                        />
                    </div>

                    <ProductModal 
                        product={selectProduct}
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                    />
                </div>
            </div>
        </div>
    );
}