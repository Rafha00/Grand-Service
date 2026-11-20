import ProductCard from "./ProductCard.jsx";
import { useEffect, useState } from "react";
import { getProducts } from "../api/productAPI.js";

const normalize = (v) => String(v ?? "").trim().toLowerCase();

// true  = แสดงสินค้าที่ไม่มีสต็อกด้วย (ให้ ProductCard แสดงป้าย "สินค้าหมด")
// false = ซ่อนสินค้าที่ไม่มีสต็อก (เหมือนพฤติกรรมเดิม)
const SHOW_OUT_OF_STOCK = true;

// ปรับ base URL ให้ตรงกับ env
const INVENTORY_BASE_URL = (
  import.meta.env.VITE_INVENTORY_API_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5002"
).replace(/\/+$/, "");

async function fetchAvailableStockMap() {
  try {
    const endpoint = INVENTORY_BASE_URL.endsWith("/api")
      ? `${INVENTORY_BASE_URL}/inventory/stock-map`
      : `${INVENTORY_BASE_URL}/api/inventory/stock-map`;

    const res = await fetch(endpoint);
    if (!res.ok) return {};

    // backend คืนมาเป็น { productId: จำนวนสต็อก } อยู่แล้ว
    const json = await res.json();
    return json && typeof json === "object" && !Array.isArray(json) ? json : {};
  } catch (err) {
    console.error("Error fetching inventory stock:", err);
    return {};
  }
}

export default function ProductGrid({
  selectedCategory = "all",
  searchQuery = "",
  onCardClick,
}) {
  const [products, setProducts] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [sortBy, setSortBy] = useState("recommended");

  // Fetch Products & Inventory Stock
  useEffect(() => {
    const loadProductsAndStock = async () => {
      try {
        setLoading(true);
        setError(null);

        const [result, latestStockMap] = await Promise.all([
          getProducts(),
          fetchAvailableStockMap(),
        ]);

        const productsData = result?.products || result?.data || result;

        setProducts(Array.isArray(productsData) ? productsData : []);
        setStockMap(latestStockMap);
      } catch (err) {
        setError(err.message || "ไม่สามารถโหลดสินค้าได้");
      } finally {
        setLoading(false);
      }
    };

    loadProductsAndStock();
  }, []);

  // Reset Page
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy]);

  // Filter Products (is_active + stock + category + search)
  const filteredProducts = products.filter((p) => {
    const productId = p.id || p._id;

    const matchesActive = p.is_active !== false;

    const availableStock = Number(stockMap[productId] ?? 0);
    const matchesStock = SHOW_OUT_OF_STOCK || availableStock > 0;

    const matchesCategory =
      selectedCategory === "all" ||
      String(p.category_id ?? p.Categories?.id ?? "") ===
        String(selectedCategory);

    const query = normalize(searchQuery);
    const matchesSearch =
      query === "" ||
      [p.name, p.model, p.reference_number, p.movement, p.brands?.name].some(
        (f) => normalize(f).includes(query)
      );

    return matchesActive && matchesStock && matchesCategory && matchesSearch;
  });

  // Sort (สินค้ามีสต็อกมาก่อน สินค้าหมดอยู่ท้ายสุดเสมอ)
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const stockA = Number(stockMap[a.id || a._id] ?? 0);
    const stockB = Number(stockMap[b.id || b._id] ?? 0);

    const isOutOfStockA = stockA <= 0 ? 1 : 0;
    const isOutOfStockB = stockB <= 0 ? 1 : 0;

    // 0 = มีสต็อก (ขึ้นก่อน), 1 = สินค้าหมด (ไปไว้ท้ายสุด)
    if (isOutOfStockA !== isOutOfStockB) {
      return isOutOfStockA - isOutOfStockB;
    }

    const priceA = Number(a.price) || 0;
    const priceB = Number(b.price) || 0;

    if (sortBy === "low-high") return priceA - priceB;
    if (sortBy === "high-low") return priceB - priceA;

    // เรียงสินค้าที่เพิ่มล่าสุดขึ้นก่อน
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentProducts = sortedProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);

      window.scrollTo({
        top: 300,
        behavior: "smooth",
      });
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="text-center py-16 text-gray-400">
        กำลังโหลดสินค้า...
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="text-center py-16 text-red-500">
        เกิดข้อผิดพลาด: {error}
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      {/* Header & Sorting */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 bg-white p-3 sm:p-4 rounded-xl border border-gray-100 shadow-sm">
        <span className="text-sm font-semibold text-gray-700">
          ทั้งหมด {sortedProducts.length} รายการ
        </span>

        <div className="flex items-center justify-between sm:justify-end gap-2 text-sm text-gray-500">
          <span className="shrink-0">เรียงตาม:</span>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 outline-none cursor-pointer"
          >
            <option value="recommended">เพิ่มล่าสุด</option>
            <option value="low-high">ราคา: ต่ำไปสูง</option>
            <option value="high-low">ราคา: สูงไปต่ำ</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-16 px-4 text-black bg-white rounded-2xl border border-gray-100 shadow-sm">
          ไม่พบสินค้าที่คุณกำลังหาอยู่
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 items-stretch">
          {currentProducts.map((product) => {
            const productId = product.id || product._id;
            const availableStock = Number(stockMap[productId] ?? 0);
            const productWithStock = {
              ...product,
              availableStock,
            };

            return (
              <ProductCard
                key={productId}
                product={productWithStock}
                onCardClick={(clickedProduct) => {
                  onCardClick?.({
                    ...productWithStock,
                    ...clickedProduct,
                    availableStock,
                  });
                }}
              />
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-10 mb-6 px-2">
          {/* Previous */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition ${
              currentPage === 1
                ? "opacity-40 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            &lt;
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .filter(
              (pageNum) =>
                pageNum === 1 ||
                pageNum === totalPages ||
                Math.abs(pageNum - currentPage) <= 1
            )
            .map((pageNum, index, array) => (
              <span key={pageNum} className="contents">
                {index > 0 && pageNum - array[index - 1] > 1 && (
                  <span className="px-1 text-gray-400">...</span>
                )}

                <button
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-gray-900 text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              </span>
            ))}

          {/* Next */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition ${
              currentPage === totalPages
                ? "opacity-40 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}