'use strict';

module.exports = {
  notification: {
    email: true,
    inbox: true,
    emailTemplateId: ''
  },
  info: {
    text: 'Recon file for {type} {name} is due in the next 2 days. Please upload the file.',
    type: 'Info',
    action: '/manualRecon/{type}/{code}',
    params: '?params',
    icon: 'fa fa-plus',
    createdBy: 'System',
    labelClass: 'label label-sm label-danger',
    emailTemplateName: ''
  }
};

