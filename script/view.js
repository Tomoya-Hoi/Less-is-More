osql.requireLogin();

window.onload = function () {
  main();
}

//ボタン処理
function backButtonPressed() {
   window.location.href = "index.html";
}


//メイン処理
async function main() {
  const resourceID = getPostIdFromURL();
  const sql = makeSQL(resourceID);
  const object = await doSQL(sql); 
  console.log(object); 
  insertHTML(object[0]);
}

//投稿ID取得
function getPostIdFromURL(){
  console.log("getPostIdFromURL()")
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

//投稿データ取得
function makeSQL(id) {
  console.log("makeSQL()");
  const sql = `SELECT * FROM resources where id = ${id};`;

  console.log(sql);
  return sql.trim();
} 

async function doSQL(sql) {
  console.log("doSQL()");
  const object = await osql.connect(sql);


  console.log("result =", object);
  return object;
}

function insertHTML(obj) {
  console.log("insertHTML()");

  console.log("post-title =", document.getElementById("post-title"));
  console.log(obj.title)  
  document.getElementById("post-title").innerHTML = obj.title;

  console.log(obj.content)
  document.getElementById("post-content").innerHTML = obj.content;

  const meta = `投稿ID: ${obj.id} / 作成日: ${obj.created_at}`;
  document.getElementById("post-meta").innerHTML = meta;
  
}