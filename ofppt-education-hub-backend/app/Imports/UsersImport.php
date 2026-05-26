<?php

// Khaoula ET-TAHERI - Import des utilisateurs

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Throwable;

class UsersImport implements ToModel, WithHeadingRow, SkipsOnError
{
    use SkipsErrors;

    // Compter les résultats
    public int $importes  = 0;
    public int $ignores   = 0;
    public array $erreurs = [];

    // Rôles acceptés
    private array $rolesValides = ['etudiant', 'mentor', 'admin'];

    public function model(array $row)
    {
        // Vérifier que les colonnes obligatoires existent
        if (empty($row['email']) || empty($row['password']) || empty($row['role'])) {
            $this->erreurs[] = [
                'email'  => $row['email'] ?? 'inconnu',
                'raison' => 'Colonnes manquantes (email, password ou role)'
            ];
            $this->ignores++;
            return null;
        }

        // Valider le rôle
        if (!in_array(strtolower($row['role']), $this->rolesValides)) {
            $this->erreurs[] = [
                'email'  => $row['email'],
                'raison' => "Rôle invalide : {$row['role']}"
            ];
            $this->ignores++;
            return null;
        }

        // Vérifier doublon par email — même champ que $fillable
        if (User::where('email', $row['email'])->exists()) {
            $this->erreurs[] = [
                'email'  => $row['email'],
                'raison' => 'Email déjà existant, ignoré'
            ];
            $this->ignores++;
            return null;
        }

        // Tout est bon → créer l'utilisateur
        $this->importes++;

        $user = User::create([
            'email'            => $row['email'],
            'password'         => Hash::make($row['password']),
            'role'             => strtolower($row['role']),
            'date_inscription' => now(),
            // is_blocked : 0 par défaut, ou lire depuis le fichier si présent
            'is_blocked'       => isset($row['is_blocked']) ? (bool)$row['is_blocked'] : false,
        ]);

        $user->profil()->create([
            'nom_complet' => $row['nom_complet'] ?? $row['email'],
            'bio' => null,
            'photo' => null,
            'lien_linkedin' => null,
            'lien_github' => null,
            'score_mensuel' => 0,
        ]);

        return null;
    }
}
