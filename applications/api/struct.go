
type AddTenant struct{
	OrgCode int64 `json:"orgCode"`
OrgID string `json:"orgID"`
EmiratesID string `json:"emiratesID"`
 }

AddTenant := &AddTenant{	
		OrgCode:   sanitize(args[0], "int64").(int64)
OrgID:   sanitize(args[1], "string").(string)
EmiratesID:   sanitize(args[2], "string").(string)
  }