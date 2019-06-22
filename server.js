
var express= require('express');

var app=express();

const PORT = 8080;

app.get('/', function (req, res) {
  res.write('<html>');
  res.write('<head><link rel="stylesheet" href="/styles.css"/></head>');
  res.write('<h1 class="my-text">Hello</h1>');
  
  setTimeout(function() {
    res.write("<h1>Hello</h1>");
    res.write('<script async src="/script.js"></script>');
    res.write('<script src="/script2.js"></script>');
    res.write('<h1>After JS</h1>');
    res.write('<link rel="stylesheet" href="/styles2.css"/>');
    res.write('<h1>After second CSS</h1>');
    res.write('<script>');
    res.write('console.log("I\'m inlined!");');

    setTimeout(function() {
      res.write('console.log("I\'m inlined too!"); </script>')
      res.write('<h1>After inline JS</h1>');
      res.write('</html>');
      res.end();
    }, 5000);
  }, 5000);
});

app.get('/styles.css', function (req, res) {
  res.write('h1 { background-color:blue; }');
  res.write('.my-text { background-color:yellow; }');
  setTimeout(function() {
    res.write(" body { background-color: grey; }");
    res.end();
  }, 4000);
});

app.get('/styles2.css', function (req, res) {
  res.write('h1 { background-color:orange; }');
  setTimeout(function() {
    res.end();
  }, 5000);
});

app.get('/script.js', function (req, res) {
  res.write('console.log("hello");');
  setTimeout(function() {
    res.write('console.log("world");');
    res.end();
  }, 4000);
});

app.get('/script2.js', function (req, res) {
  res.write('console.log("hello 2");');
  setTimeout(function() {
    res.write('console.log("world 2");');
    res.end();
  }, 4000);
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.listen(PORT, ()=>{
  console.log(`Server is up in ${PORT}`);
});