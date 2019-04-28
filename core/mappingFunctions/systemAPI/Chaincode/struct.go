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


type  EjariTerminationStatus struct{
	OrgCode string `json:"orgCode"`
ContractID string `json:"contractID"`
EjariTerminationStatus string `json:"ejariTerminationStatus"`
 }


type  GetContractDataForEjari struct{
	OrgCode string `json:"orgCode"`
ContractID string `json:"contractID"`
 }


type  GetKYCDetail struct{
	EIDA string `json:"EIDA"`
 }


type  Logout struct{
	OrgCode string `json:"orgCode"`
AuthToken string `json:"authToken"`
OrgID string `json:"orgID"`
Timestamp string `json:"timestamp"`
 }


type  SaveEjariHashData struct{
	ContractID string `json:"contractID"`
OrgCode string `json:"orgCode"`
EjariNumber string `json:"ejariNumber"`
TenantNumber string `json:"tenantNumber"`
EjariStatus string `json:"ejariStatus"`
EjariHash string `json:"ejariHash"`
SignedEjariHash string `json:"signedEjariHash"`
 }


type  UpdateDEWADetail struct{
	OrgCode string `json:"orgCode"`
ContractID string `json:"contractID"`
 }


type  UpdateKYCDetail struct{
	ResidenceAddr string `json:"residenceAddr"`
ContactPersonMobile string `json:"contactPersonMobile"`
Nationality string `json:"nationality"`
DateOfBirth string `json:"dateOfBirth"`
NatId string `json:"natId"`
NatIdExpDate string `json:"natIdExpDate"`
PoBox string `json:"poBox"`
PhoneNo string `json:"phoneNo"`
Gender string `json:"gender"`
TenantNameEn string `json:"tenantNameEn"`
TenantNameAr string `json:"tenantNameAr"`
VisaNo string `json:"visaNo"`
VisaIssueDate string `json:"visaIssueDate"`
VisaExpiryDate string `json:"visaExpiryDate"`
VisaStatus string `json:"visaStatus"`
 }


type  UpdateToken struct{
	OrgCode string `json:"orgCode"`
OrgID string `json:"orgID"`
OldAuthToken string `json:"oldAuthToken"`
NewAuthToken string `json:"newAuthToken"`
Timestamp string `json:"timestamp"`
 }


type  AssociatePaymentInstruments struct{
	AuthToken string `json:"authToken"`
EIDA string `json:"EIDA"`
ContractID string `json:"contractID"`
OrgCode string `json:"orgCode"`
 }


type  GetContractData struct{
	OrgCode string `json:"orgCode"`
EIDA string `json:"EIDA"`
AuthToken string `json:"authToken"`
ContractID string `json:"contractID"`
undefined string `json:"undefined"`
 }


type  UpdatePaymentInstrumentStatus struct{
	OrgCode string `json:"orgCode"`
ContractID string `json:"contractID"`
 }


type  GetContractDetails struct{
	EIDA string `json:"EIDA"`
AuthToken string `json:"authToken"`
ContractID string `json:"contractID"`
OrgCode string `json:"orgCode"`
 }


type  GetContractDetailsBackOffice struct{
	EIDA string `json:"EIDA"`
ContractID string `json:"contractID"`
OrgCode string `json:"orgCode"`
 }


type  InsertPaymentMetaInfo struct{
	Code string `json:"code"`
Name string `json:"name"`
BeneficiaryData string `json:"beneficiaryData"`
BankCode string `json:"bankCode"`
 }


type  ProcessInstrument struct{
	ContractID string `json:"contractID"`
OrgCode string `json:"orgCode"`
 }


type  RenewContract struct{
	AuthToken string `json:"authToken"`
EIDA string `json:"EIDA"`
ContractID string `json:"contractID"`
ContractReference string `json:"contractReference"`
LastContractID string `json:"lastContractID"`
ContractStartDate string `json:"contractStartDate"`
ContractEndDate string `json:"contractEndDate"`
ContractAmount string `json:"contractAmount"`
TenantName string `json:"tenantName"`
UserReferenceNumber string `json:"userReferenceNumber"`
PropertyReferenceNumber string `json:"propertyReferenceNumber"`
BusinessPartnerNo string `json:"businessPartnerNo"`
OldeEjariNumber string `json:"oldeEjariNumber"`
ContractSignedHash string `json:"contractSignedHash"`
PaymentMethod string `json:"paymentMethod"`
CheckKYCStatus string `json:"checkKYCStatus"`
PaymentCount int64 `json:"paymentCount"`
IsLegacyContract bool `json:"isLegacyContract"`
OrgCode string `json:"orgCode"`
KYCValidationPeriod int64 `json:"KYCValidationPeriod"`
undefined string `json:"undefined"`
 }


type  ReplacePaymentInstruments struct{
	AuthToken string `json:"authToken"`
EIDA string `json:"EIDA"`
ContractID string `json:"contractID"`
undefined string `json:"undefined"`
 }


type  ReplacePaymentInstrumentsBackOffice struct{
	EIDA string `json:"EIDA"`
ContractID string `json:"contractID"`
undefined string `json:"undefined"`
 }


type  ReprocessEjari struct{
	ContractID string `json:"contractID"`
RequestType string `json:"requestType"`
undefined string `json:"undefined"`
 }


type  RequestKYC struct{
	OrgCode string `json:"orgCode"`
EIDA string `json:"EIDA"`
 }


type  TerminateContract struct{
	ContractID string `json:"contractID"`
TerminationDate string `json:"terminationDate"`
TerminationReason string `json:"terminationReason"`
EjariNumber string `json:"ejariNumber"`
TerminationType string `json:"terminationType"`
 }


type  UpdateContract struct{
	ContractID string `json:"contractID"`
CRMTicketNo string `json:"CRMTicketNo"`
OrgCode string `json:"orgCode"`
 }


type  UpdateContractStatus struct{
	OrgCode string `json:"orgCode"`
ContractID string `json:"contractID"`
 }


