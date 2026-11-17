import { useState } from 'react';
import { locationApi } from '../adminApi';
import { Badge, PageHeader, Table, Td, RowActions, EditorModal, Field, SearchInput, useLoad, useEditor, confirmRun, searchRows, btnPrimary } from '../ui';
import { useCan } from '../AdminMenuLink';

const empty = { name: '', address: '', description: '', is_active: true };

export default function Locations() {
  const [rows, reload] = useLoad(locationApi.list);
  const [search, setSearch] = useState('');
  const ed = useEditor(empty);
  const can = useCan();
  const edit = can('locationEdit');

  function submit() {
    const action = ed.isEdit
      ? function () { return locationApi.update(ed.id, ed.form); }
      : function () { return locationApi.create(ed.form); };
    ed.save(action, 'บันทึกสาขาแล้ว', reload);
  }

  return (
    <div>
      <PageHeader title="สาขา">
        <SearchInput placeholder="ค้นหาสาขา" value={search} onChange={setSearch} />
        {edit && <button onClick={function () { ed.open({}); }} className={btnPrimary}>เพิ่มสาขา</button>}
      </PageHeader>

      <Table
        headers={['ชื่อสาขา', 'ที่อยู่', 'รายละเอียด', 'สถานะ', '']}
        rows={rows && searchRows(rows, search, function (r) { return `${r.name} ${r.address} ${r.description}`; })}
        renderRow={function (r) {
          return (
            <>
              <Td className="whitespace-nowrap font-medium">{r.name}</Td>
              <Td className="max-w-xs text-neutral-400">{r.address || '-'}</Td>
              <Td className="max-w-xs truncate text-neutral-400">{r.description || '-'}</Td>
              <Td><Badge tone={r.is_active ? 'on' : 'off'}>{r.is_active ? 'เปิด' : 'ปิด'}</Badge></Td>
              <RowActions
                onEdit={edit && function () { ed.open(r); }}
                onDelete={edit && function () { confirmRun(r.name, function () { return locationApi.remove(r.id); }, 'ลบสาขาแล้ว').then(reload); }}
              />
            </>
          );
        }}
      />

      <EditorModal ed={ed} title="สาขา" onSubmit={submit}>
        <Field label="ชื่อสาขา *"><input required {...ed.bind('name')} /></Field>
        <Field label="ที่อยู่"><textarea rows={2} {...ed.bind('address')} /></Field>
        <Field label="รายละเอียด"><textarea rows={2} {...ed.bind('description')} /></Field>
        <label className="flex items-center gap-2 text-sm text-neutral-300">
          <input type="checkbox" checked={String(ed.form.is_active) === 'true'} onChange={function (e) { ed.setField('is_active', e.target.checked); }} />
          เปิดให้จอง
        </label>
      </EditorModal>
    </div>
  );
}
