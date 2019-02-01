
type AddTenant struct{
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
structEnd}
AddTenant := &AddTenant{
		
		<<field1>>:   sanitize(<<args[currentNo]>>, "<<fieldType>>").(<<fieldType>>)
}