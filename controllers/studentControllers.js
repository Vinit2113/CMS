const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const conn = require('../database/db');
const { hashPassword, secretKey } = require('../utils/authUtils');
const { studentValid } = require('../validators/joivalidation');

const signupStudent = async (req, res) => {
    try {
        const { error, value } = studentValid.validate(req.body);

        if (error) {
            console.log(error);
            return res.status(400).json({ error: error.details[0].message })
        }
        const details = req.body;
        const insertStudentDetails = `INSERT INTO students (student_name, student_username, student_email, student_password, created_at) VALUES ? `;
        const datas = details.map(stu => [
            stu.student_name,
            stu.student_username,
            stu.student_email,
            hashPassword(stu.student_password),
            new Date()
        ])
        await conn.query(insertStudentDetails, [datas], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({ message: "Error inserting data to students table " })
                return
            }
            console.log(err);
            res.status(500).json({ message: "Data inserted successfully" })
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error " })
    }
}

const loginStudent = async (req, res) => {
    try {
        const { student_username, student_password } = req.body;

        const selectStudentData = `SELECT * FROM students WHERE status = 1 AND student_username = ?`
        await conn.query(selectStudentData, [student_username], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({ message: "Error logging in" })
                return
            }
            if (result.length === 0) {
                res.status(404).json({ message: "Enter Username and Password" })
                return
            }
            const student = result[0];
            const isPasswordValid = bcrypt.compareSync(student_password, student.student_password)
            if (!isPasswordValid) {
                res.status(401).json({ message: "Invalid Credentials" })
                return
            }
            const token = jwt.sign({
                studentId: student.student_id,
                studentPassword: student_password,
                role: 'student'
            },
                secretKey,)
            res.status(200).json({ token: token, message: "Student logged in successfully" })
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error " })
    }
}



const studentList = async ( req, res) =>{
    try {
        const getStudentList = `SELECT * FROM students`;
        await conn.query(getStudentList, (err, result) =>{
            if(err){
                console.log(err);
                res.status(500).json({ message : "Error retriving data" })
                return
            }
            res.status(200).json({result})
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message : "Something went wrong" })
    }
}


module.exports = {
    loginStudent,
    signupStudent,
    studentList
}