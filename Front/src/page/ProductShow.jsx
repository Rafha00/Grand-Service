import { useEffect, useState } from "react";
import ProductGrid from "../component/ProductGrid";
import ProductModal from "../component/ProductModal.jsx";
import Searchbar from "../component/SearchBar.jsx";
import { getCategories } from "../api/categories.js";


import Img4k from "../assets/4k.webp"
import Imglogo1 from "../assets/logo1.png"
import Imglogo2 from "../assets/logo2.png"
import Imglogo3 from "../assets/logo3.png"
import Imglogo4 from "../assets/logo4.png"

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
            <div>
                <img src={Img4k} 
                alt="wallpeper"
                className={`w-full h-[300px] object-cover`}/>
               <h1 className="flex mt-15 font-medium text-6xl">Luxury & Premium</h1>
               <p className="mt-5 flex px-10 font-bold text-xl">Perfect for luxury, formal, or high-end mechanical watches—a premium masterpiece </p>
               <p className="font-bold text-xl flex px-10">embodying the ultimate in sophistication and elegance.</p>
                
              <div className="w-full mt-15 bg-black py-8 my-6 border-y border-neutral-800">
      
      {/* 2. Container โลโก้: จัดให้อยู่ตรงกลาง และเว้นระยะห่าง */}
      <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 max-w-7xl mx-2 px-6 ">
        
        {/* รูปโลโก้: กำหนดความสูงเท่ากัน (h-12 ถึง h-16) + ปรับความสว่าง/สีขาวด้วย brightness-0 invert */}
        <img 
          src={Imglogo1} 
          alt="Patek Philippe" 
          className="h-12 md:h-30 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" 
        />
        <img 
          src={Imglogo2} 
          alt="Cartier" 
          className="h-12 md:h-30 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" 
        />
        <img 
          src={Imglogo3} 
          alt="Seiko" 
          className="h-12 md:h-30 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" 
        />
        <img 
          src={Imglogo4} 
          alt="Rolex" 
          className="h-12 md:h-30 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" 
        />

      </div>
    </div>
            </div>
            <div className="my-15  flex justify-center">
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
                                    : "bg-gray-200 text-black hover:bg-blue-500 cursor-pointer"
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
                                            : "bg-gray-200 text-black hover:bg-blue-500 cursor-pointer"
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