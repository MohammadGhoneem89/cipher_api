const zipafolder = require('zip-a-folder');
const {join} = require('path')
const { SmartContract,NetworkConfig,Channel } = require("../../../../../lib/models/index");
const rp = require('request-promise')
const config = require('../../../../../config');
var fs = require('fs')
var fse = require("fs-extra")
var rimraf = require("rimraf");






 
 var totalDeployedAttribute = 2
 var dccDeployedAttr = 2
 var dpwDeployedAttr = 2
 var dcDeployedAttr = 3
 var dtDeployedAttr = 2

 let  channelID = ""
 let version = 0
 let apprrovedAttributeList = []
 let argumentList = []


module.exports.reviseSmartContract = async function reviseSmartContract(payload,orgCode,orgCode1) {
    
    // Copy Chaincode Template folder befor modification 
    try {
        await fse.copy(join(__dirname,'CcFiles_Template'), join(__dirname,'CcFiles'))
        console.log('success!')
    } catch (err) {
        console.error(err)
    }


    var eventData = payload.eventData

     //get SmartContract Local Path fro each Organization       
    try{
         
        var SmartContractLocalPath = new Array()
        SmartContractLocalPath = eventData['smartContractLocalPath']
        if (SmartContractLocalPath){
            console.log('Smart Contract Path Array ====> ', JSON.stringify(SmartContractLocalPath))
            console.log('Organization ======> ',orgCode1)
            var localSMObject = true
            for (i= 0; i< SmartContractLocalPath.length; i++){
                var locaPathObject = SmartContractLocalPath[i]
                if(orgCode1 == locaPathObject['orgCode']){
                    
                    if(locaPathObject['version'] == "0" || locaPathObject['version'] == ""){
                        version = -1
                    }else{
                        version = parseInt(locaPathObject['version'])
                        console.log('Smartcontract Local Version ==============> ' , version)
                    }
                    localSMObject = false
                }
                
            }

            // Check if Organization is matching 
            if (localSMObject){
                throw "Organization OrgCode does not match ........"
            }

        }else{
            throw "Cann't Fetch Local Smartcontract Path......"
        }
        
    }catch (err){
        console.log(err)
        throw err 
    }
    
    // Generate the Smart Contract with new approved attributes
    try{

        if (eventData['addAttributeList']){
        
            //get the array of atrributes
            var attributes = new Array();
            var privateCollections = new Array();
            attributes = eventData['addAttributeList']
            privateCollections = eventData['privateCollection']
            //get number of params for each organization
            getNumberOfParamsForEachOrg(attributes)

            console.log('attributes size :' + attributes.length)

            //find the Approved Attribute
            for (var i = 0; i < attributes.length; i++) {
            
                var attribute = attributes[i]
                
                if (attribute['attributeStatus']){
            
                    var attributeStatus = attribute['attributeStatus']
                    if(attributeStatus == '002'){

                        // add approved attribute to a separate list to update its status later after Chaincode is revised 002 ==> 004
                        apprrovedAttributeList.push(attribute)
                        console.log('===================Pushing Approved Attribute to separate list ======================')

                        channelID = attribute['channel']
                        //this is the new attribute
                        //.
                        //.
                        // get other attribute details
                        var attributeDetails = getAttributeDetails(attribute)
                        
                        // if children == 0 ==> simple attribute type ==> just append it in the corresponding structrue
                        if(attributeDetails.type == 'string'|| attributeDetails.type == 'Date' || attributeDetails.type == 'int' || attributeDetails.type == 'bool'){
                    
                            if(attributeDetails.occurrence == 'One' & attributeDetails.privacy == 'common'){
                                
                                string_One_Common(attributeDetails)
                                
                            }else if(attributeDetails.occurrence == 'Many' & attributeDetails.privacy == 'common'){
                                
                                string_Many_Common(attributeDetails)

                            }else if(attributeDetails.occurrence == 'One' & attributeDetails.privacy == 'private'){
                                
                                //Pass Parameter By reference to the function
                                var obj = {}
                                obj.allOrgsExist = true
                                obj.newCollectionName = 'unifiedReg_Collection_1'
                                obj.existingCollectionName = ''
                                
                                // Check if collection exist
                                checkIfCollectionExist(obj,privateCollections,attributeDetails)

                                var allOrgsExist = obj.allOrgsExist
                                var newCollectionName = obj.newCollectionName
                                var existingCollectionName = obj.existingCollectionName
                                
                                if(allOrgsExist){
                                    // Add the attribute to the existing collection 
                                    console.log('================ if allOrgsExist==================')
                                    existing_String_One_Private(attributeDetails , existingCollectionName)
                                }else{
                                    console.log('================ else allOrgsExist==================')
                                    // Create new collection defintion in the json file
                                    define_Private_Collection(attributeDetails,newCollectionName)
                                    
                                    // Create New structure for the private collection in the Struct.go file 
                                    string_One_Private(attributeDetails,newCollectionName)

                                }

                                
                                
                            }else if(attributeDetails.occurrence == 'Many' & attributeDetails.privacy == 'private'){
                                //Pass Parameter By reference to the function
                                var obj = {}
                                obj.allOrgsExist = true
                                obj.newCollectionName = 'unifiedReg_Collection_1'
                                obj.existingCollectionName = ''
                                
                                // Check if collection exist
                                checkIfCollectionExist(obj , privateCollections , attributeDetails)

                                var allOrgsExist = obj.allOrgsExist
                                var newCollectionName = obj.newCollectionName
                                var existingCollectionName = obj.existingCollectionName
                                // Check if collection exist
                                
                                if(allOrgsExist){
                                    // Add the attribute to the existing collection
                                    console.log('================ if allOrgsExist==================')
                                    existing_String_Many_Private(attributeDetails , existingCollectionName)
                                }else{
                                    console.log('================ else allOrgsExist==================')
                                    // Create new collection defintion in the json file
                                    define_Private_Collection(attributeDetails,newCollectionName)
                                    
                                    // Create New structure for the private collection in the Struct.go file 
                                    string_Many_Private(attributeDetails,newCollectionName)

                                }
                            }


                        }else if(attributeDetails.type == 'object' & attributeDetails.occurrence == 'One' & attributeDetails.privacy == 'common'){
                            
                            object_One_Common(attributeDetails)
                            
                        }else if(attributeDetails.type == 'object' & attributeDetails.occurrence == 'Many' & attributeDetails.privacy == 'common'){

                            object_Many_Common(attributeDetails)
                                
                        }else if(attributeDetails.type == 'object' & attributeDetails.occurrence == 'One' & attributeDetails.privacy == 'private'){
                            
                            //Pass Parameter By reference to the function
                            var obj = {}
                            obj.allOrgsExist = true
                            obj.newCollectionName = 'unifiedReg_Collection_1'
                            obj.existingCollectionName = ''
                            
                            // Check if collection exist
                            checkIfCollectionExist(obj , privateCollections , attributeDetails)

                            var allOrgsExist = obj.allOrgsExist
                            var newCollectionName = obj.newCollectionName
                            var existingCollectionName = obj.existingCollectionName
                            // Check if collection exist
                            
                            if(allOrgsExist){
                                // Add the attribute to the existing collection
                                console.log('================ if allOrgsExist==================')
                                existing_Object_One_Private(attributeDetails , existingCollectionName)
                            }else{
                                console.log('================ else allOrgsExist==================')
                                // Create new collection defintion in the json file
                                define_Private_Collection(attributeDetails,newCollectionName)
                                
                                // Create New structure for the private collection in the Struct.go file 
                                object_One_private(attributeDetails, newCollectionName)

                            }
                            
                        }else if(attributeDetails.type == 'object' & attributeDetails.occurrence == 'Many' & attributeDetails.privacy == 'private'){

                            
                            //Pass Parameter By reference to the function
                            var obj = {}
                            obj.allOrgsExist = true
                            obj.newCollectionName = 'unifiedReg_Collection_1'
                            obj.existingCollectionName = ''
                            
                            // Check if collection exist
                            checkIfCollectionExist(obj , privateCollections , attributeDetails)

                            var allOrgsExist = obj.allOrgsExist
                            var newCollectionName = obj.newCollectionName
                            var existingCollectionName = obj.existingCollectionName
                            // Check if collection exist
                            
                            if(allOrgsExist){
                                // Add the attribute to the existing collection
                                console.log('================ if allOrgsExist==================')
                                existing_Object_Many_Private(attributeDetails , existingCollectionName)
                            }else{
                                console.log('================ else allOrgsExist==================')
                                // Create new collection defintion in the json file
                                define_Private_Collection(attributeDetails,newCollectionName)
                                
                                // Create New structure for the private collection in the Struct.go file 
                                object_Many_private(attributeDetails, newCollectionName)

                            }
                                
                        }
                        

                    }else if(attributeStatus == 4){
                        //this is installed Attribute
                    }else if(attributeStatus == 3){
                        //this is a rejected Attribute
                    }else if(attributeStatus == 1){
                        //this is a pending Attribute
                    }
                }
            }
        
        } 

    }catch (err){
        console.log(err)
        throw err
    }

    // Install the smart contract and update the attributes status
    try{

        version++ 

        //Zip the chaincode folder 
        await zipafolder.zip(join(__dirname,'CcFiles'), join(__dirname , 'CcFiles_V'+version+'.zip') );

        
        //Delete Chaincode Template and mark the new chaincode as template 
        // rimraf.sync(join(__dirname,'CcFiles_Template'));
        
        // //Rename the new chaincode from 'CcFiles' ==> to   'CcFiles_Template'
        // fs.rename(join(__dirname,'CcFiles'), join(__dirname,'CcFiles_Template'))
        
        let documents 
    
        //query SmartContract document 
        const smartCointractDoc = await SmartContract.findOne({"channelID":config.get('attributeConfig.channelID'),"smartContract" :config.get('attributeConfig.smartcontractName')}).lean(true).exec()
    
        
        if (smartCointractDoc) {
            documents = smartCointractDoc.documents
            if (documents) {
                documents[0].documentName = 'CcFiles_V'+version+'.zip'
                documents[0].retreivalPath = join(__dirname , 'CcFiles_V'+version+'.zip')
            }
        }else{
            throw "Fetch Smartcontract Document Failed......."
        }
        
        
        // query Channel Document 
        const channelDoc = await Channel.findOne({"_id":config.get('attributeConfig.channelID')}).lean(true).exec()
        if (!channelDoc) {
            throw "Fetch Channel Document Failed......."
        }
    

        // query Network Document 
        let peersIPs = []

        const networkDoc = await NetworkConfig.findOne({"_id":channelDoc.network}).lean(true).exec()

        if (!networkDoc) {
            throw "Fetch Network Document Failed......."
        }
    
        let peerList = networkDoc.peerList
        if (peerList) {
            for(i=0; i< peerList.length; i++){
                let iP = ""
                iP = peerList[i].requests
                iP.replace("grpcs://", "");
                peersIPs.push(iP)
            }
    
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
        
        let installSamrtContract= response.HyperledgerConnect.data.success
        let installSamrtContractMessage= response.HyperledgerConnect.data.message

        // If smartcontrat version already exist ====> increment the version and try to install it again
        if (response.HyperledgerConnect.data.message == "[Failed] Smart Contract may already exist. meta info status is not 200"){

            version++

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

            installSamrtContract= response.HyperledgerConnect.data.success
            installSamrtContractMessage= response.HyperledgerConnect.data.message

        }

        // If samrtContract installed successfully ==> then call Update_Attribute API
        if(installSamrtContract){
            
            console.log("Smart Contract Installed Successfully. Now Updating the Attribute Status")

            //call Update Attribute API
            //prepare list of parameters
            argumentList.length = 0
            console.log('===================Approved Attribute size is ======================')
            console.log(apprrovedAttributeList.length)
            for(var i = 0; i< apprrovedAttributeList.length; i++){
                var approvedAttribute = apprrovedAttributeList[i]
                var orgList = approvedAttribute['orgList']
                
                var argumentObject1 = {
                    uuid: approvedAttribute['attributeUUID'],
                    regAuth: approvedAttribute['regAuth'],
                    status: "004",
                    orgCode: orgCode1

                }
                console.log('===================Approved Attribute befor Pushing ======================')
                argumentList.push(argumentObject1)
                //console.log('Update Call =======> ',argumentList)
            }
            
            // Prepare SmartContractLocalPath Object 
            var samrtContractPath = {
                orgCode: orgCode1,
                path: join(__dirname , 'CcFiles_V'+version+'.zip'),
                version: version.toString()
            }
            
            // Updated SmartcontractLocalPath for Corresponding Organization 
            for(var i=0; i<SmartContractLocalPath.length; i++){
                var orgLocalPath = SmartContractLocalPath[i]
                if( orgLocalPath['orgCode'] == orgCode1 ){
                    SmartContractLocalPath[i] = samrtContractPath
                }
            }
            
            console.log('Latest SmartContract Path ====>', JSON.stringify(SmartContractLocalPath))
            
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
            

            console.log('argumentList in update Call ==============> ' , JSON.stringify(argumentList))
            console.log('Error Received in update Call ==============> ' , updateResponse.errorCode)
            console.log('Complete response is ==============> ' , JSON.stringify(updateResponse))
            console.log('Request Body is ==============> ' , JSON.stringify(options1.body))
        

            if(updateResponse.errorCode != '200' ){
                installSamrtContractMessage = updateResponse.errorDescription
                console.log('Failed to call API for UpdateAttribute =====> :' , updateResponse.errorDescription)
                throw updateResponse.errorDescription
            } 

        }else{
            console.log('Insallation of the smart contract is failed' + installSamrtContractMessage)
            throw installSamrtContractMessage
        }

        console.log("Updating the local copy of Smart contract in MongoDB")
        //Update the Smart Contract in MongoDB
        var myquery = { "channelID":config.get('attributeConfig.channelID'),"smartContract" : config.get('attributeConfig.smartcontractName') };
        var newvalues = { $set: {smartContractVersion: version.toString(),documents:documents } };
        const smartCointractDoc1 = await SmartContract.updateOne(myquery, newvalues); 
        
        if (!smartCointractDoc1) {
            throw " Update Smartcontract Document in Mongo Failed......."
        }
    
        return "Success"
    } catch (err) {
        console.log(err)
        throw err
    }
}





  module.exports.deploySmartContract = async function deploySmartContract(payload,orgCode,orgCode1) {
	  
	console.log('Deploying the smart contract')
    var eventData = payload.eventData
    let installedAttributeList = []
    let channelId = ''
  
    //version = parseInt(eventData['version'], 10)
	
	try{
        // var SmartContractLocalPath = new Array()
        // SmartContractLocalPath = eventData['smartContractLocalPath']
        // console.log('Smart Contract Path', JSON.stringify(SmartContractLocalPath))
        // console.log('Organization',orgCode1)

        // for (i= 0; i< SmartContractLocalPath.length; i++){
        //     var locaPathObject = SmartContractLocalPath[i]
        //     if(orgCode1 == locaPathObject['orgCode']){
                
        //         // if(locaPathObject['version'] == "0" || locaPathObject['version'] == ""){
        //         //     version = -1
        //         // }else{
        //         //     version = parseInt(locaPathObject['version'], 10)
        //         // }

        //         version = parseInt(locaPathObject['version'], 10)
        //     }
        // }
		
	    // console.log('Version of the smart contract code to be upgraded/instantiated' , version)


	
        if (eventData['addAttributeList']){
        
            var attributes = new Array();
            attributes = eventData['addAttributeList']
        
            for (var i = 0; i < attributes.length; i++) {
                
                var attribute = attributes[i]
                
                if (attribute['attributeStatus']){
    
                    var attributeStatus = attribute['attributeStatus']
                    if(attributeStatus == '004'){
                        installedAttributeList.push(attribute)
                        channelId = attribute['channel']
                    }
                }
            } 

        }else{
            throw "addAttributeList is not Found ........"
        }

    }catch (err){
        console.log(err)
        throw err
    }

    let deploySamrtContract= false
    let deploySamrtContractMessage= ""

    try{
        
        //query SmartContract document 
        const smartContractDoc = await SmartContract.findOne({"channelID":config.get('attributeConfig.channelID'),"smartContract" : config.get('attributeConfig.smartcontractName')}).lean(true).exec()
        if (!smartContractDoc) {
            throw "Fetch Smartcontract Document Failed during Instantiate/Upgrade Process ......."
        }

        //query Channel document 
        const channelDoc = await Channel.findOne({"_id":config.get('attributeConfig.channelID')}).lean(true).exec()
        if (!channelDoc) {
            throw "Fetch Channel Document Failed Instantiate/Upgrade Process ......."
        }

        // query Network Document 
        let peersIPs = []
        
        const networkDoc = await NetworkConfig.findOne({"_id":channelDoc.network}).lean(true).exec()
        if (!networkDoc) {
            throw "Fetch Network Document Failed Instantiate/Upgrade Process ......."
        }
        
        let peerList = networkDoc.peerList
        if (peerList) {
            for(i=0; i< peerList.length; i++){
                let iP = ""
                iP = peerList[i].requests
                iP.replace("grpcs://", "");
                peersIPs.push(iP)
            }
           
        }



        //check if smartContract document is fetched 
        if (smartContractDoc) {
			console.log("Instatiating the smart contract ........")
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
                        //"smartContractVersion":version.toString()
                        "smartContractVersion":smartContractDoc.smartContractVersion
                    
                    },
                    json: true
                };
                let response = await rp(options)                
              
                deploySamrtContract = response.HyperledgerConnect.data.success
                deploySamrtContractMessage = response.HyperledgerConnect.data.message

            }else{
				console.log("Upgrading the smart contract ........")
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
                        //"smartContractVersion":version.toString()
                        "smartContractVersion":smartContractDoc.smartContractVersion
                    
                    },
                    json: true
                };
                let response = await rp(options)
                
                
                deploySamrtContract = response.HyperledgerConnect.data.success
                deploySamrtContractMessage = response.HyperledgerConnect.data.message

            }
        }else{

            throw "Fetch Smartcontract Document Failed during Instantiate/Upgrade Process ......."
        }


        if(deploySamrtContract){
			console.log('Smart Contract Successfully Deployed Now Updating the status of all entities as Deployed ........')
            //call Update Attribute API
            //prepare list of parameters
            for(var i = 0; i< installedAttributeList.length; i++){
                var installedAttribute = installedAttributeList[i]
                var orgList = installedAttribute['orgList']
                var argumentObject1 = {
                    uuid: installedAttribute['attributeUUID'],
                    regAuth: installedAttribute['regAuth'],
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
            
           
            if(updateResponse.errorCode != '200' ){
				console.log('Error Received while updating the status of the attributes as deployed' + updateResponse.errorDescription)
                throw updateResponse.errorDescription
            } 

        }else{
			console.log('Deployment of the smart contract failed with an error' + deploySamrtContractMessage)
            throw deploySamrtContractMessage
        }
    

        return "Success"  

    }catch (err){
       throw err
    }
}

