let str = `select * from apipayload where 1=1  [AND nice='{{cook}}']  [AND nice2='{{cook2}}']  AND ([nice='{{cook}}'] OR [nice='{{cook}}']) `;
while (str.match(/\[(.*?)\]/) && str.match(/\[(.*?)\]/).length > 0) {
  let matches = str.match(/\[(.*?)\]/);
  console.log(matches[0], 'replaced')
  str = str.replace(/\[(.*?)\]/, matches[1]);
  console.log(str)
}
console.log(str);