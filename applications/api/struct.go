
type GetContractDataTemp struct{
	OrgCode string `json:"orgCode"`
EIDA string `json:"EIDA"`
AuthToken string `json:"authToken"`
ContractID string `json:"contractID"`
 }

GetContractDataTemp := GetContractDataTemp{
	OrgCode:   sanitize(args[0], "string").(string)
EIDA:   sanitize(args[1], "string").(string)
AuthToken:   sanitize(args[2], "string").(string)
ContractID:   sanitize(args[3], "string").(string)
  }

type GetContract struct{
	IIIIIIIIIIIIIIIIIIIIIIIIIIII string `json:"IIIIIIIIIIIIIIIIIIIIIIIIIIII"`
EEEEEEEEEEEEEEEEEEEEEE string `json:"EEEEEEEEEEEEEEEEEEEEEE"`
GGGGGGGGGGGGGGGGGG string `json:"GGGGGGGGGGGGGGGGGG"`
OOOOOOOOOOOOOOOOOOOOOO string `json:"OOOOOOOOOOOOOOOOOOOOOO"`
RRRRRRRRRRRRRRRRRRRRR string `json:"RRRRRRRRRRRRRRRRRRRRR"`
 }

GetContract := GetContract{
	IIIIIIIIIIIIIIIIIIIIIIIIIIII:   sanitize(args[0], "string").(string)
EEEEEEEEEEEEEEEEEEEEEE:   sanitize(args[1], "string").(string)
GGGGGGGGGGGGGGGGGG:   sanitize(args[2], "string").(string)
OOOOOOOOOOOOOOOOOOOOOO:   sanitize(args[3], "string").(string)
RRRRRRRRRRRRRRRRRRRRR:   sanitize(args[4], "string").(string)
  }
