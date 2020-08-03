'use strict';

const common = require('./common');
const dateRegex = require('../../constants/regex');

const create = {
    properties: {
        action: common.action,
        data: {
            type: 'Object',
            required: true,
            properties: {
                consortiumName: {
                    required: true,
                    type: 'string',
                    messages: {
                        required: 'consortiumName is missing',
                        type: 'consortiumName must be of string type'
                    }
                },
                consortiumType: {
                    required: true,
                    type: 'string',
                    messages: {
                        required: 'consortiumType is missing',
                        type: 'consortiumType must be of string type'
                    }
                },
                orgTypes: {
                    required: true,
                    type: 'array',
                    minItems: 3,
                    messages: {
                        required: 'orgTypes is missing',
                        type: 'orgTypes must be of array type'
                    }
                },
                owner: {
                    required: true,
                    type: 'object',
                    properties: {
                        orgType: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'orgType is missing',
                                type: 'orgType must be of string type'
                            }
                        },
                        orgCode: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'orgCode is missing',
                                type: 'orgCode must be of string type'
                            }
                        }
                    },
                    messages: {
                        required: 'owner is missing',
                        type: 'owner must be of object type'
                    }
                },
                directParticipants: {
                    required: true,
                    type: 'array',
                    properties: {
                        orgType: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'orgType is missing',
                                type: 'orgType must be of string type'
                            }
                        },
                        orgCode: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'orgCode is missing',
                                type: 'orgCode must be of string type'
                            }
                        },
                        status: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'status is missing',
                                type: 'status must be of string type'
                            }
                        },
                        account: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'account is missing',
                                type: 'account must be of string type'
                            }
                        }
                    },
                    messages: {
                        required: 'directParticipants is missing',
                        type: 'directParticipants must be of array type'
                    }
                },
                indirectParticipants: {
                    required: true,
                    type: 'array',
                    properties: {
                        orgType: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'orgType is missing',
                                type: 'orgType must be of string type'
                            }
                        },
                        orgCode: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'orgCode is missing',
                                type: 'orgCode must be of string type'
                            }
                        },
                        status: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'status is missing',
                                type: 'status must be of string type'
                            }
                        },
                        account: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'account is missing',
                                type: 'account must be of string type'
                            }
                        }
                    },
                    messages: {
                        required: 'indirectParticipants is missing',
                        type: 'indirectParticipants must be of array type'
                    }
                },
                peers: {
                    required: true,
                    type: 'array',
                    properties: {
                        name: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'name is missing',
                                type: 'name must be of string type'
                            }
                        },
                        IP: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'IP is missing',
                                type: 'IP must be of string type'
                            }
                        },
                        port: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'port is missing',
                                type: 'port must be of string type'
                            }
                        },
                        role: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'role is missing',
                                type: 'role must be of string type'
                            }
                        },
                        DBType: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'DBType is missing',
                                type: 'DBType must be of string type'
                            }
                        },
                        DBIP: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'DBIP is missing',
                                type: 'DBIP must be of string type'
                            }
                        },
                        DBPort: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'DBPort is missing',
                                type: 'DBPort must be of string type'
                            }
                        },
                        orgs: {
                            required: true,
                            type: 'array',
                            minItems: 2,
                            messages: {
                                required: 'orgs is missing',
                                type: 'orgs must be of array type'
                            }
                        }
                    },
                    messages: {
                        required: 'peers is missing',
                        type: 'peers must be of array type'
                    }
                },
                channels: {
                    required: true,
                    type: 'array',
                    properties: {
                        name: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'name is missing',
                                type: 'name must be of string type'
                            }
                        },
                        orgs: {
                            required: true,
                            type: 'array',
                            minItems: 2,
                            messages: {
                                required: 'orgs is missing',
                                type: 'orgs must be of array type'
                            }
                        }
                    },
                    messages: {
                        required: 'channels is missing',
                        type: 'channels must be of array type'
                    }
                },
                smartContractTemplates: {
                    required: true,
                    type: 'array',
                    properties: {
                        templateName: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'templateName is missing',
                                type: 'templateName must be of string type'
                            }
                        },
                        files: {
                            required: true,
                            type: 'Array',
                            messages: {
                                required: 'file is missing',
                                type: 'file must be of Array type'
                            }
                        },
                        ABI: {
                            required: true,
                            type: 'string',
                            messages: {
                                required: 'ABI is missing',
                                type: 'ABI must be of string type'
                            }
                        },
                        code: {
                            required: true,
                            type: 'string',
                            messages: {
                                required: 'Code is missing',
                                type: 'Code must be of string type'
                            }
                        },
                        description: {
                            required: true,
                            type: 'string',
                            messages: {
                                required: 'description is missing',
                                type: 'description must be of string type'
                            }
                        },
                        status: {
                            required: true,
                            type: 'string',
                            messages: {
                                required: 'status is missing',
                                type: 'status must be of string type'
                            }
                        }
                    },
                    messages: {
                        required: 'smartContractTemplates is missing',
                        type: 'smartContractTemplates must be of array type'
                    }
                },
                deployedContracts: {
                    required: true,
                    type: 'array',
                    properties: {
                        templateName: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'templateName is missing',
                                type: 'templateName must be of string type'
                            }
                        },
                        bindingId: {
                            required: true,
                            type: 'string',
                            messages: {
                                required: 'bindingId is missing',
                                type: 'bindingId must be of string type'
                            }
                        },
                        channel: {
                            required: true,
                            type: 'string',
                            messages: {
                                required: 'channel is missing',
                                type: 'channel must be of string type'
                            }
                        },
                        deployedBy: {
                            required: true,
                            type: 'string',
                            messages: {
                                required: 'deployedBy is missing',
                                type: 'deployedBy must be of string type'
                            }
                        },
                        deployedOn: {
                            required: true,
                            type: 'string',
                            messages: {
                                required: 'deployedOn is missing',
                                type: 'deployedOn must be of string type'
                            }
                        },
                        status: {
                            required: true,
                            type: 'string',
                            messages: {
                                required: 'status is missing',
                                type: 'status must be of string type'
                            }
                        }
                    },
                    messages: {
                        required: 'deployedContracts is missing',
                        type: 'deployedContracts must be of array type'
                    }
                },
                businessApplication: {
                    required: true,
                    type: 'array',
                    properties: {
                        name: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'name is missing',
                                type: 'name must be of string type'
                            }
                        },
                        usedBy: {
                            required: true,
                            type: 'array',
                            minItems: 1,
                            messages: {
                                required: 'usedBy is missing',
                                type: 'usedBy must be of array type'
                            }
                        },
                        RESTLoginURL: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'RESTLoginURL is missing',
                                type: 'RESTLoginURL must be of string type'
                            }
                        }
                    },
                    messages: {
                        required: 'businessApplication is missing',
                        type: 'businessApplication must be of array type'
                    }
                }
            }
        }
    }
};


