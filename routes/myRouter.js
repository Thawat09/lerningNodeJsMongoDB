const express = require('express')
const router = express.Router()
const Product = require('../model/products') //เรียกใชงาน model
const multer = require('multer') //อัพโหลดไฟล์

const storage = multer.diskStorage({
    destination: ((req, file, cb) => {
        cb(null, './public/images/products') //ตำแหน่งจัดเก็บไฟล์
    }),
    filename: ((req, file, cb) => {
        cb(null, Date.now() + '.jpg') //เปลี่ยนชื่อไฟล์ให้เป็นเวลาที่อัพโหลด ป้องกันชื่อซ้ำ
    })
})

const upload = multer({ //เริ่มต้นอัพโหลด
    storage: storage
})

router.get('/', (req, res) => {
    Product.find().exec((err, doc) => {
        res.render('index', {products:doc})
    })
})

router.get('/add-product', (req, res) => {
    //session
    if(req.session.login) { //ถ้ามีการล็อกอินแล้วให้แสดงหน้า form
        res.render('form')
    } else {
        res.render('admin') //ถ้ายังไม่มีการล็อกอินให้แสดงหน้า admin
    }

    // //cookie
    // if(req.cookies.login) { //ถ้ามีการล็อกอินแล้วให้แสดงหน้า form
    //     res.render('form')
    // } else {
    //     res.render('admin') //ถ้ายังไม่มีการล็อกอินให้แสดงหน้า admin
    // }
})

router.get('/manage', (req, res) => {
    //session
    if(req.session.login) {
        Product.find().exec((err, doc) => {
            res.render('manage', {products:doc})
        })
    } else {
        res.render('admin')
    }

    // //cookie
    // if(req.cookies.login) {
    //     Product.find().exec((err, doc) => {
    //         res.render('manage', {products:doc})
    //     })
    // } else {
    //     res.render('admin')
    // }
})

//session
router.get('/logout', (req, res) => { //เคลียร์ session ที่สร้างเมื่อล็อกอิน
    req.session.destroy((err) => {
        res.redirect('/manage')
    })
})

// //cookie
// router.get('/logout', (req, res) => { //เคลียร์ cookie ที่สร้างเมื่อล็อกอิน
//     res.clearCookie('username')
//     res.clearCookie('password')
//     res.clearCookie('login')
//     res.redirect('/manage')
// })

router.get('/delete/:id', (req, res) => { //ลบข้อมูลสินค้า
    Product.findByIdAndDelete(req.params.id, {useFindAndModify: false}).exec(err => {
        if(err) console.log(err)
        res.redirect('/manage')
    })
})

router.get('/:id', (req, res) => { //ดูรายละเอียดสินค้า
    const product_id = req.params.id
    Product.findOne({_id:product_id}).exec((err, doc) => {
        res.render('product', {product:doc}) //ให้ไปที่หน้า product
    })
})

router.post('/insert', upload.single("image"), (req, res) => { //เพิ่มสินค้า
    let data = new Product({
        name:req.body.name,
        price:req.body.price,
        description:req.body.description,
        image:req.file.filename
    })
    Product.saveProduct(data, (err) => {
        if(err) console.log(err)
        res.redirect('/') //บันทึกเสร็จให้กลับไปหน้าแรก
    })
})

router.post('/edit', (req, res) => { //เแก้ไขข้อมูลสินค้า
    const edit_id = req.body.edit_id
    Product.findOne({_id:edit_id}).exec((err, doc) => {
        //นำข้อมูลเดิมที่ต้องการแก้ไขไปแสดงในแบบฟอร์ม
        res.render('edit', {product:doc})
    })
})

router.post('/update', (req, res) => { //อัพเดตสินค้า (ต่อจากแก้ไข)
    //ข้อมูลใหม่ที่ถูกส่งมาจากฟอร์มแก้ไข
    const update_id = req.body.update_id
    let data = {
        name:req.body.name,
        price:req.body.price,
        description:req.body.description
    }
    //อัพเดตข้อมูล
    Product.findByIdAndUpdate(update_id, data, {useFindAndModify: false}).exec(err => {
        if(err) console.log(err)
        res.redirect('/manage')
    })
})

//session
router.post('/login', (req, res) => { //ตรวจสอบสิทธิ์การเข้าถึงหน้า admin
    const username = req.body.username
    const password = req.body.password
    const timeExpire = new Date().getTime() + (60 * 1000) //กำหนดเวลาที่จะหมดอายุการเข้าถึงหน้า admin
    if(username == 'admin' && password == 'admin') {
        //สร้าง session
        req.session.username = username
        req.session.password = password
        req.session.login = true
        req.session.cookie.maxAge = timeExpire
        res.redirect('/manage')
    } else {
        res.render('404')
    }
})

////cookie
// router.post('/login', (req, res) => { //ตรวจสอบสิทธิ์การเข้าถึงหน้า admin
//     const username = req.body.username
//     const password = req.body.password
//     const timeExpire = new Date().getTime() + (60 * 1000) //กำหนดเวลาที่จะหมดอายุการเข้าถึงหน้า admin
//     if(username == 'admin' && password == 'admin') {
//         //สร้าง cookie
//         res.cookie('username', username, {maxAge:timeExpire})
//         res.cookie('password', password, {maxAge:timeExpire})
//         res.cookie('login', true, {maxAge:timeExpire})
//         res.redirect('/manage')
//     } else {
//         res.render('404')
//     }
// })

module.exports = router