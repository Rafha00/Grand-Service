const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Crect width='500' height='500' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='36' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ProductCard({ product, onCardClick }) {
  const imageUrl =
    product?.Product_Images?.[0]?.image_url?.trim() ||
    product?.image ||
    product?.img ||
    "";

  // availableStock ถูกส่งมาจาก ProductGrid
  // ถ้าไม่มีค่านี้ (undefined) จะไม่ถือว่าสินค้าหมด
  const isOutOfStock =
    typeof product?.availableStock === "number" && product.availableStock <= 0;

  const handleClick = () => {
    if (isOutOfStock) return; // สินค้าหมด: ไม่เปิด modal
    onCardClick?.(product);
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => {
        if (isOutOfStock) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCardClick?.(product);
        }
      }}
      role="button"
      tabIndex={isOutOfStock ? -1 : 0}
      aria-disabled={isOutOfStock}
      className={`w-full min-w-0 h-full bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4 shadow-sm transition-all duration-300 overflow-hidden group flex flex-col ${
        isOutOfStock
          ? "cursor-not-allowed"
          : "cursor-pointer hover:shadow-lg"
      }`}
    >
      {/* Product Image */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-100 rounded-lg sm:rounded-xl mb-3 shrink-0">
        <img
          src={imageUrl || fallbackImage}
          alt={product?.name || "Product image"}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-500 ${
            isOutOfStock
              ? "grayscale opacity-60"
              : "group-hover:scale-105"
          }`}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackImage;
          }}
        />

        {/* Out of stock badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <span className="bg-black/80 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full tracking-wide">
              สินค้าหมด
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex-1 min-w-0">
        {/* Brand */}
        <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-900 mb-1 truncate">
          {product?.brands?.name || product?.brand || "BRAND"}
        </div>

        {/* Product Name */}
        <h3 className="text-xs sm:text-sm text-gray-600 mb-2 font-normal line-clamp-2 min-h-[2.5rem]">
          {product?.name || "ชื่อสินค้า"}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`font-bold text-sm sm:text-base ${
              isOutOfStock ? "text-gray-400" : "text-gray-900"
            }`}
          >
            ฿{Number(product?.price || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Product Tags */}
      <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-gray-100 mt-auto">
        {isOutOfStock && (
          <span className="text-[9px] sm:text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded font-medium">
            สินค้าหมด
          </span>
        )}

        {product?.condition && (
          <span className="text-[9px] sm:text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
            {product.condition}
          </span>
        )}

        {product?.warranty && (
          <span className="text-[9px] sm:text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
            Warranty: {product.warranty}
          </span>
        )}
      </div>
    </div>
  );
}