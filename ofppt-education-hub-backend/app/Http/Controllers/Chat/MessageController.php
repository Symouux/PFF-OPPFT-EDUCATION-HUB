<?php

namespace App\Http\Controllers\Chat;

use App\Models\Message;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Conversation;

class MessageController extends Controller
{
    // Get messages of conversation
    public function index($conversationId)
    {
        $user = auth('api')->user();

        $conversation = Conversation::where('id', $conversationId)
            ->where(function ($query) use ($user) {
                $query->where('user_one', $user->id)
                    ->orWhere('user_two', $user->id);
            })
            ->first();

        if (!$conversation) {
            return response()->json([
                'message' => 'Conversation not found'
            ], 404);
        }

        $messages = Message::with('sender.profil')
            ->where('conversation_id', $conversation->id)
            ->latest()
            ->get();

        return response()->json($messages);
    }

    // Send new message
    public function store(Request $request)
    {
        $user = auth('api')->user();

        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'message' => 'required|string'
        ]);

        $conversation = Conversation::where('id', $request->conversation_id)
            ->where(function ($query) use ($user) {
                $query->where('user_one', $user->id)
                    ->orWhere('user_two', $user->id);
            })
            ->first();

        if (!$conversation) {
            return response()->json([
                'message' => 'Conversation not found'
            ], 404);
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'message' => $request->message,
            'is_read' => false
        ]);

        return response()->json([
            'message' => 'Message sent successfully',
            'data' => $message
        ], 201);
    }

    // Mark messages as read
    public function markAsRead($conversationId)
    {
        $user = auth('api')->user();

        $conversation = Conversation::where('id', $conversationId)
            ->where(function ($query) use ($user) {
                $query->where('user_one', $user->id)
                    ->orWhere('user_two', $user->id);
            })
            ->first();

        if (!$conversation) {
            return response()->json([
                'message' => 'Conversation not found'
            ], 404);
        }

        Message::where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true
            ]);

        return response()->json([
            'message' => 'Messages marked as read'
        ]);
    }
    // Get unread messages count
    public function unreadCount()
    {
        $user = auth('api')->user();

        $count = Message::where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->whereHas('conversation', function ($query) use ($user) {
                $query->where('user_one', $user->id)
                    ->orWhere('user_two', $user->id);
            })
            ->count();

        return response()->json([
            'unread_count' => $count
        ]);
    }
}
