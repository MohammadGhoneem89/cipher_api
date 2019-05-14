const zipafolder = require('zip-a-folder');
const {join} = require('path')
const { SmartContract,NetworkConfig,Channel } = require("../../../../../../lib/models/index");
const rp = require('request-promise')
const config = require('../../../../../../config');
var fs = require('fs')
var fse = require("fs-extra")
var rimraf = require("rimraf");






 var policyPlaceholder = '{}'
 var totalDeployedAttribute = 2
 var dccDeployedAttr = 2
 var dpwDeployedAttr = 2
 var dcDeployedAttr = 3
 var dtDeployedAttr = 2

 let  channelID = ""
 let version = 0
 let apprrovedAttributeList = []
 let argumentList = []

    module.exports.reviseSmartContract = async function reviseSmartContract(payload) {
        
        // Copy Chaincode Template folder befor modification 
        try {
            await fse.copy(join(__dirname,'CcFiles_Template'), join(__dirname,'CcFiles'))
            console.log('success!')
        } catch (err) {
            console.error(err)
        }


        var eventData = payload.eventData
        //console.log(eventData)

        // Check version of smartContract
        if(eventData['version'] == "0" || eventData['version'] == ""){
            version = 0
        }else{
            version = parseInt(eventData['version'], 10)
        }
        
        //get SmartContract Local Path fro each Organization 
        var SmartContractLocalPath = new Array()
        //SmartContractLocalPath = eventData['smartContractLocalPath']

        console.log('========111========')
        if (eventData['addAttributeList']){
        console.log('========222========')
        //get the array of atrributes
        var attributes = new Array();
        attributes = eventData['addAttributeList']
        //get number of params for each organization
        getNumberOfParamsForEachOrg(attributes)
        console.log(totalDeployedAttribute)
        console.log(dccDeployedAttr)
        console.log(dpwDeployedAttr)
        console.log(dcDeployedAttr)
        console.log(dtDeployedAttr)
        console.log('attributes size :' + attributes.length)
        //#########################################################################################################
            // modify stuct.go file
        //#########################################################################################################
        //find the Approved Attribute
        for (var i = 0; i < attributes.length; i++) {
            console.log('========333========')
            var attribute = attributes[i]
            console.log(attribute)
            if (attribute['attributeStatus']){
                console.log('========444========')
                var attributeStatus = attribute['attributeStatus']
                if(attributeStatus == '002'){

                    // add approved attribute to a separate list to update its status later after Chaincode is revised 002 ==> 004
                    apprrovedAttributeList.push(attribute)

                    channelID = attribute['channel']
                    //this is the new attribute
                    //.
                    //.
                    // get other attribute details
                    var attributeDetails = getAttributeDetails(attribute)
                    console.log('========555========')
                    // if children == 0 ==> simple attribute type ==> just append it in the corresponding structrue
                    if(attributeDetails.type == 'string'|| attributeDetails.type == 'Date' || attributeDetails.type == 'int' || attributeDetails.type == 'bool'){
                        console.log('========55555========')
                        if(attributeDetails.occurrence == 'One' & attributeDetails.privacy == 'common'){
                            
                            string_One_Common(attributeDetails)
                            
                        }else if(attributeDetails.occurrence == 'Many' & attributeDetails.privacy == 'common'){
                            
                            string_Many_Common(attributeDetails)

                        }


                    }else if(attributeDetails.type == 'object' & attributeDetails.occurrence == 'One' & attributeDetails.privacy == 'common'){
                      
                        object_One_Common(attributeDetails)
                        
                    }else if(attributeDetails.type == 'object' & attributeDetails.occurrence == 'Many' & attributeDetails.privacy == 'common'){

                        object_Many_Common(attributeDetails)
                         
                    }
                    
                    
                }else if(attributeStatus == 4){
                    //this is deployed Attribute
                }else if(attributeStatus == 3){
                    //this is a rejected Attribute
                }else if(attributeStatus == 1){
                    //this is a pending Attribute
                }
            }
        }
        try{

            
            //Zip the chaincode folder 
            await zipafolder.zip(join(__dirname,'CcFiles'), join(__dirname , 'CcFiles_V'+version+'.zip') );

            
            
            let documents 
           
            //query SmartContract document 
            const smartCointractDoc = await SmartContract.findOne({"channelID":config.get('attributeConfig.channelID'),"smartContract" :config.get('attributeConfig.smartcontractName')}).lean(true).exec()
            console.log('smartcontarct is :', smartCointractDoc)
            
            if (smartCointractDoc) {
                documents = smartCointractDoc.documents
                if (documents) {
                    documents[0].documentName = 'CcFiles_V'+version+'.zip'
                    documents[0].retreivalPath = join(__dirname , 'CcFiles_V'+version+'.zip')
                }
            }
            version++ 
            
            // query Channel Document 
            console.log('=======> chaneelll' ,"smartCointractDoc.channelID")
            const channelDoc = await Channel.findOne({"_id":config.get('attributeConfig.channelID')}).lean(true).exec()
            console.log('Channel is :', channelDoc)
            console.log('xxxxxxxxxxxxxxxxxxxxxxx')

            // query Network Document 
            let peersIPs = []
            console.log('=======> Network' ,channelDoc.network)
            const networkDoc = await NetworkConfig.findOne({"_id":channelDoc.network}).lean(true).exec()
            console.log('Network is :', networkDoc)
            let peerList = networkDoc.peerList
            if (peerList) {
                for(i=0; i< peerList.length; i++){
                    let iP = ""
                    iP = peerList[i].requests
                    console.log(iP)
                    iP.replace("grpcs://", "");
                    console.log(iP)
                    peersIPs.push(iP)
                }
                console.log(peersIPs)
            }

            //call Install Chaincode API
            let options = {
                method: 'POST',
                url: config.get('attributeConfig.installChaincodeURL'),
                body:{
                
                    header: config.get('eventService.Avanza_ISC') || {
                        username: "Internal_API",
                        password: "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
                      },
                    "channelName":channelDoc.channelName,
                    "function": "0007",
                    "network":channelDoc.networkName,
                    "peerList":peersIPs,
                    "smartContractName":smartCointractDoc.smartContract,
                    "smartContractPackPath":documents[0].retreivalPath,
                    "smartContractVersion":version.toString()
                  
                },
                json: true
              };
            let response = await rp(options)
            console.log('Message ============> ' , response.HyperledgerConnect.data)
            let installSamrtContract= response.HyperledgerConnect.data.success
            let installSamrtContractMessage= response.HyperledgerConnect.data.message

            // If samrtContract installed successfully ==> then call Update Attribute API
            if(installSamrtContract){

                //call Update Attribute API
                //prepare list of parameters
                for(var i = 0; i< apprrovedAttributeList.length; i++){
                    var approvedAttribute = apprrovedAttributeList[i]
                    var orgList = approvedAttribute['orgList']
                    
                    var argumentObject1 = {
                        uuid: approvedAttribute['attributeUUID'],
                        regAuth: approvedAttribute['regAuth'],
                        status: "004",
                        orgCode: "DPW"

                    }
                    argumentList.push(argumentObject1)
                    //console.log('Update Call =======> ',argumentList)
                }
                
                // Prepare SmartContractLocalPath Object 
                var samrtContractPath = {
                    orgCode: "DPW",
                    path: join(__dirname , 'CcFiles_V'+version+'.zip'),
                    version: version
                }
                SmartContractLocalPath.push(samrtContractPath)
                
                //Prepare request 
                let options1 = {
                    method: 'POST',
                    url: config.get('attributeConfig.updateAttributeURL'),
                    body:{
                    
                        header: config.get('eventService.Avanza_ISC') || {
                            username: "Internal_API",
                            password: "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
                            },

                        body: {
                            "argumentList":argumentList,
                            "smartContractLocalPath": SmartContractLocalPath
                        }
                    },
                    json: true
                    };
                let updateResponse = await rp(options1)
                console.log('Options ==============> ' , options1)
                console.log('updateResponse ==============> ' , updateResponse.errorCode)
                console.log('argumentList ==============> ', argumentList)

                if(updateResponse.errorCode != '200' ){
                    throw updateResponse.errorDescription
                } 

            }else{
                console.log('XXXX=====XXXX')
                //throw new Error(installSamrtContractMessage)
                throw installSamrtContractMessage
            }
                
                
            console.log('Update argumentList ========> ' ,argumentList)




            //Update the Smart Contract in MongoDB
            var myquery = { "channelID":config.get('attributeConfig.channelID'),"smartContract" : config.get('attributeConfig.smartcontractName') };
            var newvalues = { $set: {smartContractVersion: version.toString(),documents:documents } };
            const smartCointractDoc1 = await SmartContract.updateOne(myquery, newvalues); 


            console.log('111111111')
            //return "Success"
        } catch (err) {
            console.log(err)
            throw err
        }


    }


    
    
  }

  module.exports.deploySmartContract = async function deploySmartContract(payload) {
    var eventData = payload.eventData
    let installedAttributeList = []
    let channelId = ''
    //console.log(eventData)
    version = parseInt(eventData['version'], 10) 
    console.log('========111========')
    if (eventData['addAttributeList']){
        console.log('========222========')
        //get the array of atrributes
        var attributes = new Array();
        attributes = eventData['addAttributeList']
        //find the Installed Attribute
        for (var i = 0; i < attributes.length; i++) {
            console.log('========333========')
            var attribute = attributes[i]
            console.log(attribute)
            if (attribute['attributeStatus']){
                console.log('========444========')
                var attributeStatus = attribute['attributeStatus']
                if(attributeStatus == '004'){
                    installedAttributeList.push(attribute)
                    channelId = attribute['channel']
                }
            }
        } 
    }

    let deploySamrtContract= false
    let deploySamrtContractMessage= ""

    try{
        
        //query SmartContract document 
        const smartContractDoc = await SmartContract.findOne({"channelID":config.get('attributeConfig.channelID'),"smartContract" : config.get('attributeConfig.smartcontractName')}).lean(true).exec()
        console.log('smartcontarct is :', smartContractDoc)
        
        

        // query Channel Document 
        console.log('=======> chaneelll' ,"smartCointractDoc.channelID")
        const channelDoc = await Channel.findOne({"_id":config.get('attributeConfig.channelID')}).lean(true).exec()
        console.log('Channel is :', channelDoc)
        console.log('xxxxxxxxxxxxxxxxxxxxxxx')

        // query Network Document 
        let peersIPs = []
        console.log('=======> Network' ,channelDoc.network)
        const networkDoc = await NetworkConfig.findOne({"_id":channelDoc.network}).lean(true).exec()
        console.log('Network is :', networkDoc)
        let peerList = networkDoc.peerList
        if (peerList) {
            for(i=0; i< peerList.length; i++){
                let iP = ""
                iP = peerList[i].requests
                console.log(iP)
                iP.replace("grpcs://", "");
                console.log(iP)
                peersIPs.push(iP)
            }
            console.log(peersIPs)
        }



        //check if smartContract document is fetched 
        if (smartContractDoc) {
            if(smartContractDoc.smartContractVersion == "0"){
                // Instantiate smart contract 
                //call Instantiate Chaincode API
                let options = {
                    method: 'POST',
                    url: config.get('attributeConfig.installChaincodeURL'),
                    body:{
                    
                        header: config.get('eventService.Avanza_ISC') || {
                            username: "Internal_API",
                            password: "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
                        },
                        "channelName":channelDoc.channelName,
                        "endorsementPolicy": [],
                        "function": "0008",
                        "network":channelDoc.networkName,
                        "peerList":peersIPs,
                        "smartContractArgs": smartContractDoc.smartContractArgs,
                        "smartContractMethod": "init",
                        "smartContractName":smartContractDoc.smartContract,
                        "smartContractVersion":version.toString()
                    
                    },
                    json: true
                };
                let response = await rp(options)
                
                console.log(response)
                deploySamrtContract = response.HyperledgerConnect.data.success
                deploySamrtContractMessage = response.HyperledgerConnect.data.message

            }else{
                // Upgrade smartContract 
                //call Upgrade Chaincode API
                let options = {
                    method: 'POST',
                    url: config.get('attributeConfig.installChaincodeURL'),
                    body:{
                    
                        header: config.get('eventService.Avanza_ISC') || {
                            username: "Internal_API",
                            password: "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
                        },
                        "actionType": "UPGRADE",
                        "channelName":channelDoc.channelName,
                        "endorsementPolicy": [],
                        "function": "0008",
                        "network":channelDoc.networkName,
                        "peerList":["23.97.138.116:7051"],
                        "smartContractArgs": smartContractDoc.smartContractArgs,
                        "smartContractMethod": "init",
                        "smartContractName":smartContractDoc.smartContract,
                        "smartContractVersion":version.toString()
                    
                    },
                    json: true
                };
                let response = await rp(options)
                
                console.log(response)
                deploySamrtContract = response.HyperledgerConnect.data.success
                deploySamrtContractMessage = response.HyperledgerConnect.data.message

            }
        }


        if(deploySamrtContract){
            //call Update Attribute API
            //prepare list of parameters
            for(var i = 0; i< installedAttributeList.length; i++){
                var approvedAttribute = apprrovedAttributeList[i]
                var orgList = approvedAttribute['orgList']
                var argumentObject1 = {
                    uuid: approvedAttribute['attributeUUID'],
                    regAuth: approvedAttribute['regAuth'],
                    status: 005,
                    orgCode: "JAFZA"

                }
                argumentList.push(JSON.stringify(argumentObject1))

                argumentObject1.orgCode = "DPW"
                argumentList.push(JSON.stringify(argumentObject1))
                
                argumentObject1.orgCode = "DT"
                argumentList.push(JSON.stringify(argumentObject1))

                argumentObject1.orgCode = "DC"
                argumentList.push(JSON.stringify(argumentObject1))

                argumentObject1.orgCode = "DCC"
                argumentList.push(JSON.stringify(argumentObject1))
            }
                
            //Prepare request 
            let options = {
                method: 'POST',
                url: config.get('attributeConfig.updateAttributeURL'),
                body:{
                
                    header: config.get('eventService.Avanza_ISC') || {
                        username: "Internal_API",
                        password: "c71d32c49f38afe2547cfef7eb78801ee7b8f95abc80abba207509fdd7cd5f59d11688235df3c97ceef5652b5ac8d8980cb5bc621a32c906cbdd8f5a94858cc9"
                        },
                    "argumentList":argumentList,
                    
                },
                json: true
                };
            let updateResponse = await rp(options)
            
            console.log('updateResponse =========>',updateResponse)

            if(updateResponse.errorCode != '200' ){
                throw updateResponse.errorDescription
            } 

        }else{
            throw deploySamrtContractMessage
        }
    

        return "Success"  

    }catch (err){
       throw err
    }
}


