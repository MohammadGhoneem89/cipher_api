﻿package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/hyperledger/fabric/core/chaincode/lib/cid"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

//<<Standard Code Section - Start>>

/* ===================================================================================
	This is the system generated code section. Please don't make any change in this section
  ===================================================================================*/

//Struct For Chain Code
type URChainCode struct {
}

var logger = shim.NewLogger("UR")

//Standard Functions
func main() {
	fmt.Println("UR ChainCode Started")
	err := shim.Start(new(URChainCode))
	if err != nil {
		fmt.Printf("Error starting UR chaincode: %s", err)
	}
}

//Init is called during chaincode instantiation to initialize any data.
func (t *URChainCode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("UR ChainCode Initiated")

	_, args := stub.GetFunctionAndParameters()
	fmt.Printf("Init: %v", args)
	if len(args[0]) <= 0 {
		return shim.Error("MSP Mapping information is required for initiating the chain code")
	}

	var MSPListUnmarshaled []MSPList
	err := json.Unmarshal([]byte(args[0]), &MSPListUnmarshaled)

	if err != nil {
		return shim.Error("An error occurred while Unmarshiling MSPMapping: " + err.Error())
	}
	MSPMappingJSONasBytes, err := json.Marshal(MSPListUnmarshaled)
	if err != nil {
		return shim.Error("An error occurred while Marshiling MSPMapping :" + err.Error())
	}

	_Key := "MSPMapping"
	err = stub.PutState(_Key, []byte(MSPMappingJSONasBytes))
	if err != nil {
		return shim.Error("An error occurred while inserting MSPMapping:" + err.Error())
	}
	return shim.Success(nil)
}

