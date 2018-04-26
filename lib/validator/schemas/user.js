'use strict';

const commonConst = require('../../constants/common');
const common = require('./common');

const userID = {
  required: true,
  type: 'string',
  messages: {
    required: 'userID is missing',
    type: 'userID must be of string type'
  }
};

const userDetails = {
  properties: {
    userID: userID,
    action: common.action,
    id: {
      required: false,
      type: 'string',
      messages: {
        required: 'id is missing',
        type: 'id must be of string type'
      }
    }
  }
};

const get = {
  properties: {
    action: common.action,
    page: common.page,
    searchCriteria: {
      type: 'object',
      required: true,
      properties: {
        userID: {
          required: false,
          type: 'string',
          messages: {
            required: 'userID is missing',
            type: 'userID must be of string type'
          }
        },
        firstName: {
          required: false,
          type: 'string',
          messages: {
            required: 'firstName is missing',
            type: 'firstName must be of string type'
          }
        },
        lastName: {
          required: false,
          type: 'string',
          messages: {
            required: 'lastName is missing',
            type: 'lastName must be of string type'
          }
        },
        isActive: {
          required: false,
          type: 'boolean',
          messages: {
            required: 'isActive is missing',
            type: 'isActive must be of boolean type'
          }
        }
      },
      messages: {
        required: 'searchCriteria is missing',
        type: 'searchCriteria must be of object type'
      }
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
        userType: {
          required: true,
          type: 'string',
          enum: commonConst.user.userType,
          messages: {
            required: 'userType is missing',
            type: 'userType must be of string type',
            enum: `only ${commonConst.user.userType} allowed`
          }
        },
        userID: userID,
        entityID: {
          required: false,
          type: 'string',
          messages: {
            required: 'entityID is missing',
            type: 'entityID must be of string type'
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
        acquirerID: {
          required: false,
          type: 'string',
          messages: {
            required: 'acquirerID is missing',
            type: 'acquirerID must be of string type'
          }
        },
        isActive: {
          required: true,
          type: 'boolean',
          messages: {
            required: 'isActive is missing',
            type: 'isActive must be of boolean type'
          }
        },
        orgType: {
          required: true,
          type: 'string',
          enum: commonConst.user.orgType,
          messages: {
            required: 'orgType is missing',
            type: 'orgType must be of string type',
            enum: `only ${commonConst.user.orgType} allowed`
          }
        },
        groups: {
          required: true,
          type: 'array',
          minItems: 1,
          messages: {
            required: 'groups is missing',
            type: 'groups must be of array type',
            minItems: 'groups must have minimum one item'
          }
        }
      },
      messages: {
        required: 'data is missing',
        type: 'data must be of object type'
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
        userType: {
          required: true,
          type: 'string',
          enum: commonConst.user.userType,
          messages: {
            required: 'userType is missing',
            type: 'userType must be of string type',
            enum: `only ${commonConst.user.userType} allowed`
          }
        },
        userID: userID,
        id: {
          required: true,
          type: 'string',
          messages: {
            required: 'id is missing',
            type: 'id must be of string type'
          }
        },
        entityID: {
          required: false,
          type: 'string',
          messages: {
            required: 'entityID is missing',
            type: 'entityID must be of string type'
          }
        },
        acquirerID: {
          required: false,
          type: 'string',
          messages: {
            required: 'acquirerID is missing',
            type: 'acquirerID must be of string type'
          }
        },
        isActive: {
          required: true,
          type: 'boolean',
          messages: {
            required: 'isActive is missing',
            type: 'isActive must be of boolean type'
          }
        },
        orgType: {
          required: true,
          type: 'string',
          enum: commonConst.user.orgType,
          messages: {
            required: 'orgType is missing',
            type: 'orgType must be of string type',
            enum: `only ${commonConst.user.orgType} allowed`
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
        groups: {
          required: true,
          type: 'array',
          minItems: 1,
          messages: {
            required: 'groups is missing',
            type: 'groups must be of array type',
            minItems: 'groups must have minimum one item'
          }
        }
      },
      messages: {
        required: 'data is missing',
        type: 'data must be of object type'
      }
    }
  }
};

const createHuman = {
  properties: {
    data: {
      type: 'object',
      required: true,
      properties: {
        firstName: {
          required: true,
          type: 'string',
          messages: {
            required: 'firstName is missing',
            type: 'firstName must be of string type'
          }
        },
        lastName: {
          required: false,
          type: 'string',
          messages: {
            required: 'lastName is missing',
            type: 'lastName must be of string type'
          }
        },
        authType: {
          required: true,
          type: 'string',
          enum: commonConst.user.authType,
          messages: {
            required: 'authType is missing',
            type: 'authType must be of string type',
            enum: `only ${commonConst.user.authType} allowed`
          }
        },
        email: {
          required: true,
          type: 'string',
          format: 'email',
          messages: {
            required: 'email is missing',
            type: 'email must be of string type',
            format: 'invalid email address'
          }
        },
        allowedIPRange: {
          required: true,
          type: 'array',
          minItems: 1,
          messages: {
            required: 'allowedIPRange is missing',
            type: 'allowedIPRange must be of array type',
            minItems: 'allowedIPRange must have minimum one item'
          }
        }
      },
      messages: {
        required: 'data is missing',
        type: 'data must be of object type'
      }
    }
  }
};
const userTypeAPI = {
  properties: {
    data: {
      type: 'object',
      required: true,
      properties: {
        password: {
          required: true,
          type: 'string',
          messages: {
            required: 'password is missing',
            type: 'password must be of string type'
          }
        },
        passwordHashType: {
          required: true,
          type: 'string',
          enum: commonConst.user.hashTypes,
          messages: {
            required: 'passwordHashType is missing',
            type: 'passwordHashType must be of string type',
            enum: `only ${commonConst.user.hashTypes} allowed`
          }
        }
      },
      messages: {
        required: 'data is missing',
        type: 'data must be of object type'
      }
    }
  }
};

const changePassword = {
  properties: {
    data: {
      type: 'object',
      required: true,
      properties: {
        oldPassword: {
          required: true,
          type: 'string',
          messages: {
            required: 'oldPassword is missing',
            type: 'oldPassword must be of string type'
          }
        },
        newPassword: {
          required: true,
          type: 'string',
          messages: {
            required: 'newPassword is missing',
            type: 'newPassword must be of string type'
          }
        }
      },
      messages: {
        required: 'data is missing',
        type: 'data must be of object type'
      }
    }
  }
};

const authenticateUser = {
  properties: {
    Password: {
      required: true,
      type: 'string',
      messages: {
        required: 'Password is missing',
        type: 'Password must be of string type'
      }
    },
    userCode: {
      required: true,
      type: 'string',
      messages: {
        required: 'User code is Required',
        type: 'userCode must be of string type'
      }
    },
    Lang: {
      required: false,
      type: 'string',
      messages: {
        required: 'Lang is missing',
        type: 'Lang must be of string type'
      }
    }
  }
};

const resetPassword = {
  properties: {
    action: common.action,
    userID: {
      required: true,
      type: 'string',
      messages: {
        required: 'userID is missing',
        type: 'userID must be of string type'
      }
    },
    email: {
      required: true,
      type: 'string',
      messages: {
        required: 'email is missing',
        type: 'email must be of string type'
      }
    }
  }
};

const setPassword = {
  properties: {
    action: common.action,
    passwordToken: {
      required: true,
      type: 'string',
      messages: {
        required: 'passwordToken is missing',
        type: 'passwordToken must be of string type'
      }
    },
    newPassword: {
      required: true,
      type: 'string',
      messages: {
        required: 'newPassword is missing',
        type: 'newPassword must be of string type'
      }
    }
  }
};

const updateStatus = {
  properties: {
    userCode: {
      required: true,
      type: 'string',
      messages: {
        required: 'userCode is missing',
        type: 'userCode must be of string type'
      }
    },
    lang: {
      required: false,
      type: 'string',
      messages: {
        required: 'lang is missing',
        type: 'lang must be of string type'
      }
    },
    isActive: {
      required: true,
      type: 'boolean',
      messages: {
        required: 'isActive is missing',
        type: 'isActive must be of boolean type'
      }
    }
  }
};

const isAvailable = {
  properties: {
    userCode: {
      required: true,
      type: 'string',
      messages: {
        required: 'userCode is missing',
        type: 'userCode must be of string type'
      }
    },
    lang: {
      required: false,
      type: 'string',
      messages: {
        required: 'lang is missing',
        type: 'lang must be of string type'
      }
    }
  }
};

const ssoResetPassword = {
  properties: {
    action: common.action,
    userCode: {
      required: true,
      type: 'string',
      messages: {
        required: 'userCode is missing',
        type: 'userCode must be of string type'
      }
    },
    lang: {
      required: false,
      type: 'string',
      messages: {
        required: 'lang is missing',
        type: 'lang must be of string type'
      }
    },
    password: {
      required: true,
      type: 'string',
      messages: {
        required: 'New and confirm passwords are required',
        type: 'password must be of string type'
      }
    },
    confirmPassword: {
      required: true,
      type: 'string',
      messages: {
        required: 'New and confirm passwords are required',
        type: 'confirmPassword must be of string type'
      }
    },
    hintAnswer: {
      required: false,
      type: 'string',
      messages: {
        required: 'Hint answer is required',
        type: 'hintAnswer must be of string type'
      }
    }
  }
};

const searchUser = {
  properties: {
    action: common.action,
    userCode: {
      required: false,
      type: 'string',
      messages: {
        required: 'userCode is missing',
        type: 'userCode must be of string type'
      }
    },
    type: {
      required: false,
      type: 'string',
      messages: {
        required: 'type is missing',
        type: 'type must be of string type'
      }
    },
    subtype: {
      required: false,
      type: 'string',
      messages: {
        required: 'subtype is missing',
        type: 'subtype must be of string type'
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
    active: {
      required: false,
      type: 'boolean',
      messages: {
        required: 'active is missing',
        type: 'active must be of boolean type'
      }
    }
  }
};

const unlockUser = {
  properties: {
    action: common.action,
    userID: {
      required: true,
      type: 'string',
      messages: {
        required: 'userID is missing',
        type: 'userID must be of string type'
      }
    }
  }
};

module.exports = {
  get,
  create,
  update,
  createHuman,
  userTypeAPI,
  userID,
  userDetails,
  changePassword,
  authenticateUser,
  resetPassword,
  setPassword,
  updateStatus,
  isAvailable,
  ssoResetPassword,
  searchUser,
  unlockUser
};