function string_One_Common(attributeDetails){
    var Name = capitalizeFirstLetter(attributeDetails.name)
    var Type = attributeDetails.type
    // sample ==> UnifiedID    string   `json:"unifiedID"`  
    var structField = '' 
    structField = Name + ' ' + Type + ' ' + '`json:\"'+ lowerCaseFirstLetter(attributeDetails.name) +'\"`\n'

    if(attributeDetails.dataProvider == 'JAFZA'){
        structField += '//<<RegAuth Struct field placeholder>>'
        // Update the struct.go file
        replacePlaceholderSync(join(__dirname,'CcFiles/struct.go') ,'//<<RegAuth Struct field placeholder>>', structField) 
        
        //update the main.go file 
        // 1- prepare parameter handeling in main structrure 
        // sample ==> UnifiedID:    sanitize(args[0], "string").(string),
        var paramNew = ''
        paramNew = capitalizeFirstLetter(attributeDetails.name)
        paramNew += ': sanitize(args['
        paramNew += totalDeployedAttribute
        paramNew += '], \"'
        paramNew += attributeDetails.type
        paramNew += '\").('
        paramNew += attributeDetails.type
        paramNew += '),\n'
        paramNew += '//<<RegAuth Struct field placeholder>>'
        replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<RegAuth Struct field placeholder>>',paramNew)
        totalDeployedAttribute++
        
        // 1- prepare Field handeling in main structrure for new document case 
        // syntax example ==> UnifiedID:    unifiedRegParams.UnifiedID,

        paramNew = capitalizeFirstLetter(attributeDetails.name)
        paramNew += ': unifiedRegParams.'
        paramNew += capitalizeFirstLetter(attributeDetails.name)
        paramNew += ',\n'
        paramNew += '//<<RegAuth Struct newField placeholder>>'
        replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<RegAuth Struct newField placeholder>>',paramNew)


        // sample ==> unifiedRegDataAsJSON.UnifiedID = unifiedRegParams.UnifiedID
        var paramExist =''
        paramExist = 'unifiedRegDataAsJSON.'
        paramExist += capitalizeFirstLetter(attributeDetails.name)
        paramExist += ' = unifiedRegParams.'
        paramExist += capitalizeFirstLetter(attributeDetails.name)
        paramExist += '\n' 
        paramExist += '//<<RegAuth Struct fieldExist placeholder>>'
        replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<RegAuth Struct fieldExist placeholder>>',paramExist)

    }else if(attributeDetails.dataProvider == 'DPW'){
        structField += '//<<DPW Struct field placeholder>>'
        // Update the struct.go file
        replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<<DPW Struct field placeholder>>', structField) 

        //update the main.go file 
        
        // 1- prepare parameter handeling in main structrure
        // sample ==>  FormationNo:  "",
        var paramNew = ''
        paramNew = capitalizeFirstLetter(attributeDetails.name)
        
        if (attributeDetails.type == "string") {
            paramNew += ': "", \n'
        }else if (attributeDetails.type == "bool"){
            paramNew += ': false, \n'
        }else if (attributeDetails.type == "int"){
            paramNew += ': 0, \n'
        }
        
        paramNew += '//<<DPW Struct field placeholder>>'
        replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DPW Struct field placeholder>>',paramNew)

        // 1- prepare parameter handeling in main structrure
        // sample ==>  UnifiedID:    unifiedRegParams.UnifiedID,
        paramNew = capitalizeFirstLetter( attributeDetails.name)
        paramNew += ': unifiedRegParams.'
        paramNew += capitalizeFirstLetter( attributeDetails.name)
        paramNew += ', \n'
        paramNew += '//<<DPW Struct newField placeholder>>'
        replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DPW Struct newField placeholder>>',paramNew)

        // 2- prepare parameter handling in organization structure 
        // syntax example ==> GroupBuisnessName:    sanitize(args[3], "string").(string),
        var orgStrcutParam = ''
        orgStrcutParam = capitalizeFirstLetter(attributeDetails.name)
        orgStrcutParam += ': sanitize(args['
        orgStrcutParam += dpwDeployedAttr
        orgStrcutParam += '], \"'
        orgStrcutParam += attributeDetails.type
        orgStrcutParam += '\").('
        orgStrcutParam += attributeDetails.type
        orgStrcutParam += '),\n'
        orgStrcutParam += '//<<add parameter to the structre of DPW>>'
        replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<add parameter to the structre of DPW>>',orgStrcutParam)
        dpwDeployedAttr++

        //3- apdate the field in the main structure with organization value (DP wprld)
        //syntax example ==> unifiedRegDataAsJSON.UndertakingFromOwner = postDataToBlockchainPORT.UndertakingFromOwner
        var updateMainStuctfield = ''
        updateMainStuctfield = 'unifiedRegDataAsJSON.'
        updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
        updateMainStuctfield += ' = postDataToBlockchainPORT.'
        updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
        updateMainStuctfield += '\n //<<update the field of main structure with DPW field>>'
        replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<update the field of main structure with DPW field>>',updateMainStuctfield)

    }else if(attributeDetails.dataProvider == 'DCC'){
        structField += '//<<Chamber Struct field placeholder>>'
        // Update the struct.go file
        replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<<Chamber Struct field placeholder>>', structField) 

        //update the main.go file 
        // 1- prepare parameter handeling in main structrure
        // sample ==>  FormationNo:  "",
        var paramNew = ''
        paramNew = capitalizeFirstLetter(attributeDetails.name)
        paramNew += ': "", \n'
        paramNew += '//<<Chamber Struct field placeholder>>'
        replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<Chamber Struct field placeholder>>',paramNew)

        // 1- prepare parameter handeling in main structrure
        // sample ==>  UnifiedID:    unifiedRegParams.UnifiedID,
        paramNew = capitalizeFirstLetter( attributeDetails.name)
        paramNew += ': unifiedRegParams.'
        paramNew += capitalizeFirstLetter( attributeDetails.name)
        paramNew += ', \n'
        paramNew += '//<<Chamber Struct newField placeholder>>'
        replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<Chamber Struct newField placeholder>>',paramNew)

        // 2- prepare parameter handling in organization structure 
        // syntax example ==> GroupBuisnessName:    sanitize(args[3], "string").(string),
        var orgStrcutParam = ''
        orgStrcutParam = capitalizeFirstLetter(attributeDetails.name)
        orgStrcutParam += ': sanitize(args['
        orgStrcutParam += dccDeployedAttr
        orgStrcutParam += '], \"'
        orgStrcutParam += attributeDetails.type 
        orgStrcutParam += '\").('
        orgStrcutParam += attributeDetails.type
        orgStrcutParam += '),\n'
        orgStrcutParam += '//<<add parameter to the structre of DubaiChamber>>'
        replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<add parameter to the structre of DubaiChamber>>',orgStrcutParam)
        dccDeployedAttr++

        //3- apdate the field in the main structure with organization value (DP wprld)
        //syntax example ==> unifiedRegDataAsJSON.UndertakingFromOwner = postDataToBlockchainCHAMBEROFCOMM.UndertakingFromOwner
        var updateMainStuctfield = ''
        updateMainStuctfield = 'unifiedRegDataAsJSON.'
        updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
        updateMainStuctfield += ' = postDataToBlockchainCHAMBEROFCOMM.'
        updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
        updateMainStuctfield += '\n //<<update the field of main structure with DubaiChamber field>>'
        replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<update the field of main structure with DubaiChamber field>>',updateMainStuctfield)

    }else if(attributeDetails.dataProvider == 'DT'){
        structField += '//<<DubaiTrade Struct field placeholder>>'
        // Update the struct.go file
        replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<<DubaiTrade Struct field placeholder>>', structField)

        //update the main.go file 
        // 1- prepare parameter handeling in main structrure
        // sample ==>  FormationNo:  "",
        var paramNew = ''
        paramNew = attributeDetails.name
        paramNew += ': "", \n'
        paramNew += '//<<DubaiTrade Struct field placeholder>>'
        replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DubaiTrade Struct field placeholder>>',paramNew)

        // 1- prepare parameter handeling in main structrure
        // sample ==>  UnifiedID:    unifiedRegParams.UnifiedID,
        paramNew = capitalizeFirstLetter( attributeDetails.name)
        paramNew += ': unifiedRegParams.'
        paramNew += capitalizeFirstLetter( attributeDetails.name)
        paramNew += ', \n'
        paramNew += '//<<DubaiTrade Struct newField placeholder>>'
        replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DubaiTrade Struct newField placeholder>>',paramNew)

        // 2- prepare parameter handling in organization structure 
        // syntax example ==> GroupBuisnessName:    sanitize(args[3], "string").(string),
        var orgStrcutParam = ''
        orgStrcutParam = capitalizeFirstLetter(attributeDetails.name)
        orgStrcutParam += ': sanitize(args['
        orgStrcutParam += dtDeployedAttr
        orgStrcutParam += '], \"'
        orgStrcutParam += attributeDetails.type
        orgStrcutParam += '\").('
        orgStrcutParam += attributeDetails.type
        orgStrcutParam += '),\n' 
        orgStrcutParam += '//<<add parameter to the structre of DubaiTrade>>'
        replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<add parameter to the structre of DubaiTrade>>',orgStrcutParam)
        dtDeployedAttr++

        //3- apdate the field in the main structure with organization value (DP wprld)
        //syntax example ==> unifiedRegDataAsJSON.UndertakingFromOwner = postDataToBlockchainTRADE.UndertakingFromOwner
        var updateMainStuctfield = ''
        updateMainStuctfield = 'unifiedRegDataAsJSON.'
        updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
        updateMainStuctfield += ' = postDataToBlockchainTRADE.'
        updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
        updateMainStuctfield += '\n //<<update the field of main structure with DubaiTrade field>>'
        replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<update the field of main structure with DubaiTrade field>>',updateMainStuctfield)
        

    }else if(attributeDetails.dataProvider == 'DC'){
        structField += '//<<DubaiCustoms Struct field placeholder>>'
        // Update the struct.go file
        replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<<DubaiCustoms Struct field placeholder>>', structField)

        //update the main.go file 
        // 1- prepare parameter handeling in main structrure
        // sample ==>  FormationNo:  "",
        var paramNew = ''
        paramNew = capitalizeFirstLetter(attributeDetails.name)
        paramNew += ': "", \n'
        paramNew += '//<<DubaiCustoms Struct field placeholder>>'
        replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DubaiCustoms Struct field placeholder>>',paramNew)

        // 1- prepare parameter handeling in main structrure
        // sample ==>  UnifiedID:    unifiedRegParams.UnifiedID,
        paramNew = capitalizeFirstLetter( attributeDetails.name)
        paramNew += ': unifiedRegParams.'
        paramNew += capitalizeFirstLetter( attributeDetails.name)
        paramNew += ', \n'
        paramNew += '//<<DubaiCustoms Struct newField placeholder>>'
        replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DubaiCustoms Struct newField placeholder>>',paramNew)

        // 2- prepare parameter handling in organization structure 
        // syntax example ==> GroupBuisnessName:    sanitize(args[3], "string").(string),
        var orgStrcutParam = ''
        orgStrcutParam = capitalizeFirstLetter(attributeDetails.name)
        orgStrcutParam += ': sanitize(args['
        orgStrcutParam += dcDeployedAttr
        orgStrcutParam += '], \"'
        orgStrcutParam += attributeDetails.type
        orgStrcutParam += '\").('
        orgStrcutParam += attributeDetails.type
        orgStrcutParam += '),\n' 
        orgStrcutParam += '//<<add parameter to the structre of DubaiCustoms>>'
        replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<add parameter to the structre of DubaiCustoms>>',orgStrcutParam)
        dcDeployedAttr++

        //3- apdate the field in the main structure with organization value (DP wprld)
        //syntax example ==> unifiedRegDataAsJSON.UndertakingFromOwner = postDataToBlockchainCustoms.UndertakingFromOwner
        var updateMainStuctfield = ''
        updateMainStuctfield = 'unifiedRegDataAsJSON.'
        updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
        updateMainStuctfield += ' = postDataToBlockchainCustoms.'
        updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
        updateMainStuctfield += '\n //<<update the field of main structure with DubaiCustoms field>>'
        replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<update the field of main structure with DubaiCustoms field>>',updateMainStuctfield)
    }
}

