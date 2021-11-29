export default function ({
  students, scoreKey, secondClass, thirdClass,
} = {}) {
  console.log('object');
  const invalidStudents = [];

  students.forEach((student) => {
    const scoreClasses = student[scoreKey].split('\n').map((score) => {
      score = Number(score);

      switch (true) {
        case (score > secondClass.start):
          return 1;
        case (score > secondClass.start && score <= secondClass.end):
          return 2;
        case (score > thirdClass.start && score <= thirdClass.end):
          return 3;
        default:
          return 4;
      }
    });

    const maxClass = Math.max(...scoreClasses);
    const minClass = Math.min(...scoreClasses);

    if ((maxClass - minClass) >= 2) {
      invalidStudents.push(student);
    }
  });

  return invalidStudents;
}
