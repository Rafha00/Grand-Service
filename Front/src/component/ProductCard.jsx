const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Crect width='500' height='500' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='36' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ProductCard({ product, onCardClick }) {
    const imageUrl = 
        product?.Product_Images?.[0]?.image_url?.trim() || 
        product?.image || 
        product?.img || 
        "";
     
   return (
      <div 
        onClick={() => onCardClick && onCardClick(product)} 
        className="cursor-pointer bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col justify-between relative"
      >
        {/* รูปภาพสินค้า */}
       
          <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-xl mb-3">
            <img
              src={imageUrl || fallbackImage}
              alt={product?.name || "Product image"}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              onError={(e) => {
                if (e.currentTarget.src !== fallbackImage) {
                  e.currentTarget.src = fallbackImage;
                }
              }}
            />
          </div>

        <div>
          {/* แบรนด์สินค้า */}
          <div className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">
            {product?.brands?.name || product?.brand || "BRAND"}
          </div>
          
          {/* ชื่อสินค้า */}
          <h3 className="line-clamp-1 text-sm text-gray-600 mb-2 font-normal">
            {product?.name || "ชื่อสินค้า"}
          </h3> 

          {/* ราคา */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-gray-900 text-base">
              ฿{product?.price ? Number(product.price).toLocaleString() : 0}
            </span>
          </div>

          
         
        </div>

        {/* ป้ายแท็กสถานะ/หมวดหมู่ด้านล่าง */}
        <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100 mt-auto">
          {product?.condition && (
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
              {product.condition}
            </span>
          )}
          {product?.warranty && (
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
              Warranty: {product.warranty}
            </span>
          )}
        </div>
      </div>
   );
}