import xlsx from 'xlsx';

function rawFileToObject({ value: { files: [rawFile] } }) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(rawFile);
    fileReader.onload = (event) => {
      try {
        const { target: { result: excel } } = event;
        const {
          Sheets: sheets,
          SheetNames: sheetNames,
        } = xlsx.read(excel, { type: 'binary' });
        const object = {};

        sheetNames.forEach((sheetName) => {
          object[sheetName] = xlsx.utils.sheet_to_json(sheets[sheetName]);
        });

        resolve(object);
      } catch {
        reject(Error('檔案讀取錯誤，請確認檔案格式是否正確。'));
      }
    };
  });
}

export default {
  rawFileToObject,
};
