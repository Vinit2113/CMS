const jwt = require('jsonwebtoken');
const conn = require('../database/db');
const { documentValid } = require('../validators/joivalidation')
const fs = require('fs')
const path = require('path')


const uploadDocuments = async (req, res) => {
    try {
        const { error, value } = documentValid.validate(req.body);

        if (error) {
            console.log(error);
            return res.status(400).json({ error: error.details[0].message })
        }

        const { class_id } = req.params;

        const { originalname, path } = req.files[0]

        const insertDocumentQuery = `INSERT INTO documents (file_name, file_path, class_id) VALUES (?, ?, ?)`;

        conn.query(insertDocumentQuery, [originalname, path, class_id], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({ message: "Error uploading documents" });
                return
            }
            res.status(200).json({ message: "Document uploaded and stored successfully" })
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" })
    }
}


const downloadStudentDocs = async (req, res) => {
    try {
        const { document_id } = req.params;
        const selectDocumentQuery = `SELECT documents.*, students.class_id as student_class_id
                                     FROM documents
                                     JOIN students ON documents.class_id = students.class_id
                                     WHERE documents.document_id = ?`;

        conn.query(selectDocumentQuery, [document_id], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({ message: "Error fetching documents " })
            }
            if (result.length === 0) {
                res.status(404).send("Documents not found")
                return
            }

            const document = result[0];
            const class_id = document.class_id;
            const student_class_id = document.student_class_id
            const student_id = req.body.student_id;

            if (class_id === student_class_id && student_id === document.student_id) {
                const fileName = document.file_name;
                const fileURL = document.file_path;
                const student_store_folder = 'student/'
                if (!fs.existsSync(student_store_folder)) {
                    fs.mkdirSync(student_store_folder, { recursive: true })
                    /**
                    existsSync will got to give folder path and check if it exists then it will exit from if loop 
                    And  if not then mkdirSync will work 
                    mkdirsync: it use to create the folder if folder doesn't exists in the given destination
                    recursive: true : recursive folder ensure that if the parent folder dosen't exists they are also created 
                    */
                }
                fs.copyFile(fileURL, path.join(student_store_folder, fileName), (err) =>{
                    if (err) {
                        res.status(500).send("Something went wrong")
                        return
                    }

                    res.status(200).send('File Downloaded successfully')
                })
            } else {
                res.status(403).json({message : "Access denied"})
            }
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" })

    }
}


const deleteDocumentsFaculty = async (req, res) =>{
    try {
        const { document_id } = req.params

        const selectDocuments = `SELECT * FROM documents WHERE document_id = ?`;
        await conn.query(selectDocuments, [document_id], (err, result) =>{
            if(err){
                console.log(err);
                res.status(500).send("Error fetching documents ")
                return
            }
            if(result.length === 0){
                res.status(404).send('Document not found')
                return;
            }
            const document = result[0];
            const fileURL = document.file_path;
            const fileName = document.file_name;
            fs.access(fileURL, fs.constants.F_OK, (err) =>{
                /*
                 * fs.access : checks if the file exists in filePath or not 
                 * fs.constants.F_OK : verify if the file is accessible or not 
                 */
                if (err) {
                    console.log(err);
                    return res.status(404).json({ message : "File not found" })
                }
                const deleteDocumentQuery = `DELETE FROM documents WHERE document_id = ` + document_id + ` ` ;
                conn.query(deleteDocumentQuery, [document_id], (err, result) =>{
                    if(err){
                        console.log(err);
                        res.status(500).json({ message : "Error deleting documents" })
                        return
                    }
                })
                fs.unlink(fileURL, (err) =>{
                    if(err) {
                        console.log(err);
                        return res.status(500).json({ message : "Internal server error" })
                    }
                    return res.status(200).json({ message : `Document '${fileName}' deleted successfully`  })
                })
            })
        })


    } catch (error) {
        console.log(error);
        res.status(500).json({ message : "Something went wrong" })
    }
}


const documentsList = async (req, res) =>{
    try {
        
        const { class_id } = req.params;
        const selectDocumentsQuery = `SELECT * FROM documents WHERE class_id = ?`;
        conn.query(selectDocumentsQuery, [class_id], (err, result) =>{
            if(err){
                console.log(err);
                res.status(500).json({message : "Error fetching documents for the class"})
                return
            }
            if(result.length === 0){
                res.status(404).json({message : "No documents found for this class"})
            }
            res.status(200).json(result)
        })
        
    } catch (error) {
        console.log(err);
        res.status(500).json({message : "Something went wrong"})
    }
}




module.exports = {
    uploadDocuments,
    downloadStudentDocs,
    deleteDocumentsFaculty,
    documentsList
}