<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $req)
    {
        $email        = $req->email;
        $mot_de_passe = $req->mot_de_passe;
        $role         = $req->role ?? 'etudiant';

        // 1/ Email Check
        $exists = Utilisateur::where('email', $email)->first();
        if ($exists) {
            return response()->json([
                'message' => 'Email Deja Existe !'
            ], 409); // ✅ 409 Conflict au lieu de 401
        }

        // 2/ Role Check
        if (!in_array($role, ['etudiant', 'mentor', 'admin'])) {
            return response()->json([
                'message' => 'Rôle invalide'
            ], 400);
        }

        // 3/ Password Hash
        $mot_de_passe_hash = Hash::make($mot_de_passe);

        // 4/ Create User
        $user = Utilisateur::create([
            'email'            => $email,
            'mot_de_passe'     => $mot_de_passe_hash,
            'role'             => $role,
            'date_inscription' => now()
        ]);

        // 5/ Upload Picture
        $photoPath = null;
        if ($req->hasFile('photo')) {
            $photoPath = $req->file('photo')->store('profiles', 'public');
        }

        // 6/ Create Profile
        $user->profil()->create([
            'nom_complet'   => $req->nom_complet ?? '',
            'bio'           => $req->bio ?? '',
            'photo'         => $photoPath,
            'lien_linkedin' => $req->lien_linkedin ?? '',
            'lien_github'   => $req->lien_github ?? '',
            'score_mensuel' => 0
        ]);

        // ✅ Générer le token après inscription
        $token = auth()->login($user);

        return response()->json([
            'token' => $token,        // ✅ AJOUTÉ
            'user'  => [
                'id'    => $user->id,
                'email' => $user->email,
                'role'  => $user->role,
            ]
        ], 201);
    }

    public function login(Request $req)
    {
        $email    = $req->email;
        $password = $req->mot_de_passe;

        // 1/ Find User
        $user = Utilisateur::where('email', $email)->first();
        if (!$user) {
            return response()->json([
                'message' => 'Email introuvable !'
            ], 401); // ✅ 401 au lieu de 404
        }

        // 2/ Compare Password
        if (!Hash::check($password, $user->mot_de_passe)) {
            return response()->json([
                'message' => 'Mot de passe incorrect !'
            ], 401);
        }

        // 3/ Generate JWT
        $token = auth()->login($user);

        if (!$token) {
            return response()->json([
                'message' => 'Erreur génération token JWT'
            ], 500);
        }

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'    => $user->id,
                'email' => $user->email,
                'role'  => $user->role,  // ✅ rôle obligatoire
            ]
        ], 200);
    }

    // ✅ MÉTHODE AJOUTÉE — manquait complètement
    public function me()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'message' => 'Non authentifié'
            ], 401);
        }

        return response()->json([
            'id'    => $user->id,
            'email' => $user->email,
            'role'  => $user->role,
        ], 200);
    }

    public function logout()
    {
        auth()->logout();

        return response()->json([
            'message' => 'Déconnecté avec succès'
        ], 200);
    }
}
