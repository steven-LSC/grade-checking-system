export default function ({ students, scoreKey, scoreGapThreshold } = {}) {
  const invalidStudents = [];

  students.forEach((student) => {
    const scores = student[scoreKey].split('\n').map(Number);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    // todo: 確認大於等於?
    if ((maxScore - minScore) >= scoreGapThreshold) {
      invalidStudents.push(student);
    }
  });

  return invalidStudents;
}
