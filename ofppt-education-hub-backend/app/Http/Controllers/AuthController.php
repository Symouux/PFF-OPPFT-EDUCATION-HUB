<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $req)
    {
        $email = $req->email;
        $mot_de_passe = $req->mot_de_passe;
        $role = $req->role ?? 'etudiant';

        // 1/ Email Check, ElAnani Comment
        $exists = Utilisateur::where('email', $email)->first();

        if ($exists) {
            return response()->json([
                'message' => 'Email Deja Existe !'
            ], 401);
        }

        // 2/ Role Check, ElAnani Comment
        if (!in_array($role, ['etudiant', 'mentor', 'admin'])) {
            return response()->json([
                'message' => 'Invalid role'
            ], 400);
        }

        // 2/ Password Hash, ElAnani Comment
        $mot_de_passe_hash = Hash::make($mot_de_passe);

        // 3/ Create User, ElAnani Comment
        $user = Utilisateur::create([
            'email' => $email,
            'mot_de_passe' => $mot_de_passe_hash,
            'role' => $role,
            'date_inscription' => now()
        ]);

        // 4/ Upload Picture, ElAnani Comment
        $photoPath = null;

        if ($req->hasFile('photo')) {
            $photoPath = $req->file('photo')->store('profiles', 'public');
        }

        // 5/ Create Profile, ElAnani Comment
        $user->profil()->create([
            'nom_complet' => $req->nom_complet,
            'bio' => $req->bio,
            'photo' => $photoPath,
            'lien_linkedin' => $req->lien_linkedin,
            'lien_github' => $req->lien_github,
            'score_mensuel' => 0
        ]);

        return response()->json([
            'message' => 'User Ajoute Avec Success !',
            'user' => $user->load('profil')
        ], 200);
    }

    public function login(Request $req)
    {
        $email = $req->email;
        $password = $req->mot_de_passe;

        // 1/ Find User, ElAnani Comment
        $user = Utilisateur::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found !'
            ], 404);
        }

        // 2/ Compare Password, ElAnani Comment
        if (!Hash::check($password, $user->mot_de_passe)) {
            return response()->json([
                'message' => 'Password Invalid !'
            ], 401);
        }

        // 3/ Generate JWT, ElAnani Comment
        $token = auth()->login($user);

        return response()->json([
            'token' => $token,
            'user' => [
                'email' => $user->email,
                'role' => $user->role
            ]
        ]);
    }

    public function logout()
    {
        auth()->logout();

        return response()->json([
            'message' => 'Logged out'
        ]);
    }
}
