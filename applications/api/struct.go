
type GetContractDataTemp struct{
	orgCode string `json:"orgCode"`
contractID string `json:"contractID"`
orgCode string `json:"orgCode"`
EIDA string `json:"EIDA"`
 }

GetContractDataTemp := &GetContractDataTemp{	
		orgCode:   sanitize(args[0], "string").(string)
contractID:   sanitize(args[1], "string").(string)
orgCode:   sanitize(args[0], "string").(string)
EIDA:   sanitize(args[1], "string").(string)
  }
type AddTenant struct{
	orgCode string `json:"orgCode"`
contractID string `json:"contractID"`
orgCode string `json:"orgCode"`
EIDA string `json:"EIDA"`
 }

AddTenant := &AddTenant{	
		orgCode:   sanitize(args[0], "string").(string)
contractID:   sanitize(args[1], "string").(string)
orgCode:   sanitize(args[0], "string").(string)
EIDA:   sanitize(args[1], "string").(string)
  }