function string_Many_Common(attributeDetails){
    console.log('========666========')
    var result = ''
    //prepare the struct 
    var struct = ''
    struct = 'type' + ' ' + capitalizeFirstLetter(attributeDetails.name)  + ' ' + 'struct {\n'
    for(var i =0; i< attributeDetails.children.length; i++){
        var child =  attributeDetails.children[i]
        var childName = capitalizeFirstLetter(child['name'])
        console.log('========666========')
        var childType = child['type']
        struct += childName + ' ' + childType + ' ' + '`json:\"'+ lowerCaseFirstLetter(childName) +'\"`\n'
    }
    struct += '}\n'
    struct += '//<< New struct placeholder>>'
    console.log('========777========')
    console.log(struct)

    //now append the new structure as a field in the main structure of corresponding organization
    var fieldName = capitalizeFirstLetter(attributeDetails.name) 
    var fieldType = attributeDetails.type
    var structField = '' 
    // sample ==> ContactDPW     []Contacts   `json:"contactDPW"`
    structField = fieldName + ' []' + fieldType + ' ' + '`json:\"'+ lowerCaseFirstLetter(fieldName) +'\"`\n'

    if(attributeDetails.dataProvider == 'JAFZA'){
        structField += '//<<RegAuth Struct field placeholder>>'
        // Update the struct.go file
        //replacePlaceholder('./CcFiles/struct.go','//<<struct field placeholder>>', structField) 
        replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<<RegAuth Struct field placeholder>>', structField)
        replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<< New struct placeholder>>', struct) 
        
        
        //Update the main.go file 
            // 1- prepare parameter handling in organization structure 
            var orgParamUnmarshling = ''
            orgParamUnmarshling = 'var '
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ' []'
            orgParamUnmarshling += attributeDetails.type
            orgParamUnmarshling += '\n'
            orgParamUnmarshling += 'err = json.Unmarshal([]byte(args['
            orgParamUnmarshling += totalDeployedAttribute
            orgParamUnmarshling += ']), &'
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ')\n'
            orgParamUnmarshling += `if err != nil {
                fmt.Printf("%s", err)
                return shim.Error("Invalid Argument !!!!!!" + err.Error())
            }\n`
            orgParamUnmarshling += '//<<JAFZA param unmarshaling placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<JAFZA param unmarshaling placeholder>>',orgParamUnmarshling)
            totalDeployedAttribute++

            // 2- add parameter in the structure 
            // sample ==> PassportCopy:              passportCopy,        
            var orgStructField = ''
            orgStructField = capitalizeFirstLetter(attributeDetails.name)
            orgStructField += ': '
            orgStructField += attributeDetails.name
            orgStructField += ',\n'
            orgStructField += '//<<RegAuth Struct field placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<RegAuth Struct field placeholder>>',orgStructField)


            // 2- add parameter in the structure  for new Document case 
            // sample ==> PassportCopy:              passportCopy,  
            // sample ==> UnifiedID:    unifiedRegParams.UnifiedID,      
            var orgStructField1 = ''
            orgStructField1 = capitalizeFirstLetter(attributeDetails.name)
            orgStructField1 += ': unifiedRegParams.'
            orgStructField1 += capitalizeFirstLetter(attributeDetails.name)
            orgStructField1 += ',\n'
            orgStructField1 += '//<<RegAuth Struct newField placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<RegAuth Struct newField placeholder>>',orgStructField1)

            

            //3- apdate the field in the main structure for update case 
            //syntax example ==> unifiedRegDataAsJSON.PassportCopy = passportCopy
            // sample ==> unifiedRegDataAsJSON.UnifiedID = unifiedRegParams.UnifiedID
            var updateMainStuctfield = ''
            updateMainStuctfield = 'unifiedRegDataAsJSON.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += ' = unifiedRegParams.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += '\n //<<RegAuth Struct fieldExist placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<RegAuth Struct fieldExist placeholder>>',updateMainStuctfield)
        
    }else if(attributeDetails.dataProvider == 'DPW'){
       
        structField += '//<<DPW Struct field placeholder>>'
        console.log('========888========')
        console.log(structField)
        // Update the struct.go file
        replacePlaceholderSync(require('path').join(__dirname,'CcFiles/struct.go'),'//<<DPW Struct field placeholder>>', structField)
        replacePlaceholderSync(require('path').join(__dirname,'CcFiles/struct.go'),'//<< New struct placeholder>>', struct) 
        console.log('========999========')

        //update the main.go file 
            // 1- prepare parameter handeling in main structrure
            // sample ==> ContactCustoms:       nil,
            var paramNew = ''
            paramNew = capitalizeFirstLetter(attributeDetails.name)
            paramNew += ': nil,\n'
            paramNew += '//<<DPW Struct field placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DPW Struct field placeholder>>',paramNew)
            console.log('========101010========')

            // 1- prepare parameter handeling in main structrure
            // sample ==> Key:          unifiedRegParams.Key,
            var paramNew1 = ''
            paramNew1 = capitalizeFirstLetter(attributeDetails.name)
            paramNew1 += ': unifiedRegParams.'
            paramNew1 += capitalizeFirstLetter(attributeDetails.name)
            paramNew1 += ', \n'
            paramNew1 += '//<<DPW Struct newField placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DPW Struct newField placeholder>>',paramNew1)

            
            // 2- prepare parameter handling in organization structure 
            var orgParamUnmarshling = ''
            orgParamUnmarshling = 'var '
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ' []'
            orgParamUnmarshling += attributeDetails.type
            orgParamUnmarshling += '\n'
            orgParamUnmarshling += 'err = json.Unmarshal([]byte(args['
            orgParamUnmarshling += dpwDeployedAttr
            orgParamUnmarshling += ']), &'
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ')\n'
            orgParamUnmarshling += `if err != nil {
                fmt.Printf("%s", err)
                return shim.Error("Invalid Argument !!!!!!" + err.Error())
            }\n`
            orgParamUnmarshling += '//<<DPW param unmarshaling placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DPW param unmarshaling placeholder>>',orgParamUnmarshling)
            dpwDeployedAttr++

            
            // 3- add parameter in the structure 
            // sample ==> Contacts:             contacts,        
            var orgStructField = ''
            orgStructField = capitalizeFirstLetter(attributeDetails.name)
            orgStructField += ': '
            orgStructField += attributeDetails.name
            orgStructField += ',\n'
            orgStructField += '//<<add parameter to the structre of DPW>>'
            replacePlaceholderSync(require('path').join(__dirname,'CcFiles/main.go'),'//<<add parameter to the structre of DPW>>',orgStructField)


            //4- apdate the field in the main structure with organization value (Dubai Customs)
            //syntax example ==> unifiedRegDataAsJSON.NonVATCustomer = postDataToBlockchainPORT.NonVATCustomer
            var updateMainStuctfield = ''
            updateMainStuctfield = 'unifiedRegDataAsJSON.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += ' = postDataToBlockchainPORT.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += '\n //<<update the field of main structure with DPW field>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<update the field of main structure with DPW field>>',updateMainStuctfield)
            console.log('========11 11 11========')
    }else if(attributeDetails.dataProvider == 'DCC'){
        structField += '//<<Chamber Struct field placeholder>>'
        // Update the struct.go file
        replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<<Chamber Struct field placeholder>>', structField)
        replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<< New struct placeholder>>', struct)

        //update the main.go file 
            // 1- prepare parameter handeling in main structrure
            // sample ==> ContactCustoms:       nil,
            var paramNew = ''
            paramNew = capitalizeFirstLetter(attributeDetails.name)
            paramNew += ': nil,\n'
            paramNew += '//<<Chamber Struct field placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<Chamber Struct field placeholder>>',paramNew)

            // 2- prepare parameter handling in organization structure 
            var orgParamUnmarshling = ''
            orgParamUnmarshling = 'var '
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ' []'
            orgParamUnmarshling += attributeDetails.type
            orgParamUnmarshling += '\n'
            orgParamUnmarshling += 'err = json.Unmarshal([]byte(args['
            orgParamUnmarshling += dccDeployedAttr
            orgParamUnmarshling += ']), &'
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ')\n'
            orgParamUnmarshling += `if err != nil {
                fmt.Printf("%s", err)
                return shim.Error("Invalid Argument !!!!!!" + err.Error())
            }\n`
            orgParamUnmarshling += '//<<DCC param unmarshaling placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DCC param unmarshaling placeholder>>',orgParamUnmarshling)
            dccDeployedAttr++

            
            // 3- add parameter in the structure 
            // sample ==> Contacts:             contacts,        
            var orgStructField = ''
            orgStructField = capitalizeFirstLetter(attributeDetails.name)
            orgStructField += ': '
            orgStructField += attributeDetails.name
            orgStructField += ',\n'
            orgStructField += '//<<add parameter to the structre of DubaiChamber>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<add parameter to the structre of DubaiChamber>>',orgStructField)


            //4- apdate the field in the main structure with organization value (Dubai Customs)
            //syntax example ==> unifiedRegDataAsJSON.MembershipStatus = PostDataToBlockchainChamber.MembershipStatus
            var updateMainStuctfield = ''
            updateMainStuctfield = 'unifiedRegDataAsJSON.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += ' = PostDataToBlockchainChamber.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += '\n //<<update the field of main structure with DubaiChamber field>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<update the field of main structure with DubaiChamber field>>',updateMainStuctfield)

    }else if(attributeDetails.dataProvider == 'DT'){
        structField += '//<<DubaiTrade Struct field placeholder>>'
        // Update the struct.go file
        replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<<DubaiTrade Struct field placeholder>>', structField)
        replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<< New struct placeholder>>', struct)

        //update the main.go file 
            // 1- prepare parameter handeling in main structrure
            // sample ==> ContactCustoms:       nil,
            var paramName = capitalizeFirstLetter(attributeDetails.name)
            var paramType = attributeDetails.type
            var paramNew = ''
            paramNew = paramName
            paramNew += ': nil,\n'
            paramNew += '//<<DubaiTrade Struct field placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DubaiTrade Struct field placeholder>>',paramNew)

            
            // 2- prepare parameter handling in organization structure 
            var orgParamUnmarshling = ''
            orgParamUnmarshling = 'var '
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ' []'
            orgParamUnmarshling += attributeDetails.type
            orgParamUnmarshling += '\n'
            orgParamUnmarshling += 'err = json.Unmarshal([]byte(args['
            orgParamUnmarshling += dtDeployedAttr
            orgParamUnmarshling += ']), &'
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ')\n'
            orgParamUnmarshling += `if err != nil {
                fmt.Printf("%s", err)
                return shim.Error("Invalid Argument !!!!!!" + err.Error())
            }\n`
            orgParamUnmarshling += '//<<DT param unmarshaling placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DT param unmarshaling placeholder>>',orgParamUnmarshling)
            dtDeployedAttr++

            
            // 3- add parameter in the structure 
            // sample ==> Contacts:             contacts,        
            var orgStructField = ''
            orgStructField = capitalizeFirstLetter(attributeDetails.name)
            orgStructField += ': '
            orgStructField += attributeDetails.name
            orgStructField += ',\n'
            orgStructField += '//<<add parameter to the structre of DubaiTrade>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<add parameter to the structre of DubaiTrade>>',orgStructField)


            //4- apdate the field in the main structure with organization value (Dubai Customs)
            //syntax example ==> unifiedRegDataAsJSON.VATAccountNo = postDataToBlockchainDubaiTrade.VATAccountNo
            var updateMainStuctfield = ''
            updateMainStuctfield = 'unifiedRegDataAsJSON.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += ' = postDataToBlockchainDubaiTrade.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += '\n //<<update the field of main structure with DubaiTrade field>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<update the field of main structure with DubaiTrade field>>',updateMainStuctfield)

    }else if(attributeDetails.dataProvider == 'DC'){
        structField += '//<<DubaiCustoms Struct field placeholder>>'
        // Update the struct.go file
        //replaceTwoPlaceholder('./CcFiles/struct.go','//<<DubaiCustoms Struct field placeholder>>', structField,'//<< New struct placeholder>>',struct)
        replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<<DubaiCustoms Struct field placeholder>>', structField)
        replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<< New struct placeholder>>', struct)


        //update the main.go file 
            // 1- prepare parameter handeling in main structrure
            // sample ==> ContactCustoms:       nil,
            var paramName = capitalizeFirstLetter(attributeDetails.name)
            var paramType = attributeDetails.type
            var paramNew = ''
            paramNew = paramName
            paramNew += ': nil,\n'
            paramNew += '//<<DubaiCustoms Struct field placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DubaiCustoms Struct field placeholder>>',paramNew)

            
            // 2- prepare parameter handling in organization structure 
            var orgParamUnmarshling = ''
            orgParamUnmarshling = 'var '
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ' []'
            orgParamUnmarshling += attributeDetails.type
            orgParamUnmarshling += '\n'
            orgParamUnmarshling += 'err = json.Unmarshal([]byte(args['
            orgParamUnmarshling += dcDeployedAttr
            orgParamUnmarshling += ']), &'
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ')\n'
            orgParamUnmarshling += `if err != nil {
                fmt.Printf("%s", err)
                return shim.Error("Invalid Argument !!!!!!" + err.Error())
            }\n`
            orgParamUnmarshling += '//<<DC param unmarshaling placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DC param unmarshaling placeholder>>',orgParamUnmarshling)
            dcDeployedAttr++

            
            // 3- add parameter in the structure 
            // sample ==> Contacts:             contacts,        
            var orgStructField = ''
            orgStructField = capitalizeFirstLetter(attributeDetails.name)
            orgStructField += ': '
            orgStructField += attributeDetails.name
            orgStructField += ',\n'
            orgStructField += '//<<add parameter to the structre of DubaiCustoms>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<add parameter to the structre of DubaiCustoms>>',orgStructField)


            //4- apdate the field in the main structure with organization value (Dubai Customs)
            //syntax example ==> unifiedRegDataAsJSON.VATAccountNo = postDataToBlockchainDubaiTrade.VATAccountNo
            var updateMainStuctfield = ''
            updateMainStuctfield = 'unifiedRegDataAsJSON.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += ' = postDataToBlockchainCustoms.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += '\n //<<update the field of main structure with DubaiCustoms field>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<update the field of main structure with DubaiCustoms field>>',updateMainStuctfield)
            

    }
}


