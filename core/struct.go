











type AddTenant struct{
	Body.orgCode string `json:"body.orgCode"`
Body.orgID string `json:"body.orgID"`
Body.emiratesID string `json:"body.emiratesID"`
Body.customerName string `json:"body.customerName"`
Body.mobileNumber string `json:"body.mobileNumber"`
Body.emailID string `json:"body.emailID"`
Body.visaNo string `json:"body.visaNo"`
Body.visaExpiryDate string `json:"body.visaExpiryDate"`
Body.emiratesIDExpiryDate string `json:"body.emiratesIDExpiryDate"`
Body.authToken string `json:"body.authToken"`
Body.timestamp string `json:"body.timestamp"`
 }







type AssociatePaymentInstruments struct{
	Body.authToken string `json:"body.authToken"`
Body.EIDA string `json:"body.EIDA"`
Body.contractID string `json:"body.contractID"`
Body.orgCode string `json:"body.orgCode"`
 }






type AssociatePaymentInstrumentsTemp struct{
	Body.authToken string `json:"body.authToken"`
Body.contractID string `json:"body.contractID"`
Body.EIDA string `json:"body.EIDA"`
 }






type BLANK struct{
	 }






type EjariTerminationStatus struct{
	Body.orgCode string `json:"body.orgCode"`
Body.contractID string `json:"body.contractID"`
Body.ejariTerminationStatus string `json:"body.ejariTerminationStatus"`
 }









type GetBouncedCheques struct{
	Body.orgCode string `json:"body.orgCode"`
Body.fromDate string `json:"body.fromDate"`
Body.toDate string `json:"body.toDate"`
Body.page object `json:"body.page"`
Body.page.currentPageNo string `json:"body.page.currentPageNo"`
Body.page.pageSize string `json:"body.page.pageSize"`
 }








type GetContractData struct{
	Body.orgCode string `json:"body.orgCode"`
Body.EIDA string `json:"body.EIDA"`
Body.authToken string `json:"body.authToken"`
Body.contractID string `json:"body.contractID"`
__JWTORG string `json:"__JWTORG"`
 }





type GetContractDataForEjari struct{
	Body.orgCode string `json:"body.orgCode"`
Body.contractID string `json:"body.contractID"`
 }





type GetContractDataForEjariTemp struct{
	Body.orgCode string `json:"body.orgCode"`
Body.contractID string `json:"body.contractID"`
 }







type GetContractDataTemp struct{
	Body.orgCode string `json:"body.orgCode"`
Body.EIDA string `json:"body.EIDA"`
Body.authToken string `json:"body.authToken"`
Body.contractID string `json:"body.contractID"`
 }


