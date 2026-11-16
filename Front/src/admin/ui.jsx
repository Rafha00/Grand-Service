import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { errorMessage } from './adminApi';

const swalTheme = {
  background: '#161616',
  color: '#f5f5f5',
  buttonsStyling: false,
  customClass: {
    popup: 'rounded-2xl border border-white/10',
    confirmButton: 'bg-[#c9a96e] text-black px-7 py-2.5 rounded-full text-sm font-medium hover:bg-[#d8bc86] transition mx-1',
    cancelButton: 'border border-white/15 text-neutral-300 px-7 py-2.5 rounded-full text-sm hover:border-white/40 transition mx-1',
  },
};

export function toastError(err) {
  return Swal.fire({ ...swalTheme, icon: 'error', title: 'ไม่สำเร็จ', text: errorMessage(err), confirmButtonText: 'ตกลง' });
}

export async function run(action, successText) {
  try {
    await action();
    Swal.fire({ ...swalTheme, icon: 'success', title: successText, timer: 1200, showConfirmButton: false });
    return true;
  } catch (err) {
    toastError(err);
    return false;
  }
}

const dangerButton = 'bg-red-500/90 text-white px-7 py-2.5 rounded-full text-sm font-medium hover:bg-red-500 transition mx-1';

export async function ask(title, text, confirmText = 'ยืนยัน', danger = false) {
  const result = await Swal.fire({
    ...swalTheme,
    customClass: danger ? { ...swalTheme.customClass, confirmButton: dangerButton } : swalTheme.customClass,
    icon: danger ? 'warning' : 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'ยกเลิก',
    reverseButtons: true,
  });
  return result.isConfirmed;
}

export async function confirmRun(label, action, successText) {
  return (await ask('ยืนยันการลบ?', `${label} — ลบแล้วกู้คืนไม่ได้`, 'ลบ', true)) && run(action, successText);
}

export async function askRun(title, text, action, successText) {
  return (await ask(title, text)) && run(action, successText);
}

export function useLoad(fetcher) {
  const [data, setData] = useState(null);
  function reload() { fetcher().then(setData).catch(toastError); }
  useEffect(reload, []);
  return [data, reload];
}

export function useEditor(empty, toForm) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  function setField(key, value) {
    setForm(function (prev) { return { ...prev, [key]: value }; });
  }

  function open(item) {
    const next = { ...empty };
    Object.keys(empty).forEach(function (key) { if (item[key] != null) next[key] = item[key]; });
    setForm(toForm ? toForm(item) : next);
    setEditing(item);
  }

  async function save(action, successText, reload) {
    const isEdit = !!(editing && editing.id);
    if (!(await ask(isEdit ? 'ยืนยันการแก้ไข?' : 'ยืนยันการเพิ่ม?', isEdit ? 'ข้อมูลเดิมจะถูกแทนที่' : '', isEdit ? 'บันทึกการแก้ไข' : 'เพิ่ม'))) return;
    setSaving(true);
    const ok = await run(action, successText);
    setSaving(false);
    if (ok) setEditing(null);
    reload();
  }

  return {
    form, setField, open, save, saving,
    isOpen: !!editing,
    isEdit: !!(editing && editing.id),
    id: editing && editing.id,
    close: function () { setEditing(null); },
    bind: function (key) {
      return { value: form[key], onChange: function (e) { setField(key, e.target.value); }, className: inputClass };
    },
  };
}

export function searchRows(rows, keyword, textOf) {
  return (rows || []).filter(function (r) { return textOf(r).toLowerCase().includes(keyword.toLowerCase()); });
}

export const GOLD = 'text-[#c9a96e]';
export const card = 'rounded-2xl border border-white/[0.08] bg-[#161616]';
export const inputClass =
  'w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:border-[#c9a96e]/60 focus:outline-none transition [&>option]:bg-[#161616]';
export const btnPrimary =
  'inline-flex items-center gap-2 rounded-full bg-[#c9a96e] px-6 py-2.5 text-sm font-medium text-black hover:bg-[#d8bc86] transition cursor-pointer disabled:opacity-50';
export const btnGhost =
  'inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm text-neutral-300 hover:border-[#c9a96e]/60 hover:text-[#c9a96e] transition cursor-pointer';
const iconBtn = 'inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition cursor-pointer';

