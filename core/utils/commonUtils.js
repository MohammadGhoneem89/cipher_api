'use strict';
module.exports = {
  calculateOffset: function (currentPageNo, pageSize) {
    return pageSize * (currentPageNo - 1);
  },

  formateWhereClause: function (data) {
    return data.reduce((acc, line, index) => {
      if (index == 0) {
        acc = `where ${line}`;
        return acc;
      }
      acc = `${acc} and ${line}`;
      return acc;
    }, '');
  },
  getRecordsCount: function (responseForRecordsLength) {
    let {rows: dataCount = []} = responseForRecordsLength;
    const [recordsLength = []] = dataCount;
    let {numberOfRecords = 0} = recordsLength;
    numberOfRecords = parseInt(numberOfRecords);
    return numberOfRecords;
  },
  createResponseForArray: function (heading, pageSize, currentPageNo, numberOfRecords, rows) {
    const response = {
      [heading]: {
        pageData: {
          pageSize: pageSize,
          currentPageNo: currentPageNo,
          totalRecords: numberOfRecords
        },
        searchResult: rows
      }
    };
    return response;
  },
  createResponseForObject: function (heading, data) {
    const response = {
      [heading]: {
        result: data
      }
    };
    return response;
  },
  createResponseForError: function (UUIDKey, errorDescription, errorCode) {
    const response = {
      messageStatus: 'Error',
      cipherMessageId: UUIDKey,
      errorDescription: errorDescription,
      errorCode: errorCode
    };
    return response;
  }
};