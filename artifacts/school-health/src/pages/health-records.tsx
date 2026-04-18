import { useState } from "react";
import { format } from "date-fns";
import { useListVisits } from "@workspace/api-client-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, ClipboardList, ShieldCheck, Info } from "lucide-react";

export default function HealthRecordsPage() {
  const [symptomFilter, setSymptomFilter] = useState<string>("all");

  const { data, isLoading } = useListVisits({
    limit: 100,
    symptom: symptomFilter !== "all" ? symptomFilter : undefined,
  });

  const formatAction = (action: string) =>
    action.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const getActionVariant = (action: string) => {
    switch (action) {
      case "sent_home": return "destructive";
      case "referred_to_doctor": return "destructive";
      case "returned_to_class": return "secondary";
      case "monitored": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Health Records</h1>
        </div>
        <p className="text-muted-foreground">
          Read-only log of student clinic visits. Contact the school nurse for more details.
        </p>
      </div>

      <Card className="border-blue-100 bg-blue-50/50">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <span className="font-semibold">View only.</span> This log is for informational purposes. You cannot modify any records here. If you have questions about a specific visit, please contact the school nurse.
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by student name..." className="pl-9" />
        </div>
        <Select value={symptomFilter} onValueChange={setSymptomFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by symptom" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Symptoms</SelectItem>
            <SelectItem value="Fever">Fever</SelectItem>
            <SelectItem value="Cough">Cough</SelectItem>
            <SelectItem value="Headache">Headache</SelectItem>
            <SelectItem value="Nausea">Nausea</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Classroom</TableHead>
              <TableHead>Symptoms</TableHead>
              <TableHead>Outcome</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : data?.visits && data.visits.length > 0 ? (
              data.visits.map((visit) => (
                <TableRow key={visit.id} className="hover:bg-muted/30">
                  <TableCell className="whitespace-nowrap">
                    <div className="font-medium">{format(new Date(visit.visitDate), "MMM d, yyyy")}</div>
                    <div className="text-xs text-muted-foreground">{format(new Date(visit.visitDate), "h:mm a")}</div>
                  </TableCell>
                  <TableCell className="font-medium">{visit.studentName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {visit.grade} – {visit.classroom}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {visit.symptoms.map((symptom, i) => (
                        <Badge key={i} variant="secondary" className="font-normal text-xs">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionVariant(visit.actionTaken) as any}>
                      {formatAction(visit.actionTaken)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <ShieldCheck className="h-8 w-8 mb-2 opacity-20" />
                    <p>No clinic visits on record.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