function checkIfCollectionExist(obj, privateCollections, attributeDetails){
    obj.allOrgsExist = true
    obj.newCollectionName = 'unifiedReg_Collection_1'
    // Check if collection exist
    for(var i=0; i<privateCollections.length; i++){
        var privateCollectionObject = privateCollections[i]
        var collectionOrgList = new Array();
        var attributeOrgList = new Array();
        var collectionName = privateCollectionObject['collectionName']
        console.log('Collection Name is ======>>' + collectionName)
        collectionOrgList = privateCollectionObject['orgList']
        attributeOrgList = attributeDetails.allowedMSP
        if(attributeOrgList.length == collectionOrgList.length){
            console.log('==========>>> Orgs Number are Same <<<===========')
            // check if organizations are matching
            for(var j=0; j<attributeOrgList.length; j++){
                var orgExist = false
                for(var k = 0; k<collectionOrgList.length; k++){
                    if(attributeOrgList[j].orgCode == collectionOrgList[k].orgCode){
                        orgExist = true
                        console.log('==========>>> OrgCode Matching <<<===========')
                    }
                }
                if(!orgExist){
                    obj.allOrgsExist = false
                }
            }
        }
        // Check if allOrgsExist ===> means we found the collection so ====> break the loop 
        if(obj.allOrgsExist){
            //return the existing collection name ===> to include the new attribute in it 
            obj.existingCollectionName = collectionName
            break;
        }
        //maintaine the hiegest number for collection name
        var res = collectionName.split("_");
        var res2 = obj.newCollectionName.split("_");
        if(res.length == 3){
            var collectionNumber = parseInt(res[2], 10);
            var newCollectionNumber = parseInt(res2[2], 10);
            if(collectionNumber >= newCollectionNumber){
                collectionNumber++
                obj.newCollectionName = 'unifiedReg_Collection_' + collectionNumber
            }
        }
    }
}