const consortiumID = {
    required: true,
    type: 'string',
    messages: {
        required: 'consortiumID is missing',
        type: 'consortiumID must be of string type'
    }
};

const consortiumDetail = {
    properties: {
        action: common.action,
        consortiumID: consortiumID
    }
};

const getConsortium = {
    properties: {
        action: common.action,
        page: {
            currentPageNo: common.currentPageNo,
            pageSize: common.pageSize
        },
        searchCriteria: {
            properties: {
                consortiumName: {
                    required: false,
                    type: 'string',
                    message: {
                        type: 'consortiumName must be string',
                        required: 'consortiumName is missing'
                    }
                },
                consortiumType: {
                    required: false,
                    type: 'string',
                    message: {
                        type: 'consortiumType must be string',
                        required: 'consortiumType is missing'
                    }
                }
            },
            message: {
                'type': 'searchCriteria must be object',
                'required': 'searchCriteria is missing'
            }
        }
    }
};


const update = {
    properties: {
        action: common.action,
        data: {
            type: 'Object',
            required: false,
            properties: {
                consortiumName: {
                    required: true,
                    type: 'string',
                    messages: {
                        required: 'consortiumName is missing',
                        type: 'consortiumName must be of string type'
                    }
                },
                consortiumType: {
                    required: true,
                    type: 'string',
                    messages: {
                        required: 'consortiumType is missing',
                        type: 'consortiumType must be of string type'
                    }
                },
                orgTypes: {
                    required: false,
                    type: 'array',
                    minItems: 3,
                    messages: {
                        required: 'orgTypes is missing',
                        type: 'orgTypes must be of array type'
                    }
                },
                owner: {
                    required: false,
                    type: 'object',
                    properties: {
                        orgType: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'orgType is missing',
                                type: 'orgType must be of string type'
                            }
                        },
                        orgCode: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'orgCode is missing',
                                type: 'orgCode must be of string type'
                            }
                        }
                    },
                    messages: {
                        required: 'owner is missing',
                        type: 'owner must be of object type'
                    }
                },
                directParticipants: {
                    required: true,
                    type: 'array',
                    properties: {
                        orgType: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'orgType is missing',
                                type: 'orgType must be of string type'
                            }
                        },
                        orgCode: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'orgCode is missing',
                                type: 'orgCode must be of string type'
                            }
                        },
                        status: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'status is missing',
                                type: 'status must be of string type'
                            }
                        },
                        account: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'account is missing',
                                type: 'account must be of string type'
                            }
                        }
                    },
                    messages: {
                        required: 'directParticipants is missing',
                        type: 'directParticipants must be of array type'
                    }
                },
                indirectParticipants: {
                    required: false,
                    type: 'array',
                    properties: {
                        orgType: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'orgType is missing',
                                type: 'orgType must be of string type'
                            }
                        },
                        orgCode: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'orgCode is missing',
                                type: 'orgCode must be of string type'
                            }
                        },
                        status: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'status is missing',
                                type: 'status must be of string type'
                            }
                        },
                        account: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'account is missing',
                                type: 'account must be of string type'
                            }
                        }
                    },
                    messages: {
                        required: 'indirectParticipants is missing',
                        type: 'indirectParticipants must be of array type'
                    }
                },
                peers: {
                    required: false,
                    type: 'array',
                    properties: {
                        name: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'name is missing',
                                type: 'name must be of string type'
                            }
                        },
                        IP: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'IP is missing',
                                type: 'IP must be of string type'
                            }
                        },
                        port: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'port is missing',
                                type: 'port must be of string type'
                            }
                        },
                        role: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'role is missing',
                                type: 'role must be of string type'
                            }
                        },
                        DBType: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'DBType is missing',
                                type: 'DBType must be of string type'
                            }
                        },
                        DBIP: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'DBIP is missing',
                                type: 'DBIP must be of string type'
                            }
                        },
                        DBPort: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'DBPort is missing',
                                type: 'DBPort must be of string type'
                            }
                        },
                        orgs: {
                            required: false,
                            type: 'array',
                            minItems: 2,
                            messages: {
                                required: 'orgs is missing',
                                type: 'orgs must be of array type'
                            }
                        }
                    },
                    messages: {
                        required: 'peers is missing',
                        type: 'peers must be of array type'
                    }
                },
                channels: {
                    required: false,
                    type: 'array',
                    properties: {
                        name: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'name is missing',
                                type: 'name must be of string type'
                            }
                        },
                        orgs: {
                            required: false,
                            type: 'array',
                            minItems: 2,
                            messages: {
                                required: 'orgs is missing',
                                type: 'orgs must be of array type'
                            }
                        }
                    },
                    messages: {
                        required: 'channels is missing',
                        type: 'channels must be of array type'
                    }
                },
                smartContractTemplates: {
                    required: false,
                    type: 'array',
                    properties: {
                        templateName: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'templateName is missing',
                                type: 'templateName must be of string type'
                            }
                        },
                        files: {
                            required: false,
                            type: 'Array',
                            messages: {
                                required: 'file is missing',
                                type: 'file must be of Array type'
                            }
                        },
                        ABI: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'ABI is missing',
                                type: 'ABI must be of string type'
                            }
                        },
                        description: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'description is missing',
                                type: 'description must be of string type'
                            }
                        },
                        status: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'status is missing',
                                type: 'status must be of string type'
                            }
                        }
                    },
                    messages: {
                        required: 'smartContractTemplates is missing',
                        type: 'smartContractTemplates must be of array type'
                    }
                },
                deployedContracts: {
                    required: false,
                    type: 'array',
                    properties: {
                        templateName: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'templateName is missing',
                                type: 'templateName must be of string type'
                            }
                        },
                        bindingId: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'bindingId is missing',
                                type: 'bindingId must be of string type'
                            }
                        },
                        channel: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'channel is missing',
                                type: 'channel must be of string type'
                            }
                        },
                        deployedBy: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'deployedBy is missing',
                                type: 'deployedBy must be of string type'
                            }
                        },
                        deployedOn: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'deployedOn is missing',
                                type: 'deployedOn must be of string type'
                            }
                        },
                        status: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'status is missing',
                                type: 'status must be of string type'
                            }
                        }
                    },
                    messages: {
                        required: 'deployedContracts is missing',
                        type: 'deployedContracts must be of array type'
                    }
                },
                businessApplication: {
                    required: false,
                    type: 'array',
                    properties: {
                        name: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'name is missing',
                                type: 'name must be of string type'
                            }
                        },
                        usedBy: {
                            required: false,
                            type: 'array',
                            minItems: 1,
                            messages: {
                                required: 'usedBy is missing',
                                type: 'usedBy must be of array type'
                            }
                        },
                        RESTLoginURL: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'RESTLoginURL is missing',
                                type: 'RESTLoginURL must be of string type'
                            }
                        }
                    },
                    messages: {
                        required: 'businessApplication is missing',
                        type: 'businessApplication must be of array type'
                    }
                }
            }
        }
    }
};

module.exports = {
    create,
    consortiumDetail,
    getConsortium,
    update
};
