import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../ui';
import Products from './Products';
import Lookup from './Lookup';

const TABS = { products: 'สินค้า', brands: 'แบรนด์', categories: 'หมวดหมู่' };

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const tab = TABS[params.get('tab')] ? params.get('tab') : 'products';

  return (
    <div>
      <PageHeader title="สินค้า" />
      <div className="mb-8 flex gap-8 border-b border-white/[0.08]">
        {Object.entries(TABS).map(function ([key, label]) {
          return (
            <button
              key={key}
              onClick={function () { setParams(key === 'products' ? {} : { tab: key }); }}
              className={`-mb-px cursor-pointer border-b pb-3 text-sm transition ${
                key === tab ? 'border-white text-white' : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      {tab === 'products' ? <Products /> : <Lookup key={tab} kind={tab} />}
    </div>
  );
}
