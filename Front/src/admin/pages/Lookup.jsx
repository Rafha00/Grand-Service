import { useState } from 'react';
import { brandApi, categoryApi } from '../adminApi';
import { Toolbar, Table, Td, RowActions, EditorModal, Field, useLoad, useEditor, confirmRun, btnPrimary } from '../ui';
import { useCan } from '../AdminMenuLink';

const KINDS = {
  brands: { api: brandApi, label: 'แบรนด์', logo: true },
  categories: { api: categoryApi, label: 'หมวดหมู่', logo: false },
};

export default function Lookup({ kind }) {
  const { api, label, logo } = KINDS[kind];
  const [rows, reload] = useLoad(api.list);
  const [file, setFile] = useState(null);
  const ed = useEditor({ name: '', description: '' });
  const can = useCan();

  function open(row) {
    setFile(null);
    ed.open(row);
  }

  function submit() {
    let body = { name: ed.form.name };
    if (logo) {
      body = new FormData();
      body.append('name', ed.form.name);
      body.append('description', ed.form.description);
      if (file) body.append('logo_url', file);
    }
    const action = ed.isEdit ? function () { return api.update(ed.id, body); } : function () { return api.create(body); };
    ed.save(action, `บันทึก${label}แล้ว`, reload);
  }

  return (
    <div>
      <Toolbar>
        {can('catalogEdit') && <button onClick={function () { open({}); }} className={btnPrimary}>เพิ่ม{label}</button>}
      </Toolbar>

      <Table
        headers={logo ? ['โลโก้', 'ชื่อ', 'รายละเอียด', ''] : ['ชื่อ', '']}
        rows={rows}
        renderRow={function (r) {
          return (
            <>
              {logo && (
                <Td>{r.logo_url ? <img src={r.logo_url} alt="" className="h-10 w-10 rounded bg-white object-contain p-1" /> : <div className="h-10 w-10 rounded bg-neutral-800" />}</Td>
              )}
              <Td className="font-medium">{r.name}</Td>
              {logo && <Td className="max-w-md truncate text-neutral-400">{r.description || '-'}</Td>}
              <RowActions
                onEdit={can('catalogEdit') && function () { open(r); }}
                onDelete={can('catalogEdit') && function () { confirmRun(r.name, function () { return api.remove(r.id); }, `ลบ${label}แล้ว`).then(reload); }}
              />
            </>
          );
        }}
      />

      <EditorModal ed={ed} title={label} onSubmit={submit}>
        <Field label={`ชื่อ${label}`}><input required {...ed.bind('name')} /></Field>
        {logo && <Field label="รายละเอียด"><textarea rows={3} {...ed.bind('description')} /></Field>}
        {logo && (
          <Field label={ed.isEdit ? 'โลโก้ใหม่ (ไม่เลือก = ใช้รูปเดิม)' : 'โลโก้'}>
            <input type="file" accept="image/*" onChange={function (e) { setFile(e.target.files[0] || null); }} className="text-sm text-neutral-400" />
          </Field>
        )}
      </EditorModal>
    </div>
  );
}
