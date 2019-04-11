package main

type MSPList struct {
	OrgType string `json:"orgType"`
	MSP     string `json:"MSP"`
	ID      string `json:"ID"`
}
type BLANK struct {
	BLANK string `json:"BLANK"`
}
type  getDeclarationData struct{
	COONo string `json:"COONo"`
ModeOfTransport string `json:"modeOfTransport"`
ExitPoint string `json:"exitPoint"`
FinalShipmentDestination string `json:"finalShipmentDestination"`
PortOfDischarge string `json:"portOfDischarge"`
VesselName string `json:"vesselName"`
ProcessType string `json:"processType"`
ProcessingCountry string `json:"processingCountry"`
ExportDeclaration string `json:"exportDeclaration"`
PaymentMethod string `json:"paymentMethod"`
ExporterType string `json:"exporterType"`
MemeberNo string `json:"memeberNo"`
 }


