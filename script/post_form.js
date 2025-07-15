function submitButtonPressed() {
    main();
}

function main() {
  const postData = getFormDataById({
    title: 'title',
    content: 'content',
    tag: 'tag'
  });
  const cleanedData = cleanData(postData);
}

function getFormDataById(mapping) {
  console.log("getFormDataById()");

  const object = {};
  for (const [key, id] of Object.entries(mapping)) {
    object[key] = document.getElementById(id).value;
  }

  console.log(object);
  return object;
}

function cleanData(data) {
  console.log("cleanData()");

  const title = data.title.replace(/\s+/g, '');
  const content = data.content.replace(/\s+/g, '');
  const tag = data.tag.replace(/\s+/g, '');
  const object = {title, content, tag};
  
  console.log(object);
  return object;
}

function validateData(data) {
  console.log("validateData()");

  if (data.username === "" || data.password === "") {
    const message = "ユーザーネーム、あるいはパスワードを入力してください。";
    document.getElementById('result').innerHTML = message;
    throw new Error(message);
  }
  
  console.log("true");
  return data;
}