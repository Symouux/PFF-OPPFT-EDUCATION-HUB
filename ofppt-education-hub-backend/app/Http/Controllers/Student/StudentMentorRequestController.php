<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectMentorRequest;
use App\Models\User;
use Illuminate\Http\Request;

class StudentMentorRequestController extends Controller
{
    // Envoi des mentor requests
    public function store(Request $req)
    {
        $data = $req->validate([
            'project_id' => ['required', 'exists:projects,id'],
            'mentor_id' => ['required', 'exists:users,id']
        ]);

        $project = Project::find($data['project_id']);
        $mentor = User::find($data['mentor_id']);
        $project_request = ProjectMentorRequest::where('project_id', $project->id)
                                                ->where('etudiant_id', auth()->id())
                                                ->where('mentor_id', $mentor->id)
                                                ->exists();

        if(!$project || !$mentor){
            return response()->json([
                'message' => 'Project or Mentor not found !'
            ], 404);
        }

        if($mentor->role !== 'mentor'){
            return response()->json([
                'message' => 'Selected user is not a mentor !'
            ], 400);
        }

        if(!$mentor->mentorProfile){
            return response()->json([
                'message' => 'Mentor profile not found !'
            ], 404);
        }

        if (!$mentor->mentorProfile->is_available) {
            return response()->json([
                'message' => 'Mentor is not available'
            ], 403);
        }

        if($project->utilisateur_id !== auth()->id()){
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        if($project->category_id !== $mentor->mentorProfile->category_id){
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        if($project_request){
            return response()->json([
                'message' => 'This project already have a mentor request !'
            ], 409);
        }

        $mentorRequest = ProjectMentorRequest::create([
            'project_id' => $project->id,
            'etudiant_id' => auth()->id(),
            'mentor_id' => $mentor->id,
            'status' => 'pending', 
            'is_read' => false
        ]);

        return response()->json([
            'message' => 'Request sent successfully !',
            'data' => $mentorRequest
        ], 201);
    }

    // Suivi des requests envoyées
    public function index()
    {
        $requests = ProjectMentorRequest::with([
                                            'project',
                                            'userMentor.profil',
                                            'userMentor.mentorProfile'
                                        ])
                                        ->where('etudiant_id', auth()->id())
                                        ->latest()
                                        ->get();

        return response()->json([
            'message' => 'All your projects requests !',
            'data' => $requests
        ], 200);
    }

    public function getMentors()
    {
        $mentors = \App\Models\User::with(['profil', 'mentorProfile.categories'])
                                    ->where('role', 'mentor')
                                    ->get();

        return response()->json([
            'data' => $mentors
        ], 200);
    }
}
