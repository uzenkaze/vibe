const v = {};
try {
  console.log(v.ownerText?.runs[0].text);
} catch (e) {
  console.log("Error:", e.message);
}
