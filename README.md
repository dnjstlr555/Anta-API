# Anta-API
Aiming for high responsibility, high accessibility and fancy<br>

It provide files and folders to client using Node.js / Javascript.<br>

# API
## Get Started
Built-in:<br>
<code>
  var data = JSON.parse(document.getElementById('list').getAttribute('data-list'));<br>
  console.log(&#96;files:${data.files} directories: ${data.directories} request-url(decoded): ${data.url}&#96;);<br>
</code>

jquery:<br>
<code>
  var data = $('#list').data('list');
  console.log(&#96;files:${data.files} directories: ${data.directories} request-url(decoded): ${data.url}&#96;); <br>
</code>
<br>
<br>
## Data
### File element
 - file.birth: The timestamp indicating the last time the file status was changed.<br>
 - file.ctime: The timestamp indicating the creation time of this file.<br><br>
### Folder element
 - folder.birth: The timestamp indicating the last time the file status was changed.<br>
