package main

type MSPList struct {
	OrgType string `json:"orgType"`
	MSP     string `json:"MSP"`
	ID      string `json:"ID"`
}
type BLANK struct {
	BLANK string `json:"BLANK"`
}
type addItemCatalogue struct {
	ItemCode       string `json:"itemCode"`
	Name           string `json:"name"`
	Description    string `json:"description"`
	Classification string `json:"classification"`
	ItemStatus     string `json:"itemStatus"`
	Image          string `json:"image"`
	Material       string `json:"material"`
	Price          string `json:"price"`
	LeadTime       string `json:"leadTime"`
	PrintTime      string `json:"printTime"`
	PartNumber     string `json:"partNumber"`
	ModelVolume    string `json:"modelVolume"`
	SupportVolume  string `json:"supportVolume"`
	ModelTip       string `json:"modelTip"`
	SupportTip     string `json:"supportTip"`
	Color          string `json:"color"`
	CreatedBy      string `json:"createdBy"`
}

type addMasterContract struct {
	ContractID     string `json:"contractID"`
	DateCreated    string `json:"dateCreated"`
	StartDate      string `json:"startDate"`
	EndDate        string `json:"endDate"`
	ApprovedBy     string `json:"approvedBy"`
	ApprovedOn     string `json:"approvedOn"`
	CustomerID     string `json:"customerID"`
	AmountRealized string `json:"amountRealized"`
	ShipmentType   string `json:"shipmentType"`
	Status         string `json:"status"`
	TotalPenalty   string `json:"totalPenalty"`
	TotalRebate    string `json:"totalRebate"`
}

type createInvoice struct {
	OrderID     string `json:"orderID"`
	InvoiceDate string `json:"invoiceDate"`
}

type createOrder struct {
	OrderType     string `json:"orderType"`
	ContractID    string `json:"contractID"`
	RaisedBy      string `json:"raisedBy"`
	QuoteValidity string `json:"quoteValidity"`
	IncoTerms     string `json:"incoTerms"`
}

type createSubOrder struct {
	OrderID     string `json:"orderID"`
	SubOrderID  string `json:"subOrderID"`
	SupplierID  string `json:"supplierID"`
	RaisedBy    string `json:"raisedBy"`
	OrderDate   string `json:"orderDate"`
	OrderAmount int64  `json:"orderAmount"`
}

type eventOnCreateOrder struct {
	OrderID   string `json:"orderID"`
	OldStatus string `json:"oldStatus"`
	NewStatus string `json:"newStatus"`
}

type eventOnInvoiceCreation struct {
	OrderID        string `json:"orderID"`
	ContractID     string `json:"contractID"`
	CustomerID     string `json:"customerID"`
	Status         string `json:"status"`
	OrderAmount    string `json:"orderAmount"`
	TotalQuantity  string `json:"totalQuantity"`
	TotalLeadTime  string `json:"totalLeadTime"`
	TotalPrintTime string `json:"totalPrintTime"`
	Discount       string `json:"discount"`
	Penalty        string `json:"penalty"`
}

type eventOnPaymentOrderCreation struct {
	OrderID   string `json:"orderID"`
	OldStatus string `json:"oldStatus"`
	NewStatus string `json:"newStatus"`
}

type eventOnPaymentOrderCreationCustomer struct {
	OrderID   string `json:"orderID"`
	OldStatus string `json:"oldStatus"`
	NewStatus string `json:"newStatus"`
}

type eventOnPurchaseOrder struct {
	OrderID   string `json:"orderID"`
	OldStatus string `json:"oldStatus"`
	NewStatus string `json:"newStatus"`
}

type eventOnPurchaseOrderCustomer struct {
	OrderID   string `json:"orderID"`
	OldStatus string `json:"oldStatus"`
	NewStatus string `json:"newStatus"`
}

type getMasterAgreementData struct {
	ContractID string `json:"contractID"`
}

type getOrderDetail struct {
	OrderID string `json:"orderID"`
}

type getOrderDetailCustomer struct {
	OrderID string `json:"orderID"`
}

type updateItemCatalogue struct {
	ItemCode       string `json:"itemCode"`
	Name           string `json:"name"`
	Description    string `json:"description"`
	Classification string `json:"classification"`
	ItemStatus     string `json:"itemStatus"`
	Image          string `json:"image"`
	Material       string `json:"material"`
	Price          string `json:"price"`
	LeadTime       string `json:"leadTime"`
	PrintTime      string `json:"printTime"`
	PartNumber     string `json:"partNumber"`
	ModelVolume    string `json:"modelVolume"`
	SupportVolume  string `json:"supportVolume"`
	ModelTip       string `json:"modelTip"`
	SupportTip     string `json:"supportTip"`
	Color          string `json:"color"`
	UpdatedBy      string `json:"updatedBy"`
}

type updateOrderStatus struct {
	OrderID string `json:"orderID"`
	Status  string `json:"status"`
}

type updateOrderStatusCustomer struct {
	OrderID string `json:"orderID"`
	Status  string `json:"status"`
}

type updateSubOrderStatus struct {
	SubOrderID string `json:"subOrderID"`
	OrderID    string `json:"orderID"`
	Status     string `json:"status"`
}
