import ProductCard from "./ProductCard";
import { useEffect, useState } from "react";
import { getProducts } from "../api/productAPI.js";

export default function ProductGrid({ 
    selectedCategory, 
    searchQuery, 
    onCardClick, 
}) {
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 8;

   const [sortBy, setSortBy] = useState("recommended");

   useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const result = await getProducts();
                const productsData = result?.products || result?.data || result;
                setProducts(Array.isArray(productsData) ? productsData : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
   }, []);

   useEffect(() => {
    setCurrentPage(1);
   }, [selectedCategory, searchQuery, sortBy]);

   // 1. กรองสินค้าตามหมวดหมู่และคำค้นหาให้ถูกต้อง
   const filteredProducts = products.filter((p) => {
      const matchesCategory = 
          selectedCategory === "all" || 
          String(p.category_id || p.categoryId) === String(selectedCategory);

      const productName = p.name ? p.name.toLowerCase() : "";
      const query = searchQuery ? searchQuery.trim().toLowerCase() : "";
      const matchesSearch = query === "" || productName.includes(query);

      return matchesCategory && matchesSearch;
   });

   // 2. นำสินค้าที่กรองแล้วมาทำการเรียงลำดับ (Sorting) ตาม sortBy
   const sortedProducts = [...filteredProducts].sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;

      if (sortBy === "low-high") {
          return priceA - priceB; // ราคา: ต่ำไปสูง
      } else if (sortBy === "high-low") {
          return priceB - priceA; // ราคา: สูงไปต่ำ
      }
      return 0; // แนะนำ / ค่าเริ่มต้น
   });

   const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
   const indexOfLastItem = currentPage * itemsPerPage;
   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
   const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);

   const handlePageChange = (pageNumber) => {
     if (pageNumber >= 1 && pageNumber <= totalPages) {
       setCurrentPage(pageNumber);
       window.scrollTo({ top: 300, behavior: 'smooth' });
     }
   };

   if (loading) return <div className="text-center py-16 text-gray-400">กำลังโหลดสินค้า...</div>;
   if (error) return <div className="text-center py-16 text-red-500">เกิดข้อผิดพลาด: {error}</div>;

   return (
       <div>
          {/* แถบหัวข้อรายการสินค้าและตัวเรียงลำดับ */}
          <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <span className="text-sm font-semibold text-gray-700">
                  ทั้งหมด {sortedProducts.length} รายการ
              </span>
              <div className="flex items-center gap-2 text-sm text-gray-500  ">
                  <span>เรียงตาม:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 outline-none cursor-pointer"
                  >
                      <option value="recommended">แนะนำ</option>
                      <option value="low-high">ราคา: ต่ำไปสูง</option> 
                      <option value="high-low">ราคา: สูงไปต่ำ</option>
                  </select>
              </div>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="text-center py-16 text-black bg-white rounded-2xl border border-gray-100 shadow-sm">
               ไม่พบสินค้าที่คุณกำลังหาอยู่
            </div>
          ) : (
            /* Grid แสดงสินค้า 4 คอลัมน์ */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {currentProducts.map((product) => (
                 <ProductCard
                   key={product.id || product._id}
                   product={product}
                   onCardClick={onCardClick}
                 />
               ))}
            </div>
          )}

          {/* แถบ Pagination แบบคลีนๆ */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-10 mb-6">
               <button
                 onClick={() => handlePageChange(currentPage - 1)}
                 disabled={currentPage === 1}
                 className={`w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition ${
                   currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                 }`}
               >
                 &lt;
               </button>

               {Array.from({ length: totalPages }, (_, index) => {
                 const pageNum = index + 1;
                 return (
                   <button
                     key={pageNum}
                     onClick={() => handlePageChange(pageNum)}
                     className={`w-9 h-9 rounded-lg text-sm font-medium transition cursor-pointer ${
                       currentPage === pageNum
                         ? 'bg-gray-900 text-white shadow-sm'
                         : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                     }`}
                   >
                     {pageNum}
                   </button>
                 );
               })}

               <button
                 onClick={() => handlePageChange(currentPage + 1)}
                 disabled={currentPage === totalPages}
                 className={`w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition ${
                   currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                 }`}
               >
                 &gt;
               </button>
            </div>
          )}
       </div>
   );
}