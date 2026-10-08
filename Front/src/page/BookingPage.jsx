import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // ดึงข้อมูลสินค้าและสถานที่จาก API ของเพื่อนทันทีที่เปิดหน้านี้
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const productRes = await axiosClient.get('/products');
        setProducts(productRes.data);
        
        // ถ้ามี API สถานที่ ให้เอาคอมเมนต์ออก
        // const locationRes = await axiosClient.get('/locations');
        // setLocations(locationRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchInitialData();
  }, []);

  // ฟังก์ชันยิง API บันทึกการจองไปที่ backend ของเรา (ทำงานใน Step 5)
  const submitBooking = async () => {
    try {
      const inventoryId = selectedProducts[0]?.id; 
      
      const payload = {
        booking_date: `2026-10-${selectedDate.toString().padStart(2, '0')}`,
        booking_time: selectedTime,
        inventory_id: inventoryId,
        customer_id: 'ใส่-UUID-ลูกค้าที่นี่-ถ้ามีระบบ-login-แล้ว', 
        note: `สถานที่: ${selectedLocation?.name}`
      };

      const response = await axiosClient.post('/bookings', payload);
      alert('จองสำเร็จ! รหัสการจองของคุณคือ ' + response.data.data[0].booking_number);
      
      setCurrentStep(1);
      setSelectedProducts([]);
      
    } catch (error) {
      console.error('Booking failed:', error);
      alert('เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  const timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

  const toggleProduct = (product) => {
    const exists = selectedProducts.find(p => p.id === product.id);
    if (exists) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const renderStep1 = () => (
    <div className="flex flex-col md:flex-row gap-6 h-[600px]">
      <div className="w-full md:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
        <div className="relative">
          <input type="text" placeholder="ค้นหาสถานที่..." className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium">ใกล้ฉัน</button>
          <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium">ทั้งหมด</button>
        </div>
        
        {locations.length === 0 ? <p className="text-gray-500 text-center mt-4 text-sm">ไม่มีข้อมูลสถานที่</p> : locations.map(loc => (
          <div 
            key={loc.id} 
            onClick={() => setSelectedLocation(loc)}
            className={`p-4 border rounded-xl cursor-pointer transition-all flex gap-4 ${selectedLocation?.id === loc.id ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'hover:border-blue-300'}`}
          >
            <img src={loc.img || 'https://via.placeholder.com/150'} alt={loc.name} className="w-20 h-20 object-cover rounded-lg" />
            <div>
              <h4 className="font-bold text-gray-800">{loc.name}</h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{loc.address}</p>
              <p className="text-xs text-gray-400 mt-2">📍 {loc.distance || 'ไม่ระบุระยะทาง'}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden md:block w-full md:w-2/3 bg-gray-200 rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-100/50 flex items-center justify-center flex-col">
          <div className="text-4xl mb-2">📍</div>
          <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-medium shadow-lg">
            {selectedLocation ? selectedLocation.name : 'กรุณาเลือกสถานที่'}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">เลือกสินค้า / บริการ</h2>
      <input type="text" placeholder="ค้นหาสินค้า..." className="w-full p-3 border rounded-lg mb-4 outline-none focus:border-blue-500" />
      
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['ทั้งหมด', 'อาหาร & เครื่องดื่ม', 'บริการเสริม', 'สินค้า', 'อื่นๆ'].map((cat, idx) => (
          <button key={idx} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${idx === 0 ? 'bg-blue-600 text-white' : 'border bg-white text-gray-600'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {products.length === 0 ? <p className="text-gray-500 text-center mt-4 text-sm">กำลังโหลดข้อมูลสินค้าจาก API...</p> : products.map(product => {
          const isSelected = selectedProducts.some(p => p.id === product.id);
          return (
            <div 
              key={product.id} 
              onClick={() => toggleProduct(product)}
              className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${isSelected ? 'border-blue-600 bg-blue-50' : 'hover:border-blue-300'}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${isSelected ? 'border-blue-600' : 'border-gray-300'}`}>
                {isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>}
              </div>
              <img src={product.img || 'https://via.placeholder.com/80'} alt={product.name} className="w-16 h-16 object-cover rounded-lg mr-4" />
              <div className="flex-1">
                <h4 className="font-bold text-gray-800">{product.name}</h4>
                <p className="text-sm text-gray-500">{product.desc || 'ไม่มีคำอธิบาย'}</p>
                <p className="text-xs text-gray-400 mt-1">คงเหลือ {product.stock || 0} ชิ้น 📍</p>
              </div>
              <div className="font-bold text-lg text-gray-800">฿ {product.price || 0}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStep3 = () => {
    const days = Array.from({length: 31}, (_, i) => i + 1);
    return (
      <div className="max-w-2xl mx-auto border rounded-xl p-8 shadow-sm bg-white">
        <h2 className="text-xl font-bold mb-6">เลือกวันที่</h2>
        <div className="flex justify-between items-center mb-6">
          <button className="text-gray-400 hover:text-blue-600">{'<'}</button>
          <h3 className="text-lg font-bold">ตุลาคม 2026</h3>
          <button className="text-gray-400 hover:text-blue-600">{'>'}</button>
        </div>
        <div className="grid grid-cols-7 gap-y-6 gap-x-2 text-center mb-8">
          {['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'].map(d => <div key={d} className="font-bold text-gray-600 text-sm">{d}</div>)}
          <div className="text-gray-300">28</div><div className="text-gray-300">29</div><div className="text-gray-300">30</div>
          {days.map(day => (
             <div 
              key={day} 
              onClick={() => setSelectedDate(day)}
              className={`w-10 h-10 mx-auto flex items-center justify-center rounded-full cursor-pointer text-sm font-medium transition-colors
                ${selectedDate === day ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-100 text-gray-700'}
              `}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-2">เลือกเวลา</h2>
      <p className="text-gray-600 mb-6">เวลาที่ว่าง</p>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-8">
        {timeSlots.map(time => (
          <button
            key={time}
            onClick={() => setSelectedTime(time)}
            className={`py-3 rounded-lg border text-sm font-medium transition-all ${
              selectedTime === time 
                ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm ring-1 ring-blue-600' 
                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400'
            }`}
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">สรุปการจอง</h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex gap-4 mb-4">
              <img src={selectedLocation?.img || 'https://via.placeholder.com/80'} className="w-20 h-20 object-cover rounded-lg" />
              <div>
                <p className="text-blue-600 font-bold text-sm">📍 {selectedLocation?.name || 'ไม่ได้ระบุสถานที่'}</p>
                <p className="text-gray-500 text-sm mt-1">{selectedLocation?.address}</p>
              </div>
            </div>
            <div className="border-t pt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl text-gray-400">📅</span>
                <div>
                  <p className="text-xs text-gray-500">วันที่</p>
                  <p className="font-medium text-sm">{selectedDate || '-'} ตุลาคม 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl text-blue-500">🕒</span>
                <div>
                  <p className="text-xs text-gray-500">เวลา</p>
                  <p className="font-medium text-sm text-blue-600">{selectedTime || '-'} น.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h4 className="font-bold text-blue-600 mb-4">สินค้า / บริการ</h4>
            <div className="space-y-3 border-b pb-4 mb-4">
              {selectedProducts.map(p => (
                <div key={p.id} className="flex justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <img src={p.img || 'https://via.placeholder.com/80'} className="w-10 h-10 rounded-md" />
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-gray-500 text-xs">฿ {p.price || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">{p.quantity}</span>
                    <span className="font-bold">฿ {(p.price || 0) * p.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-lg font-bold">
              <span>รวมทั้งหมด</span>
              <span className="text-blue-600">฿ {calculateTotal()}</span>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 bg-white p-6 rounded-xl border shadow-sm h-fit">
          <h3 className="font-bold mb-4">ตะกร้าสินค้า ({selectedProducts.length} รายการ)</h3>
          <button 
            onClick={submitBooking}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mb-3 shadow-md transition-colors"
          >
            ยืนยันการจอง
          </button>
          <button onClick={handleBack} className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors">
            ย้อนกลับ
          </button>
        </div>
      </div>
    </div>
  );

  const stepTitles = ['เลือกสถานที่', 'เลือกสินค้า', 'เลือกวันที่', 'เลือกเวลา', 'ยืนยันการจอง'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-800 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-lg">
          <span>📅</span> Booking
        </div>
      </header>

      <div className="bg-white p-4 sm:p-8 m-4 sm:m-8 rounded-2xl shadow-sm border min-h-[80vh]">
        <div className="flex items-center justify-between max-w-4xl mx-auto mb-10 overflow-x-auto pb-4">
          {stepTitles.map((title, index) => {
            const stepNum = index + 1;
            const isActive = currentStep === stepNum;
            const isPassed = currentStep > stepNum;
            
            return (
              <div key={stepNum} className="flex items-center flex-1 min-w-[120px]">
                <div className="flex flex-col items-center relative w-full">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-colors ${
                    isActive ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 
                    isPassed ? 'bg-blue-600 text-white' : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}>
                    {isPassed ? '✓' : stepNum}
                  </div>
                  <p className={`text-xs mt-2 font-medium ${isActive || isPassed ? 'text-blue-600' : 'text-gray-400'}`}>
                    {title}
                  </p>
                  {stepNum !== 5 && (
                    <div className={`absolute top-4 left-[60%] w-[80%] h-0.5 -z-0 ${
                      isPassed ? 'bg-blue-600' : 'bg-gray-200'
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
          <div className="max-w-4xl mx-auto flex justify-between pt-6 border-t mt-auto">
            <button 
              onClick={handleBack} 
              disabled={currentStep === 1}
              className={`px-6 py-2.5 rounded-lg font-medium border ${currentStep === 1 ? 'opacity-0 cursor-default' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              ย้อนกลับ
            </button>
            <button 
              onClick={handleNext}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-colors"
            >
              ถัดไป →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}