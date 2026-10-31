const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Crect width='500' height='500' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='42' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ProductCard({ product, onCardClick }) {
    const imageUrl = product.Product_Images?.[0]?.image_url?.trim() || "";
     
   return (
      <div 
        onClick={() => onCardClick && onCardClick(product)} 
        // ปรับตรง className ให้มีขอบสีชมพูอ่อน rounded-2xl และเงา (shadow) แบบในภาพตัวอย่าง
        className="cursor-pointer bg-[#ebedef] rounded-2xl border border-[#FF6F00] p-3 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group flex flex-col"
      >
        {/* รูปภาพสินค้า */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-xl">
          <img
            src={imageUrl || fallbackImage}
            alt={product.name || "Product image"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={(e) => {
              if (e.currentTarget.src !== fallbackImage) {
                e.currentTarget.src = fallbackImage;
              }
            }}
          />
        </div>

       
       <div className="pt-3 px-1 flex flex-col items-start flex-1 justify-between ">
            <div>
              {/* แบรนด์ (จำลองตัวอย่างป้ายสีชมพูอ่อน หรือข้อความธรรมดา) */}
              {product.brands?.name && (
                <span className="inline-block mr-2 px-2 py-0.5 text-[14px] font-semibold text-white bg-black rounded-md">
                  {product.brands.name}
                </span>
             
               
              )}  

            
              <span className="text-sm  inline-block bg-gray-400 rounded-md px-1">Warranty: {product.warranty}</span>
              
              {/* ชื่อสินค้า */}
              
           </div>
           
           
        </div>

        <div className="line-clamp-2 text-[20px] font-bold text-black group-hover:text-blue-500 mt-3">
                {product.name}
              </div> 
        
                        <div className="mt-3 flex items-center justify-between gap-1">
                    {/* ราคา */}
                    <span className="font-semibold text-black truncate">
                      THB {product.price?.toLocaleString() || 0}
                    </span>

                    <span className="text-sm text-gray-500">
                      สินค้า: {product.condition}
                    </span>
                  </div>
      </div>
    )
}