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

   // รีเซ็ตไปหน้า 1 เมื่อมีการเปลี่ยนหมวดหมู่หรือคำค้นหา
   useEffect(() => {
    setCurrentPage(1);
   }, [selectedCategory, searchQuery]);

   // กรองสินค้าตามหมวดหมู่และคำค้นหา
   const filteredProducts = products.filter((p) => {
      // 1. เช็คหมวดหมู่ (แปลงเป็น String ทั้งคู่เพื่อป้องกันปัญหา Type Mismatch)
      const matchesCategory = 
          selectedCategory === "all" || 
          String(p.category_id || p.categoryId) === String(selectedCategory);

      // 2. เช็คคำค้นหา
      const productName = p.name ? p.name.toLowerCase() : "";
      const query = searchQuery ? searchQuery.trim().toLowerCase() : "";
      const matchesSearch = query === "" || productName.includes(query);

      return matchesCategory && matchesSearch;
   });

   // คำนวณการแบ่งหน้า
   const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
   const indexOfLastItem = currentPage * itemsPerPage;
   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
   const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

   const handlePageChange = (pageNumber) => {
     if (pageNumber >= 1 && pageNumber <= totalPages) {
       setCurrentPage(pageNumber);
       window.scrollTo({ top: 400, behavior: 'smooth' });
     }
   };

   if (loading) return <div className="text-center py-10 text-gray-400">กำลังโหลดสินค้า...</div>;
   if (error) return <div className="text-center py-10 text-red-500">เกิดข้อผิดพลาด: {error}</div>;

   return (
       <div>
         {/* กรณีไม่พบสินค้า */}
         {filteredProducts.length === 0 ? (
           <div className="text-center py-12 text-gray-400">
             ไม่พบสินค้าที่คุณกำลังหาอยู่
           </div>
         ) : (
           /* Grid แสดงสินค้า */
           <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 p-2 sm:p-4">
             {currentProducts.map((product) => (
               <ProductCard
                 key={product.id || product._id}
                 product={product}
                 onCardClick={onCardClick}
               />
             ))}
           </div>
         )}

         {/* แถบ Pagination */}
         {totalPages > 1 && (
           <div className="flex items-center justify-center gap-2 mt-8 mb-6">
             <button
               onClick={() => handlePageChange(currentPage - 1)}
               disabled={currentPage === 1}
               className={`w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition ${
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
                   className={`w-10 h-10 rounded-lg text-sm font-medium transition cursor-pointer ${
                     currentPage === pageNum
                       ? 'bg-red-600 text-white shadow'
                       : 'text-gray-600 hover:bg-gray-100'
                   }`}
                 >
                   {pageNum}
                 </button>
               );
             })}

             <button
               onClick={() => handlePageChange(currentPage + 1)}
               disabled={currentPage === totalPages}
               className={`w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition ${
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