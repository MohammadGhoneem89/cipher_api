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
type P2PChainCode struct {
}

var logger = shim.NewLogger("P2P")

//Standard Functions
func main() {
	fmt.Println("P2P ChainCode Started")
	err := shim.Start(new(P2PChainCode))
	if err != nil {
		fmt.Println("Error starting P2P chaincode: %s", err)
	}
}

//Init is called during chaincode instantiation to initialize any data.
func (t *P2PChainCode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("P2P ChainCode Initiated")

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
func (t *P2PChainCode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {

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
	if orgType == "undefined" {						
		switch functionName := function; functionName {
		//<<FunctionCases-Start>>
		
		case "addItemCatalogue":
			return t.addItemCatalogue(stub, args,"addItemCatalogue")
					
		//<<FunctionCases-Start>>
		
		case "addMasterContract":
			return t.addMasterContract(stub, args,"addMasterContract")
					
		//<<FunctionCases-Start>>
		
		case "createInvoice":
			return t.createInvoice(stub, args,"createInvoice")
					
		//<<FunctionCases-Start>>
		
		case "createOrder":
			return t.createOrder(stub, args,"createOrder")
					
		//<<FunctionCases-Start>>
		
		case "createSubOrder":
			return t.createSubOrder(stub, args,"createSubOrder")
					
		//<<FunctionCases-Start>>
		
		case "eventOnCreateOrder":
			return t.eventOnCreateOrder(stub, args,"eventOnCreateOrder")
					
		//<<FunctionCases-Start>>
		
		case "eventOnInvoiceCreation":
			return t.eventOnInvoiceCreation(stub, args,"eventOnInvoiceCreation")
					
		//<<FunctionCases-Start>>
		
		case "eventOnPaymentOrderCreation":
			return t.eventOnPaymentOrderCreation(stub, args,"eventOnPaymentOrderCreation")
					
		//<<FunctionCases-Start>>
		
		case "eventOnPaymentOrderCreationCustomer":
			return t.eventOnPaymentOrderCreationCustomer(stub, args,"eventOnPaymentOrderCreationCustomer")
					
		//<<FunctionCases-Start>>
		
		case "eventOnPurchaseOrder":
			return t.eventOnPurchaseOrder(stub, args,"eventOnPurchaseOrder")
					
		//<<FunctionCases-Start>>
		
		case "eventOnPurchaseOrderCustomer":
			return t.eventOnPurchaseOrderCustomer(stub, args,"eventOnPurchaseOrderCustomer")
					
		//<<FunctionCases-Start>>
		
		case "getItemCatalogue":
			return t.getItemCatalogue(stub, args,"getItemCatalogue")
					
		//<<FunctionCases-Start>>
		
		case "getItemCatalogueCustomer":
			return t.getItemCatalogueCustomer(stub, args,"getItemCatalogueCustomer")
					
		//<<FunctionCases-Start>>
		
		case "getMasterAgreementData":
			return t.getMasterAgreementData(stub, args,"getMasterAgreementData")
					
		//<<FunctionCases-Start>>
		
		case "getOrderDetail":
			return t.getOrderDetail(stub, args,"getOrderDetail")
					
		//<<FunctionCases-Start>>
		
		case "getOrderDetailCustomer":
			return t.getOrderDetailCustomer(stub, args,"getOrderDetailCustomer")
					
		//<<FunctionCases-Start>>
		
		case "getOrganizationList":
			return t.getOrganizationList(stub, args,"getOrganizationList")
					
		//<<FunctionCases-Start>>
		
		case "updateItemCatalogue":
			return t.updateItemCatalogue(stub, args,"updateItemCatalogue")
					
		//<<FunctionCases-Start>>
		
		case "updateOrderStatus":
			return t.updateOrderStatus(stub, args,"updateOrderStatus")
					
		//<<FunctionCases-Start>>
		
		case "updateOrderStatusCustomer":
			return t.updateOrderStatusCustomer(stub, args,"updateOrderStatusCustomer")
					
		//<<FunctionCases-Start>>
		
		case "updateSubOrderStatus":
			return t.updateSubOrderStatus(stub, args,"updateSubOrderStatus")
					
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
	Function Name:addItemCatalogue
	Description: 
*/
func (t *P2PChainCode) addItemCatalogue(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("addItemCatalogue: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
addItemCatalogue := &addItemCatalogue{	
		ItemCode:   sanitize(args[0], "string").(string),
Name:   sanitize(args[1], "string").(string),
Description:   sanitize(args[2], "string").(string),
Classification:   sanitize(args[3], "string").(string),
ItemStatus:   sanitize(args[4], "string").(string),
Image:   sanitize(args[5], "string").(string),
Material:   sanitize(args[6], "string").(string),
Price:   sanitize(args[7], "string").(string),
LeadTime:   sanitize(args[8], "string").(string),
PrintTime:   sanitize(args[9], "string").(string),
PartNumber:   sanitize(args[10], "string").(string),
ModelVolume:   sanitize(args[11], "string").(string),
SupportVolume:   sanitize(args[12], "string").(string),
ModelTip:   sanitize(args[13], "string").(string),
SupportTip:   sanitize(args[14], "string").(string),
Color:   sanitize(args[15], "string").(string),
CreatedBy:   sanitize(args[16], "string").(string),
  }

fmt.Println(addItemCatalogue)
	logger.Debug("addItemCatalogue function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:addMasterContract
	Description: 
*/
func (t *P2PChainCode) addMasterContract(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("addMasterContract: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
addMasterContract := &addMasterContract{	
		ContractID:   sanitize(args[0], "string").(string),
DateCreated:   sanitize(args[1], "string").(string),
StartDate:   sanitize(args[2], "string").(string),
EndDate:   sanitize(args[3], "string").(string),
ApprovedBy:   sanitize(args[4], "string").(string),
ApprovedOn:   sanitize(args[5], "string").(string),
CustomerID:   sanitize(args[6], "string").(string),
AmountRealized:   sanitize(args[7], "string").(string),
ShipmentType:   sanitize(args[8], "string").(string),
Status:   sanitize(args[9], "string").(string),
TotalPenalty:   sanitize(args[10], "string").(string),
TotalRebate:   sanitize(args[11], "string").(string),
  }

fmt.Println(addMasterContract)
	logger.Debug("addMasterContract function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:createInvoice
	Description: When an order is dispatched, Strata will call this API to mark an invoiced as issued on the smart contract to indicate that Strata has send out an Invoice against the order. If an order is completely rejected by the customer (i.e. Scrapped), smart contract will automatically mark the invoice as null and void and further action on the order will stopped at the smart contract end.
*/
func (t *P2PChainCode) createInvoice(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("createInvoice: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
createInvoice := &createInvoice{	
		OrderID:   sanitize(args[0], "string").(string),
InvoiceDate:   sanitize(args[1], "string").(string),
  }

fmt.Println(createInvoice)
	logger.Debug("createInvoice function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:createOrder
	Description: This API is called by Strata customers to initiate the order request on the Blockchain. The same API can be used by the customers to create one time order or order via master agreement as well.
API returns the order number (system generated) in the response. This order number should be passed in updateOrderStatus API which is used to update the tracking status of the order lifecycle.
*/
func (t *P2PChainCode) createOrder(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("createOrder: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
createOrder := &createOrder{	
		OrderType:   sanitize(args[0], "string").(string),
ContractID:   sanitize(args[1], "string").(string),
RaisedBy:   sanitize(args[2], "string").(string),
QuoteValidity:   sanitize(args[3], "string").(string),
IncoTerms:   sanitize(args[4], "string").(string),
  }

fmt.Println(createOrder)
	logger.Debug("createOrder function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:createSubOrder
	Description: This API is called by Strata to create sub order with their supplier and to tag it with the main order with the Customer on the Blockchain. Supplier products are not maintained on the Blockchain, item list of the sub order passed in the request by Strata will be stored as is on the Blockchain.
*/
func (t *P2PChainCode) createSubOrder(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("createSubOrder: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
createSubOrder := &createSubOrder{	
		OrderID:   sanitize(args[0], "string").(string),
SubOrderID:   sanitize(args[1], "string").(string),
SupplierID:   sanitize(args[2], "string").(string),
RaisedBy:   sanitize(args[3], "string").(string),
OrderDate:   sanitize(args[4], "string").(string),
OrderAmount:   sanitize(args[5], "int64").(int64),
  }

fmt.Println(createSubOrder)
	logger.Debug("createSubOrder function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:eventOnCreateOrder
	Description: This API is provided by the Strata. When an order is raised by the customer on the smart contract instructions are sent to STRATA SAP by calling this API.
*/
func (t *P2PChainCode) eventOnCreateOrder(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("eventOnCreateOrder: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
eventOnCreateOrder := &eventOnCreateOrder{	
		OrderID:   sanitize(args[0], "string").(string),
OldStatus:   sanitize(args[1], "string").(string),
NewStatus:   sanitize(args[2], "string").(string),
  }

fmt.Println(eventOnCreateOrder)
	logger.Debug("eventOnCreateOrder function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:eventOnInvoiceCreation
	Description: This API is provided by the customer. When an invoice is created on the smart contract the same is sent as event to the customer by calling this API as well based on the original terms of invoicing defined on the smart contract.
*/
func (t *P2PChainCode) eventOnInvoiceCreation(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("eventOnInvoiceCreation: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
eventOnInvoiceCreation := &eventOnInvoiceCreation{	
		OrderID:   sanitize(args[0], "string").(string),
ContractID:   sanitize(args[1], "string").(string),
CustomerID:   sanitize(args[2], "string").(string),
Status:   sanitize(args[3], "string").(string),
OrderAmount:   sanitize(args[4], "string").(string),
TotalQuantity:   sanitize(args[5], "string").(string),
TotalLeadTime:   sanitize(args[6], "string").(string),
TotalPrintTime:   sanitize(args[7], "string").(string),
Discount:   sanitize(args[8], "string").(string),
Penalty:   sanitize(args[9], "string").(string),
  }

fmt.Println(eventOnInvoiceCreation)
	logger.Debug("eventOnInvoiceCreation function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:eventOnPaymentOrderCreation
	Description: This API is provided by the customer. When an payment order is created on the smart contract the same is sent as an event to the customer by calling this API as well based on the original termsdefined on the smart contract.
*/
func (t *P2PChainCode) eventOnPaymentOrderCreation(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("eventOnPaymentOrderCreation: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
eventOnPaymentOrderCreation := &eventOnPaymentOrderCreation{	
		OrderID:   sanitize(args[0], "string").(string),
OldStatus:   sanitize(args[1], "string").(string),
NewStatus:   sanitize(args[2], "string").(string),
  }

fmt.Println(eventOnPaymentOrderCreation)
	logger.Debug("eventOnPaymentOrderCreation function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:eventOnPaymentOrderCreationCustomer
	Description: This API is provided by the customer. When an payment order is created on the smart contract the same is sent as event to the customer by calling this API to notify the same.
*/
func (t *P2PChainCode) eventOnPaymentOrderCreationCustomer(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("eventOnPaymentOrderCreationCustomer: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
eventOnPaymentOrderCreationCustomer := &eventOnPaymentOrderCreationCustomer{	
		OrderID:   sanitize(args[0], "string").(string),
OldStatus:   sanitize(args[1], "string").(string),
NewStatus:   sanitize(args[2], "string").(string),
  }

fmt.Println(eventOnPaymentOrderCreationCustomer)
	logger.Debug("eventOnPaymentOrderCreationCustomer function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:eventOnPurchaseOrder
	Description: This API is provided by the customer. When an payment order is created on the smart contract the same is sent as event to the customer by calling this API to notify the same.
*/
func (t *P2PChainCode) eventOnPurchaseOrder(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("eventOnPurchaseOrder: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
eventOnPurchaseOrder := &eventOnPurchaseOrder{	
		OrderID:   sanitize(args[0], "string").(string),
OldStatus:   sanitize(args[1], "string").(string),
NewStatus:   sanitize(args[2], "string").(string),
  }

fmt.Println(eventOnPurchaseOrder)
	logger.Debug("eventOnPurchaseOrder function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:eventOnPurchaseOrderCustomer
	Description: This API is provided by the Strata. When an purchase order is generated by the customer or auto creation of the PO by the smart contract, instructions are sent to STRATA SAP by calling this API for creating PO in the ERP.
*/
func (t *P2PChainCode) eventOnPurchaseOrderCustomer(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("eventOnPurchaseOrderCustomer: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
eventOnPurchaseOrderCustomer := &eventOnPurchaseOrderCustomer{	
		OrderID:   sanitize(args[0], "string").(string),
OldStatus:   sanitize(args[1], "string").(string),
NewStatus:   sanitize(args[2], "string").(string),
  }

fmt.Println(eventOnPurchaseOrderCustomer)
	logger.Debug("eventOnPurchaseOrderCustomer function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:getItemCatalogue
	Description: This API is called by the customer to fetch the list of the products available on the Blockchain which would be required for the customer to create an order on the Blockchain from the their legacy system. Product catalogue can be fetched based on the search filter including item code, description and material
*/
func (t *P2PChainCode) getItemCatalogue(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("getItemCatalogue: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
getItemCatalogue := &getItemCatalogue{	
		BLANK:   sanitize(args[0], "string").(string),  }

fmt.Println(getItemCatalogue)
	logger.Debug("getItemCatalogue function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:getItemCatalogueCustomer
	Description: This API is called by the customer to fetch the list of the products available on the Blockchain which would be required for the customer to create an order on the Blockchain from the their legacy system. Product catalogue can be fetched based on the search filter including item code, description and material
*/
func (t *P2PChainCode) getItemCatalogueCustomer(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("getItemCatalogueCustomer: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
getItemCatalogueCustomer := &getItemCatalogueCustomer{	
		BLANK:   sanitize(args[0], "string").(string),  }

fmt.Println(getItemCatalogueCustomer)
	logger.Debug("getItemCatalogueCustomer function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:getMasterAgreementData
	Description: This API is called by the Customer to fetch the detail of the master agrement available on the Blockchain.
*/
func (t *P2PChainCode) getMasterAgreementData(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("getMasterAgreementData: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
getMasterAgreementData := &getMasterAgreementData{	
		ContractID:   sanitize(args[0], "string").(string),
  }

fmt.Println(getMasterAgreementData)
	logger.Debug("getMasterAgreementData function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:getOrderDetail
	Description: This API is called by the Strata to fetch the detail of the specific order available on the Blockchain.
*/
func (t *P2PChainCode) getOrderDetail(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("getOrderDetail: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
getOrderDetail := &getOrderDetail{	
		OrderID:   sanitize(args[0], "string").(string),
  }

fmt.Println(getOrderDetail)
	logger.Debug("getOrderDetail function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:getOrderDetailCustomer
	Description: This API is called by the Customer to fetch the detail of the specific order available on the Blockchain.
*/
func (t *P2PChainCode) getOrderDetailCustomer(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("getOrderDetailCustomer: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
getOrderDetailCustomer := &getOrderDetailCustomer{	
		OrderID:   sanitize(args[0], "string").(string),
  }

fmt.Println(getOrderDetailCustomer)
	logger.Debug("getOrderDetailCustomer function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:getOrganizationList
	Description: This API is called by the Strata to fetch the list of available customer and supplier setup on Cipher. Organization list can be fetched based on the search filter including name and orgCode.
*/
func (t *P2PChainCode) getOrganizationList(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("getOrganizationList: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
getOrganizationList := &getOrganizationList{	
		BLANK:   sanitize(args[0], "string").(string),  }

fmt.Println(getOrganizationList)
	logger.Debug("getOrganizationList function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:updateItemCatalogue
	Description: 
*/
func (t *P2PChainCode) updateItemCatalogue(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("updateItemCatalogue: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
updateItemCatalogue := &updateItemCatalogue{	
		ItemCode:   sanitize(args[0], "string").(string),
Name:   sanitize(args[1], "string").(string),
Description:   sanitize(args[2], "string").(string),
Classification:   sanitize(args[3], "string").(string),
ItemStatus:   sanitize(args[4], "string").(string),
Image:   sanitize(args[5], "string").(string),
Material:   sanitize(args[6], "string").(string),
Price:   sanitize(args[7], "string").(string),
LeadTime:   sanitize(args[8], "string").(string),
PrintTime:   sanitize(args[9], "string").(string),
PartNumber:   sanitize(args[10], "string").(string),
ModelVolume:   sanitize(args[11], "string").(string),
SupportVolume:   sanitize(args[12], "string").(string),
ModelTip:   sanitize(args[13], "string").(string),
SupportTip:   sanitize(args[14], "string").(string),
Color:   sanitize(args[15], "string").(string),
UpdatedBy:   sanitize(args[16], "string").(string),
  }

fmt.Println(updateItemCatalogue)
	logger.Debug("updateItemCatalogue function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:updateOrderStatus
	Description: API is consumed by the Strata to update the different states of the order lifecyle. Please refer business section for the detail about the possible states of the lifecycle for Strata.
In the pilot implementation, Strata will also have the ability to mark the receiving of the product on customer behalf.
*/
func (t *P2PChainCode) updateOrderStatus(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("updateOrderStatus: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
updateOrderStatus := &updateOrderStatus{	
		OrderID:   sanitize(args[0], "string").(string),
Status:   sanitize(args[1], "string").(string),
  }

fmt.Println(updateOrderStatus)
	logger.Debug("updateOrderStatus function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:updateOrderStatusCustomer
	Description: API is consumed by the customers to update the different states of the order lifecyle. Please refer business section for the detail about the possible states of the lifecycle.
*/
func (t *P2PChainCode) updateOrderStatusCustomer(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("updateOrderStatusCustomer: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
updateOrderStatusCustomer := &updateOrderStatusCustomer{	
		OrderID:   sanitize(args[0], "string").(string),
Status:   sanitize(args[1], "string").(string),
  }

fmt.Println(updateOrderStatusCustomer)
	logger.Debug("updateOrderStatusCustomer function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - Start>>
/*
	Function Name:updateSubOrderStatus
	Description: API is consumed by the Strata to update the different states of the sub order lifecyle. Alternatively, Strata can also provision an access of this API to their supplier to mark the status of their own sub order.
*/
func (t *P2PChainCode) updateSubOrderStatus(stub shim.ChaincodeStubInterface, args []string, functionName string) pb.Response {
	logger.Debug("updateSubOrderStatus: %v", args)
    
	if len(args[0]) <= 0 {
		return shim.Error("Invalid Argument")
	}
	
	//Business Logic to be added here
		
updateSubOrderStatus := &updateSubOrderStatus{	
		SubOrderID:   sanitize(args[0], "string").(string),
OrderID:   sanitize(args[1], "string").(string),
Status:   sanitize(args[2], "string").(string),
  }

fmt.Println(updateSubOrderStatus)
	logger.Debug("updateSubOrderStatus function executed successfully.")
	
	return shim.Success(nil)
}


//<<FunctionDefinition - End>>

//<<Custom Function Section - End>>