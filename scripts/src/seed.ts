import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import crypto from "crypto";
import {
  usersTable,
  studentsTable,
  visitsTable,
  alertsTable,
  notificationsTable,
} from "../../lib/db/src/schema/index.js";

const { Pool } = pg;

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL must be set");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "schoolhealth_salt").digest("hex");
}

const now = new Date();
function daysAgo(d: number, offsetHours = 8): Date {
  const date = new Date(now);
  date.setDate(date.getDate() - d);
  date.setHours(offsetHours, 0, 0, 0);
  return date;
}

const FIRST_NAMES = [
  "Emma","Liam","Olivia","Noah","Ava","James","Sophia","Benjamin","Isabella","Lucas",
  "Mia","Mason","Charlotte","Ethan","Amelia","Alexander","Harper","Henry","Evelyn","Jack",
  "Abigail","Sebastian","Emily","Michael","Elizabeth","Owen","Mila","Daniel","Ella","Logan",
  "Avery","Jackson","Sofia","Aiden","Camila","Matthew","Aria","Samuel","Scarlett","David",
  "Victoria","Joseph","Madison","Carter","Luna","Owen","Grace","Wyatt","Chloe","John",
  "Penelope","Luke","Layla","Julian","Riley","Ryan","Zoey","Angel","Nora","Christopher",
  "Lily","Josiah","Eleanor","Andrew","Hannah","Thomas","Lillian","Joshua","Addison","Ezra",
  "Aubrey","Hudson","Ellie","Charles","Stella","Caleb","Natalia","Isaiah","Zoe","Anthony",
  "Leah","Lincoln","Hazel","Jonathan","Violet","Eli","Aurora","Connor","Savannah","Landon",
  "Audrey","Adrian","Brooklyn","Asher","Bella","Cameron","Claire","Leo","Skylar","Theodore",
];
const LAST_NAMES = [
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez",
  "Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin",
  "Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson",
  "Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores",
  "Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts",
];

const CHRONIC = ["asthma","eczema","diabetes","epilepsy","ADHD","anxiety"];
const ALLERGIES = ["peanuts","dairy","shellfish","gluten","latex","bee stings","penicillin"];

function randomFrom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function maybe<T>(val: T, prob = 0.2): T[] { return Math.random() < prob ? [val] : []; }

