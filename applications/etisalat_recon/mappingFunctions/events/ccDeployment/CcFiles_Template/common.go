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
	fmt.Printf("Arguments: %v", transMap)
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

/*
func GetDeltaData1(old ...interface{}, new ...interface{}) {
	i := 0
	for i < len(old) {
		if old[i] != new[i] {

		}

		i += 1
	}

}

type Server struct {
	Name    string `json:"name,omitempty"`
	ID      int
	Enabled bool
	users   []string // not exported
}

func GetDeltaData(old []string, new []string) []string {

	var diff []string
	for i := 0; i < len(old); i++ {
		if old[i] != new[i] {
			diff = append(diff, old[i])
			diff = append(diff, new[i])
		}
	}

	server := &Server{
		Name:    "gopher",
		ID:      123456,
		Enabled: true,
	}

	m := structs.Map(server)
	return diff

}
*/
