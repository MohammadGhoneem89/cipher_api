
function createOrder(payload, UUIDKey, route, callback, JWToken) {
    console.log(payload, "payload")
    let response = {
        status = "ERROR",
        statusDescription: ""
    };
    const data = payload.body.order;

    if (data.orderType == undefined || !data.orderType.trim().length) {
        response.statusDescription = "orderType is required!";
        return callback(response);
    }
    if (data.orderType == "MASTER") {
        if (data.contractID == undefined || !data.contractID.trim().length) {
            response.statusDescription = "contractID is required!";
            return callback(response);
        }
    }
    if (data.items.length < 1) {
        response.statusDescription = "order item is required!";
        return callback(response);
    } else {
        let items = data.items;
        items.forEach(element => {
            if (element.itemCode == undefined || !element.itemCode.trim().length) {
                response.statusDescription = "itemCode is required!"
                return callback(response);
            }
            if (element.quantity <= 0) {
                response.statusDescription = "quantity cannot be zero!"
                return callback(response);
            }
            if (element.color.length < 1) {
                response.statusDescription = "item color is required!"
                return callback(response);
            }
        });
    }
    response.status = "OK";
    response.statusDescription = "Processed OK!";
    return callback(response);

}
exports.createOrder = createOrder;
