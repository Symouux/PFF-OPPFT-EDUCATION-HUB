<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $req)
    {
        $email = $req->email;
        $password = $req->password;
        $role = 'etudiant';

        // 1/ Email Check, ElAnani Comment
        $exists = User::where('email', $email)->first();

        if ($exists) {
            return response()->json([
                'message' => 'Email Deja Existe !'
            ], 401);
        }

        // 2/ Password Hash, ElAnani Comment
        $password_hash = Hash::make($password);

        // 3/ Create User, ElAnani Comment
        $user = User::create([
            'email' => $email,
            'password' => $password_hash,
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
        $password = $req->password;

        // 1/ Find User, ElAnani Comment
        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found !'
            ], 404);
        }

        // 2/ Compare Password, ElAnani Comment
        if (!Hash::check($password, $user->password)) {
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

    public function me()
    {
        try{
            // - Store User Info in A Variable, Elanani Comment
            $user = auth()->user();

            return response()->json([
                // - All User Info, Elanani Comment
                'user' => $user,

                // - Just User Name and His Role, Elanani Comment
                'profil' => $user->profil
            ]);
        }catch(\Exception $err) {
            return response()->json([
                'error' => $err->getMessage()
            ], 500);
        }
    }
}
