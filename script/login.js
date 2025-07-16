osql.requireLogin();

window.onload = function () {
  if (checkSession()) {
    jumpIndex();
  }
};

function loginButtonPressed() {
  main();
}

async function main() {
  console.log("main()");

  const rawData = getFormData({
    username: 'usernameForm',
    password: 'passwordForm'
  });

  const cleanedData = cleanData(rawData);
  const validatedData = validateData(cleanedData);
  const sql = makeSQL(validatedData);
  const userData = await doSQL(sql);
  const session = makeSession(userData);

  if (!session) {
    document.getElementById('result').innerHTML = "ログインに失敗しました。";
    return false;
  }

  jumpIndex();
  return true;
}

function getFormData(mapping) {
  console.log("getFormData()");
  const object = {};

  for (const [key, id] of Object.entries(mapping)) {
    object[key] = document.getElementById(id).value;
  }

  console.log(object);
  return object;
}

function cleanData(data) {
  console.log("cleanData()");
  const username = data.username.replace(/\s+/g, '');
  const password = data.password.replace(/\s+/g, '');
  const object = { username, password };

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

function makeSQL(data) {
  console.log("makeSQL()");
  const esc = (str) => str.replace(/'/g, "''");
  const username = esc(data.username);
  const password = esc(data.password);
  const sql = `SELECT id, username FROM users WHERE username = '${username}' AND password = '${password}';`;

  console.log("sql =", sql);
  return sql;
}

async function doSQL(sql) {
  console.log("doSQL()");
  const result = await osql.connect(sql);

  console.log("result = ", result);
  return result;
}

function makeSession(data) {
  if (data && data.length > 0) {
    const user = data[0];
    sessionStorage.setItem("user", JSON.stringify(user));
    sessionStorage.setItem("user_id", user.id);

    console.log("session: ", user);
    return user;
  } else {
    console.warn("Failure to make session.");
    return null;
  }
}

function checkSession() {
  const user = sessionStorage.getItem("user");
  return user !== null;
}

function jumpIndex() {
  window.location.href = "index.html";
}
