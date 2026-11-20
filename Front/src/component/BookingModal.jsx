import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '13:00', '13:30', '14:00',
  '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const WEEK_DAYS = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];
const STEP_TITLES = ['เลือกสถานที่', 'เลือกวันที่', 'เลือกเวลา', 'ยืนยันการจอง'];

const getAuthToken = () => {
  try {
    const rawToken = localStorage.getItem('token');
    if (!rawToken) return null;

    const trimmed = rawToken.trim();
    if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
      return null;
    }
    return trimmed;
  } catch {
    return null;
  }
};

const isLoggedIn = () => Boolean(getAuthToken());

export default function BookingModal({ isOpen, onClose, selectedProduct }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [locations, setLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookedTimes, setBookedTimes] = useState([]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [alertModal, setAlertModal] = useState({ show: false, type: 'success', title: '', message: '' });

  const calendarMeta = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptySlots = Array.from({ length: firstDayOfWeek });

    return { currentMonth, currentYear, currentDay, daysArray, emptySlots };
  }, []);

  const { currentMonth, currentYear, currentDay, daysArray, emptySlots } = calendarMeta;

  const formattedSelectedDate = selectedDate
    ? `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${selectedDate.toString().padStart(2, '0')}`
    : '';

  useEffect(() => {
    if (!isOpen || !isLoggedIn()) return;
    setCurrentStep(1);
    setSelectedLocation(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setBookedTimes([]);
    setShowConfirmModal(false);
    setAlertModal({ show: false, type: 'success', title: '', message: '' });

    const fetchLocations = async () => {
      try {
        const res = await axiosClient.get('/locations');
        setLocations(res.data.data || res.data || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    fetchLocations();
  }, [isOpen]);

  useEffect(() => {
    if (!formattedSelectedDate || !isOpen || !isLoggedIn()) return;
    const fetchBookedSlots = async () => {
      try {
        const res = await axiosClient.get('/bookings/booked-slots', {
          params: {
            date: formattedSelectedDate,
            location_name: selectedLocation?.name || ''
          }
        });
        const booked = (res.data.bookedTimes || []).map(t => t.slice(0, 5));
        setBookedTimes(booked);
        setSelectedTime(prev => (prev && booked.includes(prev) ? null : prev));
      } catch (error) {
        console.error('Error fetching booked slots:', error);
      }
    };
    fetchBookedSlots();
  }, [formattedSelectedDate, selectedLocation, isOpen]);

  const filteredLocations = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return locations.filter(loc =>
      loc.name.toLowerCase().includes(q) ||
      (loc.address && loc.address.toLowerCase().includes(q))
    );
  }, [locations, searchQuery]);

  if (!isOpen || !selectedProduct || !isLoggedIn()) return null;

  const handleConfirmBooking = async () => {
    setShowConfirmModal(false);

    try {
      const token = getAuthToken();
      const rawUser = localStorage.getItem('user');
      let storedUser = null;

      if (rawUser && rawUser !== 'undefined' && rawUser !== 'null') {
        storedUser = JSON.parse(rawUser);
      }

      if (!token) {
        setAlertModal({
          show: true,
          type: 'error',
          title: 'กรุณาเข้าสู่ระบบ',
          message: 'ไม่พบข้อมูลการเข้าสู่ระบบ กรุณา Login ก่อนทำการจองคิว'
        });
        return;
      }

      const payload = {
        booking_date: formattedSelectedDate,
        booking_time: selectedTime,
        inventory_id: selectedProduct.id,
        location_name: selectedLocation?.name || '',
        product_name: selectedProduct.name,
        customer_id: storedUser?.id || '',
        note: `สาขา: ${selectedLocation?.name}`
      };

      await axiosClient.post('/bookings', payload);

      setAlertModal({
        show: true,
        type: 'success',
        title: 'จองคิวสำเร็จเรียบร้อยแล้ว!',
        message: `นัดหมายวันที่ ${selectedDate} ${THAI_MONTHS[currentMonth]} ${currentYear} เวลา ${selectedTime} น. ณ ${selectedLocation?.name}`
      });
    } catch (error) {
      setAlertModal({
        show: true,
        type: 'error',
        title: 'ไม่สามารถทำรายการจองได้',
        message: error.response?.data?.message || error.message
      });
    }
  };

  const handleCloseAlert = () => {
    const wasSuccess = alertModal.type === 'success';
    setAlertModal({ show: false, type: 'success', title: '', message: '' });

    if (wasSuccess) {
      onClose();
      navigate('/home');
    }
  };

  const canGoNext = () => {
    if (currentStep === 1) return selectedLocation !== null;
    if (currentStep === 2) return selectedDate !== null;
    if (currentStep === 3) return selectedTime !== null;
    return true;
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl text-white shadow-2xl overflow-hidden my-auto">

        {/* Header */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
          <div className="font-bold text-lg tracking-wider font-serif">
            GRAND SERVICE — BOOKING
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-xl font-bold px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* แถบแสดงสินค้าที่เลือก */}
        <div className="bg-zinc-900/60 border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={selectedProduct.image_url || selectedProduct.img}
              alt={selectedProduct.name}
              className="w-10 h-10 rounded-lg object-cover border border-zinc-700 bg-zinc-800"
            />
            <div>
              <p className="text-xs text-zinc-400">รายการที่ต้องการจอง:</p>
              <p className="text-sm font-bold text-white">{selectedProduct.name}</p>
            </div>
          </div>
          <div className="text-sm font-bold text-white">
            ฿ {Number(selectedProduct.price || 0).toLocaleString()}
          </div>
        </div>

        {/* Stepper */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto mb-8">
            {STEP_TITLES.map((title, index) => {
              const stepNum = index + 1;
              const isActive = currentStep === stepNum;
              const isPassed = currentStep > stepNum;
              return (
                <div key={stepNum} className="flex items-center flex-1">
                  <div className="flex flex-col items-center relative w-full">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 ${
                      isActive ? 'bg-white text-black ring-4 ring-zinc-800' :
                      isPassed ? 'bg-zinc-200 text-black' : 'bg-zinc-900 border-2 border-zinc-700 text-zinc-500'
                    }`}>
                      {isPassed ? '✓' : stepNum}
                    </div>
                    <p className={`text-xs mt-2 font-medium ${isActive || isPassed ? 'text-white' : 'text-zinc-500'}`}>
                      {title}
                    </p>
                    {stepNum !== 4 && (
                      <div className={`absolute top-4 left-[60%] w-[80%] h-0.5 -z-0 ${
                        isPassed ? 'bg-zinc-200' : 'bg-zinc-800'
                      }`} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 1: เลือกสถานที่ */}
          {currentStep === 1 && (
            <div className="flex flex-col md:flex-row gap-6 h-[380px]">
              <div className="w-full md:w-2/5 flex flex-col gap-3 overflow-y-auto pr-2">
                <input
                  type="text"
                  placeholder="ค้นหาสาขา..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2.5 px-4 bg-zinc-900 border border-zinc-700 text-white rounded-lg text-sm outline-none focus:border-white"
                />
                {filteredLocations.length === 0 ? (
                  <p className="text-zinc-500 text-center mt-6 text-sm">ไม่พบข้อมูลสาขา</p>
                ) : (
                  filteredLocations.map(loc => (
                    <div
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc)}
                      className={`p-3.5 border rounded-xl cursor-pointer ${
                        selectedLocation?.id === loc.id
                          ? 'border-white bg-zinc-800/90 ring-1 ring-white'
                          : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-white">{loc.name}</h4>
                        <span className="text-xs text-zinc-400">📍</span>
                      </div>
                      {loc.description && (
                        <p className="text-xs text-zinc-300 mt-1">{loc.description}</p>
                      )}
                      <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2">{loc.address}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="hidden md:block w-3/5 bg-zinc-900 border border-zinc-800 rounded-xl relative overflow-hidden">
                <img src="/Image/Clock.png" alt="Map" loading="lazy" className="w-full h-full object-cover opacity-80" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900/95 border border-zinc-700 px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap">
                  📍 {selectedLocation ? selectedLocation.name : 'กรุณาเลือกสาขาด้านซ้าย'}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: เลือกวันที่ */}
          {currentStep === 2 && (
            <div className="max-w-2xl mx-auto border border-zinc-800 rounded-xl p-8 shadow-sm bg-zinc-900 text-white">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">เลือกวันที่</h2>
                <span className="text-sm font-semibold bg-zinc-800 border border-zinc-700 px-3.5 py-1.5 rounded-lg text-zinc-200">
                  {THAI_MONTHS[currentMonth]} {currentYear}
                </span>
              </div>

              <div className="grid grid-cols-7 gap-y-6 gap-x-2 text-center mb-4">
                {WEEK_DAYS.map(d => (
                  <div key={d} className="font-bold text-zinc-400 text-sm">{d}</div>
                ))}

                {emptySlots.map((_, idx) => (
                  <div key={`empty-${idx}`} />
                ))}

                {daysArray.map(day => {
                  const isPast = day < currentDay;
                  return (
                    <button
                      type="button"
                      key={day}
                      disabled={isPast}
                      onClick={() => setSelectedDate(day)}
                      className={`w-10 h-10 mx-auto flex items-center justify-center rounded-full text-sm font-medium ${
                        isPast
                          ? 'text-zinc-600 cursor-not-allowed'
                          : selectedDate === day
                            ? 'bg-white text-black shadow-md font-bold cursor-pointer'
                            : 'hover:bg-zinc-800 text-zinc-300 cursor-pointer'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: เลือกเวลา */}
          {currentStep === 3 && (
            <div className="max-w-2xl mx-auto">
              <p className="text-zinc-400 text-sm mb-4 text-center">
                วันที่ {selectedDate} {THAI_MONTHS[currentMonth]} {currentYear} — สาขา {selectedLocation?.name}
                <span className="text-white text-xs ml-2">(สีขาว = ถูกจองแล้ว)</span>
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {TIME_SLOTS.map(time => {
                  const isBooked = bookedTimes.includes(time);
                  return (
                    <button
                      key={time}
                      disabled={isBooked}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 rounded-lg border text-sm font-medium ${
                        isBooked
                          ? 'bg-white border-white text-black font-bold cursor-not-allowed'
                          : selectedTime === time
                            ? 'bg-zinc-800 border-white text-white font-bold ring-1 ring-white cursor-pointer'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-500 cursor-pointer'
                      }`}
                    >
                      {time} {isBooked && '(เต็ม)'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: ยืนยันการจอง */}
          {currentStep === 4 && (
            <div className="max-w-lg mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 border-b border-zinc-800 pb-3">สรุปรายละเอียดการจอง</h3>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-zinc-400">สินค้า:</span>
                  <span className="font-bold text-white">{selectedProduct.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">สาขา:</span>
                  <span className="font-medium text-white text-right">{selectedLocation?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">วันที่:</span>
                  <span className="font-medium text-white">{selectedDate} {THAI_MONTHS[currentMonth]} {currentYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">เวลา:</span>
                  <span className="font-bold text-white">{selectedTime} น.</span>
                </div>
              </div>
              <button
                onClick={() => setShowConfirmModal(true)}
                className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3 rounded-xl cursor-pointer"
              >
                ยืนยันการจอง
              </button>
            </div>
          )}

          {/* Footer ปุ่มควบคุม */}
          <div className="flex justify-between pt-6 mt-6 border-t border-zinc-800">
            <button
              onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
              disabled={currentStep === 1}
              className={`px-5 py-2 rounded-lg text-sm border border-zinc-800 ${
                currentStep === 1 ? 'opacity-0 cursor-default' : 'text-zinc-300 hover:bg-zinc-900 cursor-pointer'
              }`}
            >
              ← ย้อนกลับ
            </button>

            {currentStep < 4 && (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canGoNext()}
                className={`px-6 py-2 rounded-lg text-sm font-bold ${
                  canGoNext()
                    ? 'bg-white text-black hover:bg-zinc-200 cursor-pointer'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                ถัดไป →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* POPUP ยืนยัน / ยกเลิก */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-4 text-xl">
              📅
            </div>
            <h3 className="text-lg font-bold text-white mb-2">ยืนยันการจองคิว?</h3>
            <p className="text-zinc-400 text-sm mb-6">
              คุณต้องการยืนยันการจองคิววันที่ {selectedDate} {THAI_MONTHS[currentMonth]} {currentYear} เวลา {selectedTime} น. ใช่หรือไม่?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 font-medium text-sm cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmBooking}
                className="flex-1 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-sm cursor-pointer"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP แจ้งเตือนผลลัพธ์ */}
      {alertModal.show && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold ${
              alertModal.type === 'success'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {alertModal.type === 'success' ? '✓' : '✕'}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{alertModal.title}</h3>
            <p className="text-zinc-400 text-sm mb-6">{alertModal.message}</p>
            <button
              onClick={handleCloseAlert}
              className="w-full py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-sm cursor-pointer"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}