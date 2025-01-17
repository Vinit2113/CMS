const conn = require('../database/db');
const { classValid } = require('../validators/joivalidation')

const insertClass = async (req, res) =>{
    try {
        const { error, value } = classValid.validate(req.body);
        if(error){
            return res.status(400).json({ error: error.details[0].message })
        }
        
        const { class_name, stream_id } = req.body;
        const insertClassQuery = `INSERT INTO class (class_name, stream_id) VALUES (?, ?)`;

        conn.query(insertClassQuery, [class_name, stream_id], (err, result) =>{
            if (err) {
                console.log(err);
                return res.status(500).json({message : "Error insterting class"})
            }
            return res.status(200).json({ message : "Class inserted successfully" })
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send("Something went wrong")
    }
}

const getClassList = async (req, res) =>{
    try {
        const getClassListQuery = `SELECT * FROM class`;
        conn.query(getClassListQuery, (err, result) =>{
            if (err) {
                console.log(err);
                return res.status(500)
            }    
            return res.status(200).send(result)
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send("Something went wrong");
    }
}


const assignClass = async (req, res) => {
    try {
        const { student_email , class_id } = req.body;
        
        const selectStudentQuery = `SELECT student_email FROM students WHERE student_email = ?`;

        await conn.query(selectStudentQuery, [student_email], async (err, result) =>{
            if (err) {
                console.log(err);
                res.status(500).json({ message : "Error finding student" })
                return
            }
            if(result.length === 0 ){
                res.status(404).json({ message : "Student not found" });
                return
            }


            const updateStudentClassQuery = `UPDATE students SET class_id = ?, updated_at = CURRENT_TIMESTAMP WHERE student_email = ?`;
            
            await conn.query(updateStudentClassQuery, [class_id, student_email], (err, result) =>{
                if(err){
                    console.log(err);
                    res.status(500).json({ message : "Error assigning class to student " })
                    return 
                }
                res.status(200).json({ message : "Student assign to class successfully" })
            })
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message : "Something went wrong" })
    }
}

module.exports = {
    insertClass,
    getClassList,
    assignClass
}