async function seed() {
  console.log("Seeding database...");

  const existingUsers = await db.select().from(usersTable).limit(1);
  if (existingUsers.length > 0) {
    console.log("Database already seeded, skipping.");
    await pool.end();
    return;
  }

  const passwordHash = hashPassword("password123");

  await db.insert(usersTable).values([
    { email: "nurse@demo.school",  passwordHash, name: "Sarah Johnson",      role: "nurse",  schoolId: 1 },
    { email: "admin@demo.school",  passwordHash, name: "Principal Martinez", role: "admin",  schoolId: 1 },
    { email: "parent@demo.school", passwordHash, name: "Alex Parent",        role: "parent", schoolId: 1 },
  ]);
  console.log("Created users");

  const allUsers = await db.select().from(usersTable);
  const nurseId = allUsers.find(u => u.role === "nurse")!.id;

  // Build classrooms: grades 1-12, sections A and B
  const classrooms: { grade: string; classroom: string }[] = [];
  for (let g = 1; g <= 12; g++) {
    classrooms.push({ grade: String(g), classroom: `${g}A` });
    classrooms.push({ grade: String(g), classroom: `${g}B` });
  }

  // ~4-5 students per classroom = ~96-120 students
  const studentRows: Parameters<typeof db.insert<typeof studentsTable>>[0] extends (t: any) => any ? never : any[] = [];
  let stuCode = 1;
  const usedNames = new Set<string>();

  for (const { grade, classroom } of classrooms) {
    const count = 4 + (Math.random() > 0.5 ? 1 : 0); // 4 or 5 per class
    for (let i = 0; i < count; i++) {
      let name = "";
      let tries = 0;
      do {
        name = `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`;
        tries++;
      } while (usedNames.has(name) && tries < 20);
      usedNames.add(name);

      const birthYear = 2024 - (6 + parseInt(grade));
      const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
      const birthDay   = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");

      studentRows.push({
        studentCode: `STU${String(stuCode).padStart(3, "0")}`,
        name,
        grade,
        classroom,
        dateOfBirth: `${birthYear}-${birthMonth}-${birthDay}`,
        parentEmail: stuCode === 1 ? "parent@demo.school" : `parent${stuCode}@demo.school`,
        parentPhone: `555-${String(1000 + stuCode).padStart(4, "0")}`,
        chronicConditions: JSON.stringify(maybe(randomFrom(CHRONIC), 0.15)),
        allergies:         JSON.stringify(maybe(randomFrom(ALLERGIES), 0.12)),
        schoolId: 1,
      });
      stuCode++;
    }
  }

  const students = await db.insert(studentsTable).values(studentRows).returning();
  console.log(`Created ${students.length} students`);

  // Helper: find students in a classroom
  const inClass = (cls: string) => students.filter(s => s.classroom === cls);

  // Build visits — create realistic clusters
  type VisitRow = { studentId: number; grade: string; classroom: string; symptoms: string; temperature: number | null; notes: string; actionTaken: string; loggedById: number; visitDate: Date };
  const visitRows: VisitRow[] = [];

  function addVisit(studentId: number, grade: string, classroom: string, symptoms: string[], temp: number | null, notes: string, action: string, daysBack: number, hour = 9) {
    visitRows.push({ studentId, grade, classroom, symptoms: JSON.stringify(symptoms), temperature: temp, notes, actionTaken: action, loggedById: nurseId, visitDate: daysAgo(daysBack, hour) });
  }

  // ── HIGH RISK: 10A — fever + headache outbreak ──────────────────────────
  const c10A = inClass("10A");
  if (c10A.length >= 4) {
    addVisit(c10A[0].id, "10","10A", ["fever","headache","body_aches"],         102.1, "High fever, body aches — sent home.",                        "sent_home",         0, 9);
    addVisit(c10A[1].id, "10","10A", ["fever","cough","sore_throat"],            101.5, "Cough and fever — suspected flu.",                           "sent_home",         1, 10);
    addVisit(c10A[2].id, "10","10A", ["fever","fatigue","headache"],             100.9, "Fatigue and persistent headache.",                           "called_parent",     2, 9);
    addVisit(c10A[3].id, "10","10A", ["headache","nausea","fever"],               99.8, "Nausea and mild fever, monitored.",                          "monitored",         3, 11);
    if (c10A.length >= 5) addVisit(c10A[4].id,"10","10A",["fever","chills","body_aches"],101.3,"Chills — possible flu, referred.","referred_to_doctor",4,8);
  }

  // ── HIGH RISK: 7B — stomach virus cluster ───────────────────────────────
  const c7B = inClass("7B");
  if (c7B.length >= 4) {
    addVisit(c7B[0].id, "7","7B", ["stomach_pain","nausea","vomiting"],  null, "Vomited twice — sent home.",                                "sent_home",         0, 10);
    addVisit(c7B[1].id, "7","7B", ["nausea","stomach_pain"],             98.9, "Upset stomach, rested in office.",                           "monitored",         1,  9);
    addVisit(c7B[2].id, "7","7B", ["vomiting","fatigue"],                null, "Vomited after lunch, parent called.",                        "called_parent",     2, 13);
    addVisit(c7B[3].id, "7","7B", ["stomach_pain","dizziness"],          99.2, "Dizzy and cramping — sent home.",                            "sent_home",         3, 10);
    if (c7B.length >= 5) addVisit(c7B[4].id,"7","7B",["nausea","headache"],null,"Felt queasy all morning.","returned_to_class",4,9);
  }

  // ── HIGH RISK: 5B — flu cluster ─────────────────────────────────────────
  const c5B = inClass("5B");
  if (c5B.length >= 4) {
    addVisit(c5B[0].id, "5","5B", ["fever","headache","nausea"],         101.2, "Flu-like symptoms, sent home.",                              "sent_home",         0, 9);
    addVisit(c5B[1].id, "5","5B", ["fever","sore_throat","cough"],       100.8, "Similar symptoms to classmates.",                            "sent_home",         1, 10);
    addVisit(c5B[2].id, "5","5B", ["fever","headache","fatigue"],        102.1, "High fever, parent called.",                                 "called_parent",     2, 9);
    addVisit(c5B[3].id, "5","5B", ["cough","sore_throat","fever"],       101.5, "Coughing frequently.",                                       "sent_home",         3, 11);
    if (c5B.length >= 5) addVisit(c5B[4].id,"5","5B",["fever","body_aches"],101.9,"Body aches — referred to doctor.","referred_to_doctor",4,8);
  }

  // ── MEDIUM RISK: 12A — respiratory cluster ──────────────────────────────
  const c12A = inClass("12A");
  if (c12A.length >= 3) {
    addVisit(c12A[0].id,"12","12A",["cough","sore_throat","fever"],      100.2,"Persistent cough with low fever.",                           "monitored",         1,10);
    addVisit(c12A[1].id,"12","12A",["cough","runny_nose"],               null, "Cold-like symptoms.",                                        "returned_to_class", 3, 9);
    addVisit(c12A[2].id,"12","12A",["fever","sore_throat"],              100.6,"Sore throat and fever — sent home.",                         "sent_home",         5, 9);
  }

  // ── MEDIUM RISK: 3A — stomach cluster ───────────────────────────────────
  const c3A = inClass("3A");
  if (c3A.length >= 3) {
    addVisit(c3A[0].id, "3","3A", ["stomach_pain","nausea"],             98.9, "Upset stomach after lunch.",                                 "monitored",         2, 12);
    addVisit(c3A[1].id, "3","3A", ["stomach_pain","fatigue"],            99.1, "Stomach ache, sent home.",                                   "sent_home",         4, 10);
    addVisit(c3A[2].id, "3","3A", ["nausea","vomiting"],                 null, "Vomited — parents notified.",                                "called_parent",     6, 11);
  }

  // ── MEDIUM RISK: 8B — headache cluster ──────────────────────────────────
  const c8B = inClass("8B");
  if (c8B.length >= 3) {
    addVisit(c8B[0].id, "8","8B", ["headache","fatigue"],                98.8, "Persistent headache, sent to rest.",                         "monitored",         1, 10);
    addVisit(c8B[1].id, "8","8B", ["headache","dizziness"],              null, "Dizzy and headache — sent home.",                            "sent_home",         2,  9);
    addVisit(c8B[2].id, "8","8B", ["headache","nausea"],                 99.3, "Nausea with headache.",                                      "monitored",         4,  9);
  }

  // ── LOW RISK: spread individual visits across other classes ─────────────
  const singleVisitClasses = ["1A","1B","2A","2B","4A","4B","6A","6B","9A","9B","11A","11B"];
  const symptomSets = [
    { s:["cough"],              t: null,  n:"Mild cough, no fever.",             a:"returned_to_class" },
    { s:["headache"],           t: null,  n:"Mild headache after break.",        a:"returned_to_class" },
    { s:["fever"],              t:100.1,  n:"Low-grade fever, sent home.",       a:"sent_home"         },
    { s:["stomach_pain"],       t: null,  n:"Stomach ache before lunch.",        a:"monitored"         },
    { s:["sore_throat"],        t: null,  n:"Sore throat, returned to class.",   a:"returned_to_class" },
    { s:["rash"],               t: 99.2, n:"Mild rash, parent notified.",       a:"called_parent"     },
    { s:["fatigue","headache"], t: 98.9, n:"Tired and headache, rested.",       a:"returned_to_class" },
    { s:["cough","runny_nose"], t: null,  n:"Cold symptoms.",                    a:"returned_to_class" },
  ];

  let dayOffset = 0;
  for (const cls of singleVisitClasses) {
    const group = inClass(cls);
    if (group.length > 0) {
      const sv = symptomSets[dayOffset % symptomSets.length];
      addVisit(group[0].id, group[0].grade, cls, sv.s, sv.t, sv.n, sv.a, dayOffset % 7, 10);
      if (group.length > 1) {
        const sv2 = symptomSets[(dayOffset + 3) % symptomSets.length];
        addVisit(group[1].id, group[1].grade, cls, sv2.s, sv2.t, sv2.n, sv2.a, (dayOffset + 2) % 7, 9);
      }
    }
    dayOffset++;
  }

  await db.insert(visitsTable).values(visitRows as any);
  console.log(`Created ${visitRows.length} visits`);

  const [alert1, alert2, alert3, alert4, alert5] = await db.insert(alertsTable).values([
    {
      type: "possible_outbreak", severity: "high", status: "active",
      title: "Flu Outbreak — Class 10A",
      description: "5 students from Class 10A reported fever, headache, and body aches within 5 days. Pattern strongly suggests influenza. Recommend isolation and parent notification.",
      affectedClassroom: "10A", affectedGrade: "10", affectedCount: 5,
      symptoms: JSON.stringify(["fever","headache","body_aches","cough","chills"]), schoolId: 1,
    },
    {
      type: "possible_outbreak", severity: "high", status: "active",
      title: "Stomach Virus Outbreak — Class 7B",
      description: "5 students from Class 7B reported vomiting, nausea, and stomach pain over 5 days. Possible norovirus. Cafeteria hygiene review recommended.",
      affectedClassroom: "7B", affectedGrade: "7", affectedCount: 5,
      symptoms: JSON.stringify(["stomach_pain","nausea","vomiting","dizziness","fatigue"]), schoolId: 1,
    },
    {
      type: "possible_outbreak", severity: "high", status: "active",
      title: "Flu Cluster — Class 5B",
      description: "5 students from Class 5B reported fever and respiratory symptoms in the last 5 days. Influenza strongly suspected.",
      affectedClassroom: "5B", affectedGrade: "5", affectedCount: 5,
      symptoms: JSON.stringify(["fever","headache","cough","sore_throat","body_aches"]), schoolId: 1,
    },
    {
      type: "cluster_detected", severity: "medium", status: "active",
      title: "Headache Cluster — Class 8B",
      description: "3 students from Class 8B reported headache and dizziness over 4 days. Monitor for progression. Could indicate dehydration or early viral illness.",
      affectedClassroom: "8B", affectedGrade: "8", affectedCount: 3,
      symptoms: JSON.stringify(["headache","dizziness","fatigue","nausea"]), schoolId: 1,
    },
    {
      type: "elevated_symptoms", severity: "low", status: "resolved",
      title: "Respiratory Symptoms — Class 12A",
      description: "3 students in Class 12A reported mild cough and sore throat. All recovered. No further concern.",
      affectedClassroom: "12A", affectedGrade: "12", affectedCount: 3,
      symptoms: JSON.stringify(["cough","sore_throat","runny_nose"]), schoolId: 1,
      resolvedAt: daysAgo(1),
      resolvedBy: "Principal Martinez",
      resolutionNote: "Symptoms resolved naturally. Students recovered fully.",
    },
  ]).returning();

  console.log("Created alerts");

  const parent = allUsers.find(u => u.role === "parent");
  if (parent) {
    await db.insert(notificationsTable).values([
      {
        userId: parent.id,
        title: "Outbreak Alert: Flu in Class 10A",
        message: "A flu outbreak has been detected in Class 10A. 5 students reported fever and body aches. Please monitor your child for symptoms and keep them home if unwell.",
        type: "outbreak_notice", isRead: false, alertId: alert1.id,
      },
      {
        userId: parent.id,
        title: "Outbreak Alert: Stomach Virus in Class 7B",
        message: "A possible stomach virus outbreak has been detected in Class 7B. 5 students reported nausea and vomiting. Please ensure your child washes hands frequently.",
        type: "outbreak_notice", isRead: false, alertId: alert2.id,
      },
      {
        userId: parent.id,
        title: "Flu Cluster Detected: Class 5B",
        message: "5 students from Class 5B have reported flu-like symptoms. Please monitor your child for fever, cough, or sore throat.",
        type: "exposure_alert", isRead: false, alertId: alert3.id,
      },
      {
        userId: parent.id,
        title: "Heads Up: Headache Reports in Class 8B",
        message: "Several students in Class 8B have reported headaches. Ensure your child stays hydrated and gets enough sleep.",
        type: "cluster_warning", isRead: false, alertId: alert4.id,
      },
      {
        userId: parent.id,
        title: "Resolved: Respiratory Symptoms in Class 12A",
        message: "The respiratory symptoms reported in Class 12A have resolved. All students recovered. No further action needed.",
        type: "cluster_warning", isRead: true, alertId: alert5.id,
      },
    ]);
  }

  console.log("Created notifications");
  console.log("Seeding complete!");
  await pool.end();
}

seed().catch(err => { console.error("Seeding failed:", err); process.exit(1); });
