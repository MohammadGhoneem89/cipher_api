package main

type MSPList struct {
	OrgType string `json:"orgType"`
	MSP     string `json:"MSP"`
	ID      string `json:"ID"`
}
type BLANK struct {
	BLANK string `json:"BLANK"`
}
type  AddTenant struct{
	OrgCode string `json:"orgCode"`
OrgID string `json:"orgID"`
EmiratesID string `json:"emiratesID"`
CustomerName string `json:"customerName"`
MobileNumber string `json:"mobileNumber"`
EmailID string `json:"emailID"`
VisaNo string `json:"visaNo"`
VisaExpiryDate string `json:"visaExpiryDate"`
EmiratesIDExpiryDate string `json:"emiratesIDExpiryDate"`
AuthToken string `json:"authToken"`
Timestamp string `json:"timestamp"`
OrgCodeWASL string `json:"orgCodeWASL"`
 }


type  AssociatePaymentInstruments struct{
	AuthToken string `json:"authToken"`
EIDA string `json:"EIDA"`
ContractID string `json:"contractID"`
OrgCode string `json:"orgCode"`
 }


type  AssociatePaymentInstrumentsTemp struct{
	AuthToken string `json:"authToken"`
EIDA string `json:"EIDA"`
ContractID string `json:"contractID"`
OrgCode string `json:"orgCode"`
 }


type  EjariTerminationStatus struct{
	OrgCode string `json:"orgCode"`
ContractID string `json:"contractID"`
EjariTerminationStatus string `json:"ejariTerminationStatus"`
 }