//Invoke is called per transaction on the chaincode
func (t *URChainCode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {

	//getting MSP
	certOrgType, err := cid.GetMSPID(stub)
	if err != nil {
		return shim.Error("Enrolment mspid Type invalid!!! " + err.Error())
	}
	fmt.Println("MSP:" + certOrgType)

	orgType, err := getOrgTypeByMSP(stub, string(certOrgType))
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Println("OrgType Is => : " + orgType)

	function, _ := stub.GetFunctionAndParameters()
	fmt.Println("Invoke is running for function: " + function)
	//<<Function Validation Logic-Start>>

	args, errTrans := getArguments(stub)
	if errTrans != nil {
		return shim.Error(errTrans.Error())
	}
	fmt.Println("Arguments Loaded Successfully!!")

	if orgType == "REGAUTH" {
		connection := hypConnect{}
		connection.Connection = stub
		switch functionName := function; functionName {

		case "postDataToBlockchainREGAUTH":
			return t.postDataToBlockchainREGAUTH(connection, args, "postDataToBlockchainREGAUTH", orgType)

		case "getDataByUnifiedID":
			return t.getDataByUnifiedID(connection, args, "getDataByUnifiedID")

		case "GetDataByKey":
			return t.GetDataByKey(connection, args, "GetDataByKey")

		default:
			logger.Warning("Invoke did not find function: " + function)
			return shim.Error("Received unknown function invocation: " + function)
		}
	} else if orgType == "CHAMBEROFCOMM" {
		connection := hypConnect{}
		connection.Connection = stub
		switch functionName := function; functionName {

		case "postDataToBlockchainCHAMBEROFCOMM":
			return t.postDataToBlockchainCHAMBEROFCOMM(connection, args, "postDataToBlockchainCHAMBEROFCOMM", orgType)

		case "associateAlias":
			return t.associateAlias(connection, args, "associateAlias", orgType)

		case "getDataByUnifiedID":
			return t.getDataByUnifiedID(connection, args, "getDataByUnifiedID")

		case "getDataByAlias":
			return t.getDataByAlias(connection, args, "getDataByAlias", orgType)

		case "GetDataByKey":
			return t.GetDataByKey(connection, args, "GetDataByKey")

		default:
			logger.Warning("Invoke did not find function: " + function)
			return shim.Error("Received unknown function invocation: " + function)
		}
	} else if orgType == "TRADE" {
		connection := hypConnect{}
		connection.Connection = stub
		switch functionName := function; functionName {

		case "postDataToBlockchainTRADE":
			return t.postDataToBlockchainTRADE(connection, args, "postDataToBlockchainTRADE", orgType)

		case "associateAlias":
			return t.associateAlias(connection, args, "associateAlias", orgType)

		case "getDataByUnifiedID":
			return t.getDataByUnifiedID(connection, args, "getDataByUnifiedID")

		case "getDataByAlias":
			return t.getDataByAlias(connection, args, "getDataByAlias", orgType)

		case "GetDataByKey":
			return t.GetDataByKey(connection, args, "GetDataByKey")

		default:
			logger.Warning("Invoke did not find function: " + function)
			return shim.Error("Received unknown function invocation: " + function)
		}
	} else if orgType == "PORT" {
		connection := hypConnect{}
		connection.Connection = stub
		switch functionName := function; functionName {

		case "postDataToBlockchainPORT":
			return t.postDataToBlockchainPORT(connection, args, "postDataToBlockchainPORT", orgType)

		case "associateAlias":
			return t.associateAlias(connection, args, "associateAlias", orgType)

		case "getDataByUnifiedID":
			return t.getDataByUnifiedID(connection, args, "getDataByUnifiedID")

		case "getDataByAlias":
			return t.getDataByAlias(connection, args, "getDataByAlias", orgType)

		case "GetDataByKey":
			return t.GetDataByKey(connection, args, "GetDataByKey")

		default:
			logger.Warning("Invoke did not find function: " + function)
			return shim.Error("Received unknown function invocation: " + function)
		}
	} else if orgType == "CUSTOMS" {
		connection := hypConnect{}
		connection.Connection = stub
		switch functionName := function; functionName {

		case "postDataToBlockchainCUSTOMS":
			return t.postDataToBlockchainCUSTOMS(connection, args, "postDataToBlockchainCUSTOMS", orgType)

		case "associateAlias":
			return t.associateAlias(connection, args, "associateAlias", orgType)

		case "getDataByUnifiedID":
			return t.getDataByUnifiedID(connection, args, "getDataByUnifiedID")

		case "getDataByAlias":
			return t.getDataByAlias(connection, args, "getDataByAlias", orgType)

		case "GetDataByKey":
			return t.GetDataByKey(connection, args, "GetDataByKey")

		default:
			logger.Warning("Invoke did not find function: " + function)
			return shim.Error("Received unknown function invocation: " + function)
		}
	} else if orgType == "PM" {
		connection := hypConnect{}
		connection.Connection = stub

		switch functionName := function; functionName {

		case "postDataToBlockchainREGAUTH":
			return t.postDataToBlockchainREGAUTH(connection, args, "postDataToBlockchainREGAUTH", orgType)

		case "postDataToBlockchainCUSTOMS":
			return t.postDataToBlockchainCUSTOMS(connection, args, "postDataToBlockchainCUSTOMS", orgType)

		case "postDataToBlockchainPORT":
			return t.postDataToBlockchainPORT(connection, args, "postDataToBlockchainPORT", orgType)

		case "postDataToBlockchainTRADE":
			return t.postDataToBlockchainTRADE(connection, args, "postDataToBlockchainTRADE", orgType)

		case "postDataToBlockchainCHAMBEROFCOMM":
			return t.postDataToBlockchainCHAMBEROFCOMM(connection, args, "postDataToBlockchainCHAMBEROFCOMM", orgType)

		case "associateAlias":
			return t.associateAlias(connection, args, "associateAlias", orgType)

		case "getDataByUnifiedID":
			return t.getDataByUnifiedID(connection, args, "getDataByUnifiedID")

		case "getDataByAlias":
			return t.getDataByAlias(connection, args, "getDataByAlias", orgType)

		case "GetDataByKey":
			return t.GetDataByKey(connection, args, "GetDataByKey")

		default:
			logger.Warning("Invoke did not find function: " + function)
			return shim.Error("Received unknown function invocation: " + function)
		}
	} else {
		return shim.Error("Invalid MSP: " + orgType)
	}

}

// ###################### postDataToBlockchainRegAuth Function ########################
func (t *URChainCode) postDataToBlockchainREGAUTH(stub hypConnect, args []string, functionName string, orgType string) pb.Response {
	fmt.Printf("postDataToBlockchainRegAuth: %v", args)

	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}

	checkHistory := false
	var err error
	//<<get new parameter>>
	var passportCopy []PassportCopy
	err = json.Unmarshal([]byte(args[26]), &passportCopy)
	if err != nil {
		fmt.Printf("%s", err)
		return shim.Error("Invalid Argument !!!!!!" + err.Error())
	}
	var tradeLicense TradeLicense
	err = json.Unmarshal([]byte(args[27]), &tradeLicense)
	if err != nil {
		fmt.Printf("%s", err)
		return shim.Error("Invalid Argument !!!!!!" + err.Error())
	}
	var activity []Activity
	err = json.Unmarshal([]byte(args[28]), &activity)
	if err != nil {
		fmt.Printf("%s", err)
		return shim.Error("Invalid Argument !!!!!!" + err.Error())
	}
	var partners []Partners
	err = json.Unmarshal([]byte(args[29]), &partners)
	if err != nil {
		fmt.Printf("%s", err)
		return shim.Error("Invalid Argument !!!!!!" + err.Error())
	}
	var contactRegAuth []ContactRegAuth
	err = json.Unmarshal([]byte(args[30]), &contactRegAuth)
	if err != nil {
		fmt.Printf("%s", err)
		return shim.Error("Invalid Argument !!!!!!" + err.Error())
	}
	//<<JAFZA param unmarshaling placeholder>>

	// #################################################################

	//the new added attributes of RegAuth
	//<<RegAuth field to empty placeholder>>

	//the new added attributes of DP-World
	var letterFromGM LetterFromGM
	//<<DPW field to empty placeholder>>

	//the new added attributes of DubaiChamber
	//<<Chamber field to empty placeholder>>

	//the new added attributes of DubaiTrade
	var companyLogo CompanyLogo
	var VATRegCertificate VATRegCertificate
	//<<DubaiTrade field to empty placeholder>>

	//the new added attributes of DubaiCustoms
	var undertakingFromOwner UndertakingFromOwner
	var companyInfo CompanyInfo
	//<<DubaiCustoms field to empty placeholder>>

	unifiedRegParams := &UnifiedReg{
		DocumentName: "UnifiedReg",
		Key:          sanitize(args[0], "string").(string),
		UnifiedID:    sanitize(args[0], "string").(string),
		Alias:        nil,
		AliasList:    nil,
		FormationNo:  sanitize(args[1], "string").(string),

		//the new added attributes of RegAuth
		Issuedate:                 sanitize(args[2], "string").(string),
		ExpiryDate:                sanitize(args[3], "string").(string),
		Status:                    sanitize(args[4], "string").(string),
		TradeZone:                 sanitize(args[5], "string").(string),
		LicenseCategoryCodeDescEn: sanitize(args[6], "string").(string),
		LicenseCategoryCodeDescAr: sanitize(args[7], "string").(string),
		RenewalDate:               sanitize(args[8], "string").(string),
		AccountNumber:             sanitize(args[9], "string").(string),
		AccountNameAr:             sanitize(args[10], "string").(string),
		AccountNameEn:             sanitize(args[11], "string").(string),
		AccountStatus:             sanitize(args[12], "string").(string),
		AccountFormationDate:      sanitize(args[13], "string").(string),
		EstablishmentType:         sanitize(args[14], "string").(string),
		LegalEntity:               sanitize(args[15], "string").(string),
		CountryOfOrigin:           sanitize(args[16], "string").(string),
		City:                      sanitize(args[17], "string").(string),
		Address:                   sanitize(args[18], "string").(string),
		POBOX:                     sanitize(args[19], "string").(string),
		Email:                     sanitize(args[20], "string").(string),
		Phone:                     sanitize(args[21], "string").(string),
		MobileNumber:              sanitize(args[22], "string").(string),
		Website:                   sanitize(args[23], "string").(string),
		ZoneName:                  sanitize(args[24], "string").(string),
		Fax:                       sanitize(args[25], "string").(string),
		PassportCopy:              passportCopy,
		TradeLicense:              tradeLicense,
		Activity:                  activity,
		Partners:                  partners,
		ContactRegAuth:            contactRegAuth,
		LicenseTerminatedDate:     sanitize(args[31], "string").(string),
		//<<RegAuth Struct field placeholder>>

		//the new added attributes of DP-World
		LetterFromGM:   letterFromGM,
		ContactDPW:     nil,
		CompanyBrief:   "",
		NonVATCustomer: false,
		//<<DPW Struct field placeholder>>

		//the new added attributes of DubaiChamber
		MembershipExpiryDate: "",
		MembershipStatus:     "",
		//<<Chamber Struct field placeholder>>

		//the new added attributes of DubaiTrade
		FacebookURL:       "",
		TwitterURL:        "",
		CompanyLogo:       companyLogo,
		VATRegCertificate: VATRegCertificate,
		VATAccountNo:      "",
		//<<DubaiTrade Struct field placeholder>>

		//the new added attributes of DubaiCustoms
		AccountNameCustom:    "",
		UndertakingFromOwner: undertakingFromOwner,
		CompanyInfo:          companyInfo,
		ContactCustoms:       nil,
		//<<DubaiCustoms Struct field placeholder>>
	}

	// get the first part of the UnifiedID spliting string by "_"
	var unifiedID = unifiedRegParams.UnifiedID
	s := strings.Split(unifiedID, "_")
	unifiedRegDataAsBytes, err := fetchData(stub, unifiedID, "unifiedReg_"+s[0])
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error("Somthing went wrong while fetching Registration data" + err.Error())
	}
	// If Record Doesn't exist ===> then create new one
	if unifiedRegDataAsBytes == nil {

		unifiedReg := &UnifiedReg{
			DocumentName: unifiedRegParams.DocumentName,
			Key:          unifiedRegParams.Key,
			UnifiedID:    unifiedRegParams.UnifiedID,
			AliasList:    unifiedRegParams.AliasList,
			FormationNo:  unifiedRegParams.FormationNo,

			//the new added attributes of RegAuth
			Issuedate:                 unifiedRegParams.Issuedate,
			ExpiryDate:                unifiedRegParams.ExpiryDate,
			Status:                    unifiedRegParams.Status,
			TradeZone:                 unifiedRegParams.TradeZone,
			LicenseCategoryCodeDescEn: unifiedRegParams.LicenseCategoryCodeDescEn,
			LicenseCategoryCodeDescAr: unifiedRegParams.LicenseCategoryCodeDescAr,
			RenewalDate:               unifiedRegParams.RenewalDate,
			AccountNumber:             unifiedRegParams.AccountNumber,
			AccountNameAr:             unifiedRegParams.AccountNameAr,
			AccountNameEn:             unifiedRegParams.AccountNameEn,
			AccountStatus:             unifiedRegParams.AccountStatus,
			AccountFormationDate:      unifiedRegParams.AccountFormationDate,
			EstablishmentType:         unifiedRegParams.EstablishmentType,
			LegalEntity:               unifiedRegParams.LegalEntity,
			CountryOfOrigin:           unifiedRegParams.CountryOfOrigin,
			City:                      unifiedRegParams.City,
			Address:                   unifiedRegParams.Address,
			POBOX:                     unifiedRegParams.POBOX,
			Email:                     unifiedRegParams.Email,
			Phone:                     unifiedRegParams.Phone,
			MobileNumber:              unifiedRegParams.MobileNumber,
			Website:                   unifiedRegParams.Website,
			ZoneName:                  unifiedRegParams.ZoneName,
			Fax:                       unifiedRegParams.Fax,
			PassportCopy:              unifiedRegParams.PassportCopy,
			TradeLicense:              unifiedRegParams.TradeLicense,
			Activity:                  unifiedRegParams.Activity,
			Partners:                  unifiedRegParams.Partners,
			ContactRegAuth:            unifiedRegParams.ContactRegAuth,
			LicenseTerminatedDate:     unifiedRegParams.LicenseTerminatedDate,
			//<<RegAuth Struct newField placeholder>>

			//the new added attributes of DP-World
			LetterFromGM:   unifiedRegParams.LetterFromGM,
			ContactDPW:     unifiedRegParams.ContactDPW,
			CompanyBrief:   unifiedRegParams.CompanyBrief,
			NonVATCustomer: unifiedRegParams.NonVATCustomer,
			//<<DPW Struct newField placeholder>>

			//the new added attributes of DubaiChamber
			MembershipExpiryDate: unifiedRegParams.MembershipExpiryDate,
			MembershipStatus:     unifiedRegParams.MembershipStatus,
			//<<Chamber Struct newField placeholder>>

			//the new added attributes of DubaiTrade
			FacebookURL:       unifiedRegParams.FacebookURL,
			TwitterURL:        unifiedRegParams.TwitterURL,
			CompanyLogo:       unifiedRegParams.CompanyLogo,
			VATRegCertificate: unifiedRegParams.VATRegCertificate,
			VATAccountNo:      unifiedRegParams.VATAccountNo,
			//<<DubaiTrade Struct newField placeholder>>

			//the new added attributes of DubaiCustoms
			AccountNameCustom:    unifiedRegParams.AccountNameCustom,
			UndertakingFromOwner: unifiedRegParams.UndertakingFromOwner,
			CompanyInfo:          unifiedRegParams.CompanyInfo,
			//<<DubaiCustoms Struct newField placeholder>>
		}

		unifiedRegJSONasBytes, err := json.Marshal(unifiedReg)
		if err != nil {
			return shim.Error(err.Error())
		}

		err = insertData(&stub, unifiedReg.UnifiedID, "unifiedReg_"+s[0], []byte(unifiedRegJSONasBytes))
		if err != nil {
			return shim.Error(err.Error())
		}

		///////////////////Unified Reg Grouping///////////////////////////
		//=================================================================================================================
		if unifiedRegParams.FormationNo != "" {
			err = unfiedRegGrouping(stub, "F_", unifiedRegParams.FormationNo, s[0], unifiedRegParams.UnifiedID)
			if err != nil {
				return shim.Error(err.Error())
			}
		}

		//=================================================================================================================

		fmt.Println("postDataToBlockchainREGAUTH function executed successfully.")
		//raise Event for new record ==> (with out history flag)
		RaiseEventData(stub, "EventOnNewRegistration")

	} else {

		checkHistory = true

		//UnMarshal Registration data to JSON
		var unifiedRegDataAsJSON UnifiedReg
		err = json.Unmarshal([]byte(unifiedRegDataAsBytes), &unifiedRegDataAsJSON)
		if err != nil {
			fmt.Printf("%s\n", err)
			return shim.Error(err.Error())
		}
		fmt.Println("fetched Data =================> ", unifiedRegDataAsJSON)

		//=================================================================================================================
		// insert the old document after changing the key to ==> old_key
		var old_UnifiedRegData_AsJSON = unifiedRegDataAsJSON
		old_UnifiedRegData_AsJSON.Key = unifiedRegDataAsJSON.Key + "_OLD"

		//marshal old document
		old_unifiedRegJSONasBytes, err := json.Marshal(old_UnifiedRegData_AsJSON)
		if err != nil {
			return shim.Error(err.Error())
		}

		// insert old document
		err = insertData(&stub, old_UnifiedRegData_AsJSON.Key, "unifiedReg_"+s[0], []byte(old_unifiedRegJSONasBytes))
		if err != nil {
			return shim.Error(err.Error())
		}
		//=================================================================================================================

		unifiedRegDataAsJSON.DocumentName = unifiedRegParams.DocumentName
		unifiedRegDataAsJSON.UnifiedID = unifiedRegParams.UnifiedID
		unifiedRegDataAsJSON.FormationNo = unifiedRegParams.FormationNo

		//the new added attributes of RegAuth
		unifiedRegDataAsJSON.Issuedate = unifiedRegParams.Issuedate
		unifiedRegDataAsJSON.ExpiryDate = unifiedRegParams.ExpiryDate
		unifiedRegDataAsJSON.Status = unifiedRegParams.Status
		unifiedRegDataAsJSON.TradeZone = unifiedRegParams.TradeZone
		unifiedRegDataAsJSON.LicenseCategoryCodeDescEn = unifiedRegParams.LicenseCategoryCodeDescEn
		unifiedRegDataAsJSON.LicenseCategoryCodeDescAr = unifiedRegParams.LicenseCategoryCodeDescAr
		unifiedRegDataAsJSON.RenewalDate = unifiedRegParams.RenewalDate
		unifiedRegDataAsJSON.AccountNumber = unifiedRegParams.AccountNumber
		unifiedRegDataAsJSON.AccountNameAr = unifiedRegParams.AccountNameAr
		unifiedRegDataAsJSON.AccountNameEn = unifiedRegParams.AccountNameEn
		unifiedRegDataAsJSON.AccountStatus = unifiedRegParams.AccountStatus
		unifiedRegDataAsJSON.AccountFormationDate = unifiedRegParams.AccountFormationDate
		unifiedRegDataAsJSON.EstablishmentType = unifiedRegParams.EstablishmentType
		unifiedRegDataAsJSON.LegalEntity = unifiedRegParams.LegalEntity
		unifiedRegDataAsJSON.CountryOfOrigin = unifiedRegParams.CountryOfOrigin
		unifiedRegDataAsJSON.City = unifiedRegParams.City
		unifiedRegDataAsJSON.Address = unifiedRegParams.Address
		unifiedRegDataAsJSON.POBOX = unifiedRegParams.POBOX
		unifiedRegDataAsJSON.Email = unifiedRegParams.Email
		unifiedRegDataAsJSON.Phone = unifiedRegParams.Phone
		unifiedRegDataAsJSON.MobileNumber = unifiedRegParams.MobileNumber
		unifiedRegDataAsJSON.Website = unifiedRegParams.Website
		unifiedRegDataAsJSON.ZoneName = unifiedRegParams.ZoneName
		unifiedRegDataAsJSON.Fax = unifiedRegParams.Fax
		unifiedRegDataAsJSON.PassportCopy = unifiedRegParams.PassportCopy
		unifiedRegDataAsJSON.TradeLicense = unifiedRegParams.TradeLicense
		unifiedRegDataAsJSON.Activity = unifiedRegParams.Activity
		unifiedRegDataAsJSON.Partners = unifiedRegParams.Partners
		unifiedRegDataAsJSON.ContactRegAuth = unifiedRegParams.ContactRegAuth
		unifiedRegDataAsJSON.LicenseTerminatedDate = unifiedRegParams.LicenseTerminatedDate
		//<<RegAuth Struct fieldExist placeholder>>

		//the new added attributes of DP-World
		//<<DPW Struct fieldExist placeholder>>

		//the new added attributes of DubaiChamber
		//<<Chamber Struct fieldExist placeholder>>

		//the new added attributes of DubaiTrade
		//<<DubaiTrade Struct fieldExist placeholder>>

		//the new added attributes of DubaiCustoms
		//<<DubaiCustoms Struct fieldExist placeholder>>

		unifiedRegJSONasBytes, err := json.Marshal(unifiedRegDataAsJSON)
		if err != nil {
			return shim.Error(err.Error())
		}

		err = insertData(&stub, unifiedRegDataAsJSON.UnifiedID, "unifiedReg_"+s[0], []byte(unifiedRegJSONasBytes))
		if err != nil {
			return shim.Error(err.Error())
		}

		///////////////////Unified Reg Grouping///////////////////////////
		//=================================================================================================================
		if unifiedRegParams.FormationNo != "" {
			err = unfiedRegGrouping(stub, "F_", unifiedRegParams.FormationNo, s[0], unifiedRegParams.UnifiedID)
			if err != nil {
				return shim.Error(err.Error())
			}
		}
		//=================================================================================================================

		additionalData := &AdditionalData{
			CheckHistory: checkHistory,
		}
		fmt.Println("postDataToBlockchainRegAuth function Updated successfully.")
		//raise Event for existing document ==> (with history flag)
		RaiseEventData(stub, "EventOnDataChangeForREGAUTH", additionalData)

	}

	return shim.Success(nil)
}

