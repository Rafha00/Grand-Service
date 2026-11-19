import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { errorMessage } from './adminApi';

const swalTheme = {
  background: '#141416',
  color: '#f5f5f5',
  buttonsStyling: false,
  customClass: {
    popup: 'rounded-2xl border border-white/15',
    confirmButton: 'bg-white text-black px-7 py-2.5 rounded-full text-sm font-medium hover:bg-gray-200 transition mx-1',
    cancelButton: 'border border-white/20 text-neutral-200 px-7 py-2.5 rounded-full text-sm hover:border-white/40 transition mx-1',
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

export const GOLD = 'text-white';
export const card = 'rounded-2xl border border-white/[0.12] bg-[#141416]';
export const inputClass =
  'w-full rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-400 focus:border-white/50 focus:outline-none transition [&>option]:bg-[#141416]';
export const btnPrimary =
  'inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black hover:bg-gray-200 transition cursor-pointer disabled:opacity-50';
export const btnGhost =
  'inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm text-neutral-200 hover:border-white/50 hover:text-white transition cursor-pointer';
const iconBtn = 'inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 transition cursor-pointer';

export function PageHeader({ title, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-light tracking-tight text-white">{title}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

// แถวตัวกรองของทุกหน้า: ซ้าย = แท็บสถานะ [[ค่า, ชื่อ, จำนวน], ...], ขวา = ตัวกรอง (children) + ปุ่มล้าง
export function FilterBar({ tabs, value, onChange, onClear, children }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        {(tabs || []).map(function ([key, label, n]) {
          const active = value === key;
          return (
            <button key={key} type="button" onClick={function () { onChange(key); }}
              className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                active ? 'border-white bg-white text-black' : 'border-white/15 text-neutral-300 hover:text-white'
              }`}>
              {label}<span className={`rounded-full px-2 text-xs ${active ? 'bg-black/10' : 'bg-white/5'}`}>{n}</span>
            </button>
          );
        })}
      </div>
      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
        {children}
        {onClear && <button type="button" onClick={onClear} className={btnGhost}>ล้าง</button>}
      </div>
    </div>
  );
}

export function DateFilter({ value, onChange }) {
  return (
    <input type="date" value={value} onChange={function (e) { onChange(e.target.value); }}
      className={`${inputClass} sm:w-44 [color-scheme:dark] ${value ? 'border-white/40 text-white' : ''}`} />
  );
}

// [['', 'ทั้งหมด', n], [ค่า, ชื่อ, n], ...] นับจากรายการด้วย keyOf
export function countTabs(list, options, keyOf) {
  const rows = list || [];
  return [['', 'ทั้งหมด', rows.length]].concat(options.map(function ([key, label]) {
    return [key, label, rows.filter(function (x) { return keyOf(x) === key; }).length];
  }));
}

export function SearchInput({ value, onChange, placeholder, className = 'w-60' }) {
  return (
    <div className={`relative ${className}`}>
      <i className="fa-solid fa-magnifying-glass pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-xs text-neutral-400" />
      <input placeholder={placeholder} value={value} onChange={function (e) { onChange(e.target.value); }} className={`${inputClass} pl-10`} />
    </div>
  );
}

const TONES = { on: 'bg-emerald-400', off: 'bg-neutral-500', warn: 'bg-amber-300', bad: 'bg-red-400' };
export function Badge({ tone = 'off', children }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-neutral-200">
      <span className={`h-1.5 w-1.5 rounded-full ${TONES[tone]}`} />{children}
    </span>
  );
}

const PAGE_SIZE = 5;

// เลขหน้าที่จะแสดง: หน้าไม่เกิน 7 แสดงครบ ถ้าเกินแสดง 1 … ก่อน-ปัจจุบัน-ถัดไป … สุดท้าย
function pageNumbers(page, total) {
  if (total <= 7) return Array.from({ length: total }, function (_, i) { return i + 1; });
  const start = Math.max(2, Math.min(page - 1, total - 4));
  const end = Math.min(total - 1, Math.max(page + 1, 5));
  const middle = Array.from({ length: end - start + 1 }, function (_, i) { return start + i; });
  return [1, start > 2 ? '…' : null, ...middle, end < total - 1 ? '…' : null, total].filter(Boolean);
}

const pageBtn = 'inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm transition';

export function Pagination({ page, total, onChange }) {
  if (total <= 1) return null;
  const arrow = function (to, icon, disabled) {
    return (
      <button type="button" disabled={disabled} onClick={function () { onChange(to); }} aria-label={icon === 'left' ? 'หน้าก่อน' : 'หน้าถัดไป'}
        className={`${pageBtn} border-white/15 text-neutral-200 ${disabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer hover:border-white/50 hover:text-white'}`}>
        <i className={`fa-solid fa-chevron-${icon} text-xs`} />
      </button>
    );
  };

  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
      {arrow(page - 1, 'left', page === 1)}
      {pageNumbers(page, total).map(function (p, i) {
        if (p === '…') return <span key={`gap${i}`} className="px-1 text-neutral-400">…</span>;
        return (
          <button key={p} type="button" onClick={function () { onChange(p); }}
            className={`${pageBtn} cursor-pointer ${p === page ? 'border-white bg-white font-medium text-black' : 'border-white/15 text-neutral-200 hover:border-white/50 hover:text-white'}`}>
            {p}
          </button>
        );
      })}
      {arrow(page + 1, 'right', page === total)}
    </div>
  );
}

export function Table({ headers, rows, renderRow, pageSize = PAGE_SIZE }) {
  const [page, setPage] = useState(1);
  const count = rows ? rows.length : 0;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const current = Math.min(page, totalPages);   // ลบ/กรองจนหน้าหายไป → อยู่หน้าสุดท้ายที่มี
  const shown = (rows || []).slice((current - 1) * pageSize, current * pageSize);

  // จำนวนแถวเปลี่ยน (ค้นหา / กรอง) → กลับไปหน้า 1
  useEffect(function () { setPage(1); }, [count]);

  return (
    <div>
      <div className={`${card} overflow-x-auto`}>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/[0.12] text-xs text-neutral-300">
            <tr>{headers.map(function (h, i) { return <th key={i} className="px-5 py-4 font-normal">{h}</th>; })}</tr>
          </thead>
          <tbody className="divide-y divide-white/[0.1] text-neutral-200">
            {shown.map(function (r) { return <tr key={r.id} className="transition hover:bg-white/[0.02]">{renderRow(r)}</tr>; })}
          </tbody>
        </table>
        {(!rows || rows.length === 0) && (
          <p className="py-16 text-center text-sm text-neutral-400">{rows ? 'ไม่มีข้อมูล' : 'กำลังโหลด...'}</p>
        )}
      </div>
      <Pagination page={current} total={totalPages} onChange={setPage} />
    </div>
  );
}

export function Td({ children, className = '' }) {
  return <td className={`px-5 py-4 align-middle ${className}`}>{children}</td>;
}

export function RowActions({ onAdd, onEdit, onDelete }) {
  return (
    <Td className="whitespace-nowrap text-right">
      {onAdd && (
        <button onClick={onAdd} title="เพิ่มรุ่นนี้อีก" className={`${iconBtn} hover:bg-white/5 hover:text-white`}><i className="fa-solid fa-plus text-xs" /></button>
      )}
      {onEdit && (
        <button onClick={onEdit} title="แก้ไข" className={`${iconBtn} hover:bg-white/5 hover:text-white`}><i className="fa-solid fa-pen text-xs" /></button>
      )}
      {onDelete && (
        <button onClick={onDelete} title="ลบ" className={`${iconBtn} hover:bg-amber-400/10`}><i className="fa-solid fa-trash gold-shine text-sm" /></button>
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
        <div className="flex items-start justify-between border-b border-white/[0.1] px-8 pt-7 pb-5">
          <div>
            <h2 className="text-2xl font-light tracking-tight text-white">{ed.isEdit ? 'แก้ไข' : 'เพิ่ม'}{title}</h2>
          </div>
          <button type="button" onClick={ed.close} aria-label="ปิด" className={`${iconBtn} hover:bg-white/5 hover:text-white`}><i className="fa-solid fa-xmark" /></button>
        </div>
        <div className={`min-h-0 flex-1 overflow-y-auto px-8 py-6 ${className}`}>{children}</div>
        <div className="flex justify-end gap-3 border-t border-white/[0.1] px-8 py-4">
          <button type="button" onClick={ed.close} className={btnGhost}>ยกเลิก</button>
          <button type="submit" disabled={ed.saving} className={btnPrimary}>{ed.saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
        </div>
      </form>
    </div>
  );
}

export function FilterSelect({ value, onChange, all, options, className = 'sm:w-40' }) {
  return (
    <select value={value} onChange={function (e) { onChange(e.target.value); }} className={`${inputClass} ${className} ${value ? 'border-white/40 text-white' : ''}`}>
      <option value="">{all}</option>
      {options.map(function ([v, label]) { return <option key={v} value={v}>{label}</option>; })}
    </select>
  );
}

// [id, name] ไม่ซ้ำ เรียงตามชื่อ
export function uniqueOptions(list, getId, getName) {
  const map = new Map();
  (list || []).forEach(function (x) { const id = getId(x); if (id != null && id !== '' && !map.has(String(id))) map.set(String(id), getName(x) || String(id)); });
  return [...map.entries()].sort(function (a, b) { return String(a[1]).localeCompare(String(b[1]), 'th'); });
}

export function Combobox({ value, onChange, items, placeholder = 'ค้นหา', required, disabled }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const selected = (items || []).find(function (x) { return String(x.id) === String(value); });
  const matches = (items || []).filter(function (x) { return x.name.toLowerCase().includes(text.toLowerCase()); });

  function show() {
    if (!open) { setText(''); setOpen(true); }
  }

  function pick(item) {
    onChange(item.id);
    setOpen(false);
  }

  return (
    <div className="relative">
      <input
        value={open ? text : selected ? selected.name : ''}
        placeholder={selected ? selected.name : placeholder}
        onFocus={show}
        onClick={show}
        onBlur={function () { setOpen(false); }}
        onChange={function (e) { setText(e.target.value); setOpen(true); }}
        onKeyDown={function (e) {
          if (e.key === 'Enter') { e.preventDefault(); if (matches[0]) pick(matches[0]); }
          else if (e.key === 'Escape') setOpen(false);
          else show();
        }}
        autoComplete="off"
        name="combobox-search"
        disabled={disabled}
        className={`${inputClass} pr-9 disabled:opacity-60`}
      />
      <i className={`fa-solid ${open ? 'fa-magnifying-glass' : 'fa-chevron-down'} pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[10px] text-neutral-400`} />
      <input tabIndex={-1} required={required} value={value || ''} onChange={function () {}} className="pointer-events-none absolute bottom-0 left-4 h-px w-px opacity-0" />
      {open && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-white/15 bg-[#1a1a1d] py-1 shadow-xl">
          {matches.length === 0 && <li className="px-4 py-2 text-sm text-neutral-400">ไม่พบ</li>}
          {matches.map(function (x) {
            return (
              <li key={x.id} onMouseDown={function (e) { e.preventDefault(); pick(x); }}
                className={`cursor-pointer px-4 py-2 text-sm hover:bg-white/5 ${String(x.id) === String(value) ? 'text-white' : 'text-neutral-200'}`}>
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
      <span className="mb-2 block text-sm text-neutral-300">{label}</span>
      {children}
    </div>
  );
}
