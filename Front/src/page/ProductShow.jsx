import { useEffect, useState } from "react";
import ProductGrid from "../component/ProductGrid";
import ProductModal from "../component/ProductModal.jsx";
import Searchbar from "../component/SearchBar.jsx";
import { getCategories } from "../api/categories.js";

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
             console.log("API Response:", data); // <-- เช็คตรงนี้ใน F12 (Console)
             
             // ป้องกันกรณีที่ API ส่งข้อมูลมาเป็น Object ที่มี Array ซ้อนอยู่อีกชั้น
             // เช่น { data: [...] } หรือ { categories: [...] }
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
        <div>
            <div className="my-8 flex justify-center">
                <Searchbar 
                    onSearch={(keyword) => setSearchQuery(keyword)} 
                    placeholder="Search products..."
                />
            </div>

            <div className="flex flex-col items-start md:flex-row gap-6">
                {/* Category Sidebar */}
                <aside className="w-full md:w-48 shrink-0 md:sticky md:top-24">
                    <h3 className="text-sm font-semibold text-white mb-3">หมวดหมู่</h3>
                    <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
                        {/* ปุ่มสำหรับเลือกทั้งหมด (All) */}
                        <button
                            onClick={() => {
                                setSelectedCategory("all");
                                setSearchQuery("");
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors md:text-left ${
                                selectedCategory === "all"
                                    ? "bg-white text-black"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                            All
                        </button>

                       
                        {/* วนลูปสร้างปุ่มตามข้อมูลหมวดหมู่ที่ได้จาก API */}
                        {categories.map((cat) => {
                            // เลือกใช้อักขระระบุหมวดหมู่หลัก (แนะนำ id หรือ slug)
                            const categoryValue = cat.id || cat.slug || cat.name;

                            return (
                                <button
                                    key={categoryValue}
                                    onClick={() => {
                                        setSelectedCategory(categoryValue);
                                        setSearchQuery(""); // <-- เพิ่มบรรทัดนี้ เพื่อเคลียร์คำค้นหาเมื่อคลิกเปลี่ยนหมวดหมู่
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap md:text-left ${
                                        selectedCategory === categoryValue
                                            ? "bg-white text-black"
                                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* Product Grid */}
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
    );
}