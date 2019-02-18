'use strict';

const updateStatus = {
  properties: {
    TransactionID: {
      required: true,
      type: 'string',
      messages: {
        required: 'TransactionID is missing',
        type: 'TransactionID must be of string type'
      }
    },
    CTSReferenceNumber: {
      required: true,
      type: 'string',
      messages: {
        required: 'CTSReferenceNumber is missing',
        type: 'CTSReferenceNumber must be of string type'
      }
    },
    Status: {
      required: true,
      type: 'string',
      messages: {
        required: 'Status is missing',
        type: 'Status must be of string type'
      }
    },
    SignedPDF: {
      type: 'object',
      required: true,
      properties: {
        data: {
          required: true,
          type: 'string',
          messages: {
            required: 'data is missing',
            type: 'data must be of string type'
          }
        },
        filename: {
          required: true,
          type: 'string',
          messages: {
            required: 'filename is missing',
            type: 'filename must be of string type'
          }
        },
        format: {
          required: true,
          type: 'string',
          messages: {
            required: 'format is missing',
            type: 'format must be of string type'
          }
        }
      },
      messages: {
        required: 'SignedPDF is missing',
        type: 'SignedPDF must be of object type'
      }
    }
  }
};

const headers = {
  properties: {
    Security: {
      type: 'object',
      required: true,
      properties: {
        Timestamp: {
          type: 'object',
          required: true,
          properties: {
            Created: {
              required: true,
              type: ['object', 'string'],
              messages: {
                required: 'Created is missing',
                type: 'Created must be of string type'
              }
            },
            Expires: {
              required: true,
              type: ['object', 'string'],
              messages: {
                required: 'Expires is missing',
                type: 'Expires must be of string type'
              }
            }
          },
          messages: {
            required: 'Timestamp is missing',
            type: 'Timestamp must be of object type'
          }
        },
        UsernameToken: {
          type: 'object',
          required: true,
          properties: {
            Username: {
              required: true,
              type: ['object', 'string'],
              messages: {
                required: 'Username is missing',
                type: 'Username must be of string type'
              }
            },
            Password: {
              required: true,
              type: ['object', 'string'],
              messages: {
                required: 'Password is missing',
                type: 'Password must be of string type'
              }
            }
          },
          messages: {
            required: 'UsernameToken is missing',
            type: 'UsernameToken must be of object type'
          }
        }
      },
      messages: {
        required: 'Security is missing',
        type: 'Security must be of object type'
      }
    }
  }
};
module.exports = {
  updateStatus,
  headers
};
