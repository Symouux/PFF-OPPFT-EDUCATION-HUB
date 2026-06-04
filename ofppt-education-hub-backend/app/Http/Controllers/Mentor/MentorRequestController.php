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

        // Count unread notifications
        $unreadCount = ProjectMentorRequest::where('mentor_id', $mentor->id)
        ->where('status', 'pending')
        ->where('is_read', false)
        ->count();

        return response()->json([
            'notifications' => $requests,
            'unread_count' => $unreadCount
        ]);
    }

    // Mark all notifications as read
    public function markAsRead()
    {
        $mentor = auth('api')->user();

        ProjectMentorRequest::where('mentor_id', $mentor->id)
            ->where('status', 'pending')
            ->where('is_read', false)
            ->update([
                'is_read' => true
            ]);

        return response()->json([
            'message' => 'Notifications marked as read'
        ]);
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