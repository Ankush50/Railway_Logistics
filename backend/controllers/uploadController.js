const xlsx = require('xlsx');
const RailwayService = require('../models/RailwayService');

// Upload Excel file and import services
exports.uploadExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    console.log('Uploaded file:', req.file.originalname, 'Size:', req.file.size);
    
    // Read the Excel file
    const workbook = xlsx.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    console.log('Parsed data rows:', data.length);
    console.log('Sample row:', data[0]);
    
    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'No data found in Excel file' });
    }
    
         // Transform data to match our schema
     const services = data.map((item, index) => {
       // Handle date conversion - Excel dates might come as numbers or strings
       let dateValue = item.Date || item.date;
       if (dateValue) {
         // If it's a number (Excel date serial), convert it
         if (typeof dateValue === 'number') {
           const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
           dateValue = excelDate.toISOString().split('T')[0];
         } else if (typeof dateValue === 'string') {
           // Try to parse various date formats
           const parsedDate = new Date(dateValue);
           if (!isNaN(parsedDate.getTime())) {
             dateValue = parsedDate.toISOString().split('T')[0];
           }
         }
       }
       
       const service = {
         route: item.Route || item.route || `Route ${index + 1}`,
         departure: item.Departure || item.departure || '08:00',
         arrival: item.Arrival || item.arrival || '18:00',
         capacity: parseInt(item.Capacity || item.capacity || 50),
         available: parseInt(item.Available || item.available || 30),
         pricePerTon: parseInt(item['Price/Ton'] || item.pricePerTon || 2000),
         contact: item.Contact || item.contact || '9876543210',
         date: dateValue || new Date().toISOString().split('T')[0]
       };
       
       // Validate required fields
       if (!service.route || !service.departure || !service.arrival) {
         throw new Error(`Row ${index + 1}: Missing required fields (route, departure, arrival)`);
       }
       
       return service;
     });
    
    console.log('Transformed services:', services.length);
    
    // Insert into database
    const result = await RailwayService.insertMany(services);
    
    // Clean up uploaded file
    const fs = require('fs');
    fs.unlinkSync(req.file.path);
    
    res.status(200).json({ 
      success: true, 
      message: `${result.length} services imported successfully`,
      count: result.length
    });
  } catch (err) {
    console.error('Excel upload error:', err);
    
    // Clean up uploaded file on error
    if (req.file) {
      const fs = require('fs');
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupErr) {
        console.error('Failed to cleanup file:', cleanupErr);
      }
    }
    
    next(err);
  }
};