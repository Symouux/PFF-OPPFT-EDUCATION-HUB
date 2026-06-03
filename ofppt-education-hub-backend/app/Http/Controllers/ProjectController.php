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
            'lienGithub' => ['required', 'url'],
            'category_id' => ['required', 'exists:categories,id']
        ]);

        $project = Project::create([
            'utilisateur_id' => auth()->id(),
            'category_id' => $data['category_id'],
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

    public function show($id)
    {
        $project = Project::with('user.profil', 'categories')->find($id);

        if(!$project){
            return response()->json([
                'message' => 'Project not found !'
            ], 404);
        }

        return response()->json([
            'data' => $project
        ], 200);
    }

    public function update(Request $req, $id)
    {
        $project = Project::find($id);

        if(!$project){
            return response()->json([
                'message' => 'Project not found !'
            ], 404);
        }

        if($project->utilisateur_id !== auth()->id()){
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        $data = $req->validate([
            'titre' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'technologies' => ['nullable', 'string', 'max:255'],
            'lienGithub' => ['nullable', 'url'],
            'category_id' => ['required', 'exists:categories,id']
        ]);

        $project->update($data);

        return response()->json([
            'message' => 'Project updated successfully !',
            'data' => $project
        ], 200);
    }

    public function destroy($id)
    {
        $project = Project::find($id);

        if(!$project){
            return response()->json([
                'message' => 'Project not found !'
            ], 404);
        }

        if($project->utilisateur_id !== auth()->id()){
            return response()->json([
                'message' => 'Forbidden'
            ], 403);
        }

        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully !'
        ], 200);
    }

    public function index()
    {
        $projects = Project::with(['user.profil', 'categories'])->where('status', 'active')->orderBy('date_publication', 'desc')->get();
        return response()->json(['data' => $projects], 200);
    }

    public function getCategories()
    {
        $categories = \App\Models\Categorie::all();
        return response()->json(['data' => $categories], 200);
    }
}