function existing_String_One_Private(attributeDetails , existingCollectionName){

    var placeholder = '//<< ' + capitalizeFirstLetter(existingCollectionName) + ' Struct field placeholder>> \n'
    var structField = '' 
    structField = capitalizeFirstLetter(attributeDetails.name) + ' ' + attributeDetails.type + ' ' + '`json:\"'+ attributeDetails.name +'\"`\n'
    structField += placeholder
    // Update the struct.go file
    replacePlaceholderSync(join(__dirname,'CcFiles/struct.go') ,placeholder, structField) 
    console.log('Struct field is ========>>' + structField)

    // Update the Main.go file 
    if(attributeDetails.dataProvider == 'JAFZA'){
       

    }else if(attributeDetails.dataProvider == 'DPW'){

    }else if(attributeDetails.dataProvider == 'DT'){

    }else if(attributeDetails.dataProvider == 'DC'){

    }else if(attributeDetails.dataProvider == 'DCC'){

    }

}

function existing_String_Many_Private(attributeDetails , existingCollectionName){

    var placeholder = '//<< ' + capitalizeFirstLetter(existingCollectionName) + ' Struct field placeholder>> \n'
    var structField = '' 
    // sample ==> ContactDPW     []Contacts   `json:"contactDPW"`
    structField = capitalizeFirstLetter(attributeDetails.name) + ' []' + attributeDetails.type + ' ' + '`json:\"'+ attributeDetails.name +'\"`\n'
    structField += placeholder
    // Update the struct.go file
    replacePlaceholderSync(join(__dirname,'CcFiles/struct.go') ,placeholder, structField) 

    // Update the Main.go file 
    if(attributeDetails.dataProvider == 'JAFZA'){
       

    }else if(attributeDetails.dataProvider == 'DPW'){

    }else if(attributeDetails.dataProvider == 'DT'){

    }else if(attributeDetails.dataProvider == 'DC'){

    }else if(attributeDetails.dataProvider == 'DCC'){

    }

}

