

let response = {
    success : (message = '' , data = {}) => {
        return {
            "messageStatus": "SUCCESS",
            "errorDescription": message,
            "errorCode": 200,
            "timestamp": new Date(),
            ...data
        }
    },

    error: (message = '') => {
        return {
            "messageStatus": "ERROR",
            "errorDescription": message,
            "errorCode": 201,
            "timestamp": new Date()
        }
    },
    successWithObject : (name , message = '' , data = {}) => {
        return {
            [name] : {
                data,
                "messageStatus": "SUCCESS",
                "errorDescription": message,
                "errorCode": 200,
                "timestamp": new Date(),
            },
        }
    },


    errorWithStatus: (message = 'Some internal server error' , status = 500) => {
        return {
            "messageStatus": "ERROR",
            "errorDescription": message,
            "errorCode": status,
            "timestamp": new Date()
        }
    },

    errorUI : (name , message = '' , data = {} , routeTo = "") => {
        return {
            [name]: {
                "action": name,
                "data": {
                    "message": {
                        "status": "ERROR",
                        "errorDescription": message,
                        "routeTo": routeTo,
                        "displayToUser": true,
                        "result" : data
                    },
                    "success": false,
                    "token": "",
                    "firstScreen": ""
                }
            }
        }
    } ,


    successUI : (name , message = '' , data = {} , routeTo = "") => {
        return {
            [name]: {
                "action": name,
                "data": {
                    "message": {
                        "status": "OK",
                        "errorDescription": message,
                        "routeTo": routeTo,
                        "displayToUser": true,
                        "result" : data
                    },
                    "success": true,
                    "token": "",
                    "firstScreen": ""
                }
            }
        }
    } 

}


module.exports = {
    success : response.success,
    error : response.error,
    successWithObject : response.successWithObject,
    errorWithStatus : response.errorWithStatus,
    errorUI : response.errorUI,
    successUI : response.successUI
}