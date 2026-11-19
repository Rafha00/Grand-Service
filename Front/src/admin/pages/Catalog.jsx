import { useSearchParams } from 'react-router-dom';
import Products from './Products';
import Lookup from './Lookup';

const TABS = { products: 'สินค้า', brands: 'แบรนด์', categories: 'หมวดหมู่' };

// หัวหน้า (ชื่อ + ค้นหา + ปุ่มเพิ่ม) อยู่ในแต่ละหน้าย่อย เหมือนหน้าอื่น ส่วนแท็บ สินค้า/แบรนด์/หมวดหมู่ ส่งลงไปแสดงใต้หัว
export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const tab = TABS[params.get('tab')] ? params.get('tab') : 'products';

  const tabs = (
    <div className="mb-6 flex gap-8 border-b border-white/[0.12]">
      {Object.entries(TABS).map(function ([key, label]) {
        return (
          <button
            key={key}
            onClick={function () { setParams(key === 'products' ? {} : { tab: key }); }}
            className={`-mb-px cursor-pointer border-b pb-3 text-sm transition ${
              key === tab ? 'border-white text-white' : 'border-transparent text-neutral-300 hover:text-white'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );

  return tab === 'products' ? <Products tabs={tabs} /> : <Lookup key={tab} kind={tab} tabs={tabs} />;
}
