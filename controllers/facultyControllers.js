const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const conn = require('../database/db');
const { hashPassword, secretKey } = require('../utils/authUtils');
const { facultyValid } = require('../validators/joivalidation');

const signupFaculty = async (req, res) => {
    try {
        const { error, value } = facultyValid.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message })
        }
        const details = req.body;
        const classId = details.class_id;
        const checkExistingFacultyQuery = `SELECT * FROM faculty WHERE class_id = ?`

        conn.query(checkExistingFacultyQuery, [classId], async (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Error checking existing faculty" })
            }
            if (result.length > 0) {
                return res.status(400).send("Class already has a faculty assigned")
            }

            const insertFacultyDetails = `INSERT INTO faculty (faculty_name, faculty_username, faculty_email, faculty_password, class_id, created) VALUES ?`;
            const facultyDatas = details.map(fact => [
                fact.faculty_name,
                fact.faculty_username,
                fact.faculty_email,
                hashPassword(fact.faculty_password),
                fact.class_id,
                new Date()
            ]);
            await conn.query(insertFacultyDetails, [facultyDatas], (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send("Error inserting data")
                    return;
                }
                res.status(200).send(result);
            })
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Something went wrong" })
    }
}


const loginFaculty = async (req, res) => {
    try {
        const { faculty_username, faculty_password } = req.body;

        const selectFacultyQuery = `SELECT * FROM faculty WHERE status = 1 AND faculty_username = ?`;
        await conn.query(selectFacultyQuery, [faculty_username], async (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({ message: "Error logging in" })
                return
            }
            if (result.length === 0) {
                res.status(404).send("Faculty not found")
                return
            }
            const faculty = result[0];
            const isPasswrodValid = bcrypt.compareSync(faculty_password, faculty.faculty_password)
            if (!isPasswrodValid) {
                res.status(401).send("Invalid credentials");
                return
            }
            const token = jwt.sign({
                facultyId: faculty.faculty_id,
                role: "faculty"
            },
                secretKey, { expiresIn: '1h' }
            );
            console.log(result);
            res.status(200).json({ token: token, message: "Faculty logged in successfully" })
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}



const facultyList = async (req, res) =>{
    try {
        const getFacultyList = `SELECT * FROM faculty`
        await conn.query(getFacultyList, (err, result) =>{
            if (err) {
                console.log(err);
                res.status(500).json({ message : "Error retriving data " });
                return
            }
            res.status(200).json(result)
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message : "Something went wrong " })
    }
}
 
module.exports = {
    signupFaculty,
    loginFaculty,
    facultyList
}