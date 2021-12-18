import { mean, std } from 'mathjs';

function multipleSheets({
  excel, numSheetsPerStudent, scoreKey, outputKeys,
} = {}) {
  if (!excel) throw Error('您尚未上傳成績表格。');
  if (!numSheetsPerStudent) throw Error('請選擇成績所在的表格');
  if (!scoreKey) throw Error('請選擇成績所在的欄位');

  const groupsOfStudents = [];
  let groupsOfStatistics = [];
  const scores = [];

  let groupOfStudents = [];

  Object.entries(excel).forEach(([teacher, sheet], sheetIndex) => {
    const groupIndex = Math.floor(sheetIndex / numSheetsPerStudent);
    const scoresPerTeacher = [];
    sheet.forEach((oneRawOfStudentInfo, studentIndex) => {
      const score = Number(oneRawOfStudentInfo[scoreKey]);

      if (sheetIndex % numSheetsPerStudent === 0) {
        groupOfStudents.push({
          ...oneRawOfStudentInfo,
          scores: [],
        });
      }

      scores.push(score);
      scoresPerTeacher.push(score);
      groupOfStudents[studentIndex].scores.push(score);
    });

    groupsOfStatistics[groupIndex] = {
      ...groupsOfStatistics[groupIndex],
      [`${teacher}平均分數`]: mean(scoresPerTeacher),
      [`${teacher}標準差`]: std(scoresPerTeacher),
    };

    if (sheetIndex % numSheetsPerStudent === (numSheetsPerStudent - 1)) {
      let groupOfScores = [];
      groupOfStudents.forEach(({ scores: studentScores }) => {
        groupOfScores = [...groupOfScores, ...studentScores];
      });

      groupsOfStatistics[groupIndex] = {
        ...groupsOfStatistics[groupIndex],
        組別平均分數: mean(groupOfScores),
        組別標準差: std(groupOfScores),
      };

      groupsOfStudents.push(groupOfStudents);
      groupOfStudents = [];
    }
  });

  groupsOfStatistics = groupsOfStatistics.map((groupOfStatistics) => ({
    ...groupOfStatistics,
    總平均: mean(scores),
    總標準差: std(scores),
  }));

  const groupsOfStudentsWithStatistics = [];

  groupsOfStudents.forEach((oneGroupOfStudents, groupIndex) => {
    const groupOfStudentsWithOnlyOutputKeys = [];

    oneGroupOfStudents.forEach((studentInOneGroup) => {
      const studentWithOnlyOutputKeys = {};

      outputKeys.forEach((outputKey) => {
        studentWithOnlyOutputKeys[outputKey] = studentInOneGroup[outputKey];
      });
      studentWithOnlyOutputKeys.學生平均分數 = mean(studentInOneGroup.scores);

      groupOfStudentsWithOnlyOutputKeys.push(studentWithOnlyOutputKeys);
    });

    groupsOfStudentsWithStatistics.push(groupOfStudentsWithOnlyOutputKeys.map((studentInfo) => ({
      ...studentInfo,
      ...groupsOfStatistics[groupIndex],
      總平均: mean(scores),
      總標準差: std(scores),
    })));
  });

  return groupsOfStudentsWithStatistics;
}

export default {
  multipleSheets,
};
