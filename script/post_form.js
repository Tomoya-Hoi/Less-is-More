//立ち上げ作業
osql.requireLogin();

window.addEventListener("DOMContentLoaded", () => {
  const userId = sessionStorage.getItem("user_id");
  const userField = document.getElementById("user_id_display");
  const submitBtn = document.getElementById("submitBtn");

  if (userId) {
    userField.value = userId;
    submitBtn.disabled = false;
  } else {
    userField.value = "ログインしていません";
    submitBtn.disabled = true;
  }
});


//メイン処理
function submitButtonPressed() {
    main();
}

async function main() {
  console.log("main");

  const formData = getFormDataById({
    userId: "user_id_display",
    title: "title",
    content: "content",
    tag: "tag"
  });

  const cleaned = cleanData(formData);
  const tagId = await ensureTagExists(cleaned.tag);

  const sqls = generateSQL({
    ...cleaned,
    tag: tagId // タグ名をタグIDに置き換えて渡す
  });

  // 🔧 SQLを結合して一括実行（これでLAST_INSERT_IDが有効）
  const combinedSQL = sqls.join('\n');
  await osql.connect(combinedSQL);

  alert("投稿が完了しました！");
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

async function ensureTagExists(tagName) {
  const esc = (str) => str.replace(/'/g, "''");
  const escapedTag = esc(tagName);

  // タグが存在しなければ追加
  const insertSQL = `INSERT IGNORE INTO tags (name) VALUES ('${escapedTag}');`;
  await osql.connect(insertSQL);

  // タグIDを取得
  const selectSQL = `SELECT id FROM tags WHERE name = '${escapedTag}';`;
  const res = await osql.connect(selectSQL);

  if (res.length > 0) {
    return res[0].id;
  } else {
    throw new Error("タグIDの取得に失敗しました");
  }
}

function cleanData(data) {
  console.log("cleanData()");

  const cleaned = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      cleaned[key] = value.trim(/\s+/g, '');
    } else {
      cleaned[key] = value;
    }
  }

  console.log(cleaned);
  return cleaned;
}

function generateSQL(data) {
  console.log("generateSQL()");
  
  const esc = (str) => str.replace(/'/g, "''"); // シングルクォートのエスケープ
  
  const userId = esc(data.userId);
  const title = esc(data.title);
  const content = esc(data.content);
  const tag = esc(data.tag);
  
  const resourceSql = `
    INSERT INTO resources (user_id, title, content)
    VALUES ('${userId}', '${title}', '${content}');
  `;
  
  const tagSql = `
    INSERT INTO resource_tag_map (resource_id, tag_id)
    VALUES (LAST_INSERT_ID(), '${tag}');
  `;
  
  const lst = [resourceSql.trim(), tagSql.trim()]; 

  console.log(lst);
  return lst;
}

async function doSQL(lst) {
  console.log("doSQL()");

  const results = [];
  for (const sql of lst) {
    const result = await osql.connect(sql);
    results.push(result);
  }

  console.log("result = ", results);
  return results;
}

