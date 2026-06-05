<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\MentorReview;
use App\Models\Project;
use Illuminate\Http\Request;

class StudentNotificationController extends Controller
{
    public function index()
    {
        $student = auth('api')->user();

        $reviews = MentorReview::with([
            'project.categories',
            'user.profil'
        ])
        ->whereHas('project', function ($q) use ($student) {
            $q->where('utilisateur_id', $student->id);
        })
        ->latest()
        ->get();

        $unreadCount = MentorReview::whereHas('project', function ($q) use ($student) {
            $q->where('utilisateur_id', $student->id);
        })
        ->where('is_read', false)
        ->count();

        return response()->json([
            'notifications' => $reviews,
            'unread_count' => $unreadCount
        ]);
    }

    public function markAsRead()
    {
        $student = auth('api')->user();

        MentorReview::whereHas('project', function ($q) use ($student) {
            $q->where('utilisateur_id', $student->id);
        })
        ->where('is_read', false)
        ->update(['is_read' => true]);

        return response()->json([
            'message' => 'Notifications marked as read'
        ]);
    }
}