function object_One_Common(attributeDetails){
    var result = ''
    //prepare the struct 
    var struct = ''
    struct = 'type' + ' ' + capitalizeFirstLetter(attributeDetails.name)  + ' ' + 'struct {\n'
    for(var i =0; i< attributeDetails.children.length; i++){
        var child =  attributeDetails.children[i]
        var childName = capitalizeFirstLetter(child['name'])
        console.log('========666========')
        var childType = child['type']
        struct += childName + ' ' + childType + ' ' + '`json:\"'+ lowerCaseFirstLetter(childName) +'\"`\n'
        }
        struct += '}\n'
        struct += '//<< New struct placeholder>>'
        console.log('========777========')
        console.log(struct)

        //now append the new structure as a field in the main structure of corresponding organization
        var fieldName = capitalizeFirstLetter(attributeDetails.name) 
        var fieldType = capitalizeFirstLetter(attributeDetails.name) 
        var structField = '' 
        structField = fieldName + ' ' + fieldType + ' ' + '`json:\"'+ lowerCaseFirstLetter(fieldName) +'\"`\n'

        if(attributeDetails.dataProvider == 'JAFZA'){
            structField += '//<<RegAuth Struct field placeholder>>'
            // Update the struct.go file
            //replacePlaceholder('./CcFiles/struct.go','//<<struct field placeholder>>', structField) 
            replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<<RegAuth Struct field placeholder>>', structField)
            replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<< New struct placeholder>>', struct) 


            //Update the main.go file 
            
            // 1- prepare parameter handling in organization structure 
            var orgParamUnmarshling = ''
            orgParamUnmarshling = 'var '
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ' '
            orgParamUnmarshling += capitalizeFirstLetter(attributeDetails.name)
            orgParamUnmarshling += '\n'
            orgParamUnmarshling += 'err = json.Unmarshal([]byte(args['
            orgParamUnmarshling += totalDeployedAttribute
            orgParamUnmarshling += ']), &'
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ')\n'
            orgParamUnmarshling += `if err != nil {
                fmt.Printf("%s", err)
                return shim.Error("Invalid Argument !!!!!!" + err.Error())
            }\n`
            orgParamUnmarshling += '//<<JAFZA param unmarshaling placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<JAFZA param unmarshaling placeholder>>',orgParamUnmarshling)
            totalDeployedAttribute++

            // 2- add parameter in the structure 
            // sample ==> PassportCopy:              passportCopy,        
            var orgStructField = ''
            orgStructField = capitalizeFirstLetter(attributeDetails.name)
            orgStructField += ': '
            orgStructField += attributeDetails.name
            orgStructField += ',\n'
            orgStructField += '//<<RegAuth Struct field placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<RegAuth Struct field placeholder>>',orgStructField)


            // 2- add parameter in the structure  for new Document case 
            // sample ==> PassportCopy:              passportCopy,  
            // sample ==> UnifiedID:    unifiedRegParams.UnifiedID,      
            var orgStructField1 = ''
            orgStructField1 = capitalizeFirstLetter(attributeDetails.name)
            orgStructField1 += ': unifiedRegParams.'
            orgStructField1 += capitalizeFirstLetter(attributeDetails.name)
            orgStructField1 += ',\n'
            orgStructField1 += '//<<RegAuth Struct newField placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<RegAuth Struct newField placeholder>>',orgStructField1)

            

            //3- apdate the field in the main structure for update case 
            //syntax example ==> unifiedRegDataAsJSON.PassportCopy = passportCopy
            // sample ==> unifiedRegDataAsJSON.UnifiedID = unifiedRegParams.UnifiedID
            var updateMainStuctfield = ''
            updateMainStuctfield = 'unifiedRegDataAsJSON.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += ' = unifiedRegParams.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += '\n //<<RegAuth Struct fieldExist placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<RegAuth Struct fieldExist placeholder>>',updateMainStuctfield)


        }else if(attributeDetails.dataProvider == 'DPW'){
            structField += '//<<DPW Struct field placeholder>>'
            console.log('========888========')
            console.log(structField)
            // Update the struct.go file
            replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<<DPW Struct field placeholder>>', structField)
            replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<< New struct placeholder>>', struct) 



            //update the main.go file 
                //1- initialize field to empty
                // sample ==> var companyInfo CompanyInfo
                var fieldInitialization = ''
                fieldInitialization = 'var '
                fieldInitialization += attributeDetails.name
                fieldInitialization += ' '
                fieldInitialization += capitalizeFirstLetter(attributeDetails.name)
                fieldInitialization += '\n //<<DPW field to empty placeholder>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DPW field to empty placeholder>>',fieldInitialization)
            
                // 1- prepare parameter handeling in main structrure
                // sample ==> LetterFromGM:   letterFromGM,
                paramNew = capitalizeFirstLetter(attributeDetails.name)
                paramNew += ': '
                paramNew += attributeDetails.name
                paramNew += ',\n'
                paramNew += '//<<DPW Struct field placeholder>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DPW Struct field placeholder>>',paramNew)


                // 1- prepare parameter handeling in main structrure for new document Case
                // sample ==> UnifiedID:    unifiedRegParams.UnifiedID,
                paramNew = capitalizeFirstLetter(attributeDetails.name)
                paramNew += ': unifiedRegParams.'
                paramNew += capitalizeFirstLetter(attributeDetails.name)
                paramNew += ',\n'
                paramNew += '//<<DPW Struct newField placeholder>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DPW Struct newField placeholder>>',paramNew)

                
                // 2- prepare parameter handling in organization structure 
                var orgParamUnmarshling = ''
                orgParamUnmarshling = 'var '
                orgParamUnmarshling += attributeDetails.name
                orgParamUnmarshling += ' '
                orgParamUnmarshling += capitalizeFirstLetter(attributeDetails.name)
                orgParamUnmarshling += '\n'
                orgParamUnmarshling += 'err = json.Unmarshal([]byte(args['
                orgParamUnmarshling += dpwDeployedAttr
                orgParamUnmarshling += ']), &'
                orgParamUnmarshling += attributeDetails.name
                orgParamUnmarshling += ')\n'
                orgParamUnmarshling += `if err != nil {
                    fmt.Printf("%s", err)
                    return shim.Error("Invalid Argument !!!!!!" + err.Error())
                }\n`
                orgParamUnmarshling += '//<<DPW param unmarshaling placeholder>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DPW param unmarshaling placeholder>>',orgParamUnmarshling)
                dpwDeployedAttr++

                
                // 3- add parameter in the structure 
                // sample ==> Contacts:             contacts,        
                var orgStructField = ''
                orgStructField = capitalizeFirstLetter(attributeDetails.name)
                orgStructField += ': '
                orgStructField += attributeDetails.name
                orgStructField += ',\n'
                orgStructField += '//<<add parameter to the structre of DPW>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<add parameter to the structre of DPW>>',orgStructField)


                //4- apdate the field in the main structure with organization value (Dubai Customs)
                //syntax example ==> unifiedRegDataAsJSON.NonVATCustomer = postDataToBlockchainPORT.NonVATCustomer
                var updateMainStuctfield = ''
                updateMainStuctfield = 'unifiedRegDataAsJSON.'
                updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
                updateMainStuctfield += ' = postDataToBlockchainPORT.'
                updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
                updateMainStuctfield += '\n //<<update the field of main structure with DPW field>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<update the field of main structure with DPW field>>',updateMainStuctfield)

        }else if(attributeDetails.dataProvider == 'DCC'){
            structField += '//<<Chamber Struct field placeholder>>'
            // Update the struct.go file
            replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<<Chamber Struct field placeholder>>', structField)
            replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<< New struct placeholder>>', struct)



            //update the main.go file 
                //1- initialize field to empty
                // sample ==> var companyInfo CompanyInfo
                var fieldInitialization = ''
                fieldInitialization = 'var '
                fieldInitialization += attributeDetails.name
                fieldInitialization += ' '
                fieldInitialization += capitalizeFirstLetter(attributeDetails.name)
                fieldInitialization += '\n //<<Chamber field to empty placeholder>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<Chamber field to empty placeholder>>',fieldInitialization)
            
                // 1- prepare parameter handeling in main structrure
                // sample ==> LetterFromGM:   letterFromGM,
                paramNew = capitalizeFirstLetter(attributeDetails.name)
                paramNew += ': '
                paramNew += attributeDetails.name
                paramNew += ',\n'
                paramNew += '//<<Chamber Struct field placeholder>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<Chamber Struct field placeholder>>',paramNew)


                // 1- prepare parameter handeling in main structrure for new document Case
                // sample ==> UnifiedID:    unifiedRegParams.UnifiedID,
                paramNew = capitalizeFirstLetter(attributeDetails.name)
                paramNew += ': unifiedRegParams.'
                paramNew += capitalizeFirstLetter(attributeDetails.name)
                paramNew += ',\n'
                paramNew += '//<<Chamber Struct newField placeholder>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<Chamber Struct newField placeholder>>',paramNew)

                
                // 2- prepare parameter handling in organization structure 
                var orgParamUnmarshling = ''
                orgParamUnmarshling = 'var '
                orgParamUnmarshling += attributeDetails.name
                orgParamUnmarshling += ' '
                orgParamUnmarshling += capitalizeFirstLetter(attributeDetails.name)
                orgParamUnmarshling += '\n'
                orgParamUnmarshling += 'err = json.Unmarshal([]byte(args['
                orgParamUnmarshling += dccDeployedAttr
                orgParamUnmarshling += ']), &'
                orgParamUnmarshling += attributeDetails.name
                orgParamUnmarshling += ')\n'
                orgParamUnmarshling += `if err != nil {
                    fmt.Printf("%s", err)
                    return shim.Error("Invalid Argument !!!!!!" + err.Error())
                }\n`
                orgParamUnmarshling += '//<<DCC param unmarshaling placeholder>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DCC param unmarshaling placeholder>>',orgParamUnmarshling)
                dccDeployedAttr++

                
                // 3- add parameter in the structure 
                // sample ==> Contacts:             contacts,        
                var orgStructField = ''
                orgStructField = capitalizeFirstLetter(attributeDetails.name)
                orgStructField += ': '
                orgStructField += attributeDetails.name
                orgStructField += ',\n'
                orgStructField += '//<<add parameter to the structre of DubaiChamber>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<add parameter to the structre of DubaiChamber>>',orgStructField)


                //4- apdate the field in the main structure with organization value (Dubai Customs)
                //syntax example ==> unifiedRegDataAsJSON.NonVATCustomer = postDataToBlockchainCHAMBEROFCOMM.NonVATCustomer
                var updateMainStuctfield = ''
                updateMainStuctfield = 'unifiedRegDataAsJSON.'
                updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
                updateMainStuctfield += ' = postDataToBlockchainCHAMBEROFCOMM.'
                updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
                updateMainStuctfield += '\n //<<update the field of main structure with DubaiChamber field>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<update the field of main structure with DubaiChamber field>>',updateMainStuctfield)
        
        }else if(attributeDetails.dataProvider == 'DT'){
            structField += '//<<DubaiTrade Struct field placeholder>>'
            // Update the struct.go file
            replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<<DubaiTrade Struct field placeholder>>', structField)
            replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<< New struct placeholder>>', struct)

            //update the main.go file 
                //1- initialize field to empty
                // sample ==> var companyInfo CompanyInfo
                var fieldInitialization = ''
                fieldInitialization = 'var '
                fieldInitialization += attributeDetails.name
                fieldInitialization += ' '
                fieldInitialization += capitalizeFirstLetter(attributeDetails.name)
                fieldInitialization += '\n //<<DubaiTrade field to empty placeholder>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DubaiTrade field to empty placeholder>>',fieldInitialization)
            
                // 1- prepare parameter handeling in main structrure
                // sample ==> LetterFromGM:   letterFromGM,
                paramNew = capitalizeFirstLetter(attributeDetails.name)
                paramNew += ': '
                paramNew += attributeDetails.name
                paramNew += ',\n'
                paramNew += '//<<DubaiTrade Struct field placeholder>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DubaiTrade Struct field placeholder>>',paramNew)


                // 1- prepare parameter handeling in main structrure for new document Case
                // sample ==> UnifiedID:    unifiedRegParams.UnifiedID,
                paramNew = capitalizeFirstLetter(attributeDetails.name)
                paramNew += ': unifiedRegParams.'
                paramNew += capitalizeFirstLetter(attributeDetails.name)
                paramNew += ',\n'
                paramNew += '//<<DubaiTrade Struct newField placeholder>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DubaiTrade Struct newField placeholder>>',paramNew)

                
                // 2- prepare parameter handling in organization structure 
                var orgParamUnmarshling = ''
                orgParamUnmarshling = 'var '
                orgParamUnmarshling += attributeDetails.name
                orgParamUnmarshling += ' '
                orgParamUnmarshling += capitalizeFirstLetter(attributeDetails.name)
                orgParamUnmarshling += '\n'
                orgParamUnmarshling += 'err = json.Unmarshal([]byte(args['
                orgParamUnmarshling += dtDeployedAttr
                orgParamUnmarshling += ']), &'
                orgParamUnmarshling += attributeDetails.name
                orgParamUnmarshling += ')\n'
                orgParamUnmarshling += `if err != nil {
                    fmt.Printf("%s", err)
                    return shim.Error("Invalid Argument !!!!!!" + err.Error())
                }\n`
                orgParamUnmarshling += '//<<DT param unmarshaling placeholder>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DT param unmarshaling placeholder>>',orgParamUnmarshling)
                dtDeployedAttr++

                
                // 3- add parameter in the structure 
                // sample ==> Contacts:             contacts,        
                var orgStructField = ''
                orgStructField = capitalizeFirstLetter(attributeDetails.name)
                orgStructField += ': '
                orgStructField += attributeDetails.name
                orgStructField += ',\n'
                orgStructField += '//<<add parameter to the structre of DubaiTrade>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<add parameter to the structre of DubaiTrade>>',orgStructField)


                //4- apdate the field in the main structure with organization value (Dubai Customs)
                //syntax example ==> unifiedRegDataAsJSON.NonVATCustomer = postDataToBlockchainTRADE.NonVATCustomer
                var updateMainStuctfield = ''
                updateMainStuctfield = 'unifiedRegDataAsJSON.'
                updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
                updateMainStuctfield += ' = postDataToBlockchainTRADE.'
                updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
                updateMainStuctfield += '\n //<<update the field of main structure with DubaiTrade field>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<update the field of main structure with DubaiTrade field>>',updateMainStuctfield)

        }else if(attributeDetails.dataProvider == 'DC'){
            structField += '//<<DubaiCustoms Struct field placeholder>>'
            // Update the struct.go file
            replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<<DubaiCustoms Struct field placeholder>>', structField)
            replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<< New struct placeholder>>', struct)



            //update the main.go file 
                //1- initialize field to empty
                // sample ==> var companyInfo CompanyInfo
                var fieldInitialization = ''
                fieldInitialization = 'var '
                fieldInitialization += attributeDetails.name
                fieldInitialization += ' '
                fieldInitialization += capitalizeFirstLetter(attributeDetails.name)
                fieldInitialization += '\n //<<DubaiCustoms field to empty placeholder>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DubaiCustoms field to empty placeholder>>',fieldInitialization)
            
                // 1- prepare parameter handeling in main structrure
                // sample ==> LetterFromGM:   letterFromGM,
                paramNew = capitalizeFirstLetter(attributeDetails.name)
                paramNew += ': '
                paramNew += attributeDetails.name
                paramNew += ',\n'
                paramNew += '//<<DubaiCustoms Struct field placeholder>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DubaiCustoms Struct field placeholder>>',paramNew)


                // 1- prepare parameter handeling in main structrure for new document Case
                // sample ==> UnifiedID:    unifiedRegParams.UnifiedID,
                paramNew = capitalizeFirstLetter(attributeDetails.name)
                paramNew += ': unifiedRegParams.'
                paramNew += capitalizeFirstLetter(attributeDetails.name)
                paramNew += ',\n'
                paramNew += '//<<DubaiCustoms Struct newField placeholder>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DubaiCustoms Struct newField placeholder>>',paramNew)

                
                // 2- prepare parameter handling in organization structure 
                var orgParamUnmarshling = ''
                orgParamUnmarshling = 'var '
                orgParamUnmarshling += attributeDetails.name
                orgParamUnmarshling += ' '
                orgParamUnmarshling += capitalizeFirstLetter(attributeDetails.name)
                orgParamUnmarshling += '\n'
                orgParamUnmarshling += 'err = json.Unmarshal([]byte(args['
                orgParamUnmarshling += dcDeployedAttr
                orgParamUnmarshling += ']), &'
                orgParamUnmarshling += attributeDetails.name
                orgParamUnmarshling += ')\n'
                orgParamUnmarshling += `if err != nil {
                    fmt.Printf("%s", err)
                    return shim.Error("Invalid Argument !!!!!!" + err.Error())
                }\n`
                orgParamUnmarshling += '//<<DC param unmarshaling placeholder>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DC param unmarshaling placeholder>>',orgParamUnmarshling)
                dcDeployedAttr++

                
                // 3- add parameter in the structure 
                // sample ==> Contacts:             contacts,        
                var orgStructField = ''
                orgStructField = capitalizeFirstLetter(attributeDetails.name)
                orgStructField += ': '
                orgStructField += attributeDetails.name
                orgStructField += ',\n'
                orgStructField += '//<<add parameter to the structre of DubaiCustoms>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<add parameter to the structre of DubaiCustoms>>',orgStructField)


                //4- apdate the field in the main structure with organization value (Dubai Customs)
                //syntax example ==> unifiedRegDataAsJSON.NonVATCustomer = postDataToBlockchainCustoms.NonVATCustomer
                var updateMainStuctfield = ''
                updateMainStuctfield = 'unifiedRegDataAsJSON.'
                updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
                updateMainStuctfield += ' = postDataToBlockchainCustoms.'
                updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
                updateMainStuctfield += '\n //<<update the field of main structure with DubaiCustoms field>>'
                replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<update the field of main structure with DubaiCustoms field>>',updateMainStuctfield)
                

        }
}

