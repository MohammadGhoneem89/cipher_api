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
ExpiryDate string `json:"expiryDate"`
Status string `json:"status"`
TradeZone string `json:"tradeZone"`
LicenseCategoryCodeDescEn string `json:"licenseCategoryCodeDescEn"`
LicenseCategoryCodeDescAr string `json:"licenseCategoryCodeDescAr"`
RenewalDate string `json:"renewalDate"`
AccountNumber string `json:"accountNumber"`
AccountNameAr string `json:"accountNameAr"`
AccountNameEn string `json:"accountNameEn"`
AccountStatus string `json:"accountStatus"`
AccountFormationDate string `json:"accountFormationDate"`
EstablishmentType string `json:"establishmentType"`
LegalEntity string `json:"legalEntity"`
CountryOfOrigin string `json:"countryOfOrigin"`
City string `json:"city"`
Address string `json:"address"`
POBOX string `json:"POBOX"`
Email string `json:"email"`
Phone string `json:"phone"`
MobileNumber string `json:"mobileNumber"`
Website string `json:"website"`
ZoneName string `json:"zoneName"`
Fax string `json:"Fax"`
PassportCopy []PassportCopy `json:"passportCopy"`
TradeLicense TradeLicense `json:"tradeLicense"`
Activity []Activity `json:"activity"`
Partners []Partners `json:"partners"`
ContactRegAuth []ContactRegAuth `json:"contactRegAuth"`
LicenseTerminatedDate string `json:"licenseTerminatedDate"`
//<<RegAuth Struct field placeholder>>

	//the new added attributes of DP-World
	LetterFromGM LetterFromGM `json:"letterFromGM"`
ContactDPW []ContactDPW `json:"contactDPW"`
CompanyBrief string `json:"companyBrief"`
NonVATCustomer bool `json:"nonVATCustomer"`
//<<DPW Struct field placeholder>>

	//the new added attributes of DubaiChamber
	MembershipExpiryDate string `json:"membershipExpiryDate"`
MembershipStatus string `json:"membershipStatus"`
//<<Chamber Struct field placeholder>>

	//the new added attributes of DubaiTrade
	FacebookURL string `json:"facebookURL"`
TwitterURL string `json:"twitterURL"`
CompanyLogo CompanyLogo `json:"companyLogo"`
VATRegCertificate VATRegCertificate `json:"VATRegCertificate"`
VATAccountNo string `json:"VATAccountNo"`
//<<DubaiTrade Struct field placeholder>>

	//the new added attributes of DubaiCustoms
	AccountNameCustom string `json:"accountNameCustom"`
UndertakingFromOwner UndertakingFromOwner `json:"undertakingFromOwner"`
CompanyInfo CompanyInfo `json:"companyInfo"`
ContactCustoms []ContactCustoms `json:"contactCustoms"`
//<<DubaiCustoms Struct field placeholder>>
}

/* ===================================================================================
	This is the postDataToBlockchainDPW
  ===================================================================================*/

// ###################### Start ########################
type postDataToBlockchainPORT struct {
	UnifiedID string  `json:"unifiedID"`
	Alias     []Alias `json:"alias"`
	LetterFromGM LetterFromGM `json:"letterFromGM"`
ContactDPW []ContactDPW `json:"contactDPW"`
CompanyBrief string `json:"companyBrief"`
NonVATCustomer bool `json:"nonVATCustomer"`
//<<DPW Struct field placeholder>>
}

/* ===================================================================================
	This is the postDataToBlockchainChamber
  ===================================================================================*/

type postDataToBlockchainCHAMBEROFCOMM struct {
	UnifiedID string  `json:"unifiedID"`
	Alias     []Alias `json:"alias"`
	MembershipExpiryDate string `json:"membershipExpiryDate"`
MembershipStatus string `json:"membershipStatus"`
//<<Chamber Struct field placeholder>>
}

/* ===================================================================================
	This is the postDataToBlockchainDubaiTrade
  ===================================================================================*/

