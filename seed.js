const db = require("./database");

const internships = [
    {
        company_name: "Tech Solutions",
        role: "Web Development Intern",
        location: "Pune",
        stipend: 10000,
        duration: "3 Months",
        description: "Work on HTML, CSS and JavaScript projects."
    },
    {
        company_name: "Innovate Labs",
        role: "React JS Intern",
        location: "Mumbai",
        stipend: 12000,
        duration: "6 Months",
        description: "Build frontend applications using React."
    },
    {
        company_name: "DataWorks",
        role: "Python Intern",
        location: "Pune",
        stipend: 8000,
        duration: "3 Months",
        description: "Work with Python and basic data processing."
    },
    {
        company_name: "CloudTech",
        role: "Backend Developer Intern",
        location: "Bangalore",
        stipend: 15000,
        duration: "6 Months",
        description: "Learn Node.js, Express and API development."
    },
    {
        company_name: "Digital Minds",
        role: "Frontend Developer Intern",
        location: "Remote",
        stipend: 7000,
        duration: "3 Months",
        description: "Create responsive web pages and user interfaces."
    }
];

const insert = db.prepare(`
    INSERT INTO internships
    (
        company_name,
        role,
        location,
        stipend,
        duration,
        description
    )
    VALUES (?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((records) => {
    for (const internship of records) {
        insert.run(
            internship.company_name,
            internship.role,
            internship.location,
            internship.stipend,
            internship.duration,
            internship.description
        );
    }
});

insertMany(internships);

console.log("✅ Seed data inserted successfully!");
console.log(`📊 Total records added: ${internships.length}`);

db.close();