function object_Many_Common(attributeDetails){
    console.log('========666========')
    var result = ''
    //prepare the struct 
    var struct = ''
    struct = 'type' + ' ' + capitalizeFirstLetter(attributeDetails.name)  + ' ' + 'struct {\n'
    for(var i =0; i< attributeDetails.children.length; i++){
        var child =  attributeDetails.children[i]
        var childName = capitalizeFirstLetter(child['name'])
        console.log('========666========')
        var childType = child['type']
        struct += childName + ' ' + childType + ' ' + '`json:\"'+ lowerCaseFirstLetter(childName) +'\"`\n'
    }
    struct += '}\n'
    struct += '//<< New struct placeholder>>'
    console.log('========777========')
    console.log(struct)

    //now append the new structure as a field in the main structure of corresponding organization
    var fieldName = capitalizeFirstLetter(attributeDetails.name) 
    var fieldType = capitalizeFirstLetter(attributeDetails.name) 
    var structField = '' 
    // sample ==> ContactDPW     []Contacts   `json:"contactDPW"`
    structField = fieldName + ' []' + fieldType + ' ' + '`json:\"'+ lowerCaseFirstLetter(fieldName) +'\"`\n'

    if(attributeDetails.dataProvider == 'JAFZA'){
        structField += '//<<RegAuth Struct field placeholder>>'
        // Update the struct.go file
        //replacePlaceholder('./CcFiles/struct.go','//<<struct field placeholder>>', structField) 
        replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<<RegAuth Struct field placeholder>>', structField)
        replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<< New struct placeholder>>', struct) 
        
        
        //Update the main.go file 
            // 1- prepare parameter handling in organization structure 
            var orgParamUnmarshling = ''
            orgParamUnmarshling = 'var '
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ' []'
            orgParamUnmarshling += capitalizeFirstLetter(attributeDetails.name)
            orgParamUnmarshling += '\n'
            orgParamUnmarshling += 'err = json.Unmarshal([]byte(args['
            orgParamUnmarshling += totalDeployedAttribute
            orgParamUnmarshling += ']), &'
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ')\n'
            orgParamUnmarshling += `if err != nil {
                fmt.Printf("%s", err)
                return shim.Error("Invalid Argument !!!!!!" + err.Error())
            }\n`
            orgParamUnmarshling += '//<<JAFZA param unmarshaling placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<JAFZA param unmarshaling placeholder>>',orgParamUnmarshling)
            totalDeployedAttribute++

            // 2- add parameter in the structure 
            // sample ==> PassportCopy:              passportCopy,        
            var orgStructField = ''
            orgStructField = capitalizeFirstLetter(attributeDetails.name)
            orgStructField += ': '
            orgStructField += attributeDetails.name
            orgStructField += ',\n'
            orgStructField += '//<<RegAuth Struct field placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<RegAuth Struct field placeholder>>',orgStructField)


            // 2- add parameter in the structure  for new Document case 
            // sample ==> PassportCopy:              passportCopy,  
            // sample ==> UnifiedID:    unifiedRegParams.UnifiedID,      
            var orgStructField1 = ''
            orgStructField1 = capitalizeFirstLetter(attributeDetails.name)
            orgStructField1 += ': unifiedRegParams.'
            orgStructField1 += capitalizeFirstLetter(attributeDetails.name)
            orgStructField1 += ',\n'
            orgStructField1 += '//<<RegAuth Struct newField placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<RegAuth Struct newField placeholder>>',orgStructField1)

            

            //3- apdate the field in the main structure for update case 
            //syntax example ==> unifiedRegDataAsJSON.PassportCopy = passportCopy
            // sample ==> unifiedRegDataAsJSON.UnifiedID = unifiedRegParams.UnifiedID
            var updateMainStuctfield = ''
            updateMainStuctfield = 'unifiedRegDataAsJSON.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += ' = unifiedRegParams.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += '\n //<<RegAuth Struct fieldExist placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<RegAuth Struct fieldExist placeholder>>',updateMainStuctfield)
        
    }else if(attributeDetails.dataProvider == 'DPW'){
       
        structField += '//<<DPW Struct field placeholder>>'
        console.log('========888========')
        console.log(structField)
        // Update the struct.go file
        replacePlaceholderSync(require('path').join(__dirname,'CcFiles/struct.go'),'//<<DPW Struct field placeholder>>', structField)
        replacePlaceholderSync(require('path').join(__dirname,'CcFiles/struct.go'),'//<< New struct placeholder>>', struct) 
        console.log('========999========')

        //update the main.go file 
            // 1- prepare parameter handeling in main structrure
            // sample ==> ContactCustoms:       nil,
            var paramNew = ''
            paramNew = capitalizeFirstLetter(attributeDetails.name)
            paramNew += ': nil,\n'
            paramNew += '//<<DPW Struct field placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DPW Struct field placeholder>>',paramNew)
            console.log('========101010========')

            // 1- prepare parameter handeling in main structrure
            // sample ==> Key:          unifiedRegParams.Key,
            var paramNew1 = ''
            paramNew1 = capitalizeFirstLetter(attributeDetails.name)
            paramNew1 += ': unifiedRegParams.'
            paramNew1 += capitalizeFirstLetter(attributeDetails.name)
            paramNew1 += ', \n'
            paramNew1 += '//<<DPW Struct newField placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DPW Struct newField placeholder>>',paramNew1)

            
            // 2- prepare parameter handling in organization structure 
            var orgParamUnmarshling = ''
            orgParamUnmarshling = 'var '
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ' []'
            orgParamUnmarshling += capitalizeFirstLetter(attributeDetails.name)
            orgParamUnmarshling += '\n'
            orgParamUnmarshling += 'err = json.Unmarshal([]byte(args['
            orgParamUnmarshling += dpwDeployedAttr
            orgParamUnmarshling += ']), &'
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ')\n'
            orgParamUnmarshling += `if err != nil {
                fmt.Printf("%s", err)
                return shim.Error("Invalid Argument !!!!!!" + err.Error())
            }\n`
            orgParamUnmarshling += '//<<DPW param unmarshaling placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DPW param unmarshaling placeholder>>',orgParamUnmarshling)
            dpwDeployedAttr++

            
            // 3- add parameter in the structure 
            // sample ==> Contacts:             contacts,        
            var orgStructField = ''
            orgStructField = capitalizeFirstLetter(attributeDetails.name)
            orgStructField += ': '
            orgStructField += attributeDetails.name
            orgStructField += ',\n'
            orgStructField += '//<<add parameter to the structre of DPW>>'
            replacePlaceholderSync(require('path').join(__dirname,'CcFiles/main.go'),'//<<add parameter to the structre of DPW>>',orgStructField)


            //4- apdate the field in the main structure with organization value (Dubai Customs)
            //syntax example ==> unifiedRegDataAsJSON.NonVATCustomer = postDataToBlockchainPORT.NonVATCustomer
            var updateMainStuctfield = ''
            updateMainStuctfield = 'unifiedRegDataAsJSON.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += ' = postDataToBlockchainPORT.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += '\n //<<update the field of main structure with DPW field>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<update the field of main structure with DPW field>>',updateMainStuctfield)
            console.log('========11 11 11========')
    }else if(attributeDetails.dataProvider == 'DCC'){
        structField += '//<<Chamber Struct field placeholder>>'
        // Update the struct.go file
        replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<<Chamber Struct field placeholder>>', structField)
        replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<< New struct placeholder>>', struct)

        //update the main.go file 
            // 1- prepare parameter handeling in main structrure
            // sample ==> ContactCustoms:       nil,
            var paramNew = ''
            paramNew = capitalizeFirstLetter(attributeDetails.name)
            paramNew += ': nil,\n'
            paramNew += '//<<Chamber Struct field placeholder>>'
            replacePlaceholderSync('./CcFiles/main.go','//<<Chamber Struct field placeholder>>',paramNew)

            // 2- prepare parameter handling in organization structure 
            var orgParamUnmarshling = ''
            orgParamUnmarshling = 'var '
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ' []'
            orgParamUnmarshling += capitalizeFirstLetter(attributeDetails.name)
            orgParamUnmarshling += '\n'
            orgParamUnmarshling += 'err = json.Unmarshal([]byte(args['
            orgParamUnmarshling += dccDeployedAttr
            orgParamUnmarshling += ']), &'
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ')\n'
            orgParamUnmarshling += `if err != nil {
                fmt.Printf("%s", err)
                return shim.Error("Invalid Argument !!!!!!" + err.Error())
            }\n`
            orgParamUnmarshling += '//<<DCC param unmarshaling placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DCC param unmarshaling placeholder>>',orgParamUnmarshling)
            dccDeployedAttr++

            
            // 3- add parameter in the structure 
            // sample ==> Contacts:             contacts,        
            var orgStructField = ''
            orgStructField = capitalizeFirstLetter(attributeDetails.name)
            orgStructField += ': '
            orgStructField += attributeDetails.name
            orgStructField += ',\n'
            orgStructField += '//<<add parameter to the structre of DubaiChamber>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<add parameter to the structre of DubaiChamber>>',orgStructField)


            //4- apdate the field in the main structure with organization value (Dubai Customs)
            //syntax example ==> unifiedRegDataAsJSON.MembershipStatus = PostDataToBlockchainChamber.MembershipStatus
            var updateMainStuctfield = ''
            updateMainStuctfield = 'unifiedRegDataAsJSON.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += ' = PostDataToBlockchainChamber.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += '\n //<<update the field of main structure with DubaiChamber field>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<update the field of main structure with DubaiChamber field>>',updateMainStuctfield)

    }else if(attributeDetails.dataProvider == 'DT'){
        structField += '//<<DubaiTrade Struct field placeholder>>'
        // Update the struct.go file
        replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<<DubaiTrade Struct field placeholder>>', structField)
        replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<< New struct placeholder>>', struct)

        //update the main.go file 
            // 1- prepare parameter handeling in main structrure
            // sample ==> ContactCustoms:       nil,
            var paramName = capitalizeFirstLetter(attributeDetails.name)
            var paramType = attributeDetails.type
            var paramNew = ''
            paramNew = paramName
            paramNew += ': nil,\n'
            paramNew += '//<<DubaiTrade Struct field placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DubaiTrade Struct field placeholder>>',paramNew)

            
            // 2- prepare parameter handling in organization structure 
            var orgParamUnmarshling = ''
            orgParamUnmarshling = 'var '
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ' []'
            orgParamUnmarshling += capitalizeFirstLetter(attributeDetails.name)
            orgParamUnmarshling += '\n'
            orgParamUnmarshling += 'err = json.Unmarshal([]byte(args['
            orgParamUnmarshling += dtDeployedAttr
            orgParamUnmarshling += ']), &'
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ')\n'
            orgParamUnmarshling += `if err != nil {
                fmt.Printf("%s", err)
                return shim.Error("Invalid Argument !!!!!!" + err.Error())
            }\n`
            orgParamUnmarshling += '//<<DT param unmarshaling placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DT param unmarshaling placeholder>>',orgParamUnmarshling)
            dtDeployedAttr++

            
            // 3- add parameter in the structure 
            // sample ==> Contacts:             contacts,        
            var orgStructField = ''
            orgStructField = capitalizeFirstLetter(attributeDetails.name)
            orgStructField += ': '
            orgStructField += attributeDetails.name
            orgStructField += ',\n'
            orgStructField += '//<<add parameter to the structre of DubaiTrade>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<add parameter to the structre of DubaiTrade>>',orgStructField)


            //4- apdate the field in the main structure with organization value (Dubai Customs)
            //syntax example ==> unifiedRegDataAsJSON.VATAccountNo = postDataToBlockchainDubaiTrade.VATAccountNo
            var updateMainStuctfield = ''
            updateMainStuctfield = 'unifiedRegDataAsJSON.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += ' = postDataToBlockchainDubaiTrade.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += '\n //<<update the field of main structure with DubaiTrade field>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<update the field of main structure with DubaiTrade field>>',updateMainStuctfield)

    }else if(attributeDetails.dataProvider == 'DC'){
        structField += '//<<DubaiCustoms Struct field placeholder>>'
        // Update the struct.go file
        //replaceTwoPlaceholder('./CcFiles/struct.go','//<<DubaiCustoms Struct field placeholder>>', structField,'//<< New struct placeholder>>',struct)
        replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<<DubaiCustoms Struct field placeholder>>', structField)
        replacePlaceholderSync(join(__dirname,'CcFiles/struct.go'),'//<< New struct placeholder>>', struct)


        //update the main.go file 
            // 1- prepare parameter handeling in main structrure
            // sample ==> ContactCustoms:       nil,
            var paramName = capitalizeFirstLetter(attributeDetails.name)
            var paramType = attributeDetails.type
            var paramNew = ''
            paramNew = paramName
            paramNew += ': nil,\n'
            paramNew += '//<<DubaiCustoms Struct field placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DubaiCustoms Struct field placeholder>>',paramNew)

            
            // 2- prepare parameter handling in organization structure 
            var orgParamUnmarshling = ''
            orgParamUnmarshling = 'var '
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ' []'
            orgParamUnmarshling += capitalizeFirstLetter(attributeDetails.name)
            orgParamUnmarshling += '\n'
            orgParamUnmarshling += 'err = json.Unmarshal([]byte(args['
            orgParamUnmarshling += dcDeployedAttr
            orgParamUnmarshling += ']), &'
            orgParamUnmarshling += attributeDetails.name
            orgParamUnmarshling += ')\n'
            orgParamUnmarshling += `if err != nil {
                fmt.Printf("%s", err)
                return shim.Error("Invalid Argument !!!!!!" + err.Error())
            }\n`
            orgParamUnmarshling += '//<<DC param unmarshaling placeholder>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<DC param unmarshaling placeholder>>',orgParamUnmarshling)
            dcDeployedAttr++

            
            // 3- add parameter in the structure 
            // sample ==> Contacts:             contacts,        
            var orgStructField = ''
            orgStructField = capitalizeFirstLetter(attributeDetails.name)
            orgStructField += ': '
            orgStructField += attributeDetails.name
            orgStructField += ',\n'
            orgStructField += '//<<add parameter to the structre of DubaiCustoms>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<add parameter to the structre of DubaiCustoms>>',orgStructField)


            //4- apdate the field in the main structure with organization value (Dubai Customs)
            //syntax example ==> unifiedRegDataAsJSON.VATAccountNo = postDataToBlockchainDubaiTrade.VATAccountNo
            var updateMainStuctfield = ''
            updateMainStuctfield = 'unifiedRegDataAsJSON.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += ' = postDataToBlockchainCustoms.'
            updateMainStuctfield += capitalizeFirstLetter(attributeDetails.name)
            updateMainStuctfield += '\n //<<update the field of main structure with DubaiCustoms field>>'
            replacePlaceholderSync(join(__dirname,'CcFiles/main.go'),'//<<update the field of main structure with DubaiCustoms field>>',updateMainStuctfield)
            

    }
}


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function lowerCaseFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

