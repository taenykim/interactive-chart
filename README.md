# Interactive Chart

![npm](https://img.shields.io/npm/v/interactive-chart)
![dependencies](https://img.shields.io/badge/dependencies-none-brightengreen)

📈 📉 push datas and make interactive chart 📊

![](./images/screenshot.png)

### Demo

https://interactive-chart.vercel.app/

## How to use

```
npm i interactive-chart
```

```js
new Chart({
  selector: "root", // DOM element id,
  chartTitle: "Accountbook Line Chart", // chart title
  data, // chart data
});
```

```json
// data type
[
  {
    "month": 11,
    "data": [
      {
        "date": 1,
        "data": [
          { "type": "용돈", "amount": 3000 },
          { "type": "생활", "amount": -30000 },
          { "type": "쇼핑/뷰티", "amount": -10000 }
        ]
      },
      {
        "date": 2,
        "data": [
          { "type": "생활", "amount": -30000 },
          { "type": "식비", "amount": -50000 },
          { "type": "월급", "amount": 5000 }
        ]
      },
      ...
```