function existing_Object_One_Private(attributeDetails , existingCollectionName){



    // 1- prepare the struct of the attribute 
    var attributeStruct = ''
    attributeStruct = 'type' + ' ' + capitalizeFirstLetter(attributeDetails.name)  + ' ' + 'struct {\n'

    for(var i =0; i< attributeDetails.children.length; i++){
        var child =  attributeDetails.children[i]
        var childName = capitalizeFirstLetter(child['name'])
        var childType = child['type']
        attributeStruct += childName + ' ' + childType + ' ' + '`json:\"'+ child['name'] +'\"`\n'
    }
    attributeStruct += '}\n'
    attributeStruct += '//<< New struct placeholder>>'
    // Update the struct.go file
    replacePlaceholderSync(join(__dirname,'CcFiles/struct.go') ,'//<< New struct placeholder>>', attributeStruct) 

    // include the attribute in the existing collection Structure
    // sample ==> PassportCopy PassportCopy `json:"passportCopy"`
    var placeholder = '//<< ' + capitalizeFirstLetter(existingCollectionName) + ' Struct field placeholder>> \n'
    var structField = '' 
    structField = capitalizeFirstLetter(attributeDetails.name) + ' ' + attributeDetails.name + ' ' + '`json:\"'+ attributeDetails.name +'\"`\n'
    structField += placeholder
    // Update the struct.go file
    replacePlaceholderSync(join(__dirname,'CcFiles/struct.go') ,placeholder, structField) 

    // Update the Main.go file 
    if(attributeDetails.dataProvider == 'JAFZA'){
       

    }else if(attributeDetails.dataProvider == 'DPW'){

    }else if(attributeDetails.dataProvider == 'DT'){

    }else if(attributeDetails.dataProvider == 'DC'){

    }else if(attributeDetails.dataProvider == 'DCC'){

    }

}

