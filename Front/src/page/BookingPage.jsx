import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

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

  const submitBooking = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const customerId = storedUser.id || 'guest';

      const inventoryId = selectedProducts[0]?.id; 
      
      const payload = {
        booking_date: `2026-10-${selectedDate.toString().padStart(2, '0')}`,
        booking_time: selectedTime,
        inventory_id: inventoryId,
        location_name: selectedLocation?.name || '',          
        product_name: selectedProducts.map(p => p.name).join(', '), 
        customer_id: customerId,
        note: `สาขา: ${selectedLocation?.name}`
      };

      await axiosClient.post('/bookings', payload);
      alert('จองคิวสำเร็จเรียบร้อยแล้ว ระบบกำลังรอการอนุมัติจากแอดมินครับ');
      
      setCurrentStep(1);
      setSelectedProducts([]);
      setSelectedLocation(null);
      
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

  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (loc.address && loc.address.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

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
              className={`p-4 border rounded-xl cursor-pointer transition-all flex gap-4 ${selectedLocation?.id === loc.id ? 'border-white bg-zinc-800/80 ring-1 ring-white' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'}`}
            >
              <img 
                src={loc.img} 
                alt={loc.name} 
                className="w-20 h-20 object-cover rounded-lg border border-zinc-700 bg-zinc-800" 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
              />
              <div>
                <h4 className="font-bold text-white">{loc.name}</h4>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{loc.address}</p>
                <p className="text-xs text-zinc-500 mt-2">📍 {loc.distance || 'สาขาใกล้เคียง'}</p>
              </div>
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
          <div className="bg-zinc-900/90 text-white border border-zinc-700 px-6 py-3 rounded-full font-medium shadow-2xl backdrop-blur-md flex items-center gap-2">
            <span className="text-red-500 text-lg animate-bounce">📍</span>
            {selectedLocation ? `พิกัด: ${selectedLocation.name}` : 'กรุณาเลือกสถานที่เพื่อดูแผนที่'}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    return (
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
                    src={product.img} 
                    alt={product.name} 
                    className="w-20 h-20 object-cover rounded-lg mr-4 border border-zinc-800 bg-zinc-800" 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/80'; }}
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
  };

  const renderStep3 = () => {
    const days = Array.from({length: 31}, (_, i) => i + 1);
    return (
      <div className="max-w-2xl mx-auto border border-zinc-800 rounded-xl p-8 shadow-sm bg-zinc-900 text-white">
        <h2 className="text-xl font-bold mb-6">เลือกวันที่</h2>
        <div className="flex justify-between items-center mb-6">
          <button className="text-zinc-500 hover:text-white">{'<'}</button>
          <h3 className="text-lg font-bold">ตุลาคม 2026</h3>
          <button className="text-zinc-500 hover:text-white">{'>'}</button>
        </div>
        <div className="grid grid-cols-7 gap-y-6 gap-x-2 text-center mb-8">
          {['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'].map(d => <div key={d} className="font-bold text-zinc-400 text-sm">{d}</div>)}
          <div className="text-zinc-700">28</div><div className="text-zinc-700">29</div><div className="text-zinc-700">30</div>
          {days.map(day => (
             <div 
              key={day} 
              onClick={() => setSelectedDate(day)}
              className={`w-10 h-10 mx-auto flex items-center justify-center rounded-full cursor-pointer text-sm font-medium transition-colors
                ${selectedDate === day ? 'bg-white text-black shadow-md font-bold' : 'hover:bg-zinc-800 text-zinc-300'}
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
    <div className="max-w-3xl mx-auto text-white">
      <h2 className="text-xl font-bold mb-2">เลือกเวลา</h2>
      <p className="text-zinc-400 mb-6">เวลาที่ว่าง</p>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-8">
        {timeSlots.map(time => (
          <button
            key={time}
            onClick={() => setSelectedTime(time)}
            className={`py-3 rounded-lg border text-sm font-medium transition-all ${
              selectedTime === time 
                ? 'bg-zinc-800 border-white text-white shadow-sm ring-1 ring-white' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600'
            }`}
          >
            {time}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="max-w-5xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-6">สรุปการจอง</h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm">
            <div className="flex gap-4 mb-4">
              <img 
                src={selectedLocation?.img} 
                className="w-20 h-20 object-cover rounded-lg border border-zinc-700 bg-zinc-800" 
                alt="Location" 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
              />
              <div>
                <p className="text-zinc-300 font-bold text-sm">📍 {selectedLocation?.name || 'ไม่ได้ระบุสถานที่'}</p>
                <p className="text-zinc-400 text-sm mt-1">{selectedLocation?.address}</p>
              </div>
            </div>
            <div className="border-t border-zinc-800 pt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl text-zinc-500">📅</span>
                <div>
                  <p className="text-xs text-zinc-500">วันที่</p>
                  <p className="font-medium text-sm text-zinc-200">{selectedDate || '-'} ตุลาคม 2026</p>
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
              {selectedProducts.map(p => (
                <div key={p.id} className="flex justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <img 
                      src={p.img} 
                      className="w-10 h-10 object-cover rounded-md border border-zinc-800 bg-zinc-800" 
                      alt={p.name} 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/80'; }}
                    />
                    <div>
                      <p className="font-medium text-zinc-200">{p.name}</p>
                      <p className="text-zinc-500 text-xs">฿ {p.price || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-400">{p.quantity}</span>
                    <span className="font-bold text-white">฿ {(p.price || 0) * p.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-zinc-300">รวมทั้งหมด</span>
              <span className="text-white">฿ {calculateTotal()}</span>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm h-fit">
          <h3 className="font-bold mb-4 text-white">ตะกร้าสินค้า ({selectedProducts.length} รายการ)</h3>
          <button 
            onClick={submitBooking}
            className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3 rounded-xl mb-3 shadow-md transition-colors"
          >
            ยืนยันการจอง
          </button>
          <button onClick={handleBack} className="w-full bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold py-3 rounded-xl hover:bg-zinc-800 transition-colors">
            ย้อนกลับ
          </button>
        </div>
      </div>
    </div>
  );

  const stepTitles = ['เลือกสถานที่', 'เลือกสินค้า', 'เลือกวันที่', 'เลือกเวลา', 'ยืนยันการจอง'];

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-zinc-900 border-b border-zinc-800 text-white p-4 flex justify-between items-center px-8">
        <div className="flex items-center gap-2 font-bold text-lg tracking-wider font-serif">
          <span>📅</span> GRAND SERVICE — BOOKING
        </div>
      </header>

      <div className="bg-zinc-950 border border-zinc-800 p-4 sm:p-8 m-4 sm:m-8 rounded-2xl shadow-xl min-h-[80vh]">
        <div className="flex items-center justify-between max-w-4xl mx-auto mb-10 overflow-x-auto pb-4">
          {stepTitles.map((title, index) => {
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
              className={`px-6 py-2.5 rounded-lg font-medium border border-zinc-800 ${currentStep === 1 ? 'opacity-0 cursor-default' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
            >
              ย้อนกลับ
            </button>
            <button 
              onClick={handleNext}
              className="px-8 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-lg font-bold shadow-md transition-colors"
            >
              ถัดไป →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}