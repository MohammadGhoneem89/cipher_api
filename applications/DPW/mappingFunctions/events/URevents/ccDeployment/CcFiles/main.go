package main

import (
	"encoding/json"
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

		default:
			logger.Warning("Invoke did not find function: " + function)
			return shim.Error("Received unknown function invocation: " + function)
		}
	} else if orgType == "CUSTOMS" {
		connection := hypConnect{}
		connection.Connection = stub
		switch functionName := function; functionName {

		case "postDataToBlockchainCustoms":
			return t.postDataToBlockchainCUSTOMS(connection, args, "postDataToBlockchainCustoms", orgType)

		case "associateAlias":
			return t.associateAlias(connection, args, "associateAlias", orgType)

		case "getDataByUnifiedID":
			return t.getDataByUnifiedID(connection, args, "getDataByUnifiedID")

		case "getDataByAlias":
			return t.getDataByAlias(connection, args, "getDataByAlias", orgType)

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
	//<<JAFZA param unmarshaling placeholder>>

	// #################################################################

	//the new added attributes of RegAuth
	//<<RegAuth field to empty placeholder>>

	//the new added attributes of DP-World
	//<<DPW field to empty placeholder>>

	//the new added attributes of DubaiChamber
	//<<Chamber field to empty placeholder>>

	//the new added attributes of DubaiTrade
	//<<DubaiTrade field to empty placeholder>>

	//the new added attributes of DubaiCustoms
	//<<DubaiCustoms field to empty placeholder>>

	unifiedRegParams := &UnifiedReg{
		DocumentName: "UnifiedReg",
		Key:          sanitize(args[0], "string").(string),
		UnifiedID:    sanitize(args[0], "string").(string),
		Alias:        nil,
		AliasList:    nil,
		FormationNo:  sanitize(args[1], "string").(string),

		//the new added attributes of RegAuth
		Issuedate: sanitize(args[2], "string").(string),
//<<RegAuth Struct field placeholder>>

		//the new added attributes of DP-World
		//<<DPW Struct field placeholder>>

		//the new added attributes of DubaiChamber
		//<<Chamber Struct field placeholder>>

		//the new added attributes of DubaiTrade
		//<<DubaiTrade Struct field placeholder>>

		//the new added attributes of DubaiCustoms
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
			Issuedate: unifiedRegParams.Issuedate,
//<<RegAuth Struct newField placeholder>>

			//the new added attributes of DP-World
			//<<DPW Struct newField placeholder>>

			//the new added attributes of DubaiChamber
			//<<Chamber Struct newField placeholder>>

			//the new added attributes of DubaiTrade
			//<<DubaiTrade Struct newField placeholder>>

			//the new added attributes of DubaiCustoms
			//<<DubaiCustoms Struct newField placeholder>>
		}

		fmt.Println("===============> ", unifiedReg)

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
		unifiedRegGroupingAsBytes, err := fetchData(stub, "F_"+unifiedRegParams.FormationNo, "unifiedRegGrouping_"+s[0])
		if err != nil {
			fmt.Printf("%s\n", err)
			return shim.Error("Somthing went wrong while fetching Master Attribute data" + err.Error())
		}

		//if document does not exist
		if unifiedRegGroupingAsBytes == nil {
			var unifiedIDsArrary []string
			unifiedIDsArrary = append(unifiedIDsArrary, unifiedID)
			unifiedRegGrouping := &UnifiedRegGrouping{
				DocumentName: "unifiedRegGrouping",
				Key:          "F_" + unifiedRegParams.FormationNo,
				UnifiedIDs:   unifiedIDsArrary,
			}
			//insert document to collection
			//marshal document
			unifiedRegGroupingAsBytes, err := json.Marshal(unifiedRegGrouping)
			if err != nil {
				return shim.Error(err.Error())
			}
			// insert document
			err = insertData(&stub, unifiedRegGrouping.Key, "unifiedRegGrouping_"+s[0], []byte(unifiedRegGroupingAsBytes))
			if err != nil {
				return shim.Error(err.Error())
			}

		} else { // document exist
			//UnMarshal unifiedRegGroupingAsBytes
			var unifiedRegGroupingAsJSON UnifiedRegGrouping
			err = json.Unmarshal([]byte(unifiedRegGroupingAsBytes), &unifiedRegGroupingAsJSON)
			if err != nil {
				fmt.Printf("%s\n", err)
				return shim.Error(err.Error())
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
				updated_UnifiedRegGroupingAsBytes, err := json.Marshal(unifiedRegGroupingAsJSON)
				if err != nil {
					return shim.Error(err.Error())
				}
				// insert document
				err = insertData(&stub, unifiedRegGroupingAsJSON.Key, "unifiedRegGrouping_"+s[0], []byte(updated_UnifiedRegGroupingAsBytes))
				if err != nil {
					return shim.Error(err.Error())
				}
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
		unifiedRegGroupingAsBytes, err := fetchData(stub, "F_"+unifiedRegParams.FormationNo, "unifiedRegGrouping_"+s[0])
		if err != nil {
			fmt.Printf("%s\n", err)
			return shim.Error("Somthing went wrong while fetching Master Attribute data" + err.Error())
		}

		//if document does not exist
		if unifiedRegGroupingAsBytes == nil {
			var unifiedIDsArrary []string
			unifiedIDsArrary = append(unifiedIDsArrary, unifiedID)
			unifiedRegGrouping := &UnifiedRegGrouping{
				DocumentName: "unifiedRegGrouping",
				Key:          "F_" + unifiedRegParams.FormationNo,
				UnifiedIDs:   unifiedIDsArrary,
			}
			//insert document to collection
			//marshal document
			unifiedRegGroupingAsBytes, err := json.Marshal(unifiedRegGrouping)
			if err != nil {
				return shim.Error(err.Error())
			}
			// insert document
			err = insertData(&stub, unifiedRegGrouping.Key, "unifiedRegGrouping_"+s[0], []byte(unifiedRegGroupingAsBytes))
			if err != nil {
				return shim.Error(err.Error())
			}

		} else { // document exist
			//UnMarshal unifiedRegGroupingAsBytes
			var unifiedRegGroupingAsJSON UnifiedRegGrouping
			err = json.Unmarshal([]byte(unifiedRegGroupingAsBytes), &unifiedRegGroupingAsJSON)
			if err != nil {
				fmt.Printf("%s\n", err)
				return shim.Error(err.Error())
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
				updated_UnifiedRegGroupingAsBytes, err := json.Marshal(unifiedRegGroupingAsJSON)
				if err != nil {
					return shim.Error(err.Error())
				}
				// insert document
				err = insertData(&stub, unifiedRegGroupingAsJSON.Key, "unifiedRegGrouping_"+s[0], []byte(updated_UnifiedRegGroupingAsBytes))
				if err != nil {
					return shim.Error(err.Error())
				}
			}
		}
		//=================================================================================================================

		additionalData := &AdditionalData{
			CheckHistory: checkHistory,
		}
		fmt.Println("postDataToBlockchainRegAuth function Updated successfully.")
		//raise Event for existing document ==> (with history flag)
		RaiseEventData(stub, "EventOnDataChangeForREGAUTH", additionalData)
		//RaiseEventData(stub, "EventOnDataChangeForREGAUTH", checkHistory)

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
	var compositeKeyArray []string
	i := 0
	for i < len(alias) {
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
			UnifiedID:    postDataToBlockchainCHAMBEROFCOMM.UnifiedID,
		}

		aliasStructureAsBytes, err := json.Marshal(aliasStructure)
		if err != nil {
			return shim.Error(err.Error())
		}
		err = insertData(&stub, aliasStructure.Key, "alias_"+s[0], []byte(aliasStructureAsBytes))
		if err != nil {
			return shim.Error(err.Error())
		}
		i += 1
	}

	//Update registrationData.alias and check for duplicates
	j := 0
	for j < len(compositeKeyArray) {
		exist := false
		k := 0
		for k < len(unifiedRegDataAsJSON.Alias) {
			if compositeKeyArray[j] == unifiedRegDataAsJSON.AliasList[k] {
				exist = true
			}
			k += 1
		}
		if !exist {
			unifiedRegDataAsJSON.AliasList = append(unifiedRegDataAsJSON.AliasList, compositeKeyArray[j])
		}
		j += 1
	}
	fmt.Println("================after Inserting Alias================")
	fmt.Println(unifiedRegDataAsJSON.Alias)
	fmt.Println(compositeKeyArray)
	// Append remaining information here

	// new parameters are:
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
	RaiseEventData(stub, "EventOnDataChangeForCHAMBEROFCOMM", true)
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
	//<<DPW param unmarshaling placeholder>>

	postDataToBlockchainPORT := &postDataToBlockchainPORT{
		UnifiedID: sanitize(args[0], "string").(string),
		Alias:     alias,
		// thenew parameters are :
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

	var compositeKeyArray []string
	i := 0
	for i < len(alias) {
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
			UnifiedID:    postDataToBlockchainPORT.UnifiedID,
		}

		aliasStructureAsBytes, err := json.Marshal(aliasStructure)
		if err != nil {
			return shim.Error(err.Error())
		}
		err = insertData(&stub, aliasStructure.Key, "alias_"+s[0], []byte(aliasStructureAsBytes))
		if err != nil {
			return shim.Error(err.Error())
		}
		i += 1
	}
	fmt.Println("=====Before alias update in UnifiedReg collection =====", unifiedRegDataAsJSON.Alias)

	//Update registrationData.alias and check for duplicates
	j := 0
	for j < len(compositeKeyArray) {
		exist := false
		k := 0
		for k < len(unifiedRegDataAsJSON.Alias) {
			if compositeKeyArray[j] == unifiedRegDataAsJSON.AliasList[k] {
				exist = true
			}
			k += 1
		}
		if !exist {
			unifiedRegDataAsJSON.AliasList = append(unifiedRegDataAsJSON.AliasList, compositeKeyArray[j])
		}
		j += 1
	}
	fmt.Println("================after Inserting Alias================")
	fmt.Println(unifiedRegDataAsJSON.Alias)
	fmt.Println(compositeKeyArray)
	// Append remaining information here
	// new parameters are:
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
	RaiseEventData(stub, "EventOnDataChangeForPORT", true)
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
	//<<DT param unmarshaling placeholder>>

	postDataToBlockchainTRADE := &postDataToBlockchainTRADE{
		UnifiedID: sanitize(args[0], "string").(string),
		Alias:     alias,
		// the new parameters are :
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
	var compositeKeyArray []string
	i := 0
	for i < len(alias) {
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
			UnifiedID:    postDataToBlockchainTRADE.UnifiedID,
		}

		aliasStructureAsBytes, err := json.Marshal(aliasStructure)
		if err != nil {
			return shim.Error(err.Error())
		}
		err = insertData(&stub, aliasStructure.Key, "alias_"+s[0], []byte(aliasStructureAsBytes))
		if err != nil {
			return shim.Error(err.Error())
		}
		i += 1
	}

	//Update registrationData.alias and check for duplicates
	j := 0
	for j < len(compositeKeyArray) {
		exist := false
		k := 0
		for k < len(unifiedRegDataAsJSON.Alias) {
			if compositeKeyArray[j] == unifiedRegDataAsJSON.AliasList[k] {
				exist = true
			}
			k += 1
		}
		if !exist {
			unifiedRegDataAsJSON.AliasList = append(unifiedRegDataAsJSON.AliasList, compositeKeyArray[j])
		}
		j += 1
	}
	fmt.Println("================after Inserting Alias================")
	fmt.Println(unifiedRegDataAsJSON.Alias)
	fmt.Println(compositeKeyArray)
	// Append remaining information here
	// new parameters are:
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
	RaiseEventData(stub, "EventOnDataChangeForTRADE", true)
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
	//<<DC param unmarshaling placeholder>>

	postDataToBlockchainCustoms := &postDataToBlockchainCustoms{
		UnifiedID:         sanitize(args[0], "string").(string),
		Alias:             alias,
		GroupBuisnessName: sanitize(args[2], "string").(string),
		// the new parameters are :
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
	var compositeKeyArray []string
	i := 0
	for i < len(alias) {
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
			UnifiedID:    postDataToBlockchainCustoms.UnifiedID,
		}

		aliasStructureAsBytes, err := json.Marshal(aliasStructure)
		if err != nil {
			return shim.Error(err.Error())
		}
		err = insertData(&stub, aliasStructure.Key, "alias_"+s[0], []byte(aliasStructureAsBytes))
		if err != nil {
			return shim.Error(err.Error())
		}
		i += 1
	}
	fmt.Println("=====Before alias update in UnifiedReg collection =====", unifiedRegDataAsJSON.Alias)

	//Update registrationData.alias and check for duplicates
	j := 0
	for j < len(compositeKeyArray) {
		exist := false
		k := 0
		for k < len(unifiedRegDataAsJSON.Alias) {
			if compositeKeyArray[j] == unifiedRegDataAsJSON.AliasList[k] {
				exist = true
			}
			k += 1
		}
		if !exist {
			unifiedRegDataAsJSON.AliasList = append(unifiedRegDataAsJSON.AliasList, compositeKeyArray[j])
		}
		j += 1
	}
	fmt.Println("================after Inserting Alias================")
	fmt.Println(unifiedRegDataAsJSON.Alias)
	fmt.Println(compositeKeyArray)
	// Append remaining information here
	// new parameters are:
	//<<update the field of main structure with DubaiCustoms field>>

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
	unifiedRegGroupingAsBytes, err := fetchData(stub, "C_"+postDataToBlockchainCustoms.GroupBuisnessName, "unifiedRegGrouping_"+s[0])
	if err != nil {
		fmt.Printf("%s\n", err)
		return shim.Error("Somthing went wrong while fetching Master Attribute data" + err.Error())
	}

	//if document does not exist
	if unifiedRegGroupingAsBytes == nil {
		var unifiedIDsArrary []string
		unifiedIDsArrary = append(unifiedIDsArrary, postDataToBlockchainCustoms.UnifiedID)
		unifiedRegGrouping := &UnifiedRegGrouping{
			DocumentName: "unifiedRegGrouping",
			Key:          "C_" + postDataToBlockchainCustoms.GroupBuisnessName,
			UnifiedIDs:   unifiedIDsArrary,
		}
		//insert document to collection
		//marshal document
		unifiedRegGroupingAsBytes, err := json.Marshal(unifiedRegGrouping)
		if err != nil {
			return shim.Error(err.Error())
		}
		// insert document
		err = insertData(&stub, unifiedRegGrouping.Key, "unifiedRegGrouping_"+s[0], []byte(unifiedRegGroupingAsBytes))
		if err != nil {
			return shim.Error(err.Error())
		}

	} else { // document exist
		//UnMarshal unifiedRegGroupingAsBytes
		var unifiedRegGroupingAsJSON UnifiedRegGrouping
		err = json.Unmarshal([]byte(unifiedRegGroupingAsBytes), &unifiedRegGroupingAsJSON)
		if err != nil {
			fmt.Printf("%s\n", err)
			return shim.Error(err.Error())
		}
		//check for duplicates
		var unifiedIDExist = false
		for i := 0; i < len(unifiedRegGroupingAsJSON.UnifiedIDs); i++ {
			if unifiedRegGroupingAsJSON.UnifiedIDs[i] == postDataToBlockchainCustoms.UnifiedID {
				unifiedIDExist = true
			}
		}
		//check flag
		if !unifiedIDExist {
			//append unifiedID in the array
			unifiedRegGroupingAsJSON.UnifiedIDs = append(unifiedRegGroupingAsJSON.UnifiedIDs, postDataToBlockchainCustoms.UnifiedID)

			//insert updated document to collection
			//marshal document
			updated_UnifiedRegGroupingAsBytes, err := json.Marshal(unifiedRegGroupingAsJSON)
			if err != nil {
				return shim.Error(err.Error())
			}
			// insert document
			err = insertData(&stub, unifiedRegGroupingAsJSON.Key, "unifiedRegGrouping_"+s[0], []byte(updated_UnifiedRegGroupingAsBytes))
			if err != nil {
				return shim.Error(err.Error())
			}
		}
	}
	//=================================================================================================================

	fmt.Println("postDataToBlockchainCUSTOMS function executed successfully.")
	//raise Event for existing document ==> (with history flag)
	RaiseEventData(stub, "EventOnDataChangeForCUSTOMS", true)
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
	fmt.Println(" alias ========> ", alias)

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
	fmt.Println("=================> ", unifiedRegDataAsJSON)
	var compositeKeyArray []string
	i := 0
	for i < len(alias) {
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
			UnifiedID:    associateAlias.UnifiedID,
		}

		aliasStructureAsBytes, err := json.Marshal(aliasStructure)
		if err != nil {
			return shim.Error(err.Error())
		}
		err = insertData(&stub, aliasStructure.Key, "alias_"+s[0], []byte(aliasStructureAsBytes))
		if err != nil {
			return shim.Error(err.Error())
		}
		i += 1
	}
	fmt.Println("=====Before alias update in UnifiedReg collection =====", unifiedRegDataAsJSON.Alias)

	//Update registrationData.alias and check for duplicates
	j := 0
	for j < len(compositeKeyArray) {
		exist := false
		k := 0
		for k < len(unifiedRegDataAsJSON.Alias) {
			if compositeKeyArray[j] == unifiedRegDataAsJSON.AliasList[k] {
				exist = true
			}
			k += 1
		}
		if !exist {
			unifiedRegDataAsJSON.AliasList = append(unifiedRegDataAsJSON.AliasList, compositeKeyArray[j])
		}
		j += 1
	}
	fmt.Println("================after Inserting Alias================")
	fmt.Println(unifiedRegDataAsJSON.Alias)
	fmt.Println(compositeKeyArray)
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
	fmt.Println("================111================")
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
		fmt.Println("================222================")
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
	fmt.Println("================333================")
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

	// call the getDataByID Function
	// var argsArray []string
	// argsArray = append(argsArray, compositeAliasAsJSON.UnifiedID)
	// t.getDataByUnifiedID(stub, argsArray, "getDataByUnifiedID")
	// get the first part of the UnifiedID spliting string by "_"
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
	fmt.Println("================111================")
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
		fmt.Println("================222================")
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
	fmt.Println("================333================")
	unifiedRegDataAsJSON.Alias = alias

	UpdatedUnifiedRegDataAsBytes, err := json.Marshal(unifiedRegDataAsJSON)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success([]byte(UpdatedUnifiedRegDataAsBytes))
}

// ###################### End ########################
