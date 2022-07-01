//ใช้งาน mongoose
const mongoose = require('mongoose');

//เชื่อมต่อ MongoDB
const dbUrl = 'mongodb://localhost:27017/productDB'
mongoose.connect(dbUrl, { 
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(err => console.log(err));

//ออกแบบ Schema
let productSchema = mongoose.Schema({
    name: String,
    price: Number,
    description: String,
    image: String
})

//สร้าง Model
let Product = mongoose.model('products', productSchema) // product คือชื่อ collection

//ส่งออก Model
module.exports = Product

//ออกแบบ function สำหรับบันทึกข้อมูล
module.exports.saveProduct = ((model, data) => {
    model.save(data)
})