package main

type MSPList struct {
	OrgType string `json:"orgType"`
	MSP     string `json:"MSP"`
	ID      string `json:"ID"`
}
type BLANK struct {
	BLANK string `json:"BLANK"`
}
type  postDataToBlockchainChamber struct{
	UnifiedID string `json:"unifiedID"`
MembershipExpiryDate string `json:"membershipExpiryDate"`
MembershipStatus string `json:"membershipStatus"`
 }


type  postDataToBlockchainRegAuth struct{
	UnifiedID string `json:"unifiedID"`
MembershipExpiryDate string `json:"membershipExpiryDate"`
MembershipStatus string `json:"membershipStatus"`
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