// ###################### End ########################

// ###################### postDataToBlockchainChamber Function ########################
func (t *URChainCode) postDataToBlockchainCHAMBEROFCOMM(stub hypConnect, args []string, functionName string, orgType string) pb.Response {
	fmt.Printf("postDataToBlockchainChamber: %v", args)

	if len(args[0]) <= 0 {
		return shim.Error("Invalid Number of Argument")
	}

	var alias []Alias
	err1 := json.Unmarshal([]byte(args[1]), &alias)
	if err1 != nil {
		fmt.Printf("%s\n", err1)
		return shim.Error("Invalid Argument for Alias!!!!!!" + err1.Error())
	}

	//<<get new parameter>>
	//<<DCC param unmarshaling placeholder>>

	postDataToBlockchainCHAMBEROFCOMM := &postDataToBlockchainCHAMBEROFCOMM{
		UnifiedID: sanitize(args[0], "string").(string),
		Alias:     alias,
		// the new parameters are :
		MembershipExpiryDate: sanitize(args[2], "string").(string),
		MembershipStatus:     sanitize(args[3], "string").(string),
		//<<add parameter to the structre of DubaiChamber>>
	}

	// get the first part of the UnifiedID spliting string by "_"
	s := strings.Split(postDataToBlockchainCHAMBEROFCOMM.UnifiedID, "_")

	unifiedRegDataAsBytes, err := fetchData(stub, postDataToBlockchainCHAMBEROFCOMM.UnifiedID, "unifiedReg_"+s[0])
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error("Somthing went wrong while fetching Registration data" + err.Error())
	}
	//return an error if there is No Record for the specified ID
	if unifiedRegDataAsBytes == nil {
		return shim.Error("No customer registration found on the Blockchain for Key :" + postDataToBlockchainCHAMBEROFCOMM.UnifiedID)
	}

	//UnMarshal Registration data to JSON
	var unifiedRegDataAsJSON UnifiedReg
	err = json.Unmarshal([]byte(unifiedRegDataAsBytes), &unifiedRegDataAsJSON)
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error(err.Error())
	}

	//=================================================================================================================
	// insert the old document after changing the key to ==> old_key
	var old_UnifiedRegData_AsJSON = unifiedRegDataAsJSON
	old_UnifiedRegData_AsJSON.Key = unifiedRegDataAsJSON.Key + "_OLD"

	//marshal old document
	old_unifiedRegJSONasBytes, err := json.Marshal(old_UnifiedRegData_AsJSON)
	if err != nil {
		return shim.Error(err.Error())
	}

	// insert old document
	err = insertData(&stub, old_UnifiedRegData_AsJSON.Key, "unifiedReg_"+s[0], []byte(old_unifiedRegJSONasBytes))
	if err != nil {
		return shim.Error(err.Error())
	}
	//=================================================================================================================

	// Call function to Update Alias
	var compositeKeyArray []string
	err = updateAlias(stub, compositeKeyArray, &unifiedRegDataAsJSON, alias, orgType, postDataToBlockchainCHAMBEROFCOMM.UnifiedID, s[0])
	if err != nil {
		return shim.Error(err.Error())
	}
	// Append remaining information here

	// new parameters are:
	unifiedRegDataAsJSON.MembershipExpiryDate = postDataToBlockchainCHAMBEROFCOMM.MembershipExpiryDate
	unifiedRegDataAsJSON.MembershipStatus = postDataToBlockchainCHAMBEROFCOMM.MembershipStatus
	//<<update the field of main structure with DubaiChamber field>>

	updated_UnifiedRegDataAsBytes, err := json.Marshal(unifiedRegDataAsJSON)
	if err != nil {
		return shim.Error(err.Error())
	}
	err = insertData(&stub, postDataToBlockchainCHAMBEROFCOMM.UnifiedID, "unifiedReg_"+s[0], []byte(updated_UnifiedRegDataAsBytes))
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Println("postDataToBlockchainCHAMBEROFCOMM function executed successfully.")

	//raise Event for existing document ==> (with history flag)
	additionalData := &AdditionalData{
		CheckHistory: true,
	}
	RaiseEventData(stub, "EventOnDataChangeForCHAMBEROFCOMM", additionalData)
	return shim.Success(nil)
}

