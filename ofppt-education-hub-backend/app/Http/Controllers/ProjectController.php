<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function store(Request $req)
    {
        $data = $req->validate([
            'titre' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'technologies' => ['required', 'string', 'max:255'],
            'lienGithub' => ['required', 'url']
        ]);

        $project = Project::create([
            'utilisateur_id' => auth()->id(),
            'titre' => $data['titre'],
            'description' => $data['description'],
            'technologies' => $data['technologies'],
            'lienGithub' => $data['lienGithub'],
            'estGagantMois' => false,
            'status' => 'active',
            'nb_votes' => 0,
            'date_publication' => now(),
        ]);

        return response()->json([
            'message' => 'Project published successfully !',
            'data' => $project
        ], 200);
    }
}
