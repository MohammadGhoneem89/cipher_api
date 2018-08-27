'use strict';

const Username_inValid = "User id is not valid";
const Password_inValid = "Password is not valid";
const Password_inCorect = "Password is not correct";
const error_ip = "Call From Invalid IP";
const policy_data_error = "Password policy data is not availible";
const user_error = "User is not Valide";
const user_isActive_error = "User is not Active";
const user_Success = "User Successfully Validated";
const group_error = "Invalid Group";
const permission_error = "Invalid Permissions.";
const user_data_error = "User data is not available.";
const group_data_error = "Group data is not available";
const permission_data_error = "Permission data is not available";
const permission_granted = "Permission Granted";
const token_inValide = "Token is not Valid";
const token_Valide = "Token is valid";
const error = "Invalid Request";
const Login_attempt_err = "Your Account has been locked due to many wrong attempt";

function raise(errorType,message,routeToUser,displayToUser){
    return {
        "status" : errorType,
        "errorDescription" : message,
        "routeTo" : routeToUser,
        "displayToUser" : displayToUser

    };
}

const errorType = {
    ok   : 'OK',
    warn : 'WARNING',
    err  : 'ERROR'
};

const errorReasons = {
    "Username_inValid" : Username_inValid,
    "Password_inValid" : Password_inValid,
    "Password_inCorect" :Password_inCorect,
    "error_ip" : error_ip,
    "user_error" : user_error,
    "user_Success" : user_Success,
    "user_isActive_error" : user_isActive_error,
    "group_error" : group_error,
    "permission_error" : permission_error,
    "user_data_error" : user_data_error,
    "group_data_error" : group_data_error,
    "permission_data_error" : permission_data_error,
    "permission_granted" : permission_granted,
    "token_inValide" : token_inValide,
    "token_Valide" : token_Valide,
    "error" : error,
    "Login_attempt_err" : Login_attempt_err,
    "policy_data_error" : policy_data_error
};

module.exports = {
    raise: raise,
    errorType: errorType,
    errorReasons: errorReasons

};