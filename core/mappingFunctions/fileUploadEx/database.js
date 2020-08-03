'use strict';
const sqlserver = require('../../api/connectors/mssql');
var sql = require('mssql');
const moment = require('moment');

class Database {
    constructor(type) {
        this.type = type;
    }
    async upload(file, fileHash, fileExtension, fileName, type, source, UUID, context, contentType, fileReference, policies, orgCode) {

        let date = moment().format('YYYY-MM-DD');

        let arrByte = new Buffer(file);
        let conn = await sqlserver.connection()
        conn.input('file', sql.VarBinary, arrByte)
        conn.input('fileHash', sql.VarChar, fileHash)
        conn.input('fileExtension', sql.VarChar, fileExtension)
        conn.input('fileName', sql.VarChar, fileName)
        conn.input('type', sql.VarChar, type)
        conn.input('source', sql.VarChar, source)
        conn.input('UUID', sql.VarChar, UUID)
        conn.input('context', sql.VarChar, context)
        conn.input('contentType', sql.VarChar, contentType)
        conn.input('fileReference', sql.VarChar, fileReference)
        conn.input('policies', sql.VarChar, policies)
        conn.input('orgCode', sql.VarChar, orgCode)
        conn.input('createdAt', sql.Date, date)

        let query = `INSERT INTO Attachment (
            fileContent,
                    ext,
                    name,
                    type,
                    source,
                    UUID,
                    hash,
                    context,
                    contentType,
                    policies,
                    fileReference,
                    uploadedBy,
                    createdAt
                )  values (
                    @file,
                    @fileExtension,
                    @fileName, 
                    @type,
                    @source,
                    @UUID,
                    @fileHash,
                    @context,
                    @contentType,
                    @policies,
                    @fileReference,
                    @orgCode,
                    @createdAt
                )`

        return conn.query(query, [])

    }

    async download(hash) {
        let conn = await sqlserver.connection()
        let query = `select attchmentId from attachment where hash Like '${hash}' order by attchmentId DESC`
        let dataOfIds = await conn.query(query, [])
        let [ file ] = dataOfIds.recordset
        query = `select * from attachment where attchmentId = ${file.attchmentId}`
        let result = await conn.query(query, [])
        console.log("result" , result);
        let [fileObject] = result.recordset;
        return fileObject;
    }
}

module.exports = Database;