// ###################### postDataToBlockchainDPW Function ########################
func (t *URChainCode) postDataToBlockchainPORT(stub hypConnect, args []string, functionName string, orgType string) pb.Response {
	fmt.Printf("postDataToBlockchainDPW: %v", args)

	if len(args[0]) <= 0 {
		return shim.Error("Invalid Number of Argument")
	}

	var alias []Alias
	err := json.Unmarshal([]byte(args[1]), &alias)
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error("Invalid Argument for Alias!!!!!!" + err.Error())
	}

	//<<get new parameters are : >>
	var letterFromGM LetterFromGM
	err = json.Unmarshal([]byte(args[2]), &letterFromGM)
	if err != nil {
		fmt.Printf("%s", err)
		return shim.Error("Invalid Argument !!!!!!" + err.Error())
	}
	var contactDPW []ContactDPW
	err = json.Unmarshal([]byte(args[3]), &contactDPW)
	if err != nil {
		fmt.Printf("%s", err)
		return shim.Error("Invalid Argument !!!!!!" + err.Error())
	}
	//<<DPW param unmarshaling placeholder>>

	postDataToBlockchainPORT := &postDataToBlockchainPORT{
		UnifiedID: sanitize(args[0], "string").(string),
		Alias:     alias,
		// thenew parameters are :
		LetterFromGM:   letterFromGM,
		ContactDPW:     contactDPW,
		CompanyBrief:   sanitize(args[4], "string").(string),
		NonVATCustomer: sanitize(args[5], "bool").(bool),
		//<<add parameter to the structre of DPW>>
	}

	// get the first part of the UnifiedID spliting string by "_"
	s := strings.Split(postDataToBlockchainPORT.UnifiedID, "_")
	unifiedRegDataAsBytes, err := fetchData(stub, postDataToBlockchainPORT.UnifiedID, "unifiedReg_"+s[0])
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error("Somthing went wrong while fetching Registration data" + err.Error())
	}
	//return an error if there is No Record for the specified ID
	if unifiedRegDataAsBytes == nil {
		return shim.Error("No customer registration found on the Blockchain for Key :" + postDataToBlockchainPORT.UnifiedID)
	}

	//UnMarshal Registration data to JSON
	var unifiedRegDataAsJSON UnifiedReg
	err = json.Unmarshal([]byte(unifiedRegDataAsBytes), &unifiedRegDataAsJSON)
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error(err.Error())
	}
	fmt.Println("=================> ", unifiedRegDataAsJSON)
	//=================================================================================================================
	// insert the old document after changing the key to ==> old_key
	var old_UnifiedRegData_AsJSON = unifiedRegDataAsJSON
	old_UnifiedRegData_AsJSON.Key = unifiedRegDataAsJSON.Key + "_OLD"

	//marshal old document
	old_unifiedRegJSONasBytes, err := json.Marshal(old_UnifiedRegData_AsJSON)
	if err != nil {
		return shim.Error(err.Error())
	}

	// insert old document
	err = insertData(&stub, old_UnifiedRegData_AsJSON.Key, "unifiedReg_"+s[0], []byte(old_unifiedRegJSONasBytes))
	if err != nil {
		return shim.Error(err.Error())
	}
	//=================================================================================================================

	// Call function to Update Alias
	var compositeKeyArray []string
	err = updateAlias(stub, compositeKeyArray, &unifiedRegDataAsJSON, alias, orgType, postDataToBlockchainPORT.UnifiedID, s[0])
	if err != nil {
		return shim.Error(err.Error())
	}
	// Append remaining information here
	// new parameters are:
	unifiedRegDataAsJSON.LetterFromGM = postDataToBlockchainPORT.LetterFromGM
	unifiedRegDataAsJSON.ContactDPW = postDataToBlockchainPORT.ContactDPW
	unifiedRegDataAsJSON.CompanyBrief = postDataToBlockchainPORT.CompanyBrief
	unifiedRegDataAsJSON.NonVATCustomer = postDataToBlockchainPORT.NonVATCustomer
	//<<update the field of main structure with DPW field>>

	updated_UnifiedRegDataAsBytes, err := json.Marshal(unifiedRegDataAsJSON)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = insertData(&stub, postDataToBlockchainPORT.UnifiedID, "unifiedReg_"+s[0], []byte(updated_UnifiedRegDataAsBytes))
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Println("postDataToBlockchainPORT function executed successfully.")

	//raise Event for existing document ==> (with history flag)
	additionalData := &AdditionalData{
		CheckHistory: true,
	}
	RaiseEventData(stub, "EventOnDataChangeForPORT", additionalData)
	return shim.Success(nil)
}

