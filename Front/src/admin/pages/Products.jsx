import { useState } from 'react';
import { productApi, brandApi, categoryApi } from '../adminApi';
import { Badge, PageHeader, FilterBar, FilterSelect, countTabs, Table, Td, RowActions, EditorModal, Field, SearchInput, Combobox, useLoad, useEditor, confirmRun, toastError, inputClass, btnPrimary, btnGhost } from '../ui';
import { useCan } from '../AdminMenuLink';

const FIELDS = [
  ['name', 'ชื่อสินค้า'], ['model', 'รุ่น'], ['reference_number', 'Reference No.'],
  ['price', 'ราคา', 'number'], ['condition', 'สภาพ'], ['year', 'ปี', 'number'],
  ['movement', 'Movement'], ['case_size', 'ขนาดตัวเรือน'], ['case_material', 'วัสดุตัวเรือน'],
  ['warranty', 'การรับประกัน'],
];
const empty = { ...Object.fromEntries(FIELDS.map(function (f) { return [f[0], '']; })), brand_id: '', category_id: '', is_active: true };
const noFilter = { search: '', brand: '', category: '', status: '' };

function firstImage(p) {
  const imgs = (p.Product_Images || []).slice().sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });
  return imgs[0] && imgs[0].image_url;
}

const MAX_IMAGES = 5;

