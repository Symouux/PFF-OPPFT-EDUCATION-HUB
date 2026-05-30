<?php

namespace App\Http\Controllers\Mentor;

use App\Http\Controllers\Controller;
use App\Models\MentorReview;
use App\Models\Project;
use App\Models\ProjectMentorRequest;

class MentorDashboardController extends Controller
{
    // Mentor dashboard statistics
    public function statistics()
    {

        $mentor = auth('api')->user();

        // Total requests received
        $totalRequests = ProjectMentorRequest::where('mentor_id', $mentor->id)
            ->count();

        // Accepted requests
        $acceptedRequests = ProjectMentorRequest::where('mentor_id', $mentor->id)
            ->where('status', 'accepted')
            ->count();

        // Rejected requests
        $rejectedRequests = ProjectMentorRequest::where('mentor_id', $mentor->id)
            ->where('status', 'rejected')
            ->count();

        // Total evaluated projects
        $evaluatedProjects = MentorReview::where('mentor_id', $mentor->id)
            ->count();

        // Accepted projects not evaluated yet
        $notEvaluatedProjects = ProjectMentorRequest::where('mentor_id', $mentor->id)
            ->where('status', 'accepted')
            ->count() - $evaluatedProjects;

        // Winning projects evaluated by mentor
        $winningProjects = MentorReview::where('mentor_id', $mentor->id)
            ->whereHas('project', function ($query) {
                $query->where('estGagantMois', true);
            })
            ->count();

        return response()->json([
            'total_requests' => $totalRequests,
            'accepted_requests' => $acceptedRequests,
            'rejected_requests' => $rejectedRequests,
            'evaluated_projects' => $evaluatedProjects,
            'not_evaluated_projects' => $notEvaluatedProjects,
            'winning_projects' => $winningProjects,
        ]);
    }

    // Historique mensuel des 6 derniers mois des demandes de mentorat et des évaluations
    public function chartData()
    {
        $mentor = auth('api')->user();

        $data = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);

            $soumis = ProjectMentorRequest::where('mentor_id', $mentor->id)
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();

            $evalues = MentorReview::where('mentor_id', $mentor->id)
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();

            $data[] = [
                'month'   => $month->locale('fr')->isoFormat('MMM'),
                'soumis'  => $soumis,
                'evalues' => $evalues,
            ];
        }

        return response()->json($data);
    }
}
