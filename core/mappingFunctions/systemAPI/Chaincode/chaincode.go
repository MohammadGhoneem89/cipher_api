package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/lib/cid"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

//<<Standard Code Section - Start>>

/* ===================================================================================
	This is the system generated code section. Please don't make any change in this section
  ===================================================================================*/

//Struct For Chain Code
type PRChainCode struct {
}

var logger = shim.NewLogger("PR")

//Standard Functions
func main() {
	fmt.Println("PR ChainCode Started")
	err := shim.Start(new(PRChainCode))
	if err != nil {
		fmt.Println("Error starting PR chaincode: %s", err)
	}
}

//Init is called during chaincode instantiation to initialize any data.
func (t *PRChainCode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("PR ChainCode Initiated")

	_, args := stub.GetFunctionAndParameters()
	fmt.Println("Init: %v", args)
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
func (t *PRChainCode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {

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

	function, _ := stub.GetFunctionAndParameters()
	fmt.Println("Invoke is running for function: " + function)

	args, errTrans := getArguments(stub)
	if errTrans != nil {
		return shim.Error(errTrans.Error())
	}
	fmt.Println("Arguments Loaded Successfully!!")

	//<<Function Validation Logic-Start>>
	if orgType == "GOVT" {						
		switch functionName := function; functionName {
		//<<FunctionCases-Start>>
		
		case "AddTenant":
			return t.AddTenant(stub, args,"AddTenant")
					
		//<<FunctionCases-Start>>
		
		case "EjariTerminationStatus":
			return t.EjariTerminationStatus(stub, args,"EjariTerminationStatus")
					
		//<<FunctionCases-Start>>
		
		case "GetContractDataForEjari":
			return t.GetContractDataForEjari(stub, args,"GetContractDataForEjari")
					
		//<<FunctionCases-Start>>
		
		case "GetKYCDetail":
			return t.GetKYCDetail(stub, args,"GetKYCDetail")
					
		//<<FunctionCases-Start>>
		
		case "Logout":
			return t.Logout(stub, args,"Logout")
					
		//<<FunctionCases-Start>>
		
		case "SaveEjariHashData":
			return t.SaveEjariHashData(stub, args,"SaveEjariHashData")
					
		//<<FunctionCases-Start>>
		
		case "UpdateDEWADetail":
			return t.UpdateDEWADetail(stub, args,"UpdateDEWADetail")
					
		//<<FunctionCases-Start>>
		
		case "UpdateKYCDetail":
			return t.UpdateKYCDetail(stub, args,"UpdateKYCDetail")
					
		//<<FunctionCases-Start>>
		
		case "UpdateToken":
			return t.UpdateToken(stub, args,"UpdateToken")
					
		//<<FunctionCases-End>>
		
		default:
			logger.Warning("Invoke did not find function: " + function)
			return shim.Error("Received unknown function invocation: " + function)
		}
	} else 
//<<Function Validation Logic-Start>>
	if orgType == "BANKS" {						
		switch functionName := function; functionName {
		//<<FunctionCases-Start>>
		
		case "AssociatePaymentInstruments":
			return t.AssociatePaymentInstruments(stub, args,"AssociatePaymentInstruments")
					
		//<<FunctionCases-Start>>
		
		case "GetContractData":
			return t.GetContractData(stub, args,"GetContractData")
					
		//<<FunctionCases-Start>>
		
		case "UpdatePaymentInstrumentStatus":
			return t.UpdatePaymentInstrumentStatus(stub, args,"UpdatePaymentInstrumentStatus")
					
		//<<FunctionCases-End>>
		
		default:
			logger.Warning("Invoke did not find function: " + function)
			return shim.Error("Received unknown function invocation: " + function)
		}
	} else 
//<<Function Validation Logic-Start>>
	if orgType == "PM" {						
		switch functionName := function; functionName {
		//<<FunctionCases-Start>>
		
		case "GetContractDetails":
			return t.GetContractDetails(stub, args,"GetContractDetails")
					
		//<<FunctionCases-Start>>
		
		case "GetContractDetailsBackOffice":
			return t.GetContractDetailsBackOffice(stub, args,"GetContractDetailsBackOffice")
					
		//<<FunctionCases-Start>>
		
		case "InsertPaymentMetaInfo":
			return t.InsertPaymentMetaInfo(stub, args,"InsertPaymentMetaInfo")
					
		//<<FunctionCases-Start>>
		
		case "ProcessInstrument":
			return t.ProcessInstrument(stub, args,"ProcessInstrument")
					
		//<<FunctionCases-Start>>
		
		case "RenewContract":
			return t.RenewContract(stub, args,"RenewContract")
					
		//<<FunctionCases-Start>>
		
		case "ReplacePaymentInstruments":
			return t.ReplacePaymentInstruments(stub, args,"ReplacePaymentInstruments")
					
		//<<FunctionCases-Start>>
		
		case "ReplacePaymentInstrumentsBackOffice":
			return t.ReplacePaymentInstrumentsBackOffice(stub, args,"ReplacePaymentInstrumentsBackOffice")
					
		//<<FunctionCases-Start>>
		
		case "ReprocessEjari":
			return t.ReprocessEjari(stub, args,"ReprocessEjari")
					
		//<<FunctionCases-Start>>
		
		case "RequestKYC":
			return t.RequestKYC(stub, args,"RequestKYC")
					
		//<<FunctionCases-Start>>
		
		case "TerminateContract":
			return t.TerminateContract(stub, args,"TerminateContract")
					
		//<<FunctionCases-Start>>
		
		case "UpdateContract":
			return t.UpdateContract(stub, args,"UpdateContract")
					
		//<<FunctionCases-End>>
		
		default:
			logger.Warning("Invoke did not find function: " + function)
			return shim.Error("Received unknown function invocation: " + function)
		}
	} else 
//<<Function Validation Logic-Start>>
	if orgType == "OG1" {						
		switch functionName := function; functionName {
		//<<FunctionCases-Start>>
		
		case "UpdateContractStatus":
			return t.UpdateContractStatus(stub, args,"UpdateContractStatus")
					
		//<<FunctionCases-End>>
		
		default:
			logger.Warning("Invoke did not find function: " + function)
			return shim.Error("Received unknown function invocation: " + function)
		}
	} else //<<Function Validation Logic - End>>
	{
		return shim.Error("Invalid MSP: " + orgType)
	}
	
}

func insertDataAndRaiseEvent(stub shim.ChaincodeStubInterface,key string,eventType string,data []byte) error {
	
	err := stub.PutState(key, data)
	if err != nil {
		return err
	}
	logger.Debug("Successfully Put State for Key: " + key)
		
	err = stub.SetEvent(eventType, []byte(data))
	if err != nil {
		return err
	}
	logger.Debug("Successfully Raised Chain Code for Event Type: " + eventType)
	return nil
}

//<<Standard Code Section - End>>

//<<Custom Function Section - Start>>

/* ===================================================================================
 	All the customs functions for all organization will be added here
===================================================================================== */

//Structs for Custom Functions to be added here


//<<FunctionDefinition - Start>>
/*
	Function Name:AddTenant
	Description: UAE Pass authentication token event for the user login is stamped on blockchain for both WASL and Bank.
*/
func (t *PRChainCode) AddTenant(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("AddTenant: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
AddTenant := &AddTenant{	
		OrgCode:   sanitize(args[0], "string").(string),
OrgID:   sanitize(args[1], "string").(string),
EmiratesID:   sanitize(args[2], "string").(string),
CustomerName:   sanitize(args[3], "string").(string),
MobileNumber:   sanitize(args[4], "string").(string),
EmailID:   sanitize(args[5], "string").(string),
VisaNo:   sanitize(args[6], "string").(string),
VisaExpiryDate:   sanitize(args[7], "string").(string),
EmiratesIDExpiryDate:   sanitize(args[8], "string").(string),
AuthToken:   sanitize(args[9], "string").(string),
Timestamp:   sanitize(args[10], "string").(string),
OrgCodeWASL:   sanitize(args[11], "string").(string),
  }

fmt.Println(AddTenant)
	logger.Debug("AddTenant function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:EjariTerminationStatus
	Description: When DLD will receive the termination request either from Blockchain or WASL legacy system, DLD to call this API to update the status on Blockchain when termination is successful.
*/
func (t *PRChainCode) EjariTerminationStatus(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("EjariTerminationStatus: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
EjariTerminationStatus := &EjariTerminationStatus{	
		OrgCode:   sanitize(args[0], "string").(string),
ContractID:   sanitize(args[1], "string").(string),
EjariTerminationStatus:   sanitize(args[2], "string").(string),
  }

fmt.Println(EjariTerminationStatus)
	logger.Debug("EjariTerminationStatus function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:GetContractDataForEjari
	Description: The API is used by DLD to retrieve the basic detail of the contract required to process or terminate Ejari.
*/
func (t *PRChainCode) GetContractDataForEjari(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("GetContractDataForEjari: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
GetContractDataForEjari := &GetContractDataForEjari{	
		OrgCode:   sanitize(args[0], "string").(string),
ContractID:   sanitize(args[1], "string").(string),
  }

fmt.Println(GetContractDataForEjari)
	logger.Debug("GetContractDataForEjari function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:GetKYCDetail
	Description: WASL will call this API to get the current KYC information available on the Blockchain.
Also, the customer selects the contract for renewal, WASL to call this API to initiate the KYC request to GDRFA. An event will be sent to WASL by calling their API to notify about the KYC detail when the information is successfully received from GDRFA.
*/
func (t *PRChainCode) GetKYCDetail(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("GetKYCDetail: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
GetKYCDetail := &GetKYCDetail{	
		EIDA:   sanitize(args[0], "string").(string),
  }

fmt.Println(GetKYCDetail)
	logger.Debug("GetKYCDetail function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:Logout
	Description: When UAE pass session is logged out or timed out, SDG to stamp the session end event on the Blockchain.
*/
func (t *PRChainCode) Logout(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("Logout: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
Logout := &Logout{	
		OrgCode:   sanitize(args[0], "string").(string),
AuthToken:   sanitize(args[1], "string").(string),
OrgID:   sanitize(args[2], "string").(string),
Timestamp:   sanitize(args[3], "string").(string),
  }

fmt.Println(Logout)
	logger.Debug("Logout function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:SaveEjariHashData
	Description: The API consumed by DLD to stamp Ejari hash data on the blockchain when Ejari is successfully generated in the internal system and issued to the customer.
*/
func (t *PRChainCode) SaveEjariHashData(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("SaveEjariHashData: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
SaveEjariHashData := &SaveEjariHashData{	
		ContractID:   sanitize(args[0], "string").(string),
OrgCode:   sanitize(args[1], "string").(string),
EjariNumber:   sanitize(args[2], "string").(string),
TenantNumber:   sanitize(args[3], "string").(string),
EjariStatus:   sanitize(args[4], "string").(string),
EjariHash:   sanitize(args[5], "string").(string),
SignedEjariHash:   sanitize(args[6], "string").(string),
  }

fmt.Println(SaveEjariHashData)
	logger.Debug("SaveEjariHashData function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:UpdateDEWADetail
	Description: The API consumed by DLD to stamp DEWA related details on the blockchain
*/
func (t *PRChainCode) UpdateDEWADetail(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("UpdateDEWADetail: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
UpdateDEWADetail := &UpdateDEWADetail{	
		OrgCode:   sanitize(args[0], "string").(string),
ContractID:   sanitize(args[1], "string").(string),
  }

fmt.Println(UpdateDEWADetail)
	logger.Debug("UpdateDEWADetail function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:UpdateKYCDetail
	Description: The API to be consumed by GDRFA to stamp the latest KYC information of the customer on Blockchain.
*/
func (t *PRChainCode) UpdateKYCDetail(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("UpdateKYCDetail: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
UpdateKYCDetail := &UpdateKYCDetail{	
		ResidenceAddr:   sanitize(args[0], "string").(string),
ContactPersonMobile:   sanitize(args[1], "string").(string),
Nationality:   sanitize(args[2], "string").(string),
DateOfBirth:   sanitize(args[3], "string").(string),
NatId:   sanitize(args[4], "string").(string),
NatIdExpDate:   sanitize(args[5], "string").(string),
PoBox:   sanitize(args[6], "string").(string),
PhoneNo:   sanitize(args[7], "string").(string),
Gender:   sanitize(args[8], "string").(string),
TenantNameEn:   sanitize(args[9], "string").(string),
TenantNameAr:   sanitize(args[10], "string").(string),
VisaNo:   sanitize(args[11], "string").(string),
VisaIssueDate:   sanitize(args[12], "string").(string),
VisaExpiryDate:   sanitize(args[13], "string").(string),
VisaStatus:   sanitize(args[14], "string").(string),
  }

fmt.Println(UpdateKYCDetail)
	logger.Debug("UpdateKYCDetail function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:UpdateToken
	Description: When UAE pass auth token for WASL or Bank is expired, entities will refresh the new token with UAE pass and SDG will stamp the hash of newly assigned auth token on the Blockchain by calling this API.
*/
func (t *PRChainCode) UpdateToken(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("UpdateToken: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
UpdateToken := &UpdateToken{	
		OrgCode:   sanitize(args[0], "string").(string),
OrgID:   sanitize(args[1], "string").(string),
OldAuthToken:   sanitize(args[2], "string").(string),
NewAuthToken:   sanitize(args[3], "string").(string),
Timestamp:   sanitize(args[4], "string").(string),
  }

fmt.Println(UpdateToken)
	logger.Debug("UpdateToken function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:AssociatePaymentInstruments
	Description: The API consumed by the Bank to stamp the payment instruments association on the blockchain. This could have variations to store first time payments as well as later payments done based on payment terms.
*/
func (t *PRChainCode) AssociatePaymentInstruments(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("AssociatePaymentInstruments: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
AssociatePaymentInstruments := &AssociatePaymentInstruments{	
		AuthToken:   sanitize(args[0], "string").(string),
EIDA:   sanitize(args[1], "string").(string),
ContractID:   sanitize(args[2], "string").(string),
OrgCode:   sanitize(args[3], "string").(string),
  }

fmt.Println(AssociatePaymentInstruments)
	logger.Debug("AssociatePaymentInstruments function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:GetContractData
	Description: The API is used by the banks to retrieve the basic detail of the contract and payment instruments detail.
*/
func (t *PRChainCode) GetContractData(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("GetContractData: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
GetContractData := &GetContractData{	
		OrgCode:   sanitize(args[0], "string").(string),
EIDA:   sanitize(args[1], "string").(string),
AuthToken:   sanitize(args[2], "string").(string),
ContractID:   sanitize(args[3], "string").(string),
undefined:   sanitize(args[4], "string").(string),
  }

fmt.Println(GetContractData)
	logger.Debug("GetContractData function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:UpdatePaymentInstrumentStatus
	Description: The API consumed by the Bank to stamp the status of the payment instrument on the Blockchain.
*/
func (t *PRChainCode) UpdatePaymentInstrumentStatus(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("UpdatePaymentInstrumentStatus: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
UpdatePaymentInstrumentStatus := &UpdatePaymentInstrumentStatus{	
		OrgCode:   sanitize(args[0], "string").(string),
ContractID:   sanitize(args[1], "string").(string),
  }

fmt.Println(UpdatePaymentInstrumentStatus)
	logger.Debug("UpdatePaymentInstrumentStatus function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:GetContractDetails
	Description: The Rest API is used by WASL to retrieve the information of the tenancy contract from the Blockchain.
*/
func (t *PRChainCode) GetContractDetails(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("GetContractDetails: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
GetContractDetails := &GetContractDetails{	
		EIDA:   sanitize(args[0], "string").(string),
AuthToken:   sanitize(args[1], "string").(string),
ContractID:   sanitize(args[2], "string").(string),
OrgCode:   sanitize(args[3], "string").(string),
  }

fmt.Println(GetContractDetails)
	logger.Debug("GetContractDetails function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:GetContractDetailsBackOffice
	Description: The Rest API is used by WASL to retrieve the information of the tenancy contract from the Blockchain.
*/
func (t *PRChainCode) GetContractDetailsBackOffice(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("GetContractDetailsBackOffice: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
GetContractDetailsBackOffice := &GetContractDetailsBackOffice{	
		EIDA:   sanitize(args[0], "string").(string),
ContractID:   sanitize(args[1], "string").(string),
OrgCode:   sanitize(args[2], "string").(string),
  }

fmt.Println(GetContractDetailsBackOffice)
	logger.Debug("GetContractDetailsBackOffice function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:InsertPaymentMetaInfo
	Description: To add Payment in blockchain
*/
func (t *PRChainCode) InsertPaymentMetaInfo(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("InsertPaymentMetaInfo: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
InsertPaymentMetaInfo := &InsertPaymentMetaInfo{	
		Code:   sanitize(args[0], "string").(string),
Name:   sanitize(args[1], "string").(string),
BeneficiaryData:   sanitize(args[2], "string").(string),
BankCode:   sanitize(args[3], "string").(string),
  }

fmt.Println(InsertPaymentMetaInfo)
	logger.Debug("InsertPaymentMetaInfo function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:ProcessInstrument
	Description: ProcessInstrument
*/
func (t *PRChainCode) ProcessInstrument(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("ProcessInstrument: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
ProcessInstrument := &ProcessInstrument{	
		ContractID:   sanitize(args[0], "string").(string),
OrgCode:   sanitize(args[1], "string").(string),
  }

fmt.Println(ProcessInstrument)
	logger.Debug("ProcessInstrument function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:RenewContract
	Description: The Rest API can be used to add a renewal of the tenancy contract on the Blockchain along with installments, payment method and selected bank.
*/
func (t *PRChainCode) RenewContract(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("RenewContract: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
RenewContract := &RenewContract{	
		AuthToken:   sanitize(args[0], "string").(string),
EIDA:   sanitize(args[1], "string").(string),
ContractID:   sanitize(args[2], "string").(string),
ContractReference:   sanitize(args[3], "string").(string),
LastContractID:   sanitize(args[4], "string").(string),
ContractStartDate:   sanitize(args[5], "string").(string),
ContractEndDate:   sanitize(args[6], "string").(string),
ContractAmount:   sanitize(args[7], "string").(string),
TenantName:   sanitize(args[8], "string").(string),
UserReferenceNumber:   sanitize(args[9], "string").(string),
PropertyReferenceNumber:   sanitize(args[10], "string").(string),
BusinessPartnerNo:   sanitize(args[11], "string").(string),
OldeEjariNumber:   sanitize(args[12], "string").(string),
ContractSignedHash:   sanitize(args[13], "string").(string),
PaymentMethod:   sanitize(args[14], "string").(string),
CheckKYCStatus:   sanitize(args[15], "string").(string),
PaymentCount:   sanitize(args[16], "int64").(int64),
IsLegacyContract:   sanitize(args[17], "bool").(bool),
OrgCode:   sanitize(args[18], "string").(string),
KYCValidationPeriod:   sanitize(args[19], "int64").(int64),
undefined:   sanitize(args[20], "string").(string),
  }

fmt.Println(RenewContract)
	logger.Debug("RenewContract function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:ReplacePaymentInstruments
	Description: The Rest API consumed by WASL to replace the payment instrument DDS/ECHEQUE with any method, if the payment replacement is done by the customer through UI.
*/
func (t *PRChainCode) ReplacePaymentInstruments(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("ReplacePaymentInstruments: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
ReplacePaymentInstruments := &ReplacePaymentInstruments{	
		AuthToken:   sanitize(args[0], "string").(string),
EIDA:   sanitize(args[1], "string").(string),
ContractID:   sanitize(args[2], "string").(string),
undefined:   sanitize(args[3], "string").(string),
  }

fmt.Println(ReplacePaymentInstruments)
	logger.Debug("ReplacePaymentInstruments function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:ReplacePaymentInstrumentsBackOffice
	Description: The Rest API consumed by WASL to replace the payment instrument DDS/ECHEQUE with any method, if the payment replacement is done by the customer through UI.
*/
func (t *PRChainCode) ReplacePaymentInstrumentsBackOffice(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("ReplacePaymentInstrumentsBackOffice: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
ReplacePaymentInstrumentsBackOffice := &ReplacePaymentInstrumentsBackOffice{	
		EIDA:   sanitize(args[0], "string").(string),
ContractID:   sanitize(args[1], "string").(string),
undefined:   sanitize(args[2], "string").(string),
  }

fmt.Println(ReplacePaymentInstrumentsBackOffice)
	logger.Debug("ReplacePaymentInstrumentsBackOffice function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:ReprocessEjari
	Description: The Rest API consumed by WASL to re-process or re-terminate the Ejari to DLD if the issuance or the termination of the Ejari is failed from DLD due to any reason.
*/
func (t *PRChainCode) ReprocessEjari(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("ReprocessEjari: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
ReprocessEjari := &ReprocessEjari{	
		ContractID:   sanitize(args[0], "string").(string),
RequestType:   sanitize(args[1], "string").(string),
undefined:   sanitize(args[2], "string").(string),
  }

fmt.Println(ReprocessEjari)
	logger.Debug("ReprocessEjari function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:RequestKYC
	Description: 
*/
func (t *PRChainCode) RequestKYC(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("RequestKYC: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
RequestKYC := &RequestKYC{	
		OrgCode:   sanitize(args[0], "string").(string),
EIDA:   sanitize(args[1], "string").(string),
  }

fmt.Println(RequestKYC)
	logger.Debug("RequestKYC function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:TerminateContract
	Description: The Rest API consumed by WASL to terminate the contract on the Blockchain.
*/
func (t *PRChainCode) TerminateContract(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("TerminateContract: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
TerminateContract := &TerminateContract{	
		ContractID:   sanitize(args[0], "string").(string),
TerminationDate:   sanitize(args[1], "string").(string),
TerminationReason:   sanitize(args[2], "string").(string),
EjariNumber:   sanitize(args[3], "string").(string),
TerminationType:   sanitize(args[4], "string").(string),
  }

fmt.Println(TerminateContract)
	logger.Debug("TerminateContract function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:UpdateContract
	Description: The Rest API can be used by WASL to update the WASL’s CRM ticket number when the contract is successfully processed, and this information will be saved in the off-chain database.
*/
func (t *PRChainCode) UpdateContract(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("UpdateContract: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
UpdateContract := &UpdateContract{	
		ContractID:   sanitize(args[0], "string").(string),
CRMTicketNo:   sanitize(args[1], "string").(string),
OrgCode:   sanitize(args[2], "string").(string),
  }

fmt.Println(UpdateContract)
	logger.Debug("UpdateContract function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:UpdateContractStatus
	Description: The API is used by the banks to retrieve the basic detail of the contract and payment instruments detail.
*/
func (t *PRChainCode) UpdateContractStatus(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("UpdateContractStatus: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
UpdateContractStatus := &UpdateContractStatus{	
		OrgCode:   sanitize(args[0], "string").(string),
ContractID:   sanitize(args[1], "string").(string),
  }

fmt.Println(UpdateContractStatus)
	logger.Debug("UpdateContractStatus function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - End>>

//<<Custom Function Section - End>>