function existing_Object_Many_Private(attributeDetails , existingCollectionName){



    // 1- prepare the struct of the attribute 
    var attributeStruct = ''
    attributeStruct = 'type' + ' ' + capitalizeFirstLetter(attributeDetails.name)  + ' ' + 'struct {\n'

    for(var i =0; i< attributeDetails.children.length; i++){
        var child =  attributeDetails.children[i]
        var childName = capitalizeFirstLetter(child['name'])
        var childType = child['type']
        attributeStruct += childName + ' ' + childType + ' ' + '`json:\"'+ child['name'] +'\"`\n'
    }
    attributeStruct += '}\n'
    attributeStruct += '//<< New struct placeholder>>'
    // Update the struct.go file
    replacePlaceholderSync(join(__dirname,'CcFiles/struct.go') ,'//<< New struct placeholder>>', attributeStruct) 

    // include the attribute in the existing collection Structure
    // sample ==> PassportCopy []PassportCopy `json:"passportCopy"`
    var placeholder = '//<< ' + capitalizeFirstLetter(existingCollectionName) + ' Struct field placeholder>> \n'
    var structField = '' 
    structField = capitalizeFirstLetter(attributeDetails.name) + ' []' + attributeDetails.name + ' ' + '`json:\"'+ attributeDetails.name +'\"`\n'
    structField += placeholder
    // Update the struct.go file
    replacePlaceholderSync(join(__dirname,'CcFiles/struct.go') ,placeholder, structField) 

    // Update the Main.go file 
    if(attributeDetails.dataProvider == 'JAFZA'){
       

    }else if(attributeDetails.dataProvider == 'DPW'){

    }else if(attributeDetails.dataProvider == 'DT'){

    }else if(attributeDetails.dataProvider == 'DC'){

    }else if(attributeDetails.dataProvider == 'DCC'){

    }

}

