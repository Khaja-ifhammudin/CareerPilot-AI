import React from "react";
import Link from "next/link";
import { UserCheck, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type ProfileCompletionDetails } from "@/lib/profile-utils";

interface ProfileCompletionCardProps {
  completion: ProfileCompletionDetails;
}

export function ProfileCompletionCard({ completion }: ProfileCompletionCardProps) {
  const isComplete = completion.percentage >= 100;

  return (
    <Card className="glass-card border-slate-800 bg-gradient-to-r from-blue-950/30 via-slate-900/60 to-purple-950/30">
      <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-blue-400" />
              <span>Career Profile Readiness</span>
            </span>
            {isComplete ? (
              <Badge variant="success" className="text-[10px]">
                <CheckCircle2 className="h-3 w-3 mr-1" /> All Set
              </Badge>
            ) : (
              <Badge variant="default" className="text-[10px]">
                {completion.percentage}% Completed
              </Badge>
            )}
          </div>

          <div className="w-full sm:w-80 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completion.percentage}%` }}
            />
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {isComplete
              ? "Your profile is fully configured! Your skills and academic background will power accurate AI job matching."
              : `Complete your profile for better AI job matching. Next up: add ${completion.missingFields
                  .slice(0, 2)
                  .map((m) => m.label)
                  .join(" and ")}.`}
          </p>
        </div>

        <Link href="/profile" className="shrink-0 w-full sm:w-auto">
          <Button
            size="sm"
            variant={isComplete ? "outline" : "gradient"}
            className="w-full sm:w-auto gap-1.5 text-xs px-4"
          >
            <span>{isComplete ? "Edit Profile" : "Complete Profile"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
