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

        // Get user conversations
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

        // Validate request
        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        // Prevent conversation with self
        if ($request->user_id == $user->id) {
            return response()->json([
                'message' => 'You cannot chat with yourself'
            ], 400);
        }

        // Check if conversation already exists
        $conversation = Conversation::where(function ($query) use ($user, $request) {

            $query->where('user_one', $user->id)
                  ->where('user_two', $request->user_id);

        })->orWhere(function ($query) use ($user, $request) {

            $query->where('user_one', $request->user_id)
                  ->where('user_two', $user->id);

        })->first();

        // Create new conversation if not exists
        if (!$conversation) {

            $conversation = Conversation::create([
                'user_one' => $user->id,
                'user_two' => $request->user_id,
            ]);
        }

        return response()->json($conversation);
    }
}