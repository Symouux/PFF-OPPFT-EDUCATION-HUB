<?php

namespace App\Http\Controllers\Mentor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MentorProfileController extends Controller
{
    public function show()
    {
        // 1. نجيبو الـ User اللي داير Login حالياً
        $user = auth('api')->user();

        // 2. نجيبو الـ Profile ديالو من جدول profils
        $profile = DB::table('profils')->where('user_id', $user->id)->first();

        if (!$profile) {
            return response()->json(['message' => 'Profil non trouvé'], 404);
        }

        // 3. نحسبو عدد المشاريع المقبولة (Encadrés)
        $activeProjectsCount = DB::table('project_mentor_requests')
            ->where('mentor_id', $user->id)
            ->where('status', 'accepted')
            ->count();

        // 4. نحسبو عدد الـ Reviews اللي دار هاد المينتور
        $totalReviewsCount = DB::table('mentor_reviews')
            ->where('mentor_id', $user->id)
            ->count();

        // 5. نجيبو الـ Reviews مع العناوين ديال المشاريع ديالهم
        $reviews = DB::table('mentor_reviews')
            ->join('projects', 'mentor_reviews.project_id', '=', 'projects.id')
            ->where('mentor_reviews.mentor_id', $user->id)
            ->select('mentor_reviews.*', 'projects.titre as project_title')
            ->get();

        // 6. نرجعو الداتا كاملة مجموعة فـ Response JSON واحدة نـقية
        return response()->json([
            'nom_complet'   => $profile->nom_complet,
            'bio'           => $profile->bio,
            'photo'         => $profile->photo,
            'lien_linkedin' => $profile->lien_linkedin,
            'lien_github'   => $profile->lien_github,
            'stats'         => [
                'active_projects_count' => $activeProjectsCount,
                'total_reviews_count'  => $totalReviewsCount,
            ],
            'reviews'       => $reviews
        ], 200);
    }
}