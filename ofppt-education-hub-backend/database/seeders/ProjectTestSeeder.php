<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class ProjectTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1️⃣ نجيبو أول Category كاينا ف الداتابيز لي تكريات ف الـ Seeder لي قبل
        $category = DB::table('categories')->first();
        
        // إيلا مالقاش حتى catégorie، نكريو وحدة يدوياً باش التيست ما يتبلوكاش
        $categoryId = $category ? $category->id : DB::table('categories')->insertGetId([
            'nom' => 'Développement Digital',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);

        // 2️⃣ إنشاء حسابات الطلبة
        $user1Id = DB::table('users')->insertGetId([
            'email' => 'mohamed.dev@ofppt.ma',
            'password' => Hash::make('password123'),
            'role' => 'etudiant',
            'date_inscription' => Carbon::now()
        ]);

        $user2Id = DB::table('users')->insertGetId([
            'email' => 'ayoub.test@ofppt.ma',
            'password' => Hash::make('password123'),
            'role' => 'etudiant',
            'date_inscription' => Carbon::now()
        ]);

        // 3️⃣ إنشاء البروفايلات فـ جدول `profils`
        DB::table('profils')->insert([
            [
                'user_id' => $user1Id,
                'nom_complet' => 'Mohamed Ben Amara',
                'bio' => 'Full-Stack Developer student.',
                'score_mensuel' => 0,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ],
            [
                'user_id' => $user2Id,
                'nom_complet' => 'Ayoub El Alami',
                'bio' => 'UI/UX Designer & Developer.',
                'score_mensuel' => 0,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]
        ]);

        // 4️⃣ إنشاء مشاريع الـ Test بـ الحقول الصحيحة ومربوطة بالـ Category
        DB::table('projects')->insert([
            [
                'utilisateur_id' => $user1Id,
                'category_id' => $categoryId, // 👈 زدنا الـ Category هنا باش يتحل الـ Error
                'titre' => 'E-Commerce Platform NextGen',
                'description' => 'Un projet full-stack avec React et Laravel.',
                'status' => 'active',
                'global_score' => 15,
                'nb_votes' => 10,
                'estGagantMois' => false,
                'date_publication' => Carbon::now()->subMonth()->startOfMonth()->addDays(5),
            ],
            [
                'utilisateur_id' => $user2Id,
                'category_id' => $categoryId, // 👈 هنا كذلك
                'titre' => 'Smart Trading Dashboard',
                'description' => 'Analyse des performances de trading.',
                'status' => 'active',
                'global_score' => 24, // 🏆 هو البطل لي غايربح بالـ global_score
                'nb_votes' => 45,
                'estGagantMois' => false,
                'date_publication' => Carbon::now()->subMonth()->startOfMonth()->addDays(12),
            ],
            [
                'utilisateur_id' => $user1Id,
                'category_id' => $categoryId, // 👈 وهنا
                'titre' => 'Streetwear Brand Management',
                'description' => 'Système de gestion pour la marque L7ATA.',
                'status' => 'active',
                'global_score' => 0,
                'nb_votes' => 0,
                'estGagantMois' => false,
                'date_publication' => Carbon::now()->startOfMonth()->addDays(1),
            ]
        ]);

        $this->command->info('Seeder complet réalisé avec succès ! كلشي واجد للتيست دابا.');
    }
}