function ImagePicker({ images, setImages, existing }) {
  const [link, setLink] = useState('');
  const old = existing ? existing.Product_Images || [] : [];
  const full = images.length >= MAX_IMAGES;

  function add(list) {
    setImages(images.concat(list).slice(0, MAX_IMAGES));
  }

  function addLink() {
    const url = link.trim();
    if (!/^https?:\/\/\S+$/i.test(url)) return toastError('ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://');
    add([{ url }]);
    setLink('');
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {old.map(function (img) {
          return <img key={img.id || img.image_url} src={img.image_url} alt="" className="h-16 w-16 rounded-lg object-cover opacity-60" title="รูปเดิม" />;
        })}
        {images.map(function (img, i) {
          return (
            <div key={i} className="relative">
              <img src={img.file ? URL.createObjectURL(img.file) : img.url} alt="" className="h-16 w-16 rounded-lg border border-white/40 object-cover" />
              <button type="button" aria-label="เอาออก" onClick={function () { setImages(images.filter(function (_, j) { return j !== i; })); }}
                className="absolute -top-2 -right-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-[10px] text-neutral-200 ring-1 ring-white/20 hover:text-red-400">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input value={link} disabled={full} placeholder="วางลิงก์รูป https://..." className={inputClass}
          onChange={function (e) { setLink(e.target.value); }}
          onKeyDown={function (e) { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }} />
        <button type="button" disabled={full || !link.trim()} onClick={addLink} className={`${btnGhost} shrink-0 disabled:opacity-40`}>เพิ่มลิงก์</button>
        <label className={`${btnGhost} shrink-0 ${full ? 'pointer-events-none opacity-40' : ''}`}>
          <i className="fa-solid fa-upload text-xs" />ไฟล์
          <input type="file" accept="image/*" multiple hidden onChange={function (e) {
            add(Array.from(e.target.files).map(function (file) { return { file }; }));
            e.target.value = '';
          }} />
        </label>
      </div>
    </div>
  );
}

export default function Products({ tabs }) {
  const [products, reload] = useLoad(productApi.list);
  const [brands] = useLoad(brandApi.list);
  const [categories] = useLoad(categoryApi.list);
  const [filter, setFilter] = useState(noFilter);
  const [images, setImages] = useState([]);
  const ed = useEditor(empty);
  const can = useCan();

  function setF(key) {
    return function (v) { setFilter({ ...filter, [key]: v }); };
  }

  function withImages(id) {
    return images.length ? productApi.addImages(id, images) : null;
  }

  function submit() {
    if (ed.isEdit) {
      const body = { ...ed.form, price: Number(ed.form.price), year: Number(ed.form.year) };
      return ed.save(async function () { await productApi.update(ed.id, body); await withImages(ed.id); }, 'แก้ไขสินค้าแล้ว', reload);
    }
    const fd = new FormData();
    Object.entries(ed.form).forEach(function ([k, v]) { fd.append(k, v); });
    return ed.save(async function () {
      const res = await productApi.create(fd);
      await withImages(res.product.id);
    }, 'เพิ่มสินค้าแล้ว', reload);
  }

  const filtered = (products || []).filter(function (p) {
    return (!filter.brand || String(p.brand_id) === filter.brand)
      && (!filter.category || String(p.category_id) === filter.category)
      && (!filter.status || String(!!p.is_active) === filter.status)
      && `${p.name} ${p.model} ${p.reference_number}`.toLowerCase().includes(filter.search.toLowerCase());
  });

  function toOptions(list) {
    return (list || []).map(function (x) { return [String(x.id), x.name]; });
  }

  return (
    <div>
      <PageHeader title="สินค้า">
        <SearchInput placeholder="ค้นหาชื่อ / รุ่น / Ref" value={filter.search} onChange={setF('search')} />
        {can('catalogEdit') && <button onClick={function () { setImages([]); ed.open({}); }} className={btnPrimary}>เพิ่มสินค้า</button>}
      </PageHeader>
      {tabs}

      <FilterBar
        tabs={countTabs(products, [['true', 'แสดง'], ['false', 'ซ่อน']], function (p) { return String(!!p.is_active); })}
        value={filter.status} onChange={setF('status')}
        onClear={(filter.brand || filter.category) && function () { setFilter({ ...filter, brand: '', category: '' }); }}>
        <FilterSelect value={filter.brand} onChange={setF('brand')} all="ทุกแบรนด์" options={toOptions(brands)} />
        <FilterSelect value={filter.category} onChange={setF('category')} all="ทุกหมวดหมู่" options={toOptions(categories)} />
      </FilterBar>

      <Table
        headers={['', 'ชื่อ', 'แบรนด์', 'หมวดหมู่', 'ราคา', 'สถานะ', '']}
        rows={products && filtered}
        renderRow={function (p) {
          const img = firstImage(p);
          return (
            <>
              <Td>{img ? <img src={img} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <div className="h-12 w-12 rounded-lg bg-neutral-800" />}</Td>
              <Td><div className="font-medium">{p.name}</div><div className="text-xs text-neutral-300">{p.model} {p.reference_number}</div></Td>
              <Td>{p.brands ? p.brands.name : '-'}</Td>
              <Td>{p.Categories ? p.Categories.name : '-'}</Td>
              <Td>{p.price != null ? Number(p.price).toLocaleString() : '-'}</Td>
              <Td><Badge tone={p.is_active ? 'on' : 'off'}>{p.is_active ? 'แสดง' : 'ซ่อน'}</Badge></Td>
              <RowActions
                onEdit={can('catalogEdit') && function () { setImages([]); ed.open(p); }}
                onDelete={can('catalogEdit') && function () { confirmRun(p.name, function () { return productApi.remove(p.id); }, 'ลบสินค้าแล้ว').then(reload); }}
              />
            </>
          );
        }}
      />

      <EditorModal ed={ed} title="สินค้า" onSubmit={submit} width="max-w-4xl" className="grid grid-cols-1 content-start gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {FIELDS.map(function ([key, label, type]) {
          const number = type === 'number' && {
            min: key === 'year' ? 1900 : 0,
            max: key === 'year' ? new Date().getFullYear() + 1 : undefined,
            step: key === 'price' ? '0.01' : 1,
            onKeyDown: function (e) { if ('-+eE'.includes(e.key)) e.preventDefault(); },
          };
          return <Field key={key} label={label}><input type={type || 'text'} required={key === 'name'} {...ed.bind(key)} {...number} /></Field>;
        })}
        <Field label="แบรนด์"><Combobox required items={brands} value={ed.form.brand_id} onChange={function (v) { ed.setField('brand_id', v); }} placeholder="ค้นหาแบรนด์" /></Field>
        <Field label="หมวดหมู่"><Combobox required items={categories} value={ed.form.category_id} onChange={function (v) { ed.setField('category_id', v); }} placeholder="ค้นหาหมวดหมู่" /></Field>
        <label className="col-span-full flex items-center gap-2 text-sm text-neutral-200">
          <input type="checkbox" checked={String(ed.form.is_active) === 'true'} onChange={function (e) { ed.setField('is_active', e.target.checked); }} />
          แสดงสินค้าบนหน้าร้าน
        </label>
        <Field label={ed.isEdit ? 'เพิ่มรูปภาพ' : 'รูปภาพ'} className="col-span-full">
          <ImagePicker images={images} setImages={setImages} existing={ed.isEdit ? (products || []).find(function (p) { return p.id === ed.id; }) : null} />
        </Field>
      </EditorModal>
    </div>
  );
}
