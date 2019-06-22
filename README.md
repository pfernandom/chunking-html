# chunking-html
An Express server showcasing how HTML Chunking behaves, including blocking resources for Critical Rendering Path

## Why?
I've read from multiple sources about HTML streaming (chunking) as a way to increase perceived page load performance, but it was very difficult for me to visualize it without an example.

Most examples I've seen don't exactly show what happens if one chunk takes considerably more time to be streamed than the previous, or what happens with multiple chunks with varying latencies.

### Critical rendering Path
Another thing that was difficult to visualize to me were concepts like "blocking resources" like CSS and JS files; especially because HTML can be rendered in chunks one would think that CSS and JS can be chunked too.

This project adds blocking CSS and JS scripts which finish loading after a timeout, specifically to verify what happens when we also stream blocking resources (_spoiler alert, they still block rendering of the HTML_)


## How
Node's Express allows writing chunks into a response stream using [Node streams](https://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback), via its `response.write(chunk)` method.

Using that method, we can simulate streaming multiple chunks with different latencies: 

```
app.get('/', function (req, res) {
  res.write('<html>');
  res.write('<h1 class="my-text">Hello</h1>');
  
  setTimeout(function() {
    res.write("<div>I took too long to load, like 5 seconds!</div>");
    res.write('</html>');
    res.end();
  }, 5000);
});
```

Here, we stream first the openning tag `<html>` and the `<h1>` tag, then we wait for 5 seconds and we stream the rest of the document.

In a real-world application, instead of a timeout we can do some costly operation like querying a DB. The browser will render the `<h1>` element and as more chunks are streamed, more parts of the page will be rendered.
In this way, we can get content to the user as fast as possible, without having to wait for those costly operations to finish before even sending the first byte of response.

### Scripts and stylesheets
Using the same chunking technique, we can return JS and CSS files:

```
app.get('/styles.css', function (req, res) {
  res.write('h1 { background-color:blue; }');
  res.write('.my-text { background-color:yellow; }');
  setTimeout(function() {
    res.write(" body { background-color: grey; }");
    res.end();
  }, 4000);
});

app.get('/script.js', function (req, res) {
  res.write('console.log("hello");');
  setTimeout(function() {
    res.write('console.log("world");');
    res.end();
  }, 4000);
});
```

Unlike the chunked HTML, the browser will not execute/render each chunk as it gets it. It has to wait for the whole file to finish loading before it can continuing rendering the HTML which is declared after these `<link>` and `<script>` tags. So, even if we stream these resources, they will still block rendering.
For example, once the browser gets to the `<script>` tag for the `script.js` file we defined above, both `hello` and `world` will be printed in console at the same time, after the 4 seconds delay.

Why is the browser not processing these files as they get streamed? This is out of the scope of this text, but from a high point of view is because **the browser cannot correctly calculate styles or execute scripts without knowing the whole content of the file**.
Take as an example a JavaScript file. Thanks to [hoisting](https://www.w3schools.com/js/js_hoisting.asp), declarations of JavaScript functions can be bellow their invocations:

```
main();

function main(){
  console.log('Go main!');
}
```

So, even if the browser browser is able to read the first line with `main()`, how would it know what to execute if it doesn't have the function declaration yet?.


### Fixing blocking resources
There are multiple ways to remove blocking CSS and JS, like inlining critical CSS and JS. It won't change the blocking behavior of the `<script>` and `<link>` tags, but it will reduce the overhead of extra network requests and (hopefully) it will be smaller in content than the full, non-critical resources.

- https://developers.google.com/speed/docs/insights/BlockingJS

##Demo
![Gif showing the server running](./demo.gif)