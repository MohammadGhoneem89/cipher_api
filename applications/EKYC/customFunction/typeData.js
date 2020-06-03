/* eslint-disable eqeqeq */
/* eslint-disable no-console */
'use strict';

const _ = require('lodash');
const moment = require('moment');
const dates = require('../../../lib/helpers/dates');
const uuid = require('uuid/v1');


module.exports = {
   
    identityType: (data,payload,jwt)=>{
        console.log("-----------------------------------------------")
        // let dateOfBirth = _.get(result, "dateOfBirth", undefined);
            // _.get(result, "dateOfBirth", dateOfBirth >= 0 ? dates.MSddMMyyyy(dateOfBirth) : undefined);
           //, true
       // console.log("--------------------------------data 1",data[0].nonIGA.DOB)//.nonIGA.gender
     //   console.log("--------------------------------data 2",dates.MSddMMyyyy(data[0].nonIGA.DOB) )
       
        
       // console.log("--------------------------------payload",payload)

    //    if(dates.MSddMMyyyy(data[0].nonIGA.DOB)===data[0].nonIGA.DOB){
       
        if(data[0].identityType==='NonIGA'){
            if(data[0].nonIGA.gender==='M'){
                console.log("SET-----------")
            }
            else if(data[0].nonIGA.gender==='F'){
                console.log("SET-----------")
            }
            else if(data[0].nonIGA.gender==='O'){
                console.log("SET-----------")
            }
            else{
                throw new Error("Invaliaid gender type");
            }
            if(data[0].nonIGA.nationality.length===3){
                console.log("SET-----------")
            }
            else{
                throw new Error("national should be of 3 digits");
            }
            let date=moment(data[0].nonIGA.DOB, 'DD/MM/YYYY').isValid()
            console.log("--------------------------------data ------------",date)
            let date1=data[0].nonIGA.DOB.split('/')
    
            if(date1[0]<32){
                console.log("--------------------------------true ------------",date1)
                 }
            else{
                console.log("--------------------------------not true------------",date1)
                throw new Error("Date format is not  correct");
            }
            if(date1[1]<13){
                console.log("--------------------------------true ------------",date1)
            }
            else{
                console.log("--------------------------------not true------------",date1)
                throw new Error("Date format is not  correct");
            }

            if(date){
                console.log("true-----------")
               }
               else{
                throw new Error("Date format is not  correct");
               }

           
           // throw new Error("Irrelevent identity Type");
        }
        else if(data[0].identityType==='GCC'){
             
                        if(data[0].GCC.cardCountry.length===3){
                            console.log("SET-----------")
                        }
                        else{
                            throw new Error("cardCountry  should be of 3 digits");
                        }


                        if(data[0].GCC.cardCountry==="BHR"){      //BHR  BAH
                            if(data[0].GCC.nationalID.length===9){
                                console.log("SET-----------")
                            }
                            else{
                                throw new Error("nationalID  should be of 9 digits");
                            }
                        }
                        else if(data[0].GCC.cardCountry==="SAU"){
                            if(data[0].GCC.nationalID.length===10){
                                console.log("SET-----------")
                            }
                            else{
                                throw new Error("nationalID  should be of 10 digits");
                            }
                            
                        }
                        else if(data[0].GCC.cardCountry==="ARE"){
                            if(data[0].GCC.nationalID.length===15){
                                console.log("SET-----------")
                            }
                            else{
                                throw new Error("nationalID  should be of 15 digits");
                            }
                            
                        }
                        else if(data[0].GCC.cardCountry==="KWT"){
                            if(data[0].GCC.nationalID.length===12){
                                console.log("SET-----------")
                            }
                            else{
                                throw new Error("nationalID  should be of 12 digits");
                            }
                        
                        }
                        else if(data[0].GCC.cardCountry==="OMN"){
                            if(data[0].GCC.nationalID.length===8){
                                console.log("SET-----------")
                            }
                            else{
                                throw new Error("nationalID  should be of 8 digits");
                            }
                            
                        }
                        else if(data[0].GCC.cardCountry==="QAT"){
                            if(data[0].GCC.nationalID.length===11){
                                console.log("SET-----------")
                            }
                            else{
                                throw new Error("nationalID  should be of 11 digits");
                            }
                        
                        }
                        else{
                            throw new Error("Irrelevent country code");
                        }
            
        }
        else{
            console.log("ERROR-----------")
            throw new Error("Irrelevent identity Type");
        }

       
       
           
    },
    reviewResult:(data,payload,jwt)=>{
       // console.log("data------   payload------",payload.body.resultGroup[0].reviewResults)
       if(payload.body.resultGroup){
            if(payload.body.mode==="REVIEW" && JSON.stringify(payload.body.resultGroup[0].reviewResults)==='{}'){
                throw new Error("when mode is REVIEW then reviewResults  is mandatory");
            }
        }
    },
    resultGroup:(data,payload,jwt)=>{
        console.log("------payload",payload.body.mode)
       // console.log("------------resultId",payload.body.resultGroup[0].resultId)
        if(payload.body.resultGroup){
            if(payload.body.resultGroup[0].resultId){
                    if(payload.body.mode==="RESOLVE" && payload.body.resultGroup[0].resultId.length===0){
                        throw new Error("resultId  is required if mode is RESOLVE");
                    }
                    else if(payload.body.mode==="REVIEW" && payload.body.resultGroup[0].resultId.length===0){
                        throw new Error("resultId  is required if mode is REVIEW");
                    }
                }
            }
            
       // if(payload.body.mode==="RESOLUTION_MATRIX"){
            if(payload.body.resultGroup){
                console.log("------true---------",payload.body.mode)
                if(payload.body.resultGroup[0].riskId==="" && payload.body.mode==="RESOLUTION_MATRIX"){
                    throw new Error("riskId  is required if mode is RESOLUTION_MATRIX");
                }
                else  if(payload.body.resultGroup[0].statusId==="" && payload.body.mode==="RESOLUTION_MATRIX"){
                    throw new Error("statusId  is required if mode is RESOLUTION_MATRIX");
                }
                else  if(payload.body.resultGroup[0].reasonId==="" && payload.body.mode==="RESOLUTION_MATRIX"){
                    throw new Error("reasonId  is required if mode is RESOLUTION_MATRIX");
                }
            }
            
       // }
        // else if(payload.body.mode==="RESOLUTION_MATRIX"){
        //     if(payload.body.resultGroup[0].riskId===""){
        //         throw new Error("riskId  is required if mode is RESOLUTION_MATRIX");
        //     }
        //     else  if(payload.body.resultGroup[0].statusId===""){
        //         throw new Error("statusId  is required if mode is RESOLUTION_MATRIX");
        //     }
        //     else  if(payload.body.resultGroup[0].reasonId===""){
        //         throw new Error("reasonId  is required if mode is RESOLUTION_MATRIX");
        //     }
            
        // }
    },
    documents:(data,payload,jwt)=>{
         console.log("------documents", payload.body.documents[0].current)
        // console.log("------documents", payload.body.documents[0].expirationDate)
        // console.log("------documents", payload.body.documents[0].dateOfIssue)
        let effectiveDate=moment(payload.body.documents[0].effectiveDate, 'DD/MM/YYYY').isValid()
        let expirationDate=moment(payload.body.documents[0].expirationDate, 'DD/MM/YYYY').isValid()
        let dateOfIssue=moment(payload.body.documents[0].dateOfIssue, 'DD/MM/YYYY').isValid()

        if(payload.body.documents[0].current){
            if(payload.body.documents[0].current==='Y' || payload.body.documents[0].current==="Yes" || payload.body.documents[0].current==='N' || payload.body.documents[0].current==='No' ){
                console.log("true-----------")
            }
            else{
                throw new Error("current  should be Yes or No ");
            }
        }
        if(payload.body.documents[0].legible){
            if(payload.body.documents[0].legible==='Y' || payload.body.documents[0].legible==="Yes" || payload.body.documents[0].legible==='N' || payload.body.documents[0].legible==='No' ){
                console.log("true-----------")
            }
            else{
                throw new Error("legible  should be Yes or No ");
            }
        }
        if(payload.body.documents[0].fileLessDocument){
            if(payload.body.documents[0].fileLessDocument==='Y' || payload.body.documents[0].fileLessDocument==="Yes" || payload.body.documents[0].fileLessDocument==='N' || payload.body.documents[0].fileLessDocument==='No' ){
                console.log("true-----------")
            }
            else{
                throw new Error("fileLessDocument  should be Yes or No ");
            }
        }
        if(payload.body.documents[0].annotatedOtherThenEnglish){
            if(payload.body.documents[0].annotatedOtherThenEnglish==='Y' || payload.body.documents[0].annotatedOtherThenEnglish==="Yes" || payload.body.documents[0].annotatedOtherThenEnglish==='N' || payload.body.documents[0].annotatedOtherThenEnglish==='No' ){
                console.log("true-----------")
            }
            else{
                throw new Error("annotatedOtherThenEnglish  should be Yes or No ");
            }   
        } 
        
        
        // console.log("--------------------------------data ------------",effectiveDate)
        // console.log("--------------------------------data ------------",expirationDate)
        // console.log("--------------------------------data ------------",dateOfIssue)
       // let spliceDate1=data[0].DOB.split('/')

        let effectiveDate1=payload.body.documents[0].effectiveDate.split('/')
        let expirationDate2=payload.body.documents[0].expirationDate.split('/')
        let dateOfIssue3=payload.body.documents[0].dateOfIssue.split('/')

        if(effectiveDate1[0]<32  && expirationDate2[0]<32  && dateOfIssue3[0]<32){
            console.log("--------------------------------true ------------",effectiveDate1)
            console.log("--------------------------------true ------------",expirationDate2)
            console.log("--------------------------------true ------------",dateOfIssue3)
        }
        else{
            console.log("--------------------------------not true------------",effectiveDate1)
            throw new Error("Date format is not  correct");
        }
        if(effectiveDate1[1]<13 && expirationDate2[1]<13 && dateOfIssue3[1]<13){
            console.log("--------------------------------true ------------",effectiveDate1)
            console.log("--------------------------------true ------------",expirationDate2)
            console.log("--------------------------------true ------------",dateOfIssue3)
        }
        else{
            console.log("--------------------------------not true------------",effectiveDate)
            throw new Error("Date format is not  correct");
        }

            if(effectiveDate){
                console.log("true-----------")
            }
            else{
                throw new Error("Date format is not  correct");
               }
            if(expirationDate){
            console.log("true-----------")
           }
           else{
            throw new Error("Date format is not  correct");
           }
            if(dateOfIssue){
            console.log("true-----------")
           }
           else{
            throw new Error("Date format is not  correct");
           }


    },
    consentMode :(data,payload,jwt)=>{
        console.log("DET-----------",payload.body.consentMode)
        if(payload.body.consentMode===""){
            throw new Error("ConsentMode should not be empty");
        }
        if(payload.body.consentMode==="BIOMETRIC"){
            console.log("SET-----------")
        }
        else if(payload.body.consentMode==="E-KEY"){
            console.log("SET-----------")
        }
        else if(payload.body.consentMode==="IDandV"){
            console.log("SET-----------")
        }else{
            throw new Error("Irrelevent consentMode it could be BIOMETRIC E-KEY, IDandV");
        }
    },
    WCOscreeningFields : (data,payload,jwt)=>{
        console.log("-----------------------data",data[0].nationality)
        if(data[0].gender==='M'){
            console.log("SET-----------")
        }
        else if(data[0].gender ==='F'){
            console.log("SET-----------")
        }
        else{
            throw new Error("Wrong Gender Added");
        }
        
        let date=moment(data[0].DOB, 'DD/MM/YYYY').isValid()
        let spliceDate1=data[0].DOB.split('/')
        if(spliceDate1[0]<32){
            console.log("--------------------------------true ------------",spliceDate1)
        }
        else{
            console.log("--------------------------------not true------------",spliceDate1)
            throw new Error("Date format is not  correct");
        }
        if(spliceDate1[1]<13){
            console.log("--------------------------------true ------------",spliceDate1)
        }
        else{
            console.log("--------------------------------not true------------",spliceDate1)
            throw new Error("Date format is not  correct");
        }
        // if(spliceDate1[1]<13){
        //     console.log("--------------------------------true ------------",spliceDate1)
        // }
        // else{
        //     console.log("--------------------------------not true------------",spliceDate1)
        //     throw new Error("Date format is not  correct");
        // }
        

       
        console.log("--------------------------------spliceDate ------------",spliceDate1)
        if(date){
            console.log("true-----------")
           }
           else{
            throw new Error("Date format is not  correct");
           }
        if(data[0].nationality.length===3){
            console.log("SET-----------")
        }
        else{
            throw new Error("national should be of 3 digits");
        }
        // if(data[0].gender!="M" || data[0].gender !="F"){
        //     throw new Error("Wrong Gender Added");
        // }
    },
    nonIGAFeilds:(data,payload,jwt)=>{
        console.log("-----------------------data")
         console.log("-----------------------dateOfBirth",payload.body.nonIGAFeilds.additional.workPermitValid)
         //console.log("-----------------------nationality",payload.body.nonIGAFeilds.primary.nationality)

        //  console.log("-----------------------identityType",payload.body.Id.identityType)
        //  console.log("-----------------------gender",payload.body.nonIGAFeilds.primary.gender)

        //  if(payload.body.Id.identityType==="GCC" && payload.body.nonIGAFeilds.primary!=""){
        //     throw new Error("if identityType is GCC then primary Object is not required");
        //  }
        
        if(payload.body.nonIGAFeilds.primary){
            if(payload.body.nonIGAFeilds.primary.gender==='M'){
                console.log("SET-----------")
            }
            else if(payload.body.nonIGAFeilds.primary.gender ==='F'){
                console.log("SET-----------")
            }
            else if(payload.body.nonIGAFeilds.primary.gender==='O'){
                console.log("SET-----------")
            }
            else{
                throw new Error("Invaliaid gender type");
            }
            if(payload.body.nonIGAFeilds.primary.nationality.length===3){
                console.log("SET-----------")
            }
            else{
                throw new Error("country  should be of 3 digits");
            }
            if(payload.body.nonIGAFeilds.primary.dateOfBirth){
                let date=moment(payload.body.nonIGAFeilds.primary.dateOfBirth, 'DD/MM/YYYY').isValid()
                console.log("--------------------------------data ------------",date)
                let date1=payload.body.nonIGAFeilds.primary.dateOfBirth.split('/')
    
                if(date1[0]<32){
                    console.log("--------------------------------true ------------",date1)
                    }
                else{
                    console.log("--------------------------------not true------------",date1)
                    throw new Error("Date format is not  correct");
                }
                if(date1[1]<13){
                    console.log("--------------------------------true ------------",date1)
                }
                else{
                    console.log("--------------------------------not true------------",date1)
                    throw new Error("Date format is not  correct");
                }

                if(date){
                    console.log("true-----------")
                }
                else{
                    throw new Error("Date format is not  correct");
                }
            }
        }


        if(payload.body.nonIGAFeilds.overridden){
            if(payload.body.nonIGAFeilds.overridden.addresses[0].addressCode==='RESIDENTIAL'){
                console.log("SET-----------")
            }
            else if(payload.body.nonIGAFeilds.overridden.addresses[0].addressCode ==='EMPLOYER'){
                console.log("SET-----------")
            }
            else if(payload.body.nonIGAFeilds.overridden.addresses[0].addressCode==='MAILING'){
                console.log("SET-----------")
            }
            else{
                throw new Error("Invaliaid Address code it could be RESIDENTIAL, EMPLOYER, MAILING");
            }

            if(payload.body.nonIGAFeilds.overridden.addresses[0].country.length===3){
                console.log("SET-----------")
            }
            else{
                throw new Error("country  should be of 3 digits");
            }
            if(payload.body.nonIGAFeilds.overridden.residentPermitExpiry){
                let date=moment(payload.body.nonIGAFeilds.overridden.residentPermitExpiry, 'DD/MM/YYYY').isValid()
                console.log("--------------------------------data ------------",date)
                let date1=payload.body.nonIGAFeilds.overridden.residentPermitExpiry.split('/')
    
                if(date1[0]<32){
                    console.log("--------------------------------true ------------",date1)
                    }
                else{
                    console.log("--------------------------------not true------------",date1)
                    throw new Error("Date format is not  correct");
                }
                if(date1[1]<13){
                    console.log("--------------------------------true ------------",date1)
                }
                else{
                    console.log("--------------------------------not true------------",date1)
                    throw new Error("Date format is not  correct");
                }

                if(date){
                    console.log("true-----------")
                }
                else{
                    throw new Error("Date format is not  correct");
                }
            }
        }
        payload.body.nonIGAFeilds.additional.workPermitValid
        if(payload.body.nonIGAFeilds.additional){
            if(payload.body.nonIGAFeilds.additional.workPermitValid==='Y' || payload.body.nonIGAFeilds.additional.workPermitValid==='Yes'){
                console.log("SET-----------")
            }
            else if(payload.body.nonIGAFeilds.additional.workPermitValid ==='N' || payload.body.nonIGAFeilds.additional.workPermitValid==='No'){
                console.log("SET-----------")
            }
            else{
                throw new Error("Invalid workPermitValid  it could be Yes (Y) or No (N)");
            }

        }
       

    }

}