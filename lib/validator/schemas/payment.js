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
                },
                code: {
                    required: false,
                    type: 'string',
                    message: {
                        type: 'Code must be string',
                        required: 'Code is missing'
                    }
                },
                beneficiaryInfo: {
                    properties: {
                        key: {
                            required: false,
                            type: 'string',
                            message: {
                                type: 'Key must be string',
                                required: 'Key is missing'
                            }
                        },
                        value: {
                            required: false,
                            type: 'string',
                            message: {
                                type: 'Value must be string',
                                required: 'Value is missing'
                            }
                        }
                    },
                    message: {
                        type: 'beneficiaryInfo must be object',
                        required: 'beneficiaryInfo is missing'
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
                code: {
                    required: false,
                    type: 'string',
                    message: {
                        type: 'Code must be string',
                        required: 'Code is missing'
                    }
                },
                beneficiaryInfo: {
                    properties: {
                        key: {
                            required: false,
                            type: 'string',
                            message: {
                                type: 'Key must be string',
                                required: 'Key is missing'
                            }
                        },
                        value: {
                            required: false,
                            type: 'string',
                            message: {
                                type: 'Value must be string',
                                required: 'Value is missing'
                            }
                        }
                    },
                    message: {
                        type: 'beneficiaryInfo must be object',
                        required: 'beneficiaryInfo is missing'
                    }
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
                code: {
                    required: false,
                    type: 'string',
                    message: {
                        type: 'Code must be string',
                        required: 'Code is missing'
                    }
                },
                beneficiaryInfo: {
                    properties: {
                        key: {
                            required: false,
                            type: 'string',
                            message: {
                                type: 'Key must be string',
                                required: 'Key is missing'
                            }
                        },
                        value: {
                            required: false,
                            type: 'string',
                            message: {
                                type: 'Value must be string',
                                required: 'Value is missing'
                            }
                        }
                    },
                    message: {
                        type: 'beneficiaryInfo must be object',
                        required: 'beneficiaryInfo is missing'
                    }
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