function string_One_Private(attributeDetails,newCollectionName){
    // include the premitive type in the new collection structure ==> no need to create a separate structure, its only a primitive type
    var newPrivateCollectionStruct = ''
    newPrivateCollectionStruct = 'type' + ' ' + capitalizeFirstLetter(newCollectionName)  + ' ' + 'struct {\n'
    newPrivateCollectionStruct += capitalizeFirstLetter(attributeDetails.name) + ' ' + attributeDetails.type + ' ' + '`json:\"' + attributeDetails.name + '\"` \n'
    newPrivateCollectionStruct += '//<< ' + capitalizeFirstLetter(newCollectionName) + ' Struct field placeholder>> \n'
    newPrivateCollectionStruct += '}\n'
    newPrivateCollectionStruct += '//<< New private collection structure placeholder>>'

    
    console.log('========newPrivateCollectionStruct========')
    console.log(newPrivateCollectionStruct)

     // Update the struct.go file
     replacePlaceholderSync(join(__dirname,'CcFiles/struct.go') ,'//<< New private collection structure placeholder>>', newPrivateCollectionStruct)

    if(attributeDetails.dataProvider == 'JAFZA'){
       

    }else if(attributeDetails.dataProvider == 'DPW'){

    }else if(attributeDetails.dataProvider == 'DT'){

    }else if(attributeDetails.dataProvider == 'DC'){

    }else if(attributeDetails.dataProvider == 'DCC'){

    }

}

function string_Many_Private(attributeDetails, newCollectionName){
    
    // // 1- prepare the struct of the attribute 
    // var attributeStruct = ''
    // attributeStruct = 'type' + ' ' + capitalizeFirstLetter(attributeDetails.name)  + ' ' + 'struct {\n'

    // for(var i =0; i< attributeDetails.children.length; i++){
    //     var child =  attributeDetails.children[i]
    //     var childName = capitalizeFirstLetter(child['name'])
    //     var childType = child['type']
    //     attributeStruct += childName + ' ' + childType + ' ' + '`json:\"'+ child['name'] +'\"`\n'
    // }
    // attributeStruct += '}\n'
    // attributeStruct += '//<< New struct placeholder>>'
    
    //2- prepare the struct of the private collection and append the above struct in it.
    var newPrivateCollectionStruct = ''
    newPrivateCollectionStruct = 'type' + ' ' + capitalizeFirstLetter(newCollectionName)  + ' ' + 'struct {\n'
    newPrivateCollectionStruct += capitalizeFirstLetter(attributeDetails.name) + ' []' + attributeDetails.type + ' ' + '`json:\"' + attributeDetails.name + '\"` \n'
    newPrivateCollectionStruct += '//<< ' + capitalizeFirstLetter(newCollectionName) + ' Struct field placeholder>> \n'
    newPrivateCollectionStruct += '}\n'
    newPrivateCollectionStruct += '//<< New private collection structure placeholder>>'

    // Update the struct.go file
    //replacePlaceholderSync(join(__dirname,'CcFiles/struct.go') ,'//<< New struct placeholder>>', attributeStruct)
    replacePlaceholderSync(join(__dirname,'CcFiles/struct.go') ,'//<< New private collection structure placeholder>>', newPrivateCollectionStruct)
    
    console.log('========newPrivateCollectionStruct========')
    console.log(newPrivateCollectionStruct)

}

