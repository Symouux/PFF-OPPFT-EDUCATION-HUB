<?php

namespace App\Http\Controllers\Chat;

use App\Models\Message;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class MessageController extends Controller
{
    // Get messages of conversation
    public function index($conversationId)
    {
        $user = auth('api')->user();

        // Get conversation messages
        $messages = Message::with('sender.profil')
            ->where('conversation_id', $conversationId)
            ->latest()
            ->get();

        return response()->json($messages);
    }

    // Send new message
    public function store(Request $request)
    {
        $user = auth('api')->user();

        // Validate request
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'message' => 'required|string'
        ]);

        // Create message
        $message = Message::create([
            'conversation_id' => $request->conversation_id,
            'sender_id' => $user->id,
            'message' => $request->message,
            'is_read' => false
        ]);

        return response()->json([
            'message' => 'Message sent successfully',
            'data' => $message
        ]);
    }

    // Mark messages as read
    public function markAsRead($conversationId)
    {
        $user = auth('api')->user();

        // Mark unread messages as read
        Message::where('conversation_id', $conversationId)
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

        // Count unread messages
        $count = Message::where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'unread_count' => $count
        ]);
    }
}