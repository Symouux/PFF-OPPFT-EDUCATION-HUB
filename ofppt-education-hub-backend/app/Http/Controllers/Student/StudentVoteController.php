<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Vote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentVoteController extends Controller
{
    public function store($id){
        $project = Project::find($id);

        if(!$project){
            return response()->json([
                'message' => 'Project not found !'
            ], 404);
        }

        if($project->utilisateur_id === auth()->id()){
            return response()->json([
                'message' => 'You cannot vote for your own project'
            ], 403);
        }

        $alreadyVoted = Vote::where('project_id', $project->id)
                        ->where('utilisateur_id', auth()->id())
                        ->exists();

        if($alreadyVoted){
            return response()->json([
                'message' => 'You already voted for this project !'
            ], 409);
        }

        $vote = DB::transaction(function () use ($project) {
            $vote = Vote::create([
                'utilisateur_id' => auth()->id(),
                'project_id' => $project->id,
                'date_vote' => now()
            ]);

            $project->increment('nb_votes');

            return $vote;
        });

        return response()->json([
            'message' => 'Vote added successfully !',
            'data' => $vote
        ], 201);

    }

}
