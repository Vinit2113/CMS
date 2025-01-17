const express = require('express');
const { verifyingToken, upload } = require('../utils/authUtils')
const router = express.Router();
const classController = require('../controllers/classControllers')
const facultyController = require('../controllers/facultyControllers')
const studentController = require('../controllers/studentControllers')
const documentsController = require('../controllers/documentsControllers')

// Class
router.post('/insert-class', classController.insertClass);
router.get('/class-list', verifyingToken('faculty'),classController.getClassList);
router.post('/assign-class', verifyingToken('faculty'),classController.assignClass )

// Faculty
router.post('/signup', facultyController.signupFaculty);
router.post('/login', facultyController.loginFaculty);
router.get('/list', verifyingToken('faculty'), facultyController.facultyList)

// Students
router.post('/%signup', studentController.signupStudent)
router.post('/%login', studentController.loginStudent)
router.get('/%list', verifyingToken('faculty'),studentController.studentList)

// Documents
router.post('/upload/:class_id', verifyingToken('faculty'), upload.array('files', 5),documentsController.uploadDocuments);
router.get('/download/:document_id', verifyingToken('student'),documentsController.downloadStudentDocs);
router.delete('/delete/:document_id', verifyingToken('faculty'),documentsController.deleteDocumentsFaculty);
router.get('/:class_id/documents', verifyingToken('faculty'), documentsController.documentsList)
module.exports = router 