function singleSheet({ excel, sheetKey, scoreKey } = {}) {
  if (!excel) throw Error('您尚未上傳成績表格。');
  if (!sheetKey) throw Error('請選擇成績所在的表格');
  if (!scoreKey) throw Error('請選擇成績所在的欄位');

  excel[sheetKey].forEach((student) => {
    student[scoreKey].split('\n').map(Number);
  });

  return excel[sheetKey];
}

function multipleSheets({ excel, numSheetsPerStudent, scoreKey } = {}) {
  if (!excel) throw Error('您尚未上傳成績表格。');
  if (!numSheetsPerStudent) throw Error('請選擇成績所在的表格');
  if (!scoreKey) throw Error('請選擇成績所在的欄位');

  let students = [];
  let group = [];

  Object.entries(excel).forEach(([, sheet], sheetIndex) => {
    if (sheetIndex % numSheetsPerStudent === 0) {
      sheet.forEach((oneRawOfStudentInfo) => {
        group.push({
          ...oneRawOfStudentInfo,
          scores: [Number(oneRawOfStudentInfo[scoreKey])],
        });
      });

      return;
    }

    sheet.forEach((oneRawOfStudentInfo, studentIndex) => {
      group[studentIndex].scores.push(Number(oneRawOfStudentInfo[scoreKey]));
    });

    if (sheetIndex % numSheetsPerStudent === (numSheetsPerStudent - 1)) {
      students = [...students, ...group];
      group = [];
    }
  });

  return students;
}

export default {
  singleSheet,
  multipleSheets,
};
