import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Navbar from '../layout/Navbar..jsx';

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
const STEP_TITLES = ['เลือกสถานที่', 'เลือกสินค้า', 'เลือกวันที่', 'เลือกเวลา', 'ยืนยันการจอง'];

export default function BookingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
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
    const fetchInitialData = async () => {
      try {
        const [productRes, locationRes] = await Promise.all([
          axiosClient.get('/products'),
          axiosClient.get('/locations')
        ]);

        setProducts(productRes.data.data || productRes.data || []);
        setLocations(locationRes.data.data || locationRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!formattedSelectedDate) return;
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
        if (booked.includes(selectedTime)) {
          setSelectedTime(null);
        }
      } catch (error) {
        console.error('Error fetching booked slots:', error);
      }
    };
    fetchBookedSlots();
  }, [formattedSelectedDate, selectedLocation]);

  const handleConfirmBooking = async () => {
    setShowConfirmModal(false);

    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const customerId = storedUser.id || 'guest';
      const inventoryId = selectedProducts[0]?.id || null;

      const payload = {
        booking_date: formattedSelectedDate,
        booking_time: selectedTime,
        inventory_id: inventoryId,
        location_name: selectedLocation?.name || '',
        product_name: selectedProducts.map(p => p.name).join(', '),
        customer_id: customerId,
        note: `สาขา: ${selectedLocation?.name}`
      };

      await axiosClient.post('/bookings', payload);

      setAlertModal({
        show: true,
        type: 'success',
        title: 'จองคิวสำเร็จเรียบร้อยแล้ว!',
        message: `นัดหมายวันที่ ${selectedDate} ${THAI_MONTHS[currentMonth]} ${currentYear} เวลา ${selectedTime} น. ณ ${selectedLocation?.name || 'สาขาที่เลือก'}`
      });
    } catch (error) {
      console.error('Booking failed:', error);
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
      setCurrentStep(1);
      setSelectedProducts([]);
      setSelectedLocation(null);
      setSelectedDate(null);
      setSelectedTime(null);
      navigate('/home');
    }
  };

  const canGoNext = () => {
    if (currentStep === 1) return selectedLocation !== null;
    if (currentStep === 2) return selectedProducts.length > 0;
    if (currentStep === 3) return selectedDate !== null;
    if (currentStep === 4) return selectedTime !== null;
    return true;
  };

  const handleNext = () => {
    if (!canGoNext()) return;
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const toggleProduct = (product) => {
    const exists = selectedProducts.find(p => p.id === product.id);
    if (exists) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
  };

  const filteredLocations = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return locations.filter(loc =>
      loc.name.toLowerCase().includes(q) ||
      (loc.address && loc.address.toLowerCase().includes(q))
    );
  }, [locations, searchQuery]);

  const renderStep1 = () => (
    <div className="flex flex-col md:flex-row gap-6 h-[600px]">
      <div className="w-full md:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
        <div className="relative">
          <input
            type="text"
            placeholder="ค้นหาสถานที่..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 px-4 bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-zinc-400 outline-none placeholder-zinc-500"
          />
        </div>

        {filteredLocations.length === 0 ? (
          <p className="text-zinc-500 text-center mt-4 text-sm">ไม่พบข้อมูลสถานที่</p>
        ) : (
          filteredLocations.map(loc => (
            <div
              key={loc.id}
              onClick={() => setSelectedLocation(loc)}
              className={`p-4 border rounded-xl cursor-pointer transition-all ${
                selectedLocation?.id === loc.id
                  ? 'border-white bg-zinc-800/80 ring-1 ring-white'
                  : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-white">{loc.name}</h4>
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

      <div className="hidden md:block w-full md:w-2/3 bg-zinc-900 border border-zinc-800 rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40">
          <img
            src="/Image/Clock.png"
            alt="Thailand Map"
            className="w-full h-full object-cover opacity-80"
          />
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center flex-col z-10">
          <div className="bg-zinc-900/90 text-white border border-zinc-700 px-6 py-3 rounded-full font-medium shadow-2xl flex items-center gap-2">
            <span className="text-red-500 text-lg animate-bounce">📍</span>
            {selectedLocation ? `พิกัด: ${selectedLocation.name}` : 'กรุณาเลือกสถานที่เพื่อดูแผนที่'}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-6 border-b border-zinc-800 pb-4">
        <h2 className="text-2xl font-semibold text-white tracking-tight">เลือกนาฬิกาสำหรับจองคิว</h2>
        <p className="text-zinc-400 text-sm mt-1">กรุณาเลือกเรือนเวลาที่ท่านต้องการนัดหมายเข้าชมหรือรับบริการ</p>
      </div>

      <div className="flex flex-col gap-4">
        {products.length === 0 ? (
          <div className="text-center py-10 text-zinc-500">
            <p className="text-sm">กำลังโหลดข้อมูลนาฬิกา...</p>
          </div>
        ) : (
          products.map(product => {
            const isSelected = selectedProducts.some(p => p.id === product.id);
            const thumbUrl = (Array.isArray(product.Product_Images) && product.Product_Images[0]?.image_url) || product.image_url || product.img;
            return (
              <div
                key={product.id}
                onClick={() => toggleProduct(product)}
                className={`flex items-center p-4 bg-zinc-900 border rounded-xl cursor-pointer transition-all shadow-sm hover:shadow ${
                  isSelected ? 'border-white bg-zinc-800/80 ring-1 ring-white' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                  isSelected ? 'border-white bg-white' : 'border-zinc-600'
                }`}>
                  {isSelected && <div className="w-2 h-2 bg-black rounded-full"></div>}
                </div>

                <img
                  src={thumbUrl}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg mr-4 border border-zinc-800 bg-zinc-800"
                />

                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-white">{product.name}</h4>
                  <p className="text-sm text-zinc-400 mt-0.5">{product.desc || 'เรือนเวลาคลาสสิก หรูหรา'}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md font-medium border border-zinc-700">
                      สินค้าพร้อมเข้าชม: {product.stock || 1} เรือน
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-zinc-500 font-medium">ราคาประเมิน</div>
                  <div className="font-semibold text-xl text-white">฿ {Number(product.price || 0).toLocaleString()}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-2xl mx-auto border border-zinc-800 rounded-xl p-8 shadow-sm bg-zinc-900 text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">เลือกวันที่</h2>
        <span className="text-sm font-semibold bg-zinc-800 border border-zinc-700 px-3.5 py-1.5 rounded-lg text-zinc-200">
          {THAI_MONTHS[currentMonth]} {currentYear}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-y-6 gap-x-2 text-center mb-8">
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
              className={`w-10 h-10 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
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
  );

  const renderStep4 = () => (
    <div className="max-w-3xl mx-auto text-white">
      <h2 className="text-xl font-bold mb-2">เลือกเวลา</h2>
      <p className="text-zinc-400 mb-6">
        วันที่ {selectedDate} {THAI_MONTHS[currentMonth]} {currentYear} — สาขา {selectedLocation?.name}
        <span className="text-white text-xs ml-3">(สีขาว = ถูกจองแล้ว)</span>
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-8">
        {TIME_SLOTS.map(time => {
          const isBooked = bookedTimes.includes(time);
          return (
            <button
              key={time}
              disabled={isBooked}
              onClick={() => setSelectedTime(time)}
              className={`py-3 rounded-lg border text-sm font-medium transition-all ${
                isBooked
                  ? 'bg-white border-white text-black font-bold cursor-not-allowed'
                  : selectedTime === time
                    ? 'bg-zinc-800 border-white text-white shadow-sm ring-1 ring-white cursor-pointer'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600 cursor-pointer'
              }`}
            >
              {time} {isBooked && '(เต็ม)'}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="max-w-5xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-6">สรุปการจอง</h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm">
            <div className="mb-4">
              <p className="text-white font-bold text-base">📍 {selectedLocation?.name || 'ไม่ได้ระบุสถานที่'}</p>
              {selectedLocation?.description && (
                <p className="text-zinc-300 text-xs mt-1">{selectedLocation.description}</p>
              )}
              <p className="text-zinc-400 text-sm mt-1">{selectedLocation?.address}</p>
            </div>
            <div className="border-t border-zinc-800 pt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl text-zinc-500">📅</span>
                <div>
                  <p className="text-xs text-zinc-500">วันที่</p>
                  <p className="font-medium text-sm text-zinc-200">
                    {selectedDate || '-'} {THAI_MONTHS[currentMonth]} {currentYear}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl text-zinc-400">🕒</span>
                <div>
                  <p className="text-xs text-zinc-500">เวลา</p>
                  <p className="font-medium text-sm text-white">{selectedTime || '-'} น.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm">
            <h4 className="font-bold text-zinc-300 mb-4">สินค้า / บริการ</h4>
            <div className="space-y-3 border-b border-zinc-800 pb-4 mb-4">
              {selectedProducts.map(p => {
                const thumbUrl = (Array.isArray(p.Product_Images) && p.Product_Images[0]?.image_url) || p.image_url || p.img;
                return (
                  <div key={p.id} className="flex justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <img
                        src={thumbUrl}
                        className="w-10 h-10 object-cover rounded-md border border-zinc-800 bg-zinc-800"
                        alt={p.name}
                      />
                      <div>
                        <p className="font-medium text-zinc-200">{p.name}</p>
                        <p className="text-zinc-500 text-xs">฿ {Number(p.price || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-zinc-400">{p.quantity}</span>
                      <span className="font-bold text-white">฿ {Number((p.price || 0) * p.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-zinc-300">รวมทั้งหมด</span>
              <span className="text-white">฿ {Number(calculateTotal()).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm h-fit">
          <h3 className="font-bold mb-4 text-white">ตะกร้าสินค้า ({selectedProducts.length} รายการ)</h3>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3 rounded-xl mb-3 shadow-md transition-colors cursor-pointer"
          >
            ยืนยันการจอง
          </button>
          <button
            onClick={handleBack}
            className="w-full bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold py-3 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            ย้อนกลับ
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white relative">
      <Navbar />

      <div className="bg-zinc-950 border border-zinc-800 p-4 sm:p-8 m-4 sm:m-8 rounded-2xl shadow-xl min-h-[80vh]">
        <div className="flex items-center justify-between max-w-4xl mx-auto mb-10 overflow-x-auto pb-4">
          {STEP_TITLES.map((title, index) => {
            const stepNum = index + 1;
            const isActive = currentStep === stepNum;
            const isPassed = currentStep > stepNum;

            return (
              <div key={stepNum} className="flex items-center flex-1 min-w-[120px]">
                <div className="flex flex-col items-center relative w-full">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-colors ${
                    isActive ? 'bg-white text-black ring-4 ring-zinc-800' :
                    isPassed ? 'bg-zinc-200 text-black' : 'bg-zinc-900 border-2 border-zinc-700 text-zinc-500'
                  }`}>
                    {isPassed ? '✓' : stepNum}
                  </div>
                  <p className={`text-xs mt-2 font-medium ${isActive || isPassed ? 'text-white' : 'text-zinc-500'}`}>
                    {title}
                  </p>
                  {stepNum !== 5 && (
                    <div className={`absolute top-4 left-[60%] w-[80%] h-0.5 -z-0 ${
                      isPassed ? 'bg-zinc-200' : 'bg-zinc-800'
                    }`}></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>

        {currentStep < 5 && (
          <div className="max-w-4xl mx-auto flex justify-between pt-6 border-t border-zinc-800 mt-auto">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-2.5 rounded-lg font-medium border border-zinc-800 ${currentStep === 1 ? 'opacity-0 cursor-default' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white cursor-pointer'}`}
            >
              ย้อนกลับ
            </button>
            <button
              onClick={handleNext}
              disabled={!canGoNext()}
              className={`px-8 py-2.5 rounded-lg font-bold shadow-md transition-colors ${
                canGoNext()
                  ? 'bg-white hover:bg-zinc-200 text-black cursor-pointer'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              ถัดไป →
            </button>
          </div>
        )}
      </div>

      {/* POPUP ยืนยัน / ยกเลิก */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-4 text-xl">
              📅
            </div>
            <h3 className="text-lg font-bold text-white mb-2">ยืนยันการจองคิว?</h3>
            <p className="text-zinc-400 text-sm mb-6">
              คุณต้องการยืนยันการจองคิววันที่ {selectedDate || '-'} {THAI_MONTHS[currentMonth]} {currentYear} เวลา {selectedTime || '-'} น. ใช่หรือไม่?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 font-medium text-sm transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmBooking}
                className="flex-1 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-sm transition-colors cursor-pointer"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP แจ้งเตือนผลลัพธ์ */}
      {alertModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
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
              className="w-full py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-sm transition-colors cursor-pointer"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}