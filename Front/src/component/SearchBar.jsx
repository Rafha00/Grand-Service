import { useState } from 'react';

const SearchBar = ({ onSearch, placeholder }) => {
    const [searchTerm, setSearchTerm] = useState("");

    // เปลี่ยนให้เก็บค่าใน State อย่างเดียว ยังไม่เรียก onSearch ทันที
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(e.target.value);
        if (value === "" && onSearch) {
        onSearch("");
    }
    };

    // จะทำงานก็ต่อเมื่อกดปุ่มค้นหา หรือกด Enter เท่านั้น
    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(searchTerm); // ส่งค่าออกไปค้นหาเมื่อกดปุ่ม
        }
    };

    return (
        <form 
            onSubmit={handleSubmit}
            className="flex items-center w-full max-w-2xl bg-white rounded-full shadow-sm px-6 py-3 border border-neutral-200 focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-100 transition-all"
        >
            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                placeholder={placeholder}
                className="w-full bg-transparent outline-none text-neutral-800 placeholder-neutral-400 text-base pr-4"
            />
            <button 
                type="submit" 
                className="text-neutral-400 hover:text-neutral-700 p-1 transition-colors flex items-center justify-center shrink-0 cursor-pointer bg-red-500 rounded-full w-8 h-8 hover:bg-red-700 "
                aria-label="Search"
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={2.2} 
                    stroke="currentColor" 
                    className="w-5 h-5 text-white"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" 
                    />
                </svg>
            </button>
        </form>
    );
}

export default SearchBar;