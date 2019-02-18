'use strict';

const common = require('./common');

const get = {
    properties: {
        action: common.action,
        page: {
            properties: {
                currentPageNo: common.currentPageNo,
                pageSize: common.pageSize
            }
        },
        searchCriteria: {
            properties: {
                name: {
                    required: false,
                    type: 'string',
                    message: {
                        type: 'Name must be string',
                        required: 'Name is missing'
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

const id = {
    required: true,
    type: 'string',
    messages: {
        required: 'Id is missing',
        type: 'Id must be of string type'
    }
};

const Detail = {
    data : {
        properties: {
            id: id,
            action: common.action
        },
        messages: {
            required: 'Data is missing',
            type: 'Data must be of Object type'
        }
    }
};

const create = {
    properties: {
        action: common.action,
        data: {
            type: 'object',
            required: true,
            properties: {
                name: {
                    required: false,
                    type: 'string',
                    message: {
                        type: 'Name must be string',
                        required: 'Name is missing'
                    }
                },
                status: {
                    required: false,
                    type: 'string',
                    message: {
                        type: 'status must be string',
                        required: 'status is missing'
                    }
                },
                useCase: {
                    required: false,
                    type: 'string',
                    message: {
                        type: 'useCase must be string',
                        required: 'useCase is missing'
                    }
                },
                DBType: {
                    required: false,
                    type: 'string',
                    message: {
                        type: 'DBType must be string',
                        required: 'DBType is missing'
                    }
                },
                destinationDB: {
                    required: false,
                    type: 'string',
                    message: {
                        type: 'destinationDB must be string',
                        required: 'destinationDB is missing'
                    }
                },
                profile: {
                    required: false,
                    type: 'string',
                    message: {
                        type: 'profile must be string',
                        required: 'profile is missing'
                    }
                },
                params: {
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
                        value: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'value is missing',
                                type: 'value must be of string type'
                            }
                        }
                    },
                    messages: {
                        required: 'params is missing',
                        type: 'params must be of array type'
                    }
                },
                tables: {
                    required: true,
                    type: 'array'
                }
            }
        }
    }
};

const update = {
    properties: {
        action: common.action,
        data: {
            type: 'object',
            required: true,
            properties: {
                name: {
                    required: false,
                    type: 'string',
                    message: {
                        type: 'Name must be string',
                        required: 'Name is missing'
                    }
                },
                status: {
                    required: false,
                    type: 'string',
                    message: {
                        type: 'status must be string',
                        required: 'status is missing'
                    }
                },
                useCase: {
                    required: false,
                    type: 'string',
                    message: {
                        type: 'useCase must be string',
                        required: 'useCase is missing'
                    }
                },
                DBType: {
                    required: false,
                    type: 'string',
                    message: {
                        type: 'DBType must be string',
                        required: 'DBType is missing'
                    }
                },
                destinationDB: {
                    required: false,
                    type: 'string',
                    message: {
                        type: 'destinationDB must be string',
                        required: 'destinationDB is missing'
                    }
                },
                profile: {
                    required: false,
                    type: 'string',
                    message: {
                        type: 'profile must be string',
                        required: 'profile is missing'
                    }
                },
                params: {
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
                        value: {
                            required: false,
                            type: 'string',
                            messages: {
                                required: 'value is missing',
                                type: 'value must be of string type'
                            }
                        }
                    },
                    messages: {
                        required: 'params is missing',
                        type: 'params must be of array type'
                    }
                },
                tables: {
                    required: true,
                    type: 'array'
                }
            }
        }
    }
};

module.exports = {
    get,
    Detail,
    id,
    create,
    update
};
