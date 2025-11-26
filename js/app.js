function initializeStorage() {
    if (!localStorage.getItem('students')) {
        localStorage.setItem('students', JSON.stringify([]));
    }
    if (!localStorage.getItem('subjects')) {
        localStorage.setItem('subjects', JSON.stringify([]));
    }
    if (!localStorage.getItem('grades')) {
        localStorage.setItem('grades', JSON.stringify([]));
    }
}

const studentManager = {
    getAll: function() {
        return JSON.parse(localStorage.getItem('students')) || [];
    },
    
    add: function(student) {
        const students = this.getAll();
        student.id = Date.now();
        student.dateAdded = new Date().toLocaleDateString('uk-UA');
        students.push(student);
        localStorage.setItem('students', JSON.stringify(students));
        return student;
    },
    
    update: function(id, updatedData) {
        const students = this.getAll();
        const index = students.findIndex(s => s.id === id);
        if (index !== -1) {
            students[index] = { ...students[index], ...updatedData };
            localStorage.setItem('students', JSON.stringify(students));
            return true;
        }
        return false;
    },
    
    delete: function(id) {
        let students = this.getAll();
        students = students.filter(s => s.id !== id);
        localStorage.setItem('students', JSON.stringify(students));
        
        // Також видалити всі оцінки студента
        gradeManager.deleteByStudent(id);
        return true;
    },
    
    getById: function(id) {
        const students = this.getAll();
        return students.find(s => s.id === id);
    },
    
    search: function(term) {
        const students = this.getAll();
        const lowerTerm = term.toLowerCase();
        return students.filter(s => 
            s.name.toLowerCase().includes(lowerTerm) ||
            s.group.toLowerCase().includes(lowerTerm) ||
            (s.email && s.email.toLowerCase().includes(lowerTerm))
        );
    }
};

const subjectManager = {
    getAll: function() {
        return JSON.parse(localStorage.getItem('subjects')) || [];
    },
    
    add: function(subject) {
        const subjects = this.getAll();
        subject.id = Date.now();
        subject.dateAdded = new Date().toLocaleDateString('uk-UA');
        subjects.push(subject);
        localStorage.setItem('subjects', JSON.stringify(subjects));
        return subject;
    },
    
    update: function(id, updatedData) {
        const subjects = this.getAll();
        const index = subjects.findIndex(s => s.id === id);
        if (index !== -1) {
            subjects[index] = { ...subjects[index], ...updatedData };
            localStorage.setItem('subjects', JSON.stringify(subjects));
            return true;
        }
        return false;
    },
    
    delete: function(id) {
        let subjects = this.getAll();
        subjects = subjects.filter(s => s.id !== id);
        localStorage.setItem('subjects', JSON.stringify(subjects));
        
        gradeManager.deleteBySubject(id);
        return true;
    },
    
    getById: function(id) {
        const subjects = this.getAll();
        return subjects.find(s => s.id === id);
    },
    
    search: function(term) {
        const subjects = this.getAll();
        const lowerTerm = term.toLowerCase();
        return subjects.filter(s => 
            s.name.toLowerCase().includes(lowerTerm) ||
            s.teacher.toLowerCase().includes(lowerTerm) ||
            (s.description && s.description.toLowerCase().includes(lowerTerm))
        );
    }
};

const gradeManager = {
    getAll: function() {
        return JSON.parse(localStorage.getItem('grades')) || [];
    },
    
    add: function(grade) {
        const grades = this.getAll();
        grade.id = Date.now();
        grade.dateAdded = new Date().toLocaleDateString('uk-UA');
        grades.push(grade);
        localStorage.setItem('grades', JSON.stringify(grades));
        return grade;
    },
    
    update: function(id, updatedData) {
        const grades = this.getAll();
        const index = grades.findIndex(g => g.id === id);
        if (index !== -1) {
            grades[index] = { ...grades[index], ...updatedData };
            localStorage.setItem('grades', JSON.stringify(grades));
            return true;
        }
        return false;
    },
    
    delete: function(id) {
        let grades = this.getAll();
        grades = grades.filter(g => g.id !== id);
        localStorage.setItem('grades', JSON.stringify(grades));
        return true;
    },
    
    deleteByStudent: function(studentId) {
        let grades = this.getAll();
        grades = grades.filter(g => g.studentId !== studentId);
        localStorage.setItem('grades', JSON.stringify(grades));
        return true;
    },
    
    deleteBySubject: function(subjectId) {
        let grades = this.getAll();
        grades = grades.filter(g => g.subjectId !== subjectId);
        localStorage.setItem('grades', JSON.stringify(grades));
        return true;
    },
    
    getByStudent: function(studentId) {
        const grades = this.getAll();
        return grades.filter(g => g.studentId === studentId);
    },
    
    getBySubject: function(subjectId) {
        const grades = this.getAll();
        return grades.filter(g => g.subjectId === subjectId);
    },
    
    getByStudentAndSubject: function(studentId, subjectId) {
        const grades = this.getAll();
        return grades.filter(g => g.studentId === studentId && g.subjectId === subjectId);
    }
};

