package main

type MSPList struct {
	OrgType string `json:"orgType"`
	MSP     string `json:"MSP"`
	ID      string `json:"ID"`
}

/* ===================================================================================
	This is the PostDataToBlockchainRegAuth
  ===================================================================================*/

// ###################### Start ########################
type UnifiedReg struct {
	DocumentName string   `json:"documentName"`
	Key          string   `json:"key"`
	UnifiedID    string   `json:"unifiedID"`
	Alias        []Alias  `json:"alias"`
	AliasList    []string `json:"aliasList"`
	FormationNo  string   `json:"formationNo"`

	//the new added attributes of RegAuth
	Issuedate string `json:"issuedate"`
//<<RegAuth Struct field placeholder>>

	//the new added attributes of DP-World
	//<<DPW Struct field placeholder>>

	//the new added attributes of DubaiChamber
	//<<Chamber Struct field placeholder>>

	//the new added attributes of DubaiTrade
	//<<DubaiTrade Struct field placeholder>>

	//the new added attributes of DubaiCustoms
	//<<DubaiCustoms Struct field placeholder>>
}

/* ===================================================================================
	This is the postDataToBlockchainDPW
  ===================================================================================*/

// ###################### Start ########################
type postDataToBlockchainPORT struct {
	UnifiedID string  `json:"unifiedID"`
	Alias     []Alias `json:"alias"`
	//<<DPW Struct field placeholder>>
}

/* ===================================================================================
	This is the postDataToBlockchainChamber
  ===================================================================================*/

type postDataToBlockchainCHAMBEROFCOMM struct {
	UnifiedID string  `json:"unifiedID"`
	Alias     []Alias `json:"alias"`
	//<<Chamber Struct field placeholder>>
}

/* ===================================================================================
	This is the postDataToBlockchainDubaiTrade
  ===================================================================================*/

// ###################### Start ########################
type postDataToBlockchainTRADE struct {
	UnifiedID string  `json:"unifiedID"`
	Alias     []Alias `json:"alias"`
	//<<DubaiTrade Struct field placeholder>>
}

/* ===================================================================================
	This is the postDataToBlockchainCustoms
  ===================================================================================*/

// ###################### Start ########################
type postDataToBlockchainCustoms struct {
	UnifiedID         string  `json:"unifiedID"`
	Alias             []Alias `json:"alias"`
	GroupBuisnessName string  `json:"groupBuisnessName"`
	//<<DubaiCustoms Struct field placeholder>>
}

/* ===================================================================================
	This is the associateAlias
  ===================================================================================*/

// ###################### Start ########################
type AssociateAlias struct {
	UnifiedID string  `json:"unifiedID"`
	Alias     []Alias `json:"alias"`
}

type Alias struct {
	Key  string `json:"key"`
	Type string `json:"type"`
}

type AliasStructure struct {
	DocumentName string `json:"documentName"`
	Key          string `json:"key"`
	AliasKey     string `json:"aliasKey"`
	AliasType    string `json:"aliasType"`
	UnifiedID    string `json:"unifiedID"`
}

type UnifiedRegGrouping struct {
	DocumentName string   `json:"documentName"`
	Key          string   `json:"key"`
	UnifiedIDs   []string `json:"UnifiedIDs"`
}

type AdditionalData struct {
	CheckHistory bool `json:"checkHistory"`
}

//<< New struct placeholder>>