export function PageHeader({ title, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-3xl text-white">{title}</h1>
        <div className="mt-3 h-px w-12 bg-[#c9a96e]" />
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export function Toolbar({ children }) {
  return <div className="mb-5 flex flex-wrap items-center justify-end gap-3">{children}</div>;
}

export function SearchInput({ value, onChange, placeholder, className = 'w-60' }) {
  return (
    <div className={`relative ${className}`}>
      <i className="fa-solid fa-magnifying-glass pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-xs text-neutral-500" />
      <input placeholder={placeholder} value={value} onChange={function (e) { onChange(e.target.value); }} className={`${inputClass} pl-10`} />
    </div>
  );
}

const TONES = { on: 'bg-[#c9a96e]', off: 'bg-neutral-500', bad: 'bg-red-400' };
export function Badge({ tone = 'off', children }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-neutral-200">
      <span className={`h-1.5 w-1.5 rounded-full ${TONES[tone]}`} />{children}
    </span>
  );
}

export function Table({ headers, rows, renderRow }) {
  return (
    <div className={`${card} overflow-x-auto`}>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/[0.08] text-xs text-neutral-400">
          <tr>{headers.map(function (h, i) { return <th key={i} className="px-5 py-4 font-normal">{h}</th>; })}</tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06] text-neutral-200">
          {(rows || []).map(function (r) { return <tr key={r.id} className="transition hover:bg-white/[0.02]">{renderRow(r)}</tr>; })}
        </tbody>
      </table>
      {(!rows || rows.length === 0) && (
        <p className="py-16 text-center text-sm text-neutral-500">{rows ? 'ไม่มีข้อมูล' : 'กำลังโหลด...'}</p>
      )}
    </div>
  );
}

export function Td({ children, className = '' }) {
  return <td className={`px-5 py-4 align-middle ${className}`}>{children}</td>;
}

export function RowActions({ onEdit, onDelete }) {
  return (
    <Td className="whitespace-nowrap text-right">
      {onEdit && (
        <button onClick={onEdit} title="แก้ไข" className={`${iconBtn} hover:bg-white/5 hover:text-[#c9a96e]`}><i className="fa-solid fa-pen text-xs" /></button>
      )}
      {onDelete && (
        <button onClick={onDelete} title="ลบ" className={`${iconBtn} hover:bg-red-500/10 hover:text-red-400`}><i className="fa-solid fa-trash text-xs" /></button>
      )}
    </Td>
  );
}

export function EditorModal({ ed, title, onSubmit, children, className = 'space-y-5', width = 'max-w-lg' }) {
  if (!ed.isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={ed.close}>
      <form
        onSubmit={function (e) { e.preventDefault(); onSubmit(); }}
        onClick={function (e) { e.stopPropagation(); }}
        className={`${card} flex max-h-[90vh] w-full ${width} flex-col overflow-hidden shadow-2xl`}
      >
        <div className="flex items-start justify-between border-b border-white/[0.06] px-8 pt-7 pb-5">
          <div>
            <h2 className="font-serif text-2xl text-white">{ed.isEdit ? 'แก้ไข' : 'เพิ่ม'}{title}</h2>
            <div className="mt-3 h-px w-10 bg-[#c9a96e]" />
          </div>
          <button type="button" onClick={ed.close} aria-label="ปิด" className={`${iconBtn} hover:bg-white/5 hover:text-white`}><i className="fa-solid fa-xmark" /></button>
        </div>
        <div className={`min-h-0 flex-1 overflow-y-auto px-8 py-6 ${className}`}>{children}</div>
        <div className="flex justify-end gap-3 border-t border-white/[0.06] px-8 py-4">
          <button type="button" onClick={ed.close} className={btnGhost}>ยกเลิก</button>
          <button type="submit" disabled={ed.saving} className={btnPrimary}>{ed.saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
        </div>
      </form>
    </div>
  );
}

export function Combobox({ value, onChange, items, placeholder = 'พิมพ์ค้นหา...', required, disabled }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const selected = (items || []).find(function (x) { return String(x.id) === String(value); });
  const matches = (items || []).filter(function (x) { return x.name.toLowerCase().includes(text.toLowerCase()); });

  function pick(item) {
    onChange(item.id);
    setOpen(false);
  }

  return (
    <div className="relative">
      <input
        value={open ? text : selected ? selected.name : ''}
        placeholder={selected ? selected.name : placeholder}
        onFocus={function () { setText(''); setOpen(true); }}
        onBlur={function () { setOpen(false); }}
        onChange={function (e) { setText(e.target.value); }}
        onKeyDown={function (e) { if (e.key === 'Enter') { e.preventDefault(); if (matches[0]) pick(matches[0]); } }}
        disabled={disabled}
        className={`${inputClass} pr-9 disabled:opacity-60`}
      />
      <i className={`fa-solid ${open ? 'fa-magnifying-glass' : 'fa-chevron-down'} pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[10px] text-neutral-500`} />
      <input tabIndex={-1} required={required} value={value || ''} onChange={function () {}} className="pointer-events-none absolute bottom-0 left-4 h-px w-px opacity-0" />
      {open && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#1b1b1b] py-1 shadow-xl">
          {matches.length === 0 && <li className="px-4 py-2 text-sm text-neutral-500">ไม่พบ</li>}
          {matches.map(function (x) {
            return (
              <li key={x.id} onMouseDown={function (e) { e.preventDefault(); pick(x); }}
                className={`cursor-pointer px-4 py-2 text-sm hover:bg-white/5 ${String(x.id) === String(value) ? 'text-[#c9a96e]' : 'text-neutral-200'}`}>
                {x.name}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <span className="mb-2 block text-sm text-neutral-400">{label}</span>
      {children}
    </div>
  );
}