function object_Many_private(attributeDetails, newCollectionName){
   
    // 1- prepare the struct of the attribute 
    var attributeStruct = ''
    attributeStruct = 'type' + ' ' + capitalizeFirstLetter(attributeDetails.name)  + ' ' + 'struct {\n'

    for(var i =0; i< attributeDetails.children.length; i++){
        var child =  attributeDetails.children[i]
        var childName = capitalizeFirstLetter(child['name'])
        var childType = child['type']
        attributeStruct += childName + ' ' + childType + ' ' + '`json:\"'+ child['name'] +'\"`\n'
    }
    attributeStruct += '}\n'
    attributeStruct += '//<< New struct placeholder>>'
    
    //2- prepare the struct of the private collection and append the above struct in it.
    var newPrivateCollectionStruct = ''
    newPrivateCollectionStruct = 'type' + ' ' + capitalizeFirstLetter(newCollectionName)  + ' ' + 'struct {\n'
    newPrivateCollectionStruct += capitalizeFirstLetter(attributeDetails.name) + ' []' + capitalizeFirstLetter(attributeDetails.name) + ' ' + '`json:\"' + attributeDetails.name + '\"` \n'
    newPrivateCollectionStruct += '//<< ' + capitalizeFirstLetter(newCollectionName) + ' Struct field placeholder>> \n' 
    newPrivateCollectionStruct += '}\n'
    newPrivateCollectionStruct += '//<< New private collection structure placeholder>>'

    // Update the struct.go file
    replacePlaceholderSync(join(__dirname,'CcFiles/struct.go') ,'//<< New struct placeholder>>', attributeStruct)
    replacePlaceholderSync(join(__dirname,'CcFiles/struct.go') ,'//<< New private collection structure placeholder>>', newPrivateCollectionStruct)
    
    console.log('========newPrivateCollectionStruct========')
    console.log(newPrivateCollectionStruct)
}


function object_One_private(attributeDetails, newCollectionName){
   
    // 1- prepare the struct of the attribute 
    var attributeStruct = ''
    attributeStruct = 'type' + ' ' + capitalizeFirstLetter(attributeDetails.name)  + ' ' + 'struct {\n'

    for(var i =0; i< attributeDetails.children.length; i++){
        var child =  attributeDetails.children[i]
        var childName = capitalizeFirstLetter(child['name'])
        var childType = child['type']
        attributeStruct += childName + ' ' + childType + ' ' + '`json:\"'+ child['name'] +'\"`\n'
    }
    attributeStruct += '}\n'
    attributeStruct += '//<< New struct placeholder>>'
    
    //2- prepare the struct of the private collection and append the above struct in it.
    var newPrivateCollectionStruct = ''
    newPrivateCollectionStruct = 'type' + ' ' + capitalizeFirstLetter(newCollectionName)  + ' ' + 'struct {\n'
    newPrivateCollectionStruct += capitalizeFirstLetter(attributeDetails.name) + ' ' + capitalizeFirstLetter(attributeDetails.name) + ' ' + '`json:\"' + attributeDetails.name + '\"` \n'
    newPrivateCollectionStruct += '//<< ' + capitalizeFirstLetter(newCollectionName) + ' Struct field placeholder>>\n'
    newPrivateCollectionStruct += '}\n'
    newPrivateCollectionStruct += '//<< New private collection structure placeholder>>'

    // Update the struct.go file
    replacePlaceholderSync(join(__dirname,'CcFiles/struct.go') ,'//<< New struct placeholder>>', attributeStruct)
    replacePlaceholderSync(join(__dirname,'CcFiles/struct.go') ,'//<< New private collection structure placeholder>>', newPrivateCollectionStruct)
    
    console.log('========newPrivateCollectionStruct========')
    console.log(newPrivateCollectionStruct)
}

