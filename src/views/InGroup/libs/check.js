function scoreDiff({ students, scoreGapThreshold } = {}) {
  if (!scoreGapThreshold) throw Error('請填寫差分過大的門檻。');

  const invalidStudents = [];

  students.forEach((student) => {
    const { scores } = student;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    // todo: 確認大於等於?
    if ((maxScore - minScore) >= scoreGapThreshold) {
      invalidStudents.push(student);
    }
  });

  return invalidStudents;
}

function classDiff({ students, scoreClasses } = {}) {
  scoreClasses.forEach((scoreClass, index) => {
    if (typeof scoreClass.start !== 'number') throw Error(`請填寫第${index + 1}級距開始成績。`);
    if (typeof scoreClass.end !== 'number') throw Error(`請填寫第${index + 1}級距結束成績。`);
    if (scoreClass.start >= scoreClass.end) throw Error(`第${index + 1}級距結束成績需要大於開始成績。`);
  });

  console.log(scoreClasses);

  const invalidStudents = [];

  students.forEach((student) => {
    const studentScoreClasses = student.scores.map((score) => {
      switch (true) {
        case (score >= scoreClasses[0].start && score < scoreClasses[0].end):
          return 0;
        case (score >= scoreClasses[1].start && score < scoreClasses[1].end):
          return 1;
        case (score >= scoreClasses[2].start && score < scoreClasses[2].end):
          return 2;
        case (score >= scoreClasses[3].start && score < scoreClasses[3].end):
          return 3;
        default:
          throw Error(`有同學的成績為${score}並不在您定義的範圍內`);
      }
    });

    const maxStudentScoreClass = Math.max(...studentScoreClasses);
    const minStudentScoreClass = Math.min(...studentScoreClasses);

    if ((maxStudentScoreClass - minStudentScoreClass) >= 2) {
      invalidStudents.push(student);
    }
  });

  return invalidStudents;
}

export default {
  scoreDiff,
  classDiff,
};
