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
type URChainCode struct {
}

var logger = shim.NewLogger("UR")

//Standard Functions
func main() {
	fmt.Println("UR ChainCode Started")
	err := shim.Start(new(URChainCode))
	if err != nil {
		fmt.Println("Error starting UR chaincode: %s", err)
	}
}

//Init is called during chaincode instantiation to initialize any data.
func (t *URChainCode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("UR ChainCode Initiated")

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

	function, _ := stub.GetFunctionAndParameters()
	fmt.Println("Invoke is running for function: " + function)

	args, errTrans := getArguments(stub)
	if errTrans != nil {
		return shim.Error(errTrans.Error())
	}
	fmt.Println("Arguments Loaded Successfully!!")

	//<<Function Validation Logic-Start>>
	if orgType == "PM" {						
		switch functionName := function; functionName {
		//<<FunctionCases-Start>>
		
		case "addAttribute":
			return t.addAttribute(stub, args,"addAttribute")
					
		//<<FunctionCases-End>>
		
		default:
			logger.Warning("Invoke did not find function: " + function)
			return shim.Error("Received unknown function invocation: " + function)
		}
	} else 
//<<Function Validation Logic-Start>>
	if orgType == "CHAMBEROFCOMM" {						
		switch functionName := function; functionName {
		//<<FunctionCases-Start>>
		
		case "associateAlias":
			return t.associateAlias(stub, args,"associateAlias")
					
		//<<FunctionCases-Start>>
		
		case "getDataByAlias":
			return t.getDataByAlias(stub, args,"getDataByAlias")
					
		//<<FunctionCases-Start>>
		
		case "getDataByUnifiedID":
			return t.getDataByUnifiedID(stub, args,"getDataByUnifiedID")
					
		//<<FunctionCases-Start>>
		
		case "postDataToBlockchainChamber":
			return t.postDataToBlockchainChamber(stub, args,"postDataToBlockchainChamber")
					
		//<<FunctionCases-End>>
		
		default:
			logger.Warning("Invoke did not find function: " + function)
			return shim.Error("Received unknown function invocation: " + function)
		}
	} else 
//<<Function Validation Logic-Start>>
	if orgType == "undefined" {						
		switch functionName := function; functionName {
		//<<FunctionCases-Start>>
		
		case "getAttributeList":
			return t.getAttributeList(stub, args,"getAttributeList")
					
		//<<FunctionCases-Start>>
		
		case "getDataByUnifiedID2":
			return t.getDataByUnifiedID2(stub, args,"getDataByUnifiedID2")
					
		//<<FunctionCases-Start>>
		
		case "postDataToBlockchainCustoms":
			return t.postDataToBlockchainCustoms(stub, args,"postDataToBlockchainCustoms")
					
		//<<FunctionCases-End>>
		
		default:
			logger.Warning("Invoke did not find function: " + function)
			return shim.Error("Received unknown function invocation: " + function)
		}
	} else 
//<<Function Validation Logic-Start>>
	if orgType == "PORT" {						
		switch functionName := function; functionName {
		//<<FunctionCases-Start>>
		
		case "postDataToBlockchainDPW":
			return t.postDataToBlockchainDPW(stub, args,"postDataToBlockchainDPW")
					
		//<<FunctionCases-End>>
		
		default:
			logger.Warning("Invoke did not find function: " + function)
			return shim.Error("Received unknown function invocation: " + function)
		}
	} else 
//<<Function Validation Logic-Start>>
	if orgType == "TRADE" {						
		switch functionName := function; functionName {
		//<<FunctionCases-Start>>
		
		case "postDataToBlockchainDubaiTrade":
			return t.postDataToBlockchainDubaiTrade(stub, args,"postDataToBlockchainDubaiTrade")
					
		//<<FunctionCases-End>>
		
		default:
			logger.Warning("Invoke did not find function: " + function)
			return shim.Error("Received unknown function invocation: " + function)
		}
	} else 
//<<Function Validation Logic-Start>>
	if orgType == "REGAUTH" {						
		switch functionName := function; functionName {
		//<<FunctionCases-Start>>
		
		case "postDataToBlockchainRegAuth":
			return t.postDataToBlockchainRegAuth(stub, args,"postDataToBlockchainRegAuth")
					
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
	Function Name:addAttribute
	Description: addAttribute API For DPW Project
*/
func (t *URChainCode) addAttribute(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("addAttribute: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
addAttribute := &addAttribute{	
		Name:   sanitize(args[0], "string").(string),
DataProvider:   sanitize(args[1], "string").(string),
Type:   sanitize(args[2], "string").(string),
Occurrence:   sanitize(args[3], "string").(string),
IsRequired:   sanitize(args[4], "bool").(bool),
  }

fmt.Println(addAttribute)
	logger.Debug("addAttribute function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:associateAlias
	Description: This API is consumed by Dubai Customs, DP World, Dubai Chamber , Dubai Trade to stamp the alias related information on the Blockchain.
*/
func (t *URChainCode) associateAlias(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("associateAlias: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
associateAlias := &associateAlias{	
		UnifiedID:   sanitize(args[0], "string").(string),
  }

fmt.Println(associateAlias)
	logger.Debug("associateAlias function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:getDataByAlias
	Description: This API is consumed by Dubai Customs, DP World, Dubai Chamber, Dubai Trade to get the record by from the Blockchain based on the Alias
*/
func (t *URChainCode) getDataByAlias(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("getDataByAlias: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
getDataByAlias := &getDataByAlias{	
		RegAuthCode:   sanitize(args[0], "string").(string),
  }

fmt.Println(getDataByAlias)
	logger.Debug("getDataByAlias function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:getDataByUnifiedID
	Description: 
*/
func (t *URChainCode) getDataByUnifiedID(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("getDataByUnifiedID: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
getDataByUnifiedID := &getDataByUnifiedID{	
		UnifiedID:   sanitize(args[0], "string").(string),
  }

fmt.Println(getDataByUnifiedID)
	logger.Debug("getDataByUnifiedID function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:postDataToBlockchainChamber
	Description: This API is consumed by Dubai Chamber (DCC) to stamp the licensing/registration related information on the Blockchain.
*/
func (t *URChainCode) postDataToBlockchainChamber(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("postDataToBlockchainChamber: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
postDataToBlockchainChamber := &postDataToBlockchainChamber{	
		UnifiedID:   sanitize(args[0], "string").(string),
MembershipExpiryDate:   sanitize(args[1], "string").(string),
MembershipStatus:   sanitize(args[2], "string").(string),
  }

fmt.Println(postDataToBlockchainChamber)
	logger.Debug("postDataToBlockchainChamber function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:getAttributeList
	Description: getAttributeList
*/
func (t *URChainCode) getAttributeList(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("getAttributeList: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
getAttributeList := &getAttributeList{	
		UnifiedID:   sanitize(args[0], "string").(string),
  }

fmt.Println(getAttributeList)
	logger.Debug("getAttributeList function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:getDataByUnifiedID2
	Description: 
*/
func (t *URChainCode) getDataByUnifiedID2(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("getDataByUnifiedID2: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
getDataByUnifiedID2 := &getDataByUnifiedID2{	
		UnifiedID:   sanitize(args[0], "string").(string),
  }

fmt.Println(getDataByUnifiedID2)
	logger.Debug("getDataByUnifiedID2 function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:postDataToBlockchainCustoms
	Description: This API is consumed by Dubai Trade (Dubai Customs) to stamp the licensing/registration related information on the Blockchain.
*/
func (t *URChainCode) postDataToBlockchainCustoms(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("postDataToBlockchainCustoms: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
postDataToBlockchainCustoms := &postDataToBlockchainCustoms{	
		UnifiedID:   sanitize(args[0], "string").(string),
AccountName:   sanitize(args[1], "string").(string),
GroupBuisnessName:   sanitize(args[2], "string").(string),
  }

fmt.Println(postDataToBlockchainCustoms)
	logger.Debug("postDataToBlockchainCustoms function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:postDataToBlockchainDPW
	Description: This API is consumed by DP World (DPW) to stamp the licensing/registration related information on the Blockchain.
*/
func (t *URChainCode) postDataToBlockchainDPW(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("postDataToBlockchainDPW: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
postDataToBlockchainDPW := &postDataToBlockchainDPW{	
		UnifiedID:   sanitize(args[0], "string").(string),
CompanyBrief:   sanitize(args[1], "string").(string),
NonVATCustomer:   sanitize(args[2], "bool").(bool),
  }

fmt.Println(postDataToBlockchainDPW)
	logger.Debug("postDataToBlockchainDPW function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:postDataToBlockchainDubaiTrade
	Description: This API is consumed by Dubai Trade (Dubai Trade) to stamp the licensing/registration related information on the Blockchain.
*/
func (t *URChainCode) postDataToBlockchainDubaiTrade(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("postDataToBlockchainDubaiTrade: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
postDataToBlockchainDubaiTrade := &postDataToBlockchainDubaiTrade{	
		UnifiedID:   sanitize(args[0], "string").(string),
FacebookURL:   sanitize(args[1], "string").(string),
TwitterURL:   sanitize(args[2], "string").(string),
VATAccountNo:   sanitize(args[3], "string").(string),
  }

fmt.Println(postDataToBlockchainDubaiTrade)
	logger.Debug("postDataToBlockchainDubaiTrade function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:postDataToBlockchainRegAuth
	Description: This API is consumed by registration authority (JAFZA) to stamp the licensing/registration related information on the Blockchain. The same method will be called for adding new data or modification to any data already stamped on the chain. Complete payload information should be provided again.
*/
func (t *URChainCode) postDataToBlockchainRegAuth(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("postDataToBlockchainRegAuth: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
postDataToBlockchainRegAuth := &postDataToBlockchainRegAuth{	
		UnifiedID:   sanitize(args[0], "string").(string),
Issuedate:   sanitize(args[1], "string").(string),
ExpiryDate:   sanitize(args[2], "string").(string),
Status:   sanitize(args[3], "string").(string),
TradeZone:   sanitize(args[4], "string").(string),
LicenseCategoryCodeDescEn:   sanitize(args[5], "string").(string),
LicenseCategoryCodeDescAr:   sanitize(args[6], "string").(string),
LicenseTerminatedDate:   sanitize(args[7], "string").(string),
RenewalDate:   sanitize(args[8], "string").(string),
FormationNo:   sanitize(args[9], "string").(string),
AccountNumber:   sanitize(args[10], "string").(string),
AccountNameAr:   sanitize(args[11], "string").(string),
AccountNameEn:   sanitize(args[12], "string").(string),
AccountStatus:   sanitize(args[13], "string").(string),
AccountFormationDate:   sanitize(args[14], "string").(string),
EstablishmentType:   sanitize(args[15], "string").(string),
LegalEntity:   sanitize(args[16], "string").(string),
CountryOfOrigin:   sanitize(args[17], "string").(string),
City:   sanitize(args[18], "string").(string),
Address:   sanitize(args[19], "string").(string),
POBOX:   sanitize(args[20], "string").(string),
Email:   sanitize(args[21], "string").(string),
Phone:   sanitize(args[22], "string").(string),
MobileNumber:   sanitize(args[23], "string").(string),
Website:   sanitize(args[24], "string").(string),
ZoneName:   sanitize(args[25], "string").(string),
Fax:   sanitize(args[26], "string").(string),
  }

fmt.Println(postDataToBlockchainRegAuth)
	logger.Debug("postDataToBlockchainRegAuth function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - End>>

//<<Custom Function Section - End>>