// ###################### End ########################

// ###################### postDataToBlockchainDubaiTrade Function ########################
func (t *URChainCode) postDataToBlockchainTRADE(stub hypConnect, args []string, functionName string, orgType string) pb.Response {
	fmt.Printf("postDataToBlockchainTRADE: %v", args)

	if len(args[0]) <= 0 {
		return shim.Error("Invalid Number of Argument")
	}

	var alias []Alias
	err := json.Unmarshal([]byte(args[1]), &alias)
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error("Invalid Argument for Alias!!!!!!" + err.Error())
	}

	//<<get new parameter>>
	var companyLogo CompanyLogo
	err = json.Unmarshal([]byte(args[4]), &companyLogo)
	if err != nil {
		fmt.Printf("%s", err)
		return shim.Error("Invalid Argument !!!!!!" + err.Error())
	}
	var VATRegCertificate VATRegCertificate
	err = json.Unmarshal([]byte(args[5]), &VATRegCertificate)
	if err != nil {
		fmt.Printf("%s", err)
		return shim.Error("Invalid Argument !!!!!!" + err.Error())
	}
	//<<DT param unmarshaling placeholder>>

	postDataToBlockchainTRADE := &postDataToBlockchainTRADE{
		UnifiedID: sanitize(args[0], "string").(string),
		Alias:     alias,
		// the new parameters are :
		FacebookURL:       sanitize(args[2], "string").(string),
		TwitterURL:        sanitize(args[3], "string").(string),
		CompanyLogo:       companyLogo,
		VATRegCertificate: VATRegCertificate,
		VATAccountNo:      sanitize(args[6], "string").(string),
		//<<add parameter to the structre of DubaiTrade>>
	}

	// get the first part of the UnifiedID spliting string by "_"
	s := strings.Split(postDataToBlockchainTRADE.UnifiedID, "_")
	unifiedRegDataAsBytes, err := fetchData(stub, postDataToBlockchainTRADE.UnifiedID, "unifiedReg_"+s[0])
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error("Somthing went wrong while fetching Registration data" + err.Error())
	}
	//return an error if there is No Record for the specified ID
	if unifiedRegDataAsBytes == nil {
		return shim.Error("No customer registration found on the Blockchain for Key :" + postDataToBlockchainTRADE.UnifiedID)
	}

	//UnMarshal Registration data to JSON
	var unifiedRegDataAsJSON UnifiedReg
	err = json.Unmarshal([]byte(unifiedRegDataAsBytes), &unifiedRegDataAsJSON)
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error(err.Error())
	}

	//=================================================================================================================
	// insert the old document after changing the key to ==> old_key
	var old_UnifiedRegData_AsJSON = unifiedRegDataAsJSON
	old_UnifiedRegData_AsJSON.Key = unifiedRegDataAsJSON.Key + "_OLD"

	//marshal old document
	old_unifiedRegJSONasBytes, err := json.Marshal(old_UnifiedRegData_AsJSON)
	if err != nil {
		return shim.Error(err.Error())
	}

	// insert old document
	err = insertData(&stub, old_UnifiedRegData_AsJSON.Key, "unifiedReg_"+s[0], []byte(old_unifiedRegJSONasBytes))
	if err != nil {
		return shim.Error(err.Error())
	}
	//=================================================================================================================

	// Call function to Update Alias
	var compositeKeyArray []string
	err = updateAlias(stub, compositeKeyArray, &unifiedRegDataAsJSON, alias, orgType, postDataToBlockchainTRADE.UnifiedID, s[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	// Append remaining information here
	// new parameters are:
	unifiedRegDataAsJSON.FacebookURL = postDataToBlockchainTRADE.FacebookURL
	unifiedRegDataAsJSON.TwitterURL = postDataToBlockchainTRADE.TwitterURL
	unifiedRegDataAsJSON.CompanyLogo = postDataToBlockchainTRADE.CompanyLogo
	unifiedRegDataAsJSON.VATRegCertificate = postDataToBlockchainTRADE.VATRegCertificate
	unifiedRegDataAsJSON.VATAccountNo = postDataToBlockchainTRADE.VATAccountNo
	//<<update the field of main structure with DubaiTrade field>>

	updated_UnifiedRegDataAsBytes, err := json.Marshal(unifiedRegDataAsJSON)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = insertData(&stub, postDataToBlockchainTRADE.UnifiedID, "unifiedReg_"+s[0], []byte(updated_UnifiedRegDataAsBytes))
	if err != nil {
		return shim.Error(err.Error())
	}

	fmt.Println("postDataToBlockchainTRADE function executed successfully.")
	//raise Event for existing document ==> (with history flag)
	additionalData := &AdditionalData{
		CheckHistory: true,
	}
	RaiseEventData(stub, "EventOnDataChangeForTRADE", additionalData)
	return shim.Success(nil)
}

// ###################### End ########################

// ###################### postDataToBlockchainCustoms Function ########################
func (t *URChainCode) postDataToBlockchainCUSTOMS(stub hypConnect, args []string, functionName string, orgType string) pb.Response {
	fmt.Printf("postDataToBlockchainCustoms: %v", args)

	if len(args[0]) <= 0 {
		return shim.Error("Invalid Number of Argument")
	}

	var alias []Alias
	err := json.Unmarshal([]byte(args[1]), &alias)
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error("Invalid Argument for Alias!!!!!!" + err.Error())
	}

	//<<get new parameter>>
	var undertakingFromOwner UndertakingFromOwner
	err = json.Unmarshal([]byte(args[4]), &undertakingFromOwner)
	if err != nil {
		fmt.Printf("%s", err)
		return shim.Error("Invalid Argument !!!!!!" + err.Error())
	}
	var companyInfo CompanyInfo
	err = json.Unmarshal([]byte(args[5]), &companyInfo)
	if err != nil {
		fmt.Printf("%s", err)
		return shim.Error("Invalid Argument !!!!!!" + err.Error())
	}
	var contactCustoms []ContactCustoms
	err = json.Unmarshal([]byte(args[6]), &contactCustoms)
	if err != nil {
		fmt.Printf("%s", err)
		return shim.Error("Invalid Argument !!!!!!" + err.Error())
	}
	//<<DC param unmarshaling placeholder>>

	postDataToBlockchainCustoms := &postDataToBlockchainCustoms{
		UnifiedID:         sanitize(args[0], "string").(string),
		Alias:             alias,
		GroupBuisnessName: sanitize(args[2], "string").(string),
		// the new parameters are :
		AccountNameCustom:    sanitize(args[3], "string").(string),
		UndertakingFromOwner: undertakingFromOwner,
		CompanyInfo:          companyInfo,
		ContactCustoms:       contactCustoms,
		//<<add parameter to the structre of DubaiCustoms>>
	}
	fmt.Println("postDataToBlockchainCUSTOMS =======> ", postDataToBlockchainCustoms)

	// get the first part of the UnifiedID spliting string by "_"
	s := strings.Split(postDataToBlockchainCustoms.UnifiedID, "_")
	unifiedRegDataAsBytes, err := fetchData(stub, postDataToBlockchainCustoms.UnifiedID, "unifiedReg_"+s[0])
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error("Somthing went wrong while fetching Registration data" + err.Error())
	}
	//return an error if there is No Record for the specified ID
	if unifiedRegDataAsBytes == nil {
		return shim.Error("No customer registration found on the Blockchain for Key :" + postDataToBlockchainCustoms.UnifiedID)
	}

	//UnMarshal Registration data to JSON
	var unifiedRegDataAsJSON UnifiedReg
	err = json.Unmarshal([]byte(unifiedRegDataAsBytes), &unifiedRegDataAsJSON)
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error(err.Error())
	}

	//=================================================================================================================
	// insert the old document after changing the key to ==> old_key
	var old_UnifiedRegData_AsJSON = unifiedRegDataAsJSON
	old_UnifiedRegData_AsJSON.Key = unifiedRegDataAsJSON.Key + "_OLD"

	//marshal old document
	old_unifiedRegJSONasBytes, err := json.Marshal(old_UnifiedRegData_AsJSON)
	if err != nil {
		return shim.Error(err.Error())
	}

	// insert old document
	err = insertData(&stub, old_UnifiedRegData_AsJSON.Key, "unifiedReg_"+s[0], []byte(old_unifiedRegJSONasBytes))
	if err != nil {
		return shim.Error(err.Error())
	}
	//=================================================================================================================

	// Call function to Update Alias
	var compositeKeyArray []string
	err = updateAlias(stub, compositeKeyArray, &unifiedRegDataAsJSON, alias, orgType, postDataToBlockchainCustoms.UnifiedID, s[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	updated_UnifiedRegDataAsBytes, err := json.Marshal(unifiedRegDataAsJSON)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = insertData(&stub, postDataToBlockchainCustoms.UnifiedID, "unifiedReg_"+s[0], []byte(updated_UnifiedRegDataAsBytes))
	if err != nil {
		return shim.Error(err.Error())
	}

	///////////////////Unified Reg Grouping///////////////////////////
	//=================================================================================================================
	if postDataToBlockchainCustoms.GroupBuisnessName != "" {
		err = unfiedRegGrouping(stub, "C_", postDataToBlockchainCustoms.GroupBuisnessName, s[0], postDataToBlockchainCustoms.UnifiedID)
		if err != nil {
			return shim.Error(err.Error())
		}
	}

	//=================================================================================================================

	fmt.Println("postDataToBlockchainCUSTOMS function executed successfully.")
	//raise Event for existing document ==> (with history flag)
	additionalData := &AdditionalData{
		CheckHistory: true,
	}
	RaiseEventData(stub, "EventOnDataChangeForCUSTOMS", additionalData)
	return shim.Success(nil)
}

// ###################### End ########################

func (t *URChainCode) GetDataByKey(stub hypConnect, args []string, functionName string) pb.Response {
	fmt.Println("GetDataByKey: %v", args)

	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	_Key := sanitize(args[0], "string").(string)
	_Collection := sanitize(args[1], "string").(string)
	trnxAsBytes, err := fetchData(stub, _Key, _Collection)
	if err != nil {
		fmt.Println("No Data found with Key: " + _Key)
		return shim.Error("No Data found with key: " + err.Error())
	}
	if trnxAsBytes == nil {
		return shim.Error("No data found with key: ")
	}
	return shim.Success(trnxAsBytes)
}

// ###################### associateAlias Function ########################
func (t *URChainCode) associateAlias(stub hypConnect, args []string, functionName string, orgType string) pb.Response {
	fmt.Printf("associateAlias: %v", args)

	if len(args[0]) <= 0 {
		return shim.Error("Invalid Number of Argument")
	}
	//check for specified number of arguments
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2 Arguments")
	}
	var alias []Alias
	err := json.Unmarshal([]byte(args[1]), &alias)
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error("Invalid Argument for Alias!!!!!!" + err.Error())
	}

	associateAlias := &AssociateAlias{
		UnifiedID: sanitize(args[0], "string").(string),
		Alias:     alias,
	}
	fmt.Println("associateAlias =======> ", associateAlias)

	// get the first part of the UnifiedID spliting string by "_"
	s := strings.Split(associateAlias.UnifiedID, "_")
	unifiedRegDataAsBytes, err := fetchData(stub, associateAlias.UnifiedID, "unifiedReg_"+s[0])
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error("Somthing went wrong while fetching Registration data" + err.Error())
	}
	//return an error if there is No Record for the specified ID
	if unifiedRegDataAsBytes == nil {
		return shim.Error("No customer registration found on the Blockchain for Key :" + associateAlias.UnifiedID)
	}

	//UnMarshal Registration data to JSON
	var unifiedRegDataAsJSON UnifiedReg
	err = json.Unmarshal([]byte(unifiedRegDataAsBytes), &unifiedRegDataAsJSON)
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error(err.Error())
	}

	// Call function to Update Alias
	var compositeKeyArray []string
	err = updateAlias(stub, compositeKeyArray, &unifiedRegDataAsJSON, alias, orgType, associateAlias.UnifiedID, s[0])
	if err != nil {
		return shim.Error(err.Error())
	}

	// Append remaining information here
	//.... No data to be appended here ===> only the alias which is appended above

	updated_UnifiedRegDataAsBytes, err := json.Marshal(unifiedRegDataAsJSON)
	if err != nil {
		return shim.Error(err.Error())
	}

	err = insertData(&stub, associateAlias.UnifiedID, "unifiedReg_"+s[0], []byte(updated_UnifiedRegDataAsBytes))
	if err != nil {
		return shim.Error(err.Error())
	}
	fmt.Println("associateAlias function executed successfully.")

	RaiseEventData(stub, "associateAlias")
	return shim.Success(nil)
}

