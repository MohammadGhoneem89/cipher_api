// openssl genrsa -out certs/server/my-server.key.pem 2048
// openssl rsa -in certs/server/my-server.key.pem -pubout -out certs/client/my-server.pub

'use strict';

// key = ursa.createPrivateKey(fs.readFileSync('./my-server.key.pem'));
// crt = ursa.createPublicKey(fs.readFileSync('./my-server.pub'));
const crypto = require('crypto')
const fs = require('fs');

const getSignatureByInput = (input, crt) => {
  let privatePem = fs.readFileSync(crt)
  let key = privatePem.toString('ascii')
  let sign = crypto.createSign('RSA-SHA512')
  sign.update(input)
  let signature = sign.sign(key, 'hex')
  return signature;
}

const getSignatureVerifyResult = (hmac, publix, signatureSignedByPrivateKey) => {

  let pem = Buffer.from(`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApRaxSYZ5QPnPl7ozNA3t
ipinkjgPNtwlmPmqqTr9RBVwMr4VP08XiqYBIqnv3xpXkn7FzT2nFLRIJY3DpTIs
W4E9T5uBweHhe/5LPGya0xlNJ9v6/TouIaOdc8c9pTY1Ds2x0uWUcFnXMsqcImxp
DVJX17LaRYrMWQWGILInSlm6YjBxu41/mqo0IoSc7poMINKa2Fkk9mkMjKkPUhbX
tNZhsVNqUJnrEUS2KCG331hTKj1//G8eO+asl8uxW0/XgV+zx/xjXomRXZLbGLkW
ROOdTtlgeD+bmMQGF/iTjGzVCzkeRJMoLMipvr1wLYwjpR2n/PuTmjxAx1Q6ucG8
hQIDAQAB
-----END PUBLIC KEY-----`)

  let publicKey = pem.toString('ascii');
  const verifier = crypto.createVerify('RSA-SHA512');
  verifier.update(hmac, 'ascii');
  const publicKeyBuf = new Buffer(publicKey, 'ascii')
  const signatureBuf = new Buffer(signatureSignedByPrivateKey, 'hex')
  const result = verifier.verify(publicKeyBuf, signatureBuf)
  return result;
};

function main() {
  let hmac ='f59e50d813ad470c6ef75a9add9d6a4adf9037b3725a3702d5ff1a7c3eed2cf236099b4b01c1e101f3a903d8f31095c2bc43b5840f7730c7dc7eb22e6193ccee';
  let signatureSignedByPrivateKey = getSignatureByInput(hmac,'./my-server.key.pem');
  console.log(signatureSignedByPrivateKey);
  let str2 = getSignatureVerifyResult(hmac, './my-server.pub',signatureSignedByPrivateKey);
  console.log(str2);
}

main();