function replacePlaceholderSync(filePath , placeholder, replacment){
    
    var data = fs.readFileSync(filePath,'utf8')
    
    var result = data.replace(new RegExp(placeholder, 'g'), replacment);
    //result = result.replace('//<<RegAuth Struct field placeholder>>',replacment)
    fs.writeFileSync(filePath, result , 'utf8')
    
}

function getNumberOfParamsForEachOrg(attributes){
    totalDeployedAttribute = 2
    dccDeployedAttr = 2
    dpwDeployedAttr = 2
    dcDeployedAttr = 3
    dtDeployedAttr = 2
    for(var i=0; i<attributes.length; i++){
        var attribute = attributes[i]
        if(attribute['attributeStatus']== '005'){
            
            if(attribute['dataProvider'] == 'DPW'){
                dpwDeployedAttr += 1
            }else if(attribute['dataProvider'] == 'DT'){
                dtDeployedAttr += 1
            }else if(attribute['dataProvider'] == 'DC'){
                dcDeployedAttr += 1
            }else if(attribute['dataProvider'] == 'DCC'){
                dccDeployedAttr += 1
            }else if(attribute['dataProvider'] == 'JAFZA'){
                totalDeployedAttribute += 1
            }
            

        }
    }
}

function replacePlaceholder(filePath , placeholder, replacment){
    
    fs.readFile(filePath, 'utf8', function (err,data) {
        if (err) {
            console.log("Cann't read file !!!!!!!!")
            return console.log(err);
        }
        var result = data.replace(new RegExp(placeholder, 'g'), replacment);
        //result = result.replace('//<<RegAuth Struct field placeholder>>',replacment)

        fs.writeFile(filePath, result, 'utf8', function (err) {
        if (err){
            console.log("Cann't write to the file !!!!!!!!")
            return console.log(err);
        } 
        });
    });
}