function string_One_Common(attributeDetails){
    var Name = capitalizeFirstLetter(attributeDetails.name)
    var Type = attributeDetails.type
    // sample ==> UnifiedID    string   `json:"unifiedID"`  
    var structField = '' 
    structField = Name + ' ' + Type + ' ' + '`json:\"'+ attributeDetails.name +'\"`\n'

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
        if (attributeDetails.type == "string") {
            paramNew += ': "", \n'
        }else if (attributeDetails.type == "bool"){
            paramNew += ': false, \n'
        }else if (attributeDetails.type == "int"){
            paramNew += ': 0, \n'
        }
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
        paramNew = capitalizeFirstLetter(attributeDetails.name)
        if (attributeDetails.type == "string") {
            paramNew += ': "", \n'
        }else if (attributeDetails.type == "bool"){
            paramNew += ': false, \n'
        }else if (attributeDetails.type == "int"){
            paramNew += ': 0, \n'
        }
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
        if (attributeDetails.type == "string") {
            paramNew += ': "", \n'
        }else if (attributeDetails.type == "bool"){
            paramNew += ': false, \n'
        }else if (attributeDetails.type == "int"){
            paramNew += ': 0, \n'
        }
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
        struct += childName + ' ' + childType + ' ' + '`json:\"'+ child['name'] +'\"`\n'
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
    structField = fieldName + ' []' + fieldType + ' ' + '`json:\"'+ attributeDetails.name +'\"`\n'

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
        struct += childName + ' ' + childType + ' ' + '`json:\"'+ child['name'] +'\"`\n'
        }
        struct += '}\n'
        struct += '//<< New struct placeholder>>'
        console.log('========777========')
        console.log(struct)

        //now append the new structure as a field in the main structure of corresponding organization
        var fieldName = capitalizeFirstLetter(attributeDetails.name) 
        var fieldType = capitalizeFirstLetter(attributeDetails.name) 
        var structField = '' 
        structField = fieldName + ' ' + fieldType + ' ' + '`json:\"'+ attributeDetails.name +'\"`\n'

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
        struct += childName + ' ' + childType + ' ' + '`json:\"'+ child['name'] +'\"`\n'
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
    structField = fieldName + ' []' + fieldType + ' ' + '`json:\"'+ attributeDetails.name +'\"`\n'

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

function define_Private_Collection(attributeDetails, privateCollectionName){

    var policyPlaceholder = '{}'
    
    var privateCollection = ''
    privateCollection = '{ \n'
    privateCollection += '\"name\": \"'
    privateCollection += privateCollectionName // Need to confirm with sandeep 
    privateCollection += '\",\n'
    privateCollection += '\"policy\": {\n'
    privateCollection += '\"identities\": ['
    for (var i=0; i<attributeDetails.allowedMSP.length; i++){
        var orgCode = ''
        orgCode = attributeDetails.allowedMSP[i].orgCode
        privateCollection += '{\n'
        privateCollection += '\"role\": { \n'
        privateCollection += '\"name\": \"member\", \n'
        privateCollection += '\"mspId\": \"'
        privateCollection += orgCode.toLowerCase()
        privateCollection += 'MSP" \n'
        privateCollection += '}\n'
        privateCollection += '}'
        // add , to sparate objects insied identities array
        if(i<attributeDetails.allowedMSP.length - 1){
            privateCollection += ',\n'
        }
    }
    privateCollection += '], \n' // close identities array
    // prepare policy section
    privateCollection += '\"policy\": { \n'
    privateCollection += '\"1-of\": [ \n'
    for (var i=0; i<attributeDetails.allowedMSP.length; i++){
        privateCollection += '{ \n'
        privateCollection += '\"signed-by\": '
        privateCollection += i
        privateCollection += '\n'
        privateCollection += '}'
        if(i<attributeDetails.allowedMSP.length - 1){
            privateCollection += ',\n'
        }
    }
    privateCollection += '] \n' //close 1-of array
    privateCollection += '}' // Close the inner policy object 
    privateCollection += '}, \n' // Close the main policy object
    privateCollection += '\"requiredPeerCount\": 3, \n'
    privateCollection += '\"maxPeerCount\": 4, \n'
    privateCollection += '\"blockToLive\": 0 \n'
    privateCollection += '}' // Close private colloection object 
    privateCollection += ', \n'
    privateCollection += '{}'
    
    console.log('The New Private Collection is =============> \n' + privateCollection)

    replacePlaceholderSync(join(__dirname,'CcFiles/collections_config.json'),policyPlaceholder, privateCollection) 
    
    // collection Sample : 
   /*
   {
        "name": "unifiedRegGrouping_JAFZA",
        "policy": {
            "identities": [
                {
                    "role": {
                        "name": "member",
                        "mspId": "dcMSP"
                    }
                },
                {
                    "role": {
                        "name": "member",
                        "mspId": "dpwMSP"
                    }
                }
            ],
            "policy": {
                "1-of": [
                    {
                        "signed-by": 0
                    },
                    {
                        "signed-by": 1
                    }
                ]
            }
        },
        "requiredPeerCount": 3,
        "maxPeerCount": 4,
        "blockToLive": 0
    }, 
   
   */
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

function getAttributeDetails( attribute){
    var attributeProvider = "Not Available"
    attributeProvider = attribute['dataProvider']
    
    // get other attribute details
    var attributeName = "Not Available"
    attributeName = attribute['name']

    var attributeType = "Not Available"
    attributeType = attribute['type']

    var attributeRegAuthCode = "Not Available"
    attributeRegAuthCode = attribute['regAuth']

    var attributeOccurrence = "Not Available"
    attributeOccurrence = attribute['occurrence']

    var attributePrivacy = "Not Available"
    attributePrivacy = attribute['privacy']

    var attributeAllowedMSP = []; 
    attributeAllowedMSP = attribute['orgList']
    
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








  