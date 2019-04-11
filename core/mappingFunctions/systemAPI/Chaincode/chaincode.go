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
	if orgType == "ORG" {						
		switch functionName := function; functionName {
		//<<FunctionCases-Start>>
		
		case "amendCOO":
			return t.amendCOO(stub, args,"amendCOO")
					
		//<<FunctionCases-Start>>
		
		case "amendExportDelcaration":
			return t.amendExportDelcaration(stub, args,"amendExportDelcaration")
					
		//<<FunctionCases-Start>>
		
		case "authToExport":
			return t.authToExport(stub, args,"authToExport")
					
		//<<FunctionCases-Start>>
		
		case "containerLoaded":
			return t.containerLoaded(stub, args,"containerLoaded")
					
		//<<FunctionCases-Start>>
		
		case "createCOO":
			return t.createCOO(stub, args,"createCOO")
					
		//<<FunctionCases-Start>>
		
		case "createCOOForDeclaration":
			return t.createCOOForDeclaration(stub, args,"createCOOForDeclaration")
					
		//<<FunctionCases-Start>>
		
		case "createExportDeclaration":
			return t.createExportDeclaration(stub, args,"createExportDeclaration")
					
		//<<FunctionCases-Start>>
		
		case "getCOOData":
			return t.getCOOData(stub, args,"getCOOData")
					
		//<<FunctionCases-Start>>
		
		case "getContainerData":
			return t.getContainerData(stub, args,"getContainerData")
					
		//<<FunctionCases-Start>>
		
		case "getDeclarationData":
			return t.getDeclarationData(stub, args,"getDeclarationData")
					
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
	Function Name:amendCOO
	Description: This API is consumed by Dubai Chamber to stamp any amendments in COO related information on the Blockchain. In case of changes in the COO the export Declaration event is fired on Customs from blockchain. All attributes other then COO are non mandatory and which attributes changes the appropraite data should only be pushed to the blockchain
*/
func (t *EAChainCode) amendCOO(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("amendCOO: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
amendCOO := &amendCOO{	
		COONo:   sanitize(args[0], "string").(string),
ModeOfTransport:   sanitize(args[1], "string").(string),
ExitPoint:   sanitize(args[2], "string").(string),
FinalShipmentDestination:   sanitize(args[3], "string").(string),
PortOfDischarge:   sanitize(args[4], "string").(string),
VesselName:   sanitize(args[5], "string").(string),
ProcessType:   sanitize(args[6], "string").(string),
ProcessingCountry:   sanitize(args[7], "string").(string),
ExportDeclaration:   sanitize(args[8], "string").(string),
PaymentMethod:   sanitize(args[9], "string").(string),
ExporterType:   sanitize(args[10], "string").(string),
MemeberNo:   sanitize(args[11], "string").(string),
  }

fmt.Println(amendCOO)
	logger.Debug("amendCOO function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:amendExportDelcaration
	Description: This API is consumed by Dubai Customs to stamp amend Export Declaration related information on the Blockchain. The API expects all attributes to be non-mandatory and whichever tag values are provided they will be updated. In case if the Export declaration is tied with COO then an event is raised by blockchain to chamber for amending the COO.
*/
func (t *EAChainCode) amendExportDelcaration(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("amendExportDelcaration: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
amendExportDelcaration := &amendExportDelcaration{	
		COONo:   sanitize(args[0], "string").(string),
ModeOfTransport:   sanitize(args[1], "string").(string),
ExitPoint:   sanitize(args[2], "string").(string),
FinalShipmentDestination:   sanitize(args[3], "string").(string),
PortOfDischarge:   sanitize(args[4], "string").(string),
VesselName:   sanitize(args[5], "string").(string),
ProcessType:   sanitize(args[6], "string").(string),
ProcessingCountry:   sanitize(args[7], "string").(string),
ExportDeclaration:   sanitize(args[8], "string").(string),
PaymentMethod:   sanitize(args[9], "string").(string),
ExporterType:   sanitize(args[10], "string").(string),
MemeberNo:   sanitize(args[11], "string").(string),
  }

fmt.Println(amendExportDelcaration)
	logger.Debug("amendExportDelcaration function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:authToExport
	Description: This API is consumed by DP World to stamp container when status is “authToExport” updated on the vessel related information on the Blockchain.
*/
func (t *EAChainCode) authToExport(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("authToExport: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
authToExport := &authToExport{	
		COONo:   sanitize(args[0], "string").(string),
ModeOfTransport:   sanitize(args[1], "string").(string),
ExitPoint:   sanitize(args[2], "string").(string),
FinalShipmentDestination:   sanitize(args[3], "string").(string),
PortOfDischarge:   sanitize(args[4], "string").(string),
VesselName:   sanitize(args[5], "string").(string),
ProcessType:   sanitize(args[6], "string").(string),
ProcessingCountry:   sanitize(args[7], "string").(string),
ExportDeclaration:   sanitize(args[8], "string").(string),
PaymentMethod:   sanitize(args[9], "string").(string),
ExporterType:   sanitize(args[10], "string").(string),
MemeberNo:   sanitize(args[11], "string").(string),
  }

fmt.Println(authToExport)
	logger.Debug("authToExport function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:containerLoaded
	Description: This API is consumed by DP World to stamp when container status is updated on the vessel related information on the Blockchain.
*/
func (t *EAChainCode) containerLoaded(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("containerLoaded: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
containerLoaded := &containerLoaded{	
		COONo:   sanitize(args[0], "string").(string),
ModeOfTransport:   sanitize(args[1], "string").(string),
ExitPoint:   sanitize(args[2], "string").(string),
FinalShipmentDestination:   sanitize(args[3], "string").(string),
PortOfDischarge:   sanitize(args[4], "string").(string),
VesselName:   sanitize(args[5], "string").(string),
ProcessType:   sanitize(args[6], "string").(string),
ProcessingCountry:   sanitize(args[7], "string").(string),
ExportDeclaration:   sanitize(args[8], "string").(string),
PaymentMethod:   sanitize(args[9], "string").(string),
ExporterType:   sanitize(args[10], "string").(string),
MemeberNo:   sanitize(args[11], "string").(string),
  }

fmt.Println(containerLoaded)
	logger.Debug("containerLoaded function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:createCOO
	Description: This API is consumed by Dubai Chamber to stamp the COO registration related information on the Blockchain and this will be the complete information stamped based on the case Normal COO with no co-relation with Export Declaration.
*/
func (t *EAChainCode) createCOO(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("createCOO: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
createCOO := &createCOO{	
		COONo:   sanitize(args[0], "string").(string),
ModeOfTransport:   sanitize(args[1], "string").(string),
ExitPoint:   sanitize(args[2], "string").(string),
FinalShipmentDestination:   sanitize(args[3], "string").(string),
PortOfDischarge:   sanitize(args[4], "string").(string),
VesselName:   sanitize(args[5], "string").(string),
ProcessType:   sanitize(args[6], "string").(string),
ProcessingCountry:   sanitize(args[7], "string").(string),
ExportDeclaration:   sanitize(args[8], "string").(string),
PaymentMethod:   sanitize(args[9], "string").(string),
ExporterType:   sanitize(args[10], "string").(string),
MemeberNo:   sanitize(args[11], "string").(string),
  }

fmt.Println(createCOO)
	logger.Debug("createCOO function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:createCOOForDeclaration
	Description: This API is consumed by Dubai Chamber to stamp the COO for declaration related information on the Blockchain. This is used in co-relation with export declaration so those fields available already in the declaration are fetched directly by smart contract and no need to pass as input.
*/
func (t *EAChainCode) createCOOForDeclaration(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("createCOOForDeclaration: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
createCOOForDeclaration := &createCOOForDeclaration{	
		COONo:   sanitize(args[0], "string").(string),
ModeOfTransport:   sanitize(args[1], "string").(string),
ExitPoint:   sanitize(args[2], "string").(string),
FinalShipmentDestination:   sanitize(args[3], "string").(string),
PortOfDischarge:   sanitize(args[4], "string").(string),
VesselName:   sanitize(args[5], "string").(string),
ProcessType:   sanitize(args[6], "string").(string),
ProcessingCountry:   sanitize(args[7], "string").(string),
ExportDeclaration:   sanitize(args[8], "string").(string),
PaymentMethod:   sanitize(args[9], "string").(string),
ExporterType:   sanitize(args[10], "string").(string),
MemeberNo:   sanitize(args[11], "string").(string),
  }

fmt.Println(createCOOForDeclaration)
	logger.Debug("createCOOForDeclaration function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:createExportDeclaration
	Description: This API is consumed by Dubai Customs to stamp Export Declaration related information on the Blockchain.
*/
func (t *EAChainCode) createExportDeclaration(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("createExportDeclaration: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
createExportDeclaration := &createExportDeclaration{	
		COONo:   sanitize(args[0], "string").(string),
ModeOfTransport:   sanitize(args[1], "string").(string),
ExitPoint:   sanitize(args[2], "string").(string),
FinalShipmentDestination:   sanitize(args[3], "string").(string),
PortOfDischarge:   sanitize(args[4], "string").(string),
VesselName:   sanitize(args[5], "string").(string),
ProcessType:   sanitize(args[6], "string").(string),
ProcessingCountry:   sanitize(args[7], "string").(string),
ExportDeclaration:   sanitize(args[8], "string").(string),
PaymentMethod:   sanitize(args[9], "string").(string),
ExporterType:   sanitize(args[10], "string").(string),
MemeberNo:   sanitize(args[11], "string").(string),
  }

fmt.Println(createExportDeclaration)
	logger.Debug("createExportDeclaration function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:getCOOData
	Description: This API can be consumed by any party to get information latest container information from the Blockchain.
*/
func (t *EAChainCode) getCOOData(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("getCOOData: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
getCOOData := &getCOOData{	
		COONo:   sanitize(args[0], "string").(string),
ModeOfTransport:   sanitize(args[1], "string").(string),
ExitPoint:   sanitize(args[2], "string").(string),
FinalShipmentDestination:   sanitize(args[3], "string").(string),
PortOfDischarge:   sanitize(args[4], "string").(string),
VesselName:   sanitize(args[5], "string").(string),
ProcessType:   sanitize(args[6], "string").(string),
ProcessingCountry:   sanitize(args[7], "string").(string),
ExportDeclaration:   sanitize(args[8], "string").(string),
PaymentMethod:   sanitize(args[9], "string").(string),
ExporterType:   sanitize(args[10], "string").(string),
MemeberNo:   sanitize(args[11], "string").(string),
  }

fmt.Println(getCOOData)
	logger.Debug("getCOOData function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:getContainerData
	Description: This API can be consumed by any party to get information latest container information from the Blockchain.
*/
func (t *EAChainCode) getContainerData(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("getContainerData: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
getContainerData := &getContainerData{	
		COONo:   sanitize(args[0], "string").(string),
ModeOfTransport:   sanitize(args[1], "string").(string),
ExitPoint:   sanitize(args[2], "string").(string),
FinalShipmentDestination:   sanitize(args[3], "string").(string),
PortOfDischarge:   sanitize(args[4], "string").(string),
VesselName:   sanitize(args[5], "string").(string),
ProcessType:   sanitize(args[6], "string").(string),
ProcessingCountry:   sanitize(args[7], "string").(string),
ExportDeclaration:   sanitize(args[8], "string").(string),
PaymentMethod:   sanitize(args[9], "string").(string),
ExporterType:   sanitize(args[10], "string").(string),
MemeberNo:   sanitize(args[11], "string").(string),
  }

fmt.Println(getContainerData)
	logger.Debug("getContainerData function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:getDeclarationData
	Description: This API can be consumed by any party to get information latest container information from the Blockchain.
*/
func (t *EAChainCode) getDeclarationData(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("getDeclarationData: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
getDeclarationData := &getDeclarationData{	
		COONo:   sanitize(args[0], "string").(string),
ModeOfTransport:   sanitize(args[1], "string").(string),
ExitPoint:   sanitize(args[2], "string").(string),
FinalShipmentDestination:   sanitize(args[3], "string").(string),
PortOfDischarge:   sanitize(args[4], "string").(string),
VesselName:   sanitize(args[5], "string").(string),
ProcessType:   sanitize(args[6], "string").(string),
ProcessingCountry:   sanitize(args[7], "string").(string),
ExportDeclaration:   sanitize(args[8], "string").(string),
PaymentMethod:   sanitize(args[9], "string").(string),
ExporterType:   sanitize(args[10], "string").(string),
MemeberNo:   sanitize(args[11], "string").(string),
  }

fmt.Println(getDeclarationData)
	logger.Debug("getDeclarationData function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - End>>

//<<Custom Function Section - End>>