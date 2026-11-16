import { useState } from 'react';
import { inventoryApi, productApi } from '../adminApi';
import { Badge, PageHeader, Table, Td, RowActions, EditorModal, Field, SearchInput, Combobox, useLoad, useEditor, confirmRun, searchRows, inputClass, btnPrimary } from '../ui';
import { useCan } from '../AdminMenuLink';

const STATUSES = { available: 'พร้อมขาย', reserved: 'จองแล้ว', sold: 'ขายแล้ว' };
const TONE = { available: 'on', reserved: 'off', sold: 'bad' };
const empty = { product_id: '', sku: '', serials: '', status: 'available', location: '' };

export default function Inventory() {
  const [items, reload] = useLoad(inventoryApi.list);
  const [products] = useLoad(productApi.list);
  const [search, setSearch] = useState('');
  const can = useCan();
  const ed = useEditor(empty, function (item) {
    return {
      product_id: item.product_id || '', sku: item.sku || '', serials: item.serial_number || '',
      status: item.status || 'available', location: item.location || '',
    };
  });

  const serials = [...new Set(ed.form.serials.split('\n').map(function (s) { return s.trim(); }).filter(Boolean))];

  function submit() {
    const body = { sku: ed.form.sku, status: ed.form.status, location: ed.form.location };
    if (ed.isEdit) {
      return ed.save(function () { return inventoryApi.update(ed.id, { ...body, serial_number: serials[0] || null }); }, 'แก้ไขสต็อกแล้ว', reload);
    }
    const list = serials.length ? serials : [null];
    return ed.save(function () {
      return Promise.all(list.map(function (sn) { return inventoryApi.create({ ...body, product_id: ed.form.product_id, serial_number: sn }); }));
    }, `เพิ่มเข้าสต็อก ${list.length} เครื่องแล้ว`, reload);
  }

  const productItems = (products || []).map(function (p) {
    return { id: p.id, name: [p.brands && p.brands.name, p.name, p.model].filter(Boolean).join(' · ') };
  });

  return (
    <div>
      <PageHeader title="สต็อกสินค้า">
        <SearchInput placeholder="ค้นหาสินค้า / SKU / Serial" value={search} onChange={setSearch} />
        <button onClick={function () { ed.open({}); }} className={btnPrimary}>เพิ่มเข้าสต็อก</button>
      </PageHeader>

      <Table
        headers={['สินค้า', 'SKU', 'Serial No.', 'สถานะ', 'ที่เก็บ', '']}
        rows={items && searchRows(items, search, function (i) { return `${i.Products && i.Products.name} ${i.sku} ${i.serial_number} ${i.location}`; })}
        renderRow={function (i) {
          return (
            <>
              <Td className="font-medium">{i.Products ? i.Products.name : `#${i.product_id}`}</Td>
              <Td>{i.sku || '-'}</Td>
              <Td>{i.serial_number || '-'}</Td>
              <Td><Badge tone={TONE[i.status]}>{STATUSES[i.status] || i.status || '-'}</Badge></Td>
              <Td>{i.location || '-'}</Td>
              <RowActions
                onEdit={function () { ed.open(i); }}
                onDelete={can('deleteStock') && function () { confirmRun(`SKU ${i.sku || i.id}`, function () { return inventoryApi.remove(i.id); }, 'ลบรายการแล้ว').then(reload); }}
              />
            </>
          );
        }}
      />

      <EditorModal ed={ed} title="สต็อก" onSubmit={submit}>
        <Field label="สินค้า *">
          <Combobox required disabled={ed.isEdit} items={productItems} value={ed.form.product_id}
            onChange={function (v) { ed.setField('product_id', v); }} placeholder="พิมพ์ค้นหาชื่อ / รุ่น / แบรนด์" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SKU"><input {...ed.bind('sku')} /></Field>
          <Field label="ที่เก็บ / สาขา"><input {...ed.bind('location')} /></Field>
        </div>

        <Field label={ed.isEdit ? 'Serial Number' : `Serial Number (บรรทัดละ 1 เครื่อง) — จะเพิ่ม ${serials.length || 1} เครื่อง`}>
          {ed.isEdit ? <input {...ed.bind('serials')} /> : <textarea rows={4} placeholder={'SN001\nSN002'} {...ed.bind('serials')} />}
        </Field>

        <Field label="สถานะ">
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(STATUSES).map(function ([value, label]) {
              return (
                <button key={value} type="button" onClick={function () { ed.setField('status', value); }}
                  className={`cursor-pointer rounded-xl border py-2.5 text-sm transition ${
                    ed.form.status === value ? 'border-[#c9a96e]/60 bg-[#c9a96e]/10 text-[#c9a96e]' : 'border-white/10 text-neutral-400 hover:text-white'
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
