<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

/*
 * Private user channel — each user subscribes to receive personal notifications.
 */
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

/*
 * Private conversation channel — only the two participants may subscribe.
 */
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);
    if (!$conversation) return false;

    return in_array((int) $user->id, [
        (int) $conversation->participant_one_id,
        (int) $conversation->participant_two_id,
    ]);
});