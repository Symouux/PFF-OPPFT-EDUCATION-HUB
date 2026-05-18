<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectMentorRequest;
use App\Models\User;
use Illuminate\Http\Request;

class StudentMentorRequestController extends Controller
{
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

        if(!$mentor->mentorProfile()){
            return response()->json([
                'message' => 'Mentor profile not found !'
            ], 404);
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
}
