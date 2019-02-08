
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

AddTenant := AddTenant{
	Body.orgCode:   sanitize(args[0], "string").(string)
Body.orgID:   sanitize(args[1], "string").(string)
Body.emiratesID:   sanitize(args[2], "string").(string)
Body.customerName:   sanitize(args[3], "string").(string)
Body.mobileNumber:   sanitize(args[4], "string").(string)
Body.emailID:   sanitize(args[5], "string").(string)
Body.visaNo:   sanitize(args[6], "string").(string)
Body.visaExpiryDate:   sanitize(args[7], "string").(string)
Body.emiratesIDExpiryDate:   sanitize(args[8], "string").(string)
Body.authToken:   sanitize(args[9], "string").(string)
Body.timestamp:   sanitize(args[10], "string").(string)
  }

type AssociatePaymentInstruments struct{
	Body.authToken string `json:"body.authToken"`
Body.EIDA string `json:"body.EIDA"`
Body.contractID string `json:"body.contractID"`
Body.paymentInstruments array `json:"body.paymentInstruments"`
Body.orgCode string `json:"body.orgCode"`
 }

AssociatePaymentInstruments := AssociatePaymentInstruments{
	Body.authToken:   sanitize(args[0], "string").(string)
Body.EIDA:   sanitize(args[1], "string").(string)
Body.contractID:   sanitize(args[2], "string").(string)
Body.paymentInstruments:   sanitize(args[3], "array").(array)
Body.orgCode:   sanitize(args[4], "string").(string)
  }

type AssociatePaymentInstrumentsTemp struct{
	Body.authToken string `json:"body.authToken"`
Body.contractID string `json:"body.contractID"`
Body.paymentInstruments array `json:"body.paymentInstruments"`
Body.EIDA string `json:"body.EIDA"`
 }

AssociatePaymentInstrumentsTemp := AssociatePaymentInstrumentsTemp{
	Body.authToken:   sanitize(args[0], "string").(string)
Body.contractID:   sanitize(args[1], "string").(string)
Body.paymentInstruments:   sanitize(args[2], "array").(array)
Body.EIDA:   sanitize(args[3], "string").(string)
  }

type BLANK struct{
	Body object `json:"body"`
 }

BLANK := BLANK{
	Body:   sanitize(args[0], "object").(object)
  }

type EjariTerminationStatus struct{
	Body.orgCode string `json:"body.orgCode"`
Body.contractID string `json:"body.contractID"`
Body.ejariTerminationStatus string `json:"body.ejariTerminationStatus"`
 }

EjariTerminationStatus := EjariTerminationStatus{
	Body.orgCode:   sanitize(args[0], "string").(string)
Body.contractID:   sanitize(args[1], "string").(string)
Body.ejariTerminationStatus:   sanitize(args[2], "string").(string)
  }

type GetBouncedCheques struct{
	Body.orgCode string `json:"body.orgCode"`
Body.fromDate string `json:"body.fromDate"`
Body.toDate string `json:"body.toDate"`
Body.page object `json:"body.page"`
Body.page.currentPageNo string `json:"body.page.currentPageNo"`
Body.page.pageSize string `json:"body.page.pageSize"`
 }

GetBouncedCheques := GetBouncedCheques{
	Body.orgCode:   sanitize(args[0], "string").(string)
Body.fromDate:   sanitize(args[1], "string").(string)
Body.toDate:   sanitize(args[2], "string").(string)
Body.page:   sanitize(args[3], "object").(object)
Body.page.currentPageNo:   sanitize(args[4], "string").(string)
Body.page.pageSize:   sanitize(args[5], "string").(string)
  }

type GetContractData struct{
	Body.orgCode string `json:"body.orgCode"`
Body.EIDA string `json:"body.EIDA"`
Body.authToken string `json:"body.authToken"`
Body.contractID string `json:"body.contractID"`
__JWTORG string `json:"__JWTORG"`
 }

GetContractData := GetContractData{
	Body.orgCode:   sanitize(args[0], "string").(string)
Body.EIDA:   sanitize(args[1], "string").(string)
Body.authToken:   sanitize(args[2], "string").(string)
Body.contractID:   sanitize(args[3], "string").(string)
__JWTORG:   sanitize(args[4], "string").(string)
  }

type GetContractDataForEjari struct{
	Body.orgCode string `json:"body.orgCode"`
Body.contractID string `json:"body.contractID"`
 }

GetContractDataForEjari := GetContractDataForEjari{
	Body.orgCode:   sanitize(args[0], "string").(string)
Body.contractID:   sanitize(args[1], "string").(string)
  }

type GetContractDataForEjariTemp struct{
	Body.orgCode string `json:"body.orgCode"`
Body.contractID string `json:"body.contractID"`
 }

GetContractDataForEjariTemp := GetContractDataForEjariTemp{
	Body.orgCode:   sanitize(args[0], "string").(string)
Body.contractID:   sanitize(args[1], "string").(string)
  }

type GetContractDataTemp struct{
	Body.orgCode string `json:"body.orgCode"`
Body.EIDA string `json:"body.EIDA"`
Body.authToken string `json:"body.authToken"`
Body.contractID string `json:"body.contractID"`
 }

GetContractDataTemp := GetContractDataTemp{
	Body.orgCode:   sanitize(args[0], "string").(string)
Body.EIDA:   sanitize(args[1], "string").(string)
Body.authToken:   sanitize(args[2], "string").(string)
Body.contractID:   sanitize(args[3], "string").(string)
  }
