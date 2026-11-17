import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import clockImg from '../page/Image/Clock.png';

export default function BookingModal({ isOpen, onClose, selectedProduct }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [locations, setLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // ข้อมูลที่ผู้ใช้เลือก
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookedTimes, setBookedTimes] = useState([]);

  // State สำหรับ Popup Confirm / Cancel และ Alert
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, type: 'success', message: '' });

  // โหลดข้อมูลสถานที่จากตาราง locations เมื่อเปิด Modal
  useEffect(() => {
    if (!isOpen) return;
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

  // เช็คเวลาที่ถูกจองแล้วทุกครั้งที่เปลี่ยน "วันที่" หรือ "สถานที่"
  useEffect(() => {
    if (!selectedDate || !selectedLocation) return;
    const fetchBookedSlots = async () => {
      try {
        const formattedDate = `2026-11-${selectedDate.toString().padStart(2, '0')}`;
        const res = await axiosClient.get('/bookings/booked-slots', {
          params: { date: formattedDate, location_name: selectedLocation.name }
        });
        setBookedTimes(res.data.bookedTimes || []);
        if (res.data.bookedTimes?.includes(selectedTime)) {
          setSelectedTime(null);
        }
      } catch (error) {
        console.error('Error fetching booked slots:', error);
      }
    };
    fetchBookedSlots();
  }, [selectedDate, selectedLocation]);

  if (!isOpen) return null;

  const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const stepTitles = ['เลือกสถานที่', 'เลือกวันที่', 'เลือกเวลา', 'ยืนยันการจอง'];

  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (loc.address && loc.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // ฟังก์ชันส่งข้อมูลไปบันทึกหลังกด Confirm ใน Popup
  const handleConfirmSubmit = async () => {
    setShowConfirmPopup(false);
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const customerId = storedUser.id || 'guest';

      const payload = {
        booking_date: `2026-11-${selectedDate.toString().padStart(2, '0')}`,
        booking_time: selectedTime,
        inventory_id: selectedProduct?.id || null,
        location_name: selectedLocation?.name || '',
        product_name: selectedProduct?.name || 'นัดหมายเข้าชมสินค้า',
        customer_id: customerId,
        note: `สาขา: ${selectedLocation?.name}`
      };

      await axiosClient.post('/bookings', payload);
      
      setAlertInfo({
        show: true,
        type: 'success',
        message: 'จองคิวสำเร็จเรียบร้อยแล้ว! กรุณารอการอนุมัติจากแอดมิน'
      });
    } catch (error) {
      setAlertInfo({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่'
      });
    }
  };

  const handleCloseAll = () => {
    setAlertInfo({ show: false, type: 'success', message: '' });
    setCurrentStep(1);
    setSelectedLocation(null);
    setSelectedDate(null);
    setSelectedTime(null);
    onClose();
  };

  const canGoNext = () => {
    if (currentStep === 1) return selectedLocation !== null;
    if (currentStep === 2) return selectedDate !== null;
    if (currentStep === 3) return selectedTime !== null;
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      {/* กล่อง Modal หลัก */}
      <div className="bg-zinc-950 border border-zinc-800 text-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto relative">
        
        {/* Header ของ Popup */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
          <div className="font-bold text-lg tracking-wider font-serif">
            GRAND SERVICE — BOOKING
          </div>
          <button 
            onClick={handleCloseAll}
            className="text-zinc-400 hover:text-white text-2xl leading-none px-2"
          >
            ×
          </button>
        </div>

        {/* แสดงสินค้าที่กดจองมาจากหน้าหลัก */}
        {selectedProduct && (
          <div className="bg-zinc-900/60 border-b border-zinc-800 px-6 py-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <img 
                src={selectedProduct.image_url || selectedProduct.img} 
                alt={selectedProduct.name} 
                className="w-10 h-10 object-cover rounded border border-zinc-700 bg-zinc-800"
              />
              <div>
                <span className="text-zinc-400 text-xs block">รายการที่ต้องการจอง:</span>
                <span className="font-semibold text-white">{selectedProduct.name}</span>
              </div>
            </div>
            <div className="font-bold text-white">
              ฿ {Number(selectedProduct.price || 0).toLocaleString()}
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8">
          {/* Stepper 4 ขั้นตอน */}
          <div className="flex items-center justify-between max-w-2xl mx-auto mb-8">
            {stepTitles.map((title, index) => {
              const stepNum = index + 1;
              const isActive = currentStep === stepNum;
              const isPassed = currentStep > stepNum;
              return (
                <div key={stepNum} className="flex items-center flex-1">
                  <div className="flex flex-col items-center relative w-full">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-colors ${
                      isActive ? 'bg-white text-black ring-4 ring-zinc-800' : 
                      isPassed ? 'bg-zinc-300 text-black' : 'bg-zinc-900 border-2 border-zinc-700 text-zinc-500'
                    }`}>
                      {isPassed ? '✓' : stepNum}
                    </div>
                    <p className={`text-xs mt-2 font-medium text-center ${isActive || isPassed ? 'text-white' : 'text-zinc-500'}`}>
                      {title}
                    </p>
                    {stepNum !== 4 && (
                      <div className={`absolute top-4 left-[55%] w-[90%] h-0.5 -z-0 ${
                        isPassed ? 'bg-zinc-300' : 'bg-zinc-800'
                      }`}></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* STEP 1: เลือกสถานที่ (ดึงจาก table locations ที่ไม่มีรูป) */}
          {currentStep === 1 && (
            <div className="flex flex-col md:flex-row gap-6 h-[420px]">
              <div className="w-full md:w-2/5 flex flex-col gap-3 overflow-y-auto pr-1">
                <input 
                  type="text" 
                  placeholder="ค้นหาสาขา..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2.5 px-4 bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:ring-1 focus:ring-white outline-none text-sm" 
                />
                {filteredLocations.length === 0 ? (
                  <p className="text-zinc-500 text-center mt-6 text-sm">ไม่พบข้อมูลสาขา</p>
                ) : (
                  filteredLocations.map(loc => (
                    <div 
                      key={loc.id} 
                      onClick={() => setSelectedLocation(loc)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${
                        selectedLocation?.id === loc.id 
                          ? 'border-white bg-zinc-800/90 ring-1 ring-white' 
                          : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-white text-sm">{loc.name}</h4>
                        <span className="text-xs text-zinc-400 shrink-0">📍</span>
                      </div>
                      {loc.description && (
                        <p className="text-xs text-zinc-300 mt-1">{loc.description}</p>
                      )}
                      <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2">{loc.address}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="hidden md:block w-full md:w-3/5 bg-zinc-900 border border-zinc-800 rounded-xl relative overflow-hidden">
                <img src={clockImg} alt="Map" className="w-full h-full object-cover opacity-75" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-max">
                  <div className="bg-zinc-950/90 text-white border border-zinc-700 px-5 py-2 rounded-full text-sm font-medium shadow-xl backdrop-blur-md">
                    📍 {selectedLocation ? selectedLocation.name : 'กรุณาเลือกสาขาด้านซ้าย'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: เลือกวันที่ */}
          {currentStep === 2 && (
            <div className="max-w-md mx-auto border border-zinc-800 rounded-xl p-6 bg-zinc-900">
              <h3 className="text-center font-bold text-lg mb-4">พฤศจิกายน 2026</h3>
              <div className="grid grid-cols-7 gap-2 text-center mb-2">
                {['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'].map(d => (
                  <div key={d} className="font-bold text-zinc-500 text-xs">{d}</div>
                ))}
                {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={`w-9 h-9 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                      selectedDate === day ? 'bg-white text-black font-bold' : 'hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: เลือกเวลา */}
          {currentStep === 3 && (
            <div className="max-w-xl mx-auto">
              <p className="text-zinc-400 text-sm mb-4 text-center">
                วันที่ {selectedDate} พฤศจิกายน 2026 — สาขา {selectedLocation?.name}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {timeSlots.map(time => {
                  const isBooked = bookedTimes.includes(time);
                  return (
                    <button
                      key={time}
                      disabled={isBooked}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 rounded-lg border text-sm font-medium transition-all ${
                        isBooked 
                          ? 'bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed line-through' 
                          : selectedTime === time 
                            ? 'bg-white border-white text-black font-bold' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      {time} {isBooked && '(เต็ม)'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: ยืนยันการจอง */}
          {currentStep === 4 && (
            <div className="max-w-lg mx-auto bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4">
              <h3 className="font-bold text-lg border-b border-zinc-800 pb-3">ตรวจสอบรายละเอียดการจอง</h3>
              <div className="text-sm space-y-2 text-zinc-300">
                <p><span className="text-zinc-500">สาขา:</span> {selectedLocation?.name}</p>
                <p><span className="text-zinc-500">ที่อยู่:</span> {selectedLocation?.address}</p>
                <p><span className="text-zinc-500">วันที่นัดหมาย:</span> {selectedDate} พฤศจิกายน 2026</p>
                <p><span className="text-zinc-500">เวลา:</span> {selectedTime} น.</p>
                {selectedProduct && (
                  <p><span className="text-zinc-500">สินค้า:</span> {selectedProduct.name} (฿{Number(selectedProduct.price).toLocaleString()})</p>
                )}
              </div>
              <button 
                onClick={() => setShowConfirmPopup(true)}
                className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3 rounded-xl mt-4 transition-colors"
              >
                ยืนยันการจองคิว
              </button>
            </div>
          )}

          {/* ปุ่มควบคุม ย้อนกลับ / ถัดไป */}
          <div className="flex justify-between pt-6 border-t border-zinc-800 mt-8">
            <button 
              onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))} 
              disabled={currentStep === 1}
              className={`px-5 py-2 rounded-lg text-sm font-medium border border-zinc-800 ${
                currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              ← ย้อนกลับ
            </button>
            {currentStep < 4 && (
              <button 
                onClick={() => setCurrentStep(prev => Math.min(prev + 1, 4))}
                disabled={!canGoNext()}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${
                  canGoNext() ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                ถัดไป →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* POPUP ยืนยัน (Confirm / Cancel) */}
      {showConfirmPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <h4 className="text-lg font-bold text-white mb-2">ยืนยันการทำรายการ?</h4>
            <p className="text-zinc-400 text-sm mb-6">
              คุณต้องการยืนยันการจองคิววันที่ {selectedDate} พ.ย. 2026 เวลา {selectedTime} น. ใช่หรือไม่?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmPopup(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 font-medium text-sm"
              >
                ยกเลิก (Cancel)
              </button>
              <button 
                onClick={handleConfirmSubmit}
                className="flex-1 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-sm"
              >
                ยืนยัน (Confirm)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP แจ้งเตือนผลลัพธ์ (Alert) */}
      {alertInfo.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className={`text-4xl mb-3 ${alertInfo.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {alertInfo.type === 'success' ? '✓' : '✕'}
            </div>
            <h4 className="text-lg font-bold text-white mb-2">
              {alertInfo.type === 'success' ? 'ดำเนินการสำเร็จ' : 'ไม่สามารถจองได้'}
            </h4>
            <p className="text-zinc-400 text-sm mb-6">{alertInfo.message}</p>
            <button 
              onClick={() => alertInfo.type === 'success' ? handleCloseAll() : setAlertInfo({ ...alertInfo, show: false })}
              className="w-full py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-sm"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}