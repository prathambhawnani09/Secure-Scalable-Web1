import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Apple,
  BookOpen,
  Calendar,
  Heart,
  Phone,
  ShieldCheck,
  Syringe,
  Wind,
  Thermometer,
  Droplets,
  Sun,
  Clock,
} from "lucide-react";

const HEALTH_TIPS = [
  { icon: Droplets, title: "Stay Hydrated", tip: "Kids should drink 6–8 glasses of water per day to stay focused and energized.", tag: "Wellness" },
  { icon: Apple, title: "Balanced Nutrition", tip: "A colorful plate means more nutrients. Aim for fruits, veggies, protein, and whole grains at every meal.", tag: "Nutrition" },
  { icon: Wind, title: "Fresh Air Breaks", tip: "Regular outdoor breaks improve concentration and reduce stress. Encourage 20+ minutes of outdoor time daily.", tag: "Activity" },
  { icon: Sun, title: "Sleep Routine", tip: "Elementary students need 9–12 hours of sleep. Consistent bedtimes improve mood and academic performance.", tag: "Sleep" },
  { icon: Thermometer, title: "Know the Signs", tip: "Keep your child home if they have a fever above 100.4°F, vomiting, or severe symptoms. They can return 24h after fever-free.", tag: "Prevention" },
  { icon: ShieldCheck, title: "Hand Washing", tip: "Washing hands for 20 seconds with soap is one of the most effective ways to prevent the spread of illness.", tag: "Hygiene" },
];

const UPCOMING_EVENTS = [
  { date: "May 5", title: "Vision & Hearing Screenings", grades: "K, 1st, 3rd, 5th" },
  { date: "May 12", title: "Dental Health Check", grades: "All grades" },
  { date: "May 20", title: "Spring Wellness Fair", grades: "All grades" },
  { date: "Jun 2", title: "Annual Physical Forms Due", grades: "6th grade" },
  { date: "Jun 10", title: "End-of-Year Immunization Review", grades: "All grades" },
];

const VACCINATION_INFO = [
  { name: "Flu Shot", status: "Recommended annually", color: "bg-blue-100 text-blue-700" },
  { name: "MMR (Measles, Mumps, Rubella)", status: "Required – 2 doses", color: "bg-green-100 text-green-700" },
  { name: "Tdap (Tetanus, Diphtheria, Pertussis)", status: "Required at 11–12 years", color: "bg-green-100 text-green-700" },
  { name: "Varicella (Chickenpox)", status: "Required – 2 doses", color: "bg-green-100 text-green-700" },
  { name: "HPV Vaccine", status: "Recommended at 11–12 years", color: "bg-purple-100 text-purple-700" },
  { name: "Meningococcal", status: "Required at 11–12 years", color: "bg-green-100 text-green-700" },
];

const CONTACTS = [
  { role: "School Nurse", name: "Sarah Johnson, RN", phone: "(555) 123-4567", hours: "Mon–Fri, 7:30am–3:30pm" },
  { role: "School Health Coordinator", name: "James Carter", phone: "(555) 234-5678", hours: "Mon–Fri, 8:00am–4:00pm" },
  { role: "Emergency / After Hours", name: "District Health Line", phone: "(555) 999-0000", hours: "24/7" },
];

export default function ResourcesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Health Resources</h1>
        </div>
        <p className="text-muted-foreground">
          Wellness tips, upcoming health events, vaccination guidance, and contact information for your school's health team.
        </p>
      </div>

      {/* Health Tips */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Heart className="h-5 w-5 text-rose-500" />
          <h2 className="text-xl font-semibold">Wellness Tips</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HEALTH_TIPS.map(({ icon: Icon, title, tip, tag }) => (
            <Card key={title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs">{tag}</Badge>
                </div>
                <CardTitle className="text-base mt-2">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{tip}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Upcoming Health Events</h2>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {UPCOMING_EVENTS.map(({ date, title, grades }) => (
                <div key={title} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="w-16 text-center flex-shrink-0">
                    <div className="text-sm font-bold text-primary">{date.split(" ")[0]}</div>
                    <div className="text-xs text-muted-foreground">{date.split(" ")[1]}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> Grades: {grades}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">Scheduled</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Vaccination */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Syringe className="h-5 w-5 text-green-500" />
          <h2 className="text-xl font-semibold">Vaccination Requirements</h2>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {VACCINATION_INFO.map(({ name, status, color }) => (
                <div key={name} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="font-medium text-sm">{name}</div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${color}`}>{status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground mt-2 px-1">
          Requirements may vary by state. Contact the school nurse to verify your child's immunization records.
        </p>
      </section>

      {/* Contact */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Phone className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-semibold">Contact the Health Team</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CONTACTS.map(({ role, name, phone, hours }) => (
            <Card key={role} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{role}</div>
                <div className="font-semibold text-foreground">{name}</div>
                <div className="flex items-center gap-1.5 text-sm text-primary">
                  <Phone className="h-3.5 w-3.5" /> {phone}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {hours}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
