const Joi = require('joi');

const collegeValid = Joi.object({
    college_id: Joi.number().integer().positive(),
    college_name: Joi.string().max(25).default("Future World")
});


const streamValid = Joi.object({
    stream_id: Joi.number().integer(),
    streams_name: Joi.string().max(25).allow(null).default("I.T"),
    college_id: Joi.number().integer().allow(null).default(null),
})


const classValid = Joi.object({
    class_id: Joi.number().integer(),
    class_name: Joi.string().max(20).allow(null).default(null),
    stream_id: Joi.number().integer().allow(null).default(null)
})


const documentValid = Joi.object({
    file_name: Joi.string().max(50).allow(null).default(null),
})// file validation type


const facultyValid = Joi.array().items(

    Joi.object({
        faculty_name: Joi.string().max(25),
        faculty_username: Joi.string().max(25),
        faculty_email: Joi.string().email().max(30),
        faculty_password: Joi.string().max(30),
        class_id: Joi.number().integer(),
    })
)


const studentValid = Joi.array().items(
    Joi.object({
        student_name: Joi.string().max(25),
        student_username: Joi.string().max(25),
        student_email: Joi.string().email().max(30),
        student_password: Joi.string().max(30),
        class_id: Joi.number().integer().allow(null).default(null)
    })
)

module.exports = {
    collegeValid,
    streamValid,
    classValid,
    documentValid,
    facultyValid,
    studentValid
};