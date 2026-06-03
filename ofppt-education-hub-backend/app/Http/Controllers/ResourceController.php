<?php

namespace App\Http\Controllers;

use App\Models\Resource;
use Illuminate\Http\Request;

class ResourceController extends Controller
{
    public function store(Request $req)
    {
        $data = $req->validate([
            'titre' => ['required', 'string', 'max:255'],
            'url_fichier' => ['required', 'url'],
            'type' => ['nullable', 'string', 'max:50'],
        ]);

        $host = strtolower(parse_url($data['url_fichier'], PHP_URL_HOST) ?? '');

        if (!in_array($host, ['drive.google.com', 'docs.google.com'])) {
            return response()->json([
                'message' => 'Resource must be a Google Drive link'
            ], 422);
        }

        $resource = Resource::create([
            'utilisateur_id' => auth()->id(),
            'titre' => $data['titre'],
            'type' => $data['type'] ?? 'drive',
            'url_fichier' => $data['url_fichier'],
            'date_ajout' => now(),
        ]);

        return response()->json([
            'message' => 'Resource shared successfully',
            'data' => $resource
        ], 201);
    }

    public function index()
    {
        $resources = Resource::with('user.profil')
                            ->orderBy('date_ajout', 'desc')
                            ->get();

        return response()->json([
            'data' => $resources
        ], 200);
    }
}