function getAttributeDetails( attribute){
    var attributeProvider = "Not Available"
    attributeProvider = attribute['dataProvider']
    
    // get other attribute details
    var attributeName = "Not Available"
    attributeName = attribute['name']

    var attributeType = "Not Available"
    attributeType = attribute['type']

    var attributeRegAuthCode = "Not Available"
    attributeRegAuthCode = attribute['regAuthCode']

    var attributeOccurrence = "Not Available"
    attributeOccurrence = attribute['occurrence']

    var attributePrivacy = "Not Available"
    attributePrivacy = attribute['privacy']

    var attributeAllowedMSP = []; 
    attributeAllowedMSP = attribute['allowedMSP']
    
    var attributeChildren = []; 
    attributeChildren = attribute['children']
    

    var attributeDetails = {
        name: attributeName,
        type: attributeType,
        regAuthCode: attributeRegAuthCode,
        dataProvider: attributeProvider,
        occurrence: attributeOccurrence,
        privacy: attributePrivacy,
        allowedMSP: attributeAllowedMSP,
        children: attributeChildren
    };
    return attributeDetails
}











    // //Delete Chaincode Template and mark the new chaincode as template 
    // rimraf.sync(join(__dirname,'CcFiles_Template'));
    
    // //Rename the new chaincode from 'CcFiles' ==> to   'CcFiles_Template'
    // fs.rename(join(__dirname,'CcFiles'), join(__dirname,'CcFiles_Template'), function (err) {
    //     if (err) throw err;
    //     console.log('==========Renamed Completed Successfully============');
    // });


