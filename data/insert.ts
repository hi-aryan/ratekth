// Pseudocode
/* 
for (const file of jsonFiles) {
  const data = readJSON(file);
  
  // 1. Insert/upsert program (onConflictDoUpdate)
  const program = await insertProgram(data.program);
  
  // 2. Insert specializations if any (onConflictDoNothing)
  for (const specName of data.specializations ?? []) {
    await insertSpecialization(specName, program.id);
  }
  
  // 3. Insert courses (onConflictDoUpdate - same code = update name)
  for (const course of data.courses) {
    const insertedCourse = await insertCourse(course);
    
    // 4. Link course to program (onConflictDoNothing)
    await linkCourseToProgram(insertedCourse.id, program.id);
    
    // 5. Link to specializations if any (onConflictDoNothing)
    for (const specName of course.specializations ?? []) {
      //await linkCourseToSpecialization(insertedCourse.id, specName, program.id);
    }
  }
} 
*/