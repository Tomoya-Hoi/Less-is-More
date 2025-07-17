// 立ち上げ
osql.requireLogin();

window.onload = function () {
  const user = JSON.parse(sessionStorage.getItem("user"));

  if (user && user.username) {
    const greeting = document.getElementById("greeting");
    greeting.textContent = `こんにちは、${user.username}さん`;
  }
};

// メイン処理
window.onload = function () {
  main();
}

async function main() {
  const sql = makeSQL();
  const res = await doSQL(sql);
  const rows = makeHTML(res);
  insertHTML(rows);
}


// function makeSQL() {
//   console.log("makeSQL()");
//   const sql = `
//     SELECT 
//       r.id AS resource_id,
//       r.title,
//       r.content,
//       r.created_at,
//       u.username,
//       GROUP_CONCAT(t.name) AS tags
//     FROM resources r
//     JOIN users u ON r.user_id = u.id
//     LEFT JOIN resource_tag_map rt ON r.id = rt.resource_id
//     LEFT JOIN tags t ON rt.tag_id = t.id
//     GROUP BY r.id
//     ORDER BY r.created_at DESC
//     LIMIT 16;
//   `;

//   console.log(sql);
//   return sql.trim();
// }

function makeSQL() {
  console.log("makeSQL()");
  const sql = `
    SELECT 
      r.id AS resource_id,
      r.title,
      r.content,
      r.created_at,
      u.username,
      GROUP_CONCAT(t.name) AS tags,
      IFNULL(MAX(tag_counts.post_count), 0) AS tag_popularity
    FROM resources r
    JOIN users u ON r.user_id = u.id
    LEFT JOIN resource_tag_map rt ON r.id = rt.resource_id
    LEFT JOIN tags t ON rt.tag_id = t.id
    LEFT JOIN (
      SELECT 
        tag_id,
        COUNT(*) AS post_count
      FROM resource_tag_map
      GROUP BY tag_id
    ) AS tag_counts ON rt.tag_id = tag_counts.tag_id
    GROUP BY r.id
    ORDER BY tag_popularity ASC, r.created_at DESC
    LIMIT 16;
  `;

  console.log(sql);
  return sql.trim();
}



async function doSQL(sql) {
  console.log("doSQL()");
  const result = await osql.connect(sql);
  console.log("result = ", result);
  return result;
}

function escapeHTML(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function makeHTML(data) {
  console.log("makeHTML()");

  const rows = [];

  if (!Array.isArray(data) || data.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="4">投稿がありません。</td>`;
    rows.push(row);
    return rows;
  }

  for (const item of data) {
    const row = document.createElement("tr");

    const titleLink = `<a href="view.html?id=${item.resource_id}">
                         ${escapeHTML(item.title)}
                       </a>`;

    row.innerHTML = `
      <td>${item.created_at ?? "不明"}</td>
      <td>${titleLink}</td>
      <td>${escapeHTML(item.username ?? "匿名")}</td>
      <td>${escapeHTML(item.tags ?? "")}</td>
    `;

    rows.push(row);
  }

  return rows;
}

function insertHTML(rows) {
  console.log("insertHTML()");

  const tbody = document.getElementById("resource-table-body");
  tbody.innerHTML = "";

  for (const row of rows) {
    tbody.appendChild(row);
  }

  return tbody;
}