//=================================================================

    // version++
    // let smartContractVersion = version.toString()
    // const updatedSmartContract = await smartCointractDoc.update({
    //     documents, 
    //     smartContractVersion
    // }


    //#########################################################################################################
        // modify collections_config.json
    //#########################################################################################################

    // if(attribute['visibility'] == 'private'){
    //     var collectionName = 'unifiedReg_' + attribute['dataProvider'] + '_Private'
    //     var mspId = attribute['dataProvider'].toLowerCase() + 'MSP'
    //    var newPolicy = ''
    //    newPolicy = '\n{\n'
    //    newPolicy += '\"name\": \"'
    //    newPolicy += collectionName
    //    newPolicy += '\",\n'
    //    newPolicy += '\"policy\": {\n'
    //    newPolicy += '\"identities\": [{\n'
    //    newPolicy += '\"role\": {\n'
    //    newPolicy += '\"name\": \"member\",\n'
    //    newPolicy += '\"mspId\": \"'
    //    newPolicy += mspId
    //    newPolicy += '\"\n'
    //    newPolicy += '}\n'
    //    newPolicy += '}]\n'
    //    newPolicy += '},\n'
    //    newPolicy += `"requiredPeerCount": 0,
    //                  "maxPeerCount": 0,
    //                  "blockToLive": 0
    //                 },\n`
    //     newPolicy += policyPlaceholder
    //     console.log(newPolicy)
    //     replacePlaceholder('./CcFiles/collections_config.json',policyPlaceholder,newPolicy)
    // }








  /*
  
  var eventDataa = {
    "key":"unifiedReg_SmartContract_{{REG_AUTH}}",
    "documentName":"SmartContractExchange",
    "contractName":"",
    "verion":"1.0",
    "chainCodePath":"",
    "attribute":[
       {
          "name":"OfficeAddress",
          "type":"string",
          "regAuthCode":"JAFZA",
          "dataProvider":"DCC",
          "isRequired":true,
          "occurrence":"many",
          "attributeStatus":"005",
          "visibility":"common",
          "allowedMSP":[
             "DPW",
             "JAFZA"
          ],
          "children":[
            "Var1", "Var2", "Var3", "Var4" 
          ],
          "status":[
             {
                "MSP":"dpwSP",
                "status":"002"
             },
             {
                "MSP":"jafzaMSP",
                "status":"002"
             },
             {
                "MSP":"dccMSP",
                "status":"002"
             },
             {
                "MSP":"dcMSP",
                "status":"002"
             },
             {
                "MSP":"dtMSP",
                "status":"002"
             }
          ]
       },
       {
        "name":"OfficeAddress",
        "type":"object",
        "regAuthCode":"JAFZA",
        "dataProvider":"DC",
        "isRequired":true,
        "occurrence":"many",
        "attributeStatus":"005",
        "visibility":"common",
        "allowedMSP":[
           "DPW",
           "JAFZA"
        ],
        "children":[
          "Var1", "Var2", "Var3", "Var4" 
        ],
        "status":[
           {
              "MSP":"dpwSP",
              "status":"002"
           },
           {
              "MSP":"jafzaMSP",
              "status":"002"
           },
           {
              "MSP":"dccMSP",
              "status":"002"
           },
           {
              "MSP":"dcMSP",
              "status":"002"
           },
           {
              "MSP":"dtMSP",
              "status":"002"
           }
        ]
     },
     {
      "name":"issueDate",
      "type":"object",
      "regAuth":"JAFZA",
      "orgType": "CUSTOMS",
      "dataProvider":"DPW",
      "isRequired":true,
      "occurrence":"many",
      "attributeStatus":"002",
      "visibility":"common",
      "allowedMSP":[
         "DPW",
         "JAFZA"
      ],
      "children":[
        {  
            "name":"building1",
            "type":"string"
         },
         {  
            "name":"building2",
            "type":"string"
         }
      ],
      "status":[
         {
            "MSP":"dpwSP",
            "status":"002"
         },
         {
            "MSP":"jafzaMSP",
            "status":"002"
         },
         {
            "MSP":"dccMSP",
            "status":"002"
         },
         {
            "MSP":"dcMSP",
            "status":"002"
         },
         {
            "MSP":"dtMSP",
            "status":"002"
         }
      ]
   }
    ]
 }

 var eventDataaa = {
    "_id": "smartContractExchange_JAFZA",
    "_rev": "70-6e18716675f7c24fbb954fb75956508e",
  "addAttributeList": [
    {
      "attributeStatus": "002",
      "attributeType": "master",
      "attributeUUID": "5e34e800-7187-11e9-961d-db51240cacb0",
      "channel": "1111",
      "children": [],
      "dataProvider": "DPW",
      "isRequired": false,
      "masterUUID": "fb190be0-6f45-11e9-a452-abbc4fd5576c",
      "name": "issueData",
      "occurrence": "many",
      "orgList": [
        {
          "installedOn": "",
          "orgCode": "JAFZA",
          "orgType": "REGAUTH",
          "status": "001"
        }
      ],
      "orgType": "CUSTOMS",
      "privacy": "common",
      "regAuth": "JAFZA",
      "type": "object"
}
],
"deployedOn": "",
"documentName": "smartContractExchange_JAFZA",
"key": "smartContractExchange_JAFZA",
"regAuth": "JAFZA",
"smartContractPath": "",
"version": "",
"~version": "\u0000CgQCKnIA"
}
  
  
  */