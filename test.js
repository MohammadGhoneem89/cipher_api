let _ = require('lodash');
let x = [[{ "label": "ORG1" }, { "label": "ETISALAT" }, { "label": "GEMS" }], [{ "RECONCILED": 3 }], [{ "EXCEPTION": 3 }], [{ "WARNING": 3 }]];

console.log(x)
let labelList = []
let data = {}

x.forEach((elem, index) => {
  elem.forEach((label) => {
    if (index == 0) {
      for (let key in label) {
        labelList.push(label[key])
      }
    } else {
      for (let key in label) {
        let temp = _.get(data, key, []);
        temp.push(label[key]);
        _.set(data, key, temp);
      }
    }
  })

});

let dsList = []
for (let elem in data) {
  dsList.push({
    label: elem,
    fill: false,
    lineTension: 0.1,
    pointBorderWidth: 1,
    pointHoverRadius: 5,
    pointHoverBorderWidth: 2,
    pointRadius: 1,
    pointHitRadius: 10,
    data: data[elem]
  })
}
const dataRender = {
  labels: labelList,
  datasets: dsList
};
console.log(dataRender);

