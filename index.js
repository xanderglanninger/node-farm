//const fs = require("fs");

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//Synchronous
/*const textIn = fs.readFileSync("./txt/input.txt", "utf-8");

const textOut = `This is what we know of the advocado: ${textIn}.\nCreated on ${Date.now()}`;
fs.writeFileSync("./txt/output.txt", textOut);

console.log("File Written");*/

//Asynchronous way
/*fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
  fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
    console.log(data2);
    fs.readFile(`./txt/append.txt`, "utf-8", (err, data3) => {
      console.log(data3);
      fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
        console.log("File has been written😎");
      });
    });
  });
});

console.log("Reading File!!!");*/

//////////////////////////////////////////////////////////////////////////////////////////////////////////
//SERVER
const http = require("http");
const url = require("url");
const fs = require("fs");
const slugify = require("slugify");

const replaceTemplate = (temp, product) => {
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);

  if (!product.organic) {
    output = output.replace("{%NOT_ORGANIC%}", "not-organic");
  }

  return output;
};

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");

const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, "utf-8");
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, "utf-8");
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, "utf-8");

const dataObj = JSON.parse(data);

const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);
  let requestURL = req.url;

  switch (pathname) {
    case "/" || "/overview":
      {
        res.writeHead(200, { "Content-Type": "text/html" });
        const cardsHtml = dataObj.map((el) => replaceTemplate(tempCard, el)).join("");

        const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
        res.end(output);
      }
      break;
    case "/product":
      {
        const product = dataObj[query.id];
        res.writeHead(200, { "Content-Type": "text/html" });

        const output = replaceTemplate(tempProduct, product);
        res.end(output);
      }
      break;
    case "/api":
      {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(data);
      }
      break;
    default:
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Listening to responses on port 3000");
});
