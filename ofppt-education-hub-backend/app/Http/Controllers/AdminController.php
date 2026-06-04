<?php

// Khaoula ET-Taheri

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Project;
use App\Models\Vote;
use App\Models\Resource;
use Illuminate\Http\Request;
use App\Imports\UsersImport;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**********gestion des users********/

    // 1) recuperer tout les users
    public function getAllUsers()
    {
        $users = User::with('profil')->orderBy('date_inscription', 'desc')->paginate(10);

        return response()->json([
            'message' => 'Liste des utilisateurs récupérée avec succès',
            'data'    => $users
        ], 200);
    }

    // 2) blocker ou deblocker user
    public function blockUser($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur introuvable'
            ], 404);
        }

        $user->is_blocked = !$user->is_blocked;
        $user->save();

        $statut = $user->is_blocked ? 'bloqué' : 'débloqué';

        return response()->json([
            'message' => "Utilisateur {$statut} avec succès",
            'data'    => $user
        ], 200);
    }

    // 3) supprimer un user definitivement
    public function deleteUser($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur introuvable'
            ], 404);
        }

        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès'
        ], 200);
    }
    // 4) importer des utilisateurs depuis un fichier Excel/CSV
    public function importUsers(Request $request)
    {
        // Valider le fichier — obligatoire, max 2MB, xlsx ou csv
        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv|max:2048'
        ]);

        $import = new UsersImport();

        Excel::import($import, $request->file('file'));

        return response()->json([
            'message' => 'Import terminé',
            'data'    => [
                'importes' => $import->importes,
                'ignores'  => $import->ignores,
                'erreurs'  => $import->erreurs,
            ]
        ], 200);
    }
    // 5) telecharger un fichier Excel exemple pour l'import
    public function downloadImportTemplate()
    {
        // Données exemple — meme roles que le modele User
        $headers = ['nom_complet', 'email', 'password', 'role', 'is_blocked'];
        $exemples = [
            ['Etudiant Test1', 'etudiant1@ofppt.ma', 'password123', 'etudiant', 0],
            ['Mentor Test1', 'mentor1@ofppt.ma',   'password123', 'mentor',   0],
            ['Admin Test1', 'admin1@ofppt.ma',    'password123', 'admin',    0],
            ['Bloque Test1', 'bloque1@ofppt.ma',   'password123', 'etudiant', 1],
        ];

        // Creer le fichier Excel en memoire et le retourner directement
        return Excel::download(new class($headers, $exemples) implements
            \Maatwebsite\Excel\Concerns\FromArray,
            \Maatwebsite\Excel\Concerns\WithHeadings,
            \Maatwebsite\Excel\Concerns\WithStyles
        {
            public function __construct(
                private array $headers,
                private array $rows
            ) {}

            public function array(): array
            {
                return $this->rows;
            }

            public function headings(): array
            {
                return $this->headers;
            }

            // Mettre les en-tetes en gras — lisibilite
            public function styles(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet)
            {
                return [
                    1 => ['font' => ['bold' => true]]
                ];
            }
        }, 'exemple_import_users.xlsx');
    }

    /**********gestion des projets ********/

    // 1) retourner toute les projet
    public function getAllProjects()
    {
        // On charge aussi l'étudiant qui a publié chaque projet
        $projects = Project::with('user.profilcd ..')
            ->orderBy('date_publication', 'desc')
            ->get();

        return response()->json([
            'message' => 'Liste des projets récupérée avec succès',
            'data'    => $projects
        ], 200);
    }
    // 2) archiver un projet anciens
    public function archiveProject($id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'message' => 'Projet introuvable'
            ], 404);
        }

        // On met juste le statut à "archivé", le projet reste en base
        $project->status = 'archived';
        $project->save();

        return response()->json([
            'message' => 'Projet archivé avec succès',
            'data'    => $project
        ], 200);
    }
    // 3) supprimer un projet
    public function deleteProject($id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'message' => 'Projet introuvable'
            ], 404);
        }

        $project->delete();

        return response()->json([
            'message' => 'Projet supprimé avec succès'
        ], 200);
    }



    /**********statistique   ********/

    // 1) voir static du vote par projet
    public function getVoteStats()
    {
        // compter le bnr de vote our chaque projet

        $votes = Vote::groupBy('project_id')
            ->select('project_id')
            ->selectRaw('COUNT(*) as total_votes')
            ->get();

        return response()->json([
            'message' => 'Statistiques des votes récupérées',
            'data'    => $votes
        ], 200);
    }

    // 2) renitialiser les vote
    public function resetVotes($id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'message' => 'Projet introuvable'
            ], 404);
        }

        // On supprime tous les votes liés à ce projet
        Vote::where('project_id', $id)->delete();
        $project->update(['nb_votes' => 0]);

        return response()->json([
            'message' => 'Votes réinitialisés avec succès pour ce projet'
        ], 200);
    }

    /**********gestion des ressourceee  ********/

    // 1) voir toute les ressource partager
    public function getAllResources()
    {
        $resources = Resource::with('user')
            ->orderBy('date_ajout', 'desc')
            ->paginate(10);

        return response()->json([
            'message' => 'Liste des ressources récupérée avec succès',
            'data'    => $resources
        ], 200);
    }
    // 2) suprimer une ress
    public function deleteResource($id)
    {
        $resource = Resource::find($id);

        if (!$resource) {
            return response()->json([
                'message' => 'Ressource introuvable'
            ], 404);
        }

        $resource->delete();

        return response()->json([
            'message' => 'Ressource supprimée avec succès'
        ], 200);
    }

    /**********gestion des votes  ********/

    // 1)static du dashbord

    public function getDashboardStats()
    {
        return response()->json([
            'message' => 'Statistiques du dashboard',
            'data'    => [
                // all users
                'total_users'    => User::count(),

                // Juste les étudiants
                'total_students' => User::where('role', 'etudiant')->count(),

                // Juste les mentors
                'total_mentors'  => User::where('role', 'mentor')->count(),

                // Tous les projets publiés
                'total_projects' => Project::count(),

                // Projets encore actifs
                'active_projects' => Project::where('status', 'active')->count(),

                // Projets archivés
                'archived_projects' => Project::where('status', 'archived')->count(),

                // Total des votes sur toute la plateforme
                'total_votes'    => Vote::count(),

                //projet gagante mu moiis
                'projet_gagnant' => Project::with('user.profil')->where('estGagantMois', true)->first(),
            ]
        ], 200);
    }

    public function archivePreviousMonthProjects()
{
    try {
        // 1️⃣ تحديد تواريخ الشهر الفايت (شهر 5)
        $debutMoisDernier = Carbon::now()->subMonth()->startOfMonth();
        $finMoisDernier = Carbon::now()->subMonth()->endOfMonth();

        // 2️⃣ البحث على المشروع البطل لي عنده أعلى سكور ف الشهر الفايت ويكون active
        // 💡 زدنا 'user.profil' باش الـ Frontend يلقى الـ nom_complet نيشان
        $projetGagnant = Project::with('user.profil')
            ->whereBetween('date_publication', [$debutMoisDernier, $finMoisDernier])
            ->where('status', 'active')
            ->orderBy('global_score', 'desc')
            ->first();

        // 3️⃣ إيلا لـقينا مشروع بطل، نرجعوه هو الـ Gagnant
        if ($projetGagnant) {
            $projetGagnant->update([
                'estGagantMois' => true
            ]);
        }

        // 4️⃣ أرشفة جـميع مشاريع الشهر الفايت (ترجيع الـ status لـ archived)
        $nbProjetsArchives = Project::whereBetween('date_publication', [$debutMoisDernier, $finMoisDernier])
            ->where('status', 'active')
            ->update([
                'status' => 'archived'
            ]);

        return response()->json([
            'success' => true,
            'message' => $projetGagnant 
                ? "L'archivage a été effectué. Le projet gagnant est : " . $projetGagnant->titre
                : "L'archivage a été effectué, mais aucun projet n'a été trouvé pour le mois dernier.",
            'data' => [
                'projet_gagnant' => $projetGagnant,
                'projets_archives_count' => $nbProjetsArchives
            ]
        ], 200);

    } catch (\Exception $e) {
        // 👈 إيلا وقع مشكل، هاد السطر غايخليه يبان ليك ف الـ Console أو الـ log د Laravel
        return response()->json([
            'success' => false,
            'message' => "Erreur serveur : " . $e->getMessage()
        ], 500);
    }
}
}