// ###################### End ########################

// ###################### getDataByUnifiedID Function ########################
func (t *URChainCode) getDataByUnifiedID(stub hypConnect, args []string, functionName string) pb.Response {
	fmt.Println("GetDataByUnifiedID: ", args)

	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	//check for specified number of arguments
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1 Argument")
	}
	UnifiedID := sanitize(args[0], "string").(string)

	// get the first part of the UnifiedID spliting string by "_"
	s := strings.Split(UnifiedID, "_")
	unifiedRegDataAsBytes, err := fetchData(stub, UnifiedID, "unifiedReg_"+s[0])
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error("Somthing went wrong while fetching Registration data" + err.Error())
	}
	//return an null if there is No Record for the specified ID
	if unifiedRegDataAsBytes == nil {
		return shim.Error("No Registration record found for the customer with Unified ID : " + UnifiedID)
	}

	//UnMarshal Registration data to JSON
	var unifiedRegDataAsJSON UnifiedReg
	err = json.Unmarshal([]byte(unifiedRegDataAsBytes), &unifiedRegDataAsJSON)
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error(err.Error())
	}
	// Retrieve all the aliases from the alias_**** collection
	var alias []Alias
	i := 0
	for i < len(unifiedRegDataAsJSON.AliasList) {

		//fetch each alias from the alias_*** collection.
		aliasAsBytes, err := fetchData(stub, unifiedRegDataAsJSON.AliasList[i], "alias_"+s[0])
		if err != nil {
			fmt.Printf("%s\n", err)
			return shim.Error("Somthing went wrong while fetching Registration data" + err.Error())
		}
		//continue if there is No Record for the specified ID
		if aliasAsBytes == nil {
			continue
		}
		var singleAliasAsJSON AliasStructure
		err = json.Unmarshal([]byte(aliasAsBytes), &singleAliasAsJSON)
		if err != nil {
			fmt.Printf("%s\n", err)
			return shim.Error(err.Error())
		}
		var singleAlias Alias
		singleAlias.Key = singleAliasAsJSON.AliasKey
		singleAlias.Type = singleAliasAsJSON.AliasType

		alias = append(alias, singleAlias)

		i += 1
	}
	unifiedRegDataAsJSON.Alias = alias

	UpdatedUnifiedRegDataAsBytes, err := json.Marshal(unifiedRegDataAsJSON)
	if err != nil {
		return shim.Error(err.Error())
	}

	return shim.Success([]byte(UpdatedUnifiedRegDataAsBytes))
}

