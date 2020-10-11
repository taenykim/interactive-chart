const incomeAmounts = [3000, 5000, 10000, 15000, 20000, 50000];
const incomeTypes = ["월급", "용돈", "기타수입"];

const outlayAmounts = [-1000, -3000, -5000, -10000, -30000, -50000];
const outlayTypes = ["식비", "생활", "쇼핑/뷰티", "교통", "의료/건강", "문화/여가", "미분류"];

const fs = require("fs");

const generateData = () => {
  const obj = [];
  for (let month = 11; month <= 12; month++) {
    const monthObj = {
      month,
      data: [],
    };
    for (let date = 1; date <= 31; date++) {
      const dateObj = {
        date,
        data: [],
      };
      for (let i = 0; i < 3; i++) {
        const dataObj = {};
        if (Math.floor(Math.random() * 2) % 2 === 0) {
          dataObj[`type`] = incomeTypes[Math.floor(Math.random() * incomeTypes.length)];
          dataObj[`amount`] = incomeAmounts[Math.floor(Math.random() * incomeAmounts.length)];
        } else {
          dataObj[`type`] = outlayTypes[Math.floor(Math.random() * outlayTypes.length)];
          dataObj[`amount`] = outlayAmounts[Math.floor(Math.random() * outlayAmounts.length)];
        }
        dateObj.data.push(dataObj);
      }
      monthObj.data.push(dateObj);
    }
    obj.push(monthObj);
  }
  fs.writeFileSync(__dirname + "/data.json", JSON.stringify(obj), "utf8");
};

generateData();
