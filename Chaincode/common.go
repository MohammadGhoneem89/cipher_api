package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

func insertData(stub *hypConnect, key string, privateCollection string, data []byte) error {

	err := stub.Connection.PutPrivateData(privateCollection, key, data)
	if err != nil {
		return err
	}

	event := eventDataFormat{}
	event.Key = key
	event.Collection = privateCollection
	stub.EventList = stub.AddEvent(event)

	fmt.Println("Successfully Put State for Key: " + key + " and Private Collection " + privateCollection)
	return nil
}
func fetchData(stub hypConnect, key string, privateCollection string) ([]byte, error) {
	bytes, err := stub.Connection.GetPrivateData(privateCollection, key)
	if err != nil {
		return nil, err
	}
	return bytes, nil
}

func getArguments(stub shim.ChaincodeStubInterface) ([]string, error) {
	transMap, err := stub.GetTransient()
	if err != nil {
		return nil, err
	}
	if _, ok := transMap["PrivateArgs"]; !ok {
		return nil, errors.New("PrivateArgs must be a key in the transient map")
	}
	fmt.Println("Arguments: %v", transMap)
	generalInput := string(transMap["PrivateArgs"])
	retVal := strings.Split(generalInput, "|")
	return retVal, nil
}
func getOrgTypeByMSP(stub shim.ChaincodeStubInterface, MSP string) (string, error) {

	MSPMappingAsBytes, err := stub.GetState("MSPMapping")
	if err != nil {
		return "", err
	}

	if err != nil {
		fmt.Println("MSPMapping - Failed to get state MSP mapping information." + err.Error())
		return "", err
	} else if MSPMappingAsBytes != nil {
		fmt.Println("MSPMapping - This data Fetched from Transactions.")
		var MSPListUnmarshaled []MSPList

		err := json.Unmarshal(MSPMappingAsBytes, &MSPListUnmarshaled)
		if err != nil {
			fmt.Println("MSPMapping-Failed to UnMarshal state.")
			return "", err
		}
		fmt.Println("Unmarshaled: %v", MSPListUnmarshaled)
		for i := 0; i < len(MSPListUnmarshaled); i++ {
			if MSPListUnmarshaled[i].MSP == MSP {
				fmt.Println("OrgType for MSP " + MSP + " is " + MSPListUnmarshaled[i].OrgType)
				return MSPListUnmarshaled[i].OrgType, nil
			}
		}
	}
	return "", nil
}
func RaiseEventData(stub hypConnect, eventName string, args ...interface{}) (string, error) {

	var eventList generalEventStruct
	eventList.EventName = eventName
	eventList.EventList = stub.EventList
	eventList.AdditionalData = args
	eventJSONasBytes, err2 := json.Marshal(eventList)
	if err2 != nil {
		return "", err2
	}
	fmt.Println("Event raised: " + eventName)
	//fmt.Println("\neventJSONasBytes : ", eventList.EventName+"\n")
	mEventName := eventList.EventName
	err3 := stub.Connection.SetEvent("chainCodeEvent", []byte(eventJSONasBytes))
	if err3 != nil {
		return "", err3
	}
	var err4 error
	err4 = nil
	return mEventName, err4

}

func GetPaymentIntrumentsByContractID(stub hypConnect, _Contract Contract) ([]PaymentInstruments, error) {
	var _PaymentInstruments []PaymentInstruments
	for i := 0; i < len(_Contract.InstrumentList); i++ {
		_KeyPI := "P_" + _Contract.ContractID + "_" + _Contract.InstrumentList[i].InternalInstrumentID
		var _payment PaymentInstruments
		trnxAsBytes, err := fetchData(stub, _KeyPI, strings.ToLower(_Contract.InstrumentList[i].BankCode)+"Collection")
		if err != nil {
			fmt.Println("Get PaymentInstrument Error: " + _KeyPI)
			return nil, err
		}
		if trnxAsBytes == nil {
			fmt.Println("PaymentInstrument Not found: " + _KeyPI)
			return nil, err
		}
		json.Unmarshal(trnxAsBytes, &_payment)

		_PaymentInstruments = append(_PaymentInstruments, _payment)
	}
	fmt.Println("_PaymentInstruments:", _PaymentInstruments)
	return _PaymentInstruments, nil
}

func GetBanksContract(stub hypConnect, _Contract Contract) ([]ContractBank, error) {
	var _ContractBankList []ContractBank
	for i := 0; i < len(_Contract.InstrumentList); i++ {
		_Key := "C_" + _Contract.ContractID
		var _ContractBank ContractBank
		trnxAsBytes, err := fetchData(stub, _Key, strings.ToLower(_Contract.InstrumentList[i].BankCode)+"Collection")
		if err != nil {
			fmt.Println("Get PaymentInstrument Error: " + _Key)
			return nil, err
		}
		if trnxAsBytes == nil {
			fmt.Println("PaymentInstrument Not found: " + _Key)
			return nil, err
		}
		json.Unmarshal(trnxAsBytes, &_ContractBank)

		var isNewBank = true
		var bankCodeList []string
		for j := 0; j < len(bankCodeList); j++ {
			if bankCodeList[j] == _Contract.InstrumentList[i].BankCode {
				isNewBank = false
			}
		}
		if isNewBank {
			_ContractBankList = append(_ContractBankList, _ContractBank)
			bankCodeList = append(bankCodeList, _Contract.InstrumentList[i].BankCode)
		}

	}
	fmt.Println("_ContractBankList:", _ContractBankList)
	return _ContractBankList, nil
}
