var destinationPath = {
    entity: {
        pushPath: ["/name","/arabicName","/shortCode","/isActive"],
        popPath: ["/entityName/name","/arabicName","/shortCode","/isActive"]
    },
    acquirer: {
        pushPath: ["/name","/arabicName","/shortCode","/isActive"],
        popPath: ["/acquirerName/name","/arabicName","/shortCode","/isActive"]

    }
}

module.exports = destinationPath;