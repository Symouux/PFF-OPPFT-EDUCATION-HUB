<?php

namespace App\Http\Controllers\Mentor;

use App\Http\Controllers\Controller;
use App\Models\MentorReview;
use App\Models\Project;
use App\Models\ProjectMentorRequest;
use Illuminate\Http\Request;

class MentorReviewController extends Controller
{
    // Create mentor review
    public function store(Request $request)
    {
        // Get authenticated mentor
        $mentor = auth('api')->user();

        // Validate request data
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'code_quality' => 'required|numeric|min:0|max:5',
            'ui_ux' => 'required|numeric|min:0|max:5',
            'innovation' => 'required|numeric|min:0|max:5',
            'performance' => 'required|numeric|min:0|max:5',
            'presentation' => 'required|numeric|min:0|max:5',
            'comment' => 'nullable|string'
        ]);

        // Check if mentor accepted this project request
        $acceptedRequest = ProjectMentorRequest::where('mentor_id', $mentor->id)
            ->where('project_id', $request->project_id)
            ->where('status', 'accepted')
            ->first();

        // Prevent unauthorized review
        if (!$acceptedRequest) {
            return response()->json([
                'message' => 'Unauthorized review'
            ], 403);
        }

        // Prevent duplicate review
        $alreadyReviewed = MentorReview::where('mentor_id', $mentor->id)
            ->where('project_id', $request->project_id)
            ->exists();

        if ($alreadyReviewed) {
            return response()->json([
                'message' => 'You already reviewed this project'
            ], 400);
        }

        // Calculate final score
        $finalScore = (int)$request->code_quality +
              (int)$request->ui_ux +
              (int)$request->innovation +
              (int)$request->performance +
              (int)$request->presentation;

        // Create mentor review
        $review = MentorReview::create([
            'mentor_id' => $mentor->id,
            'project_id' => $request->project_id,
            'code_quality' => $request->code_quality,
            'ui_ux' => $request->ui_ux,
            'innovation' => $request->innovation,
            'performance' => $request->performance,
            'presentation' => $request->presentation,
            'final_score' => $finalScore,
            'comment' => $request->comment,
        ]);

        // Find project
        $project = Project::findOrFail($request->project_id);

        // Calculate global score
        $globalScore = (int)$project->nb_votes + $finalScore;

        // Update project global score
        $project->update([
            'global_score' => $globalScore
        ]);

        return response()->json([
            'message' => 'Review submitted successfully',
            'final_score_calculated' => $finalScore,
            'project_global_score' => $project->global_score
        ], 201);
    }

    // Get all mentor reviews
    public function myReviews()
    {
        // Get authenticated mentor
        $mentor = auth('api')->user();

        // Get mentor reviews
        $reviews = MentorReview::with([
            'project.categories'
        ])
        ->where('mentor_id', $mentor->id)
        ->latest()
        ->get();

        return response()->json($reviews);
    }

    // Get single review details
    public function show($id)
    {
        // Get authenticated mentor
        $mentor = auth('api')->user();

        // Find review
        $review = MentorReview::with([
            'project.categories'
        ])
        ->where('mentor_id', $mentor->id)
        ->findOrFail($id);

        return response()->json($review);
    }
}