import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { inventoryApi, productApi } from '../adminApi';
import { PageHeader, FilterBar, Table, Td, RowActions, EditorModal, Field, SearchInput, Combobox, FilterSelect, uniqueOptions, useLoad, useEditor, askRun, confirmRun, toastError, searchRows, inputClass, btnPrimary } from '../ui';
import { useCan } from '../AdminMenuLink';

const STATUSES = { available: 'พร้อมขาย', reserved: 'จองแล้ว', sold: 'ขายแล้ว' };
const STATUS_STYLE = {
  available: 'border-emerald-400/40 text-emerald-300',
  reserved: 'border-amber-300/40 text-amber-200',
  sold: 'border-white/20 text-neutral-300',
};
const empty = { product_id: '', sku: '', serials: [''], status: 'available', location: '' };
const noFilter = { brand: '', category: '', location: '' };
const smallBtn = 'cursor-pointer rounded-full border border-white/15 px-3 py-1.5 text-xs text-neutral-200 transition hover:border-white/50 hover:text-white';

function firstImage(p) {
  const imgs = ((p && p.Product_Images) || []).slice().sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });
  return imgs[0] && imgs[0].image_url;
}

// สร้างเลขต่อเนื่อง เช่น prefix SN, เริ่ม 001, 3 เรือน → SN001 SN002 SN003
function runningNumbers(prefix, start, count) {
  const first = parseInt(start, 10) || 1;
  const width = String(start).length;
  return Array.from({ length: Math.min(Math.max(count, 1), 100) }, function (_, i) { return prefix + String(first + i).padStart(width, '0'); });
}

