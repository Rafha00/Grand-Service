import { supabase } from '../Config/supabaseClient.js';

export const getLocations = async (req, res) => {
  try {
    // เปลี่ยนจาก .from('locations') เป็น .from('brands')
    const { data, error } = await supabase
      .from('brands') 
      .select('*');

    if (error) throw error;
    
    // แปลงข้อมูลให้หน้าเว็บใช้งานได้
    const formattedData = data.map(brand => ({
        id: brand.id,
        name: brand.name,
        address: brand.description || 'ไม่มีรายละเอียดที่อยู่',
        img: brand.logo_url || 'https://via.placeholder.com/150',
        distance: 'สาขาใกล้เคียง'
    }));

    return res.status(200).json({ success: true, data: formattedData });
  } catch (err) {
    console.log("Error in getLocations:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};