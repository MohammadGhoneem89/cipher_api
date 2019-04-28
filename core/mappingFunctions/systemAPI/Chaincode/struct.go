package main

type MSPList struct {
	OrgType string `json:"orgType"`
	MSP     string `json:"MSP"`
	ID      string `json:"ID"`
}
type BLANK struct {
	BLANK string `json:"BLANK"`
}
type  addAttribute struct{
	Name string `json:"name"`
DataProvider string `json:"dataProvider"`
Type string `json:"type"`
Occurrence string `json:"occurrence"`
IsRequired bool `json:"isRequired"`
 }


type  associateAlias struct{
	UnifiedID string `json:"unifiedID"`
 }


type  getDataByAlias struct{
	RegAuthCode string `json:"regAuthCode"`
 }


type  getDataByUnifiedID struct{
	UnifiedID string `json:"unifiedID"`
 }


type  postDataToBlockchainChamber struct{
	UnifiedID string `json:"unifiedID"`
MembershipExpiryDate string `json:"membershipExpiryDate"`
MembershipStatus string `json:"membershipStatus"`
 }


type  getAttributeList struct{
	UnifiedID string `json:"unifiedID"`
 }


type  getDataByUnifiedID2 struct{
	UnifiedID string `json:"unifiedID"`
 }


type  postDataToBlockchainCustoms struct{
	UnifiedID string `json:"unifiedID"`
AccountName string `json:"accountName"`
GroupBuisnessName string `json:"groupBuisnessName"`
 }


type  postDataToBlockchainDPW struct{
	UnifiedID string `json:"unifiedID"`
CompanyBrief string `json:"companyBrief"`
NonVATCustomer bool `json:"nonVATCustomer"`
 }


type  postDataToBlockchainDubaiTrade struct{
	UnifiedID string `json:"unifiedID"`
FacebookURL string `json:"facebookURL"`
TwitterURL string `json:"twitterURL"`
VATAccountNo string `json:"VATAccountNo"`
 }


type  postDataToBlockchainRegAuth struct{
	UnifiedID string `json:"unifiedID"`
Issuedate string `json:"issuedate"`
ExpiryDate string `json:"expiryDate"`
Status string `json:"status"`
TradeZone string `json:"tradeZone"`
LicenseCategoryCodeDescEn string `json:"licenseCategoryCodeDescEn"`
LicenseCategoryCodeDescAr string `json:"licenseCategoryCodeDescAr"`
LicenseTerminatedDate string `json:"licenseTerminatedDate"`
RenewalDate string `json:"renewalDate"`
FormationNo string `json:"formationNo"`
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
Fax string `json:"fax"`
 }


