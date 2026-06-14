<?php

namespace App\Http\Controllers\Chat;

use App\Models\Conversation;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ConversationController extends Controller
{
    // Get all user conversations
    public function index()
    {
        $user = auth('api')->user();

        $conversations = Conversation::with([
            'userOne.profil',
            'userTwo.profil'
        ])
        ->where('user_one', $user->id)
        ->orWhere('user_two', $user->id)
        ->latest()
        ->get();

        return response()->json($conversations);
    }

    // Create or open conversation
    public function store(Request $request)
    {
        $user = auth('api')->user();

        $request->validate([
            'user_two' => 'required|exists:users,id'
        ]);

        if ($request->user_two == $user->id) {
            return response()->json([
                'message' => 'You cannot chat with yourself'
            ], 400);
        }

        $userOne = min($user->id, $request->user_two);
        $userTwo = max($user->id, $request->user_two);

        $conversation = Conversation::where('user_one', $userOne)
            ->where('user_two', $userTwo)
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'user_one' => $userOne,
                'user_two' => $userTwo,
            ]);
        }

        $conversation->load(['userOne.profil', 'userTwo.profil']);

        return response()->json($conversation);
    }
}