// ###################### End ########################

// ###################### getDataByAlias Function ########################
func (t *URChainCode) getDataByAlias(stub hypConnect, args []string, functionName string, orgType string) pb.Response {
	fmt.Println("getDataByAlias: ", args)

	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	//check for specified number of arguments
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 1 Argument")
	}
	regAuthCode := sanitize(args[0], "string").(string)
	var alias1 Alias
	err1 := json.Unmarshal([]byte(args[1]), &alias1)
	if err1 != nil {
		fmt.Printf("%s\n", err1)
		return shim.Error("Invalid Argument for Alias!!!!!!" + err1.Error())
	}

	// create the compositeKye
	compositKey := ""
	if alias1.Type != "" {
		compositKey = orgType + "_" + alias1.Key + "_" + alias1.Type
	} else {
		compositKey = orgType + "_" + alias1.Key
	}

	// fetch the composite alias from alias_*** collection
	compositeAliasAsBytes, err := fetchData(stub, compositKey, "alias_"+regAuthCode)
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error("Somthing went wrong while fetching Registration data" + err.Error())
	}

	//return an null if there is No Record for the specified Alias
	if compositeAliasAsBytes == nil {
		return shim.Error("No Registration record found for the customer with Alias : " + compositKey)
	}

	var compositeAliasAsJSON AliasStructure
	err = json.Unmarshal([]byte(compositeAliasAsBytes), &compositeAliasAsJSON)
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error(err.Error())
	}

	s := strings.Split(compositeAliasAsJSON.UnifiedID, "_")
	unifiedRegDataAsBytes, err := fetchData(stub, compositeAliasAsJSON.UnifiedID, "unifiedReg_"+s[0])
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error("Somthing went wrong while fetching Registration data" + err.Error())
	}
	//return an null if there is No Record for the specified ID
	if unifiedRegDataAsBytes == nil {
		return shim.Error("No Registration record found for the customer with Unified ID : " + compositeAliasAsJSON.UnifiedID)
	}

	//UnMarshal Registration data to JSON
	var unifiedRegDataAsJSON UnifiedReg
	err = json.Unmarshal([]byte(unifiedRegDataAsBytes), &unifiedRegDataAsJSON)
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error(err.Error())
	}
	// Retrieve all the aliases from the alias_**** collection
	var alias []Alias
	i := 0
	for i < len(unifiedRegDataAsJSON.AliasList) {

		//fetch each alias from the alias_*** collection.
		aliasAsBytes, err := fetchData(stub, unifiedRegDataAsJSON.AliasList[i], "alias_"+s[0])
		if err != nil {
			fmt.Printf("%s\n", err)
			return shim.Error("Somthing went wrong while fetching Registration data" + err.Error())
		}
		//continue if there is No Record for the specified ID
		if aliasAsBytes == nil {
			continue
		}
		var singleAliasAsJSON AliasStructure
		err = json.Unmarshal([]byte(aliasAsBytes), &singleAliasAsJSON)
		if err != nil {
			fmt.Printf("%s\n", err)
			return shim.Error(err.Error())
		}
		var singleAlias Alias
		singleAlias.Key = singleAliasAsJSON.AliasKey
		singleAlias.Type = singleAliasAsJSON.AliasType

		alias = append(alias, singleAlias)

		i += 1
	}
	unifiedRegDataAsJSON.Alias = alias

	UpdatedUnifiedRegDataAsBytes, err := json.Marshal(unifiedRegDataAsJSON)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success([]byte(UpdatedUnifiedRegDataAsBytes))
}