const statisticsManager = {
    getStudentAverage: function(studentId) {
        const grades = gradeManager.getByStudent(studentId);
        if (grades.length === 0) return 0;
        const sum = grades.reduce((acc, g) => acc + g.grade, 0);
        return sum / grades.length;
    },
    
    getSubjectAverage: function(subjectId) {
        const grades = gradeManager.getBySubject(subjectId);
        if (grades.length === 0) return 0;
        const sum = grades.reduce((acc, g) => acc + g.grade, 0);
        return sum / grades.length;
    },
    
    getOverallAverage: function() {
        const grades = gradeManager.getAll();
        if (grades.length === 0) return 0;
        const sum = grades.reduce((acc, g) => acc + g.grade, 0);
        return sum / grades.length;
    },
    
    getStudentRanking: function() {
        const students = studentManager.getAll();
        const ranking = students.map(student => {
            const average = this.getStudentAverage(student.id);
            const gradesCount = gradeManager.getByStudent(student.id).length;
            return {
                ...student,
                average: average,
                gradesCount: gradesCount
            };
        });
        
        ranking.sort((a, b) => b.average - a.average);
        return ranking;
    },
    
    getGradeDistribution: function() {
        const grades = gradeManager.getAll();
        return {
            excellent: grades.filter(g => g.grade >= 90).length,
            good: grades.filter(g => g.grade >= 75 && g.grade < 90).length,
            satisfactory: grades.filter(g => g.grade >= 60 && g.grade < 75).length,
            fail: grades.filter(g => g.grade < 60).length,
            total: grades.length
        };
    },
    
    getSubjectStatistics: function() {
        const subjects = subjectManager.getAll();
        return subjects.map(subject => {
            const grades = gradeManager.getBySubject(subject.id);
            const average = grades.length > 0 
                ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length 
                : 0;
            const highest = grades.length > 0 
                ? Math.max(...grades.map(g => g.grade)) 
                : 0;
            const lowest = grades.length > 0 
                ? Math.min(...grades.map(g => g.grade)) 
                : 0;
            
            return {
                ...subject,
                average: average,
                gradesCount: grades.length,
                highest: highest,
                lowest: lowest
            };
        });
    },
    
    getStudentDetailedStats: function(studentId) {
        const student = studentManager.getById(studentId);
        if (!student) return null;
        
        const subjects = subjectManager.getAll();
        const studentGrades = gradeManager.getByStudent(studentId);
        
        const subjectStats = subjects.map(subject => {
            const subjectGrades = studentGrades.filter(g => g.subjectId === subject.id);
            const average = subjectGrades.length > 0
                ? subjectGrades.reduce((sum, g) => sum + g.grade, 0) / subjectGrades.length
                : 0;
            const highest = subjectGrades.length > 0
                ? Math.max(...subjectGrades.map(g => g.grade))
                : 0;
            const lowest = subjectGrades.length > 0
                ? Math.min(...subjectGrades.map(g => g.grade))
                : 0;
            
            return {
                subject: subject,
                average: average,
                gradesCount: subjectGrades.length,
                highest: highest,
                lowest: lowest,
                grades: subjectGrades
            };
        }).filter(stat => stat.gradesCount > 0);
        
        return {
            student: student,
            overallAverage: this.getStudentAverage(studentId),
            totalGrades: studentGrades.length,
            subjectStats: subjectStats
        };
    }
};

const utils = {
    formatDate: function(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        return date.toLocaleDateString('uk-UA');
    },
    
    getGradeLabel: function(grade) {
        if (grade >= 90) return 'Відмінно';
        if (grade >= 75) return 'Добре';
        if (grade >= 60) return 'Задовільно';
        return 'Незадовільно';
    },
    
    getGradeClass: function(grade) {
        if (grade >= 90) return 'grade-excellent';
        if (grade >= 75) return 'grade-good';
        if (grade >= 60) return 'grade-satisfactory';
        return 'grade-fail';
    },
    
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    exportToJSON: function() {
        const data = {
            students: studentManager.getAll(),
            subjects: subjectManager.getAll(),
            grades: gradeManager.getAll(),
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `journal_backup_${Date.now()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    },
    
    importFromJSON: function(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (data.students) {
                localStorage.setItem('students', JSON.stringify(data.students));
            }
            if (data.subjects) {
                localStorage.setItem('subjects', JSON.stringify(data.subjects));
            }
            if (data.grades) {
                localStorage.setItem('grades', JSON.stringify(data.grades));
            }
            
            return true;
        } catch (error) {
            console.error('Помилка імпорту:', error);
            return false;
        }
    },
    
    clearAllData: function() {
        if (confirm('Ви впевнені? Всі дані будуть видалені безповоротно!')) {
            localStorage.removeItem('students');
            localStorage.removeItem('subjects');
            localStorage.removeItem('grades');
            initializeStorage();
            return true;
        }
        return false;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    initializeStorage();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        studentManager,
        subjectManager,
        gradeManager,
        statisticsManager,
        utils
    };
}