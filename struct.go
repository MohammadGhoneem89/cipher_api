
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
 }

AddTenant := &AddTenant{	
		OrgCode:   sanitize(args[0], "string").(string)
OrgID:   sanitize(args[1], "string").(string)
EmiratesID:   sanitize(args[2], "string").(string)
CustomerName:   sanitize(args[3], "string").(string)
MobileNumber:   sanitize(args[4], "string").(string)
EmailID:   sanitize(args[5], "string").(string)
VisaNo:   sanitize(args[6], "string").(string)
VisaExpiryDate:   sanitize(args[7], "string").(string)
EmiratesIDExpiryDate:   sanitize(args[8], "string").(string)
AuthToken:   sanitize(args[9], "string").(string)
Timestamp:   sanitize(args[10], "string").(string)
  }