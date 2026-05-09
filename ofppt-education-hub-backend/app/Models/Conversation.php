<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = ['user_one', 'user_two'];

    // The first person in the chat
    public function userOne() {
        return $this->belongsTo(User::class, 'user_one');
    }

    // The second person in the chat
    public function userTwo() {
        return $this->belongsTo(User::class, 'user_two');
    }

    // All messages in this chat
    public function messages() {
        return $this->hasMany(Message::class);
    }
}
