import { useState } from 'react';
import { userApi } from '../adminApi';
import { getProfileAPI } from '../../api/authApi';
import { PageHeader, FilterBar, countTabs, Table, Td, RowActions, EditorModal, Field, SearchInput, useLoad, useEditor, askRun, confirmRun, searchRows, inputClass } from '../ui';

const ROLES = ['Customer', 'Staff', 'Manager', 'Admin'];
const empty = { email: '', full_name: '', phone: '' };

export default function Users() {
  const [users, reload] = useLoad(userApi.list);
  const [me] = useLoad(function () { return getProfileAPI().then(function (res) { return res.user; }); });
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const ed = useEditor(empty);

  const rows = users && searchRows(users.filter(function (u) { return !role || (u.role || 'Customer') === role; }), search, function (u) {
    return `${u.email} ${u.full_name} ${u.phone}`;
  });

  function submit() {
    ed.save(function () { return userApi.update(ed.id, ed.form); }, 'แก้ไขข้อมูลผู้ใช้แล้ว', reload);
  }

  return (
    <div>
      <PageHeader title="ผู้ใช้ / Role">
        <SearchInput placeholder="ค้นหา email / ชื่อ / เบอร์" value={search} onChange={setSearch} className="w-64" />
      </PageHeader>
      <FilterBar tabs={countTabs(users, ROLES.map(function (r) { return [r, r]; }), function (u) { return u.role || 'Customer'; })} value={role} onChange={setRole} />
      <Table
        headers={['Email', 'ชื่อ', 'เบอร์โทร', 'Role', '']}
        rows={rows}
        renderRow={function (u) {
          const self = !!me && me.id === u.id;
          return (
            <>
              <Td>{u.email}{self && <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">คุณ</span>}</Td>
              <Td>{u.full_name || '-'}</Td>
              <Td>{u.phone || '-'}</Td>
              <Td>
                {self ? <span className="text-neutral-300">{u.role}</span> : <select
                  value={u.role || 'Customer'}
                  onChange={function (e) {
                    const next = e.target.value;
                    askRun('เปลี่ยน Role?', `${u.email}: ${u.role || 'Customer'} → ${next}`, function () { return userApi.setRole(u.id, next); }, 'เปลี่ยน Role แล้ว').then(function (ok) { if (ok) reload(); });
                  }}
                  className={`${inputClass} w-36`}
                >
                  {ROLES.map(function (r) { return <option key={r}>{r}</option>; })}
                </select>}
              </Td>
              <RowActions
                onEdit={function () { ed.open(u); }}
                onDelete={!self && function () { confirmRun(u.email, function () { return userApi.remove(u.id); }, 'ลบผู้ใช้แล้ว').then(reload); }}
              />
            </>
          );
        }}
      />

      <EditorModal ed={ed} title="ข้อมูลผู้ใช้" onSubmit={submit}>
        <Field label="Email *"><input type="email" required {...ed.bind('email')} /></Field>
        <Field label="ชื่อ-นามสกุล"><input {...ed.bind('full_name')} /></Field>
        <Field label="เบอร์โทร"><input type="tel" placeholder="08x-xxx-xxxx" {...ed.bind('phone')} /></Field>
      </EditorModal>
    </div>
  );
}