// ###################### Start ########################
type postDataToBlockchainTRADE struct {
	UnifiedID string  `json:"unifiedID"`
	Alias     []Alias `json:"alias"`
	FacebookURL string `json:"facebookURL"`
TwitterURL string `json:"twitterURL"`
CompanyLogo CompanyLogo `json:"companyLogo"`
VATRegCertificate VATRegCertificate `json:"VATRegCertificate"`
VATAccountNo string `json:"VATAccountNo"`
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
	AccountNameCustom string `json:"accountNameCustom"`
UndertakingFromOwner UndertakingFromOwner `json:"undertakingFromOwner"`
CompanyInfo CompanyInfo `json:"companyInfo"`
ContactCustoms []ContactCustoms `json:"contactCustoms"`
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

type PassportCopy struct {
Name string `json:"name"`
Type string `json:"type"`
Path string `json:"path"`
Hash string `json:"hash"`
}
type TradeLicense struct {
Name string `json:"name"`
Type string `json:"type"`
Path string `json:"path"`
Hash string `json:"hash"`
}
type Activity struct {
Code string `json:"code"`
DescEn string `json:"descEn"`
DescAr string `json:"descAr"`
StatusCode string `json:"statusCode"`
StatusDescEn string `json:"statusDescEn"`
StatusDescAr string `json:"statusDescAr"`
AddDate string `json:"addDate"`
CancelDate string `json:"cancelDate"`
}
type Partners struct {
Type string `json:"type"`
NameEn string `json:"nameEn"`
NameAr string `json:"nameAr"`
PersonCategoryDescEn string `json:"personCategoryDescEn"`
PercentOwnership string `json:"percentOwnership"`
PassportNo string `json:"passportNo"`
ResidenceNo string `json:"residenceNo"`
NationalityDescEn string `json:"nationalityDescEn"`
NationalityDescAr string `json:"nationalityDescAr"`
StatusDescEn string `json:"statusDescEn"`
StatusDescAr string `json:"statusDescAr"`
AddDate string `json:"addDate"`
CancelDate string `json:"cancelDate"`
FirstName string `json:"firstName"`
LastName string `json:"lastName"`
PassportExpiry string `json:"passportExpiry"`
}
type ContactRegAuth struct {
ContractType string `json:"contractType"`
FirstName string `json:"firstName"`
MiddleName string `json:"middleName"`
LastName string `json:"lastName"`
Nationality string `json:"nationality"`
PassportNo string `json:"passportNo"`
PassportExpiryDate string `json:"passportExpiryDate"`
Telephone1 string `json:"telephone1"`
Telephone2 string `json:"telephone2"`
Mobile string `json:"mobile"`
Fax string `json:"fax"`
Email string `json:"email"`
}
type LetterFromGM struct {
Name string `json:"name"`
Type string `json:"type"`
Path string `json:"path"`
Hash string `json:"hash"`
}
type ContactDPW struct {
ContractType string `json:"contractType"`
FirstName string `json:"firstName"`
MiddleName string `json:"middleName"`
LastName string `json:"lastName"`
Nationality string `json:"nationality"`
PassportNo string `json:"passportNo"`
PassportExpiryDate string `json:"passportExpiryDate"`
Telephone1 string `json:"telephone1"`
Telephone2 string `json:"telephone2"`
Mobile string `json:"mobile"`
Fax string `json:"fax"`
Email string `json:"email"`
}
type CompanyLogo struct {
Name string `json:"name"`
Type string `json:"type"`
Path string `json:"path"`
Hash string `json:"hash"`
}
type VATRegCertificate struct {
Name string `json:"name"`
Type string `json:"type"`
Path string `json:"path"`
Hash string `json:"hash"`
}
type UndertakingFromOwner struct {
Name string `json:"name"`
Type string `json:"type"`
Path string `json:"path"`
Hash string `json:"hash"`
}
type CompanyInfo struct {
BuisnessCode string `json:"buisnessCode"`
RelationType string `json:"relationType"`
IncorperationType string `json:"incorperationType"`
}
type ContactCustoms struct {
ContractType string `json:"contractType"`
FirstName string `json:"firstName"`
MiddleName string `json:"middleName"`
LastName string `json:"lastName"`
Nationality string `json:"nationality"`
PassportNo string `json:"passportNo"`
PassportExpiryDate string `json:"passportExpiryDate"`
Telephone1 string `json:"telephone1"`
Telephone2 string `json:"telephone2"`
Mobile string `json:"mobile"`
Fax string `json:"fax"`
Email string `json:"email"`
}
//<< New struct placeholder>>
