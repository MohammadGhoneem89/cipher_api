//---------------------Including external libraries--------------*****//

package main
import (
	"encoding/json"

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
	logger.Debug("PR ChainCode Started")
	err := shim.Start(new(PRChainCode))
	if err != nil {
		logger.Debug("Error starting PR chaincode: %s", err)
	}
}

//Init is called during chaincode instantiation to initialize any data.
func (t *PRChainCode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	logger.Debug("PR ChainCode Initiated")
	return shim.Success(nil)
}

//Invoke is called per transaction on the chaincode
func (t *PRChainCode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {

	//getting MSP
	certOrgType, err := cid.GetMSPID(stub)
	if err != nil {
		return shim.Error("Enrolment mspid Type invalid!!! " + err.Error())
	}

	logger.Debug("MSP:" + certOrgType)

	var org  = certOrgType;
	function, args := stub.GetFunctionAndParameters()
	logger.Debug("Invoke is running for function: " + function)

	//<<Function Validation Logic-Start>>
	if org == "SDG" {						
		switch functionName := function; functionName {
		//<<FunctionCases-Start>>
		
		case "AddTenant":
			return t.AddTenant(stub, args,"AddTenant")
					
		//<<FunctionCases-End>>
		
		default:
			logger.Warning("Invoke did not find function: " + function)
			return shim.Error("Received unknown function invocation: " + function)
		}
	} else 
//<<Function Validation Logic-Start>>
	if org == "ENBD" {						
		switch functionName := function; functionName {
		//<<FunctionCases-Start>>
		
		case "AssociatePaymentInstruments":
			return t.AssociatePaymentInstruments(stub, args,"AssociatePaymentInstruments")
					
		//<<FunctionCases-Start>>
		
		case "AssociatePaymentInstrumentsTemp":
			return t.AssociatePaymentInstrumentsTemp(stub, args,"AssociatePaymentInstrumentsTemp")
					
		//<<FunctionCases-End>>
		
		default:
			logger.Warning("Invoke did not find function: " + function)
			return shim.Error("Received unknown function invocation: " + function)
		}
	} else 
//<<Function Validation Logic-Start>>
	if org == "WASL" {						
		switch functionName := function; functionName {
		//<<FunctionCases-Start>>
		
		case "BLANK":
			return t.BLANK(stub, args,"BLANK")
					
		//<<FunctionCases-End>>
		
		default:
			logger.Warning("Invoke did not find function: " + function)
			return shim.Error("Received unknown function invocation: " + function)
		}
	} else 
//<<Function Validation Logic-Start>>
	if org == "DLD" {						
		switch functionName := function; functionName {
		//<<FunctionCases-Start>>
		
		case "EjariTerminationStatus":
			return t.EjariTerminationStatus(stub, args,"EjariTerminationStatus")
					
		//<<FunctionCases-End>>
		
		default:
			logger.Warning("Invoke did not find function: " + function)
			return shim.Error("Received unknown function invocation: " + function)
		}
	} else //<<Function Validation Logic - End>>
	{
		return shim.Error("Invalid MSP: " + org)
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
		OrgCode:   sanitize(args[0], "string").(string)
OrgID:   sanitize(args[1], "string").(string)
EmiratesID:   sanitize(args[2], "string").(string)
CustomerName:   sanitize(args[3], "string").(string)
MobileNumber:   sanitize(args[4], "string").(string)
EmailID:   sanitize(args[5], "string").(string)
VisaNo:   sanitize(args[6], "string").(string)
VisaExpiryDate:   sanitize(args[7], "string").(string)
EmiratesIDExpiryDate:   sanitize(args[8], "string").(string)
AuthToken:   sanitize(args[9], "string").(string)
Timestamp:   sanitize(args[10], "string").(string)
  }

	logger.Debug("AddTenant function executed successfully.")
	
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
		AuthToken:   sanitize(args[0], "string").(string)
EIDA:   sanitize(args[1], "string").(string)
ContractID:   sanitize(args[2], "string").(string)
PaymentInstruments:   sanitize(args[3], "array").(array)
OrgCode:   sanitize(args[4], "string").(string)
  }

	logger.Debug("AssociatePaymentInstruments function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:AssociatePaymentInstrumentsTemp
	Description: The API consumed by the Bank to stamp the payment instruments association on the blockchain. This could have variations to store first time payments as well as later payments done based on payment terms.
*/
func (t *PRChainCode) AssociatePaymentInstrumentsTemp(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("AssociatePaymentInstrumentsTemp: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
AssociatePaymentInstrumentsTemp := &AssociatePaymentInstrumentsTemp{	
		AuthToken:   sanitize(args[0], "string").(string)
EIDA:   sanitize(args[1], "string").(string)
ContractID:   sanitize(args[2], "string").(string)
PaymentInstruments:   sanitize(args[3], "array").(array)
OrgCode:   sanitize(args[4], "string").(string)
  }

	logger.Debug("AssociatePaymentInstrumentsTemp function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:BLANK
	Description: The Rest API can be used to add a renewal of the tenancy contract on the Blockchain along with installments, payment method and selected bank.
*/
func (t *PRChainCode) BLANK(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("BLANK: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
BLANK := &BLANK{	
		undefined:   sanitize(args[0], "object").(object)
  }

	logger.Debug("BLANK function executed successfully.")
	
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
		OrgCode:   sanitize(args[0], "string").(string)
ContractID:   sanitize(args[1], "string").(string)
EjariTerminationStatus:   sanitize(args[2], "string").(string)
  }

	logger.Debug("EjariTerminationStatus function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - End>>

//<<Custom Function Section - End>>