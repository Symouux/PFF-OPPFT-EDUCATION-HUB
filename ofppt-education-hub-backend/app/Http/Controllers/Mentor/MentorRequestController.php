<?php

namespace App\Http\Controllers\Mentor;

use App\Http\Controllers\Controller;
use App\Models\ProjectMentorRequest;
use Illuminate\Http\Request;

class MentorRequestController extends Controller
{
    // Get all pending requests for mentor
    public function index()
    {
        $mentor = auth('api')->user();

        $requests = ProjectMentorRequest::with([
            'project.categories',
            'userStudent.profil'
        ])
        ->where('mentor_id', $mentor->id)
        ->where('status', 'pending')
        ->latest()
        ->get();

        return response()->json($requests);
    }

    // Accept mentor request
    public function accept($id)
    {
        $mentor = auth('api')->user();

        // Find mentor request
        $mentorRequest = ProjectMentorRequest::with('project')
            ->where('mentor_id', $mentor->id)
            ->findOrFail($id);

        // Get mentor category
        $mentorCategory = $mentor->mentorProfile->category_id;

        // Check if project category matches mentor category
        if ($mentorRequest->project->category_id != $mentorCategory) {
            return response()->json([
                'message' => 'You cannot review projects from another category'
            ], 403);
        }

        // Accept request
        $mentorRequest->update([
            'status' => 'accepted'
        ]);

        return response()->json([
            'message' => 'Request accepted successfully'
        ]);
    }

    // Reject mentor request
    public function reject($id)
    {
        $mentor = auth('api')->user();

        // Find mentor request
        $mentorRequest = ProjectMentorRequest::where('mentor_id', $mentor->id)
            ->findOrFail($id);

        // Reject request
        $mentorRequest->update([
            'status' => 'rejected'
        ]);

        return response()->json([
            'message' => 'Request rejected successfully'
        ]);
    }

    // Get accepted projects for mentor
    public function acceptedProjects()
    {
        $mentor = auth('api')->user();

        $projects = ProjectMentorRequest::with([
            'project.categories',
            'userStudent.profil'
        ])
        ->where('mentor_id', $mentor->id)
        ->where('status', 'accepted')
        ->latest()
        ->get();

        return response()->json($projects);
    }
}