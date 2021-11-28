import xlsx from 'xlsx';

function rawExcelToJson({ value: { files: [rawFile] } }) {
  return new Promise((resolve) => {
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(rawFile);
    fileReader.onload = (event) => {
      const excel = event.target.result;
      const workbook = xlsx.read(excel, { type: 'binary' });
      const { SheetNames: sheetNames } = workbook;

      resolve(xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]));
    };
  });
}
export default {
  rawExcelToJson,
};