// ช่อง Serial แบบบรรทัดละเรือน: Enter = ไปช่องถัดไป (ใช้กับเครื่องสแกนบาร์โค้ดได้), วางหลายบรรทัดแตกเป็นหลายช่อง
function SerialList({ list, setList, isTaken }) {
  const refs = useRef([]);
  const [focusAt, setFocusAt] = useState(null);
  const [gen, setGen] = useState(null);

  useEffect(function () {
    if (focusAt != null && refs.current[focusAt]) { refs.current[focusAt].focus(); setFocusAt(null); }
  }, [focusAt, list.length]);

  function put(i, values, focus) {
    const next = list.slice();
    next.splice(i, 1, ...values);
    setList(next.length ? next : ['']);
    setFocusAt(focus);
  }

  function onKeyDown(e, i) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (i < list.length - 1) setFocusAt(i + 1);
      else if (list[i].trim()) put(i, [list[i], ''], i + 1);
    } else if (e.key === 'Backspace' && !list[i] && list.length > 1) {
      e.preventDefault();
      put(i, [], Math.max(0, i - 1));
    }
  }

  function onPaste(e, i) {
    const parts = e.clipboardData.getData('text').split(/[\n,\t]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (parts.length < 2) return;
    e.preventDefault();
    put(i, parts, i + parts.length - 1);
  }

  function addGenerated() {
    const made = runningNumbers(gen.prefix, gen.start, Number(gen.count));
    setList(list.filter(function (s) { return s.trim(); }).concat(made));
    setGen(null);
  }

  return (
    <div>
      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {list.map(function (sn, i) {
          const value = sn.trim();
          const repeated = value && list.findIndex(function (s) { return s.trim() === value; }) < i;
          const bad = value && (repeated || isTaken(value));
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 shrink-0 text-right text-xs text-neutral-400">{i + 1}</span>
              <input
                ref={function (el) { refs.current[i] = el; }}
                value={sn}
                placeholder="Serial"
                onChange={function (e) { const next = list.slice(); next[i] = e.target.value; setList(next); }}
                onKeyDown={function (e) { onKeyDown(e, i); }}
                onPaste={function (e) { onPaste(e, i); }}
                className={`${inputClass} py-2 font-mono ${bad ? 'border-red-400/60' : ''}`}
              />
              {bad && <span className="shrink-0 text-xs text-red-300">{repeated ? 'ซ้ำในรายการ' : 'มีในสต็อกแล้ว'}</span>}
              {list.length > 1 && (
                <button type="button" aria-label="ลบบรรทัดนี้" onClick={function () { put(i, [], null); }}
                  className="shrink-0 cursor-pointer px-1 text-neutral-400 hover:text-red-400"><i className="fa-solid fa-xmark text-xs" /></button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={function () { put(list.length, [''], list.length); }} className={smallBtn}>
          <i className="fa-solid fa-plus mr-1.5 text-[10px]" />เพิ่มช่อง
        </button>
        <button type="button" onClick={function () { setGen(gen ? null : { prefix: 'SN', start: '001', count: 5 }); }} className={smallBtn}>
          <i className="fa-solid fa-list-ol mr-1.5 text-[10px]" />สร้างเลขต่อเนื่อง
        </button>      </div>

      {gen && (
        <div className="mt-3 rounded-xl border border-white/15 bg-black/20 p-3">
          <div className="grid grid-cols-3 gap-2">
            <label className="text-xs text-neutral-300">ขึ้นต้นด้วย<input value={gen.prefix} onChange={function (e) { setGen({ ...gen, prefix: e.target.value }); }} className={`${inputClass} mt-1 py-2 font-mono`} /></label>
            <label className="text-xs text-neutral-300">เริ่มที่เลข<input value={gen.start} onChange={function (e) { setGen({ ...gen, start: e.target.value.replace(/\D/g, '') }); }} className={`${inputClass} mt-1 py-2 font-mono`} /></label>
            <label className="text-xs text-neutral-300">จำนวน<input type="number" min={1} max={100} value={gen.count} onChange={function (e) { setGen({ ...gen, count: e.target.value }); }} className={`${inputClass} mt-1 py-2`} /></label>
          </div>
          <div className="mt-3 flex justify-end">
            <button type="button" onClick={addGenerated} className={smallBtn}>ใส่ในรายการ</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Inventory() {
  const [items, reload] = useLoad(inventoryApi.list);
  const [products] = useLoad(productApi.list);
  const [search, setSearch] = useState('');
  const [params] = useSearchParams();
  const [tab, setTab] = useState(STATUSES[params.get('status')] ? params.get('status') : '');
  const [filter, setFilter] = useState(noFilter);
  const can = useCan();
  const ed = useEditor(empty, function (item) {
    return {
      product_id: item.product_id || '', sku: item.sku || '', serials: [item.serial_number || ''],
      status: item.status || 'available', location: item.location || '',
    };
  });

  const productById = {};
  (products || []).forEach(function (p) { productById[p.id] = p; });
  const all = items || [];
  const unitsOf = function (productId) { return all.filter(function (i) { return i.product_id === productId; }); };
  const countOf = function (list, status) { return list.filter(function (i) { return i.status === status; }).length; };

  const serials = ed.form.serials.map(function (s) { return s.trim(); }).filter(Boolean);
  const ownSerial = ed.isEdit ? (all.find(function (i) { return i.id === ed.id; }) || {}).serial_number : null;
  function isTaken(sn) { return sn !== ownSerial && all.some(function (i) { return i.serial_number === sn; }); }
  const duplicates = serials.filter(function (sn, i) { return isTaken(sn) || serials.indexOf(sn) !== i; });
  const picked = unitsOf(ed.form.product_id);

  function pickProduct(id) {
    ed.setField('product_id', id);
    const previous = unitsOf(id).find(function (i) { return i.sku; });
    if (previous) ed.setField('sku', previous.sku);
  }

  function openAdd(productId) {
    ed.open({});
    if (productId) pickProduct(productId);
  }

  function submit() {
    if (duplicates.length) return toastError(`Serial ซ้ำ: ${[...new Set(duplicates)].join(', ')}`);
    const body = { sku: ed.form.sku, status: ed.form.status, location: ed.form.location };
    if (ed.isEdit) {
      return ed.save(function () { return inventoryApi.update(ed.id, { ...body, serial_number: serials[0] || null }); }, 'แก้ไขสต็อกแล้ว', reload);
    }
    const list = serials.length ? serials : [null];
    return ed.save(function () {
      return Promise.all(list.map(function (sn) { return inventoryApi.create({ ...body, product_id: ed.form.product_id, serial_number: sn }); }));
    }, `เพิ่มเข้าสต็อก ${list.length} เรือนแล้ว`, reload);
  }

  function changeStatus(i, status) {
    askRun('เปลี่ยนสถานะ?', `Serial ${i.serial_number || '-'}: ${STATUSES[i.status] || '-'} → ${STATUSES[status]}`, function () {
      return inventoryApi.update(i.id, { sku: i.sku, serial_number: i.serial_number, location: i.location, status });
    }, 'อัปเดตสถานะแล้ว').then(function (ok) { if (ok) reload(); });
  }

  const productItems = (products || []).map(function (p) {
    return { id: p.id, name: [p.brands && p.brands.name, p.name, p.model].filter(Boolean).join(' · ') };
  });

  const tabs = [['', 'ทั้งหมด', all.length]].concat(Object.entries(STATUSES).map(function ([key, label]) { return [key, label, countOf(all, key)]; }));

  const brandOptions = uniqueOptions(products, function (p) { return p.brand_id; }, function (p) { return p.brands && p.brands.name; });
  const categoryOptions = uniqueOptions(products, function (p) { return p.category_id; }, function (p) { return p.Categories && p.Categories.name; });
  const locationOptions = uniqueOptions(all, function (i) { return i.location; }, function (i) { return i.location; });
  const filtering = filter.brand || filter.category || filter.location;

  function setF(key) {
    return function (v) { setFilter({ ...filter, [key]: v }); };
  }

  const rows = items && searchRows(items.filter(function (i) {
    const p = productById[i.product_id] || {};
    return (!tab || i.status === tab)
      && (!filter.brand || String(p.brand_id) === filter.brand)
      && (!filter.category || String(p.category_id) === filter.category)
      && (!filter.location || i.location === filter.location);
  }), search, function (i) {
    const p = productById[i.product_id] || i.Products || {};
    return `${p.name} ${p.model} ${p.brands ? p.brands.name : ''} ${i.sku} ${i.serial_number} ${i.location}`;
  });

  return (
    <div>
      <PageHeader title="สต็อกสินค้า">
        <SearchInput placeholder="ค้นหาสินค้า / SKU / Serial" value={search} onChange={setSearch} />
        <button onClick={function () { openAdd(); }} className={btnPrimary}>เพิ่มเข้าสต็อก</button>
      </PageHeader>

      <FilterBar tabs={tabs} value={tab} onChange={setTab} onClear={filtering && function () { setFilter(noFilter); }}>
        <FilterSelect value={filter.brand} onChange={setF('brand')} all="ทุกแบรนด์" options={brandOptions} />
        <FilterSelect value={filter.category} onChange={setF('category')} all="ทุกหมวดหมู่" options={categoryOptions} />
        <FilterSelect value={filter.location} onChange={setF('location')} all="ทุกที่เก็บ" options={locationOptions} />
      </FilterBar>

      <Table
        headers={['สินค้า', 'SKU', 'Serial No.', 'สถานะ', 'ที่เก็บ', '']}
        rows={rows}
        renderRow={function (i) {
          const p = productById[i.product_id] || i.Products || {};
          const img = firstImage(p);
          return (
            <>
              <Td>
                <div className="flex items-center gap-3">
                  {img ? <img src={img} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" /> : <div className="h-10 w-10 shrink-0 rounded-lg bg-neutral-800" />}
                  <div>
                    <div className="whitespace-nowrap font-medium">{p.name || `#${i.product_id}`}</div>
                    <div className="text-xs text-neutral-300">{[p.brands && p.brands.name, p.model].filter(Boolean).join(' · ')}</div>
                  </div>
                </div>
              </Td>
              <Td className="whitespace-nowrap text-neutral-300">{i.sku || '-'}</Td>
              <Td className="whitespace-nowrap font-mono">{i.serial_number || <span className="font-sans text-neutral-400">-</span>}</Td>
              <Td>
                <select value={i.status || 'available'} onChange={function (e) { changeStatus(i, e.target.value); }}
                  className={`cursor-pointer rounded-full border bg-transparent px-3 py-1.5 text-xs focus:outline-none [&>option]:bg-[#141416] [&>option]:text-neutral-200 ${STATUS_STYLE[i.status] || STATUS_STYLE.reserved}`}>
                  {Object.entries(STATUSES).map(function ([value, label]) { return <option key={value} value={value}>{label}</option>; })}
                </select>
              </Td>
              <Td className="whitespace-nowrap text-neutral-300">{i.location || '-'}</Td>
              <RowActions
                onAdd={function () { openAdd(i.product_id); }}
                onEdit={function () { ed.open(i); }}
                onDelete={can('deleteStock') && function () { confirmRun(`Serial ${i.serial_number || i.id}`, function () { return inventoryApi.remove(i.id); }, 'ลบรายการแล้ว').then(reload); }}
              />
            </>
          );
        }}
      />

      <EditorModal ed={ed} title="สต็อก" onSubmit={submit}>
        <Field label="สินค้า *">
          <Combobox required disabled={ed.isEdit} items={productItems} value={ed.form.product_id}
            onChange={pickProduct} placeholder="ค้นหาสินค้า" />
          {ed.form.product_id && (
            <p className="mt-2 text-xs text-neutral-300">
              รุ่นนี้มีในสต็อก {picked.length} เรือน
              {picked.length > 0 && ` (พร้อมขาย ${countOf(picked, 'available')} · จองแล้ว ${countOf(picked, 'reserved')} · ขายแล้ว ${countOf(picked, 'sold')})`}
            </p>
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SKU"><input {...ed.bind('sku')} /></Field>
          <Field label="ที่เก็บ / สาขา"><input {...ed.bind('location')} /></Field>
        </div>

        <Field label={ed.isEdit ? 'Serial Number' : `Serial Number — จะเพิ่ม ${serials.length || 1} เรือน`}>
          {ed.isEdit ? (
            <>
              <input value={ed.form.serials[0]} onChange={function (e) { ed.setField('serials', [e.target.value]); }} className={`${inputClass} font-mono`} />
              {duplicates.length > 0 && <p className="mt-2 text-xs text-red-300">Serial นี้มีในสต็อกแล้ว</p>}
            </>
          ) : (
            <SerialList list={ed.form.serials} setList={function (next) { ed.setField('serials', next); }} isTaken={isTaken} />
          )}
        </Field>

        <Field label="สถานะ">
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(STATUSES).map(function ([value, label]) {
              return (
                <button key={value} type="button" onClick={function () { ed.setField('status', value); }}
                  className={`cursor-pointer rounded-xl border py-2.5 text-sm transition ${
                    ed.form.status === value ? 'border-white bg-white text-black' : 'border-white/15 text-neutral-300 hover:text-white'
                  }`}>
                  {label}
                </button>
              );
            })}
          </div>
        </Field>
      </EditorModal>
    </div>
  );
}