// ###################### End ########################

// ###################### updateAlias Function ########################
func updateAlias(stub hypConnect, compositeKeyArray []string, unifiedRegDataAsJSON *UnifiedReg, alias []Alias, orgType string, unifiedID string, regAuth string) error {
	for i := 0; i < len(alias); i++ {

		compositKey := ""
		if alias[i].Type != "" {
			compositKey = orgType + "_" + alias[i].Key + "_" + alias[i].Type
		} else {
			compositKey = orgType + "_" + alias[i].Key
		}
		compositeKeyArray = append(compositeKeyArray, compositKey)
		aliasStructure := &AliasStructure{
			DocumentName: "alias",
			Key:          compositKey,
			AliasKey:     alias[i].Key,
			AliasType:    alias[i].Type,
			UnifiedID:    unifiedID,
		}

		aliasStructureAsBytes, err := json.Marshal(aliasStructure)
		if err != nil {
			return errors.New("Fail to Marshal the aliasStructure")
		}
		err = insertData(&stub, aliasStructure.Key, "alias_"+regAuth, []byte(aliasStructureAsBytes))
		if err != nil {
			return errors.New("Failed to insert data to Alias_*** Collection")
		}
	}

	//Update registrationData.alias and check for duplicates

	for j := 0; j < len(compositeKeyArray); j++ {
		exist := false

		for k := 0; k < len(unifiedRegDataAsJSON.AliasList); k++ {
			if compositeKeyArray[j] == unifiedRegDataAsJSON.AliasList[k] {
				exist = true
			}
		}
		if !exist {
			unifiedRegDataAsJSON.AliasList = append(unifiedRegDataAsJSON.AliasList, compositeKeyArray[j])
		}
	}

	return nil
}

// ###################### End ########################

// ###################### unfiedRegGrouping Function ########################
func unfiedRegGrouping(stub hypConnect, fORc string, GroupBuisnessNameOrFormationNo string, regAuth string, unifiedID string) error {

	unifiedRegGroupingAsBytes, err := fetchData(stub, fORc+GroupBuisnessNameOrFormationNo, "unifiedRegGrouping_"+regAuth)
	if err != nil {
		fmt.Printf("%s\n", err)
		return errors.New("Failed to fetch unifiedRegGrouping_*** collection ")
	}
	//if document does not exist
	if unifiedRegGroupingAsBytes == nil {
		var unifiedIDsArrary []string
		unifiedIDsArrary = append(unifiedIDsArrary, unifiedID)
		unifiedRegGrouping := &UnifiedRegGrouping{
			DocumentName: "unifiedRegGrouping",
			Key:          fORc + GroupBuisnessNameOrFormationNo, //fORc means =====> F_ or C_ for regAuth or Customs
			UnifiedIDs:   unifiedIDsArrary,
		}
		//insert document to collection
		//marshal document
		unifiedRegGroupingAsBytes, err := json.Marshal(unifiedRegGrouping)
		if err != nil {
			return errors.New("Failed to marshal unifiedRegGrouping")
		}
		// insert document
		err = insertData(&stub, unifiedRegGrouping.Key, "unifiedRegGrouping_"+regAuth, []byte(unifiedRegGroupingAsBytes))
		if err != nil {
			return errors.New("Failed to insert unifiedRegGrouping to unifiedRegGrouping_*** collection")
		}

	} else { // document exist
		//UnMarshal unifiedRegGroupingAsBytes
		var unifiedRegGroupingAsJSON UnifiedRegGrouping
		err = json.Unmarshal([]byte(unifiedRegGroupingAsBytes), &unifiedRegGroupingAsJSON)
		if err != nil {
			fmt.Printf("%s\n", err)
			return errors.New("Failed to Unmarshal unifiedRegGroupingAsJSON")
		}
		//check for duplicates
		var unifiedIDExist = false
		for i := 0; i < len(unifiedRegGroupingAsJSON.UnifiedIDs); i++ {
			if unifiedRegGroupingAsJSON.UnifiedIDs[i] == unifiedID {
				unifiedIDExist = true
			}
		}
		//check flag
		if !unifiedIDExist {
			//append unifiedID in the array
			unifiedRegGroupingAsJSON.UnifiedIDs = append(unifiedRegGroupingAsJSON.UnifiedIDs, unifiedID)

			//insert updated document to collection
			//marshal document
			updatedUnifiedRegGroupingAsBytes, err := json.Marshal(unifiedRegGroupingAsJSON)
			if err != nil {
				return errors.New("Failed to Marshal unifiedRegGroupingAsJSON berfor data Insertion")
			}
			// insert document
			err = insertData(&stub, unifiedRegGroupingAsJSON.Key, "unifiedRegGrouping_"+regAuth, []byte(updatedUnifiedRegGroupingAsBytes))
			if err != nil {
				return errors.New("Failed to insert data to unifiedRegGrouping_ *** collection")
			}
		}
	}
	return nil
}

// ###################### End ########################
